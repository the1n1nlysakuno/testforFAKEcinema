import type {
  Booking,
  Cinema,
  CreateMoviePayload,
  CreateShowtimePayload,
  Movie,
  Showtime,
  UpdateMoviePayload,
} from '../types/index';
import { ApiError, api, isNetworkError } from './api';

export const OFFLINE_MOVIES_KEY = 'cgv_offline_movies';
export const OFFLINE_SHOWTIMES_KEY = 'cgv_offline_showtimes';
export const OFFLINE_BOOKINGS_KEY = 'cgv_offline_bookings';

const DEFAULT_OCCUPIED_SEATS = ['A3', 'A4', 'B6', 'B7', 'C2', 'D8', 'E4', 'F9'];

function readStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

async function fetchStaticJson<T>(relativePath: string): Promise<T> {
  const baseUrl = import.meta.env.BASE_URL || '/';
  const response = await fetch(`${baseUrl}${relativePath}`);
  if (!response.ok) {
    throw new ApiError(
      `Không thể tải dữ liệu tĩnh ${relativePath}.`,
      response.status,
      'STATIC_LOAD_ERROR'
    );
  }
  return (await response.json()) as T;
}

export async function ensureOfflineMovies(): Promise<Movie[]> {
  const cached = readStorage<Movie[]>(OFFLINE_MOVIES_KEY);
  if (cached) return cached;

  const movies = await fetchStaticJson<Movie[]>('data/movies.json');
  writeStorage(OFFLINE_MOVIES_KEY, movies);
  return movies;
}

function buildDefaultShowtimes(movies: Movie[], cinemas: Cinema[]): Showtime[] {
  const today = new Date().toISOString().slice(0, 10);
  const generated: Showtime[] = [];

  movies.forEach((movie, movieIndex) => {
    cinemas.forEach((cinema, cinemaIndex) => {
      movie.showtimes.forEach((time, timeIndex) => {
        const roomNumber = ((movieIndex + cinemaIndex + timeIndex) % cinema.rooms) + 1;
        generated.push({
          id: `${movie.id}__${cinema.id}__${time.replace(':', '')}`,
          movieId: movie.id,
          cinemaId: cinema.id,
          room: `Phòng ${roomNumber}`,
          startTime: `${today}T${time}:00`,
          price: movie.price,
          bookedSeats: [...DEFAULT_OCCUPIED_SEATS],
        });
      });
    });
  });

  return generated;
}

export async function ensureOfflineShowtimes(): Promise<Showtime[]> {
  const cached = readStorage<Showtime[]>(OFFLINE_SHOWTIMES_KEY);
  if (cached) return cached;

  const [movies, cinemas] = await Promise.all([
    ensureOfflineMovies(),
    fetchStaticJson<Cinema[]>('data/cinemas.json'),
  ]);

  const showtimes = buildDefaultShowtimes(movies, cinemas);
  writeStorage(OFFLINE_SHOWTIMES_KEY, showtimes);
  return showtimes;
}

function mergeConfirmedBookingsIntoShowtime(showtime: Showtime): Showtime {
  const bookings = readStorage<Booking[]>(OFFLINE_BOOKINGS_KEY) || [];
  const extraSeats = bookings
    .filter(
      booking => booking.showtimeId === showtime.id && booking.status !== 'cancelled'
    )
    .flatMap(booking => booking.seats);

  const mergedSeats = Array.from(new Set([...showtime.bookedSeats, ...extraSeats]));
  return {
    ...showtime,
    bookedSeats: mergedSeats,
  };
}

export async function getMovies(): Promise<Movie[]> {
  try {
    return await api.get<Movie[]>('/movies');
  } catch (error) {
    if (!isNetworkError(error)) throw error;
    return ensureOfflineMovies();
  }
}

export async function getMovieById(id: string): Promise<Movie> {
  try {
    return await api.get<Movie>(`/movies/${id}`);
  } catch (error) {
    if (!isNetworkError(error)) throw error;
    const movies = await ensureOfflineMovies();
    const movie = movies.find(item => item.id === id);
    if (!movie) {
      throw new ApiError('Không tìm thấy phim.', 404, 'NOT_FOUND');
    }
    return movie;
  }
}

