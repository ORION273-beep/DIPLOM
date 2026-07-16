const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
const { z } = require('zod');
const { User, RefreshToken, PasswordResetToken, toPlain } = require('../db/models');
const { sendError, sendSuccess } = require('../utils/errors');
const { sendPasswordResetEmail } = require('../utils/email');
const {
  REFRESH_COOKIE,
  signAccessToken,
  issueRefreshSession,
  serializeUser,
  JWT_REFRESH_SECRET,
  setAuthCookies,
  clearAuthCookies,
} = require('../utils/tokens');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const registerSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(6),
});

async function handleRegister(req, res) {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 400, 'VALIDATION', 'Некорректные данные');
    }
    const email = parsed.data.email.trim().toLowerCase();
    const password = parsed.data.password;
    if (!isValidEmail(email)) {
      return sendError(res, 400, 'VALIDATION', 'Некорректный формат email');
    }
    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return sendError(res, 409, 'CONFLICT', 'Пользователь с таким email уже существует');
    }
    const users = await User.find({}, { _id: 1 }).lean();
    const numericIds = users
      .map((u) => String(u._id))
      .filter((id) => /^\d+$/.test(id))
      .map((id) => Number(id));
    const nextId = String((numericIds.length ? Math.max(...numericIds) : 0) + 1);
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      _id: nextId,
      email,
      password: hashedPassword,
      role: 'USER',
    });
    return sendSuccess(res, 201, { message: 'Пользователь успешно зарегистрирован' });
  } catch (error) {
    console.error('POST /api/auth/register error:', error);
    return sendError(res, 500, 'SERVER', 'Ошибка сервера');
  }
}

router.post('/register', handleRegister);
router.post('/signup', handleRegister);

const loginSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});

router.post('/login', async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 400, 'VALIDATION', 'Email и пароль обязательны');
    }
    const email = parsed.data.email.trim().toLowerCase();
    const password = parsed.data.password;
    const user = toPlain(await User.findOne({ email }).lean());
    if (!user) {
      return sendError(res, 401, 'INVALID_CREDENTIALS', 'Неверный email или пароль');
    }
    if (user.blocked) {
      return sendError(res, 403, 'BLOCKED', 'Аккаунт заблокирован');
    }
    const stored = String(user.password || '');
    const hasBcrypt = stored.startsWith('$2a$') || stored.startsWith('$2b$');
    if (!hasBcrypt) {
      return sendError(res, 401, 'INVALID_CREDENTIALS', 'Неверный email или пароль');
    }
    const ok = await bcrypt.compare(password, stored);
    if (!ok) {
      return sendError(res, 401, 'INVALID_CREDENTIALS', 'Неверный email или пароль');
    }
    const accessToken = signAccessToken({ id: user.id, role: user.role.toLowerCase() });
    const { token: refreshToken, maxAge } = await issueRefreshSession(user.id);
    setAuthCookies(res, user, refreshToken, maxAge);
    return sendSuccess(res, 200, {
      user: serializeUser(user),
      accessToken,
    });
  } catch (error) {
    console.error('POST /api/auth/login error:', error);
    return sendError(res, 500, 'SERVER', 'Ошибка сервера');
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies[REFRESH_COOKIE];
    if (!token) {
      return sendError(res, 401, 'NO_REFRESH', 'Нет refresh-сессии');
    }
    let payload;
    try {
      payload = jwt.verify(token, JWT_REFRESH_SECRET);
    } catch {
      clearAuthCookies(res);
      return sendError(res, 401, 'INVALID_REFRESH', 'Неверный refresh');
    }
    if (payload.type !== 'refresh' || !payload.jti || !payload.sub) {
      return sendError(res, 401, 'INVALID_REFRESH', 'Неверный refresh');
    }
    const row = toPlain(await RefreshToken.findOne({ jti: payload.jti }).lean());
    if (!row || new Date(row.expiresAt) < new Date()) {
      clearAuthCookies(res);
      return sendError(res, 401, 'INVALID_REFRESH', 'Сессия истекла');
    }
    const user = toPlain(await User.findById(String(payload.sub)).lean());
    if (!user) {
      clearAuthCookies(res);
      return sendError(res, 401, 'USER_MISSING', 'Пользователь не найден');
    }
    if (user.blocked) {
      clearAuthCookies(res);
      return sendError(res, 403, 'BLOCKED', 'Аккаунт заблокирован');
    }
    const accessToken = signAccessToken({ id: user.id, role: user.role.toLowerCase() });
    const maxAge = new Date(row.expiresAt).getTime() - Date.now();
    setAuthCookies(res, user, token, Math.max(maxAge, 0));
    return sendSuccess(res, 200, {
      user: serializeUser(user),
      accessToken,
    });
  } catch (error) {
    console.error('POST /api/auth/refresh error:', error);
    return sendError(res, 500, 'SERVER', 'Ошибка сервера');
  }
});

