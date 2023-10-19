<template>
  <div class="main">
    <div class="message_area">
      <goBack :back-config="backConfig" />
      <div class="form_area bfc">
        <el-steps
          :active="active"
          align-center
          finish-status="success"
        >
          <el-step title="制单" />
          <el-step title="等待入库" />
          <el-step title="入库中" />
          <el-step title="归档" />
        </el-steps>
        <div class="form_title">
          {{ route.query.id ? formData.title.replace('新增', '编辑') + '  ' + route.query.inWarehouseCode : formData.title }}
        </div>
        <NewFileForm
          ref="formRef"
          v-loading="loading"
          :elements="formData.elements" :disabled="disabled"
          :model="model"
        />
        <div class="btn-grounp">
          <el-button
            type="danger"
            @click="cancel"
          >
            返回
          </el-button>
          <el-button
            v-if="route.query.id && active !== 4"
            type="primary" class="mr20"
            @click="updateBarcodeHead"
          >
            刷新条码头
          </el-button>
          <el-button
            v-if="route.query.id"
            type="success"
            @click="exportExcel"
          >
            扫码明细导出
          </el-button>
          <el-button
            v-if="route.query.id"
            type="warning" class="mr10"
            @click="exportPositionData"
          >
            库位汇总导出
          </el-button>
        </div>
      </div>
      <el-divider
        border-style="dashed"
      />
    </div>
    <div class="saleOrder-table">
      <el-divider content-position="center">
        入库单产品汇总表
      </el-divider>
      <div class="saleOrder-table-data">
        <SimpleTable
          ref="simpleTable"
          :max-height="400"
          :options-width="100"
          :loading="loading"
          :show-tips="false"
          :page-size="iutputOrderDetailSource.pageSize"
          :current-page="iutputOrderDetailSource.currentPage"
          :for-mat-data="iutputOrderDetailSource.forMatData"
          :table-header="iutputOrderDetailSource.tableHeader"
          :table-data="iutputOrderDetailSource.tableData"
          :total="iutputOrderDetailSource.total"
          :need-end-control="false"
          need-change-size
          need-index
          small
          @sizeChange="iutputOrderDetailSource.pageSizeChange($event,iutputOrderDetailSource)"
          @current-change="iutputOrderDetailSource.currentPageChange($event,iutputOrderDetailSource)"
        />
      </div>
    </div>
    <div class="saleOrder-table">
      <el-divider content-position="center">
        入库单物料汇总表
      </el-divider>
      <div class="saleOrder-table-data">
        <SimpleTable
          ref="simpleTable"
          :max-height="400"
          :options-width="100"
          need-summary
          :summary="inputMaterialSummary"
          :loading="loading"
          :show-tips="false"
          :page-size="iutputOrderMaterialDetailSource.pageSize"
          :current-page="iutputOrderMaterialDetailSource.currentPage"
          :for-mat-data="iutputOrderMaterialDetailSource.forMatData"
          :table-header="iutputOrderMaterialDetailSource.tableHeader"
          :table-data="iutputOrderMaterialDetailSource.tableData"
          :total="iutputOrderMaterialDetailSource.total"
          :need-end-control="false"
          need-change-size
          need-index
          small
          @sizeChange="iutputOrderMaterialDetailSource.pageSizeChange($event,iutputOrderMaterialDetailSource)"
          @current-change="iutputOrderMaterialDetailSource.currentPageChange($event,iutputOrderMaterialDetailSource)"
        />
      </div>
    </div>
    <div class="saleOrder-table">
      <el-divider content-position="center">
        库位汇总表
      </el-divider>
      <div class="saleOrder-table-data">
        <SimpleTable
          ref="simpleTable"
          :max-height="400"
          :options-width="100"
          need-summary
          :summary="positionMaterialSummary"
          :loading="loading"
          :show-tips="false"
          :page-size="iutputPositionDetailSource.pageSize"
          :current-page="iutputPositionDetailSource.currentPage"
          :for-mat-data="iutputPositionDetailSource.forMatData"
          :table-header="iutputPositionDetailSource.tableHeader"
          :table-data="iutputPositionDetailSource.tableData"
          :total="iutputPositionDetailSource.total"
          :need-end-control="false"
          need-change-size
          need-index
          small
          @current-change="iutputPositionDetailSource.currentPageChange($event,iutputPositionDetailSource)"
          @sizeChange="iutputPositionDetailSource.pageSizeChange($event,iutputPositionDetailSource)"
        />
      </div>
    </div>
    <div class="saleOrder-table">
      <el-divider content-position="center">
        入库单扫码汇总表
      </el-divider>
      <div class="saleOrder-table-data">
        <SimpleTable
          ref="simpleTable"
          :max-height="500"
          :options-width="100"
          :loading="loading"
          :show-tips="false"
          :page-size="iutputScanDetailSource.pageSize"
          :current-page="iutputScanDetailSource.currentPage"
          :for-mat-data="iutputScanDetailSource.forMatData"
          :table-header="iutputScanDetailSource.tableHeader"
          :table-data="iutputScanDetailSource.tableData"
          :total="iutputScanDetailSource.total"
          :need-end-control="false"
          need-change-size
          need-index
          small
          @current-change="iutputScanDetailSource.currentPageChange($event,iutputScanDetailSource)"
          @sizeChange="iutputScanDetailSource.pageSizeChange($event,iutputScanDetailSource)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import SimpleTable from '@/components/SimpleTable.vue'
