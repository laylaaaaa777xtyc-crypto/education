import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './auth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Knowledge from './pages/Knowledge';
import Mistakes from './pages/Mistakes';
import AddMistake from './pages/AddMistake';
import Review from './pages/Review';
import Reports from './pages/Reports';
import Growth from './pages/Growth';
import Assessment from './pages/Assessment';
import ParentBrief from './pages/ParentBrief';

const ASSESSMENT_DONE_KEY = 'edu_assessment_done';

function Protected({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="center muted" style={{ padding: 40 }}>加载中...</div>;
  if (!user) return <Navigate to="/login" replace />;

  // 首次登录强制走完初始评估
  const assessmentDone = !!localStorage.getItem(ASSESSMENT_DONE_KEY);
  if (!assessmentDone && location.pathname !== '/assessment') {
    return <Navigate to="/assessment" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* 家长简报短链：无需登录，凭签名 token 访问 */}
      <Route path="/p/:token" element={<ParentBrief />} />
      <Route
        path="/assessment"
        element={
          <Protected>
            <Assessment />
          </Protected>
        }
      />
      <Route
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/knowledge" element={<Knowledge />} />
        <Route path="/mistakes" element={<Mistakes />} />
        <Route path="/mistakes/new" element={<AddMistake />} />
        <Route path="/review" element={<Review />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/growth" element={<Growth />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
