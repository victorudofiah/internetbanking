// postcss.config.cjs
module.exports = {
  plugins: {
    // preferred: use the Tailwind PostCSS plugin
    "@tailwindcss/postcss": {},
    // keep autoprefixer after Tailwind
    autoprefixer: {},
  },
};
