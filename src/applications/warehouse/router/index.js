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
})

router.afterEach(() => {
  NProgress.done()
})
export default router
