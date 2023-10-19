/* eslint-disable */
const models =
[
  'warehouse' // 前置仓系统
]

const modelsConfig = {
  warehouse: {
    pages: {
      index: {
        title: process.env.VUE_APP_TITLE === 'pro' ? '嘉贤-仓储系统' : '仓储-测试环境',
        entry: "src/applications/warehouse/main.js",
        template: "src/applications/warehouse/index.html",
        filename: "index.html"
      }
    },
    devServer: {
      // 此处开启 https
      hot: true, //热更新
      https: false,
      port: '8088',
      historyApiFallback: true,
      allowedHosts: "all"
    }
  }
}

module.exports = {
  name: models[0],
  config: modelsConfig[models[0]]
}
