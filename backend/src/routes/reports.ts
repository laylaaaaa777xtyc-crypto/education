import { Router } from 'express';
import { prisma } from '../db';
import { requireAuth, AuthedRequest } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

type ErrorType = 'CONCEPT' | 'CALCULATION' | 'MISREAD' | 'METHOD' | 'CARELESS' | 'OTHER';
const ERROR_TYPES: ErrorType[] = [
  'CONCEPT', 'CALCULATION', 'MISREAD', 'METHOD', 'CARELESS', 'OTHER',
];

const ERROR_TYPE_LABEL: Record<ErrorType, string> = {
  CONCEPT: '概念不清',
  CALCULATION: '计算错误',
  MISREAD: '审题错误',
  METHOD: '方法错误',
  CARELESS: '粗心',
  OTHER: '其他',
};

// GET /reports/weakness — 薄弱点报告
router.get('/weakness', async (req: AuthedRequest, res) => {
  const userId = req.userId!;

  const mistakes = await prisma.mistake.findMany({
    where: { userId },
    include: { subject: true, knowledgePoint: true },
  });

  const total = mistakes.length;
  const active = mistakes.filter((m) => m.status === 'ACTIVE').length;
  const mastered = mistakes.filter((m) => m.status === 'MASTERED').length;

  // 按学科聚合
  const bySubjectMap = new Map<string, {
    subjectId: string;
    subjectCode: string;
    subjectName: string;
    total: number;
    active: number;
    mastered: number;
  }>();
  for (const m of mistakes) {
    const key = m.subjectId;
    const entry = bySubjectMap.get(key) || {
      subjectId: m.subjectId,
      subjectCode: m.subject.code,
      subjectName: m.subject.name,
      total: 0,
      active: 0,
      mastered: 0,
    };
    entry.total += 1;
    if (m.status === 'ACTIVE') entry.active += 1;
    else entry.mastered += 1;
    bySubjectMap.set(key, entry);
  }
  const bySubject = [...bySubjectMap.values()]
    .map((s) => ({
      ...s,
      masteryRate: s.total === 0 ? 0 : Math.round((s.mastered / s.total) * 100),
    }))
    .sort((a, b) => b.active - a.active);

  // 错误类型分布
  const byErrorType = ERROR_TYPES.map((code) => {
    const items = mistakes.filter((m) => m.errorType === code);
    return {
      code,
      label: ERROR_TYPE_LABEL[code],
      total: items.length,
      active: items.filter((m) => m.status === 'ACTIVE').length,
    };
  }).filter((e) => e.total > 0);

  // 章节薄弱点（仅算 ACTIVE）
  const byChapterMap = new Map<string, {
    subjectId: string;
    subjectName: string;
    chapter: string;
    active: number;
    total: number;
  }>();
  for (const m of mistakes) {
    const chapter = m.knowledgePoint?.chapter || '未归类';
    const key = `${m.subjectId}__${chapter}`;
    const entry = byChapterMap.get(key) || {
      subjectId: m.subjectId,
      subjectName: m.subject.name,
      chapter,
      active: 0,
      total: 0,
    };
    entry.total += 1;
    if (m.status === 'ACTIVE') entry.active += 1;
    byChapterMap.set(key, entry);
  }
  const topWeakChapters = [...byChapterMap.values()]
    .filter((c) => c.active > 0)
    .sort((a, b) => b.active - a.active)
    .slice(0, 6);

  // 建议
  const suggestions: string[] = [];
  if (total === 0) {
    suggestions.push('还没有错题记录，先去录入一道吧～');
  } else {
    if (topWeakChapters.length > 0) {
      const top = topWeakChapters[0];
      suggestions.push(`重点回顾 ${top.subjectName} · ${top.chapter}（${top.active} 道未掌握）`);
    }
    const topErr = [...byErrorType].sort((a, b) => b.active - a.active)[0];
    if (topErr && topErr.active >= 3) {
      suggestions.push(`「${topErr.label}」类错误偏多，做题时注意针对性训练`);
    }
    if (active >= 10 && mastered / total < 0.3) {
      suggestions.push('已积累不少错题，建议每天用 15 分钟过一遍复习队列');
    }
  }

  res.json({
    total,
    active,
    mastered,
    masteryRate: total === 0 ? 0 : Math.round((mastered / total) * 100),
    bySubject,
    byErrorType,
    topWeakChapters,
    suggestions,
  });
});

export default router;
