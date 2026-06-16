import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ERROR_TYPE_LABEL, Mistake, ReviewStats } from '../api';

export default function Review() {
  const [queue, setQueue] = useState<Mistake[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [idx, setIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  // 本轮复习开始后是否做过至少一道题（用于决定是否显示"分享给爸妈"）
  const [didAnyReview, setDidAnyReview] = useState(false);
  // 分享给爸妈的短链 modal 状态
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  function load() {
    setLoading(true);
    Promise.all([api.reviewQueue(50), api.reviewStats()])
      .then(([q, s]) => {
        setQueue(q);
        setStats(s);
        setIdx(0);
        setShowAnswer(false);
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  const current = queue[idx];

  async function answer(quality: 1 | 5) {
    if (!current) return;
    try {
      await api.reviewAnswer(current.id, quality);
      setShowAnswer(false);
      setDidAnyReview(true);
      if (idx + 1 >= queue.length) {
        load();
      } else {
        setIdx(idx + 1);
      }
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : '提交失败');
    }
  }

  async function openShare() {
    setShareLoading(true);
    setCopied(false);
    try {
      const { token } = await api.parentBriefShare();
      const url = `${window.location.origin}/p/${token}`;
      setShareUrl(url);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : '生成分享链接失败');
    } finally {
      setShareLoading(false);
    }
  }

  async function copyLink() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch {
      // ignore — 用户也可以手动复制
    }
  }

  if (loading) return <div className="center muted">加载中...</div>;

  return (
    <div>
      <h2>今日复习</h2>
      {stats && (
        <div className="card">
          <div className="row">
            <div><div className="muted">待复习</div><div style={{ fontSize: 22, fontWeight: 600 }}>{stats.dueNow}</div></div>
            <div><div className="muted">总错题</div><div style={{ fontSize: 22, fontWeight: 600 }}>{stats.total}</div></div>
            <div><div className="muted">已掌握</div><div style={{ fontSize: 22, fontWeight: 600 }}>{stats.mastered}</div></div>
          </div>
        </div>
      )}

      {err && <div className="error">{err}</div>}

      {!current ? (
        <div className="card center">
          <p>🎉 没有待复习的错题，做得不错！</p>
          <div className="btn-row" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/mistakes/new"><button>录入新错题</button></Link>
            {didAnyReview && (
              <button className="secondary" onClick={openShare} disabled={shareLoading}>
                {shareLoading ? '生成中…' : '📤 分享给爸妈'}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="muted" style={{ marginBottom: 8 }}>
            进度 {idx + 1} / {queue.length} · {current.subject?.name} · {ERROR_TYPE_LABEL[current.errorType]}
          </div>
          <div className="q-block"><strong>题目：</strong>{current.originalProblem}</div>

          {!showAnswer ? (
            <button onClick={() => setShowAnswer(true)}>显示答案</button>
          ) : (
            <>
              <div><span className="wrong">你当时写的：</span>{current.wrongAnswer}</div>
              <div><span className="correct">正确答案：</span>{current.correctAnswer}</div>
              {current.notes && <div className="muted" style={{ marginTop: 6 }}>笔记：{current.notes}</div>}

              <div className="btn-row">
                <button className="danger" onClick={() => answer(1)}>不会</button>
                <button onClick={() => answer(5)}>会</button>
              </div>
              <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>
                "会"连续 3 次后会移出复习队列。
              </p>
            </>
          )}
        </div>
      )}

      {shareUrl && (
        <div
          onClick={() => setShareUrl(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="card"
            style={{ maxWidth: 420, width: '100%' }}
          >
            <h3 style={{ marginTop: 0 }}>📨 分享给爸妈</h3>
            <p className="muted" style={{ marginTop: 4 }}>
              把下面这个链接发到家庭群，爸妈点开就能看到今天的学习简报（无需注册，48 小时内有效）。
            </p>
            <div
              style={{
                padding: 10, background: 'var(--bg-soft)', borderRadius: 8,
                fontSize: 12, wordBreak: 'break-all', marginTop: 10,
              }}
            >
              {shareUrl}
            </div>
            <div className="btn-row" style={{ marginTop: 12 }}>
              <button onClick={copyLink}>{copied ? '✅ 已复制' : '复制链接'}</button>
              <button className="secondary" onClick={() => setShareUrl(null)}>关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
