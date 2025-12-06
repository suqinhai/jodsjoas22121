/*
 * @Date: 2023-08-25 16:33:49
 * @LastEditors: Sai
 * @LastEditTime: 2023-09-22 15:30:41
 */
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


// 自定义 class 混淆插件
function classObfuscatorPlugin() {
    const classMap = new Map()
    let counter = 0

    const generateName = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyz'
        let result = ''
        let n = counter++
        do {
            result = chars[n % 26] + result
            n = Math.floor(n / 26)
        } while (n > 0)
        return '_' + result
    }

    const getObfuscatedName = (className) => {
        if (!classMap.has(className)) {
            classMap.set(className, generateName())
        }
        return classMap.get(className)
    }

    // 排除的 class 前缀（第三方库）
    const excludePrefixes = ['el-', 'van-', 'ant-', 'v-', 'router-']
    const shouldExclude = (name) => excludePrefixes.some(p => name.startsWith(p))

    return {
        name: 'vite-plugin-class-obfuscator',
        enforce: 'post',
        apply: 'build',

        generateBundle(options, bundle) {
            for (const fileName in bundle) {
                const chunk = bundle[fileName]

                // 处理 CSS 文件 - 收集所有 class
                if (fileName.endsWith('.css') && chunk.source) {
                    let css = chunk.source
                    // 匹配 CSS 选择器中的 class
                    css = css.replace(/\.([a-zA-Z_][a-zA-Z0-9_-]*)/g, (match, className) => {
                        if (shouldExclude(className)) return match
                        return '.' + getObfuscatedName(className)
                    })
                    chunk.source = css
                }
            }

            // 第二遍：处理 JS 文件中的 class 引用
            for (const fileName in bundle) {
                const chunk = bundle[fileName]
                if (fileName.endsWith('.js') && chunk.code) {
                    let code = chunk.code
                    classMap.forEach((newName, oldName) => {
                        // 替换 class="xxx" 和 :class 中的引用
                        const regex = new RegExp(`(class=["'\`][^"'\`]*)(\\b${oldName}\\b)([^"'\`]*["'\`])`, 'g')
                        code = code.replace(regex, `$1${newName}$3`)
                        // 替换字符串中的 class 名
                        const strRegex = new RegExp(`(["'\`])${oldName}\\1`, 'g')
                        code = code.replace(strRegex, `$1${newName}$1`)
                    })
                    chunk.code = code
                }
            }
        }
    }
}

export default defineConfig(({ common, mode }) => {
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
            classObfuscatorPlugin()
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
        base: '/',
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
