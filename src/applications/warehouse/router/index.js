import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
NProgress.configure({
  easing: 'ease',
  speed: 500,
  showSpinner: true,
  trickleSpeed: 200,
  minimum: 0.3
})
const routes = [
  {
    path: '/',
    redirect: "/login"
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  base: '/warsehouse/'
})

router.beforeEach((to, from, next) => {
  NProgress.start()
  window.document.title = to.meta.title ? to.meta.title : '嘉贤物流'
  if (to.meta.title === '物流轨迹查询'){
    if (to.query.type === 'user') window.document.title = '用户单轨迹查询'
    else window.document.title = '工程单轨迹查询'
  }
  if (to.path === '/login' || to.path === '/padHome' || to.path === '/trajectory'){
    sessionStorage.clear()
    next()
    return
  }
  const userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
  if (userInfo) {
    console.log(userInfo)
    next()
  }
  else {
    ElMessage.error('登录已过期,请重新登录')
    next('/login')
  }
})

router.afterEach(() => {
  NProgress.done()
})
export default router
