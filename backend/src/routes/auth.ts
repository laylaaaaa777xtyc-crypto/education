import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../db';
import { signToken } from '../auth';
import { requireAuth, AuthedRequest } from '../middleware/auth';

const router = Router();

const phoneSchema = z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号');

const registerSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(6),
  name: z.string().min(1).max(40),
  grade: z.enum(['G7', 'G8', 'G9']),
});

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { phone, password, name, grade } = parsed.data;

  const exists = await prisma.user.findUnique({ where: { phone } });
  if (exists) return res.status(409).json({ error: '该手机号已注册' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { phone, passwordHash, name, grade },
    select: { id: true, phone: true, name: true, grade: true },
  });
  const token = signToken(user.id);
  res.json({ token, user });
});

const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string(),
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { phone, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) return res.status(401).json({ error: '手机号或密码错误' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: '手机号或密码错误' });

  const token = signToken(user.id);
  res.json({
    token,
    user: { id: user.id, phone: user.phone, name: user.name, grade: user.grade },
  });
});

router.get('/me', requireAuth, async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    select: { id: true, phone: true, name: true, grade: true },
  });
  if (!user) return res.status(404).json({ error: 'user not found' });
  res.json(user);
});

export default router;
