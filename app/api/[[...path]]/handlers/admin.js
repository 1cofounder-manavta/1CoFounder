import { verifyAdmin } from '../lib/auth';
import { json, logAdminAction } from '../lib/utils';

export async function handleAdminGet(request, path, db) {
  // GET /api/admin/dashboard
  if (path[1] === 'dashboard') {
    const admin = await verifyAdmin(request);
    if (!admin) return json({ error: 'Unauthorized' }, 401);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();
    const [totalUsers, totalProblems, totalProjects, totalReports] = await Promise.all([
      db.collection('users').countDocuments(), db.collection('problems').countDocuments(),
      db.collection('projects').countDocuments(), db.collection('reports').countDocuments(),
    ]);
    const newUsersToday = await db.collection('users').countDocuments({ created_at: { $gte: todayStr } });
    const pendingVerifications = await db.collection('users').countDocuments({ verification_requested: true, verified_status: false });
    const flaggedUsers = await db.collection('users').countDocuments({ report_count: { $gte: 3 } });
    const flaggedProblems = await db.collection('problems').countDocuments({ report_count: { $gte: 3 } });
    const [totalMatches, totalMessages, activeProjects] = await Promise.all([
      db.collection('matches').countDocuments(), db.collection('messages').countDocuments(),
      db.collection('projects').countDocuments({ stage: { $in: ['Active', 'In Progress', 'MVP'] } }),
    ]);
    return json({ stats: { totalUsers, newUsersToday, totalProblems, totalProjects, pendingVerifications, flaggedContent: flaggedUsers + flaggedProblems, totalReports, totalMatches, totalMessages, activeProjects } });
  }

  // GET /api/admin/moderation-queue
  if (path[1] === 'moderation-queue') {
    const admin = await verifyAdmin(request);
    if (!admin) return json({ error: 'Unauthorized' }, 401);
    const flaggedUsers = await db.collection('users').find({ report_count: { $gte: 3 } }).project({ password_hash: 0, _id: 0 }).limit(50).toArray();
    const flaggedProblems = await db.collection('problems').find({ report_count: { $gte: 3 } }).project({ _id: 0 }).limit(50).toArray();
    const pendingVerifications = await db.collection('users').find({ verification_requested: true, verified_status: false }).project({ password_hash: 0, _id: 0 }).limit(50).toArray();
    return json({ flaggedUsers, flaggedProblems, pendingVerifications });
  }

  // GET /api/admin/users
  if (path[1] === 'users') {
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
    if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }, { city: { $regex: search, $options: 'i' } }, { country: { $regex: search, $options: 'i' } }];
    if (role) filter.role = role;
    if (verified === 'true') filter.verified_status = true;
    if (verified === 'false') filter.verified_status = false;
    if (status === 'suspended') filter.is_suspended = true;
    if (status === 'active') filter.is_suspended = { $ne: true };
    const total = await db.collection('users').countDocuments(filter);
    const users = await db.collection('users').find(filter).project({ password_hash: 0, _id: 0 }).sort({ created_at: -1 }).skip((page - 1) * limit).limit(limit).toArray();
    return json({ users, total, page, totalPages: Math.ceil(total / limit) });
  }

  // GET /api/admin/problems
  if (path[1] === 'problems') {
    const admin = await verifyAdmin(request);
    if (!admin) return json({ error: 'Unauthorized' }, 401);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const search = url.searchParams.get('search') || '';
    const filter = {};
    if (search) filter.title = { $regex: search, $options: 'i' };
    const total = await db.collection('problems').countDocuments(filter);
    const problems = await db.collection('problems').find(filter).project({ _id: 0 }).sort({ created_at: -1 }).skip((page - 1) * limit).limit(limit).toArray();
    const creatorIds = [...new Set(problems.map(p => p.creator_id))];
    const creators = await db.collection('users').find({ id: { $in: creatorIds } }).project({ id: 1, name: 1, role: 1, _id: 0 }).toArray();
    return json({ problems: problems.map(p => ({ ...p, creator: creators.find(c => c.id === p.creator_id) })), total, page, totalPages: Math.ceil(total / limit) });
  }

  // GET /api/admin/projects
  if (path[1] === 'projects') {
    const admin = await verifyAdmin(request);
    if (!admin) return json({ error: 'Unauthorized' }, 401);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const search = url.searchParams.get('search') || '';
    const filter = {};
    if (search) filter.name = { $regex: search, $options: 'i' };
    const total = await db.collection('projects').countDocuments(filter);
    const projects = await db.collection('projects').find(filter).project({ _id: 0 }).sort({ created_at: -1 }).skip((page - 1) * limit).limit(limit).toArray();
    const projectIds = projects.map(p => p.id);
    const members = await db.collection('project_members').find({ project_id: { $in: projectIds } }).toArray();
    const creatorIds = [...new Set(projects.map(p => p.creator_id))];
    const creators = await db.collection('users').find({ id: { $in: creatorIds } }).project({ id: 1, name: 1, _id: 0 }).toArray();
    return json({ projects: projects.map(p => ({ ...p, creator: creators.find(c => c.id === p.creator_id), team_size: members.filter(m => m.project_id === p.id).length })), total, page, totalPages: Math.ceil(total / limit) });
  }

  // GET /api/admin/verifications
  if (path[1] === 'verifications') {
    const admin = await verifyAdmin(request);
    if (!admin) return json({ error: 'Unauthorized' }, 401);
    const users = await db.collection('users').find({ verification_requested: true, verified_status: false }).project({ password_hash: 0, _id: 0 }).sort({ verification_requested_at: -1 }).toArray();
    return json({ verifications: users });
  }

  // GET /api/admin/reports
  if (path[1] === 'reports') {
    const admin = await verifyAdmin(request);
    if (!admin) return json({ error: 'Unauthorized' }, 401);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const total = await db.collection('reports').countDocuments();
    const reports = await db.collection('reports').find({}).project({ _id: 0 }).sort({ created_at: -1 }).skip((page - 1) * limit).limit(limit).toArray();
    const reporterIds = [...new Set(reports.map(r => r.reporter_id))];
    const reporters = await db.collection('users').find({ id: { $in: reporterIds } }).project({ id: 1, name: 1, _id: 0 }).toArray();
    return json({ reports: reports.map(r => ({ ...r, reporter: reporters.find(u => u.id === r.reporter_id) })), total, page, totalPages: Math.ceil(total / limit) });
  }

  // GET /api/admin/activity-logs
  if (path[1] === 'activity-logs') {
    const admin = await verifyAdmin(request);
    if (!admin) return json({ error: 'Unauthorized' }, 401);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const total = await db.collection('activity_logs').countDocuments();
    const logs = await db.collection('activity_logs').find({}).project({ _id: 0 }).sort({ created_at: -1 }).skip((page - 1) * limit).limit(limit).toArray();
    const adminIds = [...new Set(logs.map(l => l.admin_id))];
    const admins = await db.collection('users').find({ id: { $in: adminIds } }).project({ id: 1, name: 1, _id: 0 }).toArray();
    return json({ logs: logs.map(l => ({ ...l, admin: admins.find(a => a.id === l.admin_id) })), total, page, totalPages: Math.ceil(total / limit) });
  }

  return null;
}

