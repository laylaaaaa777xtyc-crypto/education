import { Router } from 'express';
import { prisma } from '../db';
import { requireAuth, AuthedRequest } from '../middleware/auth';
import { signBriefToken, verifyBriefToken } from '../auth';

const router = Router();

function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function startOfDay(date: string): Date {
  const [y, m, d] = date.split('-').map((s) => parseInt(s, 10));
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

function endOfDay(date: string): Date {
  const [y, m, d] = date.split('-').map((s) => parseInt(s, 10));
  return new Date(y, m - 1, d, 23, 59, 59, 999);
}

function streakFromDays(days: Set<string>): number {
  let streak = 0;
  const cursor = new Date();
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// POST /parentBrief/share — 学生端调用，生成一个当日的家长简报 token
router.post('/share', requireAuth, async (req: AuthedRequest, res) => {
  const today = dayKey(new Date());
  const token = signBriefToken(req.userId!, today);
  res.json({
    token,
    date: today,
    expiresInHours: 48,
  });
});

// GET /parentBrief/view/:token — 无需登录，凭签名 token 访问
router.get('/view/:token', async (req, res) => {
  let payload;
  try {
    payload = verifyBriefToken(req.params.token);
  } catch {
    return res.status(401).json({ error: '链接已过期或无效' });
  }

  const userId = payload.uid;
  const briefDate = payload.date;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, grade: true },
  });
  if (!user) return res.status(404).json({ error: '未找到学生信息' });

  const dayStart = startOfDay(briefDate);
  const dayEnd = endOfDay(briefDate);

  // 当日复习记录（按时间排序，便于找连续答对）
  const todayLogs = await prisma.reviewLog.findMany({
    where: { userId, reviewedAt: { gte: dayStart, lte: dayEnd } },
    orderBy: { reviewedAt: 'asc' },
    include: {
      mistake: {
        include: {
          knowledgePoint: { select: { chapter: true, title: true } },
          subject: { select: { name: true } },
        },
      },
    },
  });

  // 当日新录入的错题
  const todayMistakes = await prisma.mistake.count({
    where: { userId, createdAt: { gte: dayStart, lte: dayEnd } },
  });

  // 连续打卡：用所有历史复习日期
  const allLogs = await prisma.reviewLog.findMany({
    where: { userId },
    select: { reviewedAt: true },
  });
  const reviewDays = new Set(allLogs.map((l) => dayKey(l.reviewedAt)));
  const streak = streakFromDays(reviewDays);

  // 基于真实数据的具体亮点
  // 优先策略：找当日连续答对最多的章节
  let highlight = '';
  if (todayLogs.length > 0) {
    type Run = { chapter: string; subject: string; consecutive: number; total: number };
    const chapterStats = new Map<string, Run>();
    let bestRun = { chapter: '', subject: '', consecutive: 0, total: 0 };
    let currentRunByChapter = new Map<string, { run: number; subject: string; total: number }>();

    for (const log of todayLogs) {
      const ch = log.mistake.knowledgePoint?.chapter || log.mistake.subject?.name || '其他';
      const subj = log.mistake.subject?.name || '';
      const cur = currentRunByChapter.get(ch) || { run: 0, subject: subj, total: 0 };
      cur.total += 1;
      if (log.quality === 5) {
        cur.run += 1;
        if (cur.run > bestRun.consecutive) {
          bestRun = { chapter: ch, subject: subj, consecutive: cur.run, total: cur.total };
        }
      } else {
        cur.run = 0;
      }
      currentRunByChapter.set(ch, cur);

      const stat = chapterStats.get(ch) || { chapter: ch, subject: subj, consecutive: 0, total: 0 };
      stat.total += 1;
      chapterStats.set(ch, stat);
    }

    if (bestRun.consecutive >= 3) {
      highlight = `今天在「${bestRun.subject}·${bestRun.chapter}」上连续答对了 ${bestRun.consecutive} 次。`;
    } else if (bestRun.consecutive === 2) {
      highlight = `今天在「${bestRun.subject}·${bestRun.chapter}」上连续答对了 2 次。`;
    } else {
      // 没有显著连击，但完成了复习
      const correct = todayLogs.filter((l) => l.quality === 5).length;
      highlight = `今天完成了 ${todayLogs.length} 道复习，其中 ${correct} 道当场答对。`;
    }
  } else if (todayMistakes > 0) {
    highlight = `今天主动整理了 ${todayMistakes} 道新错题，这是认真复盘的开始。`;
  } else {
    highlight = '今天还没有开始复习。';
  }

  // 薄弱章节 Top 1（基于全部 ACTIVE 错题）
  const activeMistakes = await prisma.mistake.findMany({
    where: { userId, status: 'ACTIVE' },
    include: {
      knowledgePoint: { select: { chapter: true } },
      subject: { select: { name: true } },
    },
  });
  const weakMap = new Map<string, { subject: string; chapter: string; count: number }>();
  for (const m of activeMistakes) {
    const chapter = m.knowledgePoint?.chapter || '未归类';
    const subject = m.subject?.name || '';
    const key = `${subject}__${chapter}`;
    const entry = weakMap.get(key) || { subject, chapter, count: 0 };
    entry.count += 1;
    weakMap.set(key, entry);
  }
  const weakest = [...weakMap.values()].sort((a, b) => b.count - a.count)[0];
  const weakChapter = weakest
    ? `「${weakest.subject}·${weakest.chapter}」目前还有 ${weakest.count} 道未掌握，是这段时间最需要关注的部分。`
    : '目前没有特别薄弱的章节，整体掌握平均。';

  // 给家长的具体建议（不模板化夸赞，基于真实场景）
  let suggestion = '';
  const correctToday = todayLogs.filter((l) => l.quality === 5).length;
  if (todayLogs.length === 0 && todayMistakes === 0) {
    suggestion = '今天孩子可能比较忙，不必追问"为什么没学"。明天见到他时，先问一句"今天累不累"，比催进度更管用。';
  } else if (todayLogs.length === 0 && todayMistakes > 0) {
    suggestion = '主动整理错题本身就是认真的表现。可以肯定他这个动作（"愿意把不会的写下来很难得"），不急着要他立刻复习。';
  } else if (todayLogs.length >= 15) {
    suggestion = '今天复习量比较大，可以提醒孩子起来活动 10 分钟、看远处放松眼睛。无需额外奖励，他对自己的努力心里有数。';
  } else if (correctToday >= 3 && todayLogs.length <= 5) {
    suggestion = '今天复习不多但效率不错。可以陪他聊聊那个连续答对的知识点，让他讲给你听——讲一遍比再做一遍记得牢。';
  } else if (correctToday < todayLogs.length / 2 && todayLogs.length >= 5) {
    suggestion = '今天答错的比较多，但他坚持把题目过了一遍。可以肯定"坚持"这件事，不要纠结对错——错题本来就是用来练的。';
  } else {
    suggestion = '今天复习节奏正常。一句"我看到你在坚持"比"你真棒"更让孩子觉得被认真看见。';
  }

  res.json({
    date: briefDate,
    student: { name: user.name, grade: user.grade },
    reviewsToday: todayLogs.length,
    correctToday,
    newMistakesToday: todayMistakes,
    streak,
    highlight,
    weakChapter,
    suggestion,
  });
});

export default router;
