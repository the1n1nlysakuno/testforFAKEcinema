const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema({
  movieId: {
    type: String,
    ref: 'Movie',
    required: true,
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
  },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  price: { type: Number, required: true, min: 0 }, 
  vipPrice: { type: Number, required: true, min: 0 },
});

showtimeSchema.index({ roomId: 1, startTime: 1 });

module.exports = mongoose.model('Showtime', showtimeSchema);
