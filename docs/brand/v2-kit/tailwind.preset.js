// Moraes CodeVibe — preset Tailwind. Uso: presets: [require('./tailwind.preset.js')]
module.exports = {
  theme: {
    extend: {
      colors: {
        mc: {
          tinta: '#0F1F14', floresta: '#1B4D2E', folha: '#2F7D4B', pulso: '#A6F26B',
          neblina: '#EDF4E7', papel: '#F8FAF5', ambar: '#D4892A',
          salvia: '#B4C5AF', 'salvia-clara': '#C9DBC3', cinza: '#526350', borda: '#D5DFCC',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: { 'mc-sm': '10px', 'mc-md': '14px', 'mc-lg': '16px' },
    },
  },
};
