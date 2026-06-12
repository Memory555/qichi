import type { Config } from 'tailwindcss';

/**
 * 栖迟 · Tailwind 主题配置
 *
 * v1：完整对应「栖迟-视觉风格说明.md」§2-§6
 * v2：把"会随主题切换"的色（page/card/subtle/line/ink）改为 CSS 变量驱动，
 *     深色 token 在 globals.css 的 :root.dark 覆写。
 *     brand 暖橙系保留色值不变 —— 是 IP 身份，深浅模式都要温暖。
 */

/** rgb(var(--c-x) / <alpha-value>) 语法生成器，让 bg/text/border 都能配合 /opacity 用 */
const v = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{ts,tsx,js,jsx,mdx}',
    './src/components/**/*.{ts,tsx,js,jsx,mdx}',
    './src/app/**/*.{ts,tsx,js,jsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ─── 主色板（暖橙 IP 身份，浅/深都不动）───
        brand: {
          DEFAULT: '#F5A65B',
          deep: '#E8893A',
          soft: '#FCD9A8',
          pale: '#FFEFC9',
        },

        // ─── 中性背景 / 描边 / 文字（CSS 变量驱动，深色覆写）───
        page: v('--c-page'),
        card: v('--c-card'),
        subtle: v('--c-subtle'),
        line: {
          DEFAULT: v('--c-line'),
          focus: '#F5A65B',
        },
        ink: {
          DEFAULT: v('--c-ink'),
          soft: v('--c-ink-soft'),
          mute: v('--c-ink-mute'),
          disabled: v('--c-ink-disabled'),
          on: '#FFF8EE', // 反色（主按钮上的奶白），深浅都用这个保持识别度
        },

        // ─── 情绪辅色（深色场景靠 mix-blend 兜底）───
        mood: {
          warm: '#FCD9A8',
          pink: '#FFD6CC',
          blue: '#C7D6E0',
          green: '#D7E5C9',
          purple: '#E3D5E8',
        },

        // ─── 语义色（克制使用）───
        success: '#A8C49A',
        notice: '#E8B86F',
        danger: '#D67A5B',

        // ─── 心境标签 chip 文字 ───
        chip: {
          warm: '#5A3E2B',
          pink: '#8C5B4A',
          blue: '#5A6B7A',
        },
      },

      fontFamily: {
        ui: [
          'OPPO Sans',
          'HarmonyOS Sans',
          '"PingFang SC"',
          '"Microsoft YaHei"',
          'system-ui',
          'sans-serif',
        ],
        en: ['Quicksand', 'Nunito', 'system-ui', 'sans-serif'],
        display: ['Comfortaa', 'Quicksand', 'sans-serif'],
        cite: ['"Source Han Serif"', '"Songti SC"', 'STSong', 'serif'],
      },

      fontSize: {
        display: ['32px', { lineHeight: '1.4', letterSpacing: '0.02em' }],
        h1: ['24px', { lineHeight: '1.5', fontWeight: '500' }],
        h2: ['20px', { lineHeight: '1.5', fontWeight: '500' }],
        h3: ['17px', { lineHeight: '1.5', fontWeight: '500' }],
        'body-em': ['16px', { lineHeight: '1.8', fontWeight: '300' }],
        'body-ui': ['15px', { lineHeight: '1.7' }],
        caption: ['13px', { lineHeight: '1.6' }],
        mini: ['11px', { lineHeight: '1.5' }],
      },

      borderRadius: {
        bubble: '16px',
        card: '20px',
        'card-lg': '24px',
        pill: '9999px',
      },

      boxShadow: {
        'soft-xs': '0 1px 2px rgba(245, 166, 91, 0.06)',
        'soft-sm': '0 2px 8px rgba(245, 166, 91, 0.08)',
        'soft-md': '0 4px 16px rgba(245, 166, 91, 0.12)',
        'soft-lg': '0 8px 24px rgba(245, 166, 91, 0.16)',
        pet: '0 8px 32px rgba(245, 166, 91, 0.20)',
      },

      letterSpacing: {
        cn: '0.02em',
        en: '0.03em',
      },

      transitionTimingFunction: {
        soft: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },

      transitionDuration: {
        soft: '220ms',
        em: '320ms',
        page: '360ms',
      },

      animation: {
        breath: 'breath 4s ease-in-out infinite',
        'fade-in': 'fadeIn 220ms cubic-bezier(0.22, 1, 0.36, 1)',
        'slide-up': 'slideUp 320ms cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        breath: {
          '0%, 100%': { transform: 'scale(1.0)' },
          '50%': { transform: 'scale(1.02)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
