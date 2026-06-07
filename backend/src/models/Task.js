const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index : true
  },
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  startDate: {
    type: Date,
    default: function() {
      return this.deadline ? new Date(new Date(this.deadline).getTime() - 60 * 60 * 1000) : Date.now();
    }
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline is required']
  },
  severity: {
    type: String,
    enum: {
      values: ['low', 'mid', 'high'],
      message: '{VALUE} is not a valid severity level (low, mid, or high)'
    },
    default: 'low'
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  customNotificationValue: {
    type: Number,
    default: null
  },
  customNotificationUnit: {
    type: String,
    enum: {
      values: ['minutes', 'hours', 'days', 'none'],
      message: '{VALUE} is not a valid notification unit (minutes, hours, days, or none)'
    },
    default: 'none'
  },
  alarmTriggered: {
    type: Boolean,
    default: false
  },
  alarmAcknowledged: {
    type: Boolean,
    default: false
  },
  alarmTriggeredAt: {
    type: Date,
    default: null
  },
  alarmAcknowledgedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', TaskSchema);
