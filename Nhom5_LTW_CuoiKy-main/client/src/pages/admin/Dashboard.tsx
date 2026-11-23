import AdminNav from '../../components/AdminNav';
import { useApp } from '../../context/AppContext';
import { useCatalog } from '../../context/CatalogContext';
import { formatPrice } from '../../utils/booking';

export default function Dashboard() {
  const { tickets } = useApp();
  const { movies, cinemas, rooms, showtimes } = useCatalog();
  const revenue = tickets.reduce((sum, ticket) => sum + ticket.total, 0);

  return (
    <div className="container page-section">
      <div className="page-title"><p className="eyebrow">QUẢN TRỊ DEMO</p><h1>Tổng quan hoạt động</h1><p>Thống kê từ dữ liệu mẫu và vé đặt thử trên trình duyệt này.</p></div>
      <AdminNav />
      <div className="admin-stats">
        <article><span>🎬 Số phim</span><strong>{movies.length}</strong></article>
        <article><span>🏢 Số rạp</span><strong>{cinemas.length}</strong></article>
        <article><span>🚪 Số phòng</span><strong>{rooms.length}</strong></article>
        <article><span>🕒 Suất chiếu đã xếp</span><strong>{showtimes.length}</strong></article>
        <article><span>🎟 Vé demo</span><strong>{tickets.reduce((sum, ticket) => sum + ticket.seats.length, 0)}</strong></article>
        <article><span>💰 Doanh thu mô phỏng</span><strong className="admin-money">{formatPrice(revenue)}</strong></article>
      </div>
      <section className="admin-panel"><h2>Vé đặt gần đây</h2>
        {tickets.length === 0 ? <p>Chưa có lượt đặt vé demo nào.</p> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Mã vé</th><th>Phim</th><th>Rạp</th><th>Ngày</th><th>Số ghế</th><th>Tổng</th></tr></thead><tbody>{tickets.slice(0, 8).map(ticket => <tr key={ticket.id}><td>{ticket.id}</td><td>{ticket.movie}</td><td>{ticket.cinema}</td><td>{ticket.date}</td><td>{ticket.seats.length}</td><td>{formatPrice(ticket.total)}</td></tr>)}</tbody></table></div>}
      </section>
      <p className="notice">Dữ liệu chỉ lưu trong localStorage của máy này. Không phải hệ thống quản lý doanh thu thật.</p>
    </div>
  );
}
