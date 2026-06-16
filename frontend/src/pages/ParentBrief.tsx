import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, GRADE_LABEL, ParentBriefData } from '../api';

export default function ParentBrief() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<ParentBriefData | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!token) return;
    api.parentBriefView(token).then(setData).catch((e) => setErr(e.message || '加载失败'));
  }, [token]);

  if (err) {
    return (
      <div style={wrapStyle}>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>链接无法打开</h2>
          <p className="muted">{err}</p>
          <p className="muted" style={{ fontSize: 13 }}>
            可能原因：链接已超过 48 小时有效期，或被复制时少了字符。可以让孩子在 App 里重新分享一次。
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={wrapStyle}>
        <div style={cardStyle}>加载中…</div>
      </div>
    );
  }

  return (
    <div style={wrapStyle}>
      <div style={{ ...cardStyle, padding: 24 }}>
        <div style={{ color: '#9e98b8', fontSize: 13 }}>{data.date} · 今日简报</div>
        <h1 style={{ margin: '4px 0 16px' }}>
          {data.student.name} <span style={{ color: '#9e98b8', fontSize: 16 }}>· {GRADE_LABEL[data.student.grade]}</span>
        </h1>

        <div style={highlightStyle}>
          <div style={{ fontSize: 13, color: '#6b6489', marginBottom: 4 }}>✨ 今日亮点</div>
          <div style={{ fontSize: 18, lineHeight: 1.6 }}>{data.highlight}</div>
        </div>

        <div style={statRowStyle}>
          <div style={statStyle}>
            <div style={statValueStyle}>{data.reviewsToday}</div>
            <div style={statLabelStyle}>今日复习</div>
          </div>
          <div style={statStyle}>
            <div style={statValueStyle}>{data.newMistakesToday}</div>
            <div style={statLabelStyle}>今日新录入</div>
          </div>
          <div style={statStyle}>
            <div style={statValueStyle}>🔥 {data.streak}</div>
            <div style={statLabelStyle}>连续打卡天</div>
          </div>
        </div>

        <Section title="📍 这段时间最需要关注的">
          <p style={{ margin: 0, lineHeight: 1.7 }}>{data.weakChapter}</p>
        </Section>

        <Section title="💬 给您的一句话">
          <p style={{ margin: 0, lineHeight: 1.7 }}>{data.suggestion}</p>
        </Section>

        <div style={footerStyle}>
          每天 1 分钟，看孩子今天具体在哪里进步。<br />
          这份简报不评分、不排名，只把您看不到的努力呈现出来。
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ fontSize: 13, color: '#6b6489', marginBottom: 6 }}>{title}</div>
      <div
        style={{
          background: '#f7f4ff',
          borderRadius: 10,
          padding: 14,
          color: '#3d3567',
        }}
      >
        {children}
      </div>
    </div>
  );
}

const wrapStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(180deg, #ece6ff 0%, #ffe3ee 100%)',
  padding: '20px 12px',
  display: 'flex',
  justifyContent: 'center',
};
const cardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 16,
  padding: 20,
  maxWidth: 480,
  width: '100%',
  boxShadow: '0 4px 24px rgba(124, 92, 255, 0.12)',
};
const highlightStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #ece6ff, #ffe3ee)',
  padding: 16,
  borderRadius: 12,
  marginBottom: 16,
};
const statRowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 10,
  marginBottom: 16,
};
const statStyle: React.CSSProperties = {
  background: '#f5f1fc',
  padding: 12,
  borderRadius: 10,
  textAlign: 'center',
};
const statValueStyle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 600,
  color: '#3d3567',
};
const statLabelStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#9e98b8',
  marginTop: 2,
};
const footerStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#9e98b8',
  textAlign: 'center',
  marginTop: 20,
  paddingTop: 16,
  borderTop: '1px solid #ece6ff',
  lineHeight: 1.6,
};
