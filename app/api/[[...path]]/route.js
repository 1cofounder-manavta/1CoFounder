import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { Resend } from 'resend';
import crypto from 'crypto';

let cachedClient = null;
let cachedDb = null;

const JWT_SECRET = process.env.JWT_SECRET;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'onboarding@resend.dev';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

async function getDb() {
  if (cachedDb) return cachedDb;
  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGO_URL);
    await cachedClient.connect();
  }
  cachedDb = cachedClient.db(process.env.DB_NAME);
  return cachedDb;
}

function verifyAuth(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(authHeader.slice(7), JWT_SECRET);
  } catch {
    return null;
  }
}

async function verifyAdmin(request) {
  const authUser = verifyAuth(request);
  if (!authUser) return null;
  const db = await getDb();
  const user = await db.collection('users').findOne({ id: authUser.id });
  if (!user || !user.is_admin) return null;
  return authUser;
}

async function logAdminAction(db, adminId, action, targetType, targetId, details) {
  await db.collection('activity_logs').insertOne({
    id: uuidv4(),
    admin_id: adminId,
    action,
    target_type: targetType,
    target_id: targetId,
    details: details || '',
    created_at: new Date().toISOString()
  });
}

// ==========================================
// EMAIL HELPER
// ==========================================
async function sendEmail(to, subject, html) {
  if (!resend) { console.log(`[EMAIL SKIP] No Resend key. To: ${to}, Subject: ${subject}`); return; }
  try {
    await resend.emails.send({ from: SENDER_EMAIL, to: [to], subject, html });
  } catch (e) { console.error(`[EMAIL ERROR] ${e.message}`); }
}

function emailTemplate(title, body) {
  return `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#f8fafc;"><div style="background:white;border-radius:16px;padding:32px;border:1px solid #e2e8f0;"><div style="text-align:center;margin-bottom:24px;"><span style="font-size:20px;font-weight:700;color:#0f766e;">1CoFounder</span><p style="color:#94a3b8;font-size:12px;margin:4px 0 0;">A Manavta Foundation Initiative</p></div><h2 style="font-size:18px;color:#1e293b;margin-bottom:12px;">${title}</h2><div style="color:#475569;font-size:14px;line-height:1.7;">${body}</div><hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;"/><p style="color:#94a3b8;font-size:11px;text-align:center;">1CoFounder.com — Find your healthcare co-founder</p></div></div>`;
}

// ==========================================
// NOTIFICATION HELPER
// ==========================================
async function createNotification(db, userId, type, title, message, relatedId) {
  await db.collection('notifications').insertOne({
    id: uuidv4(), user_id: userId, type, title, message,
    related_id: relatedId || null, read: false, created_at: new Date().toISOString()
  });
}

// ==========================================
// PROFILE COMPLETENESS
// ==========================================
function calcProfileCompleteness(user) {
  const fields = ['bio', 'skills', 'interests', 'city', 'country', 'startup_stage', 'looking_for', 'role', 'commitment_level'];
  let filled = 0;
  for (const f of fields) {
    const v = user?.[f];
    if (Array.isArray(v) ? v.length > 0 : !!v) filled++;
  }
  return Math.round((filled / fields.length) * 100);
}

// ==========================================
// RATE LIMITING
// ==========================================
async function checkRateLimit(db, userId, action, limit) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const count = await db.collection('rate_limits').countDocuments({
    user_id: userId, action, created_at: { $gte: today.toISOString() }
  });
  return count < limit;
}

async function recordAction(db, userId, action) {
  await db.collection('rate_limits').insertOne({
    user_id: userId, action, created_at: new Date().toISOString()
  });
}

function json(data, status = 200) {
  return NextResponse.json(data, { status });
}

