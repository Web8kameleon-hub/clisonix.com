/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark Clarity palette
        'bg-main': 'var(--bg-main)',
        'bg-panel': 'var(--bg-panel)',
        'bg-soft': 'var(--bg-soft)',
        'bg-hover': 'var(--bg-hover)',

        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',

        'accent': 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',

        // Legacy support
        background: "var(--background)",
        foreground: "var(--foreground)",

        // Semantic colors
        'clarity': {
          50: '#E6EAF2',
          100: '#B6C0D1',
          200: '#7D8AA5',
          300: '#4CC9F0',
          400: '#4895EF',
          500: '#182235',
          600: '#121A2A',
          700: '#0E1420',
          800: '#0A0F18',
          900: '#060A10',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'soft': 'var(--shadow-soft)',
        'medium': 'var(--shadow-medium)',
        'glow': 'var(--shadow-glow)',
      },
      borderColor: {
        DEFAULT: 'var(--border)',
        strong: 'var(--border-strong)',
      },
      animation: {
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
}
