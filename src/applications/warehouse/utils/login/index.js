import { ElMessage } from 'element-plus'
import { jxRequest, loading } from "@/applications/warehouse/public/jxRequest/index"
const userLogin = async function(params) {
  let res = await jxRequest.post(`/permission/login?account=${params.account}&password=${params.password}`)
  if (res.data.code === 1001){
    ElMessage.error(res.data.message)
    return false
  }
  else if (res.data.code === 200){
    sessionStorage.setItem('userInfo', JSON.stringify(res.data.data))
    sessionStorage.setItem('userId', res.data.data.userId)
    return true
  }
}

const userRegister = async function(params) {
  let res = await jxRequest.post(`/permission/register`, params)
  return res
}

const getResourse = async () => {
  let res = await jxRequest.get(`/permission/resource`)
  return res
}

export { loading, userLogin, userRegister, getResourse }