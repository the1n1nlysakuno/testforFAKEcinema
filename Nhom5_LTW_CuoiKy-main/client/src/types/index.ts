export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface MovieGenre {
  id: number;
  name: string;
}

export interface MovieCastMember {
  name: string;
  character: string;
  profile_path: string | null;
}

export interface Movie {
  id: string;
  tmdb_id?: number;
  title: string;
  original_title?: string;
  tagline: string;
  genre: string;
  genres?: MovieGenre[];
  duration: number;
  age: string;
  release: string;
  rating: number;
  emoji: string;
  poster: string;
  poster_url?: string;
  backdrop_url?: string;
  description: string;
  director: string;
  actors: string;
  price: number;
  showtimes: string[];
  spoken_languages?: string[];
  subtitles?: string[];
  trailer_youtube_key?: string;
  cast?: MovieCastMember[];
}

export interface Cinema {
  id: string;
  name: string;
  city: string;
  address: string;
  rooms: number;
}

export interface Showtime {
  id: string;
  movieId: string;
  cinemaId: string;
  room: string;
  startTime: string;
  price: number;
  bookedSeats: string[];
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Booking {
  id: string;
  userId: string;
  showtimeId: string;
  seats: string[];
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type CreateMoviePayload = Omit<Movie, 'id'> & { id?: string };
export type UpdateMoviePayload = Partial<Omit<Movie, 'id'>>;

export interface CreateShowtimePayload {
  movieId: string;
  cinemaId: string;
  room: string;
  startTime: string;
  price: number;
  bookedSeats?: string[];
}

export interface CreateBookingPayload {
  showtimeId: string;
  seats: string[];
  totalPrice?: number;
  userId?: string;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  tickets: number;
}

export interface MovieRevenue {
  movieId: string;
  title: string;
  revenue: number;
  tickets: number;
}

export interface RevenueStats {
  totalRevenue: number;
  totalBookings: number;
  totalTickets: number;
  revenueByDate: DailyRevenue[];
  revenueByMovie: MovieRevenue[];
}
