import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Showtime } from '../../types';
import AdminNav from '../../components/AdminNav';
import { useCatalog } from '../../context/CatalogContext';

function today(): string { return new Date().toLocaleDateString('en-CA'); }

export default function ManageShowtimes() {
  const { movies, cinemas, rooms, showtimes, saveShowtime, deleteShowtime } = useCatalog();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [movieId, setMovieId] = useState('');
  const [cinemaId, setCinemaId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [date, setDate] = useState(today());
  const [time, setTime] = useState('19:00');
  const [error, setError] = useState('');
  const currentCinema = cinemaId || cinemas[0]?.id || '';
  const availableRooms = rooms.filter(room => room.cinemaId === currentCinema);

  function startEdit(item: Showtime) {
    setEditingId(item.id); setMovieId(item.movieId); setCinemaId(item.cinemaId);
    setRoomId(item.roomId); setDate(item.date); setTime(item.time); setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function reset() {
    setEditingId(null); setMovieId(''); setCinemaId(''); setRoomId('');
    setDate(today()); setTime('19:00'); setError('');
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const selectedMovie = movieId || movies[0]?.id;
    const selectedRoom = availableRooms.find(r => r.id === roomId) ?? availableRooms[0];
    if (!selectedMovie || !selectedRoom) return setError('Chưa có phim hoặc phòng chiếu để xếp lịch.');
    if (!date || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return setError('Ngày hoặc giờ chiếu không hợp lệ.');
    if (showtimes.some(item => item.id !== editingId && item.roomId === selectedRoom.id && item.date === date && item.time === time)) return setError('Phòng đã có suất chiếu trùng ngày và giờ này.');
    saveShowtime({ id: editingId ?? `suat-${Date.now()}`, movieId: selectedMovie, cinemaId: currentCinema,
      roomId: selectedRoom.id, date, time });
    reset();
  }

  return (
    <div className="container page-section">
      <div className="page-title"><p className="eyebrow">QUẢN TRỊ DEMO</p><h1>Quản lý lịch chiếu</h1><p>Tạo suất chiếu theo phim, rạp, phòng, ngày và giờ.</p></div>
      <AdminNav />
      <section className="admin-panel"><h2>{editingId ? 'Sửa suất chiếu' : 'Xếp suất chiếu mới'}</h2>
        <form onSubmit={submit} noValidate><div className="admin-form-grid">
          <label className="form-label">Phim<select value={movieId || movies[0]?.id || ''} onChange={e => setMovieId(e.target.value)}>{movies.map(movie => <option key={movie.id} value={movie.id}>{movie.title}</option>)}</select></label>
          <label className="form-label">Rạp<select value={currentCinema} onChange={e => { setCinemaId(e.target.value); setRoomId(''); }}>{cinemas.map(cinema => <option key={cinema.id} value={cinema.id}>{cinema.name}</option>)}</select></label>
          <label className="form-label">Phòng<select value={availableRooms.find(r => r.id === roomId)?.id || availableRooms[0]?.id || ''} onChange={e => setRoomId(e.target.value)}>{availableRooms.map(room => <option key={room.id} value={room.id}>{room.name}</option>)}</select></label>
          <label className="form-label">Ngày chiếu<input type="date" value={date} onChange={e => setDate(e.target.value)} /></label>
          <label className="form-label">Giờ chiếu<input type="time" value={time} onChange={e => setTime(e.target.value)} /></label>
        </div>{error && <p className="form-error">{error}</p>}
        <div className="admin-actions"><button className="btn btn-primary">{editingId ? 'Lưu lịch chiếu' : 'Thêm suất chiếu'}</button>{editingId && <button className="btn btn-outline" type="button" onClick={reset}>Hủy</button>}</div></form>
      </section>
      <section className="admin-panel"><h2>Danh sách suất chiếu đã xếp ({showtimes.length})</h2>
        {showtimes.length === 0 ? <p>Chưa có suất chiếu riêng. Trang đặt vé sẽ hiển thị khung giờ mẫu từ dữ liệu phim.</p> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Phim</th><th>Rạp</th><th>Phòng</th><th>Ngày/giờ</th><th>Thao tác</th></tr></thead><tbody>{showtimes.slice().sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).map(item => <tr key={item.id}><td>{movies.find(m => m.id === item.movieId)?.title ?? 'Phim đã xóa'}</td><td>{cinemas.find(c => c.id === item.cinemaId)?.name ?? 'Rạp đã xóa'}</td><td>{rooms.find(r => r.id === item.roomId)?.name ?? 'Phòng đã xóa'}</td><td>{item.date} {item.time}</td><td><div className="admin-actions"><button className="btn btn-small btn-outline" onClick={() => startEdit(item)}>Sửa</button><button className="btn btn-small btn-outline admin-danger" onClick={() => { if (window.confirm('Xóa suất chiếu này?')) deleteShowtime(item.id); }}>Xóa</button></div></td></tr>)}</tbody></table></div>}
      </section>
    </div>
  );
}
