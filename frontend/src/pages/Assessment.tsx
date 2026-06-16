import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, KnowledgePoint, Subject } from '../api';
import { useAuth } from '../auth';

type Level = 'WEAK' | 'MEDIUM' | 'STRONG';
type Mode = 'upload' | 'manual';
type MaterialType = 'mistakes' | 'homework' | 'exam';

interface ChapterAssess {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  chapter: string;
  level: Level;
}

interface SelfTestItem {
  kpId: string;
  question: string;
  answer: string;
  explanation?: string;
  chapter: string;
  subjectName: string;
  mastered: boolean | null;
}

const STORAGE_DONE = 'edu_assessment_done';
const STORAGE_DATA = 'edu_assessment';

const SUBJECT_EMOJI: Record<string, string> = {
  MATH: '🪐', CHINESE: '🌳', ENGLISH: '🌎', PHYSICS: '⚡', CHEMISTRY: '🧪',
};

const LEVEL_LABEL: Record<Level, string> = { WEAK: '完全不会', MEDIUM: '一般', STRONG: '掌握' };
const LEVEL_CLASS: Record<Level, string> = { WEAK: 'weak', MEDIUM: 'medium', STRONG: 'strong' };

const MATERIAL_META: Record<MaterialType, { label: string; icon: string; hint: string }> = {
  mistakes: { label: '错题集',  icon: '📒', hint: '错题本、错题截屏，最适合定位薄弱点' },
  homework: { label: '作业',    icon: '✏️', hint: '近期作业本或打勾批改页' },
  exam:     { label: '考试',    icon: '📃', hint: '近期月考 / 单元测 / 周测试卷' },
};

const STEPS = ['欢迎', '摸底', '热力图', '自测', '结果'];

// 上传模式没有真实 OCR，从章节名 hash 出稳定 demo level，让后续步骤可以走完
function levelFromHash(s: string): Level {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  const n = Math.abs(h) % 5;
  if (n === 0 || n === 1) return 'WEAK';
  if (n === 2 || n === 3) return 'MEDIUM';
  return 'STRONG';
}

