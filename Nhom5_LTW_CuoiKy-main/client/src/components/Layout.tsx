import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Layout() {
  const { user, logout, myTickets } = useApp();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <>
      <div className="topbar">
        <div className="container topbar-inner">
          <span>🎬 Bài tập frontend React • Website minh họa</span>
          <span>Khám phá điện ảnh mỗi ngày</span>
        </div>
      </div>
      <header className="site-header">
        <div className="container header-inner">
          <Link className="brand" to="/" aria-label="Về trang chủ">CGV<span className="brand-flower">✳</span><small>DEMO</small></Link>
          <nav className="main-nav" aria-label="Điều hướng chính">
            <NavLink to="/" end>Trang chủ</NavLink>
            <NavLink to="/phim">Phim</NavLink>
            <NavLink to="/rap">Rạp CGV</NavLink>
            <NavLink to="/uu-dai">Tin mới & Ưu đãi</NavLink>
            {user?.role === 'admin' && <NavLink to="/admin">Quản trị</NavLink>}
            <NavLink to="/ve-cua-toi">Vé của tôi <span className="ticket-count">{myTickets.length}</span></NavLink>
          </nav>
          <div className="account-area">
            {user ? (
              <><span className="user-name">Xin chào, {user.name}</span><button className="link-button" onClick={handleLogout}>Đăng xuất</button></>
            ) : <><Link className="login-link" to="/dang-nhap">Đăng nhập</Link><Link className="login-link" to="/dang-ky">Đăng ký</Link></>}
          </div>
        </div>
      </header>
      <main className="main-content"><Outlet /></main>
      <footer className="site-footer">
        <div className="container footer-grid">
          <div><div className="footer-logo">CGV <span>DEMO</span></div><p>Dự án học tập xây dựng bằng React, React Router, Hooks và CSS thuần.</p></div>
          <div><h3>Khám phá</h3><Link to="/phim">Phim đang chiếu</Link><Link to="/rap">Danh sách rạp</Link><Link to="/uu-dai">Tin mới & ưu đãi</Link></div>
          <div><h3>Lưu ý</h3><p>Dữ liệu phim, rạp và đặt vé chỉ để minh họa, không kết nối hệ thống CGV thật và không thanh toán thật.</p></div>
        </div>
        <p className="copyright">© 2026 CGV Demo — Sản phẩm phục vụ môn Lập trình Web.</p>
      </footer>
    </>
  );
}
