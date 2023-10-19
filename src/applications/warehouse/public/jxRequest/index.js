import axios from 'axios'
import { errorHandle } from './errorHandle'
import qs from 'qs'
import router from '../../router/index'
import { ElMessageBox, ElMessage } from 'element-plus'
import { ref } from 'vue'

// axios.defaults.headers["Content-Type"] = "application/json"

/**
 * 加载动画
 */
let loading = ref(false)

/** 时间戳转换 */
const changeTime = (time) => {
  let date = new Date(time)
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
  return y + '-' + MM + '-' + d + ' ' + h + ':' + m + ':' + s

  // return y + '-' + MM + '-' + d;
}

/**
 * 获取当前时间
 */
const getTime = () => {
  let date = new Date()
  let year = date.getFullYear()
  let month = date.getMonth() + 1
  let day = date.getDate()
  let hour = date.getHours()
  let minute = date.getMinutes()
  let second = date.getSeconds()
  return year + '/' + month + '/' + day + ' ' + hour + ':' + minute + ':' + second.toString().padStart(2, '0')
}

/** excel日期转换 */
const formatExcelDate = (num, format = '-') => {
  if (!/^\d+$/.test(num)) return
  num = parseInt(num)
  let millisecond = 0 // 转化后的毫秒数
  if (num > 60) { // 对大于60的日期进行减1处理
    millisecond = (num - 25568 - 1) * 3600 * 24 * 1000
  } else {
    millisecond = (num - 25568) * 3600 * 24 * 1000
  }
  const date = new Date(millisecond) // 根据转化后的毫秒数获取对应的时间
  const yy = date.getFullYear()
  const m = date.getMonth() + 1
  const mm = m >= 10 ? m : '0' + m
  const d = date.getDate()
  const dd = d >= 10 ? d : '0' + d
  return yy + format + mm + format + dd // 返回格式化后的日期
}

/**
 * 创建请求实例
 */
const jxRequest = axios.create({
  // baseURL: 'http://8.134.93.171:9090/wms', // http 接口

  // baseURL: 'http://192.168.28.121:6061/wms', // 文浩本地

  //baseURL: 'http://192.168.28.125:6061/wms', // 楷星本地

  baseURL: 'http://192.168.28.108:6061/wms', // 进华本地

  // baseURL: 'https://platform.jiaxianwuliu.com:9900/wms', // https 接口

  //baseURL: 'https://logistics.jiaxianwuliu.com:7700/wms', // https 接口

  //baseURL: process.env.VUE_APP_TITLE !== 'pro' ? 'http://8.134.136.196:6061/wms' : 'https://logistics.jiaxianwuliu.com:7700/wms',
  headers: {
    "Content-Type": "application/json"
  }
})

/**
 * 创建请求拦截器
 */
jxRequest.interceptors.request.use(

  // 对请求之前需要做的操作
  config => {

    if (config.url.indexOf('imMessage') === -1) loading.value = true

    console.log('---------请求拦截---------' + config.url + `  请求开始时间：${ getTime() }`)
    config.requestStartTime = Date.parse(new Date())
    if (config.url.split('?')[0] === '/permission/login'){
      return config
    }
    else {
      // 添加请求token
      const userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
      if (userInfo && userInfo.token) {
        config.headers['token'] = userInfo.token
      } else {
        router.push('/login')
      }
      return config
    }
  },

  // 请求错误时需要做的操作
  error => {
    conosle.log(error)
  }
)

/**
 * 创建响应拦截器
 */
jxRequest.interceptors.response.use(

  // 对响应数据需要做的操作
  response => {
    loading.value = false
    if (response.data.code !== 200){
      if (!errorHandle(response.data.code, response.data.message, router)) return
    }
    console.log('---------响应拦截---------' + response.config.url + `  请求响应时间：${ getTime() }`)
    response.responseTime = Date.parse(new Date())

    // 接口响应超过10秒钟
    if (response.responseTime - response.config.requestStartTime >= 20000) {
      // ElMessage.warning('网络不太好，请稍等噢')
      console.warn(response.config.url + '该接口响应时间过长')
    }
    return response
  },

  // 响应错误处理
  error => {
    loading.value = false
    let alertText = '出现了预期之外的错误'
    if (error.code === 'ERR_NETWORK'){
      alertText = `系统正在更新，请稍后再试！`
    }
    else if (error.code === 'ERR_BAD_REQUEST'){
      alertText = `出现了预期之外的错误，请检查excel数据有无如下错误!<br/><br/>
      1、体积、数量的字段格式要为数字<br/>
      2、日期要为文本格式，否则可能会出现日期错乱<br/>
      3、确保是以下的业务类型之一（前置仓调拨、商家工程、前置仓销售、商家入仓）`
    }
    ElMessageBox.alert(alertText, '警告', {
      type: 'error',
      confirmButtonText: '确定',
      dangerouslyUseHTMLString: true
    })
    console.log(error)
  }
)

export { jxRequest, loading, changeTime, getTime, formatExcelDate }