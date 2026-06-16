import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, Mistake, ReviewStats, Subject } from '../api';
import { useAuth } from '../auth';

const SUBJECT_STYLE: Record<string, { color: string; emoji: string }> = {
  MATH: { color: 'color-math', emoji: '🪐' },
  CHINESE: { color: 'color-chinese', emoji: '🌕' },
  ENGLISH: { color: 'color-english', emoji: '🌎' },
  PHYSICS: { color: 'color-physics', emoji: '🌑' },
  CHEMISTRY: { color: 'color-chemistry', emoji: '☄️' },
};

// 简单 SVG 折线图
function WeeklyChart({ data }: { data: number[] }) {
  const w = 280;
  const h = 110;
  const pad = 16;
  const max = Math.max(1, ...data);
  const step = (w - pad * 2) / Math.max(1, data.length - 1);
  const points = data
    .map((v, i) => {
      const x = pad + i * step;
      const y = h - pad - (v / max) * (h - pad * 2);
      return `${x},${y}`;
    })
    .join(' ');
  const area = `${pad},${h - pad} ${points} ${pad + (data.length - 1) * step},${h - pad}`;
  const labels = ['一', '二', '三', '四', '五', '六', '日'];
  return (
    <svg className="chart" viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#7c5cff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#7c5cff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#g1)" />
      <polyline points={points} fill="none" stroke="#7c5cff" strokeWidth="2" strokeLinejoin="round" />
      {data.map((v, i) => {
        const x = pad + i * step;
        const y = h - pad - (v / max) * (h - pad * 2);
        return <circle key={i} cx={x} cy={y} r="3" fill="#7c5cff" />;
      })}
      {labels.slice(0, data.length).map((lab, i) => (
        <text key={lab} x={pad + i * step} y={h - 2} fontSize="9" textAnchor="middle" fill="#9e98b8">{lab}</text>
      ))}
    </svg>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [queue, setQueue] = useState<Mistake[]>([]);

  useEffect(() => {
    api.subjects().then(setSubjects).catch(() => {});
    api.reviewStats().then(setStats).catch(() => {});
    api.reviewQueue(5).then(setQueue).catch(() => {});
  }, []);

  // 占位的"过去 7 天复习数"假数据，后续可由后端聚合
  const weekly = [3, 5, 4, 7, 6, 9, queue.length || 4];

  const total = stats?.total ?? 0;
  const mastered = stats?.mastered ?? 0;
  const due = stats?.dueNow ?? 0;
  const accuracy = total > 0 ? Math.round((mastered / total) * 100) : 0;
  const lvProgress = Math.min(100, mastered * 5 + 20);

  return (
    <div>
      <div className="hello">
        <div>
          <h1>Hi, {user?.name || '同学'} 🐼</h1>
          <div className="sub">今天的目标是不要忘记昨天学过的呀～</div>
        </div>
        <span className="pill">🔥 连续学习 12 天</span>
      </div>

      <div className="grid">
        <div className="col">
          {/* 数据卡 */}
          <div className="stat-row">
            <div className="stat">
              <div className="icon ic-purple">📅</div>
              <div>
                <div className="v">12<small style={{ fontSize: 12, marginLeft: 2 }}>天</small></div>
                <div className="l">连续打卡</div>
              </div>
            </div>
            <div className="stat">
              <div className="icon ic-blue">🎯</div>
              <div>
                <div className="v">{accuracy}<small style={{ fontSize: 12, marginLeft: 2 }}>%</small></div>
                <div className="l">掌握率</div>
              </div>
            </div>
            <div className="stat">
              <div className="icon ic-green">📈</div>
              <div>
                <div className="v">{total}</div>
                <div className="l">累计错题</div>
              </div>
            </div>
            <div className="stat">
              <div className="icon ic-orange">⏰</div>
              <div>
                <div className="v">{due}</div>
                <div className="l">今日待复习</div>
              </div>
            </div>
          </div>

          {/* 知识星球 */}
          <div className="card">
            <div className="section-title">
              <h3>🌌 知识星球</h3>
              <Link to="/knowledge" className="more">查看全部 →</Link>
            </div>
            <div className="planets">
              {subjects.length === 0
                ? Object.entries(SUBJECT_STYLE).map(([code, s]) => (
                    <div key={code} className={`planet ${s.color}`}>
                      <div className="ball" />
                      <div className="t">{code}</div>
                      <div className="p">--</div>
                    </div>
                  ))
                : subjects.map((sub) => {
                    const s = SUBJECT_STYLE[sub.code] || { color: '', emoji: '🪐' };
                    return (
                      <Link key={sub.id} to="/knowledge" className={`planet ${s.color}`}>
                        <div className="ball" />
                        <div className="t">{sub.name}</div>
                        <div className="p">{Math.floor(50 + Math.random() * 40)}%</div>
                      </Link>
                    );
                  })}
            </div>
          </div>

          {/* 推荐知识包 */}
          <div className="banner">
            <div className="text">
              <h4>推荐知识包：一元一次方程进阶</h4>
              <p>3 节微课 + 12 道典型例题，今晚 20 分钟搞定。</p>
            </div>
            <span className="mascot">🐲</span>
          </div>
        </div>

        <div className="col">
          {/* 知识度等级 */}
          <div className="level-card">
            <div className="head">
              <span className="mascot">🐉</span>
              <div>
                <div className="t">知识度</div>
                <div className="lv">Lv {Math.max(1, Math.floor(mastered / 3) + 1)}</div>
              </div>
            </div>
            <div className="bar"><div style={{ width: `${lvProgress}%` }} /></div>
            <div className="desc">再掌握 {Math.max(1, 5 - (mastered % 5))} 题即可升级</div>
          </div>

          {/* 今日训练任务 */}
          <div className="card">
            <div className="section-title">
              <h3>✨ 今日训练任务</h3>
              <Link to="/review" className="more">去复习 →</Link>
            </div>
            {queue.length === 0 ? (
              <div className="muted center" style={{ padding: '12px 0' }}>暂无待复习的错题 🎉</div>
            ) : (
              queue.slice(0, 4).map((m) => (
                <div key={m.id} className="task">
                  <span className="dot" />
                  <span className="t">{m.subject?.name} · {m.originalProblem.slice(0, 14)}{m.originalProblem.length > 14 ? '…' : ''}</span>
                  <span className="meta">{new Date(m.nextReviewAt).toLocaleDateString().slice(5)}</span>
                </div>
              ))
            )}
          </div>

          {/* 本周学习数据 */}
          <div className="card">
            <div className="section-title">
              <h3>📊 本周学习数据</h3>
            </div>
            <WeeklyChart data={weekly} />
          </div>
        </div>
      </div>
    </div>
  );
}
