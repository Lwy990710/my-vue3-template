<template>
  <routerNav />
  <div class="table">
    <div v-loading="loading" class="table-content">
      <saleOrderList
        ref="orderList" :data="saleSlipDataSource"
        @deleteSaleOrder="saleSlipDataSource.initData(saleSlipDataSource)"
      />
      <el-pagination
        v-model:current-page="saleSlipDataSource.currentPage"
        v-model:page-size="saleSlipDataSource.pageSize"
        layout="prev, pager, next,total" :total="saleSlipDataSource.total" class="mt20  mb50"
        @current-change="saleSlipDataSource.currentPageChange($event,saleSlipDataSource)"
      />
    </div>
    <div class="mt20">
      <el-button type="primary" @click="addSaleOrder">
        新增销售订单
      </el-button>
    </div>
  </div>
</template>

<script setup>
import routerNav from '../components/routerNav.vue'
import { onBeforeMount, ref, getCurrentInstance, watch, h } from 'vue'
import saleOrderList from '../components/saleOrderList.vue'
import { SaleSlipDataSource, loading } from '../../../utils/sale/index'

const { proxy } = getCurrentInstance()
let saleSlipDataSource = ref(null)

onBeforeMount(() => {
  if (!saleSlipDataSource.value) saleSlipDataSource.value = new SaleSlipDataSource({
    modules: 'sale',
    selectUri: '/saleOrderMain/select',
    deleteUri: '/saleOrderMain/delete',
    selectOneUri: '/saleOrderMain/selectOne'
  })
  saleSlipDataSource.value.initTableHeader()
  initData()
})

const initData = () => {
  saleSlipDataSource.value.initData(this, proxy.$refs.table)
}

const addSaleOrder = () => {
  proxy.$refs.orderList.addSaleOrder()
}
</script>

<style lang="less" scoped>
.table{
  margin: 0 auto;
  display: flex;
  justify-content: center;
}
.table-content{
  margin-right: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>