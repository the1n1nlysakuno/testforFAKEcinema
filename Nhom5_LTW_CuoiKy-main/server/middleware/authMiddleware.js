const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Chưa đăng nhập: thiếu token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('name email role');
    if (!user) {
      return res.status(401).json({ message: 'Tài khoản không tồn tại' });
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res
        .status(401)
        .json({ message: 'Token đã hết hạn, vui lòng đăng nhập lại' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token không hợp lệ' });
    }
    next(err); 
  }
};

const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Chưa đăng nhập' });
  }
  if (req.user.role !== 'admin') {
    return res
      .status(403)
      .json({ message: 'Bạn không có quyền thực hiện thao tác này (cần Admin)' });
  }
  next();
};

module.exports = { verifyToken, isAdmin };
