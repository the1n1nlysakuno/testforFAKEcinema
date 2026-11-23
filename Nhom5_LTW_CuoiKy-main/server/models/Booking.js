const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    showtimeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Showtime',
      required: true,
    },
    seats: {
      type: [String], // ví dụ: ["F5", "F6"]
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'Phải có ít nhất 1 ghế',
      },
    },
    totalPrice: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['paid', 'cancelled'],
      default: 'paid',
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

bookingSchema.index(
  { showtimeId: 1, seats: 1 },
  { unique: true, partialFilterExpression: { status: 'paid' } }
);

bookingSchema.statics.getBookedSeats = async function (showtimeId) {
  const bookings = await this.find({ showtimeId, status: 'paid' }).select('seats');
  return bookings.flatMap((b) => b.seats);
};

module.exports = mongoose.model('Booking', bookingSchema);
