import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatPrice } from '../utils/booking';

export default function MyTickets() {
  const { myTickets } = useApp();
  const location = useLocation();
  return <div className="container page-section"><div className="page-title"><p className="eyebrow">TÀI KHOẢN CỦA BẠN</p><h1>Vé của tôi</h1><p>Quản lý các vé đặt thử đã lưu trên trình duyệt.</p></div>{location.state?.justBooked && <p className="success-message">✓ Bạn đã đặt vé demo thành công!</p>}{myTickets.length === 0 ? <div className="status-panel"><h2>Bạn chưa có vé nào</h2><p>Hãy chọn một bộ phim và trải nghiệm tính năng đặt vé.</p><Link className="btn btn-primary" to="/phim">Chọn phim ngay →</Link></div> : <div className="tickets-list">{myTickets.map(ticket => <article className="ticket-card" key={ticket.id}><div className="ticket-left"><span className="eyebrow">VÉ XEM PHIM • BẢN DEMO</span><h2>{ticket.movie}</h2><p>🏢 {ticket.cinema}</p><div className="ticket-info"><span>📅 {ticket.date.split('-').reverse().join('/')}</span><span>🕒 {ticket.time}</span><span>💺 {ticket.seats.join(', ')}</span></div><p className="ticket-total">Tổng thanh toán mô phỏng: <strong>{formatPrice(ticket.total)}</strong></p></div><div className="ticket-right"><small>MÃ VÉ DEMO</small><strong>{ticket.id}</strong><div className="barcode" aria-hidden="true" /><small>Không có giá trị sử dụng tại rạp</small></div></article>)}</div>}</div>;
}