import goBack from '@/components/common/goBack.vue'
import NewFileForm from '@/components/NewFileForm.vue'
import { IutputDataSource, loading, IutputOrderDetailSource, IutputOrderMaterialDetailSource, IutputScanDetailSource, IutputPositionDetailSource } from '../../../utils/input/index'
import { onBeforeMount, reactive, ref, getCurrentInstance } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
let { proxy } = getCurrentInstance()
let router = useRouter()
let route = useRoute()
let backConfig = [{ title: '库存管理', path: '' }, { title: '入库单', path: '' }, { title: '新增入库单', path: '' }]
let disabled = ref(false)
let active = ref(0)
let exportData = ref(null)
let exportPosition = ref(null)
let formData = {
  title: '新增入库单',
  elements: [{
    disabled: true,
    label: '调拨类型',
    prop: 'type'
  }, {
    label: '总数量',
    prop: 'totalNumber',
    disabled: true,
    rules: [{
      required: true,
      message: '总数量不能为空',
      trigger: 'blur'
    }]
  }, {
    label: '总体积',
    prop: 'totalVolume',
    disabled: true
  }, {
    label: '备注',
    prop: 'comment',
    type: 'textarea'
  }]
}
let model = reactive({})
let formRef = ref(null)
const iutputDataSource = ref(null)
const iutputOrderDetailSource = ref(null)
const iutputOrderMaterialDetailSource = ref(null)
const iutputScanDetailSource = ref(null)
const iutputPositionDetailSource = ref(null)

const save = async () => {
  await formRef.value.ruleFormRef.validate((valid, fields) => {
    if (valid) {
      if (route.query.id) model.id = route.query.id
      let params = {
        list: [model]
      }
      console.log('success submit!', params)
    } else {
      console.log('error submit!', fields)
    }
  })
}
onBeforeMount(() => {
  initDataSource()
  initData()
})

