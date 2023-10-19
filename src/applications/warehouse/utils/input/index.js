import { jxRequest, loading, changeTime } from "@/applications/warehouse/public/jxRequest/index"
import { DataTool } from '@/js/tool-class/dataTool'
import PublicDataSource from '@/js/table-handle-class/publicDataSource'

class IutputDataSource extends PublicDataSource {
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
  forMatDataV2(key, value){
    let processStatus = {
      IN_WAREHOUSE_ORDER_CREATE: "制单",
      IN_WAREHOUSE_ORDER_WF: "等待入库",
      IN_WAREHOUSE_ORDER_ING: "入库中",
      IN_WAREHOUSE_ORDER_DOC: "归档"
    }
    let type = {
      ALLOCATION: "调拨入库",
      SALE_RETURN: "销售订单退货"
    }
    switch (key){
    case 'processStatus': {
      return processStatus[value]
    }
    case 'type': {
      return type[value]
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

  async createByAllocationOrReturnOrder(params){
    let { data: { code, data, message } } = await jxRequest.post(`/inWarehouseOrderMain/createByAllocationOrReturnOrder`, params)
    return code === 200 ? { data, code } : message
  }
  async selectByOutWarehouseCode(params){
    let { data: { code, data, message } } = await jxRequest.post(`/inWarehouseOrderMaterialDetail/exportByInWarehouseCodeList`, params)
    return code === 200 ? { data, code } : message
  }
  async printInputSlip(params) {
    let { data: { code, data, message } } = await jxRequest.post(`/inWarehouseOrderMaterialDetail/select?currentPage=1&pageSize=1000`, params)
    return code === 200 ? data.pageInfo.list : []
  }
  async exportByInWarehouseCodeList(params) {
    let { data: { code, data, message } } = await jxRequest.post(`/inWarehouseOrderDetail/exportByInWarehouseCodeList`, params)
    return code === 200 ? { data, code } : message
  }

  /**入库单打印次数 */
  async printInputNum(params) {
    let res = await jxRequest.post(`/inWarehouseOrderMain/increaseNumberOfPrints`, params)
    return res
  }

  /**入库单更新条码头 */
  async updateInputBarcodeHead(params) {
    let { data } = await jxRequest.post(`/inWarehouseOrderMaterialDetail/flashBarCodeHead`, params)
    return data
  }
}

class IutputOrderDetailSource extends PublicDataSource {
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
}

class IutputOrderMaterialDetailSource extends PublicDataSource {
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
}

class IutputScanDetailSource extends PublicDataSource {
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
    let materialStatusArr = {
      GOOD: '良品',
      BAD: '不良品'
    }
    if (!row[column.property]) {
      return '-'
    }
    if (column.label.indexOf('产品质量') !== -1) {
      return materialStatusArr[row[column.property]]
    }
    return row[column.property]
  }
}

class IutputPositionDetailSource extends PublicDataSource {
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
}

export { IutputDataSource, IutputOrderDetailSource, IutputOrderMaterialDetailSource, IutputScanDetailSource, IutputPositionDetailSource, loading }