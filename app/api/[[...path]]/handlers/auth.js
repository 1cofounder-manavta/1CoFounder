import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { verifyAuth, JWT_SECRET } from '../lib/auth';
import { sendEmail, emailTemplate } from '../lib/email';
import { json, uuidv4, calcProfileCompleteness } from '../lib/utils';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function handleAuthGet(request, path, db) {
  // GET /api/auth/me
  if (path[1] === 'me') {
    const authUser = verifyAuth(request);
    if (!authUser) return json({ error: 'Unauthorized' }, 401);
    const user = await db.collection('users').findOne({ id: authUser.id });
    if (!user) return json({ error: 'User not found' }, 404);
    const { password_hash, _id, verification_token, ...safeUser } = user;
    safeUser.profile_completeness = calcProfileCompleteness(user);
    const unreadCount = await db.collection('notifications').countDocuments({ user_id: authUser.id, read: false });
    safeUser.unread_notifications = unreadCount;
    return json({ user: safeUser });
  }

  // GET /api/auth/verify?token=...
  if (path[1] === 'verify') {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    if (!token) return json({ error: 'Verification token required' }, 400);
    const user = await db.collection('users').findOne({ verification_token: token });
    if (!user) return json({ error: 'Invalid or expired token' }, 400);
    if (new Date(user.verification_expires) < new Date()) return json({ error: 'Token has expired. Please request a new one.' }, 400);
    await db.collection('users').updateOne({ id: user.id }, { $set: { email_verified: true }, $unset: { verification_token: '', verification_expires: '' } });
    return NextResponse.redirect(`${BASE_URL}?verified=true`);
  }

  return null;
}

export async function handleAuthPost(request, path, db) {
  // POST /api/auth/signup
  if (path[1] === 'signup') {
    const { name, email, password } = await request.json();
    if (!name || !email || !password) return json({ error: 'Name, email, and password are required' }, 400);
    if (password.length < 6) return json({ error: 'Password must be at least 6 characters' }, 400);
    const existing = await db.collection('users').findOne({ email: email.toLowerCase() });
    if (existing) return json({ error: 'An account with this email already exists' }, 409);
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const user = {
      id: userId, name, email: email.toLowerCase(), password_hash: hashedPassword,
      role: '', city: '', country: '', location: '', bio: '', profile_photo: '',
      skills: [], interests: [], startup_stage: '', commitment_level: '', looking_for: [],
      verified_status: false, profile_complete: false, is_admin: false, is_suspended: false,
      report_count: 0, email_verified: false, requires_verification: true,
      verification_token: verificationToken, verification_expires: verificationExpires,
      notification_preferences: { matches: true, messages: true, problems: true, projects: true },
      created_at: new Date().toISOString()
    };
    await db.collection('users').insertOne(user);
    const verifyUrl = `${BASE_URL}/api/auth/verify?token=${verificationToken}`;
    sendEmail(user.email, 'Verify your 1CoFounder account', emailTemplate('Welcome to 1CoFounder!', `<p>Hi ${name},</p><p>Thanks for joining 1CoFounder! Please verify your email address.</p><a href="${verifyUrl}" style="display:inline-block;background:#0f766e;color:white;font-weight:600;padding:12px 28px;border-radius:12px;text-decoration:none;margin:16px 0;">Verify Email</a><p style="font-size:12px;color:#94a3b8;">This link expires in 24 hours.</p>`)).catch(() => {});
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const { password_hash: _ph, _id: _oid, verification_token: _vt, ...safeNewUser } = user;
    return json({ token, user: safeNewUser }, 201);
  }

  // POST /api/auth/login
  if (path[1] === 'login') {
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

  // POST /api/auth/resend-verification
  if (path[1] === 'resend-verification') {
    let user;
    const authUser = verifyAuth(request);
    if (authUser) {
      user = await db.collection('users').findOne({ id: authUser.id });
    } else {
      const body = await request.json().catch(() => ({}));
      if (body.email) user = await db.collection('users').findOne({ email: body.email.toLowerCase() });
    }
    if (!user) return json({ error: 'User not found' }, 404);
    if (user.email_verified) return json({ error: 'Already verified' }, 400);
    const newToken = crypto.randomBytes(32).toString('hex');
    const newExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await db.collection('users').updateOne({ id: user.id }, { $set: { verification_token: newToken, verification_expires: newExpires } });
    const verifyUrl = `${BASE_URL}/api/auth/verify?token=${newToken}`;
    const sent = await sendEmail(user.email, 'Verify your 1CoFounder account', emailTemplate('Verify Your Email', `<p>Hi ${user.name},</p><p>Click below to verify your email address.</p><a href="${verifyUrl}" style="display:inline-block;background:#0f766e;color:white;font-weight:600;padding:12px 28px;border-radius:12px;text-decoration:none;margin:16px 0;">Verify Email</a><p style="font-size:12px;color:#94a3b8;">This link expires in 24 hours.</p>`));
    return json({ success: true, email_sent: sent, verify_url: !sent ? verifyUrl : undefined });
  }

  return null;
}
