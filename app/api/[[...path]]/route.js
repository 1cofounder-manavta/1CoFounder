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
      const problems = await db.collection('problems').find({}).sort({ created_at: -1 }).toArray();
      const creatorIds = [...new Set(problems.map(p => p.creator_id))];
      const creators = await db.collection('users')
        .find({ id: { $in: creatorIds } })
        .project({ password_hash: 0, _id: 0 })
        .toArray();

      const enriched = problems.map(({ _id, ...p }) => ({
        ...p,
        creator: creators.find(c => c.id === p.creator_id)
      }));

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

      const msg = {
        id: uuidv4(),
        conversation_id,
        sender_id: authUser.id,
        message,
        created_at: new Date().toISOString()
      };
      await db.collection('messages').insertOne(msg);
      const { _id, ...cleanMsg } = msg;
      return json({ message: cleanMsg }, 201);
    }

    // POST /api/problems
    if (path[0] === 'problems') {
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

    return json({ error: 'Not found' }, 404);
  } catch (error) {
    console.error('PUT error:', error);
    return json({ error: 'Internal server error' }, 500);
  }
}

export async function DELETE(request, { params }) {
  return json({ error: 'Not found' }, 404);
}
