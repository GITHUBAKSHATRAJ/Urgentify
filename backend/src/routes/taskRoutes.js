const express = require('express');
const router = express.Router();
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  acknowledgeAlarm
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { validateTask } = require('../middleware/validationMiddleware');

// Protect all routes below this middleware
router.use(protect);

router.route('/')
  .get(getTasks)
  .post(validateTask, createTask);

router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

router.route('/:id/ack')
  .patch(acknowledgeAlarm);

module.exports = router;
