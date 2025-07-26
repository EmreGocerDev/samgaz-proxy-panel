// src/utils/debounce.ts

export function debounce<F extends (...args: any[]) => any>(func: F, delay: number) {
  let timeout: NodeJS.Timeout | null = null;

  return function(this: any, ...args: Parameters<F>) {
    const context = this;
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      timeout = null;
      func.apply(context, args);
    }, delay);
  };
}