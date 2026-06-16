import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev-only-secret-change-me';

export interface JwtPayload {
  uid: string;
}

export function signToken(uid: string): string {
  return jwt.sign({ uid } satisfies JwtPayload, SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as JwtPayload;
}

// 家长简报短链 token：48 小时有效，只读，载荷只含 学生 userId + 日期。
export interface BriefTokenPayload {
  kind: 'parent_brief';
  uid: string;
  date: string; // YYYY-MM-DD
}

export function signBriefToken(uid: string, date: string): string {
  return jwt.sign(
    { kind: 'parent_brief', uid, date } satisfies BriefTokenPayload,
    SECRET,
    { expiresIn: '48h' },
  );
}

export function verifyBriefToken(token: string): BriefTokenPayload {
  const payload = jwt.verify(token, SECRET) as BriefTokenPayload;
  if (payload.kind !== 'parent_brief') throw new Error('invalid token kind');
  return payload;
}
