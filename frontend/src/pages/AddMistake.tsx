import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ERROR_TYPE_LABEL, ErrorType, Grade, GRADE_LABEL, KnowledgePoint, Subject } from '../api';
import { useAuth } from '../auth';

export default function AddMistake() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [kpList, setKpList] = useState<KnowledgePoint[]>([]);
  const [form, setForm] = useState({
    subjectId: '',
    knowledgePointId: '',
    grade: (user?.grade || 'G7') as Grade,
    originalProblem: '',
    wrongAnswer: '',
    correctAnswer: '',
    errorType: 'CONCEPT' as ErrorType,
    source: '',
    notes: '',
  });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.subjects().then((ss) => {
      setSubjects(ss);
      if (ss[0]) setForm((f) => ({ ...f, subjectId: ss[0].id }));
    });
  }, []);

  useEffect(() => {
    if (!form.subjectId) return;
    api.knowledge({ subjectId: form.subjectId, grade: form.grade }).then(setKpList);
    setForm((f) => ({ ...f, knowledgePointId: '' }));
  }, [form.subjectId, form.grade]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await api.createMistake({
        subjectId: form.subjectId,
        knowledgePointId: form.knowledgePointId || null,
        originalProblem: form.originalProblem,
        wrongAnswer: form.wrongAnswer,
        correctAnswer: form.correctAnswer,
        errorType: form.errorType,
        source: form.source || null,
        notes: form.notes || null,
      });
      nav('/mistakes');
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : '保存失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>录入错题</h2>
      <form onSubmit={onSubmit} className="card">
        <div className="row">
          <label>
            <span>学科</span>
            <select required value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })}>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          <label>
            <span>年级</span>
            <select value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value as Grade })}>
              {(['G7', 'G8', 'G9'] as Grade[]).map((g) => (
                <option key={g} value={g}>{GRADE_LABEL[g]}</option>
              ))}
            </select>
          </label>
        </div>

        <label>
          <span>关联知识点（可选）</span>
          <select value={form.knowledgePointId} onChange={(e) => setForm({ ...form, knowledgePointId: e.target.value })}>
            <option value="">不关联</option>
            {kpList.map((kp) => (
              <option key={kp.id} value={kp.id}>{kp.chapter} · {kp.title}</option>
            ))}
          </select>
        </label>

        <label>
          <span>原题</span>
          <textarea required value={form.originalProblem} onChange={(e) => setForm({ ...form, originalProblem: e.target.value })} />
        </label>
        <div className="row">
          <label>
            <span>错误答案</span>
            <textarea required value={form.wrongAnswer} onChange={(e) => setForm({ ...form, wrongAnswer: e.target.value })} />
          </label>
          <label>
            <span>正确答案</span>
            <textarea required value={form.correctAnswer} onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })} />
          </label>
        </div>
        <div className="row">
          <label>
            <span>错误类型</span>
            <select value={form.errorType} onChange={(e) => setForm({ ...form, errorType: e.target.value as ErrorType })}>
              {(Object.keys(ERROR_TYPE_LABEL) as ErrorType[]).map((k) => (
                <option key={k} value={k}>{ERROR_TYPE_LABEL[k]}</option>
              ))}
            </select>
          </label>
          <label>
            <span>来源</span>
            <input placeholder="课本 / 试卷 / 作业..." value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
          </label>
        </div>
        <label>
          <span>笔记（可选）</span>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </label>

        {err && <div className="error">{err}</div>}
        <div className="btn-row">
          <button type="submit" disabled={loading}>{loading ? '保存中...' : '保存'}</button>
          <button type="button" className="secondary" onClick={() => nav(-1)}>取消</button>
        </div>
      </form>
    </div>
  );
}
