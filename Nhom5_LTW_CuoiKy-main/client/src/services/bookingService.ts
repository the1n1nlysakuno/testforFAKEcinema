import type {
  Booking,
  CreateBookingPayload,
  DailyRevenue,
  MovieRevenue,
  RevenueStats,
  Showtime,
  User,
} from '../types/index';
import { ApiError, USER_STORAGE_KEY, api, isNetworkError } from './api';
import {
  OFFLINE_BOOKINGS_KEY,
  OFFLINE_SHOWTIMES_KEY,
  ensureOfflineMovies,
  ensureOfflineShowtimes,
} from './movieService';

function readBookings(): Booking[] {
  try {
    const raw = localStorage.getItem(OFFLINE_BOOKINGS_KEY);
    return raw ? (JSON.parse(raw) as Booking[]) : [];
  } catch {
    return [];
  }
}

function writeBookings(bookings: Booking[]): void {
  localStorage.setItem(OFFLINE_BOOKINGS_KEY, JSON.stringify(bookings));
}

function readCurrentOfflineUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function getEffectiveBookedSeats(
  showtime: Showtime | undefined,
  showtimeId: string,
  bookings: Booking[]
): string[] {
  const baseSeats = showtime ? showtime.bookedSeats : [];
  const bookedFromOrders = bookings
    .filter(
      booking => booking.showtimeId === showtimeId && booking.status !== 'cancelled'
    )
    .flatMap(booking => booking.seats);
  return Array.from(new Set([...baseSeats, ...bookedFromOrders]));
}

export async function getBookedSeats(showtimeId: string): Promise<string[]> {
  try {
    const response = await api.get<string[] | { bookedSeats: string[] }>(
      `/showtimes/${showtimeId}/seats`
    );
    return Array.isArray(response) ? response : response.bookedSeats;
  } catch (error) {
    if (!isNetworkError(error)) throw error;
    const showtimes = await ensureOfflineShowtimes();
    const showtime = showtimes.find(item => item.id === showtimeId);
    return getEffectiveBookedSeats(showtime, showtimeId, readBookings());
  }
}

