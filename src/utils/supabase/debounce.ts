export function debounce<F extends (...args: unknown[]) => void>(
  func: F,
  delay: number
): (...args: Parameters<F>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<F>): void => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      timeout = null;
      func(...args);
    }, delay);
  };
}