import { Router } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../db';
import { requireAuth, AuthedRequest } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

type ErrorType = 'CONCEPT' | 'CALCULATION' | 'MISREAD' | 'METHOD' | 'CARELESS' | 'OTHER';
type MistakeStatus = 'ACTIVE' | 'MASTERED';

const ERROR_TYPES: ErrorType[] = [
  'CONCEPT',
  'CALCULATION',
  'MISREAD',
  'METHOD',
  'CARELESS',
  'OTHER',
];

const createSchema = z.object({
  subjectId: z.string().min(1),
  knowledgePointId: z.string().optional().nullable(),
  originalProblem: z.string().min(1),
  wrongAnswer: z.string().min(1),
  correctAnswer: z.string().min(1),
  errorType: z.enum(ERROR_TYPES as [ErrorType, ...ErrorType[]]),
  source: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

// POST /mistakes
router.post('/', async (req: AuthedRequest, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const data = parsed.data;

  const mistake = await prisma.mistake.create({
    data: {
      userId: req.userId!,
      subjectId: data.subjectId,
      knowledgePointId: data.knowledgePointId || null,
      originalProblem: data.originalProblem,
      wrongAnswer: data.wrongAnswer,
      correctAnswer: data.correctAnswer,
      errorType: data.errorType,
      source: data.source || null,
      notes: data.notes || null,
    },
  });
  res.status(201).json(mistake);
});

// GET /mistakes?subjectId=&errorType=&status=
router.get('/', async (req: AuthedRequest, res) => {
  const { subjectId, errorType, status } = req.query as Record<string, string | undefined>;
  const where: Prisma.MistakeWhereInput = { userId: req.userId! };
  if (subjectId) where.subjectId = subjectId;
  if (errorType && (ERROR_TYPES as string[]).includes(errorType)) {
    where.errorType = errorType as ErrorType;
  }
  if (status && ['ACTIVE', 'MASTERED'].includes(status)) {
    where.status = status as MistakeStatus;
  }

  const items = await prisma.mistake.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { subject: true, knowledgePoint: true },
  });
  res.json(items);
});

router.get('/:id', async (req: AuthedRequest, res) => {
  const mistake = await prisma.mistake.findFirst({
    where: { id: req.params.id, userId: req.userId! },
    include: { subject: true, knowledgePoint: true },
  });
  if (!mistake) return res.status(404).json({ error: 'not found' });
  res.json(mistake);
});

const updateSchema = createSchema.partial().extend({
  status: z.enum(['ACTIVE', 'MASTERED']).optional(),
});

router.patch('/:id', async (req: AuthedRequest, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const existing = await prisma.mistake.findFirst({
    where: { id: req.params.id, userId: req.userId! },
  });
  if (!existing) return res.status(404).json({ error: 'not found' });

  const updated = await prisma.mistake.update({
    where: { id: existing.id },
    data: parsed.data,
  });
  res.json(updated);
});

router.delete('/:id', async (req: AuthedRequest, res) => {
  const existing = await prisma.mistake.findFirst({
    where: { id: req.params.id, userId: req.userId! },
  });
  if (!existing) return res.status(404).json({ error: 'not found' });
  await prisma.mistake.delete({ where: { id: existing.id } });
  res.status(204).end();
});

export default router;