export async function handleAdminPut(request, path, db) {
  // PUT /api/admin/users/:id/verify
  if (path[1] === 'users' && path[2] && path[3] === 'verify') {
    const admin = await verifyAdmin(request);
    if (!admin) return json({ error: 'Unauthorized' }, 401);
    await db.collection('users').updateOne({ id: path[2] }, { $set: { verified_status: true, verification_requested: false } });
    await logAdminAction(db, admin.id, 'verified_user', 'user', path[2], `Admin verified user ${path[2]}`);
    return json({ success: true });
  }

  // PUT /api/admin/users/:id/suspend
  if (path[1] === 'users' && path[2] && path[3] === 'suspend') {
    const admin = await verifyAdmin(request);
    if (!admin) return json({ error: 'Unauthorized' }, 401);
    const user = await db.collection('users').findOne({ id: path[2] });
    const newStatus = !user?.is_suspended;
    await db.collection('users').updateOne({ id: path[2] }, { $set: { is_suspended: newStatus } });
    await logAdminAction(db, admin.id, newStatus ? 'suspended_user' : 'unsuspended_user', 'user', path[2], `Admin ${newStatus ? 'suspended' : 'unsuspended'} user ${path[2]}`);
    return json({ success: true, is_suspended: newStatus });
  }

  // PUT /api/admin/verifications/:id/approve
  if (path[1] === 'verifications' && path[2] && path[3] === 'approve') {
    const admin = await verifyAdmin(request);
    if (!admin) return json({ error: 'Unauthorized' }, 401);
    await db.collection('users').updateOne({ id: path[2] }, { $set: { verified_status: true, verification_requested: false } });
    await logAdminAction(db, admin.id, 'approved_verification', 'user', path[2], `Admin approved verification for user ${path[2]}`);
    return json({ success: true });
  }

  // PUT /api/admin/verifications/:id/reject
  if (path[1] === 'verifications' && path[2] && path[3] === 'reject') {
    const admin = await verifyAdmin(request);
    if (!admin) return json({ error: 'Unauthorized' }, 401);
    await db.collection('users').updateOne({ id: path[2] }, { $set: { verification_requested: false } });
    await logAdminAction(db, admin.id, 'rejected_verification', 'user', path[2], `Admin rejected verification for user ${path[2]}`);
    return json({ success: true });
  }

  // PUT /api/admin/problems/:id/hide
  if (path[1] === 'problems' && path[2] && path[3] === 'hide') {
    const admin = await verifyAdmin(request);
    if (!admin) return json({ error: 'Unauthorized' }, 401);
    const problem = await db.collection('problems').findOne({ id: path[2] });
    const newStatus = !problem?.is_hidden;
    await db.collection('problems').updateOne({ id: path[2] }, { $set: { is_hidden: newStatus } });
    await logAdminAction(db, admin.id, newStatus ? 'hid_problem' : 'unhid_problem', 'problem', path[2], `Admin ${newStatus ? 'hid' : 'unhid'} problem ${path[2]}`);
    return json({ success: true, is_hidden: newStatus });
  }

  return null;
}

