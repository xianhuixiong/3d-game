
import type { Config } from 'tailwindcss'
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        energy: {
          primary: '#25D0FF',
          accent: '#7C4DFF',
          warn: '#FF7A00'
        }
      }
    }
  },
  plugins: []
} satisfies Config
