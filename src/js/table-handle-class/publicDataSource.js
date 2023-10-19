import { jxRequest, loading, changeTime } from "@/applications/warehouse/public/jxRequest/index"
import store from '../../applications/warehouse/store'
import { DataTool } from '@/js/tool-class/dataTool'
const { _state } = store

/**
 * @name class:PublicDataSource
 * @param { Object } apiObject  接口和数据基本配置
 * @return { PublicDataSource } PublicDataSource 实例化对象
 * @author { 啊泽 2023-2-10 }
 * @example
 * 例:
 * new PublicDataSource({
 *    modules:'exampleModules',
 *    selectUri: '/',
 *    deleteUri: '/',
 *    selectOneUri: '/'
 *  })
 * @initData  funtion => 初始化数据
 * @currentPageChange funtion => 当前页变化
 * @pageSizeChange =>  页尺寸变化
 * @search funtion => 筛选数据
 * @delete funtion => 删除数据
 * @selectionChange funtion => 选中项改变
 * @forMatData funtion => 格式化数据
 * @initTableHeader funtion => 获取store表头
 */

class PublicDataSource {
  // selectUri默认为select接口的地址,大表格使用的是store里面的tableHeader所以无需传tableHeader值,小表或者不使用store里面的,可传入tableHeader,也可以在具体页面自己定义
  constructor({
    modules = '', // 模块名字 用于获取store
    selectUri = '/', // select接口地址
    deleteUri = '/', // 删除接口地址
    selectOneUri = '/', // 获取单个数据地址
    pageSize = 20, // 页大小
    useDefaultTimeRangeFilter = false, // 是否按默认天数过滤数据
    defaultTimeRangeDay = 7, // 默认天数
    tableHeader = []// 不读取store时的表头
  } = {}){
    this.modules = modules
    this.selectUri = selectUri
    this.selectOneUri = selectOneUri
    this.deleteUri = deleteUri
    this.searchData = {}
    this.currentPage = 1
    this.pageSize = pageSize
    this.total = 0
    this.tableData = []
    this.tableHeader = tableHeader
    this.useDefaultTimeRangeFilter = useDefaultTimeRangeFilter
    this.defaultTimeRangeDay = defaultTimeRangeDay
    this.selections = []
  }
  async initData(context = this, tableRef, isDoSearch = false){
    if (context.useDefaultTimeRangeFilter && !isDoSearch){
      let dataTool = new DataTool()
      let time = dataTool.timeStamp2Time(Date.now())
      let createEndTime = Date.parse(time.replace(new RegExp('-', "g"), '/'))
      let createStartTime = createEndTime - 86400000 * context.defaultTimeRangeDay
      context.searchData.createStartTime = createStartTime
      context.searchData.createEndTime = createEndTime
    }
    let { data: { data, code, message } } = await jxRequest.post(`${context.selectUri}?currentPage=${context.currentPage}&pageSize=${context.pageSize}`, context.searchData)
    context.tableData.length = 0
    context.total = data.pageInfo.total ? data.pageInfo.total : 0

    // let selections = new DataTool().objectListGetValueByKey(context.selections, 'id', 'list')
    // let list = data.pageInfo.list.map(item => {
    //   if (selections.includes(item.id)) item.checked = true
    //   return item
    // })
    context.tableData.push(...code === 200 ? data.pageInfo.list : [])
    tableRef?.clearSelection()
  }
  currentPageChange(page, context = this, tableRef){
    context.currentPage = page
    context.initData(context, tableRef)
  }
  pageSizeChange(pageSize, context = this, tableRef){
    context.currentPage = 1
    context.pageSize = pageSize
    context.initData(context, tableRef)
  }
  search(searchData, context = this, tableRef){
    context.searchData = searchData
    context.currentPage = 1
    context.initData(context, tableRef, true)
  }
  async delete(idList, tableRef, context = this){
    let { data: { data, code, message } } = await jxRequest.post(`${context.deleteUri}`, idList)
    if (code === 200){
      context.initData(context, tableRef)
      return code
    } else return message
  }
  selectionChange(selections, context = this){
    context.selections.length = 0
    context.selections.push(...selections)
  }
  forMatData(row, column){
    if (!row[column.property] && row[column.property] !== 0) {
      return '-'
    } if (column.property.toLowerCase().indexOf('time') !== -1) {
      return new DataTool().timeStamp2Time(row[column.property], 'yyyy-MM-dd hh:mm:ss')
    }
    return row[column.property]
  }
  initTableHeader(context = this){
    if (context.modules.length !== 0 && _state.data[context.modules]){
      context.tableHeader.length = 0
      context.tableHeader.push(..._state.data[context.modules].tableHeader.filter((item) => item.isShow))
    } else throw new Error('获取store中的表头, 请提供modules名')
  }
  async selectOne(id, context = this){
    let { data: { data, code, message } } = await jxRequest.post(`${context.selectOneUri}?id=${id}`)
    return data
  }

  currentDayChange(val, context = this){
    context.useDefaultTimeRangeFilter = val
  }
}

export default PublicDataSource