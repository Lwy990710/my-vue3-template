<template>
  <div class="main">
    <div class="data-filter">
      <data-filter
        :filter-items="saleReturnSlipDataSource.tableHeader"
        @search="saleReturnSlipDataSource.search($event,saleReturnSlipDataSource,proxy.$refs.table)"
      />
    </div>
    <div class="extend-handle">
      <div class="extend-handle-left">
        <el-button
          class="handle-btn-delete"
          color="#f56c6c"
          style="color: #666"
          plain
          @click="dialogController.selectSaleOrder=true"
        >
          新增退货单
        </el-button>
        <el-button
          class="handle-btn ml12"
          color="#4a78bd"
          style="color: #666"
          plain
          @click="goPrint"
        >
          打印退货单
        </el-button>
        <el-button
          class="handle-btn ml12"
          color="#4a78bd"
          style="color: #666"
          plain
          @click="exportExcel"
        >
          导出Excel
        </el-button>
        <span style="display:inline-block;margin-left:20px;font-size:12px;color:red">
          Tips: 按住shift + 鼠标滚轮可以横向滚动表格 && 按住 Ctrl + 鼠标左键快捷选择
        </span>
      </div>
      <div class="extend-handle-right" />
    </div>
    <v-table
      ref="table"
      need-end-handle
      need-check-box
      :total="saleReturnSlipDataSource.total"
      :current-page="saleReturnSlipDataSource.currentPage"
      :page-size="saleReturnSlipDataSource. pageSize"
      :table-data="saleReturnSlipDataSource.tableData"
      :columns="saleReturnSlipDataSource.tableHeader"
      :for-mat-data="saleReturnSlipDataSource.forMatDataV2"
      :loading="loading && !dialogController.selectSaleOrder && !dialogController.createSaleOrder && !dialogController.createSaleOrderConfirm"
      @selectionChange="saleReturnSlipDataSource.selectionChange($event,saleReturnSlipDataSource,proxy.$refs.table)"
      @refresh="initData"
      @editRow="goCompile"
      @deleteRow="deleteRecord"
      @current-change="saleReturnSlipDataSource.currentPageChange($event,saleReturnSlipDataSource,proxy.$refs.table)"
      @sizeChange="saleReturnSlipDataSource.pageSizeChange($event,saleReturnSlipDataSource,proxy.$refs.table)"
      @editTableHeader="isShowEditTableHeader = true"
    />
  </div>
  <selectDialogTable
    ref="tableDialogSaleOrder"
    :width="'50%'"
    :is-show="dialogController.selectSaleOrder"
    :data-source="saleSlipDataSource"
    :title="'选择需要退货的销售订单'"
    :is-show-search-input="true"
    :search-input-placeholder="'输入销售单号查询'"
    :search-value-key="'test'"
    :loading="saleLoading"
    @close-dialog="dialogController.selectSaleOrder=false"
    @doDialogSearch="doDialogSearchSaleOrder"
    @chooseRow="chooseRowSaleOrder"
  />
  <saleReturnData
    v-model="isShowEditTableHeader"
    :width="'70%'"
    :is-show="dialogController.createSaleOrder"
    :title="needReturnsaleOrderData.saleOrderCode ? '更新退货单' : '制作退货单'"
    :data="needReturnsaleOrderData"
    @submitForm="confirmCreateSaleReturn"
    @close-dialog="dialogController.createSaleOrder = false"
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
          :is-show-edit-table-header="isShowEditTableHeader" :modules="'saleReturn'"
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
import saleReturnData from './components/saleReturnData.vue'
import selectDialogTable from '@/components/common/selectDialogTable.vue'
import { onBeforeMount, reactive, ref, getCurrentInstance, watch, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { SaleReturnSlipDataSource, loading } from '../../utils/saleReturn/index'
import { SaleSlipDataSource, loading as saleLoading } from '../../utils/sale/index'
import { ElMessage, ElMessageBox, ElButton } from 'element-plus'

const route = useRoute()
watch(() => route.path, (newPath, oldPath) => {
  if (newPath === '/sale/salereturn/slip') {
    if (!saleReturnSlipDataSource.value) saleReturnSlipDataSource.value = new SaleReturnSlipDataSource({
      modules: 'saleReturn',
      selectUri: '/saleOrdersReturn/select',
      deleteUri: '/saleOrdersReturn/delete',
      selectOneUri: '/saleOrdersReturn/selectOne'
    })
    saleReturnSlipDataSource.value.initData(this)
  }
})

const { proxy } = getCurrentInstance()
const router = useRouter()
let saleReturnSlipDataSource = ref(null)
const isShowEditTableHeader = ref(false)

const updateHeaderCompleted = () => {
  isShowEditTableHeader.value = false
  saleReturnSlipDataSource.value.initTableHeader()
}

const initData = () => {
  saleReturnSlipDataSource.value.initData(this, proxy.$refs.table)
}

const dialogController = reactive({
  selectSaleOrder: false,
  createSaleOrder: false,
  createSaleOrderConfirm: false
})

let saleSlipDataSource = ref(null)

let needReturnsaleOrderData = reactive({})

const doDialogSearchSaleOrder = (val) => {
  let searchData
  if (!val || val.length === 0)searchData = { processStatus: 'SALE_ORDER_DOC' }
  else searchData = { processStatus: 'SALE_ORDER_DOC', saleOrderCode: val.trim() }
  proxy.$refs.tableDialogSaleOrder.dialogSearch(searchData)
}

const chooseRowSaleOrder = (val) => {
  Object.assign(needReturnsaleOrderData, val)
  saleSlipDataSource.value.searchSaleOrderDetails({ saleOrderCode: needReturnsaleOrderData.saleOrderCode }).then(res => {
    needReturnsaleOrderData.saleOrderReturnDetailList = [...res.list]
    dialogController.selectSaleOrder = false
    dialogController.createSaleOrder = true
  })

}

const confirmCreateSaleReturn = (val) => {
  let params = {
    list: [val]
  }
  if (val.saleOrderReturnCode && val.saleOrderReturnCode.length !== 0){
    ElMessageBox.alert('确认数据无误并更新退货单？', '提示', {
      type: 'warning',
      showCancelButton: true,
      cancelButtonText: '再想想',
      confirmButtonText: '确认无误',
      confirmButtonClass: 'ask-confirm-btn',
      callback: (action) => {
        if (action !== 'cancel'){
          saleReturnSlipDataSource.value.updateSaleReturn(params).then(res => {
            if (res.code === 200){
              ElMessage.success('更新退货单成功！')
              dialogController.createSaleOrder = false
              initData()
            } else {
              ElMessage.error(res)
            }
          })
        }
      }
    })
  }
  else {
    ElMessageBox.alert('确认数据无误并创建退货单？', '提示', {
      type: 'warning',
      showCancelButton: true,
      cancelButtonText: '再想想',
      confirmButtonText: '确认无误',
      confirmButtonClass: 'ask-confirm-btn',
      callback: (action) => {
        if (action !== 'cancel'){
          saleReturnSlipDataSource.value.addSaleReturn(params).then(res => {
            if (res.code === 200){
              ElMessage.success('创建退货单成功！')
              dialogController.createSaleOrder = false
              initData()
            } else {
              ElMessage.error(res)
            }
          })
        }
      }
    })
  }
}

watch(() => dialogController.selectSaleOrder, () => {
  if (dialogController.selectSaleOrder) {if (!saleSlipDataSource.value) saleSlipDataSource.value = new SaleSlipDataSource({
    selectUri: '/saleOrderMain/select',
    pageSize: 10,
    tableHeader: [
      {
        label: "销售单号",
        prop: "saleOrderCode",
        width: 150,
        isShow: true,
        isFixed: false,
        type: 'text'
      }, {
        label: "商家名称",
        prop: "merchantName",
        width: 180,
        isShow: true,
        isFixed: false,
        type: 'text'
      }, {
        label: "客户名称",
        prop: "customerName",
        width: 150,
        isShow: true,
        isFixed: false,
        type: 'text'
      }, {
        label: "客户电话",
        prop: "customerPhone",
        width: 150,
        isShow: true,
        isFixed: false,
        type: 'text'
      }, {
        label: "送货地址",
        prop: "receiptAddress",
        width: 200,
        isShow: true,
        isFixed: false,
        type: 'text'
      }, {
        label: "发货仓库",
        prop: "warehouseName",
        width: 150,
        isShow: true,
        isFixed: false,
        type: 'text'
      }, {
        label: "备注",
        prop: "comment",
        width: 200,
        isShow: true,
        isFixed: false,
        type: 'text'
      }
    ]
  })
  saleSlipDataSource.value.searchData = { processStatus: 'SALE_ORDER_DOC' }
  }
})

onBeforeMount(() => {
  if (!saleReturnSlipDataSource.value) saleReturnSlipDataSource.value = new SaleReturnSlipDataSource({
    modules: 'saleReturn',
    selectUri: '/saleOrdersReturn/select',
    deleteUri: '/saleOrdersReturn/delete',
    selectOneUri: '/saleOrdersReturn/selectOne'
  })
  saleReturnSlipDataSource.value.initTableHeader()
  initData()
})

const deleteRecord = ({ id, processStatus }) => {
  if (processStatus !== 'SALE_ORDER_RETURN_PICK_UP'){
    ElMessage.error('该流程下不允许删除退货单')
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
        let params = [id]
        saleReturnSlipDataSource.value.delete(params, proxy.$refs.table).then((res) => {
          if (res === 200){
            ElMessage.success('成功删除1条数据')
            initData()
          } else {
            ElMessage.error(res)
          }
        })
      }
    }
  })
}

