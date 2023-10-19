import { jxRequest, loading, changeTime } from "@/applications/warehouse/public/jxRequest/index"
import { DataTool } from '@/js/tool-class/dataTool'
import PublicDataSource from "@/js/table-handle-class/publicDataSource"
class CheckMissionDataSource extends PublicDataSource {
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
      INVENTORY_TASK_CREATE: "制单",
      INVENTORY_TASK_START: "盘点中",
      INVENTORY_TASK_AUDIT: "审核",
      INVENTORY_TASK_DOC: "归档"
    }
    switch (key){
    case 'processStatus': {
      return processStatus[value]
    }

    case 'inventoryType': {
      return value === 'CW' ? '按仓位盘点' : '按物料盘点'
    }

    case 'isOpenCheck': {
      return value === 1 ? '明盘' : '暗盘'
    }

    case 'inventoryTaskDate': {
      return value ? new DataTool().timeStamp2Time(value, 'yyyy-MM-dd') : '-'
    }
    default: {
      if (key.toLowerCase().indexOf('time') !== -1){
        return value ? new DataTool().timeStamp2Time(value, 'yyyy-MM-dd hh:mm:ss') : '-'
      } else return value ? value : '-'
    }
    }
  }

  /**获取盘点明细 */
  async inventoryTaskDetailList(params){
    let { data: { data, code, message } } = await jxRequest.post(`/inventoryTaskDetail/obtainInventoryTaskDetailList?inventoryType=${params.inventoryType}`, params.tempList)
    return code === 200 ? { data, code } : message
  }

  /**制作盘点任务 */
  async saveInventoryTaskMain(params){
    let { data: { data, code, message } } = await jxRequest.post(`/inventoryTaskMain/saveInventoryTaskMain`, params)
    return code === 200 ? { data, code } : message
  }

  /**修改盘点任务 */
  async updateInventoryTaskMain(params){
    let { data: { data, code, message } } = await jxRequest.post(`/inventoryTaskMain/updateInventoryTask`, params)
    return code === 200 ? { data, code } : message
  }

  /**递交状态 */
  async nextStatus(params){
    let { data: { data, code, message } } = await jxRequest.post(`/inventoryTaskMain/nextStatus?inventoryTaskOrderCode=${params}`)
    return code === 200 ? { data, code } : message
  }

  /**盘点汇总 */
  async oneClickSummary(params){
    let { data: { data, code, message } } = await jxRequest.post(`/inventoryTaskMain/oneClickSummary?inventoryTaskOrderCode=${params}`)
    return { data, code, message }
  }

  /** 盘点*/
  async allocationUpdateBatch(params){
    let { data: { data, code, message } } = await jxRequest.post(`/inventoryTaskDetailAllocation/updateBatch`, params)
    return code === 200 ? { data, code } : message
  }

  /** 盘点完成 */
  async finishCheck(params){
    let { data: { data, code, message } } = await jxRequest.post(`/InventoryTaskMainAllocation/updateBatch`, params)
    return code === 200 ? { data, code } : message
  }

  /**回退状态 */
  async previousState(params){
    let { data: { data, code, message } } = await jxRequest.post(`/inventoryTaskMain/previousState?inventoryTaskOrderCode=${params}`)
    return { data, code }
  }

  /**修改盘点方式 */
  async setIsOpenCheck(params){
    let { data: { data, code, message } } = await jxRequest.post(`/inventoryTaskMain/setIsOpenCheck`, params)
    return code === 200 ? { data, code } : message
  }

  /** 根据条码查询物料代码 */
  async getMatertalCodeByBarCode(params) {
    let { data: { data, code, message } } = await jxRequest.post(`/materialBarCodeHeads/getMaterialBarCode?barCodeHead=${params}`)
    return code === 200 ? { data, code } : message
  }

  /**新增盘点记录 */
  async addCheckRecord(params) {
    let { data: { data, code, message } } = await jxRequest.post(`/inventoryTaskDetailAllocation/addInventoryTaskDetail`, params)
    return code === 200 ? { data, code } : message
  }

  /**获取盘点人员 */
  async getUserObject(params){
    let { data: { data, code, message } } = await jxRequest.post(`/inventoryTaskMain/getUserObject?inventoryTaskOrderCode=${params}`)
    return { data, code }
  }

  /** 盘点任务明细修改备注 */
  async updateComment(params){
    let { data: { data, code, message } } = await jxRequest.post(`/inventoryTaskDetail/updateComment`, params)
    return code === 200 ? { data, code } : message
  }

  /** 盘点结果明细修改备注 */
  async updateCommentP(params){
    let { data: { data, code, message } } = await jxRequest.post(`/inventoryTaskDetailAllocation/updateComment`, params)
    return code === 200 ? { data, code } : message
  }

  /**批量导出盘点汇总 */
  async exportAllData(params){
    let { data: { data, code, message } } = await jxRequest.post(`/inventoryTaskDetail/exportAllData`, params)
    return code === 200 ? { data, code } : message
  }
}

export { CheckMissionDataSource, loading }