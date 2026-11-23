import { useEffect, useRef, useState } from 'react';

interface Props {
  seconds?: number;
  onExpire: () => void;
}

export default function CountdownTimer({ seconds = 300, onExpire }: Props) {
  const [remaining, setRemaining] = useState(seconds);
  const expireRef = useRef(onExpire);
  useEffect(() => { expireRef.current = onExpire; }, [onExpire]);

  useEffect(() => {
    const deadline = Date.now() + seconds * 1000;
    const interval = window.setInterval(() => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        window.clearInterval(interval);
        expireRef.current();
      }
    }, 500);
    return () => window.clearInterval(interval);
  }, [seconds]);

  const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
  const secs = String(remaining % 60).padStart(2, '0');
  return <p className={`booking-timer ${remaining <= 60 ? 'timer-urgent' : ''}`} role="timer">
    ⏱ Thời gian hoàn tất đặt vé: <strong>{minutes}:{secs}</strong>
  </p>;
}