export async function getShowtimesByMovie(movieId: string): Promise<Showtime[]> {
  try {
    return await api.get<Showtime[]>(`/movies/${movieId}/showtimes`);
  } catch (error) {
    if (!isNetworkError(error)) throw error;
    const showtimes = await ensureOfflineShowtimes();
    return showtimes
      .filter(item => item.movieId === movieId)
      .map(mergeConfirmedBookingsIntoShowtime);
  }
}

export async function createMovie(movieData: CreateMoviePayload): Promise<Movie> {
  try {
    return await api.post<Movie>('/movies', movieData);
  } catch (error) {
    if (!isNetworkError(error)) throw error;
    const movies = await ensureOfflineMovies();
    const newMovie: Movie = {
      ...movieData,
      id: movieData.id?.trim() || `movie-${Date.now()}`,
    };
    const nextMovies = [newMovie, ...movies];
    writeStorage(OFFLINE_MOVIES_KEY, nextMovies);

    if (newMovie.showtimes.length > 0) {
      const [existingShowtimes, cinemas] = await Promise.all([
        ensureOfflineShowtimes(),
        fetchStaticJson<Cinema[]>('data/cinemas.json'),
      ]);
      const createdShowtimes = buildDefaultShowtimes([newMovie], cinemas);
      writeStorage(OFFLINE_SHOWTIMES_KEY, [...existingShowtimes, ...createdShowtimes]);
    }

    return newMovie;
  }
}

export async function updateMovie(
  id: string,
  movieData: UpdateMoviePayload
): Promise<Movie> {
  try {
    return await api.put<Movie>(`/movies/${id}`, movieData);
  } catch (error) {
    if (!isNetworkError(error)) throw error;
    const movies = await ensureOfflineMovies();
    const index = movies.findIndex(item => item.id === id);
    if (index === -1) {
      throw new ApiError('Không tìm thấy phim để cập nhật.', 404, 'NOT_FOUND');
    }
    const updated: Movie = { ...movies[index], ...movieData, id };
    const nextMovies = [...movies];
    nextMovies[index] = updated;
    writeStorage(OFFLINE_MOVIES_KEY, nextMovies);
    return updated;
  }
}

export async function deleteMovie(id: string): Promise<void> {
  try {
    await api.delete<void>(`/movies/${id}`);
  } catch (error) {
    if (!isNetworkError(error)) throw error;
    const movies = await ensureOfflineMovies();
    const exists = movies.some(item => item.id === id);
    if (!exists) {
      throw new ApiError('Không tìm thấy phim để xóa.', 404, 'NOT_FOUND');
    }
    writeStorage(
      OFFLINE_MOVIES_KEY,
      movies.filter(item => item.id !== id)
    );
    const showtimes = await ensureOfflineShowtimes();
    writeStorage(
      OFFLINE_SHOWTIMES_KEY,
      showtimes.filter(item => item.movieId !== id)
    );
  }
}

export async function createShowtime(
  showtimeData: CreateShowtimePayload
): Promise<Showtime> {
  try {
    return await api.post<Showtime>('/showtimes', showtimeData);
  } catch (error) {
    if (!isNetworkError(error)) throw error;
    const [movies, showtimes] = await Promise.all([
      ensureOfflineMovies(),
      ensureOfflineShowtimes(),
    ]);
    if (!movies.some(movie => movie.id === showtimeData.movieId)) {
      throw new ApiError('Phim không tồn tại để tạo suất chiếu.', 404, 'NOT_FOUND');
    }

    const newShowtime: Showtime = {
      id: `st-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      movieId: showtimeData.movieId,
      cinemaId: showtimeData.cinemaId,
      room: showtimeData.room,
      startTime: showtimeData.startTime,
      price: showtimeData.price,
      bookedSeats: showtimeData.bookedSeats ? [...showtimeData.bookedSeats] : [],
    };

    writeStorage(OFFLINE_SHOWTIMES_KEY, [...showtimes, newShowtime]);
    return newShowtime;
  }
}
