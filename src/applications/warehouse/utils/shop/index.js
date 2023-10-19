import { jxRequest, loading } from "@/applications/warehouse/public/jxRequest/index"
import PublicDataSource from '@/js/table-handle-class/publicDataSource'
import { DataTool } from '@/js/tool-class/dataTool'
import { ref } from 'vue'

class ShopDataSource extends PublicDataSource {
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
    let belongCompanyType = {
      GE_JIANG: "格匠",
      GUANG_ZHOU: "广州销售公司",
      FO_SHAN: "佛山销售公司",
      OTHER: "其他销售公司"
    }
    let merchantType = {
      PRE: '前置仓商家',
      BIG: '大仓商家',
      SALES: '销售公司',
      OTHER: '其他商家'
    }
    switch (key){
    case 'belongCompanyType': {
      return belongCompanyType[value] ? belongCompanyType[value] : '-'
    }
    case 'belongCompanyCostRule': {
      return belongCompanyType[value] ? belongCompanyType[value] : '-'
    }
    case 'merchantType': {
      return merchantType[value] ? merchantType[value] : '-'
    }
    case 'isSendToBSms': {
      return value ? '是' : '否'
    }
    case 'isSendToCSms': {
      return value ? '是' : '否'
    }
    default: {
      if (key.indexOf('Time') !== -1 || key.indexOf('Date') !== -1){
        return new DataTool().timeStamp2Time(value, 'yyyy-MM-dd hh:mm:ss')
      } else return value ? value : '-'
    }
    }
  }
}

/** 查询商家信息 */
const getMerchant = async function(params) {
  let res = await jxRequest.post(`/merchant/select?currentPage=${params.currentPage}&pageSize=${params.pageSize}`, params.merchant)
  return res
}

/** 查询商家详情 */
const getMerchantDetail = async function(id) {
  let res = await jxRequest.post(`/merchant/selectOne?id=${id}`)
  return res
}

/** 新增、编辑商家 */
const updateMerchant = async function(params) {
  let res = await jxRequest.post('/merchant/addOrUpdate', params)
  return res
}

export { loading, getMerchant, updateMerchant, getMerchantDetail, ShopDataSource }