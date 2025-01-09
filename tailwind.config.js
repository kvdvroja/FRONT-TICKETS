/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    screens: {
      'mobile': '200px',
      'tablet': '640px',
      'laptop': '1024px',
      'desktop': '1280px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    container: {
      center: true,
      padding: '1rem',
      screens: {
        mobile: '100%',
        sm: '640px',
        md: '768px',
        tablet: '640px',
        lg: '1024px',
        laptop: '1024px',
        xl: '1280px',
        desktop: '1280px',
        '2xl': '1536px',
      },
    },
    extend: {},
  },
  plugins: [],
}

