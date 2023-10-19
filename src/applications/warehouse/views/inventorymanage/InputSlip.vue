<template>
  <div class="main">
    <div class="data-filter">
      <data-filter
        :filter-items="iutputDataSource.tableHeader"
        use-data-filter
        @currentDayChange="iutputDataSource.currentDayChange($event,iutputDataSource)"
        @search="iutputDataSource.search($event,iutputDataSource,proxy.$refs.table)"
      />
    </div>
    <div class="extend-handle">
      <div class="extend-handle-left">
        <el-dropdown trigger="click" @command="exportExcel">
          <el-button
            class="handle-btn mr12"
            color="#4a78bd"
            style="color: #666"
            plain
          >
            导出入库单<el-icon class="el-icon--right">
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
        <el-button
          class="handle-btn"
          color="#4a78bd"
          style="color: #666"
          plain
          @click="goPrint"
        >
          打印入库单
        </el-button>
        <el-popconfirm
          title="是否确定删除"
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
        <el-dropdown trigger="click" @command="createNewInput">
          <el-button
            class="handle-btn mr10"
            color="#4a78bd"
            style="color: #666"
            plain
          >
            新建入库单<el-icon class="el-icon--right">
              <arrow-down />
            </el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="SALE_RETURN">
                根据销售退货单入库
              </el-dropdown-item>
              <el-dropdown-item command="ALLOCATION">
                根据调拨单入库
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
      :total="iutputDataSource.total"
      :current-page="iutputDataSource.currentPage"
      :page-size="iutputDataSource.pageSize"
      :table-data="iutputDataSource.tableData"
      :columns="iutputDataSource.tableHeader"
      :loading="loading &&!dialogController.selectSaleReturnOrders&&!dialogController.selectAllotOrders"
      :for-mat-data="iutputDataSource.forMatDataV2"
      @selectionChange="iutputDataSource.selectionChange($event,iutputDataSource,proxy.$refs.table)"
      @refresh=" iutputDataSource.initData(iutputDataSource, proxy.$refs.table,true)"
      @editRow="goCompile"
      @deleteRow="deleteRecord"
      @current-change="iutputDataSource.currentPageChange($event,iutputDataSource,proxy.$refs.table)"
      @sizeChange="iutputDataSource.pageSizeChange($event,iutputDataSource,proxy.$refs.table)"
      @editTableHeader="isShowEditTableHeader = true"
    />
  </div>
  <selectDialogTable
    ref="saleSaleReturnDialog"
    :width="'64%'"
    :is-show="dialogController.selectSaleReturnOrders"
    :data-source="saleReturnSlipDataSource"
    :title="'选择销售退货单'"
    :is-show-search-input="true"
    :search-input-placeholder="'请输入销售退货单号'"
    :loading="saleReturnLoading"
    :need-end-control="false"
    need-change-size
    need-selection
    @doDialogSearch="doDialogSearchSaleOrder"
    @close-dialog="dialogController.selectSaleReturnOrders=false"
    @submit="chooseSaleOrderDone"
  />
  <selectDialogTable
    ref="allotSlipDialog"
    :width="'64%'"
    :is-show="dialogController.selectAllotOrders"
    :data-source="allotSlipDataSource"
    :title="'选择调拨单'"
    :is-show-search-input="true"
    :search-input-placeholder="'请输入调拨单号'"
    :loading="allotSlipLoading"
    :need-end-control="false"
    need-change-size
    need-selection
    @doDialogSearch="doDialogSearchAllot"
    @close-dialog="dialogController.selectAllotOrders=false"
    @submit="chooseAllotDone"
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
          :is-show-edit-table-header="isShowEditTableHeader" :modules="'inputSlip'"
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
import selectDialogTable from '@/components/common/selectDialogTable.vue'
import { onBeforeMount, reactive, ref, getCurrentInstance, watch } from 'vue'
import { loading as saleReturnLoading, SaleReturnSlipDataSource } from '@/applications/warehouse/utils/saleReturn/index'
import { AllotSlipDataSource, loading as allotSlipLoading } from '../../utils/allotSlip/index'
import { useRouter, useRoute } from 'vue-router'
import { IutputDataSource, loading } from '../../utils/input/index'
import { ElMessage, ElMessageBox } from 'element-plus'
const { proxy } = getCurrentInstance()
const router = useRouter()
let iutputDataSource = ref(null)
const isShowEditTableHeader = ref(false)

