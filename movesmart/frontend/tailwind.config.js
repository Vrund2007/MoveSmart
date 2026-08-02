/** @type {import('tailwindcss').Config} */
// Color palette sourced verbatim from Design.md §2.3
module.exports = {
  content: [
    "./public/index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary:          '#00ADB5',
        secondary:        '#393E46',
        background:       '#EEEEEE',
        surface:          '#FFFFFF',
        'text-primary':   '#222831',
        'text-secondary': '#393E46',
        border:           '#D9D9D9',
        success:          '#22C55E',
        warning:          '#F59E0B',
        error:            '#EF4444',
      },
      // Typography: Inter for both heading and body per Design.md §3.3 Option A (default recommendation).
      // Lock in at frontend build start — values are placeholders until finalized per Design.md §3.5.
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