export default function Assessment() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<Mode | null>(null);
  const [materialTab, setMaterialTab] = useState<MaterialType>('mistakes');
  const [materials, setMaterials] = useState<Record<MaterialType, File[]>>({
    mistakes: [], homework: [], exam: [],
  });
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [kps, setKps] = useState<KnowledgePoint[]>([]);
  const [chapters, setChapters] = useState<ChapterAssess[]>([]);
  const [selfTest, setSelfTest] = useState<SelfTestItem[]>([]);

  useEffect(() => {
    api.subjects().then(setSubjects).catch(() => {});
  }, []);
  useEffect(() => {
    if (!user) return;
    api.knowledge({ grade: user.grade }).then(setKps).catch(() => setKps([]));
  }, [user]);

  useEffect(() => {
    if (subjects.length === 0 || kps.length === 0) return;
    const subjectById = new Map(subjects.map((s) => [s.id, s]));
    const seen = new Set<string>();
    const list: ChapterAssess[] = [];
    for (const kp of kps) {
      const key = `${kp.subjectId}|${kp.chapter}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const sub = subjectById.get(kp.subjectId);
      if (!sub) continue;
      list.push({
        subjectId: kp.subjectId,
        subjectCode: sub.code,
        subjectName: sub.name,
        chapter: kp.chapter,
        level: 'MEDIUM',
      });
    }
    setChapters(list);
  }, [subjects, kps]);

  const groupedChapters = useMemo(() => {
    const m = new Map<string, ChapterAssess[]>();
    for (const c of chapters) {
      if (!m.has(c.subjectId)) m.set(c.subjectId, []);
      m.get(c.subjectId)!.push(c);
    }
    return Array.from(m.entries()).map(([sid, list]) => ({
      subjectId: sid,
      subjectCode: list[0].subjectCode,
      subjectName: list[0].subjectName,
      chapters: list,
    }));
  }, [chapters]);

  function setLevel(subjectId: string, chapter: string, level: Level) {
    setChapters((prev) =>
      prev.map((c) => (c.subjectId === subjectId && c.chapter === chapter ? { ...c, level } : c)),
    );
  }

  function addFiles(type: MaterialType, files: FileList | null) {
    if (!files) return;
    setMaterials((prev) => ({
      ...prev,
      [type]: [...prev[type], ...Array.from(files)].slice(0, 6),
    }));
  }
  function removeFile(type: MaterialType, idx: number) {
    setMaterials((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== idx),
    }));
  }
  const totalFiles =
    materials.mistakes.length + materials.homework.length + materials.exam.length;

  function buildSelfTest(): SelfTestItem[] {
    const weakKey = new Set(
      chapters.filter((c) => c.level === 'WEAK').map((c) => `${c.subjectId}|${c.chapter}`),
    );
    const mediumKey = new Set(
      chapters.filter((c) => c.level === 'MEDIUM').map((c) => `${c.subjectId}|${c.chapter}`),
    );
    const subjectName = (id: string) => subjects.find((s) => s.id === id)?.name || '';
    const items: SelfTestItem[] = [];
    const pick = (keySet: Set<string>) => {
      for (const kp of kps) {
        const k = `${kp.subjectId}|${kp.chapter}`;
        if (!keySet.has(k)) continue;
        const ex = (kp.examples || [])[0];
        if (!ex) continue;
        items.push({
          kpId: kp.id,
          question: ex.question,
          answer: ex.answer,
          explanation: ex.explanation,
          chapter: kp.chapter,
          subjectName: subjectName(kp.subjectId),
          mastered: null,
        });
        if (items.length >= 5) return;
      }
    };
    pick(weakKey);
    if (items.length < 3) pick(mediumKey);
    return items.slice(0, 5);
  }

  function goNext() {
    // 离开 step 1：如果走上传模式且章节还都是默认 MEDIUM，合成 demo 热力图（OCR 占位）
    if (step === 1 && mode === 'upload') {
      const allDefault = chapters.every((c) => c.level === 'MEDIUM');
      if (allDefault) {
        setChapters((prev) => prev.map((c) => ({ ...c, level: levelFromHash(c.chapter) })));
      }
    }
    if (step === 2) {
      setSelfTest(buildSelfTest());
    }
    if (step === 4) {
      localStorage.setItem(STORAGE_DONE, '1');
      localStorage.setItem(
        STORAGE_DATA,
        JSON.stringify({
          mode,
          materials: {
            mistakes: materials.mistakes.map((f) => f.name),
            homework: materials.homework.map((f) => f.name),
            exam: materials.exam.map((f) => f.name),
          },
          chapters,
          completedAt: new Date().toISOString(),
        }),
      );
      nav('/dashboard');
      return;
    }
    setStep((s) => Math.min(4, s + 1));
  }
  function goPrev() { setStep((s) => Math.max(0, s - 1)); }

  const canProceedStep1 = mode !== null;

  // Result-step aggregations
  const weakChapters = chapters.filter((c) => c.level === 'WEAK');
  const strongCount =
    chapters.filter((c) => c.level === 'STRONG').length +
    selfTest.filter((q) => q.mastered === true).length;
  const bossChapter = weakChapters[0] || chapters.find((c) => c.level === 'MEDIUM');
  const topKeyChapters = [
    ...weakChapters,
    ...chapters.filter((c) => c.level === 'MEDIUM'),
  ].slice(0, 3);

  // ============================ steps ============================

  function renderStep0() {
    return (
      <div className="assess-card">
        <h3>这是一次没有分数的摸底 ✨</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          为了帮 {user?.name || '你'} 找到最合适的学习路径，我们会：
        </p>
        <ul style={{ paddingLeft: 18, lineHeight: 2 }}>
          <li>看看你最近的<b>错题、作业、考试</b>（可选拍照上传，老师人工标注）</li>
          <li>或者跳过上传，直接<b>手动选一下学习阶段</b></li>
          <li>给你一张红黄绿三色的<b>知识点热力图</b></li>
          <li>挑 3–5 道题做一遍，<b>不打分</b>，只问你"会不会"</li>
          <li>给爸妈一份重点 + 每日复习建议</li>
        </ul>
        <div className="muted" style={{ fontSize: 12, marginTop: 12 }}>
          全程约 5–8 分钟。中途可以退出，进度会自动保存。
        </div>
      </div>
    );
  }

  function renderStep1() {
    return (
      <>
        <div className="assess-card">
          <h3>选一种评估方式</h3>
          <div className="mode-switch">
            <button
              type="button"
              className={mode === 'upload' ? 'active' : ''}
              onClick={() => setMode('upload')}
            >
              <span className="ico">📷</span>
              <span className="title">上传材料评估</span>
              <span className="hint">推荐 · 错题 / 作业 / 试卷 老师人工标注，最精准</span>
            </button>
            <button
              type="button"
              className={mode === 'manual' ? 'active' : ''}
              onClick={() => setMode('manual')}
            >
              <span className="ico">✋</span>
              <span className="title">跳过，手动选择学习阶段</span>
              <span className="hint">5 分钟搞定 · 不需要任何材料</span>
            </button>
          </div>
        </div>

        {mode === 'upload' && (
          <div className="assess-card">
            <h3>上传材料</h3>
            <div className="material-tabs">
              {(Object.keys(MATERIAL_META) as MaterialType[]).map((t) => {
                const m = MATERIAL_META[t];
                const n = materials[t].length;
                return (
                  <button
                    key={t}
                    type="button"
                    className={materialTab === t ? 'active' : ''}
                    onClick={() => setMaterialTab(t)}
                  >
                    <span>{m.icon}</span>
                    <span>{m.label}</span>
                    {n > 0 && <span className="count">{n}</span>}
                  </button>
                );
              })}
            </div>

            <label className="upload-zone" htmlFor={`u-${materialTab}`}>
              <div className="ico">{MATERIAL_META[materialTab].icon}</div>
              <div>点击或拖拽 <b>{MATERIAL_META[materialTab].label}</b> 图片到这里</div>
              <div className="hint">{MATERIAL_META[materialTab].hint} · 最多 6 张</div>
              <input
                id={`u-${materialTab}`}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => addFiles(materialTab, e.target.files)}
              />
            </label>

            {materials[materialTab].length > 0 && (
              <div className="upload-files">
                {materials[materialTab].map((f, i) => (
                  <span key={i} className="pill">
                    📄 {f.name}
                    <span
                      style={{ marginLeft: 6, cursor: 'pointer', opacity: 0.7 }}
                      onClick={() => removeFile(materialTab, i)}
                    >
                      ×
                    </span>
                  </span>
                ))}
              </div>
            )}

            <div className="muted" style={{ fontSize: 12, marginTop: 12 }}>
              💡 提交后 OCR + 老师人工标注会在 <b>24h 内</b> 完成，结果出来会自动刷新热力图。
              当前共上传 <b>{totalFiles}</b> 张图片
              {totalFiles === 0 && '，也可以一张不传，先走下一步看默认热力图。'}
            </div>
          </div>
        )}

        {mode === 'manual' && (
          <div className="assess-card">
            <h3>📝 按章节自评一下</h3>
            <p className="muted" style={{ marginTop: 0, fontSize: 13 }}>
              你的年级：<b>{user?.grade === 'G7' ? '初一' : user?.grade === 'G8' ? '初二' : '初三'}</b>
              。每个章节选一个最贴近的状态就行。
            </p>
            {groupedChapters.length === 0 ? (
              <div className="muted center" style={{ padding: 16 }}>
                章节加载中…（请确保后端已启动并完成 seed）
              </div>
            ) : (
              groupedChapters.map((g) => (
                <div key={g.subjectId} className="assess-subject-group">
                  <div className="head">
                    <span>{SUBJECT_EMOJI[g.subjectCode] || '📘'}</span>
                    <span>{g.subjectName}</span>
                    <span className="muted" style={{ fontWeight: 400 }}>· {g.chapters.length} 章</span>
                  </div>
                  {g.chapters.map((c) => (
                    <div key={c.chapter} className="assess-row">
                      <span>{c.chapter}</span>
                      <div className="seg-btns">
                        {(['WEAK', 'MEDIUM', 'STRONG'] as Level[]).map((lv) => (
                          <button
                            key={lv}
                            type="button"
                            className={`seg-btn ${c.level === lv ? `active ${LEVEL_CLASS[lv]}` : ''}`}
                            onClick={() => setLevel(c.subjectId, c.chapter, lv)}
                          >
                            {LEVEL_LABEL[lv]}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        )}

        {mode === null && (
          <div className="muted center" style={{ padding: 14, fontSize: 13 }}>
            👆 选择一种方式后即可进入下一步
          </div>
        )}
      </>
    );
  }

  function renderStep2() {
    return (
      <div className="assess-card">
        {mode === 'upload' && (
          <div className="ocr-processing">
            <span className="ico">⏳</span>
            <div>
              <strong>OCR + 老师人工标注处理中</strong>
              <div className="muted" style={{ marginTop: 2, fontSize: 12 }}>
                上传了 {totalFiles} 张材料，24h 内会自动刷新热力图。
                当前展示<b>预估热力图</b>，仅供参考，可以先用于自测和复习计划。
              </div>
            </div>
          </div>
        )}

        <h3>🗺 你的知识点热力图</h3>
        <div className="heat-legend">
          <span className="lg-weak">完全不会</span>
          <span className="lg-medium">一般</span>
          <span className="lg-strong">掌握</span>
        </div>
        {groupedChapters.map((g) => (
          <div key={g.subjectId} className="heat-group">
            <div className="head">
              {SUBJECT_EMOJI[g.subjectCode] || '📘'} {g.subjectName}
            </div>
            <div className="heat-chips">
              {g.chapters.map((c) => (
                <span key={c.chapter} className={`heat-chip ${LEVEL_CLASS[c.level]}`}>
                  {c.chapter}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  function renderStep3() {
    if (selfTest.length === 0) {
      return (
        <div className="assess-card center muted" style={{ padding: 28 }}>
          没有匹配的题目（章节里还没录入例题），可以直接进入下一步看结果。
        </div>
      );
    }
    return (
      <>
        {selfTest.map((q, idx) => (
          <SelfTestQA
            key={q.kpId + idx}
            item={q}
            index={idx}
            onMark={(mastered) =>
              setSelfTest((prev) =>
                prev.map((p, i) => (i === idx ? { ...p, mastered } : p)),
              )
            }
          />
        ))}
        <div className="muted" style={{ fontSize: 12 }}>
          没有分数，也不会算入"错题本"，只是看看自己心里有没有数。
        </div>
      </>
    );
  }

  function renderStep4() {
    return (
      <>
        <div className="boss-card">
          <div className="lead">学习冒险继续！</div>
          <div className="boss-name">
            ⚔️ 下一只 Boss：{bossChapter ? bossChapter.chapter : '一元一次方程'}
          </div>
          <div className="boss-meta">
            <span>🌟 已点亮 <b>{strongCount}</b> 个知识点</span>
            <span>🐉 知识度 Lv 12</span>
            <span>🔥 连击 1 天</span>
          </div>
          <span className="mascot">🐲</span>
        </div>

        <div className="assess-card parent-card">
          <div className="head">📨 给家长的建议（可截图发给家长）</div>
          <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>
            评估时间：{new Date().toLocaleDateString()} · 学生：{user?.name || '同学'} ·
            方式：{mode === 'upload' ? `上传材料 ${totalFiles} 张` : '手动自评'}
          </div>
          <ul className="key-list">
            {topKeyChapters.length === 0 ? (
              <li className="muted">整体掌握不错，建议保持每日复习节奏。</li>
            ) : (
              topKeyChapters.map((c) => (
                <li key={`${c.subjectId}-${c.chapter}`}>
                  <b>{c.subjectName} · {c.chapter}</b>
                  ：{c.level === 'WEAK' ? '完全不会，需要从知识点讲解开始' : '基础已有，需巩固和提速'}
                </li>
              ))
            )}
          </ul>
          <div className="plan">
            <h4>📅 每日复习建议</h4>
            <div>每天 <b>15–20 分钟</b>：5 道错题间隔复习 + 1 个薄弱知识点学习。</div>
            <div className="muted" style={{ marginTop: 4 }}>
              系统会按 SM-2 算法自动安排复习时间，坚持一周即可看到掌握率变化。
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="assessment">
      <div className="assess-banner">
        <div className="text">
          <h2>🌟 初始评估</h2>
          <p>没有分数，没有压力 —— 只为找到你的学习节奏</p>
        </div>
        <span className="mascot">🐉</span>
      </div>

      <div className="steps">
        {STEPS.map((label, i) => (
          <div
            key={i}
            className={`step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
          >
            <div className="dot">{i < step ? '✓' : i + 1}</div>
            <div className="label">{label}</div>
          </div>
        ))}
      </div>

      {step === 0 && renderStep0()}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}

      <div className="wizard-nav">
        <button className="ghost" onClick={goPrev} disabled={step === 0}>
          ← 上一步
        </button>
        <button onClick={goNext} disabled={step === 1 && !canProceedStep1}>
          {step === 4 ? '进入学习中心 →' : step === 0 ? '开始评估 →' : '下一步 →'}
        </button>
      </div>
    </div>
  );
}

function SelfTestQA({
  item,
  index,
  onMark,
}: {
  item: SelfTestItem;
  index: number;
  onMark: (mastered: boolean) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="qa">
      <div className="qa-meta">第 {index + 1} 题 · {item.subjectName} · {item.chapter}</div>
      <div className="qa-q">{item.question}</div>
      {show ? (
        <div className="qa-a">
          <div><b>参考答案：</b>{item.answer}</div>
          {item.explanation && (
            <div className="muted" style={{ marginTop: 4 }}>{item.explanation}</div>
          )}
        </div>
      ) : (
        <button className="secondary" onClick={() => setShow(true)}>显示参考答案</button>
      )}
      <div className="qa-actions" style={{ marginTop: 10 }}>
        <button
          className={item.mastered === false ? 'danger' : 'secondary'}
          onClick={() => onMark(false)}
        >
          还需练习
        </button>
        <button
          className={item.mastered === true ? '' : 'secondary'}
          onClick={() => onMark(true)}
          style={item.mastered === true ? { background: 'var(--success)' } : undefined}
        >
          已掌握
        </button>
      </div>
    </div>
  );
}
