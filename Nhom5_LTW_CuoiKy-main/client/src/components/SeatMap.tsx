interface SeatMapProps {
  selectedSeats: string[];
  occupiedSeats: string[];
  onToggle: (seat: string) => void;
  disabled?: boolean;
  capacity?: number;
}

const ROWS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function SeatMap({ selectedSeats, occupiedSeats, onToggle, disabled = false, capacity = 60 }: SeatMapProps) {
  const rowCount = Math.ceil(Math.min(260, Math.max(1, capacity)) / 10);
  return (
    <>
      <div className="screen">MÀN HÌNH CHIẾU</div>
      <div className="seat-chart" aria-label="Sơ đồ chọn ghế">
        {ROWS.slice(0, rowCount).map((row, rowIndex) => (
          <div className="seat-row" key={row}>
            <span className="row-label">{row}</span>
            {Array.from({ length: Math.min(10, capacity - rowIndex * 10) }, (_, index) => {
              const seat = row + (index + 1);
              const occupied = occupiedSeats.includes(seat);
              const selected = selectedSeats.includes(seat);
              return (
                <button key={seat} type="button" disabled={occupied || disabled}
                  aria-pressed={selected} title={occupied ? `Ghế ${seat} đã đặt` : `Ghế ${seat}`}
                  className={`seat ${occupied ? 'occupied' : ''} ${selected ? 'selected' : ''}`}
                  onClick={() => onToggle(seat)}>{index + 1}</button>
              );
            })}
            <span className="row-label">{row}</span>
          </div>
        ))}
      </div>
      <div className="seat-legend">
        <span><i className="seat-available" />Còn trống</span>
        <span><i className="seat-selected" />Đang chọn</span>
        <span><i className="seat-occupied" />Đã đặt demo</span>
      </div>
    </>
  );
}
