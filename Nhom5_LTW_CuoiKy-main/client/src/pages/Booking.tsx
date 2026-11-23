import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MoviePoster } from '../components/MovieCard';
import SeatMap from '../components/SeatMap';
import CountdownTimer from '../components/CountdownTimer';
import { Loading, ErrorMessage } from '../components/Status';
import { useApp } from '../context/AppContext';
import { useCatalog } from '../context/CatalogContext';
import { calculateTotal, formatPrice, getDateOptions, isValidPhone } from '../utils/booking';

const DEMO_OCCUPIED = ['A3', 'A4', 'B6', 'B7', 'C2', 'D8', 'E4', 'F9'];

export default function Booking() {
  const { id } = useParams();
  const { user, addTicket, tickets } = useApp();
  const { movies, cinemas, rooms, showtimes, loading, error, retry } = useCatalog();
  const navigate = useNavigate();
  const days = getDateOptions();
  const [date, setDate] = useState(days[0].value);
  const [time, setTime] = useState('');
  const [cinemaId, setCinemaId] = useState('rap-ha-noi');
  const [seats, setSeats] = useState<string[]>([]);
  const [phone, setPhone] = useState('');
  const [errorText, setErrorText] = useState('');
  const [timerKey, setTimerKey] = useState(0);
  const [expired, setExpired] = useState(false);

  if (!user) return <div className="container page-section"><Link to="/dang-nhap">Vui lòng đăng nhập để đặt vé</Link></div>;
  if (loading) return <div className="container page-section"><Loading /></div>;
  if (error) return <div className="container page-section"><ErrorMessage message={error} onRetry={retry} /></div>;

  const movie = movies.find(item => item.id === id);
  if (!movie) return <div className="container page-section"><h1>Không tìm thấy phim</h1><Link to="/phim">Quay lại</Link></div>;
  const cinema = cinemas.find(item => item.id === cinemaId) ?? cinemas[0];
  if (!cinema) return <div className="container page-section">Chưa có rạp chiếu.</div>;

  const customTimes = showtimes.filter(item => item.movieId === movie.id && item.cinemaId === cinema.id && item.date === date);
  const availableTimes = customTimes.length ? [...new Set(customTimes.map(item => item.time))].sort() : movie.showtimes;
  const scheduled = customTimes.find(item => item.time === time);
  const roomId = scheduled?.roomId ?? rooms.find(room => room.cinemaId === cinema.id)?.id;
  const room = rooms.find(room => room.id === roomId);
  const roomName = room?.name ?? 'Phòng mẫu';
  const occupiedSeats = [
    ...DEMO_OCCUPIED,
    ...tickets.filter(ticket => ticket.movieId === movie.id && ticket.cinemaId === cinema.id &&
      ticket.date === date && ticket.time === time && ticket.roomId === roomId)
      .flatMap(ticket => ticket.seats)
  ];

  function resetSeatSelection() {
    setTime(''); setSeats([]); setExpired(false); setTimerKey(n => n + 1); setErrorText('');
  }

  function toggleSeat(seat: string) {
    if (expired || occupiedSeats.includes(seat)) return;
    setSeats(prev => prev.includes(seat) ? prev.filter(item => item !== seat) : [...prev, seat].sort());
    setErrorText('');
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (expired) return setErrorText('Đã hết thời gian giữ ghế demo. Hãy bắt đầu lại.');
    if (!time || !availableTimes.includes(time)) return setErrorText('Hãy chọn một suất chiếu.');
    if (seats.length === 0) return setErrorText('Hãy chọn ít nhất một ghế.');
    if (seats.some(seat => occupiedSeats.includes(seat))) return setErrorText('Có ghế vừa được đặt. Hãy chọn ghế khác.');
    if (!isValidPhone(phone)) return setErrorText('Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0.');
    if (!movie || !cinema || !user) return;

    addTicket({ movieId: movie.id, movie: movie.title, cinema: cinema.name, cinemaId: cinema.id,
      roomId, date, time, seats, total: calculateTotal(movie.price, seats),
      name: user.name, email: user.email, phone });
    navigate('/ve-cua-toi', { state: { justBooked: true } });
  }

  return (
    <div className="container page-section">
      <div className="page-title"><p className="eyebrow">ĐẶT VÉ XEM PHIM</p><h1>Chọn suất chiếu và ghế</h1><p>Đây là quy trình đặt vé minh họa, không thanh toán thực tế.</p></div>
      <div className="booking-layout">
        <form className="booking-main" onSubmit={handleSubmit} noValidate>
          <section className="booking-step"><h2><span>1</span> Chọn rạp và ngày chiếu</h2>
            <label className="form-label">Rạp chiếu<select value={cinema.id} onChange={e => { setCinemaId(e.target.value); resetSeatSelection(); }}>{cinemas.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <div className="date-list">{days.map(day => <button type="button" key={day.value} className={`date-chip ${date === day.value ? 'selected' : ''}`} onClick={() => { setDate(day.value); resetSeatSelection(); }}>{day.label}</button>)}</div>
          </section>
          <section className="booking-step"><h2><span>2</span> Chọn giờ chiếu</h2>
            <div className="showtime-list">{availableTimes.map(item => <button type="button" key={item} className={`time-chip ${time === item ? 'selected' : ''}`} onClick={() => { setTime(item); setSeats([]); setErrorText(''); setExpired(false); setTimerKey(n => n + 1); }}>{item}</button>)}</div>
            {customTimes.length > 0 && <p className="muted">Giờ chiếu này đã được xếp trong phần Admin demo.</p>}
          </section>
          <section className="booking-step"><h2><span>3</span> Chọn ghế</h2>
            <p className="muted">Phòng: <strong>{roomName}</strong></p>
            <CountdownTimer key={timerKey} onExpire={() => { setExpired(true); setSeats([]); }} />
            {expired && <p className="form-error" role="alert">Hết 5 phút. <button className="inline-button" type="button" onClick={() => { setExpired(false); setTimerKey(n => n + 1); }}>Bắt đầu lại</button></p>}
            <SeatMap selectedSeats={seats} occupiedSeats={occupiedSeats} onToggle={toggleSeat} disabled={expired} capacity={room?.capacity ?? 60} />
          </section>
          <section className="booking-step"><h2><span>4</span> Thông tin liên hệ</h2>
            <div className="form-two"><label className="form-label">Họ tên<input value={user.name} disabled /></label><label className="form-label">Email<input value={user.email} disabled /></label></div>
            <label className="form-label">Số điện thoại <span className="required">*</span><input value={phone} onChange={e => { setPhone(e.target.value); setErrorText(''); }} placeholder="Ví dụ: 0912345678" inputMode="numeric" maxLength={10} /></label>
            {errorText && <p className="form-error" role="alert">{errorText}</p>}
            <button className="btn btn-primary btn-large" type="submit" disabled={expired}>Xác nhận đặt vé demo →</button>
          </section>
        </form>
        <aside className="booking-summary"><h2>Thông tin đặt vé</h2>
          <div className="summary-movie"><div className="mini-poster"><MoviePoster movie={movie} /></div><div><h3>{movie.title}</h3><p>{movie.genre}</p><span className="age-mark">{movie.age}</span></div></div>
          <dl className="summary-lines"><div><dt>Rạp</dt><dd>{cinema.name}</dd></div><div><dt>Phòng</dt><dd>{roomName}</dd></div><div><dt>Ngày</dt><dd>{date.split('-').reverse().join('/')}</dd></div><div><dt>Giờ</dt><dd>{time || 'Chưa chọn'}</dd></div><div><dt>Ghế</dt><dd>{seats.length ? seats.join(', ') : 'Chưa chọn'}</dd></div><div><dt>Số lượng</dt><dd>{seats.length} vé</dd></div></dl>
          <div className="total-line"><span>Tổng cộng</span><strong>{formatPrice(calculateTotal(movie.price, seats))}</strong></div>
          <p className="summary-note">Bản demo: dữ liệu chỉ nằm trong trình duyệt, không giữ ghế đồng thời giữa các máy, không thanh toán thật.</p>
        </aside>
      </div>
    </div>
  );
}
