/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  // Ant Design ships its own reset; Tailwind's preflight stays on for the storefront.
  corePlugins: { preflight: true },
  theme: {
    extend: {
      colors: {
        porcelain: '#FBF6F4',   // page background: warm white with a pink undertone
        petal: '#F7E9E6',       // very light pink surfaces
        blush: '#EFD5D1',       // soft blush pink
        cream: '#F5ECE3',       // soft cream
        rose: { DEFAULT: '#C98B91', 300: '#DDB0B4', 500: '#C98B91', 700: '#A45E68' }, // dusty rose
        rosewood: '#8F4A55',    // primary action colour (AA contrast on white)
        mauve: '#4A2C34',       // deep mauve headings
        charcoal: '#2F2A2C',    // body text
        stone: '#7A6D70',       // secondary text
        line: '#EADCD8',        // hairlines and borders
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', '"Times New Roman"', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'Arial', 'sans-serif'],
      },
      // Nothing readable below 13px: `text-xs` is the smallest step used for real content.
      fontSize: { xs: ['0.8125rem', { lineHeight: '1.25rem' }] },
      borderRadius: { arch: '999px 999px 24px 24px' },
      boxShadow: {
        soft: '0 10px 30px -12px rgba(143, 74, 85, 0.18)',
        lift: '0 18px 40px -16px rgba(143, 74, 85, 0.28)',
      },
      maxWidth: { shell: '1280px' },
      keyframes: {
        kenburns: { '0%': { transform: 'scale(1)' }, '100%': { transform: 'scale(1.08)' } },
        bump: { '0%,100%': { transform: 'scale(1)' }, '40%': { transform: 'scale(1.25)' } },
        rise: { '0%': { opacity: 0, transform: 'translateY(14px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
      },
      animation: {
        kenburns: 'kenburns 7s ease-out forwards',
        bump: 'bump 450ms ease-out',
        rise: 'rise 700ms cubic-bezier(.2,.7,.2,1) both',
      },
    },
  },
  plugins: [],
};
