<template>
  <div class="search-content flex-center">
    <div class="search-input">
      <el-input
        v-model="searchVal"
        style="width:500px"
        class="w-50 m-2"
        placeholder="查询具体运单号轨迹"
        suffix-icon="Search"
        clearable
        @keyup.enter="search"
      />
    </div>
    <el-button
      type="primary" icon="Search"
      class="ml20"
      :loading="loading"
      @click="search"
    >
      查询
    </el-button>
  </div>
  <div
    v-if="orderList.length!==0" v-loading="loading"
    class="content"
  >
    <el-tabs
      v-model="activeName" class="demo-tabs"
    >
      <el-tab-pane
        v-for="item in orderList" :key="item"
        :label="item"
        :name="item"
      >
        <div :style="{height: searchData[0][item].length * 100 + 'px'}">
          <el-steps :active="1" direction="vertical">
            <el-step
              v-for="data,idx in searchData[0][item]" :key="data.id"
              :title="data.statusDetails" :icon="idx===0?'LocationInformation':'CircleCheck'"
              :description=" '更新时间： ' + changeTime(data.createTime) "
            />
          </el-steps>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ElMessageBox } from 'element-plus'
import { onBeforeMount, reactive, ref, unref } from 'vue'
import { SaleSlipDataSource, loading } from '../../../utils/sale/index'
import { changeTime } from '@/applications/warehouse/public/jxRequest/index'
import { ElMessage } from 'element-plus'

const _props = defineProps({
  initData: {
    type: Object,
    default: () => {
      return []
    }
  }
})
onBeforeMount(() => {
  orderList.length = 0
  searchData.length = 0
  searchData.push(_props.initData)
  Object.keys(searchData[0]).forEach(key => {
    orderList.push(key)
    searchData[0][key].reverse()
  })
  activeName.value = orderList[0]
}
)
let searchVal = ref('')
let searchData = reactive([])
let orderList = reactive([])
const activeName = ref('')

const search = () => {
  if (searchVal.value.trim().length === 0) {
    ElMessage.error('请输入运单号或销售订单号')
    return
  }
  searchVal.value = searchVal.value.trim()
  searchData.length = 0
  new SaleSlipDataSource().listBySaleCodeOrBranchOrderCode(searchVal.value).then(res => {
    if (!res.data){
      ElMessage.error('查无数据')
      return
    }
    orderList.length = 0
    searchData.length = 0
    searchData.push(res.data)
    Object.keys(searchData[0]).forEach(key => {
      orderList.push(key)
      searchData[0][key].reverse()
    })
    activeName.value = orderList[0]
  })
}
</script>

<style scoped lang="less">
.search-content{
justify-content: space-around;
border-radius: 8px;
padding: 10px;
margin: 0px auto;
width: 40%;
background: white;
}
.content{
border-radius: 8px;
margin: 0px auto;
padding: 0 50px;
width: 90%;
background: white;
}
:deep(.is-flex){
align-items: center;
}
:deep(.is-process,.is-wait){
color: @primary;
}
:deep(.is-wait){
color: @primary;
}
</style>

<style>
.demo-tabs > .el-tabs__content {
padding: 32px;
color: #6b778c;
font-size: 32px;
font-weight: 600;
}
</style>
