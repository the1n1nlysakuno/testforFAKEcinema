import { NavLink } from 'react-router-dom';

export default function AdminNav() {
  return (
    <nav className="admin-nav" aria-label="Quản trị demo">
      <NavLink end to="/admin">📊 Tổng quan</NavLink>
      <NavLink to="/admin/phim">🎬 Quản lý phim</NavLink>
      <NavLink to="/admin/phong">🏢 Quản lý phòng</NavLink>
      <NavLink to="/admin/suat-chieu">🕒 Quản lý suất chiếu</NavLink>
    </nav>
  );
}
