import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Cinema, Movie, Room, Showtime } from '../types';
import useFetch from '../hooks/useFetch';

interface CatalogValue {
  movies: Movie[];
  cinemas: Cinema[];
  rooms: Room[];
  showtimes: Showtime[];
  loading: boolean;
  error: string;
  retry: () => void;
  saveMovie: (movie: Movie) => void;
  deleteMovie: (id: string) => void;
  saveCinema: (cinema: Cinema) => void;
  saveRoom: (room: Room) => void;
  deleteRoom: (id: string) => void;
  saveShowtime: (showtime: Showtime) => void;
  deleteShowtime: (id: string) => void;
}

const CatalogContext = createContext<CatalogValue | undefined>(undefined);

function readLocal<T>(key: string): T | null {
  try {
    const saved = localStorage.getItem(key);
    return saved === null ? null : JSON.parse(saved) as T;
  } catch {
    return null;
  }
}

function makeDefaultRooms(cinemas: Cinema[]): Room[] {
  return cinemas.flatMap(cinema => Array.from({ length: cinema.rooms }, (_, index) => ({
    id: `${cinema.id}-phong-${index + 1}`,
    cinemaId: cinema.id,
    name: `Phòng ${index + 1}`,
    capacity: 60
  })));
}

function saveOrReplace<T extends { id: string }>(items: T[], item: T): T[] {
  return items.some(old => old.id === item.id)
    ? items.map(old => old.id === item.id ? item : old)
    : [...items, item];
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const movieFetch = useFetch<Movie[]>(import.meta.env.BASE_URL + 'data/movies.json');
  const cinemaFetch = useFetch<Cinema[]>(import.meta.env.BASE_URL + 'data/cinemas.json');
  const [savedMovies, setSavedMovies] = useState<Movie[] | null>(() => readLocal<Movie[]>('cgv_admin_movies'));
  const [savedCinemas, setSavedCinemas] = useState<Cinema[] | null>(() => readLocal<Cinema[]>('cgv_admin_cinemas'));
  const [savedRooms, setSavedRooms] = useState<Room[] | null>(() => readLocal<Room[]>('cgv_admin_rooms'));
  const [showtimes, setShowtimes] = useState<Showtime[]>(() => readLocal<Showtime[]>('cgv_admin_showtimes') ?? []);

  const movies = savedMovies ?? movieFetch.data ?? [];
  const cinemas = savedCinemas ?? cinemaFetch.data ?? [];
  const rooms = savedRooms ?? makeDefaultRooms(cinemas);

  useEffect(() => { if (savedMovies !== null) localStorage.setItem('cgv_admin_movies', JSON.stringify(savedMovies)); }, [savedMovies]);
  useEffect(() => { if (savedCinemas !== null) localStorage.setItem('cgv_admin_cinemas', JSON.stringify(savedCinemas)); }, [savedCinemas]);
  useEffect(() => { if (savedRooms !== null) localStorage.setItem('cgv_admin_rooms', JSON.stringify(savedRooms)); }, [savedRooms]);
  useEffect(() => { localStorage.setItem('cgv_admin_showtimes', JSON.stringify(showtimes)); }, [showtimes]);

  function deleteMovie(id: string) {
    setSavedMovies(movies.filter(movie => movie.id !== id));
    setShowtimes(prev => prev.filter(showtime => showtime.movieId !== id));
  }

  function deleteRoom(id: string) {
    setSavedRooms(rooms.filter(room => room.id !== id));
    setShowtimes(prev => prev.filter(showtime => showtime.roomId !== id));
  }

  return (
    <CatalogContext.Provider value={{
      movies, cinemas, rooms, showtimes,
      loading: movieFetch.loading || cinemaFetch.loading,
      error: movieFetch.error || cinemaFetch.error,
      retry: () => { movieFetch.retry(); cinemaFetch.retry(); },
      saveMovie: movie => setSavedMovies(saveOrReplace(movies, movie)),
      deleteMovie,
      saveCinema: cinema => setSavedCinemas(saveOrReplace(cinemas, cinema)),
      saveRoom: room => setSavedRooms(saveOrReplace(rooms, room)),
      deleteRoom,
      saveShowtime: showtime => setShowtimes(prev => saveOrReplace(prev, showtime)),
      deleteShowtime: id => setShowtimes(prev => prev.filter(item => item.id !== id))
    }}>
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog(): CatalogValue {
  const context = useContext(CatalogContext);
  if (!context) throw new Error('useCatalog cần được sử dụng trong CatalogProvider');
  return context;
}