export async function GET(request, { params }) {
  const path = params.path || [];
  
  try {
    const db = await getDb();

    // GET /api/health
    if (path[0] === 'health') {
      return json({ status: 'ok', timestamp: new Date().toISOString() });
    }

    // GET /api/auth/me
    if (path[0] === 'auth' && path[1] === 'me') {
      const authUser = verifyAuth(request);
      if (!authUser) return json({ error: 'Unauthorized' }, 401);
      const user = await db.collection('users').findOne({ id: authUser.id });
      if (!user) return json({ error: 'User not found' }, 404);
      const { password_hash, _id, verification_token, ...safeUser } = user;
      safeUser.profile_completeness = calcProfileCompleteness(user);
      const unreadCount = await db.collection('notifications').countDocuments({ user_id: authUser.id, read: false });
      safeUser.unread_notifications = unreadCount;
      return json({ user: safeUser });
    }

    // GET /api/auth/verify?token=...
    if (path[0] === 'auth' && path[1] === 'verify') {
      const url = new URL(request.url);
      const token = url.searchParams.get('token');
      if (!token) return json({ error: 'Verification token required' }, 400);

      const user = await db.collection('users').findOne({ verification_token: token });
      if (!user) return json({ error: 'Invalid or expired token' }, 400);
      if (new Date(user.verification_expires) < new Date()) return json({ error: 'Token has expired. Please request a new one.' }, 400);

      await db.collection('users').updateOne({ id: user.id }, { $set: { email_verified: true }, $unset: { verification_token: '', verification_expires: '' } });
      // Redirect to app with success message
      return NextResponse.redirect(`${BASE_URL}?verified=true`);
    }

    // GET /api/notifications
    if (path[0] === 'notifications') {
      const authUser = verifyAuth(request);
      if (!authUser) return json({ error: 'Unauthorized' }, 401);

      const url = new URL(request.url);
      const limit = parseInt(url.searchParams.get('limit') || '30');
      const notifications = await db.collection('notifications')
        .find({ user_id: authUser.id })
        .project({ _id: 0 })
        .sort({ created_at: -1 })
        .limit(limit)
        .toArray();
      const unread = await db.collection('notifications').countDocuments({ user_id: authUser.id, read: false });
      return json({ notifications, unread });
    }

    // GET /api/users/blocked
    if (path[0] === 'users' && path[1] === 'blocked') {
      const authUser = verifyAuth(request);
      if (!authUser) return json({ error: 'Unauthorized' }, 401);
      const blocks = await db.collection('blocks').find({ blocker_id: authUser.id }).project({ _id: 0 }).toArray();
      const blockedIds = blocks.map(b => b.blocked_id);
      const users = blockedIds.length > 0
        ? await db.collection('users').find({ id: { $in: blockedIds } }).project({ _id: 0, password_hash: 0 }).toArray()
        : [];
      return json({ blocked_users: users.map(u => ({ id: u.id, name: u.name, role: u.role })) });
    }

    // GET /api/users/discover
    if (path[0] === 'users' && path[1] === 'discover') {
      const authUser = verifyAuth(request);
      if (!authUser) return json({ error: 'Unauthorized' }, 401);

      // Get current user's full profile for scoring
      const currentUser = await db.collection('users').findOne({ id: authUser.id });
      if (!currentUser) return json({ error: 'User not found' }, 404);

      const swipes = await db.collection('swipes').find({ swiper_id: authUser.id }).toArray();
      const blocks = await db.collection('blocks').find({
        $or: [{ blocker_id: authUser.id }, { blocked_id: authUser.id }]
      }).toArray();
      const blockedIds = blocks.map(b => b.blocker_id === authUser.id ? b.blocked_id : b.blocker_id);
      const excludeIds = [...swipes.map(s => s.target_id), ...blockedIds, authUser.id];

      // Fetch all eligible users (not suspended, not blocked)
      const candidates = await db.collection('users')
        .find({ id: { $nin: excludeIds }, profile_complete: true, is_suspended: { $ne: true } })
        .project({ password_hash: 0, _id: 0 })
        .limit(100)
        .toArray();

      // Complementary role mapping (roles that work well together)
      const complementaryRoles = {
        'Doctor': ['Engineer', 'Researcher', 'Business Operator', 'Investor'],
        'Engineer': ['Doctor', 'Researcher', 'Business Operator', 'Investor'],
        'Researcher': ['Doctor', 'Engineer', 'Business Operator', 'Investor'],
        'Business Operator': ['Doctor', 'Engineer', 'Researcher', 'Investor'],
        'Investor': ['Doctor', 'Engineer', 'Researcher', 'Business Operator', 'Student'],
        'Student': ['Doctor', 'Engineer', 'Researcher', 'Business Operator', 'Investor'],
      };

      // Startup stage adjacency (stages that are close together)
      const stageOrder = ['Idea', 'Problem Validation', 'MVP', 'Startup'];

      // Score each candidate
      const scored = candidates.map(candidate => {
        let score = 0;

        // 1. Complementary role match (0-3 points)
        const myComplementary = complementaryRoles[currentUser.role] || [];
        if (myComplementary.includes(candidate.role)) {
          score += 3;
        }

        // 2. Overlapping healthcare interests (0-2 per overlap, max ~6)
        const myInterests = currentUser.interests || [];
        const theirInterests = candidate.interests || [];
        const interestOverlap = myInterests.filter(i => theirInterests.includes(i)).length;
        score += interestOverlap * 2;

        // 3. Same or adjacent startup stage (0-2 points)
        const myStageIdx = stageOrder.indexOf(currentUser.startup_stage);
        const theirStageIdx = stageOrder.indexOf(candidate.startup_stage);
        if (myStageIdx >= 0 && theirStageIdx >= 0) {
          const stageDiff = Math.abs(myStageIdx - theirStageIdx);
          if (stageDiff === 0) score += 2;       // same stage
          else if (stageDiff === 1) score += 1;   // adjacent stage
        }

        // 4. Looking-for match bonus (does the other user's role match what I'm looking for?)
        const myLookingFor = currentUser.looking_for || [];
        const roleToLookingFor = {
          'Doctor': 'Clinician',
          'Engineer': 'Software Engineer',
          'Researcher': 'AI Engineer',
          'Business Operator': 'Business Operator',
          'Investor': 'Business Operator',
          'Student': 'Software Engineer',
        };
        const candidateAsLookingFor = roleToLookingFor[candidate.role];
        if (candidateAsLookingFor && myLookingFor.includes(candidateAsLookingFor)) {
          score += 2;
        }

        return { ...candidate, _matchScore: score + (calcProfileCompleteness(candidate) / 50) };
      });

      // Sort by score descending, then by created_at for tie-breaking
      scored.sort((a, b) => {
        if (b._matchScore !== a._matchScore) return b._matchScore - a._matchScore;
        return new Date(b.created_at) - new Date(a.created_at);
      });

      // Return top 30, remove internal score field
      const results = scored.slice(0, 30).map(({ _matchScore, ...user }) => user);

      return json({ users: results });
    }

    // GET /api/users/:id
    if (path[0] === 'users' && path[1]) {
      const db2 = await getDb();
      const user = await db2.collection('users').findOne({ id: path[1] });
      if (!user) return json({ error: 'User not found' }, 404);
      const { password_hash, _id, ...safeUser } = user;
      return json({ user: safeUser });
    }

    // GET /api/conversations (messaging hub - list all conversations with last message & unread)
    if (path[0] === 'conversations') {
      const authUser = verifyAuth(request);
      if (!authUser) return json({ error: 'Unauthorized' }, 401);

      const matches = await db.collection('matches')
        .find({ $or: [{ user1_id: authUser.id }, { user2_id: authUser.id }] })
        .toArray();

      const conversations = [];

      for (const match of matches) {
        const otherId = match.user1_id === authUser.id ? match.user2_id : match.user1_id;
        const otherUser = await db.collection('users').findOne({ id: otherId });

        // Get last message
        const lastMessages = await db.collection('messages')
          .find({ conversation_id: match.id })
          .sort({ created_at: -1 })
          .limit(1)
          .toArray();

        // Count unread messages (sent by other user, not yet read by me)
        const unreadCount = await db.collection('messages').countDocuments({
          conversation_id: match.id,
          sender_id: { $ne: authUser.id },
          read_by: { $nin: [authUser.id] }
        });

        const { password_hash, _id: uId, ...safeUser } = otherUser || {};
        const { _id: mId, ...matchClean } = match;

        conversations.push({
          match_id: match.id,
          matched_user: safeUser,
          last_message: lastMessages[0] ? { message: lastMessages[0].message, sender_id: lastMessages[0].sender_id, created_at: lastMessages[0].created_at } : null,
          unread_count: unreadCount,
          matched_at: match.created_at,
        });
      }

      // Sort: conversations with unread first, then by most recent activity
      conversations.sort((a, b) => {
        if (a.unread_count > 0 && b.unread_count === 0) return -1;
        if (a.unread_count === 0 && b.unread_count > 0) return 1;
        const timeA = a.last_message?.created_at || a.matched_at;
        const timeB = b.last_message?.created_at || b.matched_at;
        return new Date(timeB) - new Date(timeA);
      });

      return json({ conversations });
    }

    // GET /api/matches
    if (path[0] === 'matches') {
      const authUser = verifyAuth(request);
      if (!authUser) return json({ error: 'Unauthorized' }, 401);

      const matches = await db.collection('matches')
        .find({ $or: [{ user1_id: authUser.id }, { user2_id: authUser.id }] })
        .sort({ created_at: -1 })
        .toArray();

      const otherIds = matches.map(m =>
        m.user1_id === authUser.id ? m.user2_id : m.user1_id
      );

      const users = await db.collection('users')
        .find({ id: { $in: otherIds } })
        .project({ password_hash: 0, _id: 0 })
        .toArray();

      const enriched = matches.map(m => {
        const otherId = m.user1_id === authUser.id ? m.user2_id : m.user1_id;
        const { _id, ...matchData } = m;
        return { ...matchData, matched_user: users.find(u => u.id === otherId) };
      });

      return json({ matches: enriched });
    }

    // GET /api/messages/:conversationId/read - mark messages as read (using GET for simplicity)
    if (path[0] === 'messages' && path[1] && path[2] === 'read') {
      const authUser = verifyAuth(request);
      if (!authUser) return json({ error: 'Unauthorized' }, 401);

      await db.collection('messages').updateMany(
        { conversation_id: path[1], sender_id: { $ne: authUser.id } },
        { $addToSet: { read_by: authUser.id } }
      );

      return json({ success: true });
    }

    // GET /api/messages/:conversationId
    if (path[0] === 'messages' && path[1]) {
      const authUser = verifyAuth(request);
      if (!authUser) return json({ error: 'Unauthorized' }, 401);

      const messages = await db.collection('messages')
        .find({ conversation_id: path[1] })
        .sort({ created_at: 1 })
        .toArray();

      const cleaned = messages.map(({ _id, ...rest }) => rest);
      return json({ messages: cleaned });
    }

    // GET /api/problems
    if (path[0] === 'problems') {
      const authUser = verifyAuth(request);
      const problems = await db.collection('problems').find({}).sort({ created_at: -1 }).limit(100).toArray();
      const creatorIds = [...new Set(problems.map(p => p.creator_id))];
      const creators = await db.collection('users')
        .find({ id: { $in: creatorIds } })
        .project({ password_hash: 0, _id: 0 })
        .toArray();

      // Get all problem interests
      const problemIds = problems.map(p => p.id);
      const interests = await db.collection('problem_interests')
        .find({ problem_id: { $in: problemIds } })
        .toArray();

      // Get interest user details
      const interestedUserIds = [...new Set(interests.map(i => i.user_id))];
      const interestedUsers = interestedUserIds.length > 0 
        ? await db.collection('users').find({ id: { $in: interestedUserIds } }).project({ name: 1, id: 1, role: 1 }).toArray()
        : [];

      const enriched = problems.map(({ _id, ...p }) => {
        const problemInterests = interests.filter(i => i.problem_id === p.id);
        return {
          ...p,
          creator: creators.find(c => c.id === p.creator_id),
          interested_users: problemInterests.map(i => ({
            ...i,
            user: interestedUsers.find(u => u.id === i.user_id)
          })),
          interest_count: problemInterests.length,
          user_interested: authUser ? problemInterests.some(i => i.user_id === authUser.id) : false,
        };
      });

      return json({ problems: enriched });
    }

    // GET /api/projects
    if (path[0] === 'projects') {
      const projects = await db.collection('projects').find({}).sort({ created_at: -1 }).limit(100).toArray();
      const projectIds = projects.map(p => p.id);
      const members = await db.collection('project_members').find({ project_id: { $in: projectIds } }).toArray();
      const memberUserIds = [...new Set(members.map(m => m.user_id))];
      const memberUsers = await db.collection('users')
        .find({ id: { $in: memberUserIds } })
        .project({ name: 1, id: 1, role: 1 })
        .toArray();

      const enriched = projects.map(({ _id, ...p }) => ({
        ...p,
        members: members
          .filter(m => m.project_id === p.id)
          .map(({ _id: mId, ...m }) => ({ ...m, user: memberUsers.find(u => u.id === m.user_id) }))
      }));

      return json({ projects: enriched });
    }

    // ==========================================
    // ADMIN GET ROUTES
    // ==========================================

    // GET /api/admin/dashboard
    if (path[0] === 'admin' && path[1] === 'dashboard') {
      const admin = await verifyAdmin(request);
      if (!admin) return json({ error: 'Unauthorized' }, 401);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString();

      const [totalUsers, totalProblems, totalProjects, totalReports] = await Promise.all([
        db.collection('users').countDocuments(),
        db.collection('problems').countDocuments(),
        db.collection('projects').countDocuments(),
        db.collection('reports').countDocuments(),
      ]);

      const newUsersToday = await db.collection('users').countDocuments({ created_at: { $gte: todayStr } });
      const pendingVerifications = await db.collection('users').countDocuments({ verification_requested: true, verified_status: false });
      const flaggedUsers = await db.collection('users').countDocuments({ report_count: { $gte: 3 } });
      const flaggedProblems = await db.collection('problems').countDocuments({ report_count: { $gte: 3 } });
      const flaggedContent = flaggedUsers + flaggedProblems;

      const [totalMatches, totalMessages, activeProjects] = await Promise.all([
        db.collection('matches').countDocuments(),
        db.collection('messages').countDocuments(),
        db.collection('projects').countDocuments({ stage: { $in: ['Active', 'In Progress', 'MVP'] } }),
      ]);

      return json({
        stats: { totalUsers, newUsersToday, totalProblems, totalProjects, pendingVerifications, flaggedContent, totalReports, totalMatches, totalMessages, activeProjects },
      });
    }

    // GET /api/admin/moderation-queue
    if (path[0] === 'admin' && path[1] === 'moderation-queue') {
      const admin = await verifyAdmin(request);
      if (!admin) return json({ error: 'Unauthorized' }, 401);

      const flaggedUsers = await db.collection('users').find({ report_count: { $gte: 3 } }).project({ password_hash: 0, _id: 0 }).limit(50).toArray();
      const flaggedProblems = await db.collection('problems').find({ report_count: { $gte: 3 } }).project({ _id: 0 }).limit(50).toArray();
      const pendingVerifications = await db.collection('users').find({ verification_requested: true, verified_status: false }).project({ password_hash: 0, _id: 0 }).limit(50).toArray();

      return json({ flaggedUsers, flaggedProblems, pendingVerifications });
    }

    // GET /api/admin/users
    if (path[0] === 'admin' && path[1] === 'users') {
      const admin = await verifyAdmin(request);
      if (!admin) return json({ error: 'Unauthorized' }, 401);

      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const search = url.searchParams.get('search') || '';
      const role = url.searchParams.get('role') || '';
      const verified = url.searchParams.get('verified') || '';
      const status = url.searchParams.get('status') || '';

      const filter = {};
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { city: { $regex: search, $options: 'i' } },
          { country: { $regex: search, $options: 'i' } },
        ];
      }
      if (role) filter.role = role;
      if (verified === 'true') filter.verified_status = true;
      if (verified === 'false') filter.verified_status = false;
      if (status === 'suspended') filter.is_suspended = true;
      if (status === 'active') filter.is_suspended = { $ne: true };

      const total = await db.collection('users').countDocuments(filter);
      const users = await db.collection('users')
        .find(filter)
        .project({ password_hash: 0, _id: 0 })
        .sort({ created_at: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray();

      return json({ users, total, page, totalPages: Math.ceil(total / limit) });
    }

    // GET /api/admin/problems
    if (path[0] === 'admin' && path[1] === 'problems') {
      const admin = await verifyAdmin(request);
      if (!admin) return json({ error: 'Unauthorized' }, 401);

      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const search = url.searchParams.get('search') || '';

      const filter = {};
      if (search) filter.title = { $regex: search, $options: 'i' };

      const total = await db.collection('problems').countDocuments(filter);
      const problems = await db.collection('problems')
        .find(filter)
        .project({ _id: 0 })
        .sort({ created_at: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray();

      const creatorIds = [...new Set(problems.map(p => p.creator_id))];
      const creators = await db.collection('users').find({ id: { $in: creatorIds } }).project({ id: 1, name: 1, role: 1, _id: 0 }).toArray();
      const enriched = problems.map(p => ({ ...p, creator: creators.find(c => c.id === p.creator_id) }));

      return json({ problems: enriched, total, page, totalPages: Math.ceil(total / limit) });
    }

    // GET /api/admin/projects
    if (path[0] === 'admin' && path[1] === 'projects') {
      const admin = await verifyAdmin(request);
      if (!admin) return json({ error: 'Unauthorized' }, 401);

      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const search = url.searchParams.get('search') || '';

      const filter = {};
      if (search) filter.name = { $regex: search, $options: 'i' };

      const total = await db.collection('projects').countDocuments(filter);
      const projects = await db.collection('projects')
        .find(filter)
        .project({ _id: 0 })
        .sort({ created_at: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray();

      const projectIds = projects.map(p => p.id);
      const members = await db.collection('project_members').find({ project_id: { $in: projectIds } }).toArray();
      const creatorIds = [...new Set(projects.map(p => p.creator_id))];
      const creators = await db.collection('users').find({ id: { $in: creatorIds } }).project({ id: 1, name: 1, _id: 0 }).toArray();

      const enriched = projects.map(p => ({
        ...p,
        creator: creators.find(c => c.id === p.creator_id),
        team_size: members.filter(m => m.project_id === p.id).length,
      }));

      return json({ projects: enriched, total, page, totalPages: Math.ceil(total / limit) });
    }

    // GET /api/admin/verifications
    if (path[0] === 'admin' && path[1] === 'verifications') {
      const admin = await verifyAdmin(request);
      if (!admin) return json({ error: 'Unauthorized' }, 401);

      const users = await db.collection('users')
        .find({ verification_requested: true, verified_status: false })
        .project({ password_hash: 0, _id: 0 })
        .sort({ verification_requested_at: -1 })
        .toArray();

      return json({ verifications: users });
    }

    // GET /api/admin/reports
    if (path[0] === 'admin' && path[1] === 'reports') {
      const admin = await verifyAdmin(request);
      if (!admin) return json({ error: 'Unauthorized' }, 401);

      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '50');

      const total = await db.collection('reports').countDocuments();
      const reports = await db.collection('reports')
        .find({})
        .project({ _id: 0 })
        .sort({ created_at: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray();

      const reporterIds = [...new Set(reports.map(r => r.reporter_id))];
      const reporters = await db.collection('users').find({ id: { $in: reporterIds } }).project({ id: 1, name: 1, _id: 0 }).toArray();
      const enriched = reports.map(r => ({ ...r, reporter: reporters.find(u => u.id === r.reporter_id) }));

      return json({ reports: enriched, total, page, totalPages: Math.ceil(total / limit) });
    }

    // GET /api/admin/activity-logs
    if (path[0] === 'admin' && path[1] === 'activity-logs') {
      const admin = await verifyAdmin(request);
      if (!admin) return json({ error: 'Unauthorized' }, 401);

      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '50');

      const total = await db.collection('activity_logs').countDocuments();
      const logs = await db.collection('activity_logs')
        .find({})
        .project({ _id: 0 })
        .sort({ created_at: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray();

      const adminIds = [...new Set(logs.map(l => l.admin_id))];
      const admins = await db.collection('users').find({ id: { $in: adminIds } }).project({ id: 1, name: 1, _id: 0 }).toArray();
      const enriched = logs.map(l => ({ ...l, admin: admins.find(a => a.id === l.admin_id) }));

      return json({ logs: enriched, total, page, totalPages: Math.ceil(total / limit) });
    }

    return json({ error: 'Not found' }, 404);
  } catch (error) {
    console.error('GET error:', error);
    return json({ error: 'Internal server error' }, 500);
  }
}

export async function POST(request, { params }) {
  const path = params.path || [];

  try {
    const db = await getDb();

    // POST /api/auth/signup
    if (path[0] === 'auth' && path[1] === 'signup') {
      const { name, email, password } = await request.json();
      if (!name || !email || !password) return json({ error: 'Name, email, and password are required' }, 400);
      if (password.length < 6) return json({ error: 'Password must be at least 6 characters' }, 400);

      const existing = await db.collection('users').findOne({ email: email.toLowerCase() });
      if (existing) return json({ error: 'An account with this email already exists' }, 409);

      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = uuidv4();
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const user = {
        id: userId,
        name,
        email: email.toLowerCase(),
        password_hash: hashedPassword,
        role: '',
        city: '',
        country: '',
        location: '',
        bio: '',
        profile_photo: '',
        skills: [],
        interests: [],
        startup_stage: '',
        commitment_level: '',
        looking_for: [],
        verified_status: false,
        profile_complete: false,
        is_admin: false,
        is_suspended: false,
        report_count: 0,
        email_verified: false,
        verification_token: verificationToken,
        verification_expires: verificationExpires,
        notification_preferences: { matches: true, messages: true, problems: true, projects: true },
        created_at: new Date().toISOString()
      };

      await db.collection('users').insertOne(user);
      const token = jwt.sign({ id: userId, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      const { password_hash, _id, ...safeUser } = user;

      // Send verification email
      const verifyUrl = `${BASE_URL}/api/auth/verify?token=${verificationToken}`;
      sendEmail(user.email, 'Verify your 1CoFounder account', emailTemplate('Welcome to 1CoFounder!', `<p>Hi ${name},</p><p>Thanks for joining 1CoFounder! Please verify your email address to get started.</p><a href="${verifyUrl}" style="display:inline-block;background:#0f766e;color:white;font-weight:600;padding:12px 28px;border-radius:12px;text-decoration:none;margin:16px 0;">Verify Email</a><p style="font-size:12px;color:#94a3b8;">This link expires in 24 hours.</p>`));

      return json({ token, user: safeUser }, 201);
    }

    // POST /api/auth/login
    if (path[0] === 'auth' && path[1] === 'login') {
      const { email, password } = await request.json();
      if (!email || !password) return json({ error: 'Email and password are required' }, 400);

      const user = await db.collection('users').findOne({ email: email.toLowerCase() });
      if (!user) return json({ error: 'Invalid email or password' }, 401);

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) return json({ error: 'Invalid email or password' }, 401);

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      const { password_hash, _id, ...safeUser } = user;
      return json({ token, user: safeUser });
    }

    // POST /api/swipes
    if (path[0] === 'swipes') {
      const authUser = verifyAuth(request);
      if (!authUser) return json({ error: 'Unauthorized' }, 401);

      // Rate limit: 30 swipes per day
      const canSwipe = await checkRateLimit(db, authUser.id, 'swipe', 30);
      if (!canSwipe) return json({ error: 'Daily swipe limit reached (30/day). Try again tomorrow!' }, 429);

      const { target_id, action } = await request.json();
      if (!target_id || !action) return json({ error: 'target_id and action are required' }, 400);

      const existing = await db.collection('swipes').findOne({ swiper_id: authUser.id, target_id });
      if (existing) return json({ error: 'Already swiped' }, 409);

      const swipe = {
        id: uuidv4(),
        swiper_id: authUser.id,
        target_id,
        action,
        created_at: new Date().toISOString()
      };
      await db.collection('swipes').insertOne(swipe);
      await recordAction(db, authUser.id, 'swipe');

      let isMatch = false;
      let matchData = null;

      if (action === 'like') {
        const reciprocal = await db.collection('swipes').findOne({
          swiper_id: target_id,
          target_id: authUser.id,
          action: 'like'
        });

        if (reciprocal) {
          const existingMatch = await db.collection('matches').findOne({
            $or: [
              { user1_id: authUser.id, user2_id: target_id },
              { user1_id: target_id, user2_id: authUser.id }
            ]
          });

          if (!existingMatch) {
            isMatch = true;
            const match = {
              id: uuidv4(),
              user1_id: authUser.id,
              user2_id: target_id,
              created_at: new Date().toISOString()
            };
            await db.collection('matches').insertOne(match);

            const matchedUser = await db.collection('users').findOne({ id: target_id });
            const currentUser = await db.collection('users').findOne({ id: authUser.id });
            const { password_hash, _id, ...safeMatchedUser } = matchedUser;
            matchData = { match: { id: match.id }, matched_user: safeMatchedUser };

            // Notifications for both users
            createNotification(db, authUser.id, 'match', 'New Match!', `You matched with ${matchedUser.name}!`, target_id);
            createNotification(db, target_id, 'match', 'New Match!', `You matched with ${currentUser.name}!`, authUser.id);

            // Email notifications
            if (matchedUser.notification_preferences?.matches !== false) {
              sendEmail(matchedUser.email, 'You have a new match on 1CoFounder!', emailTemplate('New Match!', `<p>Great news! You matched with <strong>${currentUser.name}</strong> (${currentUser.role}).</p><p>Start a conversation and explore how you can collaborate on healthcare innovation.</p><a href="${BASE_URL}" style="display:inline-block;background:#0f766e;color:white;font-weight:600;padding:12px 28px;border-radius:12px;text-decoration:none;margin:16px 0;">Start Chatting</a>`));
            }
            if (currentUser.notification_preferences?.matches !== false) {
              sendEmail(currentUser.email, 'You have a new match on 1CoFounder!', emailTemplate('New Match!', `<p>Great news! You matched with <strong>${matchedUser.name}</strong> (${matchedUser.role}).</p><a href="${BASE_URL}" style="display:inline-block;background:#0f766e;color:white;font-weight:600;padding:12px 28px;border-radius:12px;text-decoration:none;margin:16px 0;">Start Chatting</a>`));
            }
          }
        }
      }

      return json({ swipe: { id: swipe.id }, match: isMatch, match_data: matchData });
    }

    // POST /api/messages
    // POST /api/messages
    if (path[0] === 'messages') {
      const authUser = verifyAuth(request);
      if (!authUser) return json({ error: 'Unauthorized' }, 401);

      const { conversation_id, message } = await request.json();
      if (!conversation_id || !message) return json({ error: 'conversation_id and message are required' }, 400);

      const match = await db.collection('matches').findOne({
        id: conversation_id,
        $or: [{ user1_id: authUser.id }, { user2_id: authUser.id }]
      });
      if (!match) return json({ error: 'You can only message matched users' }, 403);

      const msg = {
        id: uuidv4(),
        conversation_id,
        sender_id: authUser.id,
        message,
        read_by: [authUser.id],
        created_at: new Date().toISOString()
      };
      await db.collection('messages').insertOne(msg);
      const { _id, ...cleanMsg } = msg;

      // Notify the other user
      const recipientId = match.user1_id === authUser.id ? match.user2_id : match.user1_id;
      const sender = await db.collection('users').findOne({ id: authUser.id });
      createNotification(db, recipientId, 'message', 'New Message', `${sender?.name || 'Someone'} sent you a message`, conversation_id);

      // Email notification (throttled — only if last message from sender > 5 min ago)
      const recentMsg = await db.collection('messages').findOne(
        { conversation_id, sender_id: authUser.id, id: { $ne: msg.id } },
        { sort: { created_at: -1 } }
      );
      const shouldEmail = !recentMsg || (new Date() - new Date(recentMsg.created_at)) > 5 * 60 * 1000;
      if (shouldEmail) {
        const recipient = await db.collection('users').findOne({ id: recipientId });
        if (recipient?.notification_preferences?.messages !== false) {
          sendEmail(recipient.email, `New message from ${sender?.name} on 1CoFounder`, emailTemplate('New Message', `<p><strong>${sender?.name}</strong> sent you a message:</p><p style="background:#f1f5f9;padding:12px 16px;border-radius:12px;border-left:3px solid #0f766e;">"${message.slice(0, 200)}${message.length > 200 ? '...' : ''}"</p><a href="${BASE_URL}" style="display:inline-block;background:#0f766e;color:white;font-weight:600;padding:12px 28px;border-radius:12px;text-decoration:none;margin:16px 0;">Reply Now</a>`));
        }
      }

      return json({ message: cleanMsg }, 201);
    }

    // POST /api/problems/:id/join (express interest / join a problem)
    if (path[0] === 'problems' && path[1] && path[2] === 'join') {
      const authUser = verifyAuth(request);
      if (!authUser) return json({ error: 'Unauthorized' }, 401);

      const existing = await db.collection('problem_interests').findOne({
        problem_id: path[1],
        user_id: authUser.id
      });
      if (existing) return json({ error: 'Already joined this problem' }, 409);

      const interest = {
        id: uuidv4(),
        problem_id: path[1],
        user_id: authUser.id,
        created_at: new Date().toISOString()
      };
      await db.collection('problem_interests').insertOne(interest);
      return json({ interest: { id: interest.id } }, 201);
    }

    // POST /api/problems/:id/contact (auto-swipe like on creator to initiate connection)
    if (path[0] === 'problems' && path[1] && path[2] === 'contact') {
      const authUser = verifyAuth(request);
      if (!authUser) return json({ error: 'Unauthorized' }, 401);

      const problem = await db.collection('problems').findOne({ id: path[1] });
      if (!problem) return json({ error: 'Problem not found' }, 404);
      if (problem.creator_id === authUser.id) return json({ error: 'Cannot contact yourself' }, 400);

      // Check if already matched
      const existingMatch = await db.collection('matches').findOne({
        $or: [
          { user1_id: authUser.id, user2_id: problem.creator_id },
          { user1_id: problem.creator_id, user2_id: authUser.id }
        ]
      });

      if (existingMatch) {
        return json({ already_matched: true, match_id: existingMatch.id });
      }

      // Auto-create a like swipe on the creator
      const existingSwipe = await db.collection('swipes').findOne({
        swiper_id: authUser.id,
        target_id: problem.creator_id
      });

      if (!existingSwipe) {
        await db.collection('swipes').insertOne({
          id: uuidv4(),
          swiper_id: authUser.id,
          target_id: problem.creator_id,
          action: 'like',
          created_at: new Date().toISOString()
        });
      }

      // Check for mutual match
      const reciprocal = await db.collection('swipes').findOne({
        swiper_id: problem.creator_id,
        target_id: authUser.id,
        action: 'like'
      });

      if (reciprocal) {
        const match = {
          id: uuidv4(),
          user1_id: authUser.id,
          user2_id: problem.creator_id,
          created_at: new Date().toISOString()
        };
        await db.collection('matches').insertOne(match);
        return json({ matched: true, match_id: match.id });
      }

      return json({ interest_sent: true, message: 'Connection request sent to the creator' });
    }

    // POST /api/problems (create new)
    if (path[0] === 'problems' && !path[1]) {
      const authUser = verifyAuth(request);
      if (!authUser) return json({ error: 'Unauthorized' }, 401);

      // Rate limit: 3 problem posts per day
      const canPost = await checkRateLimit(db, authUser.id, 'problem_post', 3);
      if (!canPost) return json({ error: 'Daily post limit reached (3/day). Try again tomorrow!' }, 429);

      const { title, description, clinical_context, skills_required } = await request.json();
      if (!title || !description) return json({ error: 'Title and description are required' }, 400);

      const problem = {
        id: uuidv4(),
        creator_id: authUser.id,
        title,
        description,
        clinical_context: clinical_context || '',
        skills_required: skills_required || [],
        report_count: 0,
        is_hidden: false,
        created_at: new Date().toISOString()
      };
      await db.collection('problems').insertOne(problem);
      await recordAction(db, authUser.id, 'problem_post');
      const { _id, ...cleanProblem } = problem;
      return json({ problem: cleanProblem }, 201);
    }

    // POST /api/projects/:id/join (must come before generic projects)
    if (path[0] === 'projects' && path[1] && path[2] === 'join') {
      const authUser = verifyAuth(request);
      if (!authUser) return json({ error: 'Unauthorized' }, 401);

      const existing = await db.collection('project_members').findOne({
        project_id: path[1],
        user_id: authUser.id
      });
      if (existing) return json({ error: 'Already a member' }, 409);

      const body = await request.json();
      const member = {
        id: uuidv4(),
        project_id: path[1],
        user_id: authUser.id,
        role: body.role || 'Member',
        joined_at: new Date().toISOString()
      };
      await db.collection('project_members').insertOne(member);
      return json({ member: { id: member.id, role: member.role } }, 201);
    }

    // POST /api/projects
    if (path[0] === 'projects' && !path[1]) {
      const authUser = verifyAuth(request);
      if (!authUser) return json({ error: 'Unauthorized' }, 401);

      const { name, problem_id, description, stage } = await request.json();
      if (!name || !description) return json({ error: 'Name and description are required' }, 400);

      const project = {
        id: uuidv4(),
        name,
        problem_id: problem_id || null,
        creator_id: authUser.id,
        description,
        stage: stage || 'Idea',
        created_at: new Date().toISOString()
      };
      await db.collection('projects').insertOne(project);

      const member = {
        id: uuidv4(),
        project_id: project.id,
        user_id: authUser.id,
        role: 'Creator',
        joined_at: new Date().toISOString()
      };
      await db.collection('project_members').insertOne(member);
      const { _id, ...cleanProject } = project;
      return json({ project: cleanProject }, 201);
    }

    // POST /api/reports (user-facing report endpoint)
    if (path[0] === 'reports') {
      const authUser = verifyAuth(request);
      if (!authUser) return json({ error: 'Unauthorized' }, 401);

      const { target_type, target_id, reason } = await request.json();
      if (!target_type || !target_id || !reason) return json({ error: 'target_type, target_id, and reason are required' }, 400);
      if (!['user', 'problem'].includes(target_type)) return json({ error: 'target_type must be user or problem' }, 400);

      const existing = await db.collection('reports').findOne({ reporter_id: authUser.id, target_type, target_id });
      if (existing) return json({ error: 'You already reported this' }, 409);

      const report = {
        id: uuidv4(),
        reporter_id: authUser.id,
        target_type,
        target_id,
        reason,
        created_at: new Date().toISOString()
      };
      await db.collection('reports').insertOne(report);

      // Increment report_count on the target
      const collection = target_type === 'user' ? 'users' : 'problems';
      await db.collection(collection).updateOne({ id: target_id }, { $inc: { report_count: 1 } });

      const { _id, ...clean } = report;
      return json({ report: clean }, 201);
    }

    // POST /api/users/request-verification
    if (path[0] === 'users' && path[1] === 'request-verification') {
      const authUser = verifyAuth(request);
      if (!authUser) return json({ error: 'Unauthorized' }, 401);

      const { verification_type } = await request.json();
      await db.collection('users').updateOne({ id: authUser.id }, {
        $set: {
          verification_requested: true,
          verification_type: verification_type || 'identity',
          verification_requested_at: new Date().toISOString()
        }
      });
      return json({ success: true });
    }

    // POST /api/notifications/read
    if (path[0] === 'notifications' && path[1] === 'read') {
      const authUser = verifyAuth(request);
      if (!authUser) return json({ error: 'Unauthorized' }, 401);
      const body = await request.json();
      if (body.id) {
        await db.collection('notifications').updateOne({ id: body.id, user_id: authUser.id }, { $set: { read: true } });
      } else {
        await db.collection('notifications').updateMany({ user_id: authUser.id, read: false }, { $set: { read: true } });
      }
      return json({ success: true });
    }

    // POST /api/users/block
    if (path[0] === 'users' && path[1] === 'block') {
      const authUser = verifyAuth(request);
      if (!authUser) return json({ error: 'Unauthorized' }, 401);
      const { blocked_id } = await request.json();
      if (!blocked_id) return json({ error: 'blocked_id required' }, 400);
      const existing = await db.collection('blocks').findOne({ blocker_id: authUser.id, blocked_id });
      if (existing) return json({ error: 'Already blocked' }, 409);
      await db.collection('blocks').insertOne({ id: uuidv4(), blocker_id: authUser.id, blocked_id, created_at: new Date().toISOString() });
      return json({ success: true });
    }

    // POST /api/users/unblock
    if (path[0] === 'users' && path[1] === 'unblock') {
      const authUser = verifyAuth(request);
      if (!authUser) return json({ error: 'Unauthorized' }, 401);
      const { blocked_id } = await request.json();
      await db.collection('blocks').deleteOne({ blocker_id: authUser.id, blocked_id });
      return json({ success: true });
    }

    // POST /api/auth/resend-verification
    if (path[0] === 'auth' && path[1] === 'resend-verification') {
      const authUser = verifyAuth(request);
      if (!authUser) return json({ error: 'Unauthorized' }, 401);
      const user = await db.collection('users').findOne({ id: authUser.id });
      if (user?.email_verified) return json({ error: 'Already verified' }, 400);
      const newToken = crypto.randomBytes(32).toString('hex');
      const newExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await db.collection('users').updateOne({ id: authUser.id }, { $set: { verification_token: newToken, verification_expires: newExpires } });
      const verifyUrl = `${BASE_URL}/api/auth/verify?token=${newToken}`;
      sendEmail(user.email, 'Verify your 1CoFounder account', emailTemplate('Verify Your Email', `<p>Hi ${user.name},</p><p>Click below to verify your email address.</p><a href="${verifyUrl}" style="display:inline-block;background:#0f766e;color:white;font-weight:600;padding:12px 28px;border-radius:12px;text-decoration:none;margin:16px 0;">Verify Email</a><p style="font-size:12px;color:#94a3b8;">This link expires in 24 hours.</p>`));
      return json({ success: true });
    }

    return json({ error: 'Not found' }, 404);
  } catch (error) {
    console.error('POST error:', error);
    return json({ error: 'Internal server error' }, 500);
  }
}

export async function PUT(request, { params }) {
  const path = params.path || [];

  try {
    const db = await getDb();

    // PUT /api/users/profile
    if (path[0] === 'users' && path[1] === 'profile') {
      const authUser = verifyAuth(request);
      if (!authUser) return json({ error: 'Unauthorized' }, 401);

      const body = await request.json();
      const updateFields = {};
      const allowed = ['name', 'role', 'city', 'country', 'location', 'bio', 'profile_photo', 'skills', 'interests', 'startup_stage', 'commitment_level', 'looking_for'];

      for (const field of allowed) {
        if (body[field] !== undefined) updateFields[field] = body[field];
      }
      updateFields.profile_complete = true;

      await db.collection('users').updateOne({ id: authUser.id }, { $set: updateFields });
      const updatedUser = await db.collection('users').findOne({ id: authUser.id });
      const { password_hash, _id, verification_token, ...safeUser } = updatedUser;
      safeUser.profile_completeness = calcProfileCompleteness(updatedUser);
      return json({ user: safeUser });
    }

    // PUT /api/users/password
    if (path[0] === 'users' && path[1] === 'password') {
      const authUser = verifyAuth(request);
      if (!authUser) return json({ error: 'Unauthorized' }, 401);
      const { current_password, new_password } = await request.json();
      if (!current_password || !new_password) return json({ error: 'Both passwords required' }, 400);
      if (new_password.length < 6) return json({ error: 'New password must be at least 6 characters' }, 400);
      const user = await db.collection('users').findOne({ id: authUser.id });
      const valid = await bcrypt.compare(current_password, user.password_hash);
      if (!valid) return json({ error: 'Current password is incorrect' }, 400);
      const hashed = await bcrypt.hash(new_password, 10);
      await db.collection('users').updateOne({ id: authUser.id }, { $set: { password_hash: hashed } });
      return json({ success: true });
    }

    // PUT /api/users/notification-preferences
    if (path[0] === 'users' && path[1] === 'notification-preferences') {
      const authUser = verifyAuth(request);
      if (!authUser) return json({ error: 'Unauthorized' }, 401);
      const prefs = await request.json();
      await db.collection('users').updateOne({ id: authUser.id }, { $set: { notification_preferences: prefs } });
      return json({ success: true });
    }

    // PUT /api/admin/users/:id/verify
    if (path[0] === 'admin' && path[1] === 'users' && path[2] && path[3] === 'verify') {
      const admin = await verifyAdmin(request);
      if (!admin) return json({ error: 'Unauthorized' }, 401);

      await db.collection('users').updateOne({ id: path[2] }, { $set: { verified_status: true, verification_requested: false } });
      await logAdminAction(db, admin.id, 'verified_user', 'user', path[2], `Admin verified user ${path[2]}`);
      return json({ success: true });
    }

    // PUT /api/admin/users/:id/suspend
    if (path[0] === 'admin' && path[1] === 'users' && path[2] && path[3] === 'suspend') {
      const admin = await verifyAdmin(request);
      if (!admin) return json({ error: 'Unauthorized' }, 401);

      const user = await db.collection('users').findOne({ id: path[2] });
      const newStatus = !user?.is_suspended;
      await db.collection('users').updateOne({ id: path[2] }, { $set: { is_suspended: newStatus } });
      await logAdminAction(db, admin.id, newStatus ? 'suspended_user' : 'unsuspended_user', 'user', path[2], `Admin ${newStatus ? 'suspended' : 'unsuspended'} user ${path[2]}`);
      return json({ success: true, is_suspended: newStatus });
    }

    // PUT /api/admin/verifications/:id/approve
    if (path[0] === 'admin' && path[1] === 'verifications' && path[2] && path[3] === 'approve') {
      const admin = await verifyAdmin(request);
      if (!admin) return json({ error: 'Unauthorized' }, 401);

      await db.collection('users').updateOne({ id: path[2] }, { $set: { verified_status: true, verification_requested: false } });
      await logAdminAction(db, admin.id, 'approved_verification', 'user', path[2], `Admin approved verification for user ${path[2]}`);
      return json({ success: true });
    }

    // PUT /api/admin/verifications/:id/reject
    if (path[0] === 'admin' && path[1] === 'verifications' && path[2] && path[3] === 'reject') {
      const admin = await verifyAdmin(request);
      if (!admin) return json({ error: 'Unauthorized' }, 401);

      await db.collection('users').updateOne({ id: path[2] }, { $set: { verification_requested: false } });
      await logAdminAction(db, admin.id, 'rejected_verification', 'user', path[2], `Admin rejected verification for user ${path[2]}`);
      return json({ success: true });
    }

    // PUT /api/admin/problems/:id/hide
    if (path[0] === 'admin' && path[1] === 'problems' && path[2] && path[3] === 'hide') {
      const admin = await verifyAdmin(request);
      if (!admin) return json({ error: 'Unauthorized' }, 401);

      const problem = await db.collection('problems').findOne({ id: path[2] });
      const newStatus = !problem?.is_hidden;
      await db.collection('problems').updateOne({ id: path[2] }, { $set: { is_hidden: newStatus } });
      await logAdminAction(db, admin.id, newStatus ? 'hid_problem' : 'unhid_problem', 'problem', path[2], `Admin ${newStatus ? 'hid' : 'unhid'} problem ${path[2]}`);
      return json({ success: true, is_hidden: newStatus });
    }

    return json({ error: 'Not found' }, 404);
  } catch (error) {
    console.error('PUT error:', error);
    return json({ error: 'Internal server error' }, 500);
  }
}

export async function DELETE(request, { params }) {
  const path = params.path || [];
  try {
    const db = await getDb();

    // DELETE /api/admin/users/:id
    if (path[0] === 'admin' && path[1] === 'users' && path[2]) {
      const admin = await verifyAdmin(request);
      if (!admin) return json({ error: 'Unauthorized' }, 401);

      const user = await db.collection('users').findOne({ id: path[2] });
      if (!user) return json({ error: 'User not found' }, 404);

      await db.collection('users').deleteOne({ id: path[2] });
      await db.collection('swipes').deleteMany({ $or: [{ swiper_id: path[2] }, { target_id: path[2] }] });
      await db.collection('matches').deleteMany({ $or: [{ user1_id: path[2] }, { user2_id: path[2] }] });
      await db.collection('messages').deleteMany({ sender_id: path[2] });
      await logAdminAction(db, admin.id, 'deleted_user', 'user', path[2], `Admin deleted user ${user.name} (${user.email})`);
      return json({ success: true });
    }

    // DELETE /api/admin/problems/:id
    if (path[0] === 'admin' && path[1] === 'problems' && path[2]) {
      const admin = await verifyAdmin(request);
      if (!admin) return json({ error: 'Unauthorized' }, 401);

      const problem = await db.collection('problems').findOne({ id: path[2] });
      if (!problem) return json({ error: 'Problem not found' }, 404);

      await db.collection('problems').deleteOne({ id: path[2] });
      await db.collection('problem_interests').deleteMany({ problem_id: path[2] });
      await db.collection('reports').deleteMany({ target_type: 'problem', target_id: path[2] });
      await logAdminAction(db, admin.id, 'deleted_problem', 'problem', path[2], `Admin deleted problem "${problem.title}"`);
      return json({ success: true });
    }

    // DELETE /api/admin/projects/:id
    if (path[0] === 'admin' && path[1] === 'projects' && path[2]) {
      const admin = await verifyAdmin(request);
      if (!admin) return json({ error: 'Unauthorized' }, 401);

      const project = await db.collection('projects').findOne({ id: path[2] });
      if (!project) return json({ error: 'Project not found' }, 404);

      await db.collection('projects').deleteOne({ id: path[2] });
      await db.collection('project_members').deleteMany({ project_id: path[2] });
      await logAdminAction(db, admin.id, 'deleted_project', 'project', path[2], `Admin deleted project "${project.name}"`);
      return json({ success: true });
    }

    return json({ error: 'Not found' }, 404);
  } catch (error) {
    console.error('DELETE error:', error);
    return json({ error: 'Internal server error' }, 500);
  }
}
