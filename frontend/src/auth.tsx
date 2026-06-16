import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, getToken, setToken, User } from './api';

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (phone: string, password: string, name: string, grade: User['grade']) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      // dev 兜底：后端没起来时给一个假用户，方便直接看页面
      setUser({ id: 'dev', phone: '', name: '小明', grade: 'G7' });
      setLoading(false);
      return;
    }
    api.me()
      .then(setUser)
      .catch(() => {
        setToken(null);
        setUser({ id: 'dev', phone: '', name: '小明', grade: 'G7' });
      })
      .finally(() => setLoading(false));
  }, []);

  const login: AuthCtx['login'] = async (phone, password) => {
    const { token, user } = await api.login({ phone, password });
    setToken(token);
    setUser(user);
  };
  const register: AuthCtx['register'] = async (phone, password, name, grade) => {
    const { token, user } = await api.register({ phone, password, name, grade });
    setToken(token);
    setUser(user);
  };
  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return <Ctx.Provider value={{ user, loading, login, register, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth outside AuthProvider');
  return v;
}
