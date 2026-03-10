import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

let cachedClient = null;
let cachedDb = null;

const JWT_SECRET = process.env.JWT_SECRET || '1cofounder-healthcare-secret-2025';

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
      const { password_hash, _id, ...safeUser } = user;
      return json({ user: safeUser });
    }

    // GET /api/users/discover
    if (path[0] === 'users' && path[1] === 'discover') {
      const authUser = verifyAuth(request);
      if (!authUser) return json({ error: 'Unauthorized' }, 401);

      // Get current user's full profile for scoring
      const currentUser = await db.collection('users').findOne({ id: authUser.id });
      if (!currentUser) return json({ error: 'User not found' }, 404);

      const swipes = await db.collection('swipes').find({ swiper_id: authUser.id }).toArray();
      const excludeIds = [...swipes.map(s => s.target_id), authUser.id];

      // Fetch all eligible users (no random sampling - we'll sort by score)
      const candidates = await db.collection('users')
        .find({ id: { $nin: excludeIds }, profile_complete: true })
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

        return { ...candidate, _matchScore: score };
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
      const problems = await db.collection('problems').find({}).sort({ created_at: -1 }).toArray();
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
      const projects = await db.collection('projects').find({}).sort({ created_at: -1 }).toArray();
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

      return json({
        stats: { totalUsers, newUsersToday, totalProblems, totalProjects, pendingVerifications, flaggedContent, totalReports },
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
        created_at: new Date().toISOString()
      };

      await db.collection('users').insertOne(user);
      const token = jwt.sign({ id: userId, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      const { password_hash, _id, ...safeUser } = user;
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
            const { password_hash, _id, ...safeMatchedUser } = matchedUser;
            matchData = { match: { id: match.id }, matched_user: safeMatchedUser };
          }
        }
      }

      return json({ swipe: { id: swipe.id }, match: isMatch, match_data: matchData });
    }

    // POST /api/messages
    if (path[0] === 'messages') {
      const authUser = verifyAuth(request);
      if (!authUser) return json({ error: 'Unauthorized' }, 401);

      const { conversation_id, message } = await request.json();
      if (!conversation_id || !message) return json({ error: 'conversation_id and message are required' }, 400);

      // Verify match exists (only matched users can message)
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

      const { title, description, clinical_context, skills_required } = await request.json();
      if (!title || !description) return json({ error: 'Title and description are required' }, 400);

      const problem = {
        id: uuidv4(),
        creator_id: authUser.id,
        title,
        description,
        clinical_context: clinical_context || '',
        skills_required: skills_required || [],
        created_at: new Date().toISOString()
      };
      await db.collection('problems').insertOne(problem);
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
      const { password_hash, _id, ...safeUser } = updatedUser;
      return json({ user: safeUser });
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
