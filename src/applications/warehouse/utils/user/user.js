import { jxRequest, loading, changeTime } from "@/applications/warehouse/public/jxRequest/index"
import { DataTool } from '@/js/tool-class/dataTool'
import PublicDataSource from "@/js/table-handle-class/publicDataSource"

class UserDataSource extends PublicDataSource {
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

  /** 新增用户 */
  async addUser(params) {
    let { data: { data, code, message } } = await jxRequest.post('/user/add', params)
    return code === 200 ? { data, code } : message
  }

  /**查询用户 */
  async initData(context = this, tableRef){
    let { data: { data, code, message } } = await jxRequest.post(`${context.selectUri}?currentPage=${context.currentPage}&pageSize=${context.pageSize}`, context.searchData)
    context.tableData.length = 0
    context.total = data.length
    context.tableData.push(...code === 200 ? data : [])
    tableRef?.clearSelection()
  }
}

export { UserDataSource, loading }