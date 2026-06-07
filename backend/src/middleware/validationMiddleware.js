// Validate user registration payload
function validateRegister(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Please provide both email and password'
    });
  }

  // Basic email regex
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid email address'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 6 characters long'
    });
  }

  next();
};

// Validate user login payload
function validateLogin(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Please provide both email and password'
    });
  }

  next();
};

// Validate task creation/update payload
function validateTask(req, res, next) {
  const { title, deadline, severity } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Task title is required'
    });
  }

  if (title.length > 100) {
    return res.status(400).json({
      success: false,
      error: 'Title cannot exceed 100 characters'
    });
  }

  if (!deadline) {
    return res.status(400).json({
      success: false,
      error: 'Deadline is required'
    });
  }

  // Validate date format
  const parsedDate = Date.parse(deadline);
  if (isNaN(parsedDate)) {
    return res.status(400).json({
      success: false,
      error: 'Deadline must be a valid date'
    });
  }

  const { startDate } = req.body;
  if (startDate) {
    const parsedStart = Date.parse(startDate);
    if (isNaN(parsedStart)) {
      return res.status(400).json({
        success: false,
        error: 'Start date must be a valid date'
      });
    }
  }

  if (severity && !['low', 'mid', 'high'].includes(severity)) {
    return res.status(400).json({
      success: false,
      error: 'Severity must be either low, mid, or high'
    });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateTask
};
