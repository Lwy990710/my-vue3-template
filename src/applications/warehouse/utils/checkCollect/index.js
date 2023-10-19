import { jxRequest, loading } from "@/applications/warehouse/public/jxRequest/index"
import { DataTool } from '@/js/tool-class/dataTool'
import PublicDataSource from '@/js/table-handle-class/publicDataSource'

class CheckCollectDataSource extends PublicDataSource {
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
    let status = {
      TAKE_STOCK_NO_START: '未开始',
      TAKE_STOCK_ING: '盘点中',
      TAKE_STOCK_END: '盘点结束'
    }
    if (key === 'processStatus') {
      return status[value]
    } else if (key && (key.indexOf('Time') !== -1 || key.indexOf('Date') !== -1)){
      return new DataTool().timeStamp2Time(value, 'yyyy-MM-dd hh:mm:ss')
    } else {
      return value
    }
  }

  /** 新建盘点汇总表 */
  async createCollectSlip(params){
    let { data: { code, message } } = await jxRequest.post(`/takeStock/createMain`, params)
    return code === 200 ? code : message
  }

  /**开始/结束盘点 */
  async changeCollectStatus(params){
    let { data: { code, message } } = await jxRequest.post(`/takeStock/setProcessStatus`, params)
    return code === 200 ? code : message
  }
}

class CheckCollectDetailsDataSource extends PublicDataSource {
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

  /*   forMatDataV2(key, value){
    let status = {
      TAKE_STOCK_NO_START: '未开始',
      TAKE_STOCK_ING: '盘点中',
      TAKE_STOCK_END: '盘点结束'
    }
    if (key === 'processStatus') {
      return status[value]
    } else if (key && (key.indexOf('Time') !== -1 || key.indexOf('Date') !== -1)){
      return new DataTool().timeStamp2Time(value, 'yyyy-MM-dd hh:mm:ss')
    } else {
      return value
    }
  } */

  /** 查看物料盘点详情 */
  async collectMaterialDetail(params){
    let { data } = await jxRequest.post(`/takeStock/selectMoreDetail`, params)
    return data
  }

  /** 获取物料类型 */
  async getMaterialType() {
    let { data } = await jxRequest.post(`/takeStock/materialType`)
    return data
  }
}

export { loading, CheckCollectDataSource, CheckCollectDetailsDataSource }