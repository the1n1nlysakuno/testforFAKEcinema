import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { isValidEmail } from '../utils/booking';

export default function Register() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (name.trim().length < 2) return setError('Họ và tên phải có ít nhất 2 ký tự.');
    if (!isValidEmail(email)) return setError('Địa chỉ email không hợp lệ.');
    if (password.length < 6) return setError('Mật khẩu demo cần có từ 6 ký tự.');
    if (password !== confirm) return setError('Hai mật khẩu không trùng khớp.');
    // Demo không lưu mật khẩu: chỉ đặt thông tin hiển thị vào Context/localStorage.
    login(name.trim(), email.trim().toLowerCase(), 'customer');
    navigate('/');
  }

  return (
    <div className="container auth-container">
      <div className="auth-side"><span className="eyebrow">THAM GIA CGV DEMO</span><h1>Tạo tài khoản <em>thành viên</em></h1><p>Đăng ký thử để khám phá phim và đặt vé trực tiếp trên trình duyệt.</p><div className="auth-decor">🎬</div></div>
      <div className="auth-card"><h2>Đăng ký demo</h2><p>Đây là form thực hành React + TypeScript, không tạo tài khoản trên server.</p>
        <form onSubmit={submit} noValidate>
          <label className="form-label">Họ và tên<input value={name} onChange={e => { setName(e.target.value); setError(''); }} placeholder="Nguyễn Văn A" /></label>
          <label className="form-label">Email<input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} placeholder="ban@example.com" /></label>
          <label className="form-label">Mật khẩu demo<input type="password" value={password} onChange={e => { setPassword(e.target.value); setError(''); }} /></label>
          <label className="form-label">Nhập lại mật khẩu<input type="password" value={confirm} onChange={e => { setConfirm(e.target.value); setError(''); }} /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="btn btn-primary btn-large btn-full" type="submit">Đăng ký →</button>
        </form>
        <p>Đã có tài khoản? <Link to="/dang-nhap">Đăng nhập</Link></p>
        <p className="auth-disclaimer">Mật khẩu không được lưu hoặc kiểm tra thật. Không nhập mật khẩu đang dùng trên dịch vụ khác.</p>
      </div>
    </div>
  );
}
