import type { Movie } from '../types';
import { Link } from 'react-router-dom';

export function MoviePoster({ movie, large = false }: { movie: Movie; large?: boolean }) {
  return (
    <div className={`movie-poster ${movie.poster} ${large ? 'poster-large' : ''}`} role="img" aria-label={`Minh họa phim ${movie.title}`}>
      <span className="poster-orbit" />
      <span className="poster-emoji">{movie.emoji}</span>
      <div className="poster-bottom"><small>CGV DEMO ORIGINAL</small><strong>{movie.title}</strong><em>{movie.tagline}</em></div>
    </div>
  );
}

export default function MovieCard({ movie }: { movie: Movie }) {
  return (
    <article className="movie-card">
      <Link to={`/phim/${movie.id}`} className="movie-poster-link"><MoviePoster movie={movie} /></Link>
      <div className="movie-info">
        <span className="age-mark">{movie.age}</span>
        <h3><Link to={`/phim/${movie.id}`}>{movie.title}</Link></h3>
        <p>{movie.genre} · {movie.duration} phút</p>
        <div className="movie-actions">
          <Link className="btn btn-small btn-outline" to={`/phim/${movie.id}`}>Chi tiết</Link>
          <Link className="btn btn-small btn-primary" to={`/dat-ve/${movie.id}`}>Đặt vé</Link>
        </div>
      </div>
    </article>
  );
}
