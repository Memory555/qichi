/**
 * 栖迟 · 静态资源路径集中管理
 *
 * 所有 public/ 下的静态资源都通过本文件引用，
 * 后期路径调整只改这一处，避免全局魔法字符串。
 *
 * 宠物相关资源（精灵图 / 头像 / 爪印）见 `./pets.ts` 的 PETS 表。
 *
 * 用法：
 *   import { ASSETS } from '@/lib/assets';
 *   <Image src={ASSETS.brand.wordmark} ... />
 */

// ─── 字体 ────────────────────────────────────

export const FONTS = {
  oppoSans: {
    light: '/font/OPPOSans-Light.woff2',
    regular: '/font/OPPOSans-R.woff2',
    medium: '/font/OPPOSans-Medium.woff2',
  },
} as const;

// ─── 图标（SVG）──────────────────────────────

export const ICONS = {
  tab: {
    chat: '/icons/tab/chat.svg',
    chatActive: '/icons/tab/chat-active.svg',
    notebook: '/icons/tab/notebook.svg',
    notebookActive: '/icons/tab/notebook-active.svg',
    chart: '/icons/tab/chart.svg',
    chartActive: '/icons/tab/chart-active.svg',
    me: '/icons/tab/me.svg',
    meActive: '/icons/tab/me-active.svg',
  },
  action: {
    translate: '/icons/action/translate.svg',
    send: '/icons/action/send.svg',
    edit: '/icons/action/edit.svg',
    delete: '/icons/action/delete.svg',
    filter: '/icons/action/filter.svg',
    detail: '/icons/action/detail.svg',
    hide: '/icons/action/hide.svg',
    look: '/icons/action/look.svg',
  },
  deco: {
    cloud1: '/icons/deco/cloud-1.svg',
    cloud2: '/icons/deco/cloud-2.svg',
    moonFull: '/icons/deco/moon-full.svg',
    moonCrescent: '/icons/deco/moon-crescent.svg',
  },
} as const;

/** Tab 图标按激活态返回（利用 `${tab}Active` 命名约定，无独立映射） */
export type TabName = 'chat' | 'notebook' | 'chart' | 'me';
export function getTabIcon(tab: TabName, active: boolean): string {
  return active ? ICONS.tab[`${tab}Active`] : ICONS.tab[tab];
}

// ─── 品牌资产 ────────────────────────────────

export const BRAND = {
  wordmark: '/brand/qichi-wordmark.png', // 「栖迟」艺术字
} as const;

// ─── 整页背景图（按页切换） ───────────────────

export const BACKGROUNDS = {
  welcome: '/background/欢迎页.png',
  chat: '/background/聊天页背景.png',
  settings: '/background/设置页背景.png',
} as const;

// ─── Favicon（页面 <head> 引用）──────────────

export const FAVICON = {
  ico: '/favicon/favicon.ico',
  svg: '/favicon/favicon.svg',
  png96: '/favicon/favicon-96x96.png',
  appleTouch: '/favicon/apple-touch-icon.png',
  manifest: '/favicon/site.webmanifest',
  webApp192: '/favicon/web-app-manifest-192x192.png',
  webApp512: '/favicon/web-app-manifest-512x512.png',
} as const;

// ─── 统一出口 ────────────────────────────────

export const ASSETS = {
  fonts: FONTS,
  icons: ICONS,
  brand: BRAND,
  favicon: FAVICON,
  backgrounds: BACKGROUNDS,
} as const;
