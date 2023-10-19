import { jxRequest, loading } from "@/applications/warehouse/public/jxRequest/index"
import PublicDataSource from '@/js/table-handle-class/publicDataSource'
import { DataTool } from '@/js/tool-class/dataTool'
class CheckDataSource extends PublicDataSource {
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
      INVENTORY_SHEET_CREATE: "制单",
      INVENTORY_SHEET_AUDIT: "审核",
      INVENTORY_SHEET_DOC: "归档"
    }
    switch (key){
    case 'processStatus': {
      return processStatus[value]
    }
    case 'inventorySheetDate': {
      return new DataTool().timeStamp2Time(value, 'yyyy-MM-dd hh:mm:ss')
    }
    case 'profitAndLossQuantitySum': {
      return value
    }
    default: {
      if (key.toLowerCase().indexOf('time') !== -1){
        return new DataTool().timeStamp2Time(value, 'yyyy-MM-dd hh:mm:ss')
      } else return value ? value : '-'
    }
    }
  }

  /**新增盘点表 */
  async addCheckForm(params) {
    let res = await jxRequest.post(`/inventorySheet/addBatch`, params)
    return res
  }

  /**盘点表明细查询 */
  async checkDetailSelect(params) {
    let res = await jxRequest.post(`/inventorySheetDetail/select?currentPage=${params.currentPage}&pageSize=${params.pageSize}`, params.inventorySheetDetail)
    return res
  }

  /**编辑盘点表 */
  async updateCheckForm(params) {
    let res = await jxRequest.post(`/inventorySheet/updateBatch`, params)
    return res
  }

  /** 删除明细 */
  async deleteCheckFormDetail(params) {
    let { data: { data, code, message } } = await jxRequest.post(`/inventorySheetDetail/delete`, params)
    return code === 200 ? code : message
  }

  /** 递交 */
  async nextStatus(params){
    let { data: { data, code, message } } = await jxRequest.post(`/inventorySheet/nextStatus`, params)
    return code === 200 ? code : message
  }

  /** 回退 */
  async backStatus(params){
    let { data: { data, code, message } } = await jxRequest.post(`/inventorySheet/previousState`, params)
    return code === 200 ? code : message
  }

  /**导出  */
  async exportCheckForm(params){
    let { data: { data, code, message } } = await jxRequest.post(`/inventorySheetDetail/exportByInventorySheetOrderCodes`, params)
    return code === 200 ? { data, code } : message
  }
}

export { CheckDataSource, loading }