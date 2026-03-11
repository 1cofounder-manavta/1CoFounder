import bcrypt from 'bcryptjs';
import { verifyAuth } from '../lib/auth';
import { json, uuidv4, calcProfileCompleteness } from '../lib/utils';

export async function handleUsersGet(request, path, db) {
  // GET /api/users/blocked
  if (path[1] === 'blocked') {
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
  if (path[1] === 'discover') {
    const authUser = verifyAuth(request);
    if (!authUser) return json({ error: 'Unauthorized' }, 401);
    const currentUser = await db.collection('users').findOne({ id: authUser.id });
    if (!currentUser) return json({ error: 'User not found' }, 404);
    const swipes = await db.collection('swipes').find({ swiper_id: authUser.id }).toArray();
    const blocks = await db.collection('blocks').find({ $or: [{ blocker_id: authUser.id }, { blocked_id: authUser.id }] }).toArray();
    const blockedIds = blocks.map(b => b.blocker_id === authUser.id ? b.blocked_id : b.blocker_id);
    const excludeIds = [...swipes.map(s => s.target_id), ...blockedIds, authUser.id];
    const candidates = await db.collection('users')
      .find({ id: { $nin: excludeIds }, profile_complete: true, is_suspended: { $ne: true } })
      .project({ password_hash: 0, _id: 0 })
      .limit(100)
      .toArray();
    const complementaryRoles = {
      'Doctor': ['Engineer', 'Researcher', 'Business Operator', 'Investor'],
      'Engineer': ['Doctor', 'Researcher', 'Business Operator', 'Investor'],
      'Researcher': ['Doctor', 'Engineer', 'Business Operator', 'Investor'],
      'Business Operator': ['Doctor', 'Engineer', 'Researcher', 'Investor'],
      'Investor': ['Doctor', 'Engineer', 'Researcher', 'Business Operator', 'Student'],
      'Student': ['Doctor', 'Engineer', 'Researcher', 'Business Operator', 'Investor'],
    };
    const stageOrder = ['Idea', 'Problem Validation', 'MVP', 'Startup'];
    const scored = candidates.map(candidate => {
      let score = 0;
      const myComplementary = complementaryRoles[currentUser.role] || [];
      if (myComplementary.includes(candidate.role)) score += 3;
      const myInterests = currentUser.interests || [];
      const theirInterests = candidate.interests || [];
      score += myInterests.filter(i => theirInterests.includes(i)).length * 2;
      const myStageIdx = stageOrder.indexOf(currentUser.startup_stage);
      const theirStageIdx = stageOrder.indexOf(candidate.startup_stage);
      if (myStageIdx >= 0 && theirStageIdx >= 0) {
        const stageDiff = Math.abs(myStageIdx - theirStageIdx);
        if (stageDiff === 0) score += 2;
        else if (stageDiff === 1) score += 1;
      }
      const myLookingFor = currentUser.looking_for || [];
      const roleToLookingFor = { 'Doctor': 'Clinician', 'Engineer': 'Software Engineer', 'Researcher': 'AI Engineer', 'Business Operator': 'Business Operator', 'Investor': 'Business Operator', 'Student': 'Software Engineer' };
      if (roleToLookingFor[candidate.role] && myLookingFor.includes(roleToLookingFor[candidate.role])) score += 2;
      return { ...candidate, _matchScore: score + (calcProfileCompleteness(candidate) / 50) };
    });
    scored.sort((a, b) => b._matchScore !== a._matchScore ? b._matchScore - a._matchScore : new Date(b.created_at) - new Date(a.created_at));
    const results = scored.slice(0, 30).map(({ _matchScore, ...user }) => user);
    return json({ users: results });
  }

  // GET /api/users/:id
  if (path[1]) {
    const user = await db.collection('users').findOne({ id: path[1] });
    if (!user) return json({ error: 'User not found' }, 404);
    const { password_hash, _id, ...safeUser } = user;
    return json({ user: safeUser });
  }

  return null;
}

export async function handleUsersPost(request, path, db) {
  // POST /api/users/request-verification
  if (path[1] === 'request-verification') {
    const authUser = verifyAuth(request);
    if (!authUser) return json({ error: 'Unauthorized' }, 401);
    const { verification_type } = await request.json();
    await db.collection('users').updateOne({ id: authUser.id }, {
      $set: { verification_requested: true, verification_type: verification_type || 'identity', verification_requested_at: new Date().toISOString() }
    });
    return json({ success: true });
  }

  // POST /api/users/block
  if (path[1] === 'block') {
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
  if (path[1] === 'unblock') {
    const authUser = verifyAuth(request);
    if (!authUser) return json({ error: 'Unauthorized' }, 401);
    const { blocked_id } = await request.json();
    await db.collection('blocks').deleteOne({ blocker_id: authUser.id, blocked_id });
    return json({ success: true });
  }

  return null;
}

export async function handleUsersPut(request, path, db) {
  // PUT /api/users/profile
  if (path[1] === 'profile') {
    const authUser = verifyAuth(request);
    if (!authUser) return json({ error: 'Unauthorized' }, 401);
    const body = await request.json();
    const updateFields = {};
    const allowed = ['name', 'role', 'city', 'country', 'location', 'bio', 'profile_photo', 'skills', 'interests', 'startup_stage', 'commitment_level', 'looking_for'];
    for (const field of allowed) { if (body[field] !== undefined) updateFields[field] = body[field]; }
    updateFields.profile_complete = true;
    await db.collection('users').updateOne({ id: authUser.id }, { $set: updateFields });
    const updatedUser = await db.collection('users').findOne({ id: authUser.id });
    const { password_hash, _id, verification_token, ...safeUser } = updatedUser;
    safeUser.profile_completeness = calcProfileCompleteness(updatedUser);
    return json({ user: safeUser });
  }

  // PUT /api/users/password
  if (path[1] === 'password') {
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
  if (path[1] === 'notification-preferences') {
    const authUser = verifyAuth(request);
    if (!authUser) return json({ error: 'Unauthorized' }, 401);
    const prefs = await request.json();
    await db.collection('users').updateOne({ id: authUser.id }, { $set: { notification_preferences: prefs } });
    return json({ success: true });
  }

  return null;
}
