import * as XLSX from "xlsx"
import AddressParse from 'address-parse'
import { jxRequest as warehouseRequest } from "@/applications/warehouse/public/jxRequest/index"
import { ElMessageBox } from 'element-plus'

/**
 * @name class:DataTool
 * @param { 无 }
 * @return { processLimitation } processLimitation 实例化对象
 * @author { 啊泽 2023-2-21 }
 * @example
 *
 * 例:
 * new processLimitation()
 *
 * @objectListGetValueByKey  funtion => @param { list:Object[], keyName:String } @return { Array} 返回对象数组对应键名的数组
 * @processLimitation funtion =>  @param { list:Object[], permissibleProcess:String[] } @return { Boolean } 流程状态限制
 * @readFile async function => @param { file:File } @return { string | ArrayBuffer } 读取文件流
 * @xlsx2DataObject async function @param { file:File } @return { Object } 文件流转化为对象
 * @addressParse function => @param { address:String } @return { Object } 地址解析
 * @timeStamp2Time function => @param { timeStamp:Number } @return { String } 时间戳转时间
 */

class DataTool {
  constructor(){
    // null
  }
  objectListGetValueByKey(list, keyName, returnType = 'listObj'){
    if (returnType === 'listObj'){
      if (typeof keyName === 'string') return list.map((item, index) => item[keyName])
      else {
        let res = []
        for (let i = 0;i < list.length;i++){
          let temp = {}
          for (let j = 0;j < keyName.length;j++){
            temp[keyName[j]] = list[i][keyName[j]]
          }
          res.push(temp)
        }
        return res
      }
    } else {
      let res = []
      if (typeof keyName === 'string') {
        list.forEach(item => {
          res.push(item[keyName])
        })
        return res
      } else return ['请保证keyName唯一']
    }

  }

  processLimitation(list, permissibleProcess = [], key = 'processStatus'){
    if (!permissibleProcess || permissibleProcess.length === 0) return true
    return list.filter((item, idx) => permissibleProcess.includes(item[key])).length === list.length
  }

  readFile(file){
    return new Promise(resolve => {
      let reader = new FileReader()
      reader.readAsBinaryString(file)
      reader.onload = ev => {
        resolve(ev.target.result)
      }
    })
  }

  timeStamp2Time(val, format = 'yyyy-MM-dd'){
    //null
    let date = new Date(val)
    let y = date.getFullYear()
    let MM = date.getMonth() + 1
    MM = MM < 10 ? '0' + MM : MM
    let d = date.getDate()
    d = d < 10 ? '0' + d : d
    let h = date.getHours()
    h = h < 10 ? '0' + h : h
    let m = date.getMinutes()
    m = m < 10 ? '0' + m : m
    let s = date.getSeconds()
    s = s < 10 ? '0' + s : s
    if (format === 'yyyy-MM-dd') return y + '-' + MM + '-' + d
    else return y + '-' + MM + '-' + d + ' ' + h + ':' + m + ':' + s
  }

  async xlsx2DataObject(file) {
    let data = await this.readFile(file)
    let workbook = XLSX.read(data, { type: "binary" }),
      worksheet = workbook.Sheets[workbook.SheetNames[0]]
    return XLSX.utils.sheet_to_json(worksheet)
  }

  addressParse(address){
    const [result] = AddressParse.parse(address)
    return result
  }

  exportExcel(zhHeader, enHeader, data, name){
    const exportData = [zhHeader, ...data]
    let sheet = XLSX.utils.json_to_sheet(exportData, { enHeader, skipHeader: true }),
      book = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(book, sheet, "sheet1")
    let now = this.timeStamp2Time(Date.now())
    XLSX.writeFile(book, `${name}_${now}.xls`)
  }

  // sheetList : {zhHeader, enHeader, data, name}
  complexExcel(sheetList, title){
    const book = XLSX.utils.book_new()
    sheetList.forEach(item => {
      const exportData = [item.zhHeader, ...item.data]
      const enHeader = item.enHeader
      let sheet = XLSX.utils.json_to_sheet(exportData, { enHeader, skipHeader: true })
      XLSX.utils.book_append_sheet(book, sheet, item.name)
    })
    let now = this.timeStamp2Time(Date.now())
    XLSX.writeFile(book, `${title}_${now}.xls`)
  }

  async getBaseClassByOrderCode(params) {
    let { data: { data, code, message } } = await warehouseRequest.post(`stockRecord/getBaseClassByOrderCode`, params)
    return code === 200 ? { data, code } : message
  }

  // 删除对象中的某些属性
  deleteObjectKeys(source, keysList){
    let map = new Map(Object.entries(source))
    if (typeof keysList === 'string') {
      map.delete(keysList)
    }
    else {
      keysList.forEach(key => {
        map.delete(key)
      })
    }
    return Object.fromEntries(map.entries())
  }

  // 比较两个对象，返回target对象对于source对象的key的补集
  keyComplementarySet(source, target){
    let sourceKey = Object.keys(source)
    let targetKey = Object.keys(target)
    return sourceKey.filter(item => !targetKey.includes(item))
  }

  // 防抖
  debounce(cb, delay, ...args){
    let timeout
    return function(){
      let context = this
      if (timeout) {
        clearTimeout(timeout)
      }
      timeout = setTimeout(() => {
        cb.call(context, ...args)
        timeout = null
      }, delay)
    }
  }

  // 节流
  throttle(cb, delay, ...args){
    let lastTime = 0
    return function(){
      let context = this
      let now = Date.now()
      if (now - lastTime > 1000){
        cb.call(context, ...args)
        lastTime = now
      } else {
        ElMessageBox.alert('点太快了，系统正在运转，休息一下吧。', '提示', {
          confirmButtonText: '好的'
        })
      }
    }
  }
}

export { DataTool }