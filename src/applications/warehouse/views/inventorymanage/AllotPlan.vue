<template>
  <div class="main">
    <div class="data-filter">
      <data-filter
        ref="filter"
        :filter-items="allotPlanDataSource.tableHeader"
        @openDialog="dialogSearch"
        @search="search"
      />
    </div>
    <div
      v-if="isComponent" class="extend-handle"
      :style="isComponent?{ width:'98%'}:{width:'88%'}"
    >
      <div class="extend-handle-left" />
      <div v-if="isComponent" class="extend-handle-right">
        <el-button
          class="handle-btn mr10"
          color="#4a78bd"
          style="color: #666"
          plain
          @click="madeTransferOrder"
        >
          制作调拨单
        </el-button>
      </div>
    </div>
    <v-table
      ref="table"
      need-end-handle
      load-prompt="正在加载库存信息,请耐心等待......"
      :default-end-handle="false"
      :auto-width="isComponent?98:89"
      :need-check-box="isComponent"
      :total="allotPlanDataSource.total"
      :current-page="allotPlanDataSource.currentPage"
      :page-size="allotPlanDataSource.pageSize"
      :table-data="allotPlanDataSource.tableData"
      :columns="allotPlanDataSource.tableHeader"
      :loading="loading && !dialogController.allotDetail && !isShowDialogSearch"
      :row-class="allotPlanDataSource.rowClass"
      @refresh="allotPlanDataSource.initData(allotPlanDataSource,proxy.$refs.table)"
      @selectionChange="allotPlanDataSource.selectionChange($event,allotPlanDataSource,proxy.$refs.table)"
      @current-change="allotPlanDataSource.currentPageChange($event,allotPlanDataSource,proxy.$refs.table)"
      @sizeChange="allotPlanDataSource.pageSizeChange($event,allotPlanDataSource,proxy.$refs.table)"
      @editTableHeader="isShowEditTableHeader = true"
    />
  </div>
  <selectDialogTable
    ref="warseHouseDialog"
    :is-show="isShowDialogSearch"
    :width="'50%'"
    :data-source="wareHouseDataSource"
    :title="'选择大仓'"
    small
    :is-show-search-input="true"
    :search-input-placeholder="'请输入大仓名称搜索'"
    :loading="warseHouseLoading"
    @close-dialog="isShowDialogSearch=false"
    @doDialogSearch="doDialogSearch"
    @chooseRow="chooseRow"
  />
  <allotData
    v-model="dialogController.allotDetail"
    width="70%"
    :is-show="dialogController.allotDetail"
    :title="'制作调拨单 - 选择数量'"
    :data="allotPlanDataSource.selections"
    @submitForm="confirmCreateAllot"
    @close-dialog="dialogController.allotDetail = false"
  />
  <el-drawer
    v-model="isShowEditTableHeader"
    :show-close="false"
  >
    <template #header="{ titleId, titleClass }">
      <h4 :id="titleId" :class="titleClass">
        通过拖拽设置您喜欢的表头顺序
      </h4>
      <el-button type="danger" @click="isShowEditTableHeader = false">
        <el-icon class="el-icon--left">
          <CircleCloseFilled />
        </el-icon>
        关闭
      </el-button>
    </template>
    <template #default>
      <div>
        <dynamicHeader
          :is-show-edit-table-header="isShowEditTableHeader" :modules="'allotPlan'"
          @updateCompleted="updateHeaderCompleted"
        />
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import VTable from '@/components/public/virtualTable.vue'
import dataFilter from '@/components/common/dataFilter.vue'
import dynamicHeader from '@/components/common/dynamicHeader.vue'
import allotData from './components/allotData.vue'
import { onBeforeMount, reactive, ref, getCurrentInstance, onMounted } from 'vue'
import selectDialogTable from '@/components/common/selectDialogTable.vue'
import { WareHouseDataSource, loading as warseHouseLoading } from '../../utils/warehouse/index'
import { AllotPlanDataSource, loading } from '../../utils/allotPlan/index'
import { ElMessage } from 'element-plus'

const props = defineProps({
  isComponent: {
    type: Boolean,
    default: false
  },
  goodsFilter: {
    type: Object,
    default: () => {
      return {
        selectUri: '/allocationPlan/select'
      }
    }
  }
})
const _emits = defineEmits(['createDone'])
const { proxy } = getCurrentInstance()
let allotPlanDataSource = ref(null)
const isShowEditTableHeader = ref(false)
const dialogController = reactive({
  allotDetail: false
})

const updateHeaderCompleted = () => {
  isShowEditTableHeader.value = false
  allotPlanDataSource.value.initTableHeader()
}

