import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Удобная утилита для объединения классов Tailwind с учётом условных классов
 * и правильной обработки конфликтов (например, bg-red-500 bg-blue-500 → берётся последний)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}