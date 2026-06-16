import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ERROR_TYPE_LABEL, ErrorType, Mistake, Subject } from '../api';

export default function Mistakes() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [items, setItems] = useState<Mistake[]>([]);
  const [subjectId, setSubjectId] = useState('');
  const [errorType, setErrorType] = useState<ErrorType | ''>('');
  const [status, setStatus] = useState<'' | 'ACTIVE' | 'MASTERED'>('ACTIVE');
  const [err, setErr] = useState('');

  useEffect(() => {
    api.subjects().then(setSubjects).catch((e) => setErr(e.message));
  }, []);

  function load() {
    api
      .listMistakes({
        subjectId: subjectId || undefined,
        errorType: errorType || undefined,
        status: status || undefined,
      })
      .then(setItems)
      .catch((e) => setErr(e.message));
  }

  useEffect(load, [subjectId, errorType, status]);

  async function onDelete(id: string) {
    if (!confirm('确定删除这条错题？')) return;
    await api.deleteMistake(id);
    load();
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <h2 style={{ margin: 0, flex: 1 }}>错题集</h2>
        <Link to="/mistakes/new"><button>+ 录入错题</button></Link>
      </div>

      <div className="card">
        <div className="row">
          <label>
            <span>学科</span>
            <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
              <option value="">全部</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          <label>
            <span>错误类型</span>
            <select value={errorType} onChange={(e) => setErrorType(e.target.value as ErrorType | '')}>
              <option value="">全部</option>
              {(Object.keys(ERROR_TYPE_LABEL) as ErrorType[]).map((k) => (
                <option key={k} value={k}>{ERROR_TYPE_LABEL[k]}</option>
              ))}
            </select>
          </label>
          <label>
            <span>状态</span>
            <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
              <option value="ACTIVE">待复习</option>
              <option value="MASTERED">已掌握</option>
              <option value="">全部</option>
            </select>
          </label>
        </div>
      </div>

      {err && <div className="error">{err}</div>}

      {items.length === 0 ? (
        <div className="card muted center">还没有错题，点右上角"录入错题"开始吧。</div>
      ) : (
        items.map((m) => (
          <div key={m.id} className="card">
            <div>
              <span className="tag">{m.subject?.name}</span>
              <span className="tag">{ERROR_TYPE_LABEL[m.errorType]}</span>
              {m.status === 'MASTERED' && <span className="tag" style={{ background: '#dcfce7', color: '#166534' }}>已掌握</span>}
              {m.source && <span className="muted" style={{ marginLeft: 8 }}>来源：{m.source}</span>}
            </div>
            <div className="q-block" style={{ marginTop: 8 }}><strong>题目：</strong>{m.originalProblem}</div>
            <div><span className="wrong">错答：</span>{m.wrongAnswer}</div>
            <div><span className="correct">正答：</span>{m.correctAnswer}</div>
            {m.notes && <div className="muted" style={{ marginTop: 6 }}>笔记：{m.notes}</div>}
            <div className="muted" style={{ marginTop: 8, fontSize: 12 }}>
              下次复习：{new Date(m.nextReviewAt).toLocaleDateString()} · 已复习 {m.repetitions} 次 · EF {m.easeFactor.toFixed(2)}
            </div>
            <div className="btn-row">
              <button className="danger secondary" onClick={() => onDelete(m.id)}>删除</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
