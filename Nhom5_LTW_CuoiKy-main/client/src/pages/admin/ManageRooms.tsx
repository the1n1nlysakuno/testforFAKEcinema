import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Room } from '../../types';
import AdminNav from '../../components/AdminNav';
import { useCatalog } from '../../context/CatalogContext';

export default function ManageRooms() {
  const { cinemas, rooms, saveRoom, deleteRoom } = useCatalog();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [cinemaId, setCinemaId] = useState('');
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('60');
  const [error, setError] = useState('');

  function startEdit(room: Room) {
    setEditingId(room.id);
    setCinemaId(room.cinemaId);
    setName(room.name);
    setCapacity(String(room.capacity));
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function reset() {
    setEditingId(null);
    setCinemaId('');
    setName('');
    setCapacity('60');
    setError('');
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const count = Number(capacity);
    if (!(cinemaId || cinemas[0]?.id)) return setError('Chưa có rạp để tạo phòng.');
    if (!name.trim() || !Number.isInteger(count) || count < 1 || count > 260) return setError('Nhập tên phòng và sức chứa từ 1 đến 260 ghế.');
    saveRoom({ id: editingId ?? `phong-${Date.now()}`, cinemaId: cinemaId || cinemas[0].id, name: name.trim(), capacity: count });
    reset();
  }

  return (
    <div className="container page-section">
      <div className="page-title"><p className="eyebrow">QUẢN TRỊ DEMO</p><h1>Quản lý phòng chiếu</h1><p>Danh sách phòng dùng để xếp lịch chiếu theo rạp.</p></div>
      <AdminNav />
      <section className="admin-panel"><h2>{editingId ? 'Sửa phòng chiếu' : 'Thêm phòng chiếu'}</h2>
        <form onSubmit={submit} noValidate><div className="admin-form-grid">
          <label className="form-label">Rạp<select value={cinemaId || cinemas[0]?.id || ''} onChange={e => setCinemaId(e.target.value)}>{cinemas.map(cinema => <option key={cinema.id} value={cinema.id}>{cinema.name}</option>)}</select></label>
          <label className="form-label">Tên phòng<input value={name} onChange={e => setName(e.target.value)} placeholder="Ví dụ: Phòng 7" /></label>
          <label className="form-label">Số ghế<input type="number" min="1" max="260" value={capacity} onChange={e => setCapacity(e.target.value)} /></label>
        </div>{error && <p className="form-error">{error}</p>}
        <div className="admin-actions"><button className="btn btn-primary">{editingId ? 'Lưu phòng' : 'Thêm phòng'}</button>{editingId && <button className="btn btn-outline" type="button" onClick={reset}>Hủy</button>}</div></form>
      </section>
      <section className="admin-panel"><h2>Danh sách phòng ({rooms.length})</h2><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Phòng</th><th>Rạp</th><th>Sức chứa</th><th>Thao tác</th></tr></thead><tbody>{rooms.map(room => <tr key={room.id}><td>{room.name}</td><td>{cinemas.find(c => c.id === room.cinemaId)?.name ?? 'Không rõ'}</td><td>{room.capacity} ghế</td><td><div className="admin-actions"><button className="btn btn-small btn-outline" onClick={() => startEdit(room)}>Sửa</button><button className="btn btn-small btn-outline admin-danger" onClick={() => { if (window.confirm('Xóa phòng và các suất chiếu liên quan?')) deleteRoom(room.id); }}>Xóa</button></div></td></tr>)}</tbody></table></div></section>
    </div>
  );
}
