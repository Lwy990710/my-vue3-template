import { jxRequest, loading, changeTime } from "@/applications/warehouse/public/jxRequest/index"
import PublicDataSource from '@/js/table-handle-class/publicDataSource'
import { DataTool } from '@/js/tool-class/dataTool'

class PickupDataSource extends PublicDataSource {
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
  async excelAddBatch(params){
    const { data: { code, message } } = await jxRequest.post(`/pickingOrderMain/excelAddBatch`, params)
    return code === 200 ? code : message
  }
  async createAllocationOrder(params){
    const { data: { code, message } } = await jxRequest.post(`/allocationPlan/createAllocationOrder`, params)
    return code === 200 ? code : message

  }
  async queryByAccountId(userId){
    const { data: { code, message, data } } = await jxRequest.post(`/merchant/queryByAccountId?userId=${userId}`)
    return code === 200 ? { data, code } : message
  }
  async doAddMerchantStock(params){
    const { data: { code, message, data } } = await jxRequest.post(`pickingOrderMain/doAddMerchantStock`, params)
    return code === 200 ? { data, code } : message
  }
  async moveToLogSys({ warehouseFlag, params }){
    const { data: { code, message, data } } = await jxRequest.post(`/pickingOrderMain/moveToLogSys?warehouseFlag=` + warehouseFlag, params)
    return code === 200 ? { data, code } : message
  }

  forMatDataV2(key, value){
    let status = {
      PICK_ORDER_NO_ALLOCATION: '未调拨',
      PICK_ORDER_ALLOCATION_ING: '调拨中',
      PICK_ORDER_HAVA_ALLOCATION: '已调拨',
      PICK_ORDER_IN_ALLOCATION_PLAN: '已入调拨计划库'
    }
    switch (key){
    case 'hasSendDingTalk': {
      return value === 0 ? '否' : '是'
    }

    case 'processStatus': {
      return status[value]
    }

    default: {
      if (key.toLowerCase().indexOf('time') !== -1){
        return new DataTool().timeStamp2Time(value, 'yyyy-MM-dd hh:mm:ss')
      } else return value ? value : '-'
    }
    }
  }
}

export { PickupDataSource, loading }