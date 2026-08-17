import { useEffect, useState } from 'react';

export function useDebouncedError(
  value: string,
  getError: (value: string) => string | undefined,
  delayMs = 800,
) {
  const [settledValue, setSettledValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSettledValue(value);
    }, delayMs);

    return () => window.clearTimeout(timeoutId);
  }, [delayMs, value]);

  return {
    error: settledValue === value ? getError(value) : undefined,
    showNow() {
      setSettledValue(value);
    },
  };
}
