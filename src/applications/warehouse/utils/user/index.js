import { jxRequest, loading } from "@/applications/warehouse/public/jxRequest/index"
import { ref } from 'vue'

/**修改密码  */
const changePassword = async (params) => {
  let res = await jxRequest.post(`/permission/updatePassword`, params)
  return res
}
export { changePassword }