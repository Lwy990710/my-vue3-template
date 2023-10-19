<template>
  <div class="main">
    <div class="data-filter">
      <data-filter
        :filter-items="outputDataSource.tableHeader"
        use-data-filter
        @currentDayChange="outputDataSource.currentDayChange($event,outputDataSource)"
        @search="outputDataSource.search($event,outputDataSource,proxy.$refs.table)"
      />
    </div>
    <div class="extend-handle">
      <div class="extend-handle-left">
        <el-button
          class="handle-btn"
          color="#4a78bd"
          style="color: #666"
          plain
          @click="goPrint"
        >
          打印出库单
        </el-button>
        <el-dropdown trigger="click" @command="exportExcel">
          <el-button
            class="handle-btn ml12 mr12"
            color="#4a78bd"
            style="color: #666"
            plain
          >
            导出出库单<el-icon class="el-icon--right">
              <arrow-down />
            </el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="set">
                以套机/单机为单位导出
              </el-dropdown-item>
              <el-dropdown-item command="mat">
                以物料为单位导出
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-popconfirm
          :title="'是否确定删除' + outputDataSource.selections.length +'条数据'"
          confirm-button-text="确定"
          cancel-button-text="再想想"
          @confirm="deleteRecords"
        >
          <template #reference>
            <el-button
              class="handle-btn-delete"
              color="#f56c6c"
              style="color: #666"
              plain
            >
              批量删除
            </el-button>
          </template>
        </el-popconfirm>
        <span style="display:inline-block;margin-left:20px;font-size:12px;color:red">
          Tips: 按住shift + 鼠标滚轮可以横向滚动表格 && 按住 Ctrl + 鼠标左键快捷选择
        </span>
      </div>
      <div class="extend-handle-right">
        <el-dropdown trigger="click" @command="createNewOut">
          <el-button
            class="handle-btn mr10"
            color="#4a78bd"
            style="color: #666"
            plain
          >
            新增出库单<el-icon class="el-icon--right">
              <arrow-down />
            </el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="sale">
                根据销售订单出库
              </el-dropdown-item>
              <el-dropdown-item command="allot">
                根据调拨单出库
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <v-table
      ref="table"
      need-check-box
      need-end-handle
      :total="outputDataSource.total"
      :current-page="outputDataSource.currentPage"
      :page-size="outputDataSource.pageSize"
      :table-data="outputDataSource.tableData"
      :columns="outputDataSource.tableHeader"
      :for-mat-data="outputDataSource.forMatDataV2"
      :loading="loading"
      @selectionChange="outputDataSource.selectionChange($event,outputDataSource,proxy.$refs.table)"
      @refresh="outputDataSource.initData(outputDataSource,proxy.$refs.table,true)"
      @editRow="goCompile"
      @deleteRow="deleteRecord"
      @current-change="outputDataSource.currentPageChange($event,outputDataSource,proxy.$refs.table)"
      @sizeChange="outputDataSource.pageSizeChange($event,outputDataSource,proxy.$refs.table)"
      @editTableHeader="isShowEditTableHeader = true"
    />
  </div>
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
          :is-show-edit-table-header="isShowEditTableHeader" :modules="'outputSlip'"
          @updateCompleted="updateHeaderCompleted"
        />
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import * as XLSX from "xlsx"
import VTable from '@/components/public/virtualTable.vue'
import dataFilter from '@/components/common/dataFilter.vue'
import dynamicHeader from '@/components/common/dynamicHeader.vue'
import { onBeforeMount, ref, getCurrentInstance, watch, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { OutputDataSource, loading } from '../../utils/output/index'
import { ElMessage, ElMessageBox } from 'element-plus'
const { proxy } = getCurrentInstance()
const router = useRouter()
let pro = ref(sessionStorage.getItem('userPermissions'))
let outputDataSource = ref(null)
const isShowEditTableHeader = ref(false)

const updateHeaderCompleted = () => {
  isShowEditTableHeader.value = false
  outputDataSource.value.initTableHeader()
}

let route = useRoute()
watch(() => route.path, (newPath, oldPath) => {
  if (newPath === '/inventory/output') {
    if (!outputDataSource.value) outputDataSource.value = new OutputDataSource({
      modules: 'outputSlip',
      selectUri: '/outWarehouseOrderMain/select',
      deleteUri: '/outWarehouseOrderMain/delete',
      selectOneUri: '/'
    })
    outputDataSource.value.initData(this, proxy.$refs.table, true)
  }
})

onBeforeMount(() => {
  if (!outputDataSource.value) outputDataSource.value = new OutputDataSource({
    modules: 'outputSlip',
    selectUri: '/outWarehouseOrderMain/select',
    deleteUri: '/outWarehouseOrderMain/delete',
    selectOneUri: '/',
    useDefaultTimeRangeFilter: true,
    defaultTimeRangeDay: 7
  })
  outputDataSource.value.initTableHeader()
  outputDataSource.value.initData()
})

const deleteRecord = ({ id, processStatus }) => {
  if (processStatus !== 'OUT_WAREHOUSE_ORDER_WF'){
    ElMessage.error('仅等待出库状态支持删除')
    return
  }
  let params = [id]
  ElMessageBox.alert('是否确认删除这条数据', '提示', {
    type: 'error',
    showCancelButton: true,
    cancelButtonText: '再想想',
    confirmButtonText: '确认删除',
    confirmButtonClass: 'delete-confirm-btn',
    callback: (action) => {
      if (action === 'cancel') return
      else {
        outputDataSource.value.delete(params, proxy.$refs.table).then((res) => {
          if (res === 200){
            ElMessage.success('成功删除1条数据')
          } else ElMessage.error(res)
        })
      }
    }
  })

}

const deleteRecords = () => {
  if (outputDataSource.value.selections.length === 0){
    ElMessage.error('请先选择数据')
    return
  }
  let dataTool = new proxy.$DataTool()
  if (dataTool.processLimitation(outputDataSource.value.selections, ['OUT_WAREHOUSE_ORDER_WF'])){
    let params = dataTool.objectListGetValueByKey(outputDataSource.value.selections, 'id')
    outputDataSource.value.delete(params, proxy.$refs.table).then((res) => {
      if (res === 200){
        ElMessage.success('成功删除' + params.length + '条数据')
      } else ElMessage.error(res)
    })
  } else {
    ElMessage.error('仅等待出库状态支持删除')
    return
  }
}

const createNewOut = (evt) => {
  if (evt === 'sale'){
    router.push({
      path: '/inventory/output/newFile',
      query: { type: 'sale' }
    })
  } else if (evt === 'allot') {
    router.push({
      path: '/inventory/output/newFile',
      query: { type: 'allot' }
    })
  }
}

// const addOutPutSlip = () => {
//   router.push({
//     path: '/inventory/output/newFile'
//   })
// }

const goCompile = ({ id, outWarehouseCode }) => {
  router.push({
    path: '/inventory/output/newFile',
    query: { id, outWarehouseCode }
  })
}

const goPrint = () => {
  if (outputDataSource.value.selections.length < 1) {
    ElMessage.error('请先选择数据')
    return
  }
  let printOutWarehouseData = outputDataSource.value.selections.map(item => {
    return item.outWarehouseCode
  })
  let commentArr = outputDataSource.value.selections.map(item => {
    return item.comment
  })
  let printOutPutNumArr = outputDataSource.value.selections.map(item => {
    return item.numberOfPrints
  })
  sessionStorage.setItem('printOutWarehouseData', JSON.stringify(printOutWarehouseData))
  sessionStorage.setItem('commentArr', JSON.stringify(commentArr))
  sessionStorage.setItem('printOutPutNumArr', JSON.stringify(printOutPutNumArr))
  const routerUrl = router.resolve('/print/outputslip')
  window.open(routerUrl.href, '_blank')
}

const exportExcel = async (prop) => {
  if (outputDataSource.value.selections.length === 0){
    ElMessage.error('请先选择数据')
    return
  }
  let dataTool = new proxy.$DataTool()
  let params = dataTool.objectListGetValueByKey(outputDataSource.value.selections, 'outWarehouseCode')
  if (prop === 'mat'){
    const res = await outputDataSource.value.exportOutWarehouseSlip(params)
    const enHeader = [
      "createTime",
      "updateTime",
      "outWarehouseCode",
      "warehouseCode",
      "warehouseName",
      "warehousePositionCode",
      "warehousePositionName",
      "barCodeHead",
      "materialCode",
      "materialSpecification",
      "materialType",
      "volume",
      "noOutNumber",
      "shouldOutNumber",
      "haveOutNumber",
      "totalVolume",
      "comment"
    ]
    const znHeader = {
      createTime: '制单时间',
      updateTime: '最后修改时间',
      outWarehouseCode: '出库单号',
      warehouseCode: '仓库编码',
      warehouseName: '仓库名称',
      warehousePositionCode: '仓位编码',
      warehousePositionName: '仓位名',
      barCodeHead: '条码头',
      materialCode: '物料代码',
      materialSpecification: '规格型号',
      materialType: '物料类型',
      volume: '体积',
      noOutNumber: '未出库数量',
      shouldOutNumber: '应出库数量',
      haveOutNumber: '已出库数量',
      totalVolume: '总体积',
      comment: '备注'

    }
    let data = res.data.map(item => {
      item.createTime = dataTool.timeStamp2Time(item.createTime, 'yyyy-MM-dd hh:mm:ss')
      item.updateTime = dataTool.timeStamp2Time(item.updateTime, 'yyyy-MM-dd hh:mm:ss')
      return dataTool.deleteObjectKeys(item, 'updateUser')
    })
    dataTool.exportExcel(znHeader, enHeader, data, '出库单_物料信息')
  } else {
    let { data } = await outputDataSource.value.exportOutWarehouseSlipBySet(params)
    const enHeader = [
      "createTime",
      "updateTime",
      "outWarehouseCode",
      "materialName",
      "materialCode",
      "materialSpecification",
      "materialType",
      "volume",
      "totalVolume",
      "number",
      "customerName",
      "customerPhone",
      "receiptAddress",
      "allocationCode",
      "merchantCode",
      "merchantName",
      "merchantLinkman",
      "merchantLinkmanPhone",
      "saleOrderCode",
      "comment"
    ]
    const znHeader = {
      createTime: '制单时间',
      updateTime: '最后修改时间',
      outWarehouseCode: '出库单号',
      materialName: '商品名称',
      materialCode: '套机/单机码',
      materialSpecification: '规格型号',
      materialType: '类型',
      volume: '体积',
      totalVolume: '总体积',
      number: '数量',
      customerName: '客户姓名',
      customerPhone: '客户电话',
      receiptAddress: '收货地址',
      allocationCode: '调拨单号',
      merchantCode: '下单商家编码',
      merchantName: '下单商家',
      merchantLinkman: '商家联系人',
      merchantLinkmanPhone: '商家联系电话',
      saleOrderCode: '销售单号',
      comment: '备注'
    }
    data = data.map(item => {
      item.createTime = dataTool.timeStamp2Time(item.createTime, 'yyyy-MM-dd HH:mm:ss')
      item.updateTime = dataTool.timeStamp2Time(item.updateTime, 'yyyy-MM-dd HH:mm:ss')
      return dataTool.deleteObjectKeys(item, 'updateUser')
    })
    dataTool.exportExcel(znHeader, enHeader, data, '出库单_套机信息')
  }
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