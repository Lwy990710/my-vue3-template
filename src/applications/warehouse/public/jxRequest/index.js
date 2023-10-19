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
  // baseURL: '', // http 接口
  headers: {
    "Content-Type": "application/json"
  }
})

/**
 * 创建请求拦截器
 */
jxRequest.interceptors.request.use(

  // 对请求之前需要做的操作
  config => {},

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
    return response
  },

  // 响应错误处理
  error => {
    console.log(error)
  }
)

export { jxRequest, loading, changeTime, getTime, formatExcelDate }