const express = require('express');
const logger = require('./middlewares/logger');
const taskRoutes = require('./routes/task.routes');
const reportRoutes = require('./routes/report.routes');

const app = express();

app.use(logger);
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({
    name: 'TaskFlow API',
    endpoints: [
      'POST   /tasks',
      'GET    /tasks',
      'GET    /tasks/:id',
      'PUT    /tasks/:id',
      'DELETE /tasks/:id',
      'GET    /tasks/search?keyword=',
      'GET    /tasks/assignee/:name',
      'GET    /reports/completed',
      'GET    /reports/pending',
      'GET    /reports/summary',
      'GET    /health',
    ],
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/tasks', taskRoutes);
app.use('/reports', reportRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint bulunamadı' });
});

// Geçersiz JSON gövdesi ve beklenmeyen hatalar
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Geçersiz JSON' });
  }
  console.error(err);
  res.status(500).json({ error: 'Sunucu hatası' });
});

module.exports = app;
