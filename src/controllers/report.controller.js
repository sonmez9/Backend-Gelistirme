const reportService = require('../services/report.service');

exports.getCompleted = (req, res, next) => {
  try {
    res.status(200).json({ status: 'completed', count: reportService.completedCount() });
  } catch (err) {
    next(err);
  }
};

exports.getPending = (req, res, next) => {
  try {
    res.status(200).json({ status: 'pending', count: reportService.pendingCount() });
  } catch (err) {
    next(err);
  }
};

exports.getSummary = (req, res, next) => {
  try {
    res.status(200).json(reportService.summary());
  } catch (err) {
    next(err);
  }
};
