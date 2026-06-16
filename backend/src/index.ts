import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import subjectRoutes from './routes/subjects';
import knowledgeRoutes from './routes/knowledge';
import mistakeRoutes from './routes/mistakes';
import reviewRoutes from './routes/review';
import reportsRoutes from './routes/reports';
import growthRoutes from './routes/growth';
import parentBriefRoutes from './routes/parentBrief';

const app = express();

app.use(
  cors({
    origin: (process.env.CORS_ORIGIN || '').split(',').filter(Boolean).length
      ? process.env.CORS_ORIGIN!.split(',')
      : true,
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/auth', authRoutes);
app.use('/subjects', subjectRoutes);
app.use('/knowledge', knowledgeRoutes);
app.use('/mistakes', mistakeRoutes);
app.use('/review', reviewRoutes);
app.use('/reports', reportsRoutes);
app.use('/growth', growthRoutes);
app.use('/parentBrief', parentBriefRoutes);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'internal error' });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`API listening on :${port}`);
});