const updateHeaderCompleted = () => {
  isShowEditTableHeader.value = false
  iutputDataSource.value.initTableHeader()
}

let route = useRoute()
watch(() => route.path, (newPath, oldPath) => {
  if (newPath === '/inventory/input') {
    if (!iutputDataSource.value) iutputDataSource.value = new IutputDataSource({
      modules: 'inputSlip',
      selectUri: '/inWarehouseOrderMain/select',
      deleteUri: '/inWarehouseOrderMain/delete',
      selectOneUri: '/'
    })
    iutputDataSource.value.initData(this, proxy.$refs.table, true)
  }
})

onBeforeMount(() => {
  if (!iutputDataSource.value) iutputDataSource.value = new IutputDataSource({
    modules: 'inputSlip',
    selectUri: '/inWarehouseOrderMain/select',
    deleteUri: '/inWarehouseOrderMain/delete',
    selectOneUri: '/',
    useDefaultTimeRangeFilter: true,
    defaultTimeRangeDay: 7
  })
  iutputDataSource.value.initTableHeader()
  initData()
})

const initData = () => {
  iutputDataSource.value.initData(this, proxy.$refs.table)
}

const deleteRecord = ({ id, processStatus }) => {
  if (processStatus === 'IN_WAREHOUSE_ORDER_DOC')
  {
    ElMessage.error('归档状态无法删除')
    return
  }
  ElMessageBox.alert('是否确认删除这条数据', '提示', {
    type: 'error',
    showCancelButton: true,
    cancelButtonText: '再想想',
    confirmButtonText: '确认删除',
    confirmButtonClass: 'delete-confirm-btn',
    callback: (action) => {
      if (action === 'cancel') return
      else {
        iutputDataSource.value.delete([id]).then((res) => {
          if (res === 200) {
            initData()
            ElMessage.success('成功删除1条数据')
          } else ElMessage.error(res)
        })
      }
    }
  })
}

const deleteRecords = () => {
  if (iutputDataSource.value.selections.length === 0){
    ElMessage.error('请先选择数据')
    return
  }
  let dataTool = new proxy.$DataTool()
  if (dataTool.processLimitation(iutputDataSource.value.selections, ['IN_WAREHOUSE_ORDER_CREATE'])){
    let params = dataTool.objectListGetValueByKey(iutputDataSource.value.selections, 'id', 'list')
    iutputDataSource.value.delete(params).then((res) => {
      if (res === 200) {
        initData()
        ElMessage.success(`删除${params.length}条数据成功`)
      } else ElMessageBox.error(res)
    })
  } else
    ElMessage.error('只有制单状态订单可以删除')
}

const inputType = ref('')
let saleReturnSlipDataSource = ref(null)
let allotSlipDataSource = ref(null)
const dialogController = reactive({
  selectSaleReturnOrders: false,
  selectAllotOrders: false
})

