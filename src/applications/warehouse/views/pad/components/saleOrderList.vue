<template>
  <div class="mt10 content">
    <el-card
      v-for="item in data.tableData" :key="item.id"
      class="box-card mt10"
      @click="handleClick(item)"
    >
      <template #header>
        <div class="card-header">
          <div class="card-header-left">
            <span> 流程状态 ：{{ proType[item.processStatus] }} </span>
            <span class="mt10"> 创建时间 ：{{ changeTime(item.createTime) }} |  更新时间 ：{{ changeTime(item.updateTime) }}</span>
            <span class="mt10"> 下单商家： {{ item.merchantName }}  要求配送时间： {{ changeTime(item.requireDeliveryDate) }}</span>
          </div>
          <span>
            总数：{{ item.sumNumber }}件 |
            {{ item.saleOrderCode }}
          </span>
        </div>
      </template>
      <div>
        <div class="card-content">
          <span>客户姓名：{{ item.customerName }}</span>
          <span>客户电话：{{ item.customerPhone }}</span>
          <span>送货地址：{{ item.receiptAddress }}</span>
        </div>
      </div>
    </el-card>
    <el-drawer
      v-if="drawer"
      v-model="drawer"
      :with-header="false"
      size="90%"
      lock-scroll
    >
      <saleDetails
        :data="selectOneData" @refresh="handleClick"
        @close="close"
        @deleteSaleOrder="deleteSaleOrder"
      />
    </el-drawer>
  </div>
</template>

<script setup>
import saleDetails from './saleDetails.vue'
import { changeTime } from '@/applications/warehouse/public/jxRequest'
import { ref } from "vue"

const _emits = defineEmits(['deleteSaleOrder'])

const _props = defineProps({
  data: {
    data: Array,
    default: () => {
      return []
    }
  }
})

const drawer = ref(false)

const selectOneData = ref({})

const handleClick = (item) => {
  _props.data.selectOne(item.id).then(res => {
    selectOneData.value = res
    selectOneData.value.requireDeliveryDate = changeTime(selectOneData.value.requireDeliveryDate)
    _props.data.searchSaleOrderDetails({ saleOrderCode: item.saleOrderCode }).then(res => {
      selectOneData.value.list = res.list
      drawer.value = true
    })
  })
}

const close = (item) => {
  drawer.value = false
  _props.data.initData()
  handleClick(item)
}

const addSaleOrder = () => {
  selectOneData.value = {}
  drawer.value = true
}

const deleteSaleOrder = (item) => {
  drawer.value = false
  _emits('deleteSaleOrder')
}

defineExpose({
  addSaleOrder
})

let proType = {
  SALE_ORDER_CREATE: '制单',
  SALE_ORDER_MAT: '留料',
  SALE_ORDER_OUT: '出库中',
  SALE_ORDER_DOC: '归档',
  SALE_ORDER_RETURN: '销售退货'
}
</script>

<style lang="less" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}
.card-header-left{
    display: flex;
    flex-direction: column;
}
.card-content{
    display: flex;
    justify-content: space-between;
    font-size: 13px;
}
</style>