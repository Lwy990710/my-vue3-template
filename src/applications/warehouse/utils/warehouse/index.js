import { jxRequest, loading } from "@/applications/warehouse/public/jxRequest/index"
import PublicDataSource from '@/js/table-handle-class/publicDataSource'
import { DataTool } from '@/js/tool-class/dataTool'

class WareHouseDataSource extends PublicDataSource {
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
    let warehouseType = {
      MERCHANT: '商家仓',
      TRANSFER: '中转仓',
      PRE: '前置仓',
      BIG_WAREHOUSE: '大仓'
    }
    switch (key){
    case 'warehouseType': {
      return warehouseType[value]
    }
    default: {
      if (key.toLowerCase().indexOf('time') !== -1){
        return new DataTool().timeStamp2Time(value, 'yyyy-MM-dd hh:mm:ss')
      } else return value ? value : '-'
    }
    }
  }
  forMatData(row, column){
    let warehouseType = {
      MERCHANT: '商家仓',
      TRANSFER: '中转仓',
      PRE: '前置仓',
      BIG_WAREHOUSE: '大仓'
    }
    if (!row[column.property] && row[column.property] !== 0) {
      return '-'
    } if (column.property === 'warehouseType') {
      return warehouseType[row[column.property]]
    }
    return row[column.property]
  }
  async deleteWarehouse(params) {
    let res = jxRequest.post(`/warehouse/delete`, params.list)
    return res
  }

  async addOrUpdateWarehouse(params) {
    let res = jxRequest.post(`/warehouse/addOrUpdate`, params)
    return res
  }
}

class WareHousePositionDataSource extends PublicDataSource {
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

  /** 新增仓位 */
  async addPosition(params) {
    let res = jxRequest.post('/warehousePosition/add', params)
    return res
  }

  /** 编辑仓位 */
  async updatePosition(params){
    let res = jxRequest.post('/warehousePosition/update', params)
    return res
  }
}

export { WareHouseDataSource, WareHousePositionDataSource, loading }
