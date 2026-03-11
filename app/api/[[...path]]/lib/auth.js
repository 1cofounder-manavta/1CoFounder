import jwt from 'jsonwebtoken';
import { getDb } from './db';

const JWT_SECRET = process.env.JWT_SECRET;

export function verifyAuth(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(authHeader.slice(7), JWT_SECRET);
  } catch {
    return null;
  }
}

export async function verifyAdmin(request) {
  const authUser = verifyAuth(request);
  if (!authUser) return null;
  const db = await getDb();
  const user = await db.collection('users').findOne({ id: authUser.id });
  if (!user || !user.is_admin) return null;
  return authUser;
}

export { JWT_SECRET };
