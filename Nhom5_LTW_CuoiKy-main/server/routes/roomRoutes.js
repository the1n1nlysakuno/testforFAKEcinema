const express = require('express');
const router = express.Router();
const {
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
} = require('../controllers/roomController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/', getRooms);
router.post('/', verifyToken, isAdmin, createRoom);
router.put('/:id', verifyToken, isAdmin, updateRoom);
router.delete('/:id', verifyToken, isAdmin, deleteRoom);

module.exports = router;