const initDataSource = () => {
  if (!iutputDataSource.value) iutputDataSource.value = new IutputDataSource({
    selectOneUri: `/inWarehouseOrderMain/selectOne`
  })
  if (!iutputOrderDetailSource.value) iutputOrderDetailSource.value = new IutputOrderDetailSource({
    selectUri: `/inWarehouseOrderDetail/select`,
    pageSize: 20,
    tableHeader: [
      {
        label: '入库单号',
        prop: 'inWarehouseCode',
        width: 150
      }, {
        label: '套机码 / 单机码',
        prop: 'materialCode',
        width: 150
      }, {
        label: '商品名称',
        prop: 'materialName',
        width: 150
      }, {
        label: '规格型号',
        prop: 'materialSpecification',
        width: 200
      }, {
        label: '类型',
        prop: 'materialType',
        width: 150
      }, {
        label: '数量',
        prop: 'number',
        width: 100
      }, {
        label: '体积',
        prop: 'volume',
        width: 100
      }, {
        label: '总体积',
        prop: 'totalVolume',
        width: 150
      }, {
        label: '备注',
        prop: 'comment',
        width: 150
      }
    ]
  })
  iutputOrderDetailSource.value.searchData = { inWarehouseCode: route.query.inWarehouseCode }
  if (!iutputOrderMaterialDetailSource.value) iutputOrderMaterialDetailSource.value = new IutputOrderMaterialDetailSource({
    selectUri: `/inWarehouseOrderMaterialDetail/select`,
    pageSize: 20,
    tableHeader: [
      {
        label: '入库单号',
        prop: 'inWarehouseCode',
        width: 150
      }, {
        label: '条码头',
        prop: 'barCodeHead',
        width: 150
      }, {
        label: '物料代码',
        prop: 'materialCode',
        width: 150
      }, {
        label: '规格型号',
        prop: 'materialSpecification',
        width: 150
      }, {
        label: '物料类型',
        prop: 'materialType',
        width: 150
      }, {
        label: '应入库数量',
        prop: 'shouldInNumber',
        width: 150
      }, {
        label: '未入库数量',
        prop: 'noInNumber',
        width: 150
      }, {
        label: '已入库数量',
        prop: 'haveInNumber',
        width: 150
      }, {
        label: '体积',
        prop: 'volume',
        width: 100
      }, {
        label: '总体积',
        prop: 'totalVolume',
        width: 150
      }
    ]
  })
  iutputOrderMaterialDetailSource.value.searchData = { inWarehouseCode: route.query.inWarehouseCode }
  if (!iutputScanDetailSource.value) iutputScanDetailSource.value = new IutputScanDetailSource({
    selectUri: `/inWarehouseOrderScanDetail/select`,
    pageSize: 20,
    tableHeader: [
      {
        label: '入库单号',
        prop: 'inWarehouseCode',
        width: 150
      }, {
        label: '条码',
        prop: 'barCode',
        width: 150
      }, {
        label: '物料代码',
        prop: 'materialCode',
        width: 150
      }, {
        label: '规格型号',
        prop: 'materialSpecification',
        width: 150
      }, {
        label: '物料类型',
        prop: 'materialType',
        width: 150
      }, {
        label: '产品质量',
        prop: 'materialStatus',
        width: 150
      }, {
        label: '仓库名称',
        prop: 'warehouseName',
        width: 150
      }, {
        label: '仓位名称',
        prop: 'warehousePositionName',
        width: 150
      }, {
        label: '扫码时间',
        prop: 'scanTime',
        width: 150
      }
    ]
  })
  iutputScanDetailSource.value.searchData = { inWarehouseCode: route.query.inWarehouseCode }
  if (!iutputPositionDetailSource.value) iutputPositionDetailSource.value = new IutputPositionDetailSource({
    selectUri: `/inWarehouseOrderPositionDetail/select`,
    pageSize: 20,
    tableHeader: [
      {
        label: '入库单号',
        prop: 'inWarehouseCode',
        width: 150
      },
      {
        label: '物料代码',
        prop: 'materialCode',
        width: 150
      }, {
        label: '规格型号',
        prop: 'materialSpecification',
        width: 150
      }, {
        label: '物料类型',
        prop: 'materialType',
        width: 150
      }, {
        label: '仓库名称',
        prop: 'warehouseName',
        width: 150
      }, {
        label: '仓位编码',
        prop: 'warehousePositionCode',
        width: 150
      }, {
        label: '仓位名称',
        prop: 'warehousePositionName',
        width: 150
      }, {
        label: '入库数量',
        prop: 'number',
        width: 150
      }
    ]
  })
  iutputPositionDetailSource.value.searchData = { inWarehouseCode: route.query.inWarehouseCode }
}

let typeObjext = {
  ALLOCATION: '调拨入库',
  SALE_RETURN: '销售订单退货'
}
const initData = () => {
  iutputDataSource.value.selectOne(route.query.id).then(res => {
    Object.assign(model, res)
    active.value = ['IN_WAREHOUSE_ORDER_CREATE', 'IN_WAREHOUSE_ORDER_WF', 'IN_WAREHOUSE_ORDER_ING', 'IN_WAREHOUSE_ORDER_DOC'].indexOf(model.processStatus) + 1
    model.type = typeObjext[model.type]
    if (model.type === '调拨入库'){
      iutputOrderDetailSource.value.tableHeader.unshift({
        label: '调拨单号',
        prop: 'allocationCode',
        width: 150
      })
    } else {
      iutputOrderDetailSource.value.tableHeader.unshift({
        label: '退货单号',
        prop: 'saleOrderReturnCode',
        width: 150
      })
    }
    Promise.all([iutputOrderDetailSource.value.initData(),
      iutputOrderMaterialDetailSource.value.initData(),
      iutputScanDetailSource.value.initData(),
      iutputPositionDetailSource.value.initData()])
  })
}
const cancel = () => {
  router.go(-1)
}
let inputMaterialSummary = (param) => {
  const { columns, data } = param
  const sums = []
  sums[5] = '合计'
  sums[6] = 0
  sums[7] = 0
  sums[8] = 0
  data.forEach(item => {
    sums[6] += item.shouldInNumber
    sums[7] += item.noInNumber
    sums[8] += item.haveInNumber
  })
  return sums
}
let positionMaterialSummary = (param) => {
  const { columns, data } = param
  const sums = []
  sums[7] = '合计'
  sums[8] = 0
  data.forEach(item => {
    sums[8] += item.number
  })
  return sums
}

