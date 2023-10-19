import { jxRequest, loading } from "@/applications/warehouse/public/jxRequest/index"
import { DataTool } from '@/js/tool-class/dataTool'
import PublicDataSource from '@/js/table-handle-class/publicDataSource'

class AllotSlipDataSource extends PublicDataSource {
  constructor({
    modules = '',
    selectUri = '/',
    deleteUri = '/',
    selectOneUri = '/',
    pageSize = 20,
    tableHeader
  } = {}){
    super({
      modules,
      selectUri,
      deleteUri,
      selectOneUri,
      pageSize,
      tableHeader
    })
  }
  forMatDataV2(key, value){
    let processStatus = {
      ALLOCATION_ORDER_CREATE: "制单",
      ALLOCATION_ORDER_ING: "调拨中",
      ALLOCATION_ORDER_WF: "等待出库",
      ALLOCATION_ORDER_OUT: "正在出库",
      ALLOCATION_ORDER_IN_WAREHOUSE_ING: "正在入库",
      ALLOCATION_ORDER_DOC: "归档",
      ALLOCATION_ORDER_RETURN: "反向调拨",
      ALLOCATION_ORDER_INVALID: "调拨订单无效"
    }
    let type = {
      BIG_TO_PRE: "大仓至前置仓",
      PRE_TO_BIG: "前置仓至大仓",
      PRE_TO_PRE: "前置仓平调",
      PICK_ORDER: "提货订单调拨",
      LOG_TO_MID: '物流系统到中转仓'
    }
    switch (key){
    case 'processStatus': {
      return processStatus[value]
    }
    case 'allocationType': {
      return type[value]
    }
    default: {
      if (key.toLowerCase().indexOf('time') !== -1){
        return new DataTool().timeStamp2Time(value, 'yyyy-MM-dd hh:mm:ss')
      } else return value ? value : '-'
    }
    }
  }
  async createAllocationOrder(type){
    let { data: { code, data, message } } = await jxRequest.post(`/allocationOrderMain/createAllocationOrder`, { allocationType: type })
    return code === 200 ? { code, data } : message
  }
  async updateAllocationOrder(params){
    let { data: { code, data, message } } = await jxRequest.post(`/allocationOrderMain/updateAllocationOrder`, params)
    return code === 200 ? code : message
  }
  async getOne(allocationOrderCode){
    let { data: { code, data, message } } = await jxRequest.post(`/allocationOrderMain/getOne`, { allocationOrderCode })
    return code === 200 ? { code, data } : message
  }
  async submitToAllocating(allocationCode){
    let { data: { code, data, message } } = await jxRequest.post(`/allocationOrderMain/submitToAllocating?allocationCode=${allocationCode}`)
    return code === 200 ? code : message
  }
  async setPreToBigDocStatus(params){
    let { data: { code, data, message } } = await jxRequest.post(`/allocationOrderMain/setPreToBigDocStatus`, params)
    return code === 200 ? code : message
  }

  /**调拨单打印次数 */
  async printAllotNum(params) {
    let res = await jxRequest.post(`/allocationOrderMain/increaseNumberOfPrints`, params)
    return res
  }

  /**调拨单导出 */
  async exportAllotSlip(params) {
    let { data } = await jxRequest.post(`/allocationOrderMain/exportData`, params)
    return data
  }

  /**调拨单无效 */
  async setAllotInvaild(params) {
    let { data: { code, data, message } } = await jxRequest.post(`/allocationOrderMain/setInvalid`, params)
    return code === 200 ? { data, code } : message
  }
}

export { AllotSlipDataSource, loading }