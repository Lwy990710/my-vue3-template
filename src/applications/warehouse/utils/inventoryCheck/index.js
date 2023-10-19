import { jxRequest, loading } from "@/applications/warehouse/public/jxRequest/index"
import PublicDataSource from '@/js/table-handle-class/publicDataSource'
import { DataTool } from '@/js/tool-class/dataTool'
class InventoryCheckDataSource extends PublicDataSource {
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
  async setNum(params){
    let { data: { data, code, message } } = await jxRequest.post(`stockMain/setSafeStock`, params)
    return code === 200 ? code : message
  }

  async checkFlow(params){
    let { data: { code, data, message } } = await jxRequest.post(`/stockRecord/getStockMerchantRecord`, params)
    return code === 200 ? { data, code } : message
  }
  async getPositionRecord(params){
    let { data: { data, code, message } } = await jxRequest.post(`/stockRecord/getPositionRecord`, params)
    return code === 200 ? { data, code } : message
  }
  async getStockMainRecord(params){
    let { data: { data, code, message } } = await jxRequest.post(`/stockRecord/getStockMainRecord`, params)
    return code === 200 ? { data, code } : message
  }

  /**批量库位调整 */
  async adjustBatch(params) {
    let { data } = await jxRequest.post(`/stockPositionReset/batchReset`, params)
    return data
  }

  /**导出截止月份商品结余 */
  async exportMaterialMonthExcel(params) {
    let { data: { code, data, message } } = await jxRequest.post(`/stockRecord/getStockMerchantRecordToDate`, params)
    return code === 200 ? { data, code } : message
  }

}

class InventoryCheckDataSourceShops extends PublicDataSource {
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

export { InventoryCheckDataSource, InventoryCheckDataSourceShops, loading }