let exportExcel = async () => {
  if (!exportData.value) {
    exportData.value = new IutputScanDetailSource({
      selectUri: `/inWarehouseOrderScanDetail/select`,
      pageSize: 100000,
      tableHeader: [
        {
          label: '入库单号',
          prop: 'inWarehouseCode',
          width: 150
        }, {
          label: '条码',
          prop: 'barCode',
          width: 150
        }, {
          label: '物料代码',
          prop: 'materialCode',
          width: 150
        }, {
          label: '规格型号',
          prop: 'materialSpecification',
          width: 150
        }, {
          label: '物料类型',
          prop: 'materialType',
          width: 150
        }, {
          label: '仓库名称',
          prop: 'warehouseName',
          width: 150
        }, {
          label: '仓位名称',
          prop: 'warehousePositionName',
          width: 150
        }, {
          label: '扫码时间',
          prop: 'scanTime',
          width: 150
        }
      ]
    })
  }
  exportData.value.searchData = { inWarehouseCode: route.query.inWarehouseCode }
  await exportData.value.initData()
  let data = exportData.value.tableData.map(item => {
    let { inWarehouseCode, barCode, materialCode, materialSpecification, materialType, warehouseName, warehousePositionName } = item
    return { inWarehouseCode, barCode, materialCode, materialSpecification, materialType, warehouseName, warehousePositionName }
  })
  let znHeader = {
    inWarehouseCode: '入库单号',
    barCode: '条码',
    materialCode: '物料代码',
    materialSpecification: '规格型号',
    materialType: '物料类型',
    warehouseName: '仓库名称',
    warehousePositionName: '仓位名称'
  }
  let enHeader = [
    'inWarehouseCode', 'barCode', 'materialCode', 'materialSpecification', 'materialType', 'warehouseName', 'warehousePositionCode'
  ]
  let datatool = new proxy.$DataTool()
  datatool.exportExcel(znHeader, enHeader, data, `${route.query.inWarehouseCode}扫码明细`)
}

let exportPositionData = async () => {
  if (!exportPosition.value) {
    exportPosition.value = new IutputPositionDetailSource({
      selectUri: `/inWarehouseOrderPositionDetail/select`,
      pageSize: 100000,
      tableHeader: [
        {
          label: '入库单号',
          prop: 'inWarehouseCode',
          width: 150
        },
        {
          label: '物料代码',
          prop: 'materialCode',
          width: 150
        }, {
          label: '规格型号',
          prop: 'materialSpecification',
          width: 150
        }, {
          label: '物料类型',
          prop: 'materialType',
          width: 150
        }, {
          label: '仓库名称',
          prop: 'warehouseName',
          width: 150
        }, {
          label: '仓位编码',
          prop: 'warehousePositionCode',
          width: 150
        }, {
          label: '仓位名称',
          prop: 'warehousePositionName',
          width: 150
        }, {
          label: '入库数量',
          prop: 'number',
          width: 150
        }
      ]
    })
  }
  exportPosition.value.searchData = { inWarehouseCode: route.query.inWarehouseCode }
  await exportPosition.value.initData()
  let exportData = exportPosition.value.tableData.map(item => {
    let { inWarehouseCode, materialCode, materialSpecification, materialType, warehouseName, warehousePositionCode, warehousePositionName, number } = item
    return { inWarehouseCode, materialCode, materialSpecification, materialType, warehouseName, warehousePositionCode, warehousePositionName, number }
  })
  let enHeader = [
    'inWarehouseCode', 'materialCode', 'materialSpecification', 'materialType', 'warehouseName', 'warehousePositionCode', 'number'
  ]
  let znHeader = {
    inWarehouseCode: '入库单号',
    materialCode: '物料代码',
    materialSpecification: '规格型号',
    materialType: '物料类型',
    warehouseName: '仓库名称',
    warehousePositionCode: '仓位编码',
    warehousePositionName: '仓位名称',
    number: '入库数量'
  }
  let datatool = new proxy.$DataTool()
  datatool.exportExcel(znHeader, enHeader, exportData, `${route.query.inWarehouseCode}库位汇总`)
}

const updateBarcodeHead = () => {
  let params = { inWarehouseCode: route.query.inWarehouseCode }
  iutputDataSource.value.updateInputBarcodeHead(params).then(res => {
    if (res.code === 200) {
      ElMessage.success('条码头更新成功')
      initData()
    } else {
      ElMessage.error(res.message)
    }
  })
}
</script>

<style scoped lang="less">
.saleOrder-table{
  border-radius: 10px;
  margin-top: 20px;
  padding-top: 2px;
  padding-bottom: 30px;
  width: 90%;
  background: #fff;
  &-data{
    width: 96%;
    margin:0 auto;
  }
}
:deep(.el-divider__text){
  font-size: 16px;
  font-weight: 800;
}
.btn-grounp{
  display: flex;
  justify-content: flex-end;
  width: 100%;
}
</style>