const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const DATA_FILE = path.join(__dirname, '..', 'data', 'tasks.json');

const readTasks = () => {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return raw.trim() ? JSON.parse(raw) : [];
};

const writeTasks = (tasks) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
};

const getAll = () => readTasks();

const SORTABLE_FIELDS = ['createdAt', 'updatedAt', 'title'];

const sameText = (a, b) => (a || '').toLowerCase() === b.toLowerCase();

// Filtreleme, arama ve sıralama; sayfalama ayrıca paginate ile yapılır.
const list = ({ status, priority, assignee, keyword, sort, order = 'asc' } = {}) => {
  let tasks = readTasks();

  if (status) tasks = tasks.filter((task) => task.status === status);
  if (priority) tasks = tasks.filter((task) => task.priority === priority);
  if (assignee) tasks = tasks.filter((task) => sameText(task.assignee, assignee));
  if (keyword) {
    const term = keyword.toLowerCase();
    tasks = tasks.filter((task) =>
      `${task.title} ${task.description}`.toLowerCase().includes(term)
    );
  }

  if (sort) {
    const direction = order === 'desc' ? -1 : 1;
    tasks.sort((a, b) => String(a[sort]).localeCompare(String(b[sort])) * direction);
  }

  return tasks;
};

const paginate = (items, page, limit) => {
  const total = items.length;
  const start = (page - 1) * limit;

  return {
    data: items.slice(start, start + limit),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getById = (id) => readTasks().find((task) => task.id === id);

const create = ({ title, description, status, priority, assignee, projectId }) => {
  const now = new Date().toISOString();
  const task = {
    id: randomUUID(),
    title,
    description: description || '',
    status: status || 'pending',
    priority: priority || 'medium',
    assignee: assignee || null,
    projectId: projectId || null,
    createdAt: now,
    updatedAt: now,
  };

  const tasks = readTasks();
  tasks.push(task);
  writeTasks(tasks);
  return task;
};

const UPDATABLE_FIELDS = ['title', 'description', 'status', 'priority', 'assignee', 'projectId'];

const update = (id, changes) => {
  const tasks = readTasks();
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) return null;

  UPDATABLE_FIELDS.forEach((field) => {
    if (changes[field] !== undefined) tasks[index][field] = changes[field];
  });
  tasks[index].updatedAt = new Date().toISOString();

  writeTasks(tasks);
  return tasks[index];
};

const remove = (id) => {
  const tasks = readTasks();
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) return false;

  tasks.splice(index, 1);
  writeTasks(tasks);
  return true;
};

module.exports = { getAll, list, paginate, SORTABLE_FIELDS, getById, create, update, remove };
