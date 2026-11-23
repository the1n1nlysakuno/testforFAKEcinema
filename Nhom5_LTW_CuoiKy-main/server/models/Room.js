const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên phòng'],
    trim: true,
    unique: true,
  },
  rows: {
    type: Number,
    required: [true, 'Vui lòng nhập số hàng ghế'],
    min: [1, 'Số hàng tối thiểu là 1'],
    max: [26, 'Số hàng tối đa là 26 (A-Z)'],
    validate: { validator: Number.isInteger, message: 'Số hàng phải là số nguyên' },
  },
  cols: {
    type: Number,
    required: [true, 'Vui lòng nhập số ghế mỗi hàng'],
    min: [1, 'Số ghế mỗi hàng tối thiểu là 1'],
    max: [30, 'Số ghế mỗi hàng tối đa là 30'],
    validate: { validator: Number.isInteger, message: 'Số ghế mỗi hàng phải là số nguyên' },
  },
  
  vipRows: {
    type: [Number],
    default: [],
    validate: {
      validator: function (arr) {
        return arr.every((r) => Number.isInteger(r) && r >= 0 && r < this.rows);
      },
      message: 'vipRows chứa hàng không tồn tại trong phòng',
    },
  },
});

module.exports = mongoose.model('Room', roomSchema);