export async function createBooking(
  bookingData: CreateBookingPayload
): Promise<Booking> {
  try {
    return await api.post<Booking>('/bookings', bookingData);
  } catch (error) {
    if (!isNetworkError(error)) throw error;

    if (!bookingData.seats.length) {
      throw new ApiError('Vui lòng chọn ít nhất một ghế.', 400, 'BAD_REQUEST');
    }

    const currentUser = readCurrentOfflineUser();
    const userId = bookingData.userId || currentUser?.id;
    if (!userId) {
      throw new ApiError('Vui lòng đăng nhập để đặt vé.', 401, 'UNAUTHORIZED');
    }

    const showtimes = await ensureOfflineShowtimes();
    const showtimeIndex = showtimes.findIndex(
      item => item.id === bookingData.showtimeId
    );
    if (showtimeIndex === -1) {
      throw new ApiError('Không tìm thấy suất chiếu.', 404, 'NOT_FOUND');
    }

    const showtime = showtimes[showtimeIndex];
    const bookings = readBookings();
    const occupiedSeats = getEffectiveBookedSeats(
      showtime,
      bookingData.showtimeId,
      bookings
    );

    const conflictingSeats = bookingData.seats.filter(seat =>
      occupiedSeats.includes(seat)
    );
    if (conflictingSeats.length > 0) {
      throw new ApiError(
        `Ghế ${conflictingSeats.join(', ')} đã có người đặt. Vui lòng chọn ghế khác.`,
        409,
        'CONFLICT',
        { conflictingSeats }
      );
    }

    const totalPrice =
      bookingData.totalPrice ?? showtime.price * bookingData.seats.length;

    const newBooking: Booking = {
      id: `BK${Date.now().toString().slice(-8)}`,
      userId,
      showtimeId: bookingData.showtimeId,
      seats: [...bookingData.seats],
      totalPrice,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    const updatedShowtime: Showtime = {
      ...showtime,
      bookedSeats: Array.from(new Set([...showtime.bookedSeats, ...bookingData.seats])),
    };
    const nextShowtimes = [...showtimes];
    nextShowtimes[showtimeIndex] = updatedShowtime;

    localStorage.setItem(OFFLINE_SHOWTIMES_KEY, JSON.stringify(nextShowtimes));
    writeBookings([newBooking, ...bookings]);

    return newBooking;
  }
}

export async function getMyBookings(): Promise<Booking[]> {
  try {
    return await api.get<Booking[]>('/bookings/me');
  } catch (error) {
    if (!isNetworkError(error)) throw error;
    const currentUser = readCurrentOfflineUser();
    if (!currentUser) {
      throw new ApiError('Vui lòng đăng nhập để xem vé của bạn.', 401, 'UNAUTHORIZED');
    }

    return readBookings()
      .filter(booking => booking.userId === currentUser.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

export async function cancelBooking(bookingId: string): Promise<Booking> {
  try {
    return await api.patch<Booking>(`/bookings/${bookingId}/cancel`);
  } catch (error) {
    if (!isNetworkError(error)) throw error;

    const bookings = readBookings();
    const bookingIndex = bookings.findIndex(item => item.id === bookingId);
    if (bookingIndex === -1) {
      throw new ApiError('Không tìm thấy đơn đặt vé.', 404, 'NOT_FOUND');
    }

    const target = bookings[bookingIndex];
    if (target.status === 'cancelled') return target;

    const cancelledBooking: Booking = { ...target, status: 'cancelled' };
    const nextBookings = [...bookings];
    nextBookings[bookingIndex] = cancelledBooking;
    writeBookings(nextBookings);

    const showtimes = await ensureOfflineShowtimes();
    const showtimeIndex = showtimes.findIndex(item => item.id === target.showtimeId);
    if (showtimeIndex !== -1) {
      const targetShowtime = showtimes[showtimeIndex];
      const releasedShowtime: Showtime = {
        ...targetShowtime,
        bookedSeats: targetShowtime.bookedSeats.filter(
          seat => !target.seats.includes(seat)
        ),
      };
      const nextShowtimes = [...showtimes];
      nextShowtimes[showtimeIndex] = releasedShowtime;
      localStorage.setItem(OFFLINE_SHOWTIMES_KEY, JSON.stringify(nextShowtimes));
    }

    return cancelledBooking;
  }
}

export async function getRevenueStats(): Promise<RevenueStats> {
  try {
    return await api.get<RevenueStats>('/bookings/stats');
  } catch (error) {
    if (!isNetworkError(error)) throw error;

    const [movies, showtimes] = await Promise.all([
      ensureOfflineMovies(),
      ensureOfflineShowtimes(),
    ]);
    const activeBookings = readBookings().filter(
      booking => booking.status !== 'cancelled'
    );

    const movieById = new Map(movies.map(movie => [movie.id, movie]));
    const showtimeById = new Map(showtimes.map(showtime => [showtime.id, showtime]));
    const dailyMap = new Map<string, DailyRevenue>();
    const movieMap = new Map<string, MovieRevenue>();

    let totalRevenue = 0;
    let totalTickets = 0;

    for (const booking of activeBookings) {
      const ticketCount = booking.seats.length;
      totalRevenue += booking.totalPrice;
      totalTickets += ticketCount;

      const dateKey = booking.createdAt.slice(0, 10);
      const currentDay = dailyMap.get(dateKey) || {
        date: dateKey,
        revenue: 0,
        tickets: 0,
      };
      currentDay.revenue += booking.totalPrice;
      currentDay.tickets += ticketCount;
      dailyMap.set(dateKey, currentDay);

      const showtime = showtimeById.get(booking.showtimeId);
      if (showtime) {
        const movie = movieById.get(showtime.movieId);
        const currentMovie = movieMap.get(showtime.movieId) || {
          movieId: showtime.movieId,
          title: movie?.title || 'Phim không xác định',
          revenue: 0,
          tickets: 0,
        };
        currentMovie.revenue += booking.totalPrice;
        currentMovie.tickets += ticketCount;
        movieMap.set(showtime.movieId, currentMovie);
      }
    }

    return {
      totalRevenue,
      totalBookings: activeBookings.length,
      totalTickets,
      revenueByDate: Array.from(dailyMap.values()).sort((a, b) =>
        a.date.localeCompare(b.date)
      ),
      revenueByMovie: Array.from(movieMap.values()).sort(
        (a, b) => b.revenue - a.revenue
      ),
    };
  }
}