const goCompile = ({ id, saleOrderReturnCode }) => {
  router.push({
    path: '/sale/salereturn/slip/newFile',
    query: { id, saleOrderReturnCode }
  })
}

const goPrint = () => {
  if (saleReturnSlipDataSource.value.selections.length < 1) {
    ElMessage.error('请先选择数据')
    return
  }
  let list = saleReturnSlipDataSource.value.selections.map(item => {return item.saleOrderReturnCode})
  sessionStorage.setItem('printSaleReturnData', JSON.stringify(list))
  const routerUrl = router.resolve('/print/salereturn')
  window.open(routerUrl.href, '_blank')
}

const exportExcel = () => {
  if (saleReturnSlipDataSource.value.selections.length < 1) {
    ElMessage.error('请先选择数据')
  } else {
    let list = saleReturnSlipDataSource.value.selections.map(item => item.saleOrderReturnCode)
    let params = list
    let enHeader = [
      "createTime",
      "updateTime",
      'customerName',
      'customerPhone',
      'receiptAddress',
      'pickUpDate',
      'merchantName',
      'province',
      'city',
      'area',
      'street',
      'comment',
      'materialCode',
      'materialSpecification',
      'deliveredNumber',
      'returnNumber',
      'warehouseName'
    ]
    let znHeader = {
      createTime: '制单时间',
      updateTime: '最后修改时间',
      customerName: "客户姓名",
      customerPhone: '客户电话',
      receiptAddress: '收货地址',
      pickUpDate: '取件日期',
      merchantName: '商家名称',
      province: '省',
      city: '市',
      area: '区',
      street: '街道',
      comment: '备注',
      materialCode: '物料代码',
      materialSpecification: '规格型号',
      deliveredNumber: '实际送货数量',
      returnNumber: '退货数量',
      warehouseName: '发货仓'
    }
    saleReturnSlipDataSource.value.outSaleOrderReturnAndDetail(params).then(res => {
      if (res.code === 200) {
        let dataTool = new proxy.$DataTool()
        let exportData = []
        res.data.forEach(item => {
          let { createTime, updateTime, customerName,
            customerPhone,
            receiptAddress,
            pickUpDate,
            merchantName,
            province,
            city,
            area,
            street,
            comment,
            warehouseName } = item
          createTime = dataTool.timeStamp2Time(createTime, 'yyyy-MM-dd hh:mm:ss')
          updateTime = dataTool.timeStamp2Time(updateTime, 'yyyy-MM-dd hh:mm:ss')
          pickUpDate = dataTool.timeStamp2Time(pickUpDate)
          item.saleOrderReturnDetailList.forEach(mat => {
            let temp = { createTime, updateTime, customerName,
              customerPhone,
              receiptAddress,
              pickUpDate,
              merchantName,
              province,
              city,
              area,
              street,
              comment,
              warehouseName }
            let { materialCode,
              materialSpecification,
              deliveredNumber, returnNumber } = mat
            temp.materialCode = materialCode
            temp.materialSpecification = materialSpecification
            temp.deliveredNumber = deliveredNumber
            temp.returnNumber = returnNumber
            exportData.push(temp)
          })
        })
        console.log(exportData)
        dataTool.exportExcel(znHeader, enHeader, exportData, '销售退货单')
      }
    })
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