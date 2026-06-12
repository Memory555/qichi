/**
 * 栖迟 · 主题（v2.1：从三态简化为二态 toggle）
 *
 * - 'light' 浅色（默认）
 * - 'dark'  深色
 *
 * 入口：每个主页面 AppBar 右上角 `<ThemeToggle />` 图标按钮（参见 ThemeToggle.tsx）
 * 旧版（v2.0）的 'auto' 自动跟随系统已废弃；
 * 兼容老用户已存的 'auto' / 非法值 → 视为 'light'。
 *
 * 单一来源：localStorage `qichi:theme`
 * 与 React 同步：在 documentElement 上加/去 `dark` className
 * 防 FOUC：layout.tsx <head> 内联 THEME_INIT_SCRIPT 在 hydrate 前先落 class
 */

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'qichi:theme';

export function readTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw === 'dark' ? 'dark' : 'light';
}

export function writeTheme(t: Theme): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, t);
}

export function applyTheme(t: Theme): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (t === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
}

/**
 * 内联脚本字符串。
 * 放进 layout.tsx 的 <head> 让它在 React hydrate 前先跑，避免深色场景闪白。
 * ⚠️ 改动时记得和上面的 readTheme/applyTheme 保持语义一致。
 */
export const THEME_INIT_SCRIPT = `(function(){
try {
  var t = localStorage.getItem('${STORAGE_KEY}');
  if (t === 'dark') document.documentElement.classList.add('dark');
} catch (e) {}
})();`;
