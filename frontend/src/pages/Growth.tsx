import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, GrowthSummary } from '../api';

function DailyBars({ daily }: { daily: GrowthSummary['daily'] }) {
  const w = 480;
  const h = 130;
  const padX = 12;
  const padTop = 10;
  const padBottom = 24;
  const max = Math.max(1, ...daily.map((d) => d.count));
  const innerW = w - padX * 2;
  const barW = (innerW / daily.length) * 0.6;
  const step = innerW / daily.length;

  return (
    <svg className="chart" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ height: 140 }}>
      <defs>
        <linearGradient id="growthBar" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#7c5cff" />
          <stop offset="100%" stopColor="#b9aeff" />
        </linearGradient>
      </defs>
      {daily.map((d, i) => {
        const innerH = h - padTop - padBottom;
        const barH = (d.count / max) * innerH;
        const x = padX + step * i + (step - barW) / 2;
        const y = h - padBottom - barH;
        const label = d.date.slice(5);
        return (
          <g key={d.date}>
            <rect x={x} y={y} width={barW} height={Math.max(2, barH)} rx={3} fill="url(#growthBar)" />
            {d.count > 0 && (
              <text x={x + barW / 2} y={y - 3} fontSize="9" textAnchor="middle" fill="#6b6489">
                {d.count}
              </text>
            )}
            {i % 2 === 0 && (
              <text x={x + barW / 2} y={h - 6} fontSize="9" textAnchor="middle" fill="#9e98b8">
                {label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function relTime(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return '刚刚';
  if (min < 60) return `${min} 分钟前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} 小时前`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} 天前`;
  return d.toLocaleDateString();
}

export default function Growth() {
  const [data, setData] = useState<GrowthSummary | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api
      .growthSummary()
      .then(setData)
      .catch((e) => setErr(e.message || '加载失败'));
  }, []);

  if (err) {
    return (
      <div>
        <h2 style={{ marginTop: 0 }}>成长记录</h2>
        <div className="card center" style={{ padding: 30 }}>{err}</div>
      </div>
    );
  }
  if (!data) {
    return (
      <div>
        <h2 style={{ marginTop: 0 }}>成长记录</h2>
        <div className="card center muted" style={{ padding: 30 }}>加载中…</div>
      </div>
    );
  }

  const earnedCount = data.badges.filter((b) => b.earned).length;

  return (
    <div>
      <div className="hello">
        <div>
          <h1>🏅 成长记录</h1>
          <div className="sub">每一次复习、每一道掌握，都在这里留下印记</div>
        </div>
        <span className="pill">🔥 连续学习 {data.streak} 天</span>
      </div>

      <div className="stat-row" style={{ marginBottom: 16 }}>
        <div className="stat">
          <div className="icon ic-orange">🔥</div>
          <div>
            <div className="v">{data.streak}<small style={{ fontSize: 12, marginLeft: 2 }}>天</small></div>
            <div className="l">连续打卡</div>
          </div>
        </div>
        <div className="stat">
          <div className="icon ic-purple">📅</div>
          <div>
            <div className="v">{data.totalDays}</div>
            <div className="l">累计学习日</div>
          </div>
        </div>
        <div className="stat">
          <div className="icon ic-blue">🔁</div>
          <div>
            <div className="v">{data.totalReviews}</div>
            <div className="l">累计复习</div>
          </div>
        </div>
        <div className="stat">
          <div className="icon ic-green">🏆</div>
          <div>
            <div className="v">{earnedCount}<small style={{ fontSize: 12, marginLeft: 2 }}>/{data.badges.length}</small></div>
            <div className="l">已获勋章</div>
          </div>
        </div>
      </div>

      <div className="grid">
        <div className="col">
          {/* 14 天活跃度 */}
          <div className="card">
            <div className="section-title">
              <h3>📈 最近 14 天复习量</h3>
              <Link to="/review" className="more">去复习 →</Link>
            </div>
            {data.totalReviews === 0 ? (
              <div className="muted center" style={{ padding: 20 }}>
                还没复习过，去复习页开始第一次吧 ✨
              </div>
            ) : (
              <DailyBars daily={data.daily} />
            )}
          </div>

          {/* 勋章墙 */}
          <div className="card">
            <div className="section-title">
              <h3>🏅 勋章墙</h3>
              <span className="muted">{earnedCount} / {data.badges.length}</span>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 12,
              }}
            >
              {data.badges.map((b) => (
                <div
                  key={b.code}
                  style={{
                    padding: 14,
                    borderRadius: 14,
                    background: b.earned ? 'linear-gradient(135deg, #ece6ff, #ffe3ee)' : '#f5f1fc',
                    border: '1px solid var(--border)',
                    opacity: b.earned ? 1 : 0.55,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 32, filter: b.earned ? 'none' : 'grayscale(0.7)' }}>
                    {b.emoji}
                  </div>
                  <div style={{ fontWeight: 600, marginTop: 4 }}>{b.label}</div>
                  <div className="muted" style={{ marginTop: 2 }}>{b.desc}</div>
                  {!b.earned && b.progress && (
                    <div className="muted" style={{ fontSize: 11, marginTop: 6 }}>
                      {b.progress.current} / {b.progress.target}
                    </div>
                  )}
                  {b.earned && (
                    <div style={{ fontSize: 11, color: 'var(--success)', marginTop: 6, fontWeight: 600 }}>
                      已获得
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col">
          {/* 各科掌握情况 */}
          <div className="card">
            <div className="section-title">
              <h3>📚 各科掌握情况</h3>
            </div>
            {data.masteredPerSubject.length === 0 ? (
              <div className="muted">暂无数据</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {data.masteredPerSubject.map((s) => (
                  <div
                    key={s.subjectId}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: 'var(--bg-soft)',
                      borderRadius: 10,
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{s.subjectName}</span>
                    <span className="muted">已掌握 {s.mastered} 题</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 学习时间线 */}
          <div className="card">
            <div className="section-title">
              <h3>📖 学习时间线</h3>
            </div>
            {data.timeline.length === 0 ? (
              <div className="muted">暂无记录</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {data.timeline.map((t, i) => {
                  const emoji =
                    t.type === 'join' ? '🎉' :
                    t.type === 'add' ? '📝' :
                    t.type === 'badge' ? '🏅' : '·';
                  return (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 16 }}>{emoji}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13 }}>{t.text}</div>
                        <div className="muted" style={{ fontSize: 11 }}>{relTime(t.at)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="banner">
            <div className="text">
              <h4>每天打卡，让连击 🔥 不断</h4>
              <p>错过一天就会断签哦～</p>
            </div>
            <span className="mascot">🐯</span>
          </div>
        </div>
      </div>
    </div>
  );
}
