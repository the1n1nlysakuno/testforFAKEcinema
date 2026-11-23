import { useEffect, useState } from 'react';

// Custom Hook: <T> có nghĩa là dữ liệu có thể là Movie[], Offer[], Cinema[]...
export default function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Không thể lấy dữ liệu (HTTP ${response.status})`);
        }
        // Dữ liệu JSON được kiểm tra theo interface của ứng dụng.
        const result: T = await response.json() as T;
        if (!controller.signal.aborted) setData(result);
      } catch (err: unknown) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Có lỗi khi tải dữ liệu.');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadData();
    return () => controller.abort(); // cleanup khi component unmount
  }, [url, reload]);

  return { data, loading, error, retry: () => setReload(n => n + 1) };
}
