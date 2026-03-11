import { verifyAuth } from '../lib/auth';
import { json, uuidv4 } from '../lib/utils';

export async function handleProjectsGet(request, path, db) {
  const authUser = verifyAuth(request);
  if (!authUser) return json({ error: 'Unauthorized' }, 401);

  const memberDocs = await db.collection('project_members').find({ user_id: authUser.id }).toArray();
  const projectIds = memberDocs.map(m => m.project_id);
  const projects = projectIds.length > 0
    ? await db.collection('projects').find({ id: { $in: projectIds } }).sort({ created_at: -1 }).toArray()
    : [];

  const allProjectIds = projects.map(p => p.id);
  const allMembers = await db.collection('project_members').find({ project_id: { $in: allProjectIds } }).toArray();
  const allUserIds = [...new Set(allMembers.map(m => m.user_id))];
  const users = await db.collection('users').find({ id: { $in: allUserIds } }).project({ id: 1, name: 1, role: 1, _id: 0 }).toArray();

  const enriched = projects.map(p => {
    const { _id, ...cleanP } = p;
    const pMembers = allMembers.filter(m => m.project_id === p.id);
    return {
      ...cleanP,
      members: pMembers.map(m => ({ user_id: m.user_id, role: m.role, user: users.find(u => u.id === m.user_id) })),
    };
  });

  return json({ projects: enriched });
}

export async function handleProjectsPost(request, path, db) {
  // POST /api/projects/:id/join
  if (path[1] && path[2] === 'join') {
    const authUser = verifyAuth(request);
    if (!authUser) return json({ error: 'Unauthorized' }, 401);
    const existing = await db.collection('project_members').findOne({ project_id: path[1], user_id: authUser.id });
    if (existing) return json({ error: 'Already a member' }, 409);
    const body = await request.json();
    const member = { id: uuidv4(), project_id: path[1], user_id: authUser.id, role: body.role || 'Member', joined_at: new Date().toISOString() };
    await db.collection('project_members').insertOne(member);
    return json({ member: { id: member.id, role: member.role } }, 201);
  }

  // POST /api/projects/:id/invite
  if (path[1] && path[2] === 'invite') {
    const authUser = verifyAuth(request);
    if (!authUser) return json({ error: 'Unauthorized' }, 401);
    const project = await db.collection('projects').findOne({ id: path[1] });
    if (!project) return json({ error: 'Project not found' }, 404);
    if (project.creator_id !== authUser.id) return json({ error: 'Only the creator can invite' }, 403);
    const { user_id } = await request.json();
    if (!user_id) return json({ error: 'user_id required' }, 400);
    const existing = await db.collection('project_members').findOne({ project_id: path[1], user_id });
    if (existing) return json({ error: 'User already a member' }, 409);
    const member = { id: uuidv4(), project_id: path[1], user_id, role: 'Invited', joined_at: new Date().toISOString() };
    await db.collection('project_members').insertOne(member);
    await db.collection('notifications').insertOne({ id: uuidv4(), user_id, type: 'project_invite', message: `You've been invited to project "${project.name}"`, link: '/projects', read: false, created_at: new Date().toISOString() });
    const invitedUser = await db.collection('users').findOne({ id: user_id });
    const { _id: mId, ...cleanMember } = member;
    return json({ member: { ...cleanMember, user: invitedUser ? { name: invitedUser.name, id: invitedUser.id, role: invitedUser.role } : null } }, 201);
  }

  // POST /api/projects (create new)
  if (!path[1]) {
    const authUser = verifyAuth(request);
    if (!authUser) return json({ error: 'Unauthorized' }, 401);
    const { name, problem_id, description, stage } = await request.json();
    if (!name || !description) return json({ error: 'Name and description are required' }, 400);
    const project = { id: uuidv4(), name, problem_id: problem_id || null, creator_id: authUser.id, description, stage: stage || 'Idea', created_at: new Date().toISOString() };
    await db.collection('projects').insertOne(project);
    const member = { id: uuidv4(), project_id: project.id, user_id: authUser.id, role: 'Creator', joined_at: new Date().toISOString() };
    await db.collection('project_members').insertOne(member);
    const { _id, ...cleanProject } = project;
    return json({ project: cleanProject }, 201);
  }

  return null;
}
