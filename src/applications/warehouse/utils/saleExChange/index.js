import { jxRequest, loading } from "@/applications/warehouse/public/jxRequest/index"
import { DataTool } from '@/js/tool-class/dataTool'
import PublicDataSource from '@/js/table-handle-class/publicDataSource'

class SaleExChangeDataSource extends PublicDataSource {
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
      MER_ALLOCATION_ORDER_CREATE: "制单",
      MER_ALLOCATION_ORDER_AUDIT: "审核中",
      MER_ALLOCATION_ORDER_DOC: "归档"
    }
    let shopallottype = {
      F2S: "父商家 -> 子商家",
      S2S: "子商家 -> 子商家",
      S2F: "子商家 -> 父商家"
    }
    switch (key){
    case 'processStatus': {
      return processStatus[value]
    }
    case 'shopallottype': {
      return shopallottype[value]
    }
    default: {
      let onShowValue = ''
      if (key && (key.indexOf('Time') !== -1 || key.indexOf('Date') !== -1)){
        onShowValue = new DataTool().timeStamp2Time(value, 'yyyy-MM-dd hh:mm:ss')
      } else onShowValue = value || value === 0 ? value : '-'
      return onShowValue
    }
    }
  }
  async addBatch(params){
    const { data: { code, message, data } } = await jxRequest.post(`/merchantAllocationOrder/addBatch`, params)
    return code === 200 ? { code, data } : message
  }
  async updateBatch(params){
    const { data: { code, message, data } } = await jxRequest.post(`/merchantAllocationOrder/updateBatch`, params)
    return code === 200 ? { code, data } : message
  }
  async queryByAccountId(userId){
    const { data: { code, message, data } } = await jxRequest.post(`/merchant/queryByAccountId?userId=${userId}`)
    return code === 200 ? { data, code } : message
  }
  async getAllotDetail(merchantAllocationOrderCode){
    const { data: { code, message, data } } = await jxRequest.post(`/merchantAllocationOrderDetail/select?pageSize=100000&currentPage=1`, { merchantAllocationOrderCode })
    return code === 200 ? { data, code } : message
  }
  async nextStatus(merchantAllocationOrderCode){
    const { data: { code, message, data } } = await jxRequest.post(`/merchantAllocationOrder/nextStatus`, [merchantAllocationOrderCode])
    return code === 200 ? { data, code } : message
  }
  async outMerchantAllocationOrder(params){
    const { data: { code, message, data } } = await jxRequest.post(`/merchantAllocationOrder/outMerchantAllocationOrder`, params)
    return code === 200 ? { data, code } : message
  }

  /**商家调拨单打印次数 */
  async printShopSaleNum(params){
    const res = await jxRequest.post(`/merchantAllocationOrder/increaseNumberOfPrints`, params)
    return res
  }
}

export { SaleExChangeDataSource, loading }