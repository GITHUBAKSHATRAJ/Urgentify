const Task = require('../models/Task');

// Get all tasks for the authenticated user
async function getTasks(req, res, next) {
  try {
    // Fetch all tasks for the logged-in user, sorted by deadline (closest first)
    const tasks = await Task.find({ userId: req.user._id }).sort({ deadline: 1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

// Create a new task
async function createTask(req, res, next) {
  try {
    const { title, description, startDate, deadline, severity, customNotificationValue, customNotificationUnit } = req.body;

    // Create task referencing user id
    const task = await Task.create({
      userId: req.user._id,
      title,
      description,
      startDate,
      deadline,
      severity: severity || 'low',
      customNotificationValue,
      customNotificationUnit: customNotificationUnit || 'none'
    });

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// Update task status or details
async function updateTask(req, res, next) {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: `Task not found with id of ${req.params.id}`
      });
    }

    // Make sure user owns the task
    if (task.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this task'
      });
    }

    // Update allowable fields
    const { 
      title, 
      description, 
      startDate, 
      deadline, 
      severity, 
      isCompleted, 
      customNotificationValue, 
      customNotificationUnit,
      alarmTriggered,
      alarmAcknowledged,
      alarmTriggeredAt,
      alarmAcknowledgedAt
    } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (startDate !== undefined) task.startDate = startDate;
    if (deadline !== undefined) task.deadline = deadline;
    if (severity !== undefined) task.severity = severity;
    if (isCompleted !== undefined) task.isCompleted = isCompleted;
    if (customNotificationValue !== undefined) task.customNotificationValue = customNotificationValue;
    if (customNotificationUnit !== undefined) task.customNotificationUnit = customNotificationUnit;
    if (alarmTriggered !== undefined) task.alarmTriggered = alarmTriggered;
    if (alarmAcknowledged !== undefined) task.alarmAcknowledged = alarmAcknowledged;
    if (alarmTriggeredAt !== undefined) task.alarmTriggeredAt = alarmTriggeredAt;
    if (alarmAcknowledgedAt !== undefined) task.alarmAcknowledgedAt = alarmAcknowledgedAt;

    const updatedTask = await task.save();

    res.status(200).json({
      success: true,
      data: updatedTask
    });
  } catch (error) {
    next(error);
  }
};

// Delete a task
async function deleteTask(req, res, next) {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: `Task not found with id of ${req.params.id}`
      });
    }

    // Make sure user owns the task
    if (task.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this task'
      });
    }

    // Delete task from DB
    await task.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Task removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Acknowledge task physical alarm
async function acknowledgeAlarm(req, res, next) {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: `Task not found with id of ${req.params.id}`
      });
    }

    // Make sure user owns the task
    if (task.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this task'
      });
    }

    task.alarmAcknowledged = true;
    task.alarmAcknowledgedAt = Date.now();
    
    // Also mark it triggered if it wasn't already
    if (!task.alarmTriggered) {
      task.alarmTriggered = true;
      task.alarmTriggeredAt = task.alarmTriggeredAt || Date.now();
    }

    const updatedTask = await task.save();

    res.status(200).json({
      success: true,
      data: updatedTask
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  acknowledgeAlarm
};
