import { jxRequest, loading, changeTime } from "@/applications/warehouse/public/jxRequest/index"
import { DataTool } from '@/js/tool-class/dataTool'
import PublicDataSource from '@/js/table-handle-class/publicDataSource'

class OutputScanDataSource extends PublicDataSource {
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
  search(searchData, context = this, tableRef){
    context.searchData = searchData
    if (context.searchData.scanTime){
      context.searchData.scanStartTime = Date.parse(context.searchData.scanTime[0]) / 1000
      context.searchData.scanEndTime = Date.parse(context.searchData.scanTime[1]) / 1000
      delete context.searchData.scanTime
    }
    context.currentPage = 1
    context.initData(context, tableRef)
  }
  forMatDataV2(key, value){
    let materialStatusArr = {
      GOOD: '良品',
      BAD: '不良品'
    }
    let processStatus = {
      OUT_WAREHOUSE_ORDER_CREATE: "制单",
      OUT_WAREHOUSE_ORDER_WF: "等待出库",
      OUT_WAREHOUSE_ORDER_AUDIT: "审核",
      OUT_WAREHOUSE_ORDER_OUT: "出库中",
      OUT_WAREHOUSE_ORDER_DOC: "归档"
    }
    let outputType = {
      FH: '发货单出库'
    }
    switch (key){
    case 'processStatus': {
      return processStatus[value]
    }
    case 'materialStatus': {
      return materialStatusArr[value]
    }
    case 'type': {
      return outputType[value]
    }
    case 'scanTime': {
      return value ? new DataTool().timeStamp2Time(value * 1000, 'yyyy-MM-dd hh:mm:ss') : '-'
    }
    default: {
      if (key.toLowerCase().indexOf('time') !== -1){
        return value ? new DataTool().timeStamp2Time(value, 'yyyy-MM-dd hh:mm:ss') : '-'
      } else return value ? value : '-'
    }
    }
  }
}
export { loading, OutputScanDataSource }