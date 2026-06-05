/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0A0A0A',
        'ink-soft': '#1F1F1F',
        muted: '#6B7280',
        primary: {
          DEFAULT: '#7C3AED',
          dark: '#5B21B6',
          dim: '#A78BFA',
        },
        accent: '#C4B5FD',
        surface: '#FFFFFF',
        'surface-alt': '#EDE9FE',
        bg: '#F5F0FF',
        good: '#10B981',
        warn: '#F59E0B',
        bad: '#EF4444',
        info: '#06B6D4',
        pink: '#EC4899',
      },
      fontFamily: {
        display: ['"Archivo Black"', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'brutal': '6px 6px 0 #0A0A0A',
        'brutal-sm': '3px 3px 0 #0A0A0A',
        'brutal-lg': '10px 10px 0 #0A0A0A',
        'brutal-primary': '6px 6px 0 #5B21B6',
      },
      borderRadius: { none: '0' },
      animation: {
        'shake': 'shake 0.4s',
        'pulse-brutal': 'pulse 1.5s infinite',
        'glow': 'glow 2s infinite',
        'fade-in': 'fadeIn 0.25s ease',
        'count-up': 'countUp 0.3s',
        'bounce-soft': 'bounce 0.6s',
      },
      keyframes: {
        shake: { '0%,100%': { transform: 'translateX(0)' }, '20%,60%': { transform: 'translateX(-6px)' }, '40%,80%': { transform: 'translateX(6px)' } },
        pulse: { '0%,100%': { boxShadow: '6px 6px 0 #0A0A0A' }, '50%': { boxShadow: '6px 6px 0 #EF4444, 0 0 0 6px rgba(239,68,68,0.3)' } },
        glow: { '0%,100%': { boxShadow: '6px 6px 0 #0A0A0A, 0 0 0 0 rgba(124,58,237,0)' }, '50%': { boxShadow: '6px 6px 0 #0A0A0A, 0 0 24px 4px rgba(124,58,237,0.4)' } },
        fadeIn: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'none' } },
        countUp: { from: { transform: 'scale(0.7)', opacity: 0 }, to: { transform: 'scale(1)', opacity: 1 } },
        bounce: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
      },
    },
  },
  plugins: [],
}
