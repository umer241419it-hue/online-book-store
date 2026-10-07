const jwt = require('jsonwebtoken');

// @desc    Admin login with password
// @route   POST /api/admin/login
// @access  Public
exports.adminLogin = async (req, res) => {
  try {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Admin password is required'
      });
    }

    if (password !== adminPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin password'
      });
    }

    // Generate lightweight JWT token for admin session (valid for 24 hours)
    const token = jwt.sign(
      { role: 'admin' },
      process.env.JWT_SECRET || 'supersecretjwtkey123',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during admin authentication'
    });
  }
};
