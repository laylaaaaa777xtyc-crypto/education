# 初中错题与知识点 MVP

面向初一~初三的"知识点卡片 + 错题集 + 间隔复习（SM-2 变种）"的最小可用版本。

## 目录结构

```
.
├── backend/        Node.js + TypeScript + Express + Prisma + PostgreSQL + JWT
└── frontend/       React + Vite + TypeScript
```

## 本地运行

### 1. 准备 PostgreSQL

- 本地装 Postgres，或在 [Supabase](https://supabase.com) 新建项目，拿到 `DATABASE_URL`。

### 2. 后端

```bash
cd backend
cp .env.example .env            # 填入 DATABASE_URL 和 JWT_SECRET
npm install
npx prisma migrate dev --name init
npm run seed                    # 写入 15 个学科 + 140 个知识点
# 可选：一键创建演示账号 + 30 道示例错题
npm run seed -- --demo
npm run dev                     # http://localhost:4000
```

**演示账号**（执行 `npm run seed -- --demo` 后可用）：
- 手机号：`13800138000`
- 密码：`demo1234`
- 内含 30 道分布在数学/语文/英语/物理/化学/生物/历史/地理/道法的真实月考/期末改编题，登录后即可体验错题列表、复习队列、薄弱点报告、成长勋章等全部功能。

### 3. 前端

```bash
cd frontend
cp .env.example .env            # VITE_API_BASE=http://localhost:4000
npm install
npm run dev                     # http://localhost:5173
```

## 部署

- **数据库**：Supabase（自带 Postgres，免费档够 MVP）。
- **后端**：Render（Web Service，构建命令 `npm install && npx prisma migrate deploy && npm run build`，启动命令 `npm start`）。在环境变量里填 `DATABASE_URL` 和 `JWT_SECRET`。
- **前端**：Vercel，根目录指向 `frontend`，环境变量 `VITE_API_BASE` 指向 Render 的后端域名。

## 第一版范围

- ✅ 学科 / 年级 / 章节维度的知识点卡片（文字总结 + 例题），覆盖 15 个学科（核心主科 + 理科综合 + 文科综合 + 信息科技 + 体育艺术 + 综合实践 + 劳动）。
- ✅ 错题手动录入（原题、错答、正答、错误类型、来源、备注）。
- ✅ 错题列表筛选（学科 / 错误类型 / 状态）。
- ✅ 基于 SM-2 变种的复习模式（自动算下次复习时间）。
- ✅ 用户标记"掌握 / 一般 / 不会"，更新复习状态。
- ⛔ 拍照 OCR、社区、付费订阅、AI 自动出内容（知识点先人工录入）。

> 体育与健康、音乐、美术、综合实践活动、劳动 5 科为首版**占位内容**，知识点较少，主要保证学科下拉框完整，正式上线前需教师补充。

## SM-2 变种

`backend/src/sm2.ts` 里是简化版：用户从 3 档选择反馈（不会 / 一般 / 掌握 → 质量分 1 / 3 / 5），算法照搬 SuperMemo SM-2 的 EF 与间隔递推，EF 下限 1.3。错答时 `repetitions` 归零、`interval` 置 1（明天再来）；答对时按 `1 → 3 → prev*EF` 推进。
