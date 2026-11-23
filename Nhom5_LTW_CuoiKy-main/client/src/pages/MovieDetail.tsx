import { useCatalog } from '../context/CatalogContext';
import { Link, useParams } from 'react-router-dom';
import { MoviePoster } from '../components/MovieCard';
import { Loading, ErrorMessage } from '../components/Status';
import { formatPrice } from '../utils/booking';

export default function MovieDetail() {
  const { id } = useParams(); // Route tham số: /phim/:id
  const { movies: data, loading, error, retry } = useCatalog();
  if (loading) return <div className="container page-section"><Loading /></div>;
  if (error) return <div className="container page-section"><ErrorMessage message={error} onRetry={retry} /></div>;

  const movie = data?.find(item => item.id === id);
  if (!movie) return <div className="container page-section"><h1>Không tìm thấy phim</h1><Link to="/phim">← Quay lại danh sách phim</Link></div>;

  return (
    <div className="container page-section">
      <div className="breadcrumb"><Link to="/">Trang chủ</Link> / <Link to="/phim">Phim</Link> / {movie.title}</div>
      <div className="detail-layout"><div className="detail-poster"><MoviePoster movie={movie} large /></div><div className="detail-body"><p className="eyebrow">THÔNG TIN PHIM</p><h1>{movie.title}</h1><p className="detail-tagline">{movie.tagline}</p><div className="movie-tags"><span>⭐ {movie.rating}/10</span><span>{movie.age}</span><span>{movie.duration} phút</span></div><dl className="movie-metadata"><div><dt>Thể loại</dt><dd>{movie.genre}</dd></div><div><dt>Khởi chiếu</dt><dd>{movie.release.split('-').reverse().join('/')}</dd></div><div><dt>Đạo diễn</dt><dd>{movie.director}</dd></div><div><dt>Diễn viên</dt><dd>{movie.actors}</dd></div></dl><h2>Nội dung phim</h2><p>{movie.description}</p><div className="detail-price">Giá vé demo từ <strong>{formatPrice(movie.price)}</strong></div><Link to={`/dat-ve/${movie.id}`} className="btn btn-primary btn-large">🎟 Đặt vé ngay →</Link></div></div>
      <div className="section showtime-box"><div className="section-heading"><div><p className="eyebrow">LỊCH CHIẾU THAM KHẢO</p><h2>Các suất chiếu</h2></div></div><div className="showtime-list">{movie.showtimes.map(time => <Link key={time} to={`/dat-ve/${movie.id}`} className="time-chip">{time}</Link>)}</div><p className="muted">Đây là giờ chiếu minh họa, không phải dữ liệu cập nhật từ CGV.</p></div>
    </div>
  );
}
