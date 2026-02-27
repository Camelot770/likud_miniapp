import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        tg: {
          bg: 'var(--bg-color)',
          text: 'var(--text-color)',
          hint: 'var(--hint-color)',
          link: 'var(--link-color)',
          button: 'var(--button-color)',
          'button-text': 'var(--button-text-color)',
          'secondary-bg': 'var(--secondary-bg)',
        },
      },
    },
  },
  plugins: [],
};

export default config;
