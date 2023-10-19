import { jxRequest, loading } from "@/applications/warehouse/public/jxRequest/index"
import { DataTool } from '@/js/tool-class/dataTool'
import PublicDataSource from '@/js/table-handle-class/publicDataSource'

class SaleSlipDataSource extends PublicDataSource {
  constructor({
    modules = '',
    selectUri = '/',
    deleteUri = '/',
    selectOneUri = '/',
    pageSize = 20,
    tableHeader,
    useDefaultTimeRangeFilter = false,
    defaultTimeRangeDay = 7
  } = {}){
    super({
      modules,
      selectUri,
      deleteUri,
      selectOneUri,
      pageSize,
      useDefaultTimeRangeFilter,
      defaultTimeRangeDay,
      tableHeader
    })
  }
  forMatDataV2(key, value){
    let processStatus = {
      SALE_ORDER_CREATE: "制单",
      SALE_ORDER_MAT: "留料",
      SALE_ORDER_OUT: "出库中",
      SALE_ORDER_DOC: "归档",
      SALE_ORDER_RETURN: '退货'
    }
    switch (key){
    case 'processStatus': {
      return processStatus[value]
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
  search(searchData, context = this, tableRef){
    if (Object.keys(searchData).length === 0){
      context.searchData = {}
      context.initData(context, tableRef, false)
      return
    }
    context.searchData = searchData
    if (context.searchData.createTime){
      if (context.searchData.createTime[0] === context.searchData.createTime[1]){
        context.searchData.createTime = Date.parse(context.searchData.createTime[0])
      } else {
        context.searchData.createStartTime = Date.parse(context.searchData.createTime[0])
        context.searchData.createEndTime = Date.parse(context.searchData.createTime[1])
        delete context.searchData.createTime
      }
    }
    if (context.searchData.updateTime){
      if (context.searchData.updateTime[0] === context.searchData.updateTime[1]){
        context.searchData.updateTime = Date.parse(context.searchData.updateTime[0])
      } else {
        context.searchData.updateStartTime = Date.parse(context.searchData.updateTime[0])
        context.searchData.updateEndTime = Date.parse(context.searchData.updateTime[1])
        delete context.searchData.updateTime
      }
    }
    context.currentPage = 1
    context.initData(context, tableRef, true)
  }

  async addSaleOrder(params){
    const { data: { code, message, data } } = await jxRequest.post(`/saleOrderMain/addBatch`, params)
    return code === 200 ? { code, data } : message
  }
  async updateSaleOrder(params){
    const { data: { code, message, data } } = await jxRequest.post(`/saleOrderMain/updateBatch`, params)
    return code === 200 ? code : message
  }

  async queryByAccountId(userId){
    const { data: { code, message, data } } = await jxRequest.post(`/merchant/queryByAccountId?userId=${userId}`)
    return code === 200 ? { data, code } : message
  }
  async nextStatus(params){
    const { data: { code, message } } = await jxRequest.post(`/saleOrderMain/nextStatus`, params)
    return code === 200 ? code : message
  }
  async searchSaleOrderDetails(params){
    const { data: { code, message, data } } = await jxRequest.post(`/saleOrderDetailController/select?currentPage=${1}&pageSize=${100}`, params)
    return code === 200 ? data.pageInfo : []
  }
  async previousState(saleOrderCode){
    const { data: { code, message } } = await jxRequest.post(`/saleOrderMain/previousState?saleOrderCode=${saleOrderCode}`)
    return code === 200 ? code : message
  }
  async outSaleOrderMainAndDetail(params){
    const { data: { code, message, data } } = await jxRequest.post(`/saleOrderMain/outSaleOrderMainAndDetail`, params)
    return code === 200 ? { code, data } : message
  }
  async listBySaleCodeOrBranchOrderCode(orderCode){
    const { data: { code, message, data } } = await jxRequest.post(`/branchOrderTrack/listBySaleCodeOrBranchOrderCode?code=${orderCode}`)
    return code === 200 ? { code, data } : message
  }

  /**销售订单打印次数 */
  async printSaleNum(params){
    const res = await jxRequest.post(`/saleOrderMain/increaseNumberOfPrints`, params)
    return res
  }
}

class CustomerDataSource extends PublicDataSource{
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
  async initData(context = this, tableRef){
    if (tableRef) tableRef.clearSelection()
    let result
    if (context.searchData.customerName && context.searchData.customerName.length !== 0){
      result = await jxRequest.post(`${context.selectUri}?currentPage=${context.currentPage}&pageSize=${context.pageSize}&customerName=${context.searchData.customerName}&merchantCode=${context.searchData.merchantCode}`)
    } else {
      result = await jxRequest.post(`${context.selectUri}?currentPage=${context.currentPage}&pageSize=${context.pageSize}&merchantCode=${context.searchData.merchantCode}`)
    }
    let { data: { data, code, message } } = result
    context.tableData.length = 0
    context.total = data.pageInfo.total
    context.tableData.push(...code === 200 ? data.pageInfo.list : [])
  }
}

export { SaleSlipDataSource, loading, CustomerDataSource }