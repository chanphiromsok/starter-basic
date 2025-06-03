/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        'brand-primary': {
          DEFAULT: '#04AB52',
          300: '#E3FFEA',
          '300-inverse': '#00320D',
        },
        'accent-blue': {
          DEFAULT: '#049AD2',
          100: '#EBFAFF',
          300: '#D7F4FF',
          500: '#ECFAFF',
          '300-inverse': '#002635',
        },
        'accent-orange': {
          DEFAULT: '#FF6838',
          300: '#FDDFD6',
          '300-inverse': '#501300',
        },
        text: {
          primary: '#1A1A1A',
          secondary: '#7D7D7D',
          'primary-inverse': '#FFFFFF',
          'secondary-inverse': '#EDEDED',
        },
        border: '#EBEBEB',
        darker: '#D0D4D8',
        'super-light-gray': '#EFEFEF',
        'icon-inactive': '#BDBDBD',
        'icon-active': '#BDBDBD',
        bg: '#FFFFFF',
        'bg-inverse': '#111111',
        'bg-transparent-50': '#FFFFFF',
        'off-white': '#F7F7F7',
        error: '#DC2626',
        white: '#FFFFFF',
      },
      // Dark mode colors using CSS variables
      backgroundColor: {
        'dark-bg': '#111111',
        'dark-off-white': '#202020',
        'dark-super-light-gray': '#202020',
        'dark-brand-primary-300': '#00320D',
        'dark-accent-blue-100': '#091C23',
        'dark-accent-blue-300': '#002635',
        'dark-accent-orange-300': '#501300',
      },
      textColor: {
        'dark-primary': '#E0E0E0',
        'dark-secondary': '#898989',
        'dark-primary-inverse': '#111111',
        'dark-secondary-inverse': '#7D7D7D',
      },
      borderColor: {
        'dark-border': '#2F2F2F',
        'dark-darker': '#4A5056',
      },
    },
  },
  plugins: [],
}
