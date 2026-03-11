import { verifyAuth } from '../lib/auth';
import { json } from '../lib/utils';

export async function handleNotificationsGet(request, path, db) {
  const authUser = verifyAuth(request);
  if (!authUser) return json({ error: 'Unauthorized' }, 401);
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '30');
  const notifications = await db.collection('notifications').find({ user_id: authUser.id }).project({ _id: 0 }).sort({ created_at: -1 }).limit(limit).toArray();
  const unread = await db.collection('notifications').countDocuments({ user_id: authUser.id, read: false });
  return json({ notifications, unread });
}

export async function handleNotificationsPost(request, path, db) {
  // POST /api/notifications/read
  if (path[1] === 'read') {
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
  return null;
}
