import { getDb } from './lib/db';
import { json } from './lib/utils';
import { handleAuthGet, handleAuthPost } from './handlers/auth';
import { handleUsersGet, handleUsersPost, handleUsersPut } from './handlers/users';
import { handleSocialGet, handleSocialPost } from './handlers/social';
import { handleProblemsGet, handleProblemsPost, handleProblemsPut, handleProblemsDelete } from './handlers/problems';
import { handleProjectsGet, handleProjectsPost } from './handlers/projects';
import { handleNotificationsGet, handleNotificationsPost } from './handlers/notifications';
import { handleAdminGet, handleAdminPut, handleAdminDelete } from './handlers/admin';

export async function GET(request, { params }) {
  const path = params.path || [];

  // Health check - no DB dependency
  if (path[0] === 'health') {
    return json({ status: 'ok', timestamp: new Date().toISOString() });
  }

  try {
    const db = await getDb();
    let result = null;

    if (path[0] === 'auth') result = await handleAuthGet(request, path, db);
    else if (path[0] === 'notifications') result = await handleNotificationsGet(request, path, db);
    else if (path[0] === 'users') result = await handleUsersGet(request, path, db);
    else if (path[0] === 'conversations' || path[0] === 'matches' || path[0] === 'messages') result = await handleSocialGet(request, path, db);
    else if (path[0] === 'problems') result = await handleProblemsGet(request, path, db);
    else if (path[0] === 'projects') result = await handleProjectsGet(request, path, db);
    else if (path[0] === 'admin') result = await handleAdminGet(request, path, db);

    return result || json({ error: 'Not found' }, 404);
  } catch (error) {
    console.error('GET error:', error);
    return json({ error: 'Internal server error' }, 500);
  }
}

export async function POST(request, { params }) {
  const path = params.path || [];

  try {
    const db = await getDb();
    let result = null;

    if (path[0] === 'auth') result = await handleAuthPost(request, path, db);
    else if (path[0] === 'users') result = await handleUsersPost(request, path, db);
    else if (path[0] === 'swipes' || path[0] === 'messages' || path[0] === 'reports') result = await handleSocialPost(request, path, db);
    else if (path[0] === 'problems') result = await handleProblemsPost(request, path, db);
    else if (path[0] === 'projects') result = await handleProjectsPost(request, path, db);
    else if (path[0] === 'notifications') result = await handleNotificationsPost(request, path, db);

    return result || json({ error: 'Not found' }, 404);
  } catch (error) {
    console.error('POST error:', error);
    return json({ error: 'Internal server error' }, 500);
  }
}

export async function PUT(request, { params }) {
  const path = params.path || [];

  try {
    const db = await getDb();
    let result = null;

    if (path[0] === 'users') result = await handleUsersPut(request, path, db);
    else if (path[0] === 'problems') result = await handleProblemsPut(request, path, db);
    else if (path[0] === 'admin') result = await handleAdminPut(request, path, db);

    return result || json({ error: 'Not found' }, 404);
  } catch (error) {
    console.error('PUT error:', error);
    return json({ error: 'Internal server error' }, 500);
  }
}

export async function DELETE(request, { params }) {
  const path = params.path || [];

  try {
    const db = await getDb();
    let result = null;

    if (path[0] === 'problems') result = await handleProblemsDelete(request, path, db);
    else if (path[0] === 'admin') result = await handleAdminDelete(request, path, db);

    return result || json({ error: 'Not found' }, 404);
  } catch (error) {
    console.error('DELETE error:', error);
    return json({ error: 'Internal server error' }, 500);
  }
}
