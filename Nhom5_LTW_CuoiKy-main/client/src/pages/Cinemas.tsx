import { useCatalog } from '../context/CatalogContext';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loading, ErrorMessage } from '../components/Status';

export default function Cinemas() {
  const { cinemas: data, rooms, loading, error, retry } = useCatalog();
  const [city, setCity] = useState('Tất cả');
  const cities = data ? ['Tất cả', ...new Set(data.map(item => item.city))] : ['Tất cả'];
  const filtered = data ? data.filter(item => city === 'Tất cả' || item.city === city) : [];

  return <div className="container page-section"><div className="page-title"><p className="eyebrow">HỆ THỐNG RẠP</p><h1>Rạp CGV Demo</h1><p>Danh sách địa điểm minh họa để lựa chọn khi đặt vé.</p></div><div className="filter-bar"><label className="select-wrap">Chọn khu vực <select value={city} onChange={event => setCity(event.target.value)}>{cities.map(value => <option key={value}>{value}</option>)}</select></label></div>{loading ? <Loading /> : error ? <ErrorMessage message={error} onRetry={retry} /> : <div className="cinema-grid">{filtered.map(cinema => <article className="cinema-card" key={cinema.id}><div className="cinema-illustration">🎦</div><div><span className="eyebrow">{cinema.city}</span><h2>{cinema.name}</h2><p>📍 {cinema.address}</p><p>🎞️ {rooms.filter(room => room.cinemaId === cinema.id).length} phòng chiếu mẫu</p><Link className="read-more" to="/phim">Chọn phim để đặt vé →</Link></div></article>)}</div>}<p className="notice">Địa chỉ và tên rạp trong trang này là ví dụ phục vụ thực hành, không sử dụng để đi tới rạp thật.</p></div>;
}
