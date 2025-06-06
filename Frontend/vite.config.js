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
            urlPattern: /^https:\/\/g3u06ptici\.execute-api\.ap-south-1\.amazonaws\.com\/prod\/post/,
            handler: 'NetworkOnly',
            options: {
              cacheName: 'ssr-post',
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/g3u06ptici\.execute-api\.ap-south-1\.amazonaws\.com/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
              networkTimeoutSeconds: 5,
            },
          },
          {
            urlPattern: /^https:\/\/mys3resources\.s3\.ap-south-1\.amazonaws\.com/,
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
    dedupe: ['popper.js', 'styled-components', '@uiw/react-codemirror'],
  },
  build: {
    minify: 'esbuild',
    sourcemap: true,
    target: 'esnext',
    treeshake: 'recommended',
    modulePreload: {
      polyfill: true,
    },
    manifest: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        codeHighlighter: path.resolve(__dirname, 'public/scripts/codeHighlighter.js'),
      },
      output: {
        experimentalMinChunkSize: 10000,
        manualChunks: {
          react: ['react', 'react-dom'],
          redux: ['redux', 'react-redux'],
          router: ['react-router-dom'],
          uiLibs: ['framer-motion', 'styled-components'],
          utilities: ['react-helmet-async', 'dompurify', 'react-copy-to-clipboard'],
          codemirror: ['@uiw/react-codemirror', '@codemirror/lang-javascript', '@codemirror/lang-python', '@codemirror/lang-html', '@codemirror/lang-css', '@codemirror/lang-json', '@codemirror/lang-markdown', '@uiw/codemirror-theme-vscode'],
          prettier: ['prettier'],
          syntax_highlighter: ['react-syntax-highlighter', 'highlight.js'],
          parse5: ['parse5'],
          lodash: ['lodash'],
          toast: ['react-toastify'],
          post: [path.resolve(__dirname, 'src/components/PostPage.jsx')],
          layout: [path.resolve(__dirname, 'src/components/Layout.jsx')],
          home: [path.resolve(__dirname, 'src/pages/Home.jsx')],
          register: [path.resolve(__dirname, 'src/pages/Register.jsx')],
          dashboard: [path.resolve(__dirname, 'src/pages/Dashboard.jsx')],
          adminDashboard: [path.resolve(__dirname, 'src/components/AdminDashboard.jsx')],
          postList: [path.resolve(__dirname, 'src/components/PostList.jsx')],
          categoryPage: [path.resolve(__dirname, 'src/components/CategoryPage.jsx')],
          forgotPassword: [path.resolve(__dirname, 'src/pages/ForgotPassword.jsx')],
          resetPassword: [path.resolve(__dirname, 'src/pages/ResetPassword.jsx')],
          verifyCertificate: [path.resolve(__dirname, 'src/components/VerifyCertificate.jsx')],
          category: [path.resolve(__dirname, 'src/pages/Category.jsx')],
          footer: [path.resolve(__dirname, 'src/components/Footer.jsx')],
          notification: [path.resolve(__dirname, 'src/components/Notification.jsx')],
          codeEditor: [path.resolve(__dirname, 'src/components/CodeEditor.jsx')],
          faqPage: [path.resolve(__dirname, 'src/components/FAQPage.jsx')],
          addPostForm: [path.resolve(__dirname, 'src/components/AddPostForm.jsx')],
        },
        chunkFileNames: (chunkInfo) => {
          if (['post', 'layout', 'codemirror', 'prettier'].includes(chunkInfo.name)) {
            return 'assets/priority-[name]-[hash].js';
          }
          if (['react', 'redux', 'router', 'uiLibs', 'utilities', 'syntax_highlighter', 'parse5', 'lodash', 'toast'].includes(chunkInfo.name)) {
            return 'assets/[name]-[hash].async.js';
          }
          return 'assets/[name]-[hash].js';
        },
      },
    },
    outDir: 'dist',
    assetsDir: 'assets',
    assetsInlineLimit: 16384,
    chunkSizeWarningLimit: 250,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'styled-components',
      '@uiw/react-codemirror',
      '@codemirror/lang-javascript',
      '@codemirror/lang-python',
      '@codemirror/lang-html',
      '@codemirror/lang-css',
      '@codemirror/lang-json',
      '@codemirror/lang-markdown',
      '@uiw/codemirror-theme-vscode',
      'prettier',
      path.resolve(__dirname, 'src/components/PostPage.jsx'),
      path.resolve(__dirname, 'src/components/Layout.jsx'),
      path.resolve(__dirname, 'src/pages/Home.jsx'),
      path.resolve(__dirname, 'src/pages/Register.jsx'),
      path.resolve(__dirname, 'src/pages/Dashboard.jsx'),
    ],
    exclude: ['react-toastify', 'redux', 'react-redux', 'axios', 'highlight.js'],
    force: true,
  },
  ssr: {
    noExternal: ['styled-components', '@uiw/react-codemirror'],
  },
  server: {
    fs: { allow: ['.'] },
    hmr: { overlay: true },
    port: 5173,
    proxy: {
      '/api/posts/complete/:postId': {
        target: 'https://g3u06ptici.execute-api.ap-south-1.amazonaws.com/prod',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/posts\/complete/, '/api/posts/complete'),
      },
      '/api/posts/completed': {
        target: 'https://g3u06ptici.execute-api.ap-south-1.amazonaws.com/prod',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/posts\/completed/, '/api/posts/completed'),
      },
      '/api/posts': {
        target: 'https://g3u06ptici.execute-api.ap-south-1.amazonaws.com/prod',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/posts/, '/api/posts'),
      },
      '/get-presigned-url': {
        target: 'https://g3u06ptici.execute-api.ap-south-1.amazonaws.com/prod',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/get-presigned-url/, '/get-presigned-url'),
      },
      '/api': {
        target: 'https://g3u06ptici.execute-api.ap-south-1.amazonaws.com/prod',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api/posts'),
      },
      '/post': {
        target: 'https://g3u06ptici.execute-api.ap-south-1.amazonaws.com/prod',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/post/, '/post'),
      },
    },
  },
});
