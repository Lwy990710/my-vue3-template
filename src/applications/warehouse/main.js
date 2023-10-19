import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import installElementPlus from './plugins/element'
import { DataTool } from '@/js/tool-class/dataTool'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import * as XLSX from "xlsx"
import VueParticles from 'vue-particles'

if (process.env.VUE_APP_TITLE === 'dev'){
  const { config: { devServer: { https } } } = require('@/../models')
  https ? document.querySelector('link[rel="icon"]').setAttribute('href', 'https://localhost:8088/test.ico') :
    document.querySelector('link[rel="icon"]').setAttribute('href', 'http://localhost:8088/test.ico')
}

const app = createApp(App)

// 权限指令
app.directive('authority', (el, binding) => {
  const permissionsArr = JSON.parse(sessionStorage.getItem('userPermissions'))
  el.style.disabled = !permissionsArr.includes(binding.value)
  if (!permissionsArr.includes(binding.value)){
    el.style.display = 'none'
  }
})

//  自动聚焦指令
app.directive('focus', (el, binding) => {
  let dom = el.querySelector('input')
  dom.focus()
})

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.config.globalProperties.$DataTool = DataTool

installElementPlus(app)
app.use(store).use(router).use(VueParticles).mount('#app')