// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig(({ command, mode }) => {
    console.log(command);
    return {
        root: 'resources',
        plugins: [react()],
        base: (command === "build") ? '/build/' : '/',
        server: {
            open: (process.env.IS_CONTAINER !== "TRUE"),
            hmr: true,
            host: true,
            port: 5173
        },
        resolve: {
            alias: {
                '@fa': resolve(__dirname, 'node_modules/@fortawesome/fontawesome-free'),
                '@app': resolve(__dirname, 'resources'),
            },
        },
        build: {
            outDir: '../public/build',
            emptyOutDir: true,
            manifest: true,
            rollupOptions: {
                input: [
                    "./resources/js/app.tsx"
                ],
                output: {
                    assetFileNames: '[name][extname]',
                    entryFileNames: '[name].js',
                    chunkFileNames: '[name].js',
                }
            }
        }
    }
})
