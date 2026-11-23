import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Movie } from '../../types';
import AdminNav from '../../components/AdminNav';
import { useCatalog } from '../../context/CatalogContext';
import { formatPrice } from '../../utils/booking';

interface MovieForm {
  title: string;
  genre: string;
  duration: string;
  age: string;
  price: string;
  description: string;
  showtimes: string;
}

const emptyForm: MovieForm = { title: '', genre: '', duration: '100', age: 'P', price: '80000', description: '', showtimes: '10:00, 14:00, 19:00' };

export default function ManageMovies() {
  const { movies, saveMovie, deleteMovie } = useCatalog();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MovieForm>(emptyForm);
  const [error, setError] = useState('');

  function startEdit(movie: Movie) {
    setEditingId(movie.id);
    setForm({ title: movie.title, genre: movie.genre, duration: String(movie.duration), age: movie.age,
      price: String(movie.price), description: movie.description, showtimes: movie.showtimes.join(', ') });
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const duration = Number(form.duration);
    const price = Number(form.price);
    const times = form.showtimes.split(',').map(time => time.trim()).filter(Boolean);
    if (!form.title.trim() || !form.genre.trim()) return setError('Vui lòng nhập tên và thể loại phim.');
    if (!Number.isFinite(duration) || duration <= 0 || !Number.isFinite(price) || price <= 0) return setError('Thời lượng và giá vé phải là số dương.');
    if (!times.length || times.some(time => !/^([01]\d|2[0-3]):[0-5]\d$/.test(time))) return setError('Giờ chiếu phải có dạng HH:MM, cách nhau bằng dấu phẩy.');

    const oldMovie = movies.find(movie => movie.id === editingId);
    const movie: Movie = {
      id: oldMovie?.id ?? `phim-${Date.now()}`,
      title: form.title.trim(), tagline: oldMovie?.tagline ?? 'Phim mới tại CGV Demo',
      genre: form.genre.trim(), duration, age: form.age.trim() || 'P',
      release: oldMovie?.release ?? new Date().toISOString().slice(0, 10),
      rating: oldMovie?.rating ?? 8, emoji: oldMovie?.emoji ?? '🎬', poster: oldMovie?.poster ?? 'poster-space',
      description: form.description.trim() || 'Phim demo dành cho bài tập quản lý phim.',
      director: oldMovie?.director ?? 'Đang cập nhật', actors: oldMovie?.actors ?? 'Đang cập nhật',
      price, showtimes: times
    };
    saveMovie(movie);
    cancelEdit();
  }

  return (
    <div className="container page-section">
      <div className="page-title"><p className="eyebrow">QUẢN TRỊ DEMO</p><h1>Quản lý phim</h1><p>Thêm, sửa và xóa phim bằng React useState và localStorage.</p></div>
      <AdminNav />
      <section className="admin-panel"><h2>{editingId ? 'Sửa thông tin phim' : 'Thêm phim mới'}</h2>
        <form onSubmit={submit} noValidate>
          <div className="admin-form-grid">
            <label className="form-label">Tên phim<input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></label>
            <label className="form-label">Thể loại<input value={form.genre} onChange={e => setForm({ ...form, genre: e.target.value })} /></label>
            <label className="form-label">Thời lượng (phút)<input type="number" min="1" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} /></label>
            <label className="form-label">Độ tuổi<input value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} /></label>
            <label className="form-label">Giá vé (đ)<input type="number" min="1000" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></label>
            <label className="form-label">Giờ chiếu mặc định (HH:MM, ...)<input value={form.showtimes} onChange={e => setForm({ ...form, showtimes: e.target.value })} /></label>
          </div>
          <label className="form-label">Mô tả phim<textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="admin-actions"><button className="btn btn-primary" type="submit">{editingId ? 'Lưu chỉnh sửa' : 'Thêm phim'}</button>{editingId && <button className="btn btn-outline" type="button" onClick={cancelEdit}>Hủy</button>}</div>
        </form>
      </section>
      <section className="admin-panel"><h2>Danh sách phim ({movies.length})</h2>
        <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Phim</th><th>Thể loại</th><th>Thời lượng</th><th>Giá vé</th><th>Thao tác</th></tr></thead><tbody>{movies.map(movie => <tr key={movie.id}><td><strong>{movie.title}</strong></td><td>{movie.genre}</td><td>{movie.duration} phút</td><td>{formatPrice(movie.price)}</td><td><div className="admin-actions"><button className="btn btn-outline btn-small" onClick={() => startEdit(movie)}>Sửa</button><button className="btn btn-outline btn-small admin-danger" onClick={() => { if (window.confirm(`Xóa phim ${movie.title}?`)) deleteMovie(movie.id); }}>Xóa</button></div></td></tr>)}</tbody></table></div>
      </section>
    </div>
  );
}
