import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Movies from './pages/Movies';
import MovieDetail from './pages/MovieDetail';
import Cinemas from './pages/Cinemas';
import Offers from './pages/Offers';
import OfferDetail from './pages/OfferDetail';
import Booking from './pages/Booking';
import MyTickets from './pages/MyTickets';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Register from './pages/Register';
import Dashboard from './pages/admin/Dashboard';
import ManageMovies from './pages/admin/ManageMovies';
import ManageRooms from './pages/admin/ManageRooms';
import ManageShowtimes from './pages/admin/ManageShowtimes';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/phim" element={<Movies />} />
        <Route path="/phim/:id" element={<MovieDetail />} />
        <Route path="/rap" element={<Cinemas />} />
        <Route path="/uu-dai" element={<Offers />} />
        <Route path="/uu-dai/:id" element={<OfferDetail />} />
        <Route path="/dat-ve/:id" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
        <Route path="/ve-cua-toi" element={<ProtectedRoute><MyTickets /></ProtectedRoute>} />
        <Route path="/dang-nhap" element={<Login />} />
        <Route path="/dang-ky" element={<Register />} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>} />
        <Route path="/admin/phim" element={<ProtectedRoute adminOnly><ManageMovies /></ProtectedRoute>} />
        <Route path="/admin/phong" element={<ProtectedRoute adminOnly><ManageRooms /></ProtectedRoute>} />
        <Route path="/admin/suat-chieu" element={<ProtectedRoute adminOnly><ManageShowtimes /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
