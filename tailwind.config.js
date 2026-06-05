/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0A0A0A',
        'ink-soft': '#1F1F1F',
        muted: '#647080',
        primary: {
          DEFAULT: '#5B5BD6',
          dark: '#3F3F9F',
          dim: '#A8ACD8',
        },
        accent: '#D7DAEA',
        surface: '#FFFFFF',
        'surface-alt': '#EEF0F4',
        bg: '#F6F7F9',
        good: '#2F7D62',
        warn: '#C2933A',
        bad: '#B94A48',
        info: '#347B83',
        pink: '#8A5270',
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
        'brutal-primary': '6px 6px 0 #3F3F9F',
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
        glow: { '0%,100%': { boxShadow: '6px 6px 0 #0A0A0A, 0 0 0 0 rgba(91,91,214,0)' }, '50%': { boxShadow: '6px 6px 0 #0A0A0A, 0 0 24px 4px rgba(91,91,214,0.32)' } },
        fadeIn: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'none' } },
        countUp: { from: { transform: 'scale(0.7)', opacity: 0 }, to: { transform: 'scale(1)', opacity: 1 } },
        bounce: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
      },
    },
  },
  plugins: [],
}
