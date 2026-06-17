const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
const { prisma } = require('../prisma');

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_ACCESS_TTL = process.env.JWT_ACCESS_TTL || '15m';
const JWT_REFRESH_TTL = process.env.JWT_REFRESH_TTL || '14d';
const COOKIE_SECURE = process.env.COOKIE_SECURE === 'true';
const REFRESH_COOKIE = 'refresh_token';
const USER_ROLE_COOKIE = 'user_role';

function refreshCookieOptions(maxAgeMs) {
  return {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeMs,
  };
}

function roleCookieOptions(maxAgeMs) {
  return {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeMs,
  };
}

function setAuthCookies(res, user, refreshToken, maxAgeMs) {
  // If a previous version stored the refresh cookie under `/api/auth`,
  // ensure we also clear that cookie to avoid duplicate `refresh_token` values.
  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions(maxAgeMs));
  const role = String(user.role || 'user').toLowerCase();
  res.cookie(USER_ROLE_COOKIE, role, roleCookieOptions(maxAgeMs));
}

function clearAuthCookies(res) {
  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
  res.clearCookie(REFRESH_COOKIE, { path: '/' });
  res.clearCookie(USER_ROLE_COOKIE, { path: '/' });
}

function signAccessToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, JWT_ACCESS_SECRET, {
    expiresIn: JWT_ACCESS_TTL,
  });
}

function signRefreshToken(userId, jti) {
  return jwt.sign({ sub: userId, jti, type: 'refresh' }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_TTL,
  });
}

function parseRefreshTtlMs() {
  const m = String(JWT_REFRESH_TTL).match(/^(\d+)([dhms])$/);
  if (!m) return 14 * 24 * 60 * 60 * 1000;
  const n = Number(m[1]);
  const u = m[2];
  if (u === 'd') return n * 24 * 60 * 60 * 1000;
  if (u === 'h') return n * 60 * 60 * 1000;
  if (u === 'm') return n * 60 * 1000;
  if (u === 's') return n * 1000;
  return 14 * 24 * 60 * 60 * 1000;
}

async function issueRefreshSession(userId) {
  const jti = randomUUID();
  const token = signRefreshToken(userId, jti);
  const decoded = jwt.decode(token);
  const expiresAt = new Date((decoded.exp || 0) * 1000);
  await prisma.refreshToken.create({
    data: { jti, userId, expiresAt },
  });
  return { token, maxAge: parseRefreshTtlMs() };
}

function serializeUser(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role.toLowerCase(),
    balance: user.balance ?? 0,
    createdAt: user.createdAt ? user.createdAt.toISOString() : undefined,
  };
}

module.exports = {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  REFRESH_COOKIE,
  setAuthCookies,
  clearAuthCookies,
  signAccessToken,
  issueRefreshSession,
  serializeUser,
};
