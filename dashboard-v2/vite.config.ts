import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import dynamicImport from 'vite-plugin-dynamic-import'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), dynamicImport()],
    assetsInclude: ['**/*.md'],
    resolve: {
        alias: {
            '@': path.join(__dirname, 'src'),
        },
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false, // ← add this (helps with self-signed certs if any)
                // Optional rewrite – only if you DON'T want /api stripped
                // rewrite: (path) => path,  // keeps /api in backend path
            },
        },
    },
    build: {
        outDir: 'build',
    },
})
