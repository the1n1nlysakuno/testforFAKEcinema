import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { isValidEmail } from '../utils/booking';

export default function Login() {
  const { user, login } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [adminDemo, setAdminDemo] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (name.trim().length < 2) return setError('Tên phải có ít nhất 2 ký tự.');
    if (!isValidEmail(email)) return setError('Email chưa đúng định dạng.');
    if (password.length < 6) return setError('Mật khẩu demo phải từ 6 ký tự trở lên.');
    // Chỉ giả lập đăng nhập trong frontend, không xác thực mật khẩu với server.
    login(name.trim(), email.trim().toLowerCase(), adminDemo ? 'admin' : 'customer');
    navigate(location.state?.from || '/', { replace: true });
  }

  if (user) return <div className="container page-section"><div className="status-panel"><h2>Bạn đã đăng nhập</h2><p>Xin chào, {user.name}!</p><Link to="/ve-cua-toi" className="btn btn-primary">Xem vé của tôi</Link></div></div>;

  return <div className="container auth-container"><div className="auth-side"><span className="eyebrow">WELCOME BACK</span><h1>Chào mừng bạn đến với <em>CGV Demo!</em></h1><p>Khám phá phim, lựa chọn ghế và lưu lại những tấm vé xem phim của riêng mình.</p><div className="auth-decor">🎟️</div></div><div className="auth-card"><div className="brand auth-brand">CGV<span className="brand-flower">✳</span></div><h2>Đăng nhập demo</h2><p>Nhập thông tin bất kỳ hợp lệ để thử chức năng đặt vé.</p><form onSubmit={handleSubmit} noValidate><label className="form-label">Họ và tên<input value={name} onChange={event => { setName(event.target.value); setError(''); }} placeholder="Nguyễn Văn A" /></label><label className="form-label">Email<input type="email" value={email} onChange={event => { setEmail(event.target.value); setError(''); }} placeholder="ban@example.com" /></label><label className="form-label">Mật khẩu demo<input type="password" value={password} onChange={event => { setPassword(event.target.value); setError(''); }} placeholder="Ít nhất 6 ký tự" /></label><label className="admin-checkbox"><input type="checkbox" checked={adminDemo} onChange={event => setAdminDemo(event.target.checked)} /> Bật vai trò Admin demo (không phải xác thực thật)</label>{error && <p className="form-error" role="alert">{error}</p>}<button type="submit" className="btn btn-primary btn-large btn-full">Tiếp tục →</button></form><p className="auth-disclaimer">Chưa có tài khoản? <Link to="/dang-ky">Đăng ký demo</Link>. Lưu ý: Đây <strong>không phải</strong> hệ thống tài khoản thật. Mật khẩu không được lưu hoặc kiểm tra ở server. Không dùng mật khẩu cá nhân của bạn.</p></div></div>;
}
