const taskService = require('./task.service');

const STATUSES = ['pending', 'in-progress', 'completed'];
const PRIORITIES = ['low', 'medium', 'high'];

const countBy = (tasks, field, values) =>
  Object.fromEntries(values.map((value) => [value, tasks.filter((task) => task[field] === value).length]));

const countByStatus = (status) => taskService.getAll().filter((task) => task.status === status).length;

const completedCount = () => countByStatus('completed');

const pendingCount = () => countByStatus('pending');

const summary = () => {
  const tasks = taskService.getAll();
  const total = tasks.length;
  const byStatus = countBy(tasks, 'status', STATUSES);
  const assigned = tasks.filter((task) => task.assignee).length;

  return {
    total,
    byStatus,
    byPriority: countBy(tasks, 'priority', PRIORITIES),
    assigned,
    unassigned: total - assigned,
    completionRate: total === 0 ? 0 : Math.round((byStatus.completed / total) * 100),
  };
};

module.exports = { completedCount, pendingCount, summary };
