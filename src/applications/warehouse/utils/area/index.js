import { jxRequest, loading } from "@/applications/warehouse/public/jxRequest/index"
import PublicDataSource from "@/js/table-handle-class/publicDataSource"

class AreaDataSource extends PublicDataSource {
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
  async deleteArea(params) {
    let { data: { code, message } } = await jxRequest.post(`/region/delete`, params.list)
    return code === 200 ? code : message
  }

  async addOrUpdateArea(params) {
    let { data: { code, message } } = await jxRequest.post(`/region/addOrUpdate`, params)
    return code === 200 ? code : message
  }
}
export { loading, AreaDataSource }