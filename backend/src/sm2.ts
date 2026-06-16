/**
 * SM-2 变种：3 档反馈（不会 / 一般 / 掌握），分别对应 quality = 1 / 3 / 5。
 * 参考 SuperMemo SM-2：https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-obtained-in-working-with-the-supermemo-method
 */

export type Quality = 1 | 3 | 5;

export interface SM2State {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
}

export interface SM2Result extends SM2State {
  nextReviewAt: Date;
}

const MIN_EF = 1.3;

export function applySM2(prev: SM2State, quality: Quality, now: Date = new Date()): SM2Result {
  let { easeFactor, intervalDays, repetitions } = prev;

  if (quality < 3) {
    repetitions = 0;
    intervalDays = 1;
  } else {
    if (repetitions === 0) {
      intervalDays = 1;
    } else if (repetitions === 1) {
      intervalDays = 3;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
    repetitions += 1;
  }

  // EF 更新：EF' = EF + (0.1 - (5-q)*(0.08 + (5-q)*0.02))
  const q = quality;
  easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (easeFactor < MIN_EF) easeFactor = MIN_EF;

  const next = new Date(now);
  next.setDate(next.getDate() + intervalDays);

  return {
    easeFactor,
    intervalDays,
    repetitions,
    nextReviewAt: next,
  };
}
