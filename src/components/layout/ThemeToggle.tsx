'use client';

import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/hooks/useTheme';
import { ICONS } from '@/lib/assets';

/**
 * 主题切换图标按钮（v2.1）。
 *
 * 浅色态：显示 light.svg
 * 深色态：显示 dark.svg
 * 点击：在两态间互换。
 *
 * 用法：放在 AppBar 的 right slot。
 */
export function ThemeToggle({ size = 22 }: { size?: number }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? '切换浅色模式' : '切换深色模式'}
      className="flex h-8 w-8 items-center justify-center rounded-pill transition-colors hover:bg-subtle"
    >
      <Icon
        src={isDark ? ICONS.action.dark : ICONS.action.light}
        size={size}
        alt=""
      />
    </button>
  );
}
