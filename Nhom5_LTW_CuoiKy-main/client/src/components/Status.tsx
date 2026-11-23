export function Loading() {
  return <div className="status-panel"><span className="spinner" />Đang tải dữ liệu...</div>;
}

export function ErrorMessage({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="status-panel error-panel">
      <h3>Không tải được dữ liệu</h3>
      <p>{message}</p>
      <button className="btn btn-outline" onClick={onRetry}>Thử lại</button>
    </div>
  );
}
