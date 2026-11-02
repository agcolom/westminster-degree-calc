import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Debounce utility for limiting function calls
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

// Keep a mark input value within 0-100; leaves empty or partial input untouched
export function clampMark(value: string): string {
  if (value === "" || isNaN(Number(value))) return value;
  const mark = Number(value);
  if (mark > 100) return "100";
  if (mark < 0) return "0";
  return value;
}
