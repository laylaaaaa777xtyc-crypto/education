import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { Grade, GRADE_LABEL } from '../api';

const PHONE_RE = /^1[3-9]\d{9}$/;

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: '',
    grade: 'G7' as Grade,
    phone: '',
    password: '',
  });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr('');
    if (!PHONE_RE.test(form.phone)) {
      setErr('请输入有效的 11 位手机号');
      return;
    }
    if (form.password.length < 6) {
      setErr('密码至少 6 位');
      return;
    }
    setLoading(true);
    try {
      await register(form.phone, form.password, form.name, form.grade);
      nav('/dashboard');
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : '注册失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 20 }}>
      <div className="card" style={{ width: '100%', maxWidth: 380, padding: 28 }}>
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div style={{ fontSize: 36 }}>🐉</div>
          <h2 style={{ margin: '8px 0 0' }}>加入知识星语</h2>
          <div className="muted">开启你的错题冒险</div>
        </div>
        <form onSubmit={onSubmit}>
          <label>
            <span>昵称</span>
            <input
              required
              maxLength={20}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="给自己起个名字"
            />
          </label>
          <label>
            <span>年级</span>
            <select
              value={form.grade}
              onChange={(e) => setForm({ ...form, grade: e.target.value as Grade })}
            >
              {(['G7', 'G8', 'G9'] as Grade[]).map((g) => (
                <option key={g} value={g}>{GRADE_LABEL[g]}</option>
              ))}
            </select>
          </label>
          <label>
            <span>手机号</span>
            <input
              type="tel"
              required
              inputMode="numeric"
              maxLength={11}
              autoComplete="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
              placeholder="请输入 11 位手机号"
            />
          </label>
          <label>
            <span>密码（不少于 6 位）</span>
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>
          {err && <div className="error">{err}</div>}
          <button type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? '提交中...' : '注册'}
          </button>
        </form>
        <p className="muted center" style={{ marginTop: 16 }}>
          已有账号？<Link to="/login">去登录</Link>
        </p>
      </div>
    </div>
  );
}
