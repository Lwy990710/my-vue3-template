import { jxRequest, loading } from "@/applications/warehouse/public/jxRequest/index"

class Message {
  constructor(){
    this.userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
  }
  async selectMessageList(){
    let { data: { data, code, message } } = await jxRequest.post(`imMessage/selectMessageList?account=${this.userInfo.account}`)
    return code === 200 ? { code, data } : message
  }
  async selectUnreadMessageCount(){
    let { data: { data, code, message } } = await jxRequest.post(`/imMessage/selectUnreadMessageCount?account=${this.userInfo.account}`)
    return code === 200 ? { code, data } : message
  }
  async updateStatus(params){
    let { data: { data, code, message } } = await jxRequest.post(`/imMessage/updateStatus`, params)
    return code === 200 ? { code, data } : message
  }
  async deleteMessage(params){
    let { data: { data, code, message } } = await jxRequest.post(`/imMessage/delete`, params)
    return code === 200 ? { code, data } : message
  }

}

export { Message }