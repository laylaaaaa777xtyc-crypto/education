import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../db';

type Grade = 'G7' | 'G8' | 'G9';

const router = Router();

function parseExamples<T extends { examples: string }>(kp: T) {
  let examples: unknown = [];
  try { examples = JSON.parse(kp.examples); } catch {}
  return { ...kp, examples };
}

// GET /knowledge?subjectId=&grade=&chapter=
router.get('/', async (req, res) => {
  const { subjectId, grade, chapter } = req.query as Record<string, string | undefined>;
  const where: Prisma.KnowledgePointWhereInput = {};
  if (subjectId) where.subjectId = subjectId;
  if (grade && ['G7', 'G8', 'G9'].includes(grade)) where.grade = grade as Grade;
  if (chapter) where.chapter = chapter;

  const items = await prisma.knowledgePoint.findMany({
    where,
    orderBy: [{ grade: 'asc' }, { chapter: 'asc' }, { order: 'asc' }],
    include: { subject: true },
  });
  res.json(items.map(parseExamples));
});

// GET /knowledge/chapters?subjectId=&grade=
router.get('/chapters', async (req, res) => {
  const { subjectId, grade } = req.query as Record<string, string | undefined>;
  if (!subjectId) return res.status(400).json({ error: 'subjectId required' });
  const where: Prisma.KnowledgePointWhereInput = { subjectId };
  if (grade && ['G7', 'G8', 'G9'].includes(grade)) where.grade = grade as Grade;

  const rows = await prisma.knowledgePoint.findMany({
    where,
    distinct: ['chapter'],
    select: { chapter: true },
    orderBy: { chapter: 'asc' },
  });
  res.json(rows.map((r) => r.chapter));
});

router.get('/:id', async (req, res) => {
  const kp = await prisma.knowledgePoint.findUnique({
    where: { id: req.params.id },
    include: { subject: true },
  });
  if (!kp) return res.status(404).json({ error: 'not found' });
  res.json(parseExamples(kp));
});

export default router;
