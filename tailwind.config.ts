import type { Config } from 'tailwindcss';

/**
 * 栖迟 · Tailwind 主题配置
 * 完整对应「栖迟-视觉风格说明.md」§2-§6
 */
const config: Config = {
  content: [
    './src/pages/**/*.{ts,tsx,js,jsx,mdx}',
    './src/components/**/*.{ts,tsx,js,jsx,mdx}',
    './src/app/**/*.{ts,tsx,js,jsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ─── 主色板 ───
        brand: {
          DEFAULT: '#F5A65B', // 主色 暖橙
          deep: '#E8893A',    // 按钮按下
          soft: '#FCD9A8',    // 卡片次背景
          pale: '#FFEFC9',    // hover、tooltip 底
        },

        // ─── 中性背景 ───
        page: '#FFF8EE',      // 全局背景奶白
        card: '#FFFCF5',      // 卡片底
        subtle: '#FAF1DF',    // 次级背景 / 禁用底

        // ─── 描边 ───
        line: {
          DEFAULT: '#F0E2C9',
          focus: '#F5A65B',
        },

        // ─── 文字 ───
        ink: {
          DEFAULT: '#5A3E2B', // 文字主（温柔棕）
          soft: '#9C8472',    // 文字次
          mute: '#C9BAA8',    // 文字弱 / placeholder
          disabled: '#DCD0BC',
          on: '#FFF8EE',      // 反色（主按钮上的奶白文字）
        },

        // ─── 情绪辅色（情绪卡片 / 心境标签）───
        mood: {
          warm: '#FCD9A8',    // 平和
          pink: '#FFD6CC',    // 委屈、柔软
          blue: '#C7D6E0',    // 低落、迷茫
          green: '#D7E5C9',   // 释怀
          purple: '#E3D5E8',  // 复杂
        },

        // ─── 语义色（克制使用）───
        success: '#A8C49A',
        notice: '#E8B86F',
        danger: '#D67A5B', // 暖红，不用纯红

        // ─── 心境标签 chip 文字 ───
        chip: {
          warm: '#5A3E2B',
          pink: '#8C5B4A',
          blue: '#5A6B7A',
        },
      },

      fontFamily: {
        // UI 主体（圆润现代黑体）
        ui: [
          'OPPO Sans',
          'HarmonyOS Sans',
          '"PingFang SC"',
          '"Microsoft YaHei"',
          'system-ui',
          'sans-serif',
        ],
        // 英文 Body
        en: ['Quicksand', 'Nunito', 'system-ui', 'sans-serif'],
        // 英文 Display
        display: ['Comfortaa', 'Quicksand', 'sans-serif'],
        // 极少量场景：诗经引用专用宋体（仅 13px 以下）
        cite: ['"Source Han Serif"', '"Songti SC"', 'STSong', 'serif'],
      },

      fontSize: {
        display: ['32px', { lineHeight: '1.4', letterSpacing: '0.02em' }],
        h1: ['24px', { lineHeight: '1.5', fontWeight: '500' }],
        h2: ['20px', { lineHeight: '1.5', fontWeight: '500' }],
        h3: ['17px', { lineHeight: '1.5', fontWeight: '500' }],
        // 情感内容（Light 字重 + 松行高）
        'body-em': ['16px', { lineHeight: '1.8', fontWeight: '300' }],
        // UI 正文（Regular）
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

      // 宠物 idle 呼吸动画
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
