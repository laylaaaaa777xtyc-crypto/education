const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
const TOKEN_KEY = 'edu_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(t: string | null) {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  if (res.status === 401) {
    setToken(null);
    throw new Error('未登录或登录已过期');
  }
  if (!res.ok) {
    let msg = `请求失败 (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) msg = typeof body.error === 'string' ? body.error : JSON.stringify(body.error);
    } catch {}
    throw new Error(msg);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export type Grade = 'G7' | 'G8' | 'G9';
export const GRADE_LABEL: Record<Grade, string> = { G7: '初一', G8: '初二', G9: '初三' };

export type ErrorType = 'CONCEPT' | 'CALCULATION' | 'MISREAD' | 'METHOD' | 'CARELESS' | 'OTHER';
export const ERROR_TYPE_LABEL: Record<ErrorType, string> = {
  CONCEPT: '概念不清',
  CALCULATION: '计算错误',
  MISREAD: '审题错误',
  METHOD: '方法错误',
  CARELESS: '粗心',
  OTHER: '其他',
};

export interface User { id: string; phone: string; name: string; grade: Grade; }
export interface Subject { id: string; code: string; name: string; }
export interface Example { question: string; answer: string; explanation?: string; }
export interface KnowledgePoint {
  id: string; subjectId: string; grade: Grade; chapter: string;
  title: string; summary: string; examples: Example[]; subject?: Subject;
}
export interface Mistake {
  id: string; userId: string; subjectId: string; knowledgePointId: string | null;
  originalProblem: string; wrongAnswer: string; correctAnswer: string;
  errorType: ErrorType; source: string | null; notes: string | null;
  status: 'ACTIVE' | 'MASTERED';
  easeFactor: number; intervalDays: number; repetitions: number;
  nextReviewAt: string; lastReviewedAt: string | null;
  createdAt: string; updatedAt: string;
  subject?: Subject; knowledgePoint?: KnowledgePoint | null;
}
export interface ReviewStats { dueNow: number; total: number; mastered: number; }

export interface WeaknessSubject {
  subjectId: string; subjectCode: string; subjectName: string;
  total: number; active: number; mastered: number; masteryRate: number;
}
export interface WeaknessErrorType { code: ErrorType; label: string; total: number; active: number; }
export interface WeaknessChapter {
  subjectId: string; subjectName: string; chapter: string; active: number; total: number;
}
export interface WeaknessReport {
  total: number; active: number; mastered: number; masteryRate: number;
  bySubject: WeaknessSubject[];
  byErrorType: WeaknessErrorType[];
  topWeakChapters: WeaknessChapter[];
  suggestions: string[];
}

export interface BadgeProgress { current: number; target: number; }
export interface Badge {
  code: string; label: string; emoji: string; desc: string;
  earned: boolean; progress?: BadgeProgress;
}
export interface DailyCount { date: string; count: number; }
export interface TimelineItem { at: string; type: string; text: string; }
export interface MasteredPerSubject {
  subjectId: string; subjectCode: string; subjectName: string; mastered: number;
}
export interface GrowthSummary {
  streak: number; totalDays: number;
  totalMistakes: number; totalReviews: number; mastered: number;
  daily: DailyCount[];
  masteredPerSubject: MasteredPerSubject[];
  badges: Badge[];
  timeline: TimelineItem[];
}

export interface ParentBriefShare {
  token: string;
  date: string;
  expiresInHours: number;
}
export interface ParentBriefData {
  date: string;
  student: { name: string; grade: Grade };
  reviewsToday: number;
  correctToday: number;
  newMistakesToday: number;
  streak: number;
  highlight: string;
  weakChapter: string;
  suggestion: string;
}

export const api = {
  register: (body: { phone: string; password: string; name: string; grade: Grade }) =>
    request<{ token: string; user: User }>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: { phone: string; password: string }) =>
    request<{ token: string; user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request<User>('/auth/me'),

  subjects: () => request<Subject[]>('/subjects'),

  knowledge: (params: { subjectId?: string; grade?: Grade; chapter?: string } = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => !!v) as [string, string][],
    ).toString();
    return request<KnowledgePoint[]>(`/knowledge${qs ? `?${qs}` : ''}`);
  },
  chapters: (subjectId: string, grade?: Grade) => {
    const qs = new URLSearchParams({ subjectId, ...(grade ? { grade } : {}) }).toString();
    return request<string[]>(`/knowledge/chapters?${qs}`);
  },

  listMistakes: (params: { subjectId?: string; errorType?: ErrorType; status?: 'ACTIVE' | 'MASTERED' } = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => !!v) as [string, string][],
    ).toString();
    return request<Mistake[]>(`/mistakes${qs ? `?${qs}` : ''}`);
  },
  createMistake: (body: Omit<Mistake, 'id' | 'userId' | 'status' | 'easeFactor' | 'intervalDays' | 'repetitions' | 'nextReviewAt' | 'lastReviewedAt' | 'createdAt' | 'updatedAt' | 'subject' | 'knowledgePoint'>) =>
    request<Mistake>('/mistakes', { method: 'POST', body: JSON.stringify(body) }),
  deleteMistake: (id: string) =>
    request<void>(`/mistakes/${id}`, { method: 'DELETE' }),

  reviewQueue: (limit = 20) => request<Mistake[]>(`/review/queue?limit=${limit}`),
  // 简化为 2 档反馈：1=不会, 5=会。
  // SM-2 算法本身仍能接受 3（一般），但前端不再产生这个值。
  reviewAnswer: (id: string, quality: 1 | 5) =>
    request<Mistake>(`/review/${id}`, { method: 'POST', body: JSON.stringify({ quality }) }),
  reviewStats: () => request<ReviewStats>('/review/stats'),

  weaknessReport: () => request<WeaknessReport>('/reports/weakness'),
  growthSummary: () => request<GrowthSummary>('/growth/summary'),

  // 家长简报：分享按钮调用 share，无登录页面调用 view
  parentBriefShare: () =>
    request<ParentBriefShare>('/parentBrief/share', { method: 'POST' }),
  parentBriefView: (token: string) =>
    request<ParentBriefData>(`/parentBrief/view/${token}`),
};
