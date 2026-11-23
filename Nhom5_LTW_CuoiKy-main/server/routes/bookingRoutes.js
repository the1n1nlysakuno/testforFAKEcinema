const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyTickets,
  cancelBooking,
} = require('../controllers/bookingController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, createBooking);
router.get('/my-tickets', verifyToken, getMyTickets);
router.patch('/:id/cancel', verifyToken, cancelBooking);

module.exports = router;