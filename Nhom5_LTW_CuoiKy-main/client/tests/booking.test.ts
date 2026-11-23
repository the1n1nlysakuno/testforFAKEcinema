import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTotal, formatPrice, isValidEmail, isValidPhone } from '../src/utils/booking';

test('tính tổng tiền theo số ghế', () => {
  assert.equal(calculateTotal(80000, ['A1', 'A2', 'A3']), 240000);
});

test('kiểm tra email hợp lệ và không hợp lệ', () => {
  assert.equal(isValidEmail('user@gmail.com'), true);
  assert.equal(isValidEmail('usergmail.com'), false);
});

test('kiểm tra số điện thoại gồm 10 chữ số', () => {
  assert.equal(isValidPhone('0912345678'), true);
  assert.equal(isValidPhone('12345'), false);
});

test('định dạng tiền tệ tiếng Việt', () => {
  assert.equal(formatPrice(85000), '85.000 đ');
});
