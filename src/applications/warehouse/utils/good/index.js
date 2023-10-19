import { jxRequest, loading } from "@/applications/warehouse/public/jxRequest/index"
import PublicDataSource from '@/js/table-handle-class/publicDataSource'
import { ref } from 'vue'

class GoodDataSource extends PublicDataSource {
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
}

/** 查询商品信息 */
const getMaterial = async function(params) {
  let res = await jxRequest.post(`/material/select?currentPage=${params.currentPage}&pageSize=${params.pageSize}`, params.material)
  if (res.data.code === 200) {
    return res.data.data
  }
  return 0
}

/** 查询条码头 */
const materialBarCodeHeads = async function(materialCode) {
  let res = await jxRequest.post(`/materialBarCodeHeads/select?currentPage=1&pageSize=1000000`, { materialCode })
  return res.data.code === 200 ? res.data.data : []
}

/** 删除条码头 */
const deleteCodeHeads = async function(id) {
  let res = await jxRequest.post(`/materialBarCodeHeads/delete`, [id])
  return res.data.code === 200 ? res.data.code : res.data.message
}

/** 更新条码头 */
const updateBarCode = async function(params) {
  let res = await jxRequest.post(`/materialBarCodeHeads/addOrUpdate`, params)
  return res.data.code === 200 ? res.data.code : res.data.message
}

/** 新增/编辑商品 */
const addMaterial = async function(params) {
  let res = await jxRequest.post(`/material/addOrUpdate`, params)
  if (res.data.code === 200) {
    return res.data.data ? res.data.data : res.data.code
  }
  return 0
}

/** 查询套机物料 */
const getNestingMaterial = async function(id) {
  let res = await jxRequest.get(`/material/oneLevel?materialId=${id}`)
  if (res.data.code === 200) {
    return res.data.data ? res.data.data : res.data.code
  }
  return 0
}

/** 导入商品 */
const addMaterExcel = async function(params) {
  let { data: { data, code, message } } = await jxRequest.post(`/material/addOrUpdateBranch`, params)
  return code === 200 ? code : message
}

/** 商品详情 */
const getMaterialById = async function(id){
  let res = await jxRequest.post(`/material/selectOne?id=${id}`)
  if (res.data.code === 200) {
    return res.data.data ? res.data.data : res.data.code
  }
  return 0
}

/** 删除商品 */
const removeGoods = async function(params) {
  let res = await jxRequest.post(`/material/delete`, params)
  if (res.data.code === 200) {
    return res.data.data ? res.data.data : res.data.code
  }
  return 0
}

/** 删除套机物料 */
const removeFittings = async function(params) {
  let res = await jxRequest.post(`/material/deleteStruct`, params)
  if (res.data.code === 200) {
    return res.data.data ? res.data.data : res.data.code
  }
  return 0
}

/** 修改条码头 */
const updateBarcodeHeader = async function(params) {
  let res = await jxRequest.post(`/material/setBarCodeHead`, params)
  return res.data.code === 200 ? res.data.code : res.data.message
}

export { loading, deleteCodeHeads, updateBarCode, getMaterial, addMaterial, removeGoods, getMaterialById, addMaterExcel, getNestingMaterial, removeFittings, updateBarcodeHeader, materialBarCodeHeads, GoodDataSource }