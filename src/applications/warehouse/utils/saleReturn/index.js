import { jxRequest, loading } from "@/applications/warehouse/public/jxRequest/index"
import PublicDataSource from '@/js/table-handle-class/publicDataSource'
import { DataTool } from '@/js/tool-class/dataTool'

let dataTool = new DataTool()

class SaleReturnSlipDataSource extends PublicDataSource {
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
      SALE_ORDER_RETURN_PICK_UP: "等待取件",
      SALE_ORDER_RETURN_PUT: "入库中",
      SALE_ORDER_RETURN_DOC: "归档"
    }
    switch (key){
    case 'processStatus': {
      return processStatus[value]
    }
    default: {
      if (key.indexOf('Time') !== -1 || key.indexOf('Date') !== -1){
        return new DataTool().timeStamp2Time(value, 'yyyy-MM-dd hh:mm:ss')
      } else return value ? value : '-'
    }
    }
  }
  async addSaleReturn(params){
    const { data: { code, message, data } } = await jxRequest.post(`/saleOrdersReturn/addBatch`, params)
    return code === 200 ? { code, data } : message
  }
  async updateSaleReturn(params){
    const { data: { code, message, data } } = await jxRequest.post(`/saleOrdersReturn/updateBatch`, params)
    return code === 200 ? { code, data } : message
  }
  async searchSaleReturnOrderDetails(params){
    const { data: { code, message, data } } = await jxRequest.post(`/saleOrderReturnDetail/select?currentPage=${1}&pageSize=${100}`, params)
    return code === 200 ? data.pageInfo : []
  }
  async outSaleOrderReturnAndDetail(params){
    const { data: { code, message, data } } = await jxRequest.post(`/saleOrdersReturn/outSaleOrderReturnAndDetail`, params)
    return code === 200 ? { code, data } : []
  }

  /**增加打印次数 */
  async addPrintNum(params) {
    const { data } = await jxRequest.post(`/saleOrdersReturn/increaseNumberOfPrints`, params)
    return data
  }
}

class SaleReturnSlipDetailDataSource extends PublicDataSource {
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
    let matType = {
      GOOD: "良品",
      BAD: "不良品"
    }
    if (!row[column.property] && row[column.property] !== 0) {
      return '-'
    } else if (column.property.indexOf('materialStatus') !== -1) {
      return matType[row[column.property]]
    } else if (column.property.toLowerCase().indexOf('time') !== -1) {
      return dataTool.timeStamp2Time(row[column.property], 'yyyy-MM-dd hh:mm:ss')
    }
    return row[column.property]
  }
  async updateBatch(params){
    const { data: { code, message, data } } = await jxRequest.post(`/saleOrdersReturn/updateBatch`, params)
    return code === 200 ? { code, data } : message
  }
}
export { SaleReturnSlipDataSource, loading, SaleReturnSlipDetailDataSource }