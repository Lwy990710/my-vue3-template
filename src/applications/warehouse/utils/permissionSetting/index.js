import { jxRequest, loading, changeTime } from "@/applications/warehouse/public/jxRequest/index"
import PublicDataSource from '@/js/table-handle-class/publicDataSource'
import { DataTool } from '@/js/tool-class/dataTool'

class utilsPer extends PublicDataSource{
  constructor({
    modules = '',
    selectUri = '/',
    deleteUri = '/',
    selectOneUri = '/',
    pageSize = 100000,
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
  async initData(context = this, tableRef){
    let { data: { data, code, message } } = await jxRequest.post(`${context.selectUri}?currentPage=${context.currentPage}&pageSize=${context.pageSize}`, context.searchData)
    context.tableData.length = 0
    context.total = data.length
    context.tableData.push(...code === 200 ? data : [])
    tableRef?.clearSelection()
  }
  async delete(params, tableRef, context = this){
    let { data: { data, code, message } } = await jxRequest.post(`${context.deleteUri}`, params.user)
    if (code === 200){
      context.initData(context, tableRef)
      return code
    } else return message
  }
  async add(params){
    let { data: { code, data, message } } = await jxRequest.post(`/user/add`, params)
    return code === 200 ? code : message
  }
  async update(params){
    let { data: { code, data, message } } = await jxRequest.post(`/user/update`, params)
    return code === 200 ? code : message
  }
  async getJob(){
    let { data: { code, data, message } } = await jxRequest.post(`/permission/getAllJob`)
    return code === 200 ? data : []
  }
  async getPer(jobId){
    let { data: { code, data, message } } = await jxRequest.post(`/permission/getResource?jobId=${jobId}`)
    return code === 200 ? data : []
  }
  async setPer(jobId, resourceList){
    let { data: { code, data, message } } = await jxRequest.post(`/permission/setResource?jobId=${jobId}`, resourceList)
    return code === 200 ? { code, data } : message
  }
  async getAllPer(jobId, resourceList){
    let { data: { code, data, message } } = await jxRequest.post(`/permission/getAllResource`)
    return code === 200 ? data : []
  }
  async copyResource(fromJobId, toJobId){
    let { data: { code, data, message } } = await jxRequest.post(`/permission/copyResource?fromJobId=${fromJobId}&toJobId=${toJobId}`)
    return code === 200 ? { code, data } : message
  }
  async copyDataRule(fromJobId, toJobId){
    let { data: { code, data, message } } = await jxRequest.post(`/permission/copyDataRule?fromJobId=${fromJobId}&toJobId=${toJobId}`)
    return code === 200 ? { code, data } : message
  }
  async getDataRule(jobId){
    let { data: { code, data, message } } = await jxRequest.post(`/permission/getDataRule?jobId=${jobId}`)
    return code === 200 ? data : []
  }
  async setDataRule(jobId, params){
    let { data: { code, data, message } } = await jxRequest.post(`/permission/setDataRule?jobId=${jobId}`, params)
    return code === 200 ? { code, data } : message
  }

}

export { utilsPer, loading }