import { useCatalog } from '../context/CatalogContext';
import { useState } from 'react';
import MovieCard from '../components/MovieCard';
import { Loading, ErrorMessage } from '../components/Status';

export default function Movies() {
  const { movies: data, loading, error, retry } = useCatalog();
  const [keyword, setKeyword] = useState('');
  const [genre, setGenre] = useState('Tất cả');

  const genres = data ? ['Tất cả', ...new Set(data.map(movie => movie.genre))] : ['Tất cả'];
  const filtered = data ? data.filter(movie => {
    const matchName = movie.title.toLowerCase().includes(keyword.toLowerCase());
    const matchGenre = genre === 'Tất cả' || movie.genre === genre;
    return matchName && matchGenre;
  }) : [];

  return (
    <div className="container page-section">
      <div className="page-title"><p className="eyebrow">LỊCH CHIẾU CỦA BẠN</p><h1>Phim đang chiếu</h1><p>Chọn bộ phim bạn yêu thích để xem thông tin và đặt vé.</p></div>
      <div className="filter-bar"><label className="search-field"><span>⌕</span><input value={keyword} onChange={event => setKeyword(event.target.value)} placeholder="Tìm theo tên phim..." /></label><label className="select-wrap">Thể loại <select value={genre} onChange={event => setGenre(event.target.value)}>{genres.map(item => <option key={item}>{item}</option>)}</select></label></div>
      {loading ? <Loading /> : error ? <ErrorMessage message={error} onRetry={retry} /> : <><p className="result-count">Tìm thấy {filtered.length} bộ phim</p>{filtered.length ? <div className="movie-grid">{filtered.map(movie => <MovieCard key={movie.id} movie={movie} />)}</div> : <div className="status-panel">Không tìm thấy phim phù hợp. Hãy thử từ khóa khác.</div>}</>}
    </div>
  );
}
