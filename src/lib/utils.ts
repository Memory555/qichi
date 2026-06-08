/**
 * 栖迟 · 通用工具
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Tailwind 类名合并 + 冲突去重 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** 随机 0~max-1 整数 */
export function randInt(max: number): number {
  return Math.floor(Math.random() * max);
}

/** 数组中随机选一个 */
export function randomOf<T>(arr: readonly T[]): T {
  return arr[randInt(arr.length)];
}
