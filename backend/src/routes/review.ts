import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { requireAuth, AuthedRequest } from '../middleware/auth';
import { applySM2, Quality } from '../sm2';

const router = Router();
router.use(requireAuth);

// GET /review/queue?limit=20
// 返回到期 + 新的 ACTIVE 错题
router.get('/queue', async (req: AuthedRequest, res) => {
  const limit = Math.min(parseInt((req.query.limit as string) || '20', 10) || 20, 100);

  const items = await prisma.mistake.findMany({
    where: {
      userId: req.userId!,
      status: 'ACTIVE',
      nextReviewAt: { lte: new Date() },
    },
    orderBy: { nextReviewAt: 'asc' },
    take: limit,
    include: { subject: true, knowledgePoint: true },
  });
  res.json(items);
});

// POST /review/:id  body: { quality: 1 | 3 | 5 }
const reviewSchema = z.object({
  quality: z.union([z.literal(1), z.literal(3), z.literal(5)]),
});

router.post('/:id', async (req: AuthedRequest, res) => {
  const parsed = reviewSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { quality } = parsed.data;

  const mistake = await prisma.mistake.findFirst({
    where: { id: req.params.id, userId: req.userId! },
  });
  if (!mistake) return res.status(404).json({ error: 'not found' });

  const next = applySM2(
    {
      easeFactor: mistake.easeFactor,
      intervalDays: mistake.intervalDays,
      repetitions: mistake.repetitions,
    },
    quality as Quality,
  );

  // 连续答对 3 次且 EF >= 2.5 视为掌握，移出复习队列
  const newRepetitions = next.repetitions;
  const shouldMaster = quality === 5 && newRepetitions >= 3 && next.easeFactor >= 2.5;

  const now = new Date();
  const [updated] = await prisma.$transaction([
    prisma.mistake.update({
      where: { id: mistake.id },
      data: {
        easeFactor: next.easeFactor,
        intervalDays: next.intervalDays,
        repetitions: next.repetitions,
        nextReviewAt: next.nextReviewAt,
        lastReviewedAt: now,
        status: shouldMaster ? 'MASTERED' : 'ACTIVE',
      },
    }),
    prisma.reviewLog.create({
      data: {
        userId: req.userId!,
        mistakeId: mistake.id,
        quality,
        reviewedAt: now,
      },
    }),
  ]);
  res.json(updated);
});

// GET /review/stats  概览：今日到期、累计错题、已掌握
router.get('/stats', async (req: AuthedRequest, res) => {
  const userId = req.userId!;
  const [dueNow, total, mastered] = await Promise.all([
    prisma.mistake.count({
      where: { userId, status: 'ACTIVE', nextReviewAt: { lte: new Date() } },
    }),
    prisma.mistake.count({ where: { userId } }),
    prisma.mistake.count({ where: { userId, status: 'MASTERED' } }),
  ]);
  res.json({ dueNow, total, mastered });
});

export default router;
