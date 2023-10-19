import { jxRequest, loading, changeTime } from "@/applications/warehouse/public/jxRequest/index"
import { DataTool } from '@/js/tool-class/dataTool'
import PublicDataSource from "@/js/table-handle-class/publicDataSource"
class CheckAllocationDataSource extends PublicDataSource {
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
      INVENTORY_TASK_ALLOCATION_NOT_STARTED: "未盘点",
      INVENTORY_TASK_ALLOCATION_END: "盘点结束"
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
    default: {
      if (key.toLowerCase().indexOf('time') !== -1){
        return value ? new DataTool().timeStamp2Time(value, 'yyyy-MM-dd hh:mm:ss') : '-'
      } else return value ? value : '-'
    }
    }
  }
}

export { CheckAllocationDataSource, loading }