import { Link } from 'react-router-dom';

export default function NotFound() {
  return <div className="container page-section"><div className="status-panel not-found"><span>🎬</span><h1>404 - Không tìm thấy trang</h1><p>Đường dẫn bạn mở không tồn tại trong website demo.</p><Link to="/" className="btn btn-primary">Quay về trang chủ</Link></div></div>;
}
