import { jxRequest, loading } from "@/applications/warehouse/public/jxRequest/index"
import PublicDataSource from '@/js/table-handle-class/publicDataSource'

class AllotPlanDataSource extends PublicDataSource {
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
  rowClass({ rowData: { isUrgent, checked } }){
    const settings = JSON.parse(localStorage.getItem('userSettings'))
    if (isUrgent === '是') return 'high-light-row'
    if (checked) return 'checked-light-row'
    else return ''
  }
}

export { AllotPlanDataSource, loading }