export async function handleAdminDelete(request, path, db) {
  // DELETE /api/admin/users/:id
  if (path[1] === 'users' && path[2]) {
    const admin = await verifyAdmin(request);
    if (!admin) return json({ error: 'Unauthorized' }, 401);
    const user = await db.collection('users').findOne({ id: path[2] });
    if (!user) return json({ error: 'User not found' }, 404);
    await db.collection('users').deleteOne({ id: path[2] });
    await db.collection('swipes').deleteMany({ $or: [{ swiper_id: path[2] }, { target_id: path[2] }] });
    await db.collection('matches').deleteMany({ $or: [{ user1_id: path[2] }, { user2_id: path[2] }] });
    await db.collection('messages').deleteMany({ sender_id: path[2] });
    await db.collection('problems').deleteMany({ creator_id: path[2] });
    await db.collection('projects').deleteMany({ creator_id: path[2] });
    await db.collection('project_members').deleteMany({ user_id: path[2] });
    await db.collection('notifications').deleteMany({ user_id: path[2] });
    await logAdminAction(db, admin.id, 'deleted_user', 'user', path[2], `Admin deleted user ${user.name} (${user.email})`);
    return json({ success: true });
  }

  // DELETE /api/admin/problems/:id
  if (path[1] === 'problems' && path[2]) {
    const admin = await verifyAdmin(request);
    if (!admin) return json({ error: 'Unauthorized' }, 401);
    const problem = await db.collection('problems').findOne({ id: path[2] });
    if (!problem) return json({ error: 'Problem not found' }, 404);
    await db.collection('problems').deleteOne({ id: path[2] });
    await db.collection('problem_interests').deleteMany({ problem_id: path[2] });
    await db.collection('reports').deleteMany({ target_type: 'problem', target_id: path[2] });
    await logAdminAction(db, admin.id, 'deleted_problem', 'problem', path[2], `Admin deleted problem \"${problem.title}\"`);
    return json({ success: true });
  }

  // DELETE /api/admin/projects/:id
  if (path[1] === 'projects' && path[2]) {
    const admin = await verifyAdmin(request);
    if (!admin) return json({ error: 'Unauthorized' }, 401);
    const project = await db.collection('projects').findOne({ id: path[2] });
    if (!project) return json({ error: 'Project not found' }, 404);
    await db.collection('projects').deleteOne({ id: path[2] });
    await db.collection('project_members').deleteMany({ project_id: path[2] });
    await logAdminAction(db, admin.id, 'deleted_project', 'project', path[2], `Admin deleted project \"${project.name}\"`);
    return json({ success: true });
  }

  return null;
}
