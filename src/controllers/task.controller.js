const taskService = require('../services/task.service');

const isBlank = (value) => typeof value !== 'string' || value.trim() === '';

exports.createTask = (req, res, next) => {
  try {
    const task = taskService.create(req.body);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

const parsePositiveInt = (value) => (/^\d+$/.test(value) && Number(value) > 0 ? Number(value) : null);

// GET /tasks?status=&priority=&sort=&order=&page=&limit=
exports.getAllTasks = (req, res, next) => {
  try {
    const { status, priority, assignee, sort, order, page, limit } = req.query;

    if (Object.values(req.query).some((value) => typeof value !== 'string')) {
      return res.status(400).json({ error: 'Geçersiz sorgu parametresi' });
    }
    if (sort !== undefined && !taskService.SORTABLE_FIELDS.includes(sort)) {
      return res
        .status(400)
        .json({ error: `sort şunlardan biri olmalıdır: ${taskService.SORTABLE_FIELDS.join(', ')}` });
    }
    if (order !== undefined && !['asc', 'desc'].includes(order)) {
      return res.status(400).json({ error: 'order asc veya desc olmalıdır' });
    }

    const tasks = taskService.list({ status, priority, assignee, sort, order });

    if (page === undefined && limit === undefined) {
      return res.status(200).json(tasks);
    }

    const pageNumber = page === undefined ? 1 : parsePositiveInt(page);
    const limitNumber = limit === undefined ? 10 : parsePositiveInt(limit);
    if (!pageNumber || !limitNumber) {
      return res.status(400).json({ error: 'page ve limit pozitif tam sayı olmalıdır' });
    }

    res.status(200).json(taskService.paginate(tasks, pageNumber, limitNumber));
  } catch (err) {
    next(err);
  }
};

// GET /tasks/search?keyword=
exports.searchTasks = (req, res, next) => {
  try {
    const { keyword } = req.query;
    if (isBlank(keyword)) {
      return res.status(400).json({ error: 'keyword parametresi zorunludur' });
    }

    res.status(200).json(taskService.list({ keyword: keyword.trim() }));
  } catch (err) {
    next(err);
  }
};

// GET /tasks/assignee/:name
exports.getTasksByAssignee = (req, res, next) => {
  try {
    res.status(200).json(taskService.list({ assignee: req.params.name }));
  } catch (err) {
    next(err);
  }
};

exports.getTaskById = (req, res, next) => {
  try {
    const task = taskService.getById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Görev bulunamadı' });

    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
};

exports.updateTask = (req, res, next) => {
  try {
    const task = taskService.update(req.params.id, req.body);
    if (!task) return res.status(404).json({ error: 'Görev bulunamadı' });

    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
};

exports.deleteTask = (req, res, next) => {
  try {
    const removed = taskService.remove(req.params.id);
    if (!removed) return res.status(404).json({ error: 'Görev bulunamadı' });

    res.status(200).json({ message: 'Görev silindi' });
  } catch (err) {
    next(err);
  }
};
