import { verifyAuth } from '../lib/auth';
import { sendEmail, emailTemplate } from '../lib/email';
import { json, uuidv4, checkRateLimit, recordAction, createNotification } from '../lib/utils';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function handleSocialGet(request, path, db) {
  // GET /api/conversations
  if (path[0] === 'conversations') {
    const authUser = verifyAuth(request);
    if (!authUser) return json({ error: 'Unauthorized' }, 401);
    const matches = await db.collection('matches').find({ $or: [{ user1_id: authUser.id }, { user2_id: authUser.id }] }).toArray();
    const conversations = [];
    for (const match of matches) {
      const otherId = match.user1_id === authUser.id ? match.user2_id : match.user1_id;
      const otherUser = await db.collection('users').findOne({ id: otherId });
      const lastMessages = await db.collection('messages').find({ conversation_id: match.id }).sort({ created_at: -1 }).limit(1).toArray();
      const unreadCount = await db.collection('messages').countDocuments({ conversation_id: match.id, sender_id: { $ne: authUser.id }, read_by: { $nin: [authUser.id] } });
      const { password_hash, _id: uId, ...safeUser } = otherUser || {};
      conversations.push({
        match_id: match.id, matched_user: safeUser,
        last_message: lastMessages[0] ? { message: lastMessages[0].message, sender_id: lastMessages[0].sender_id, created_at: lastMessages[0].created_at } : null,
        unread_count: unreadCount, matched_at: match.created_at,
      });
    }
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
    const matches = await db.collection('matches').find({ $or: [{ user1_id: authUser.id }, { user2_id: authUser.id }] }).sort({ created_at: -1 }).toArray();
    const otherIds = matches.map(m => m.user1_id === authUser.id ? m.user2_id : m.user1_id);
    const users = await db.collection('users').find({ id: { $in: otherIds } }).project({ password_hash: 0, _id: 0 }).toArray();
    const enriched = matches.map(m => {
      const otherId = m.user1_id === authUser.id ? m.user2_id : m.user1_id;
      const { _id, ...matchData } = m;
      return { ...matchData, matched_user: users.find(u => u.id === otherId) };
    });
    return json({ matches: enriched });
  }

  // GET /api/messages/:conversationId/read
  if (path[0] === 'messages' && path[1] && path[2] === 'read') {
    const authUser = verifyAuth(request);
    if (!authUser) return json({ error: 'Unauthorized' }, 401);
    await db.collection('messages').updateMany({ conversation_id: path[1], sender_id: { $ne: authUser.id } }, { $addToSet: { read_by: authUser.id } });
    return json({ success: true });
  }

  // GET /api/messages/:conversationId
  if (path[0] === 'messages' && path[1]) {
    const authUser = verifyAuth(request);
    if (!authUser) return json({ error: 'Unauthorized' }, 401);
    const messages = await db.collection('messages').find({ conversation_id: path[1] }).sort({ created_at: 1 }).toArray();
    const cleaned = messages.map(({ _id, ...rest }) => rest);
    return json({ messages: cleaned });
  }

  return null;
}