const createNewInput = (command) => {
  inputType.value = command
  if (command === 'SALE_RETURN'){
    if (!saleReturnSlipDataSource.value) saleReturnSlipDataSource.value = new SaleReturnSlipDataSource({
      tableHeader: [
        {
          label: "销售退货单号",
          prop: "saleOrderReturnCode",
          width: 150
        }, {
          label: "销售单号",
          prop: "saleOrderCode",
          width: 150
        }, {
          label: "商家名称",
          prop: "merchantName",
          width: 180
        }, {
          label: "客户名称",
          prop: "customerName",
          width: 150
        }, {
          label: "客户电话",
          prop: "customerPhone",
          width: 150
        }, {
          label: "送货地址",
          prop: "receiptAddress",
          width: 200
        }, {
          label: "发货仓库",
          prop: "warehouseName",
          width: 150
        }, {
          label: "备注",
          prop: "comment",
          width: 200
        }
      ],
      selectUri: '/saleOrdersReturn/select'
    })
    saleReturnSlipDataSource.value.searchData = {
      processStatus: `SALE_ORDER_RETURN_PICK_UP`
    }
    dialogController.selectSaleReturnOrders = true
  }
  else {
    if (!allotSlipDataSource.value) allotSlipDataSource.value = new AllotSlipDataSource({
      selectUri: '/allocationOrderMain/select',
      tableHeader: [
        {
          label: "调拨单号",
          prop: "allocationCode",
          width: 180,
          isShow: true,
          isFixed: false,
          type: 'text'
        }, {
          label: "目的仓库名称",
          prop: "toWarehouseName",
          width: 120,
          isShow: true,
          isFixed: false,
          type: 'text'
        }, {
          label: "提货仓库名称",
          prop: "pickWarehouseName",
          width: 120,
          isShow: true,
          isFixed: false,
          type: 'none'
        }, {
          label: "收货地址",
          prop: "receiptAddress",
          width: 180
        }, {
          label: "收货人",
          prop: "receiptPerson",
          width: 120
        }, {
          label: "收货电话",
          prop: "receiptPhone",
          width: 180
        }, {
          label: "总数量",
          prop: "totalNumber",
          width: 100
        }, {
          label: "总体积",
          prop: "totalVolume",
          width: 120
        }, {
          label: "备注",
          prop: "comment",
          width: 120
        }
      ]
    })
    allotSlipDataSource.value.searchData = { processStatus: 'ALLOCATION_ORDER_ING' }
    dialogController.selectAllotOrders = true
  }
}

const doDialogSearchSaleOrder = (saleOrderReturnCode) => {
  let searchData
  if (saleOrderReturnCode && saleOrderReturnCode.length !== 0) searchData = { saleOrderReturnCode: saleOrderReturnCode.trim(), processStatus: 'SALE_ORDER_RETURN_PICK_UP' }
  else searchData = { processStatus: 'SALE_ORDER_RETURN_PICK_UP' }
  proxy.$refs.saleSaleReturnDialog.dialogSearch(searchData)
}

const doDialogSearchAllot = (allocationCode) => {
  let searchData
  if (allocationCode && allocationCode.length !== 0) searchData = { allocationCode: allocationCode.trim(), processStatus: 'ALLOCATION_ORDER_ING' }
  else searchData = { processStatus: 'ALLOCATION_ORDER_ING' }
  proxy.$refs.allotSlipDialog.dialogSearch(searchData)
}

const chooseSaleOrderDone = () => {
  ElMessageBox.alert('选择销售退货单完毕并确认制作入库单？', '提示', {
    type: 'warning',
    showCancelButton: true,
    cancelButtonText: '再想想',
    callback: (action) => {
      if (action === 'cancel') return
      else {
        let params = {
          type: inputType.value,
          allocationOrReturnCodeList: new proxy.$DataTool().objectListGetValueByKey(saleReturnSlipDataSource.value.selections, 'saleOrderCode')
        }
        iutputDataSource.value.createByAllocationOrReturnOrder(params).then(res => {
          if (res.code === 200){
            ElMessage.success(`创建成功`)
            initData()
            dialogController.selectSaleReturnOrders = false
            inputType.value = ''
          } else ElMessage.error(res)
        })
      }
    } }
  )

}
const chooseAllotDone = () => {
  ElMessageBox.alert('选择调拨单完毕并确认制作入库单？', '提示', {
    type: 'warning',
    showCancelButton: true,
    cancelButtonText: '再想想',
    callback: (action) => {
      if (action === 'cancel') return
      else {
        let params = {
          type: inputType.value,
          allocationOrReturnCodeList: new proxy.$DataTool().objectListGetValueByKey(allotSlipDataSource.value.selections, 'allocationCode')
        }
        iutputDataSource.value.createByAllocationOrReturnOrder(params).then(res => {
          if (res.code === 200){
            ElMessage.success(`创建成功`)
            initData()
            dialogController.selectAllotOrders = false
            inputType.value = ''
          } else ElMessage.error(res)
        })
      }
    } }
  )
}

