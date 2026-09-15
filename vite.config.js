import { defineConfig, loadEnv } from 'vite'
import eslint from 'vite-plugin-eslint'
import path from 'path'
import createVitePlugins from './vite/plugins'

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  const fileEnv = loadEnv(mode, process.cwd())
  const VITE_APP_ENV =
    process.env.VITE_APP_ENV || fileEnv.VITE_APP_ENV || mode
  const VITE_APP_BASE_API =
    process.env.VITE_APP_BASE_API || fileEnv.VITE_APP_BASE_API || '/dev-api'
  const VITE_APP_URL =
    process.env.VITE_APP_URL || fileEnv.VITE_APP_URL || 'http://127.0.0.1:8080'
  const VITE_PORT = Number(process.env.VITE_PORT || fileEnv.VITE_PORT || 8088)

  const env = {
    ...fileEnv,
    VITE_APP_ENV,
    VITE_APP_BASE_API,
    VITE_APP_URL,
    VITE_PORT: String(VITE_PORT)
  }
  const rewriteExp = new RegExp('^' + VITE_APP_BASE_API)
  const IS_DEV_ENV = VITE_APP_ENV === 'development'
  const PluginsList = [...createVitePlugins(env, command === 'build')]

  if (IS_DEV_ENV) {
    PluginsList.push(eslint({}))
  }

  return {
    // 部署生产环境和开发环境下的 URL。
    base: '/',
    plugins: PluginsList,

    resolve: {
      alias: {
        '~': path.resolve(__dirname, './'),
        '@': path.resolve(__dirname, './src')
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },

    server: {
      port: VITE_PORT,
      host: true,
      // CI 中禁止自动打开浏览器，本地开发保持原行为。
      open: process.env.CI !== 'true',
      proxy: {
        [VITE_APP_BASE_API]: {
          target: VITE_APP_URL,
          changeOrigin: true,
          rewrite: p => p.replace(rewriteExp, '')
        }
      }
    },

    // fix: error: <stdin>:7356:1: warning: "@charset" must be the first rule in the file
    css: {
      postcss: {
        plugins: [
          {
            postcssPlugin: 'internal:charset-removal',
            AtRule: {
              charset: atRule => {
                if (atRule.name === 'charset') {
                  atRule.remove()
                }
              }
            }
          }
        ]
      }
    }
  }
})
