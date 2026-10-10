import { createServer } from 'vite'
import path from 'node:path'
const server = await createServer({
  mode: 'staging',
  root: path.resolve('.payment-term-check'),
  configFile: path.resolve('vite.config.js'),
  resolve: {alias: [
    {find: /^vue$/, replacement: path.resolve('node_modules/vue/dist/vue.esm-bundler.js')},
    {find: /^@\/utils\/request(?:\.js)?$/, replacement: path.resolve('.payment-term-check/mock-request.js')},
    {find: '@', replacement: path.resolve('src')}
  ]},
  server: {port: 8097, host: '127.0.0.1', open: false, fs: {allow: [path.resolve('.')]}}
})
await server.listen()
server.printUrls()
