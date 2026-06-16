import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, WeaknessReport } from '../api';

const SUBJECT_COLOR: Record<string, string> = {
  MATH: '#5fa7ff',
  CHINESE: '#ff7a59',
  ENGLISH: '#7c5cff',
  PHYSICS: '#4dd2a8',
  CHEMISTRY: '#ffa94d',
};

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const w = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div style={{ background: '#f1ecfb', borderRadius: 6, height: 8, overflow: 'hidden' }}>
      <div style={{ width: `${w}%`, background: color, height: '100%', borderRadius: 6 }} />
    </div>
  );
}

export default function Reports() {
  const [data, setData] = useState<WeaknessReport | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api
      .weaknessReport()
      .then(setData)
      .catch((e) => setErr(e.message || '加载失败'));
  }, []);

  if (err) {
    return (
      <div>
        <h2 style={{ marginTop: 0 }}>学习报告</h2>
        <div className="card center" style={{ padding: 30 }}>{err}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <h2 style={{ marginTop: 0 }}>学习报告</h2>
        <div className="card center muted" style={{ padding: 30 }}>加载中…</div>
      </div>
    );
  }

  if (data.total === 0) {
    return (
      <div>
        <h2 style={{ marginTop: 0 }}>学习报告</h2>
        <div className="card center" style={{ padding: 40 }}>
          <div style={{ fontSize: 48 }}>📊</div>
          <h3>还没有错题数据</h3>
          <p className="muted">先录入几道错题，再来这里看薄弱点分析。</p>
          <Link to="/mistakes/new" className="btn primary" style={{ marginTop: 12, display: 'inline-block' }}>
            去录入错题
          </Link>
        </div>
      </div>
    );
  }

  const maxSubjectActive = Math.max(1, ...data.bySubject.map((s) => s.active));
  const maxErrorActive = Math.max(1, ...data.byErrorType.map((e) => e.active));
  const maxChapter = Math.max(1, ...data.topWeakChapters.map((c) => c.active));

  return (
    <div>
      <div className="hello">
        <div>
          <h1>📊 学习报告</h1>
          <div className="sub">按学科 × 章节 × 错误类型聚合，找出你的薄弱点</div>
        </div>
      </div>

      {/* 顶部数据卡 */}
      <div className="stat-row" style={{ marginBottom: 16 }}>
        <div className="stat">
          <div className="icon ic-purple">📚</div>
          <div>
            <div className="v">{data.total}</div>
            <div className="l">累计错题</div>
          </div>
        </div>
        <div className="stat">
          <div className="icon ic-orange">🔥</div>
          <div>
            <div className="v">{data.active}</div>
            <div className="l">未掌握</div>
          </div>
        </div>
        <div className="stat">
          <div className="icon ic-green">✅</div>
          <div>
            <div className="v">{data.mastered}</div>
            <div className="l">已掌握</div>
          </div>
        </div>
        <div className="stat">
          <div className="icon ic-blue">🎯</div>
          <div>
            <div className="v">{data.masteryRate}<small style={{ fontSize: 12, marginLeft: 2 }}>%</small></div>
            <div className="l">掌握率</div>
          </div>
        </div>
      </div>

      {/* 建议 */}
      {data.suggestions.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3>💡 给你的建议</h3>
          <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.9 }}>
            {data.suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid">
        <div className="col">
          {/* 各学科分布 */}
          <div className="card">
            <div className="section-title">
              <h3>📚 各学科错题分布</h3>
            </div>
            {data.bySubject.length === 0 ? (
              <div className="muted">暂无数据</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {data.bySubject.map((s) => (
                  <div key={s.subjectId}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 600 }}>{s.subjectName}</span>
                      <span className="muted">
                        未掌握 {s.active} / 共 {s.total}（掌握 {s.masteryRate}%）
                      </span>
                    </div>
                    <Bar value={s.active} max={maxSubjectActive} color={SUBJECT_COLOR[s.subjectCode] || '#7c5cff'} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 薄弱章节 */}
          <div className="card">
            <div className="section-title">
              <h3>🎯 重点关注章节（按未掌握数）</h3>
              <Link to="/knowledge" className="more">去复习 →</Link>
            </div>
            {data.topWeakChapters.length === 0 ? (
              <div className="muted center" style={{ padding: 12 }}>暂无薄弱章节 🎉</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {data.topWeakChapters.map((c) => (
                  <div
                    key={`${c.subjectId}_${c.chapter}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: 'var(--bg-soft)',
                      borderRadius: 10,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{c.chapter}</div>
                      <div className="muted">{c.subjectName} · 共 {c.total} 题</div>
                    </div>
                    <div style={{ minWidth: 120 }}>
                      <Bar value={c.active} max={maxChapter} color="#ef4d6b" />
                      <div className="muted" style={{ fontSize: 11, marginTop: 4, textAlign: 'right' }}>
                        未掌握 {c.active}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="col">
          {/* 错误类型 */}
          <div className="card">
            <div className="section-title">
              <h3>🧩 错误类型分布</h3>
            </div>
            {data.byErrorType.length === 0 ? (
              <div className="muted">暂无数据</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {data.byErrorType.map((e) => (
                  <div key={e.code}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 600 }}>{e.label}</span>
                      <span className="muted">未掌握 {e.active} / 共 {e.total}</span>
                    </div>
                    <Bar value={e.active} max={maxErrorActive} color="#7c5cff" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="banner">
            <div className="text">
              <h4>每天 15 分钟，专攻薄弱章节</h4>
              <p>系统会按 SM-2 算法把错题安排回复习队列，坚持就是赢。</p>
            </div>
            <span className="mascot">🦊</span>
          </div>
        </div>
      </div>
    </div>
  );
}