router.post('/logout', async (req, res) => {
  try {
    const token = req.cookies[REFRESH_COOKIE];
    if (token) {
      try {
        const payload = jwt.verify(token, JWT_REFRESH_SECRET);
        if (payload.jti) {
          await RefreshToken.deleteMany({ jti: payload.jti });
        }
      } catch {
        /* ignore */
      }
    }
    clearAuthCookies(res);
    return sendSuccess(res, 200, {});
  } catch (error) {
    console.error('POST /api/auth/logout error:', error);
    return sendError(res, 500, 'SERVER', 'Ошибка сервера');
  }
});

const forgotPasswordSchema = z.object({
  email: z.string().min(1),
});

router.post('/forgot-password', async (req, res) => {
  try {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 400, 'VALIDATION', 'Укажите email');
    }
    const email = parsed.data.email.trim().toLowerCase();
    if (!isValidEmail(email)) {
      return sendError(res, 400, 'VALIDATION', 'Некорректный формат email');
    }
    const user = toPlain(await User.findOne({ email }).lean());
    if (user) {
      await PasswordResetToken.deleteMany({ userId: user.id });
      const token = randomUUID();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      await PasswordResetToken.create({ userId: user.id, token, expiresAt });
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const resetUrl = `${baseUrl}/reset-password?token=${token}`;
      await sendPasswordResetEmail({ email, resetUrl });
    }
    return sendSuccess(res, 200, {
      message: 'Если email зарегистрирован, инструкция по восстановлению отправлена',
    });
  } catch (error) {
    console.error('POST /api/auth/forgot-password error:', error);
    return sendError(res, 500, 'SERVER', 'Ошибка сервера');
  }
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6),
});

router.post('/reset-password', async (req, res) => {
  try {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 400, 'VALIDATION', 'Некорректные данные');
    }
    const { token, password } = parsed.data;
    const row = toPlain(await PasswordResetToken.findOne({ token }).lean());
    if (!row || new Date(row.expiresAt) < new Date()) {
      return sendError(res, 400, 'INVALID_TOKEN', 'Ссылка недействительна или истекла');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(row.userId, { $set: { password: hashedPassword } });
    await PasswordResetToken.deleteOne({ _id: row.id });
    await RefreshToken.deleteMany({ userId: row.userId });
    return sendSuccess(res, 200, { message: 'Пароль успешно изменён' });
  } catch (error) {
    console.error('POST /api/auth/reset-password error:', error);
    return sendError(res, 500, 'SERVER', 'Ошибка сервера');
  }
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

router.patch('/password', requireAuth, async (req, res) => {
  try {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 400, 'VALIDATION', 'Некорректные данные');
    }
    const user = toPlain(await User.findById(req.user.id).lean());
    if (!user) {
      return sendError(res, 404, 'NOT_FOUND', 'Пользователь не найден');
    }
    const ok = await bcrypt.compare(parsed.data.currentPassword, user.password);
    if (!ok) {
      return sendError(res, 401, 'INVALID_CREDENTIALS', 'Неверный текущий пароль');
    }
    const hashedPassword = await bcrypt.hash(parsed.data.newPassword, 10);
    await User.findByIdAndUpdate(user.id, { $set: { password: hashedPassword } });
    return sendSuccess(res, 200, { message: 'Пароль обновлён' });
  } catch (error) {
    console.error('PATCH /api/auth/password error:', error);
    return sendError(res, 500, 'SERVER', 'Ошибка сервера');
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = toPlain(
      await User.findById(req.user.id).select('_id email role balance createdAt').lean(),
    );
    if (!user) {
      return sendError(res, 404, 'NOT_FOUND', 'Пользователь не найден');
    }
    return sendSuccess(res, 200, { user: serializeUser(user) });
  } catch (error) {
    console.error('GET /api/auth/me error:', error);
    return sendError(res, 500, 'SERVER', 'Ошибка сервера');
  }
});

module.exports = router;