const exportExcel = async (prop) => {
  if (iutputDataSource.value.selections.length === 0){
    ElMessage.error('请先选择数据')
    return
  }
  let dataTool = new proxy.$DataTool()
  let params = { list: dataTool.objectListGetValueByKey(iutputDataSource.value.selections, 'inWarehouseCode') }
  if (prop === 'mat'){
    const res = await iutputDataSource.value.selectByOutWarehouseCode(params)
    const enHeader = [
      "createTime",
      "updateTime",
      "barCodeHead",
      "materialCode",
      "materialSpecification",
      "materialType",
      "noInNumber",
      "shouldInNumber",
      "haveInNumber",
      "comment",
      "volume",
      "totalVolume",
      "inWarehouseCode"
    ]
    let znHeader = {
      createTime: '制单时间',
      updateTime: '最后修改时间',
      barCodeHead: '条码头',
      materialCode: '物料代码',
      materialSpecification: '物料型号',
      materialType: '物料类型',
      noInNumber: '未入库数量',
      shouldInNumber: '应入库数量',
      haveInNumber: '已入库数量',
      comment: '备注',
      volume: '体积',
      totalVolume: '总体积',
      inWarehouseCode: '入库单号'
    }
    let data = res.data.map(item => {
      item.createTime = dataTool.timeStamp2Time(item.createTime, 'yyyy-MM-dd HH:mm:ss')
      item.updateTime = dataTool.timeStamp2Time(item.updateTime, 'yyyy-MM-dd HH:mm:ss')
      return dataTool.deleteObjectKeys(item, ['updateUser', 'isDelete', 'id', 'createUser'])
    })
    dataTool.exportExcel(znHeader, enHeader, data, '入库单_物料')
  } else {
    let { data } = await iutputDataSource.value.exportByInWarehouseCodeList(params)
    const enHeader = [
      "createTime",
      "updateTime",
      "inWarehouseCode",
      "materialName",
      "materialCode",
      "materialSpecification",
      "materialType",
      "volume",
      "totalVolume",
      "number",
      "allocationCode",
      "saleOrderReturnCode",
      "comment"
    ]
    let znHeader = {
      createTime: '制单时间',
      updateTime: '最后修改时间',
      inWarehouseCode: '入库单号',
      materialName: '商品名称',
      materialCode: '套机/单机码',
      materialSpecification: '规格型号',
      materialType: '类型',
      number: '入库数量',
      volume: '体积',
      totalVolume: '总体积',
      comment: '备注',
      allocationCode: '调拨单号',
      saleOrderReturnCode: '销售退货单号'
    }
    data = data.map(item => {
      item.createTime = dataTool.timeStamp2Time(item.createTime, 'yyyy-MM-dd HH:mm:ss')
      item.updateTime = dataTool.timeStamp2Time(item.updateTime, 'yyyy-MM-dd HH:mm:ss')
      return dataTool.deleteObjectKeys(item, ['updateUser', 'isDelete', 'id', 'createUser'])
    })
    dataTool.exportExcel(znHeader, enHeader, data, '入库单_套机')
  }

}

const goCompile = (rowData) => {
  if (!rowData){
    router.push({
      path: '/inventory/input/newFile'
    })
  } else {
    router.push({
      path: '/inventory/input/newFile',
      query: { id: rowData.id, inWarehouseCode: rowData.inWarehouseCode }
    })
  }
}

const goPrint = () => {
  if (iutputDataSource.value.selections.length < 1) {
    ElMessage.error('请先选择数据')
    return
  }
  let printInputNumArr = iutputDataSource.value.selections.map(item => {
    return item.numberOfPrints
  })
  let list = iutputDataSource.value.selections.map(item => {return item.inWarehouseCode})
  let type = iutputDataSource.value.selections.map(item => {return item.type})
  sessionStorage.setItem('printInputData', JSON.stringify(list))
  sessionStorage.setItem('printInputType', JSON.stringify(type))
  sessionStorage.setItem('printInputNumArr', JSON.stringify(printInputNumArr))
  const routerUrl = router.resolve('/print/inputslip')
  window.open(routerUrl.href, '_blank')
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