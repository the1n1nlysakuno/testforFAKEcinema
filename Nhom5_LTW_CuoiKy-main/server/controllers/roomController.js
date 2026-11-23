const mongoose = require('mongoose');
const Room = require('../models/Room');
const Showtime = require('../models/Showtime');
const Booking = require('../models/Booking');

const MAX_ROWS = 26;
const MAX_COLS = 30;

const parseRoomBody = (body) => {
  const { name } = body;
  const rows = Number(body.rows);
  const cols = Number(body.cols);
  const vipRows = body.vipRows ?? [];

  if (typeof name !== 'string' || !name.trim()) {
    return { error: 'Vui lòng nhập tên phòng' };
  }
  if (!Number.isInteger(rows) || rows < 1 || rows > MAX_ROWS) {
    return { error: `Số hàng phải là số nguyên từ 1 đến ${MAX_ROWS}` };
  }
  if (!Number.isInteger(cols) || cols < 1 || cols > MAX_COLS) {
    return { error: `Số ghế mỗi hàng phải là số nguyên từ 1 đến ${MAX_COLS}` };
  }
  if (!Array.isArray(vipRows)) {
    return { error: 'vipRows phải là một mảng số' };
  }

 
  const vipList = [...new Set(vipRows.map(Number))].sort((a, b) => a - b);
  if (vipList.some((r) => !Number.isInteger(r) || r < 0 || r >= rows)) {
    return { error: `Hàng VIP phải là số nguyên từ 0 đến ${rows - 1}` };
  }

  return { data: { name: name.trim(), rows, cols, vipRows: vipList } };
};

const getRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find().sort({ name: 1 });
    res.status(200).json(rooms);
  } catch (err) {
    next(err);
  }
};

const createRoom = async (req, res, next) => {
  try {
    const { error, data } = parseRoomBody(req.body);
    if (error) {
      return res.status(400).json({ message: error });
    }

    const room = await Room.create(data);
    res.status(201).json(room);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Tên phòng đã tồn tại' });
    }
    next(err);
  }
};

const updateRoom = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ message: 'Không tìm thấy phòng chiếu' });
    }
    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ message: 'Không tìm thấy phòng chiếu' });
    }

    const { error, data } = parseRoomBody(req.body);
    if (error) {
      return res.status(400).json({ message: error });
    }

    const layoutChanged =
      data.rows !== room.rows ||
      data.cols !== room.cols ||
      JSON.stringify(data.vipRows) !== JSON.stringify(Array.from(room.vipRows));

    if (layoutChanged) {
      const showtimeIds = await Showtime.find({ roomId: id }).distinct('_id');
      const hasBookings =
        showtimeIds.length > 0 &&
        (await Booking.exists({ showtimeId: { $in: showtimeIds }, status: 'paid' }));
      if (hasBookings) {
        return res.status(400).json({
          message: 'Phòng đã có vé được đặt, không thể đổi số hàng, số ghế hoặc hàng VIP (chỉ đổi được tên)',
        });
      }
    }

    room.set(data);
    await room.save();
    res.status(200).json(room);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Tên phòng đã tồn tại' });
    }
    next(err);
  }
};

const deleteRoom = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ message: 'Không tìm thấy phòng chiếu' });
    }
    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ message: 'Không tìm thấy phòng chiếu' });
    }

    // Không xóa phòng đang có suất chiếu (tránh suất chiếu và vé bị "mồ côi")
    if (await Showtime.exists({ roomId: id })) {
      return res
        .status(400)
        .json({ message: 'Phòng đang có suất chiếu, không thể xóa' });
    }

    await room.deleteOne();
    res.status(200).json({ message: 'Đã xóa phòng chiếu' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getRooms, createRoom, updateRoom, deleteRoom };
