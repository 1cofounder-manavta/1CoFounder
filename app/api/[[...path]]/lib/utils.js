import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export function json(data, status = 200) {
  return NextResponse.json(data, { status });
}

export async function checkRateLimit(db, userId, action, limit) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const count = await db.collection('rate_limits').countDocuments({
    user_id: userId, action, created_at: { $gte: today.toISOString() }
  });
  return count < limit;
}

export async function recordAction(db, userId, action) {
  await db.collection('rate_limits').insertOne({
    user_id: userId, action, created_at: new Date().toISOString()
  });
}

export async function createNotification(db, userId, type, title, message, relatedId) {
  await db.collection('notifications').insertOne({
    id: uuidv4(), user_id: userId, type, title, message,
    related_id: relatedId || null, read: false, created_at: new Date().toISOString()
  });
}

export function calcProfileCompleteness(user) {
  const fields = ['bio', 'skills', 'interests', 'city', 'country', 'startup_stage', 'looking_for', 'role', 'commitment_level'];
  let filled = 0;
  for (const f of fields) {
    const v = user?.[f];
    if (Array.isArray(v) ? v.length > 0 : !!v) filled++;
  }
  return Math.round((filled / fields.length) * 100);
}

export async function logAdminAction(db, adminId, action, targetType, targetId, details) {
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

export { uuidv4 };
