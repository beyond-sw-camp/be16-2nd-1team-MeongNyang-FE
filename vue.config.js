const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 3000,
    proxy: {
      '/users': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    }
  },
  // 환경 변수 설정
  chainWebpack: config => {
    config.plugin('define').tap(args => {
      args[0]['process.env.VUE_APP_API_BASE_URL'] = JSON.stringify('http://localhost:8080')
      return args
    })
  }
})
