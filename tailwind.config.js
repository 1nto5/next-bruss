/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        bruss: '#8bb63b',
      },
    },
  },
  plugins: [require('prettier-plugin-tailwindcss')],
}

// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   plugins: [require('prettier-plugin-tailwindcss')],
//   content: [
//     './pages/**/*.{js,ts,jsx,tsx,mdx}',
//     './components/**/*.{js,ts,jsx,tsx,mdx}',
//     './app/**/*.{js,ts,jsx,tsx,mdx}',
//   ],
//   theme: {
//     fontFamily: {
//       sans: [
//         'Inter var, sans-serif',
//         { fontFeatureSettings: '"cv11", "ss01"' },
//       ],
//     },
//     extend: {
//       colors: {
//         bruss: '#8bb63b',
//       },
//     },
//   },
// }
