import { Router } from 'express';
import { prisma } from '../db';
import { requireAuth, AuthedRequest } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function streakFromDays(days: Set<string>): number {
  let streak = 0;
  const cursor = new Date();
  // 如果今天没复习，从昨天开始计连续
  if (!days.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// GET /growth/summary
router.get('/summary', async (req: AuthedRequest, res) => {
  const userId = req.userId!;

  const [user, totalMistakes, mastered, logs, recentLogs] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { createdAt: true, name: true } }),
    prisma.mistake.count({ where: { userId } }),
    prisma.mistake.count({ where: { userId, status: 'MASTERED' } }),
    prisma.reviewLog.findMany({
      where: { userId },
      select: { reviewedAt: true, quality: true },
      orderBy: { reviewedAt: 'desc' },
    }),
    prisma.reviewLog.findMany({
      where: {
        userId,
        reviewedAt: { gte: new Date(Date.now() - 14 * 24 * 3600 * 1000) },
      },
      select: { reviewedAt: true },
    }),
  ]);

  if (!user) return res.status(404).json({ error: 'user not found' });

  const totalReviews = logs.length;

  // 连续打卡
  const reviewDays = new Set(logs.map((l) => dayKey(l.reviewedAt)));
  const streak = streakFromDays(reviewDays);
  const totalDays = reviewDays.size;

  // 过去 14 天每日复习量
  const today = new Date();
  const daily: { date: string; count: number }[] = [];
  const recentMap = new Map<string, number>();
  for (const l of recentLogs) {
    const k = dayKey(l.reviewedAt);
    recentMap.set(k, (recentMap.get(k) || 0) + 1);
  }
  for (let i = 13; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const k = dayKey(d);
    daily.push({ date: k, count: recentMap.get(k) || 0 });
  }

  // 各学科已掌握题数
  const subjectsAll = await prisma.subject.findMany({ orderBy: { code: 'asc' } });
  const masteredPerSubject = await Promise.all(
    subjectsAll.map(async (s) => ({
      subjectId: s.id,
      subjectCode: s.code,
      subjectName: s.name,
      mastered: await prisma.mistake.count({
        where: { userId, subjectId: s.id, status: 'MASTERED' },
      }),
    })),
  );

  // 勋章
  type Badge = {
    code: string;
    label: string;
    emoji: string;
    desc: string;
    earned: boolean;
    progress?: { current: number; target: number };
  };
  // 勋章原则：只奖励"复习行为"，不奖励"正确率/掌握数"。
  // 避免诱导学生焦虑分数，所有徽章都基于学生主动做了什么，不基于做对没做对。
  const badges: Badge[] = [
    {
      code: 'first_mistake', emoji: '📝', label: '初次起步',
      desc: '录入第一道错题',
      earned: totalMistakes >= 1,
    },
    {
      code: 'first_review', emoji: '🌱', label: '首次复习',
      desc: '完成第一次复习',
      earned: totalReviews >= 1,
    },
    {
      code: 'mistakes_10', emoji: '🗂️', label: '错题整理者',
      desc: '累计录入 10 道错题',
      earned: totalMistakes >= 10,
      progress: { current: Math.min(totalMistakes, 10), target: 10 },
    },
    {
      code: 'mistakes_30', emoji: '📚', label: '错题收藏家',
      desc: '累计录入 30 道错题',
      earned: totalMistakes >= 30,
      progress: { current: Math.min(totalMistakes, 30), target: 30 },
    },
    {
      code: 'reviews_50', emoji: '🔁', label: '复习达人',
      desc: '累计完成 50 次复习',
      earned: totalReviews >= 50,
      progress: { current: Math.min(totalReviews, 50), target: 50 },
    },
    {
      code: 'reviews_200', emoji: '💪', label: '复习老手',
      desc: '累计完成 200 次复习',
      earned: totalReviews >= 200,
      progress: { current: Math.min(totalReviews, 200), target: 200 },
    },
    {
      code: 'streak_3', emoji: '🔥', label: '连击三日',
      desc: '连续打卡 3 天',
      earned: streak >= 3,
      progress: { current: Math.min(streak, 3), target: 3 },
    },
    {
      code: 'streak_7', emoji: '🚀', label: '一周不辍',
      desc: '连续打卡 7 天',
      earned: streak >= 7,
      progress: { current: Math.min(streak, 7), target: 7 },
    },
    {
      code: 'streak_30', emoji: '👑', label: '月度坚持',
      desc: '连续打卡 30 天',
      earned: streak >= 30,
      progress: { current: Math.min(streak, 30), target: 30 },
    },
  ];

  // 时间线（最近 8 件事）—— 只展示"行为"事件：加入、新录入错题、获得勋章。
  // 不再展示"掌握"事件，避免在时间线里隐性奖励正确率。
  type TimelineItem = { at: string; type: string; text: string };
  const timeline: TimelineItem[] = [];
  timeline.push({
    at: user.createdAt.toISOString(),
    type: 'join',
    text: '加入错题本，开启学习之旅',
  });
  const recentNewMistakes = await prisma.mistake.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { subject: true },
  });
  for (const m of recentNewMistakes) {
    timeline.push({
      at: m.createdAt.toISOString(),
      type: 'add',
      text: `录入「${m.subject.name}」一道错题：${m.originalProblem.slice(0, 24)}${m.originalProblem.length > 24 ? '…' : ''}`,
    });
  }
  for (const b of badges.filter((b) => b.earned).slice(0, 3)) {
    timeline.push({ at: new Date().toISOString(), type: 'badge', text: `获得勋章「${b.label}」` });
  }
  timeline.sort((a, b) => (a.at < b.at ? 1 : -1));

  res.json({
    streak,
    totalDays,
    totalMistakes,
    totalReviews,
    mastered,
    daily,
    masteredPerSubject,
    badges,
    timeline: timeline.slice(0, 8),
  });
});

export default router;
