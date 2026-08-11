import { useEffect, useState } from 'react';

// Ticks down to an absolute timestamp. Interval-based (not requestAnimationFrame)
// for the same reason as CashDisplay: this can be read from a tab that isn't
// currently focused/painted, and rAF callbacks don't reliably fire there.
export default function useCountdown(endsAt) {
  const [remainingMs, setRemainingMs] = useState(() => (endsAt ? Math.max(0, endsAt - Date.now()) : 0));

  useEffect(() => {
    if (!endsAt) {
      setRemainingMs(0);
      return undefined;
    }
    setRemainingMs(Math.max(0, endsAt - Date.now()));
    const intervalId = setInterval(() => {
      setRemainingMs(Math.max(0, endsAt - Date.now()));
    }, 200);
    return () => clearInterval(intervalId);
  }, [endsAt]);

  return remainingMs;
}
