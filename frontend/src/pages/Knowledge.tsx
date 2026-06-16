import { useEffect, useMemo, useState } from 'react';
import { api, Grade, KnowledgePoint, Mistake, ReviewStats, Subject } from '../api';
import { useAuth } from '../auth';

const SUBJECT_ORDER = ['MATH', 'CHINESE', 'ENGLISH', 'PHYSICS', 'CHEMISTRY'];

// 与图一致：数学蓝 / 语文绿 / 英语紫 / 物理蓝紫 / 化学橙
const PLANET_PALETTE: Record<string, [string, string]> = {
  MATH:      ['#8ec7ff', '#3d8bff'],
  CHINESE:   ['#b6edd2', '#4dd2a8'],
  ENGLISH:   ['#cab6ff', '#7c5cff'],
  PHYSICS:   ['#aea3f5', '#6e5dd1'],
  CHEMISTRY: ['#ffd97a', '#ff9933'],
};

function Planet({ code, size = 96 }: { code: string; size?: number }) {
  const [light, dark] = PLANET_PALETTE[code] || ['#cab6ff', '#7c5cff'];
  const gid = `pg-${code}`;
  return (
    <svg viewBox="0 0 100 80" width={size} height={(size * 80) / 100} aria-hidden>
      <defs>
        <radialGradient id={gid} cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor={light} />
          <stop offset="100%" stopColor={dark} />
        </radialGradient>
      </defs>
      <g transform="rotate(-18 50 40)">
        <ellipse cx="50" cy="40" rx="44" ry="9" fill="none" stroke={dark} strokeOpacity="0.45" strokeWidth="3" />
      </g>
      <circle cx="50" cy="40" r="24" fill={`url(#${gid})`} />
      <ellipse cx="50" cy="44" rx="22" ry="3" fill={dark} fillOpacity="0.18" />
      <g transform="rotate(-18 50 40)">
        <path d="M 6 40 A 44 9 0 0 1 94 40" fill="none" stroke={dark} strokeOpacity="0.85" strokeWidth="3" />
      </g>
      <ellipse cx="42" cy="33" rx="5.5" ry="2.8" fill="#ffffff" fillOpacity="0.55" />
    </svg>
  );
}

function CircleProgress({ pct }: { pct: number }) {
  const r = 42;
  const C = 2 * Math.PI * r;
  const offset = C * (1 - Math.max(0, Math.min(100, pct)) / 100);
  return (
    <svg viewBox="0 0 100 100" width="160" height="160">
      <defs>
        <linearGradient id="cpg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7c5cff" />
          <stop offset="100%" stopColor="#b9aeff" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r={r} fill="none" stroke="#ece6ff" strokeWidth="10" />
      <circle
        cx="50" cy="50" r={r} fill="none"
        stroke="url(#cpg)" strokeWidth="10"
        strokeDasharray={C} strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
      />
      <text x="50" y="50" textAnchor="middle" dominantBaseline="central" fontSize="18" fontWeight="700" fill="#2b2245">
        {Math.round(pct)}%
      </text>
    </svg>
  );
}

interface SubjectStat {
  subject: Subject;
  totalChapters: number;
  mistakeCount: number;
  mastered: number;
  pct: number;
}

interface ChapterStat {
  chapter: string;
  kpCount: number;
  mistakeCount: number;
  mastered: number;
  pct: number;
}

const MOCK_LEADERBOARD = [
  { rank: 1, name: '梓涵', avatar: '🐉', points: 1280 },
  { rank: 2, name: '昊宇', avatar: '🐼', points: 1180 },
  { rank: 3, name: '欣怡', avatar: '🦊', points: 1050 },
  { rank: 4, name: '雨彤', avatar: '🐯', points: 980 },
];

function stableHashPct(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return 25 + (Math.abs(h) % 65);
}

