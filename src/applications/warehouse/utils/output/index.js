import { jxRequest, loading, changeTime } from "@/applications/warehouse/public/jxRequest/index"
import { DataTool } from '@/js/tool-class/dataTool'
import PublicDataSource from '@/js/table-handle-class/publicDataSource'

class OutputDataSource extends PublicDataSource {
  constructor({
    modules = '',
    selectUri = '/',
    deleteUri = '/',
    selectOneUri = '/',
    pageSize = 20,
    useDefaultTimeRangeFilter = false,
    defaultTimeRangeDay = 7,
    tableHeader
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
  forMatData(row, column){
    let processStatus = {
      OUT_WAREHOUSE_ORDER_CREATE: "制单",
      OUT_WAREHOUSE_ORDER_WF: "等待出库",
      OUT_WAREHOUSE_ORDER_OUT: "出库中",
      OUT_WAREHOUSE_ORDER_DOC: "归档"
    }
    if (!row[column.property]) {
      return '-'
    }
    if (column.label.indexOf('时间') !== -1) {
      return changeTime(row[column.property])
    }
    if (column.label.indexOf('流程状态') !== -1){
      return processStatus[row[column.property]]
    }
    return row[column.property]
  }
  forMatDataV2(key, value){
    let processStatus = {
      OUT_WAREHOUSE_ORDER_CREATE: "制单",
      OUT_WAREHOUSE_ORDER_WF: "等待出库",
      OUT_WAREHOUSE_ORDER_OUT: "出库中",
      OUT_WAREHOUSE_ORDER_DOC: "归档"
    }
    let outputType = {
      DB: '调拨单出库',
      XS: '销售订单出库',
      PC: '派车单出库'
    }
    switch (key){
    case 'processStatus': {
      return processStatus[value]
    }

    case 'type': {
      return outputType[value]
    }
    default: {
      if (key.toLowerCase().indexOf('time') !== -1){
        return new DataTool().timeStamp2Time(value, 'yyyy-MM-dd hh:mm:ss')
      } else return value ? value : '-'
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

  async getQueryBySaleOrderDetail(params){
    let { data: { code, data, message } } = await jxRequest.post(`/outWarehouseOrderMain/queryBySaleOrderDetail`, params)
    return code === 200 ? data : []
  }

  async getQueryByAllotOrderDetail(params){
    const { data: { code, message, data } } = await jxRequest.post(`/outWarehouseOrderMain/queryByAllocationOrderDetail?currentPage=${1}&pageSize=${100}`, params)
    return code === 200 ? data : []
  }

  async getQueryOutWarehouseOrderMaterialDetail(params){
    let { data: { code, data, message } } = await jxRequest.post(`/outWarehouseOrderMain/queryOutWarehouseOrderMaterialDetail`, params)
    return code === 200 ? { data, code } : message
  }

  async queryOutWarehouseOrderMaterialDetailsOrSave(params){
    let { data: { code, data, message } } = await jxRequest.post(`/outWarehouseOrderMain/queryOutWarehouseOrderMaterialDetailsOrSave`, params)
    return code === 200 ? { data, code } : message
  }

  async saveBath(params){
    let { data: { code, data, message } } = await jxRequest.post(`/outWarehouseOrderMain/saveBath`, params)
    return code === 200 ? code : message
  }

  // 销售订单出库明细
  async getOutWarehouseOrderDetail(outWarehouseCode){
    let { data: { code, data, message } } = await jxRequest.post(`/outWarehouseOrderDetail/select?currentPage=1&pageSize=1000`, { outWarehouseCode })
    return code === 200 ? data.pageInfo.list : []
  }

  // 物料出库明细
  async getOutWarehouseOrderMaterialDetail(outWarehouseCode){
    let { data: { code, data, message } } = await jxRequest.post(`/outWarehouseOrderMaterialDetail/select?currentPage=1&pageSize=1000`, { outWarehouseCode })
    return code === 200 ? data.pageInfo.list : []
  }

  /** 出库单导出-物料 */
  async exportOutWarehouseSlip(params) {
    let { data } = await jxRequest.post(`/outWarehouseOrderMaterialDetail/selectByOutWarehouseCode`, params)
    return data
  }

  /** 出库单导出-套机 */
  async exportOutWarehouseSlipBySet(params) {
    let { data } = await jxRequest.post(`/outWarehouseOrderDetail/selectByOutWarehouseCode`, params)
    return data
  }

  /**出库单打印次数 */
  async printOutPutNum(params) {
    let res = await jxRequest.post(`/outWarehouseOrderMain/increaseNumberOfPrints`, params)
    return res
  }

  /**手动出库 */
  async handleOut(params) {
    let { data } = await jxRequest.post(`/outWarehouseOrderMain/updateSD`, params)
    return data
  }

  /**获取手动出库类型 */
  async getHandleOutType() {
    let { data: { code, data, message } } = await jxRequest.post(`/keyValue/getIgnoreType`)
    return code === 200 ? { data, code } : message
  }

  /**根据派车单号获取产品汇总 */
  async qveryBytransportcodeDetail(params) {
    let { data: { code, data, message } } = await jxRequest.post(`/outWarehouseOrderMain/queryByTransportCodeDetail`, params)
    return code === 200 ? { data, code } : message
  }
}

class OutputDetailSource extends PublicDataSource {
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
  forMatData(row, column){
    let processStatus = {
      OUT_WAREHOUSE_ORDER_CREATE: "制单",
      OUT_WAREHOUSE_ORDER_WF: "等待出库",
      OUT_WAREHOUSE_ORDER_OUT: "出库中",
      OUT_WAREHOUSE_ORDER_DOC: "归档"
    }
    if (!row[column.property]) {
      return '-'
    }
    if (column.label.indexOf('时间') !== -1) {
      return changeTime(row[column.property])
    }
    if (column.label.indexOf('流程状态') !== -1){
      return processStatus[row[column.property]]
    }
    return row[column.property]
  }
}
export { OutputDataSource, loading, OutputDetailSource }