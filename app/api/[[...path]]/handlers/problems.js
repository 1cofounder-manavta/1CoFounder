import { verifyAuth } from '../lib/auth';
import { json, uuidv4, checkRateLimit, recordAction } from '../lib/utils';

export async function handleProblemsGet(request, path, db) {
  const authUser = verifyAuth(request);
  // Get suspended user IDs to filter their problems
  const suspendedUsers = await db.collection('users').find({ is_suspended: true }).project({ id: 1, _id: 0 }).toArray();
  const suspendedIds = suspendedUsers.map(u => u.id);
  const problems = await db.collection('problems').find(suspendedIds.length ? { creator_id: { $nin: suspendedIds } } : {}).sort({ created_at: -1 }).limit(100).toArray();

  const creatorIds = [...new Set(problems.map(p => p.creator_id))];
  const creators = await db.collection('users').find({ id: { $in: creatorIds } }).project({ id: 1, name: 1, role: 1, _id: 0 }).toArray();
  const problemIds = problems.map(p => p.id);
  const interests = await db.collection('problem_interests').find({ problem_id: { $in: problemIds } }).toArray();
  const interestedUserIds = [...new Set(interests.map(i => i.user_id))];
  const interestedUsers = interestedUserIds.length > 0 ? await db.collection('users').find({ id: { $in: interestedUserIds } }).project({ id: 1, name: 1, role: 1, _id: 0 }).toArray() : [];

  const enriched = problems.map(p => {
    const { _id, ...cleanP } = p;
    const pInterests = interests.filter(i => i.problem_id === p.id);
    return {
      ...cleanP,
      creator: creators.find(c => c.id === p.creator_id),
      interest_count: pInterests.length,
      interested_users: pInterests.map(i => ({ user: interestedUsers.find(u => u.id === i.user_id), joined_at: i.created_at })),
      user_interested: authUser ? pInterests.some(i => i.user_id === authUser.id) : false,
    };
  });

  return json({ problems: enriched });
}

export async function handleProblemsPost(request, path, db) {
  // POST /api/problems/:id/join
  if (path[1] && path[2] === 'join') {
    const authUser = verifyAuth(request);
    if (!authUser) return json({ error: 'Unauthorized' }, 401);
    const existing = await db.collection('problem_interests').findOne({ problem_id: path[1], user_id: authUser.id });
    if (existing) return json({ error: 'Already joined this problem' }, 409);
    const interest = { id: uuidv4(), problem_id: path[1], user_id: authUser.id, created_at: new Date().toISOString() };
    await db.collection('problem_interests').insertOne(interest);
    return json({ interest: { id: interest.id } }, 201);
  }

  // POST /api/problems/:id/contact
  if (path[1] && path[2] === 'contact') {
    const authUser = verifyAuth(request);
    if (!authUser) return json({ error: 'Unauthorized' }, 401);
    const problem = await db.collection('problems').findOne({ id: path[1] });
    if (!problem) return json({ error: 'Problem not found' }, 404);
    if (problem.creator_id === authUser.id) return json({ error: 'Cannot contact yourself' }, 400);
    const existingMatch = await db.collection('matches').findOne({ $or: [{ user1_id: authUser.id, user2_id: problem.creator_id }, { user1_id: problem.creator_id, user2_id: authUser.id }] });
    if (existingMatch) return json({ already_matched: true, match_id: existingMatch.id });
    const existingSwipe = await db.collection('swipes').findOne({ swiper_id: authUser.id, target_id: problem.creator_id });
    if (!existingSwipe) {
      await db.collection('swipes').insertOne({ id: uuidv4(), swiper_id: authUser.id, target_id: problem.creator_id, action: 'like', created_at: new Date().toISOString() });
    }
    const reciprocal = await db.collection('swipes').findOne({ swiper_id: problem.creator_id, target_id: authUser.id, action: 'like' });
    if (reciprocal) {
      const match = { id: uuidv4(), user1_id: authUser.id, user2_id: problem.creator_id, created_at: new Date().toISOString() };
      await db.collection('matches').insertOne(match);
      return json({ matched: true, match_id: match.id });
    }
    return json({ interest_sent: true, message: 'Connection request sent to the creator' });
  }

  // POST /api/problems (create new)
  if (!path[1]) {
    const authUser = verifyAuth(request);
    if (!authUser) return json({ error: 'Unauthorized' }, 401);
    const canPost = await checkRateLimit(db, authUser.id, 'problem_post', 3);
    if (!canPost) return json({ error: 'Daily post limit reached (3/day). Try again tomorrow!' }, 429);
    const { title, description, clinical_context, skills_required } = await request.json();
    if (!title || !description) return json({ error: 'Title and description are required' }, 400);
    const problem = { id: uuidv4(), creator_id: authUser.id, title, description, clinical_context: clinical_context || '', skills_required: skills_required || [], report_count: 0, is_hidden: false, created_at: new Date().toISOString() };
    await db.collection('problems').insertOne(problem);
    await recordAction(db, authUser.id, 'problem_post');
    const { _id, ...cleanProblem } = problem;
    return json({ problem: cleanProblem }, 201);
  }

  return null;
}

export async function handleProblemsPut(request, path, db) {
  if (!path[1]) return null;
  const authUser = verifyAuth(request);
  if (!authUser) return json({ error: 'Unauthorized' }, 401);
  const problem = await db.collection('problems').findOne({ id: path[1] });
  if (!problem) return json({ error: 'Problem not found' }, 404);
  if (problem.creator_id !== authUser.id) return json({ error: 'Not your problem' }, 403);
  const { title, description, clinical_context, skills_required } = await request.json();
  const updates = {};
  if (title) updates.title = title;
  if (description) updates.description = description;
  if (clinical_context !== undefined) updates.clinical_context = clinical_context;
  if (skills_required) updates.skills_required = skills_required;
  updates.updated_at = new Date().toISOString();
  await db.collection('problems').updateOne({ id: path[1] }, { $set: updates });
  return json({ success: true });
}

export async function handleProblemsDelete(request, path, db) {
  if (!path[1]) return null;
  const authUser = verifyAuth(request);
  if (!authUser) return json({ error: 'Unauthorized' }, 401);
  const problem = await db.collection('problems').findOne({ id: path[1] });
  if (!problem) return json({ error: 'Problem not found' }, 404);
  if (problem.creator_id !== authUser.id) return json({ error: 'Not your problem' }, 403);
  await db.collection('problems').deleteOne({ id: path[1] });
  await db.collection('problem_interests').deleteMany({ problem_id: path[1] });
  return json({ success: true });
}
