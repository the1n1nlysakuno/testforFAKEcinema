const express = require('express');
const router = express.Router();
const {
  getShowtimeById,
  createShowtime,
} = require('../controllers/showtimeController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/:id', getShowtimeById);
router.post('/', verifyToken, isAdmin, createShowtime);

module.exports = router;