onBeforeMount(() => {
  if (!allotPlanDataSource.value) allotPlanDataSource.value = new AllotPlanDataSource({
    selectUri: props.goodsFilter.selectUri,
    deleteUri: '/',
    selectOneUri: '/'
  })
  if (props.goodsFilter.filter) allotPlanDataSource.value.searchData = props.goodsFilter.filter
  else allotPlanDataSource.value.searchData = { materialType: '套机' }
  if (!props.goodsFilter.tableHeader) {
    allotPlanDataSource.value.modules = 'allotPlan'
    allotPlanDataSource.value.initTableHeader()
  }
  else allotPlanDataSource.value.tableHeader = props.goodsFilter.tableHeader
  if (props.isComponent) allotPlanDataSource.value.initData()
})

onMounted(() => {
  if (!props.isComponent){
    let defaultProp = {
      index: 1,
      prop: 'warehouseName'
    }
    dialogSearch(defaultProp)
  }
})

const madeTransferOrder = () => {
  if (allotPlanDataSource.value.selections.length === 0){
    ElMessage.error('请先选择数据')
    return
  }
  else dialogController.allotDetail = true
}

const confirmCreateAllot = (data) => {
  let allocationOrderDetailList = []
  let totalNumber = 0
  let totalVolume = 0
  data.forEach(item => {
    console.log(item)
    let temp = {
      materialCode: item.materialCode ? item.materialCode : item.machineSetCode,
      materialName: item.materialName,
      materialSpecification: item.materialSpecification ? item.materialSpecification : item.specification,
      materialType: item.materialType,
      number: item.number ? item.number : item.goodsAmount,
      volume: item.volume ? item.volume : 0,
      totalVolume: item.totalVolume ? item.totalVolume : (item.number ? item.number : item.goodsAmount) * (item.volume ? item.volume : 0),
      pickUpWarehouse: item.warehouseName,
      pickUpWarehouseCode: item.warehouseCode,
      comment: item.comment ? item.comment : '',
      isUrgent: item.isUrgent,
      canBeAllocationNumber: item.canBeAllocationNumber,
      nowNumber: item.nowNumber,
      pickingOrderCode: item.pickingOrderCode,
      goodsPickingKey: item.goodsPickingKey,
      goodsAmount: item.goodsAmount
    }
    totalNumber += temp.number
    totalVolume += temp.totalVolume
    allocationOrderDetailList.push(temp)
  })
  let params = {
    allocationOrderDetailList,
    totalNumber,
    totalVolume
  }
  _emits('createDone', params)
}

let wareHouseDataSource = ref(null)
const isShowDialogSearch = ref(false)

let dataFilterTemp = {}

const search = (evt) => {
  if (!props.isComponent){
    if (evt.warehouseName)
      allotPlanDataSource.value.search(evt, this, proxy.$refs.table)
    else {
      let defaultProp = {
        index: 1,
        prop: 'warehouseName'
      }
      dialogSearch(defaultProp)
    }
  } else {
    if (Object.keys(evt).length === 0){
      allotPlanDataSource.value.search(props.goodsFilter.filter, this, proxy.$refs.table)
      return
    } else if (evt.warehouseName){
      if (evt.warehouseName){
        ElMessage.error('已经选择提货仓库，仓库已锁定')
        return
      }
    } else allotPlanDataSource.value.search({ ...props.goodsFilter.filter, ...evt }, this, proxy.$refs.table)
  }

}

const dialogSearch = (propObj) => {
  if (props.isComponent){
    ElMessage.error('已经选择提货仓库，仓库已锁定')
    return
  }
  isShowDialogSearch.value = true
  if (!wareHouseDataSource.value) wareHouseDataSource.value = new WareHouseDataSource({
    selectUri: '/warehouse/select',
    pageSize: 10,
    tableHeader: [{
      label: "仓库名称",
      prop: "warehouseName"
    }, {
      label: "仓库地址",
      prop: "warehouseAddress"
    }, {
      label: "仓库类型",
      prop: "warehouseType"
    }, {
      label: "仓库联系人",
      prop: "warehouseKeeper"
    }]
  })
  wareHouseDataSource.value.searchData = { warehouseType: 'BIG_WAREHOUSE' }
  dataFilterTemp = propObj
}

const doDialogSearch = (val) => {
  let searchData = { }
  if (val && val.length !== 0) searchData.warehouseName = val.trim()
  proxy.$refs.warseHouseDialog.dialogSearch(searchData)
}

const chooseRow = (val) => {
  proxy.$refs.filter.backfill(dataFilterTemp, val.warehouseName)
  if (!props.isComponent) {
    allotPlanDataSource.value.searchData = { warehouseName: val.warehouseName }
    allotPlanDataSource.value.initData()
  }
  isShowDialogSearch.value = false
}
</script>

<style lang="less" scoped>
.main {
  .table{
    padding: 10px;
    background-color: #ffffff;
  }
  .high-show{
    color:@red;
    font-size: 16px;
    font-weight: 1000;
  }
}
</style>