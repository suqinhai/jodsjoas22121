
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueSetupExtend from 'vite-plugin-vue-setup-extend'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
//压缩 dist 为 zip, tar, taz
import viteCompression from 'vite-plugin-compression'
import topLevelAwait from 'vite-plugin-top-level-await'
import { visualizer } from 'rollup-plugin-visualizer'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
// 浏览器版本兼容
import legacy from '@vitejs/plugin-legacy'
import path from 'path'

const resolve = (file) => path.resolve(__dirname, './' + file)
const alias = {
    '@': resolve('./src'),
    '@assets': resolve('./src/assets'),
    '@common': resolve('./src/common'),
    '@api': resolve('./src/api'),
}

import vitePluginClass from './vite-plugin-class.js';


export default defineConfig(({ common, mode }) => {
    const env = loadEnv(mode, path.resolve(__dirname, './env'))
    return {
        server: {
            host: '0.0.0.0',
            port: 2010, // 端口号
            hmr: true,
            cors: true,
        },
        resolve: {
            alias,
            extensions: [
                '.mjs',
                '.js',
                '.ts',
                '.jsx',
                '.tsx',
                '.json',
                '.vue',
                '.css',
            ],
        },
        plugins: [
            env.VITE_MODE === 'PRO' && vitePluginClass(),
            vue(),
            VueSetupExtend(),
            AutoImport({
                resolvers: [ElementPlusResolver()],
            }),
            Components({
                dts: false,
                resolvers: [ElementPlusResolver()],
            }),
            viteCompression(),
            topLevelAwait({
                // The export name of top-level await promise for each chunk module
                promiseExportName: '__tla',
                // The function to generate import names of top-level await promise in each chunk module
                promiseImportName: (i) => `__tla_${i}`,
            }),
            visualizer({
                emitFile: false,
                file: 'stats.html', //分析图生成的文件名
                open: false, //如果存在本地服务端口，将在打包后自动展示
            }),
            createSvgIconsPlugin({
                iconDirs: [
                    path.resolve(process.cwd(), 'src/assets/svg/svgIcon'),
                ], // icon存放的目录
                symbolId: 'icon-[name]', // symbol的id
                inject: 'body-last', // 插入的位置
                customDomId: '__svg__icons__dom__', // svg的id
            }),
        ],
        build: {
            outDir: 'dist',
            rollupOptions: {
                plugins: [
                    legacy({
                        targets: ['> 1%, last 1 version, ie >= 11'],
                    }),
                ],
                input: {
                    index: 'index.html',
                },
                output: {
                    manualChunks(id) {
                        if (id.includes('node_modules')) {
                            return id
                                .toString()
                                .split('node_modules/')[1]
                                .split('/')[0]
                                .toString()
                        }
                    },
                    // 用于从入口点创建的块的打包输出格式[name]表示文件名,[hash]表示该文件内容hash值
                    entryFileNames: 'js/[name].[hash].js',
                    // 用于命名代码拆分时创建的共享块的输出命名
                    chunkFileNames: 'js/[name].[hash].js',
                    // 用于输出静态资源的命名，[ext]表示文件扩展名
                    assetFileNames: '[ext]/[name].[hash].[ext]',
                },
            },
        },
        define: {
            'process.env': {
                ...loadEnv(mode, path.resolve(__dirname, './env')),
            },
            __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'true',
        },
        optimizeDeps: {
            include: ['schart.js'],
        },
        cssCodeSplit: true,
        sourcemap: false,
        base: env.VITE_BASE_PATH || '/',
        root: './',
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: `@import "@common/styles/mixin.scss";`,
                },
            },
        },
    }
})
