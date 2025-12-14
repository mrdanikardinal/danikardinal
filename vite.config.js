import { defineConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';

export default defineConfig({
  base: '/danikardinal/', // sesuaikan dengan GitHub Pages repo
  publicDir: 'public',
  plugins: [
    createHtmlPlugin({
      minify: {
        collapseWhitespace: true,
        removeComments: true,  // hapus komentar HTML
        minifyCSS: true,
        minifyJS: true,
      },
    }),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'terser',  // minify JS
    rollupOptions: {
      output: {
        // optional: hash file names untuk cache busting
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
});
