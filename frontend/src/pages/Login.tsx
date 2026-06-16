import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';

const PHONE_RE = /^1[3-9]\d{9}$/;

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr('');
    if (!PHONE_RE.test(phone)) {
      setErr('请输入有效的 11 位手机号');
      return;
    }
    setLoading(true);
    try {
      await login(phone, password);
      nav('/dashboard');
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : '登录失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 20 }}>
      <div className="card" style={{ width: '100%', maxWidth: 380, padding: 28 }}>
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div style={{ fontSize: 36 }}>🪐</div>
          <h2 style={{ margin: '8px 0 0' }}>知识星语</h2>
          <div className="muted">登录开启今日的学习冒险</div>
        </div>
        <form onSubmit={onSubmit}>
          <label>
            <span>手机号</span>
            <input
              type="tel"
              required
              inputMode="numeric"
              maxLength={11}
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="请输入 11 位手机号"
            />
          </label>
          <label>
            <span>密码</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {err && <div className="error">{err}</div>}
          <button type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
        <p className="muted center" style={{ marginTop: 16 }}>
          还没有账号？<Link to="/register">注册</Link>
        </p>
      </div>
    </div>
  );
}