export async function handleSocialPost(request, path, db) {
  // POST /api/swipes
  if (path[0] === 'swipes') {
    const authUser = verifyAuth(request);
    if (!authUser) return json({ error: 'Unauthorized' }, 401);
    const canSwipe = await checkRateLimit(db, authUser.id, 'swipe', 30);
    if (!canSwipe) return json({ error: 'Daily swipe limit reached (30/day). Try again tomorrow!' }, 429);
    const { target_id, action } = await request.json();
    if (!target_id || !action) return json({ error: 'target_id and action are required' }, 400);
    const existing = await db.collection('swipes').findOne({ swiper_id: authUser.id, target_id });
    if (existing) return json({ error: 'Already swiped' }, 409);
    const swipe = { id: uuidv4(), swiper_id: authUser.id, target_id, action, created_at: new Date().toISOString() };
    await db.collection('swipes').insertOne(swipe);
    await recordAction(db, authUser.id, 'swipe');
    let isMatch = false;
    let matchData = null;
    if (action === 'like') {
      const reciprocal = await db.collection('swipes').findOne({ swiper_id: target_id, target_id: authUser.id, action: 'like' });
      if (reciprocal) {
        const existingMatch = await db.collection('matches').findOne({ $or: [{ user1_id: authUser.id, user2_id: target_id }, { user1_id: target_id, user2_id: authUser.id }] });
        if (!existingMatch) {
          isMatch = true;
          const match = { id: uuidv4(), user1_id: authUser.id, user2_id: target_id, created_at: new Date().toISOString() };
          await db.collection('matches').insertOne(match);
          const matchedUser = await db.collection('users').findOne({ id: target_id });
          const currentUser = await db.collection('users').findOne({ id: authUser.id });
          const { password_hash, _id, ...safeMatchedUser } = matchedUser;
          matchData = { match: { id: match.id }, matched_user: safeMatchedUser };
          createNotification(db, authUser.id, 'match', 'New Match!', `You matched with ${matchedUser.name}!`, target_id);
          createNotification(db, target_id, 'match', 'New Match!', `You matched with ${currentUser.name}!`, authUser.id);
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
  if (path[0] === 'messages') {
    const authUser = verifyAuth(request);
    if (!authUser) return json({ error: 'Unauthorized' }, 401);
    const { conversation_id, message } = await request.json();
    if (!conversation_id || !message) return json({ error: 'conversation_id and message are required' }, 400);
    const match = await db.collection('matches').findOne({ id: conversation_id, $or: [{ user1_id: authUser.id }, { user2_id: authUser.id }] });
    if (!match) return json({ error: 'You can only message matched users' }, 403);
    const msg = { id: uuidv4(), conversation_id, sender_id: authUser.id, message, read_by: [authUser.id], created_at: new Date().toISOString() };
    await db.collection('messages').insertOne(msg);
    const { _id, ...cleanMsg } = msg;
    const recipientId = match.user1_id === authUser.id ? match.user2_id : match.user1_id;
    const sender = await db.collection('users').findOne({ id: authUser.id });
    createNotification(db, recipientId, 'message', 'New Message', `${sender?.name || 'Someone'} sent you a message`, conversation_id);
    const recentMsg = await db.collection('messages').findOne({ conversation_id, sender_id: authUser.id, id: { $ne: msg.id } }, { sort: { created_at: -1 } });
    const shouldEmail = !recentMsg || (new Date() - new Date(recentMsg.created_at)) > 5 * 60 * 1000;
    if (shouldEmail) {
      const recipient = await db.collection('users').findOne({ id: recipientId });
      if (recipient?.notification_preferences?.messages !== false) {
        sendEmail(recipient.email, `New message from ${sender?.name} on 1CoFounder`, emailTemplate('New Message', `<p><strong>${sender?.name}</strong> sent you a message:</p><p style="background:#f1f5f9;padding:12px 16px;border-radius:12px;border-left:3px solid #0f766e;">"${message.slice(0, 200)}${message.length > 200 ? '...' : ''}"</p><a href="${BASE_URL}" style="display:inline-block;background:#0f766e;color:white;font-weight:600;padding:12px 28px;border-radius:12px;text-decoration:none;margin:16px 0;">Reply Now</a>`));
      }
    }
    return json({ message: cleanMsg }, 201);
  }

  // POST /api/reports
  if (path[0] === 'reports') {
    const authUser = verifyAuth(request);
    if (!authUser) return json({ error: 'Unauthorized' }, 401);
    const { target_type, target_id, reason } = await request.json();
    if (!target_type || !target_id || !reason) return json({ error: 'target_type, target_id, and reason are required' }, 400);
    if (!['user', 'problem'].includes(target_type)) return json({ error: 'target_type must be user or problem' }, 400);
    const existing = await db.collection('reports').findOne({ reporter_id: authUser.id, target_type, target_id });
    if (existing) return json({ error: 'You already reported this' }, 409);
    const report = { id: uuidv4(), reporter_id: authUser.id, target_type, target_id, reason, created_at: new Date().toISOString() };
    await db.collection('reports').insertOne(report);
    const collection = target_type === 'user' ? 'users' : 'problems';
    await db.collection(collection).updateOne({ id: target_id }, { $inc: { report_count: 1 } });
    const { _id, ...clean } = report;
    return json({ report: clean }, 201);
  }

  return null;
}
