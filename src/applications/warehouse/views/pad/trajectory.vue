<template>
  <div v-loading="loading" class="container">
    <div class="input flex-center">
      <el-input
        v-model="phone"
        enterkeyhint="search" placeholder="输入电话号码或相关单号查询"
        clearable
        @keyup.enter="search"
      />
      <el-button
        class="ml10" type="primary"
        @click="search"
      >
        查询
      </el-button>
    </div>
    <span
      v-if="orderList.length!==0" class="inline-block mt10"
      style="color:#909399;font-size:14px;"
    >{{ route.query.type === 'user'? '历史运单号 : ' : '物流订单号 : ' }}</span>
    <el-button
      v-if="orderList.length>4"
      type="success"
      size="small"
      class="ml10"
      @click="showAll"
    >
      {{ end === orderList.length? '收起' :'展示全部' }}
    </el-button>
    <div v-if="orderList.length!==0" class="orders mt10">
      <el-check-tag
        v-for="item,idx in orderList.slice(start,end)"
        :key="item" :checked="checked === idx"
        @change="onChange(idx)"
      >
        {{ item.branchOrderCode ? item.branchOrderCode : item.logOrderId }}
      </el-check-tag>
    </div>
    <span
      v-if="orderData.length!==0&&orderData[0].saleCode"
      class="inline-block mt20"
      style="color:#909399;font-size:14px;"
    >相关销售订单号 : {{ orderData[0].saleCode }}</span>
    <div v-if="orderData.length!==0" class="time-line mt30">
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in orderData"
          :key="index"
          :icon="index===0?'':'Check'"
          type="primary"
          :color="index===0?'#2a92fe':'#0bbd87'"
          size="large"
          :timestamp="changeTime(activity.createTime)"
        >
          <lineRender :details="activity.statusDetails" />
        </el-timeline-item>
      </el-timeline>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, h } from 'vue'
import { useRoute } from 'vue-router'
import { jxRequest, changeTime, loading } from "@/applications/warehouse/public/jxRequest/index"
const orderList = reactive([])
const orderData = reactive([])
const route = useRoute()
const { proxy } = getCurrentInstance()

const branchOrderTrack = async () => {
  let searchCode = orderList[checked.value].branchOrderCode ? orderList[checked.value].branchOrderCode : orderList[checked.value].logOrderId
  let { data: { data, code, message } } = await jxRequest.post(`/branchOrderTrack/listBySaleCodeOrBranchOrderCode?code=${searchCode}`)
  return code === 200 ? { code, data } : message
}

const trackSelectProject = async () => {
  let { data: { data, code, message } } = await jxRequest.post(`/logOrderMain/trackSelect?currentPage=${1}&pageSize=${1000000000}&searchKey=${phone.value.trim()}`)
  return code === 200 ? { code, data } : message
}

const trackSelectUser = async () => {
  let { data: { data, code, message } } = await jxRequest.post(`/branchOrderMain/trackSelect?currentPage=${1}&pageSize=${1000000000}&searchKey=${phone.value.trim()}`)
  return code === 200 ? { code, data } : message
}

let phone = ref('')
let start = ref(0)
let end = ref(4)
const checked = ref(0)

const onChange = (status) => {
  checked.value = status
  if (route.query.type === 'user'){
    branchOrderTrack().then(res => {
      orderData.length = 0
      orderData.push(...res.data.branchTrack[orderList[checked.value].branchOrderCode])
      orderData.reverse()
    })
  } else {
    branchOrderTrack().then(res => {
      orderData.length = 0
      orderData.push(...res.data.logTrack[orderList[checked.value].logOrderId])
      orderData.reverse()
    })
  }
}

const search = () => {
  if (phone.value.trim().length === 0) {
    proxy.$message.error('请输入手机号')
    return
  }
  if (route.query.type === 'user'){
    trackSelectUser().then(res => {
      if (res.data.pageInfo.list.length !== 0){
        let temp = res.data.pageInfo.list.reverse()
        orderList.length = 0
        let saleOrderCodeList = []
        temp.forEach((item) => {
          if (!saleOrderCodeList.includes(item.saleCode)){
            orderList.push(item)
            saleOrderCodeList.push(item.saleCode)
          }
        })
        checked.value = 0
        branchOrderTrack().then(res => {
          orderData.length = 0
          orderData.push(...res.data.branchTrack[orderList[checked.value].branchOrderCode])
          orderData.reverse()
        })
      } else {
        proxy.$message.error('暂无订单')
      }
    })
  } else {
    trackSelectProject().then(res => {
      if (res.data.pageInfo.list.length !== 0){
        let temp = res.data.pageInfo.list.reverse()
        orderList.length = 0
        orderList.push(...temp)
        checked.value = 0
        branchOrderTrack().then(res => {
          orderData.length = 0
          orderData.push(...res.data.logTrack[orderList[checked.value].logOrderId])
          orderData.reverse()
        })
      } else {
        proxy.$message.error('暂无订单')
      }
    })
  }
}

const showAll = () => {
  end.value === orderList.length ? end.value = 4 : end.value = orderList.length
}

const selectPhoneNumber = (str) => {
  let regx = /(1[3|4|5|7|8][\d]{9}|0[\d]{2,3}-[\d]{7,8}|400[-]?[\d]{3}[-]?[\d]{4})/g
  let phoneNums = str.match(regx)
  return phoneNums ? [str, ...phoneNums] : str

  // if (phoneNums) {
  //   // for (let i = 0; i < phoneNums.length; i++) {
  //   //   let temp = phoneNums[i]
  //   //   str = str.replace(phoneNums[i], '<a href="tel:' + temp + '"  class="copy phone-num" style=" text-decoration: underline;color: #2878FF;">' + temp + '</a>')
  //   // }
  //   console.log(str.indexOf(phoneNums))
  // }
  // return str
}

const lineRender = ({ details }) => {
  let forMatValue = selectPhoneNumber(details)
  if (typeof forMatValue === 'string'){
    return [h(
      'div',
      { class: `` }, forMatValue)]
  } else {1
    return [h(
      'div',
      { class: `` },
      [h(
        'span',
        { class: `` },
        forMatValue[0].slice(0, forMatValue[0].indexOf(forMatValue[1])) + ' '
      ), h(
        'span',
        { class: `phone`, onClick: () => {makePhoneCall(forMatValue[0].slice(forMatValue[0].indexOf(forMatValue[1]), forMatValue[0].indexOf(forMatValue[1]) + forMatValue[1].length))} },
        forMatValue[0].slice(forMatValue[0].indexOf(forMatValue[1]), forMatValue[0].indexOf(forMatValue[1]) + forMatValue[1].length)
      ), h(
        'span',
        { class: `` },
        ' ' + forMatValue[0].slice(forMatValue[0].indexOf(forMatValue[1]) + forMatValue[1].length, forMatValue[0].length)
      )])]
  }

}

const makePhoneCall = (val) => {
  window.location.href = 'tel:' + val
}
</script>

<style lang="less" scoped>
.container{
  padding: 10px;
  overflow: hidden;
}
:deep(.el-timeline){
  padding-left: 10px;
}
.orders{
  display: flex;
  flex-wrap: wrap;
  overflow: hidden;
  align-items: center;
}
</style>

<style>
.phone{
  text-decoration: underline;
  color: #1296db;
}
</style>