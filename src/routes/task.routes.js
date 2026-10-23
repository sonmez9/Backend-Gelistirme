const express = require('express');
const taskController = require('../controllers/task.controller');

const router = express.Router();

router.post('/', taskController.createTask);
router.get('/', taskController.getAllTasks);
// '/:id' ile çakışmaması için sabit yollar önce tanımlanır
router.get('/search', taskController.searchTasks);
router.get('/assignee/:name', taskController.getTasksByAssignee);
router.get('/:id', taskController.getTaskById);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
