import { Router } from 'express';
import { prisma } from '../db';

const router = Router();

router.get('/', async (_req, res) => {
  const subjects = await prisma.subject.findMany({ orderBy: { name: 'asc' } });
  res.json(subjects);
});

export default router;
