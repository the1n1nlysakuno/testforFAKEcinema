import type { Offer } from '../types';
import { useCatalog } from '../context/CatalogContext';
import { Link } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import OfferCard from '../components/OfferCard';
import { Loading, ErrorMessage } from '../components/Status';
import useFetch from '../hooks/useFetch';

export default function Home() {
  const movies = useCatalog();
  const offers = useFetch<Offer[]>(import.meta.env.BASE_URL + 'data/offers.json');

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-content">
            <span className="hero-label">✦ CHÀO MỪNG ĐẾN THẾ GIỚI ĐIỆN ẢNH</span>
            <h1>Khoảnh khắc <em>điện ảnh</em> bắt đầu từ đây.</h1>
            <p>Khám phá bộ phim yêu thích, chọn suất chiếu và trải nghiệm đặt vé ngay trên website demo React của bạn.</p>
            <div className="hero-actions"><Link className="btn btn-light" to="/phim">Khám phá phim <span>→</span></Link><Link className="btn btn-transparent" to="/uu-dai">Xem ưu đãi</Link></div>
            <div className="hero-stats"><span><strong>06</strong><small>Bộ phim demo</small></span><span><strong>03</strong><small>Rạp minh họa</small></span><span><strong>100%</strong><small>React & CSS thuần</small></span></div>
          </div>
          <div className="hero-art" aria-hidden="true"><div className="film-circle circle-one" /><div className="film-circle circle-two" /><div className="hero-ticket"><span>YOUR CINEMA TICKET</span><strong>CGV<span>✳</span></strong><div className="ticket-tear">✦ ✦ ✦</div><small>ADMIT ONE • MOVIE NIGHT</small></div><div className="floating-star star-one">✶</div><div className="floating-star star-two">✦</div></div>
        </div>
      </section>

      <section className="container section">
        <div className="section-heading"><div><p className="eyebrow">CÙNG RA RẠP NÀO</p><h2>Phim đang chiếu</h2></div><Link className="see-all" to="/phim">Xem tất cả phim →</Link></div>
        {movies.loading ? <Loading /> : movies.error ? <ErrorMessage message={movies.error} onRetry={movies.retry} /> : <div className="movie-grid">{movies.movies.slice(0, 4).map(movie => <MovieCard key={movie.id} movie={movie} />)}</div>}
      </section>

      <section className="promo-strip"><div className="container promo-inner"><div className="promo-icon">💳</div><div><span className="eyebrow">CHƯƠNG TRÌNH THÀNH VIÊN</span><h2>THẺ CỨNG “COME BACK”!</h2><p>Giao diện thẻ thành viên mới dành cho khán giả yêu điện ảnh.</p></div><Link to="/uu-dai/the-cung-comeback" className="btn btn-dark">Khám phá ngay →</Link></div></section>

      <section className="container section">
        <div className="section-heading"><div><p className="eyebrow">ĐỪNG BỎ LỠ</p><h2>Tin mới & ưu đãi</h2></div><Link className="see-all" to="/uu-dai">Tất cả tin tức →</Link></div>
        {offers.loading ? <Loading /> : offers.error ? <ErrorMessage message={offers.error} onRetry={offers.retry} /> : <div className="offer-grid">{offers.data?.map(offer => <OfferCard key={offer.id} offer={offer} />)}</div>}
      </section>
    </>
  );
}
