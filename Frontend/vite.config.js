import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      fastRefresh: true,
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 512,
    }),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 512,
    }),
    visualizer({
      open: false,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['**/*.{js,css,html,png,jpg,jpeg,gif,webp,mp4,webm}'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,jpg,jpeg,gif,webp,mp4,webm}'],
        runtimeCaching: [
          {
            urlPattern: /\.(?:js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-assets',
              expiration: { maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|gif|webp|mp4|webm)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'media-assets',
              expiration: { maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/se3fw2nzc2\.execute-api\.ap-south-1\.amazonaws\.com/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
              networkTimeoutSeconds: 5,
            },
          },
          {
            urlPattern: /^https:\/\/zedemy-media-2025\.s3\.ap-south-1\.amazonaws\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'media-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      manifest: {
        name: 'LearnX',
        short_name: 'LearnX',
        description: 'Tech tutorials for Indian students',
        theme_color: '#2c3e50',
        icons: [],
      },
    }),
  ],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, 'src/components'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@actions': path.resolve(__dirname, 'src/actions'),
    },
    dedupe: ['popper.js'],
  },
  build: {
    minify: 'esbuild',
    sourcemap: true,
    target: 'esnext',
    treeshake: 'recommended',
    modulePreload: {
      polyfill: true,
    },
    rollupOptions: {
      output: {
        experimentalMinChunkSize: 10000,
        manualChunks: {
          react: ['react', 'react-dom'],
          redux: ['redux', 'react-redux'],
          router: ['react-router-dom'],
          uiLibs: ['framer-motion'],
          utilities: ['react-helmet-async', 'dompurify', 'react-copy-to-clipboard'],
          syntax_highlighter: ['react-syntax-highlighter', 'highlight.js'],
          codemirror: ['@codemirror/view', '@codemirror/state'],
          parse5: ['parse5'],
          lodash: ['lodash'],
          toast: ['react-toastify'],
          post: [
            path.resolve(__dirname, 'src/components/PostPage.jsx'),
            path.resolve(__dirname, 'src/components/PriorityContent.jsx'),
          ],
          layout: [path.resolve(__dirname, 'src/components/Layout.jsx')],
        },
        chunkFileNames: (chunkInfo) => {
          if (['post', 'layout'].includes(chunkInfo.name)) {
            return 'assets/priority-[name]-[hash].js';
          }
          if (['react', 'redux', 'router', 'uiLibs', 'utilities', 'syntax_highlighter', 'codemirror', 'parse5', 'lodash', 'toast'].includes(chunkInfo.name)) {
            return 'assets/[name]-[hash].async.js';
          }
          return 'assets/[name]-[hash].js';
        },
      },
    },
    outDir: 'dist',
    assetsDir: 'assets',
    assetsInlineLimit: 16384, // Increased to inline PriorityContent, PostPage, Layout
    chunkSizeWarningLimit: 250,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      path.resolve(__dirname, 'src/components/PostPage.jsx'),
      path.resolve(__dirname, 'src/components/PriorityContent.jsx'),
      path.resolve(__dirname, 'src/components/Layout.jsx'),
    ],
    exclude: ['react-toastify', 'redux', 'react-redux', 'axios', 'highlight.js', '@codemirror/view', '@codemirror/state', 'parse5', 'lodash', 'react-syntax-highlighter'],
    force: true,
  },
  server: {
    fs: { allow: ['.'] },
    hmr: { overlay: true },
    preload: [
      path.resolve(__dirname, 'src/components/PriorityContent.jsx'),
      path.resolve(__dirname, 'src/components/PostPage.jsx'),
      path.resolve(__dirname, 'src/components/Layout.jsx'),
    ],
  },
});
