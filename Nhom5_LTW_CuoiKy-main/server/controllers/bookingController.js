const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const Room = require('../models/Room');

const MAX_SEATS = 8;
const CANCEL_LIMIT_MS = 2 * 60 * 60 * 1000; 

const parseSeat = (seat) => {
  const match = /^([A-Z])(\d{1,2})$/.exec(seat);
  if (!match) return null;
  return { rowIndex: match[1].charCodeAt(0) - 65, col: Number(match[2]) };
};

const createBooking = async (req, res, next) => {
  try {
    const { showtimeId, seats } = req.body;

    if (!mongoose.isValidObjectId(showtimeId)) {
      return res.status(400).json({ message: 'showtimeId không hợp lệ' });
    }
    if (!Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ message: 'Vui lòng chọn ít nhất 1 ghế' });
    }

    const seatList = [...new Set(seats.map((s) => String(s).trim().toUpperCase()))];
    if (seatList.length > MAX_SEATS) {
      return res.status(400).json({ message: `Chỉ được đặt tối đa ${MAX_SEATS} ghế mỗi lần` });
    }

    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) {
      return res.status(404).json({ message: 'Không tìm thấy suất chiếu' });
    }
    if (showtime.startTime.getTime() <= Date.now()) {
      return res.status(400).json({ message: 'Suất chiếu đã bắt đầu, không thể đặt vé' });
    }
    const room = await Room.findById(showtime.roomId);
    if (!room) {
      return res.status(404).json({ message: 'Không tìm thấy phòng chiếu' });
    }

    let totalPrice = 0;
    const invalidSeats = [];
    for (const seat of seatList) {
      const pos = parseSeat(seat);
      if (!pos || pos.rowIndex >= room.rows || pos.col < 1 || pos.col > room.cols) {
        invalidSeats.push(seat);
        continue;
      }
      totalPrice += room.vipRows.includes(pos.rowIndex) ? showtime.vipPrice : showtime.price;
    }
    if (invalidSeats.length > 0) {
      return res
        .status(400)
        .json({ message: 'Ghế không tồn tại trong phòng chiếu', invalidSeats });
    }

    const bookedSeats = await Booking.getBookedSeats(showtimeId);
    const conflictSeats = seatList.filter((s) => bookedSeats.includes(s));
    if (conflictSeats.length > 0) {
      return res.status(409).json({
        message: `Ghế ${conflictSeats.join(', ')} vừa có người đặt`,
        conflictSeats,
      });
    }

    try {
      const booking = await Booking.create({
        userId: req.user.id,
        showtimeId,
        seats: seatList,
        totalPrice,
      });
      return res.status(201).json(booking);
    } catch (err) {
      if (err.code === 11000) {
        const nowBooked = await Booking.getBookedSeats(showtimeId);
        const conflicts = seatList.filter((s) => nowBooked.includes(s));
        const conflictList = conflicts.length > 0 ? conflicts : seatList;
        return res.status(409).json({
          message: `Ghế ${conflictList.join(', ')} vừa có người đặt`,
          conflictSeats: conflictList,
        });
      }
      throw err; 
    }
  } catch (err) {
    next(err);
  }
};

const getMyTickets = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate({
        path: 'showtimeId',
        populate: [{ path: 'movieId' }, { path: 'roomId', select: 'name' }],
      })
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (err) {
    next(err);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ message: 'Không tìm thấy vé' });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy vé' });
    }

    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bạn không có quyền hủy vé này' });
    }
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Vé này đã được hủy trước đó' });
    }

    const showtime = await Showtime.findById(booking.showtimeId);
    if (!showtime) {
      return res.status(404).json({ message: 'Không tìm thấy suất chiếu của vé' });
    }
    if (showtime.startTime.getTime() - Date.now() < CANCEL_LIMIT_MS) {
      return res
        .status(400)
        .json({ message: 'Chỉ được hủy vé trước giờ chiếu ít nhất 2 tiếng' });
    }

    booking.status = 'cancelled'; 
    await booking.save();

    res.status(200).json({ message: 'Hủy vé thành công', booking });
  } catch (err) {
    next(err);
  }
};

module.exports = { createBooking, getMyTickets, cancelBooking };
