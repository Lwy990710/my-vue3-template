import { ElMessageBox, ElMessage } from 'element-plus'
import router from "@/applications/warehouse/router/index.js"

/**
 * 处理失败的方法
 * status: 状态码
 * ****  2xx ：成功
 *       3xx : 请求的资源重定向到其他网页
 *       4xx ： 客户端错误
 *       5xx ： 服务器内部错误
 * info: 失败的信息
 */
const errorHandle = (status, info) => {
  switch (status){
  case 400:
    ElMessage.error(info)
    break
  case 401:
    ElMessage.error(info)
    break
  case 403:
    ElMessage.error(info)
    break
  case 404:
    ElMessage.error(info)
    break
  case 500:
    ElMessage.error(info)
    break
  case 502:
    ElMessage.error(info)
    break
  // eslint-disable-next-line no-duplicate-case
  case 502:
    ElMessage.error(info)
    break
  case 1002:
    ElMessageBox.alert('登录过期，请重新登录', '提示', {
      confirmButtonText: '确定',
      callback: (action) => {
        if (action === 'confirm') {
          sessionStorage.clear()
          router.push('/login')
        }
      }
    })
    break
  default:
    return true
  }
}

export { errorHandle }