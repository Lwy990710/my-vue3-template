<template>
  <div class="main">
    <div class="data-filter">
      <data-filter
        ref="filter"
        :filter-items="outputScanDataSource.tableHeader"
        @search="doSearch"
      />
    </div>
    <div class="extend-handle">
      <div class="extend-handle-left">
        <el-button
          class="handle-btn"
          color="#4a78bd"
          style="color: #666"
          plain
          @click="exportExcel"
        >
          导出明细
        </el-button>
        <span style="display:inline-block;margin-left:20px;font-size:12px;color:red">
          Tips: 按住shift + 鼠标滚轮可以横向滚动表格 && 按住 Ctrl + 鼠标左键快捷选择
        </span>
      </div>
    </div>
    <v-table
      ref="table"
      need-end-handle
      need-check-box
      :end-handle-width="140"
      :default-end-handle="false"
      :total="outputScanDataSource.total"
      :current-page="outputScanDataSource.currentPage"
      :for-mat-data="outputScanDataSource.forMatDataV2"
      :page-size="outputScanDataSource.pageSize"
      :table-data="outputScanDataSource.tableData"
      :columns="outputScanDataSource.tableHeader"
      :loading="loading"
      @refresh="initData"
      @selectionChange="outputScanDataSource.selectionChange($event,outputScanDataSource,proxy.$refs.table)"
      @current-change="outputScanDataSource.currentPageChange($event,outputScanDataSource,proxy.$refs.table)"
      @sizeChange="outputScanDataSource.pageSizeChange($event,outputScanDataSource,proxy.$refs.table)"
      @editTableHeader="isShowEditTableHeader = true"
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
            :is-show-edit-table-header="isShowEditTableHeader" :modules="'outputScan'"
            @updateCompleted="updateHeaderCompleted"
          />
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import VTable from '@/components/public/virtualTable.vue'
import dataFilter from '@/components/common/dataFilter.vue'
import dynamicHeader from '@/components/common/dynamicHeader.vue'
import { OutputScanDataSource, loading } from '@/applications/warehouse/utils/outputScan/index'
import { useStore } from "vuex"
import { ref, reactive, onBeforeMount, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { changeTime } from '@/applications/warehouse/public/jxRequest'
let { proxy } = getCurrentInstance()
const permissionsArr = JSON.parse(sessionStorage.getItem('userPermissions'))
const { _state } = useStore()
let router = useRouter()
let outputScanDataSource = ref(null)
const isShowEditTableHeader = ref(false)
let materialStatusArr = {
  GOOD: '良品',
  BAD: '不良品'
}
let processStatus = {
  OUT_WAREHOUSE_ORDER_CREATE: "制单",
  OUT_WAREHOUSE_ORDER_WF: "等待出库",
  OUT_WAREHOUSE_ORDER_AUDIT: "审核",
  OUT_WAREHOUSE_ORDER_OUT: "出库中",
  OUT_WAREHOUSE_ORDER_DOC: "归档"
}
let outputType = {
  FH: '发货单出库'
}
const updateHeaderCompleted = () => {
  isShowEditTableHeader.value = false
  outputScanDataSource.value.initTableHeader()
}
onBeforeMount(() => {
  if (!outputScanDataSource.value) {
    outputScanDataSource.value = new OutputScanDataSource({
      modules: 'outputScan',
      selectUri: '/outWarehouseOrderScanDetail/selectOutWarehouseOrderScan'
    })
  }
  outputScanDataSource.value.initTableHeader()
  initData()
})

const initData = () => {
  outputScanDataSource.value.initData()
}

const exportExcel = () => {
  let { selections } = outputScanDataSource.value
  if (selections.length < 1) {
    ElMessage.error('请先选择数据')
  }
  let data = selections.map(item => {
    let { type, orderCode, outWarehouseCode, goodsPickingKeys, barCode, finalMerchantName, finalMerchantCode, materialCode, materialSpecification, materialStatus, materialType, warehouseName, warehousePositionName, driverName, driverPhone, licensePlateNumber, scanTime } = item
    materialStatus = materialStatusArr[materialStatus]
    type = outputType[type]
    scanTime = changeTime(scanTime * 1000)
    return { type, orderCode, outWarehouseCode, goodsPickingKeys, barCode, finalMerchantName, finalMerchantCode, materialCode, materialSpecification, materialStatus, materialType, warehouseName, warehousePositionName, driverName, driverPhone, licensePlateNumber, scanTime }
  })

  let znHeader = {
    outWarehouseCode: '出库单号',
    barCode: '条形码',
    finalMerchantName: '商家名称',
    finalMerchantCode: '商家编码',
    materialCode: '物料代码',
    materialSpecification: '产品型号',
    materialStatus: '产品质量',
    materialType: '产品类型',
    warehouseName: '仓库名称',
    warehousePositionName: '仓位名称',
    scanTime: '扫码时间'
  }

  let enHeader = [
    'outWarehouseCode', 'goodsPickingKeys', 'barCode', 'finalMerchantName', 'finalMerchantCode', 'materialCode', 'materialSpecification', 'materialStatus', 'materialType', 'warehouseName', 'warehousePositionName', 'scanTime'
  ]

  new proxy.$DataTool().exportExcel(znHeader, enHeader, data, '出库扫码明细')
}

const doSearch = (data) => {
  outputScanDataSource.value.search(data, outputScanDataSource.value, proxy.$refs.table)
}
</script>

<style lang="less" scoped>
.main {
  .table{
    padding: 10px;
    background-color: #ffffff;
  }
}
</style>