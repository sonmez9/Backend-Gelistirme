const taskService = require('../services/task.service');

const isBlank = (value) => typeof value !== 'string' || value.trim() === '';

exports.createTask = (req, res, next) => {
  try {
    const body = req.body || {};
    if (isBlank(body.title)) {
      return res.status(400).json({ error: 'title alanı zorunludur' });
    }

    const task = taskService.create({ ...body, title: body.title.trim() });
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

exports.getAllTasks = (req, res, next) => {
  try {
    res.status(200).json(taskService.getAll());
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
    const body = req.body || {};
    if (body.title !== undefined && isBlank(body.title)) {
      return res.status(400).json({ error: 'title alanı boş olamaz' });
    }

    const task = taskService.update(req.params.id, body);
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
