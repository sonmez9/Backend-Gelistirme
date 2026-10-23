const STATUSES = ['pending', 'in-progress', 'completed'];
const PRIORITIES = ['low', 'medium', 'high'];

const isText = (value) => typeof value === 'string';

// Gövdeyi kurallara göre denetler; hata mesajlarının listesini döndürür.
const collectErrors = (body, { requireTitle }) => {
  const errors = [];

  if (body.title === undefined) {
    if (requireTitle) errors.push('title alanı zorunludur');
  } else if (!isText(body.title) || body.title.trim() === '') {
    errors.push('title alanı boş olamaz');
  } else if (body.title.trim().length > 100) {
    errors.push('title en fazla 100 karakter olabilir');
  }

  if (body.description !== undefined) {
    if (!isText(body.description)) errors.push('description metin olmalıdır');
    else if (body.description.length > 500) errors.push('description en fazla 500 karakter olabilir');
  }

  if (body.priority !== undefined && !PRIORITIES.includes(body.priority)) {
    errors.push(`priority şunlardan biri olmalıdır: ${PRIORITIES.join(', ')}`);
  }

  if (body.status !== undefined && !STATUSES.includes(body.status)) {
    errors.push(`status şunlardan biri olmalıdır: ${STATUSES.join(', ')}`);
  }

  if (body.assignee !== undefined && body.assignee !== null) {
    if (!isText(body.assignee) || body.assignee.trim() === '') {
      errors.push('assignee boş olmayan bir metin olmalıdır');
    } else if (body.assignee.trim().length > 50) {
      errors.push('assignee en fazla 50 karakter olabilir');
    }
  }

  if (body.projectId !== undefined && body.projectId !== null && !isText(body.projectId)) {
    errors.push('projectId metin olmalıdır');
  }

  return errors;
};

const validate = (options) => (req, res, next) => {
  const body = req.body === undefined ? {} : req.body;

  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ error: 'İstek gövdesi bir JSON nesnesi olmalıdır' });
  }

  const errors = collectErrors(body, options);
  if (errors.length === 0 && options.requireTitle === false && Object.keys(body).length === 0) {
    errors.push('Güncellenecek en az bir alan gönderilmelidir');
  }
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join('; ') });
  }

  if (isText(body.title)) body.title = body.title.trim();
  if (isText(body.assignee)) body.assignee = body.assignee.trim();
  req.body = body;
  next();
};

exports.validateCreateTask = validate({ requireTitle: true });
exports.validateUpdateTask = validate({ requireTitle: false });
