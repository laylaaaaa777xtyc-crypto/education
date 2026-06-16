import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth';

const NAV = [
  { to: '/dashboard', label: '首页', icon: '🏠' },
  { to: '/knowledge', label: '知识星球', icon: '🪐' },
  { to: '/mistakes', label: '错题本', icon: '📒' },
  { to: '/review', label: '今日复习', icon: '✨' },
  { to: '/reports', label: '学习报告', icon: '📊' },
  { to: '/growth', label: '成长记录', icon: '🏅' },
];

export default function Layout() {
  const { user } = useAuth();
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <span className="logo">🪐</span>
          <div>
            <div>知识星语</div>
            <div className="sub">Knowledge Galaxy</div>
          </div>
        </div>
        <nav>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => (isActive ? 'active' : '')}>
              <span className="ic">{n.icon}</span>
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="pet">
          <span className="avatar">🐉</span>
          <div>
            <div className="name">
              {user?.name || '同学'}
              <span className="lv">Lv.12</span>
            </div>
            <div className="desc">今天也要加油哦～</div>
          </div>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