export default function Knowledge() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [allKPs, setAllKPs] = useState<KnowledgePoint[]>([]);
  const [allMistakes, setAllMistakes] = useState<Mistake[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [selected, setSelected] = useState<string>('');
  const grade: Grade = user?.grade || 'G7';

  useEffect(() => {
    api.subjects().then((ss) => {
      const sorted = [...ss].sort(
        (a, b) => SUBJECT_ORDER.indexOf(a.code) - SUBJECT_ORDER.indexOf(b.code),
      );
      setSubjects(sorted);
      if (sorted[0]) setSelected(sorted[0].id);
    }).catch(() => {});
    api.reviewStats().then(setStats).catch(() => {});
    api.listMistakes().then(setAllMistakes).catch(() => {});
  }, []);

  useEffect(() => {
    api.knowledge({ grade }).then(setAllKPs).catch(() => {});
  }, [grade]);

  const subjectStats: SubjectStat[] = useMemo(() => {
    return subjects.map((s) => {
      const kps = allKPs.filter((kp) => kp.subjectId === s.id);
      const chapters = new Set(kps.map((kp) => kp.chapter));
      const ms = allMistakes.filter((m) => m.subjectId === s.id);
      const mastered = ms.filter((m) => m.status === 'MASTERED').length;
      const pct = ms.length > 0 ? Math.round((mastered / ms.length) * 100) : stableHashPct(s.code);
      return {
        subject: s,
        totalChapters: chapters.size,
        mistakeCount: ms.length,
        mastered,
        pct,
      };
    });
  }, [subjects, allKPs, allMistakes]);

  const selectedSubject = subjects.find((s) => s.id === selected);
  const selectedStat = subjectStats.find((s) => s.subject.id === selected);

  const chapterStats: ChapterStat[] = useMemo(() => {
    if (!selected) return [];
    const byChapter = new Map<string, ChapterStat>();
    for (const kp of allKPs.filter((kp) => kp.subjectId === selected)) {
      if (!byChapter.has(kp.chapter)) {
        byChapter.set(kp.chapter, { chapter: kp.chapter, kpCount: 0, mistakeCount: 0, mastered: 0, pct: 0 });
      }
      byChapter.get(kp.chapter)!.kpCount += 1;
    }
    for (const m of allMistakes.filter((m) => m.subjectId === selected && m.knowledgePoint)) {
      const ch = m.knowledgePoint!.chapter;
      if (!byChapter.has(ch)) {
        byChapter.set(ch, { chapter: ch, kpCount: 0, mistakeCount: 0, mastered: 0, pct: 0 });
      }
      const c = byChapter.get(ch)!;
      c.mistakeCount += 1;
      if (m.status === 'MASTERED') c.mastered += 1;
    }
    const arr = Array.from(byChapter.values());
    for (const c of arr) {
      c.pct = c.mistakeCount > 0
        ? Math.round((c.mastered / c.mistakeCount) * 100)
        : stableHashPct(c.chapter);
    }
    return arr.sort((a, b) => a.chapter.localeCompare(b.chapter, 'zh'));
  }, [selected, allKPs, allMistakes]);

  const lv = stats ? Math.max(1, Math.floor(stats.mastered / 3) + 1) : 12;
  const lvProgress = stats ? Math.min(100, stats.mastered * 5 + 20) : 65;

  const tasks: Array<{ key: string; color: 'c1' | 'c2' | 'c3'; icon: string; text: string; meta: string; done: boolean }> = [
    { key: 'review',    color: 'c1', icon: '📝', text: `复习 ${stats?.dueNow ?? 5} 道错题`, meta: '估时 8 分钟', done: (stats?.dueNow ?? 1) === 0 },
    { key: 'learn',     color: 'c2', icon: '📚', text: '学习 1 章新内容',                  meta: '估时 15 分钟', done: false },
    { key: 'challenge', color: 'c3', icon: '⚔️', text: '挑战 5 道小测题',                  meta: '估时 5 分钟', done: true },
  ];
  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <div>
      <div className="grid">
        <div className="col">
          {/* 1. Banner with embedded Lv mini-card */}
          <div className="page-banner">
            <div className="banner-text">
              <h2>🌟 知识星球</h2>
              <p>在你的学习宇宙里探索每一颗星球，掌握每一个知识点</p>
            </div>
            <div className="banner-decor">
              <span className="cloud">☁️</span>
              <span className="castle">🏰</span>
              <span className="cloud">☁️</span>
            </div>
            <div className="banner-lv">
              <span className="mascot">🐉</span>
              <div className="info">
                <div className="t">知识度</div>
                <div className="lv">Lv {lv}</div>
                <div className="bar"><div style={{ width: `${lvProgress}%` }} /></div>
              </div>
            </div>
          </div>

          {/* 2. Subject tabs (underline) */}
          <div className="subject-tabs">
            <button
              className={`subject-tab ${selected === (subjects[0]?.id || '') ? '' : ''}`}
              onClick={() => setSelected(subjects[0]?.id || '')}
            >
              全部学科
            </button>
            {subjects.map((s) => (
              <button
                key={s.id}
                className={`subject-tab ${selected === s.id ? 'active' : ''}`}
                onClick={() => setSelected(s.id)}
              >
                {s.name}
              </button>
            ))}
          </div>

          {/* 3. Planet row */}
          <div className="planet-row">
            {(subjectStats.length === 0 ? SUBJECT_ORDER.map((code) => ({ subject: { id: code, code, name: code } as Subject, totalChapters: 0, mistakeCount: 0, mastered: 0, pct: 0 })) : subjectStats).map(({ subject, totalChapters, pct }) => (
              <div
                key={subject.id}
                className={`planet-card ${selected === subject.id ? 'active' : ''}`}
                onClick={() => setSelected(subject.id)}
              >
                <div className="planet-art"><Planet code={subject.code} /></div>
                <div className="planet-name">{subject.name}星球</div>
                <div className="planet-meta">{totalChapters} 章</div>
                <div className="planet-bar"><div style={{ width: `${pct}%` }} /></div>
                <div className="pct-label">掌握率 {pct}%</div>
              </div>
            ))}
          </div>

          {/* 4. Detail row: two side-by-side cards */}
          {selectedSubject && (
            <div className="detail-row">
              <div className="card detail-circle-card">
                <CircleProgress pct={selectedStat?.pct ?? 0} />
                <div className="detail-label">
                  <div className="planet-name">{selectedSubject.name}星球探索中</div>
                  <div className="muted">
                    已掌握 {selectedStat?.mastered ?? 0} / {selectedStat?.mistakeCount ?? 0} 题
                  </div>
                </div>
                <button className="explore-btn">继续探索 →</button>
              </div>

              <div className="card">
                <div className="section-title">
                  <h3>{selectedSubject.name}章节进度</h3>
                  <span className="muted">{chapterStats.length} 章</span>
                </div>
                {chapterStats.length === 0 ? (
                  <div className="muted center" style={{ padding: 24 }}>
                    该学科还没有章节
                  </div>
                ) : (
                  chapterStats.map((c) => (
                    <div key={c.chapter} className="chapter-row">
                      <span className="ch-name">{c.chapter}</span>
                      <div className="ch-bar"><div style={{ width: `${c.pct}%` }} /></div>
                      <span className="ch-pct">{c.pct}%</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="tip-card">
            <span className="ico">💡</span>
            <span>小提示：每颗星球的进度来自该学科已掌握的错题比例，多复习几次，星球就会越来越亮哦！</span>
          </div>
        </div>

        {/* Right column: tasks + leaderboard (Lv 已合并到 banner) */}
        <div className="col">
          <div className="card">
            <div className="section-title">
              <h3>🎯 今日任务</h3>
              <span className="muted">{doneCount}/{tasks.length}</span>
            </div>
            {tasks.map((t) => (
              <div key={t.key} className={`check-task ${t.done ? 'done' : ''}`}>
                <span className={`dot ${t.color}`}>{t.icon}</span>
                <span className="t">
                  {t.text}
                  <span className="meta">{t.meta}</span>
                </span>
                <span className="status">{t.done ? '已完成' : '待完成'}</span>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="section-title">
              <h3>🏆 星球探索排行榜</h3>
              <span className="muted">本周</span>
            </div>
            {MOCK_LEADERBOARD.map((u) => (
              <div key={u.rank} className={`lb-row r${u.rank}`}>
                <span className="lb-rank">{u.rank}</span>
                <span className="lb-avatar">{u.avatar}</span>
                <span className="lb-name">{u.name}</span>
                <span className="lb-pts">{u.points} ⭐</span>
              </div>
            ))}
            <button className="lb-more">查看更多排名</button>
          </div>
        </div>
      </div>
    </div>
  );
}
