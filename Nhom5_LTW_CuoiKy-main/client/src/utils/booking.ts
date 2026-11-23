// Những hàm nhỏ, có khai báo kiểu đầu vào/đầu ra bằng TypeScript.
export function formatPrice(number: number): string {
  return number.toLocaleString('vi-VN') + ' đ';
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
  return /^0\d{9}$/.test(phone.trim());
}

export function calculateTotal(price: number, seats: string[]): number {
  return price * seats.length;
}

export interface DateOption {
  value: string;
  label: string;
}

export function getDateOptions(): DateOption[] {
  const days: DateOption[] = [];
  for (let i = 0; i < 5; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    days.push({ value: `${year}-${month}-${day}`, label: `${day}/${month}` });
  }
  return days;
}
