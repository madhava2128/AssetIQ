/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'Arial', 'sans-serif'],
        serif: ['var(--font-serif)', 'Source Serif 4', 'Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        mono: ['var(--font-inter)', 'Inter', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'Arial', 'sans-serif'],
      },
      colors: {
        frame: {
          DEFAULT: '#15314B',
          bg: '#15314B',
          hover: '#1D4062',
          selected: '#25507A',
          marker: '#8CC1F0',
          text: '#F1F5F9',
          'text-secondary': '#B4C3D3',
          divider: '#2A4A68',
        },
        page: {
          DEFAULT: '#E6ECF2',
          header: '#DCE6F0',
        },
        panel: {
          DEFAULT: '#FFFFFF',
          header: '#F0F4F8',
        },
        subtle: '#F0F4F8',
        border: {
          DEFAULT: '#C9D4DF',
          strong: '#AEBBC9',
        },
        table: {
          header: '#E4EBF2',
          stripe: '#F7F9FB',
          hover: '#EAF1F8',
        },
        callout: {
          bg: '#DCE9F9',
        },
        text: {
          primary: '#14243A',
          secondary: '#41526A',
          muted: '#5F6F85',
        },
        accent: {
          DEFAULT: '#1F66C2',
          hover: '#18539F',
          subtle: '#DCE9F9',
        },
        chart: {
          accent: '#1F66C2',
          mid: '#6FA3DC',
          'slate-dark': '#8292A6',
          'slate-light': '#C3CEDA',
          gridline: '#DDE5EC',
        },
        status: {
          ready: {
            text: '#1E7B4B',
            bg: '#E6F4EC',
            solid: '#2E9E63',
          },
          atrisk: {
            text: '#8A5300',
            bg: '#FDF1DC',
            solid: '#C27B0E',
          },
          notready: {
            text: '#B42318',
            bg: '#FDECEA',
            solid: '#D64545',
          },
          neutral: {
            text: '#4B5563',
            bg: '#EEF0F3',
            solid: '#9AA3AF',
          },
        },
        // Legacy aliases mapped directly to new palette
        brand: {
          blue: '#1F66C2',
          'blue-hover': '#18539F',
          'blue-light': '#DCE9F9',
        },
      },
    },
  },
  plugins: [],
};
