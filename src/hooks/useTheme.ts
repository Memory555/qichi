'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  type Theme,
  readTheme,
  writeTheme,
  applyTheme,
} from '@/lib/theme';

/**
 * 主题 hook（v2.1：二态 toggle）。
 *
 * - 初次挂载从 localStorage 读，对齐 documentElement.className
 * - setTheme 同步 localStorage + DOM + React 状态
 * - toggle 在 light / dark 间互换
 *
 * 跨 tab 同步：监听 storage 事件，A tab 改了，B tab 自动响应。
 */
export function useTheme() {
  // lazy initial state：客户端首次渲染就用真实 theme，减少 SSR→hydrate 闪烁
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light';
    return readTheme();
  });

  useEffect(() => {
    const t = readTheme();
    setThemeState(t);
    applyTheme(t);

    const onStorage = (e: StorageEvent) => {
      if (e.key !== 'qichi:theme') return;
      const next = readTheme();
      setThemeState(next);
      applyTheme(next);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    writeTheme(t);
    setThemeState(t);
    applyTheme(t);
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return { theme, setTheme, toggle };
}
