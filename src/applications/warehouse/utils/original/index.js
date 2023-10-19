import { jxRequest, loading } from "@/applications/warehouse/public/jxRequest/index"
import PublicDataSource from '@/js/table-handle-class/publicDataSource'

class OriginalDataSource extends PublicDataSource {
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
  myEvent(){
    // null
  }
}

export { OriginalDataSource, loading }