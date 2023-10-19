<template>
  <div class="main">
    <div class="message_area pb20">
      <goBack :back-config="backConfig" />
      <div class="form_area bfc">
        <el-steps
          :active="active"
          align-center
          finish-status="success"
        >
          <el-step title="制单" />
          <el-step title="等待出库" />
          <el-step title="出库中" />
          <el-step title="归档" />
        </el-steps>
        <div class="form_title">
          {{ route.query.id ? formData.title.replace('新增', '编辑') + '  ' + route.query.outWarehouseCode: formData.title }}
        </div>
        <NewFileForm
          ref="formRef"
          v-loading="outPutLoading&&!dialogController.selectSaleOrder"
          :elements="formData.elements" :disabled="disabled"
          :model="model"
        />
        <div class="btn-grounp">
          <el-button
            v-if="route.query.id"
            class="ml12"
            :loading="outPutLoading"
            type="warning"
            @click="exportPositionData"
          >
            导出库位汇总
          </el-button>
          <el-button
            v-if="route.query.id"
            class="ml12"
            :loading="outPutLoading"
            type="success"
            @click="exportExcel"
          >
            导出扫码明细
          </el-button>
          <el-button
            type="danger"
            @click="cancel"
          >
            取消
          </el-button>
          <el-button
            v-if="!route.query.id&&!outPutLoading"
            type="primary"
            :loading="false"
            @click="save"
          >
            保存
          </el-button>
          <el-button
            v-if="!route.query.id&&route.query.type==='sale'&&!outPutLoading"
            color="#48C776"
            style="color: #FFFFFF"

            @click="selectSaleOrder"
          >
            选择销售订单
          </el-button>
          <el-button
            v-if="!route.query.id&&route.query.type==='allot'&&!outPutLoading"
            color="rgb(6, 54, 142)"
            style="color: #FFFFFF"
            class="mr20"
            @click="selectAllotOrder"
          >
            选择调拨单
          </el-button>
          <el-button
            v-if="!route.query.id&&route.query.type==='setcar'&&!outPutLoading"
            color="rgb(6, 54, 142)"
            style="color: #FFFFFF"
            class="mr20"
            @click="selectSetCarOrder"
          >
            选择派车单
          </el-button>
        </div>
        <!--         <el-dialog
          v-model="selectSetCar" center title="选择派车单" width="70%"
        >
          <div>
            <div>
              <el-input
                v-model="setCarSearchData.transportCode" placeholder="输入派车单号"
                style="width:20%;margin: 10px 15px;"
              >
                <template #append>
                  <el-button @click="getSetCar">
                    <el-icon><Search /></el-icon>
                  </el-button>
                </template>
              </el-input>
              <el-input
                v-model="setCarSearchData.carrierName" placeholder="输入车队名称"
                style="width:20%;margin: 10px 15px;"
              >
                <template #append>
                  <el-button @click="getSetCar">
                    <el-icon><Search /></el-icon>
                  </el-button>
                </template>
              </el-input>
            </div>
          </div>
          <SimpleTable
            ref="disPatchtable"
            :show-tips="true" :loading="setCarloading" :need-page="false" :tips="'Tips：双击某行进行选择'"
            :table-header="setCarDataSource.tableHeader" :table-data="setCarDataSource.tableData"
            @chooseRow="getSetCarKeys"
          />
        </el-dialog> -->
      </div>
    </div>
    <div class="saleOrder-table">
      <el-divider content-position="center">
        出库单产品汇总表
      </el-divider>
      <div class="saleOrder-table-data">
        <SimpleTable
          ref="simpleTable"
          :max-height="400"
          :options-width="100"
          :loading="outPutLoading &&! dialogController.selectSaleOrder"
          :show-tips="false"
          :for-mat-data="forMatData"
          :table-header="saleOrderDetailHeader"
          :table-data="saleOrderData"
          :total="saleOrderData.length"
          :need-end-control="false"
          need-index
          small
        />
      </div>
    </div>
    <div v-if="route.query.id" class="saleOrder-table">
      <el-divider content-position="center">
        出库单物料汇总表
      </el-divider>
      <div class="saleOrder-table-data">
        <SimpleTable
          ref="simpleTable"
          need-summary
          :summary="outputMaterialSummary"
          :max-height="400"
          :options-width="100"
          :loading="outPutLoading&&!dialogController.selectSaleOrder"
          :for-mat-data="forMatData"
          :show-tips="false"
          :table-header="saleOrderMaterialHeader"
          :table-data="materialData"
          :total="materialData.length"
          :need-end-control="false"
          need-index
          :page-size="materialData.length"
          small
          @cellDbClick="clickCell"
        >
          <template #extraHandle>
            <div class="extend-handle">
              <div class="extend-handle-left">
                <el-button
                  v-if="active < 4 "
                  class="handle-btn mr10"
                  color="#4a78bd"
                  style="color: #666" plain :loading="outPutLoading"
                  @click="handleOutput"
                >
                  手动出库
                </el-button>
                <span v-if="active < 4 " style="display:inline-block;margin-left:20px;font-size:14px;color:red">
                  {{ `Tips: 商品类别为${ingoreType}的物料可以双击本次出库数量编辑数量后点击按钮手动出库` }}
                </span>
              </div>
            </div>
          </template>
          <template #isOutNumber="scope">
            <div v-if="scope.row.isOutNumberEdit">
              <el-input-number
                ref="numberInput"
                v-model="scope.row.isOutNumber" :min="1" :max="maxHaveOutNumber" :controls="false"
                @blur="cancelEidt(scope.row,'isOutNumber')"
              />
            </div>
            <div v-else>
              {{ scope.row.isOutNumber }}
            </div>
          </template>
        </SimpleTable>
      </div>
    </div>
    <div v-if="route.query.id" class="saleOrder-table">
      <el-divider content-position="center">
        出库单库位明细汇总表
      </el-divider>
      <div class="saleOrder-table-data">
        <SimpleTable
          ref="simpleTable"
          need-summary
          :summary="positionMaterialSummary"
          :max-height="400"
          :options-width="100"
          :loading="outPutLoading&&!dialogController.selectSaleOrder"
          :show-tips="false"
          :page-size="outputDetailSourcePosition.pageSize"
          :current-page="outputDetailSourcePosition.currentPage"
          :table-header="outputDetailSourcePosition.tableHeader"
          :for-mat-data="forMatData"
          :table-data="outputDetailSourcePosition.tableData"
          :total="outputDetailSourcePosition.total"
          :need-end-control="false"
          need-index
          need-change-size
          small
          @current-change="outputDetailSourcePosition.currentPageChange($event,outputDetailSourcePosition)"
          @sizeChange="outputDetailSourcePosition.pageSizeChange($event,outputDetailSourcePosition)"
        />
      </div>
    </div>
    <div v-if="route.query.id" class="saleOrder-table">
      <el-divider content-position="center">
        出库单扫码明细汇总表
      </el-divider>
      <div class="saleOrder-table-data">
        <SimpleTable
          ref="simpleTable"
          :max-height="500"
          :options-width="100"
          :loading="outPutLoading&&!dialogController.selectSaleOrder"
          :show-tips="false"
          :page-size="outputDetailSourceScan.pageSize"
          :current-page="outputDetailSourceScan.currentPage"
          :table-header="outputDetailSourceScan.tableHeader"
          :for-mat-data="forMatData"
          :table-data="outputDetailSourceScan.tableData"
          :total="outputDetailSourceScan.total"
          :need-end-control="false"
          need-index
          need-change-size
          small
          @current-change="outputDetailSourceScan.currentPageChange($event,outputDetailSourceScan)"
          @sizeChange="outputDetailSourceScan.pageSizeChange($event,outputDetailSourceScan)"
        />
      </div>
    </div>
    <selectDialogTable
      ref="saleOrderDialog"
      :width="'70%'"
      :is-show="dialogController.selectSaleOrder"
      :data-source="saleSlipDataSource"
      :title="'选择销售订单'"
      :is-show-search-input="true"
      :search-input-placeholder="'请输入销售单号'"
      :loading="saleOrderLoading"
      :need-end-control="false"
      need-change-size
      need-selection
      @doDialogSearch="doDialogSearchSaleOrder"
      @close-dialog="dialogController.selectSaleOrder=false"
      @submit="chooseSaleOrderDone"
    >
      <template #customOperation>
        <div class="inline-block" style="display: flex;">
          <el-date-picker
            v-model="matRange"
            class="container_common_formArea-input ml10 mr10"
            type="daterange"
            range-separator="至"
            start-placeholder="留料时间"
            end-placeholder="留料时间"
            unlink-panels
            :default-time="defaultTime"
            value-format="YYYY/MM/DD"
          />
          <el-button type="primary" @click="doSearch">
            查询
          </el-button>
          <el-input
            v-model="branchName"
            clearable
            placeholder="输入网点名称搜索"
            style="width:220px;margin-left:20px"
          >
            <template #append>
              <el-button icon="Search" @click="doSearch" />
            </template>
          </el-input>
        </div>
      </template>
    </selectDialogTable>
    <selectDialogTable
      ref="allotOrderDialog"
      :width="'64%'"
      :is-show="dialogController.selectAllotOrder"
      :data-source="allotSlipDataSource"
      :title="'选择调拨单'"
      :is-show-search-input="true"
      :search-input-placeholder="'请输入调拨单号'"
      :loading="allotOrderLoading"
      :need-end-control="false"
      need-change-size
      need-selection
      @doDialogSearch="doDialogSearchAllotOrder"
      @close-dialog="dialogController.selectAllotOrder=false"
      @submit="chooseAllotOrderDone"
    />
  </div>
</template>

<script setup>
import goBack from '@/components/common/goBack.vue'
import NewFileForm from '@/components/NewFileForm.vue'
import selectDialogTable from '@/components/common/selectDialogTable.vue'
import SimpleTable from '@/components/SimpleTable.vue'
import { onBeforeMount, reactive, ref, getCurrentInstance, toRaw } from 'vue'
import { loading as allotOrderLoading, AllotSlipDataSource } from '@/applications/warehouse/utils/allotSlip/index'
import { loading as saleOrderLoading, SaleSlipDataSource } from '@/applications/warehouse/utils/sale/index'
import { loading as outPutLoading, OutputDataSource, OutputDetailSource } from '@/applications/warehouse/utils/output/index'
import { loading as setCarloading, SetCarDataSource } from '@/applications/warehouse/utils/setcar/index'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { changeTime } from '@/applications/warehouse/public/jxRequest'
let userInfo = reactive(JSON.parse(sessionStorage.getItem('userInfo')))
const { proxy } = getCurrentInstance()
const active = ref(0)
let maxHaveOutNumber = ref(0)
let router = useRouter()
let route = useRoute()
let ingoreType = reactive([])
let backConfig = [{ title: '库存管理', path: '' }, { title: '出库单', path: '' }, { title: '新增出库单', path: '' }]
let disabled = ref(false)
let selectSetCar = ref(false)
let setCarDataSource = ref(null)
let setCarSearchData = reactive({
  warehouseName: userInfo.warehouseName,
  warehouseCode: userInfo.warehouseCode,
  carrierName: '',
  transportCode: '',
  isSecondaryTrans: true,
  isOut: false
})
let formData = {
  title: '新增出库单',
  elements: [{
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
const branchName = ref('')
const defaultTime = new Date(2000, 1, 1, 12, 0, 0)
let model = reactive({})
let formRef = ref(null)
let matRange = ref(null)
const save = async () => {
  await formRef.value.ruleFormRef.validate((valid, fields) => {
    if (valid) {
      ElMessageBox.alert('是否确定制作出库单？', '提示', {
        type: 'warning',
        showCancelButton: true,
        cancelButtonText: '再想想',
        callback: (action) => {
          if (action === 'cancel') return
          let dataTool = new proxy.$DataTool()

          // let params = route.query.type === 'sale' ? dataTool.objectListGetValueByKey(saleOrderData, ['materialCode', 'number', 'saleOrderCode']) :
          //   dataTool.objectListGetValueByKey(saleOrderData, ['materialCode', 'number', 'allocationCode'])
          let params = { list: [{ outWarehouseOrderDetailList: saleOrderData,
            totalNumber: model.totalNumber,
            totalVolume: model.totalVolume,
            comment: model.comment }]

          }
          outputDataSource.value.queryOutWarehouseOrderMaterialDetailsOrSave(params).then(res => {
            if (res.code === 200){
              ElMessage.success('新增成功')
              setTimeout(() => {
                router.go(-1)
              }, 500)
            } else ElMessage.error(res)
          })

        //   outputDataSource.value.getQueryOutWarehouseOrderMaterialDetail(params).then(res => {
        //     if (res.code === 200){
        //       materialData.length = 0
        //       materialData.push(...res.data)
        //       params = {
        //         list: [{
        //           totalNumber: model.totalNumber,
        //           totalVolume: model.totalVolume,
        //           outWarehouseOrderDetailList: toRaw(saleOrderData),
        //           outWarehouseOrderMaterialDetailList: toRaw(materialData)
        //         }]
        //       }
        //       outputDataSource.value.saveBath(params).then(res => {
        //         if (res === 200){
        //           ElMessage.success('新增成功，请点操作栏右边刷新按钮刷新数据')
        //           setTimeout(() => {
        //             router.go(-1)
        //           }, 500)
        //         } else ElMessage.error(res)
        //       })
        //     } else ElMessage.error(res)
        //   })
        }
      })
    } else {
      console.log('error submit!', fields)
    }
  })
}

const dialogController = reactive({
  selectSaleOrder: false,
  selectAllotOrder: false
})

let saleSlipDataSource = ref(null)
let allotSlipDataSource = ref(null)

let outputDataSource = ref(null)
let outputDetailSourcePosition = ref(null)
let outputDetailSourceScan = ref(null)
let exportScanData = ref(null)
let exportPosition = ref(null)
const selectAllotOrder = () => {
  if (!allotSlipDataSource.value) allotSlipDataSource.value = new AllotSlipDataSource({
    selectUri: '/allocationOrderMain/select',
    pageSize: 20,
    tableHeader: [
      {
        label: "调拨单号",
        prop: "allocationCode",
        width: 180
      }, {
        label: "目的仓库名称",
        prop: 'toWarehouseName',
        width: 120
      }, {
        label: "提货仓库名称",
        prop: "pickWarehouseName",
        width: 120
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
      }
    ]
  })
  allotSlipDataSource.value.searchData.processStatus = 'ALLOCATION_ORDER_WF'
  dialogController.selectAllotOrder = true
}

const doDialogSearchAllotOrder = (allocationCode) => {
  let searchData
  if (allocationCode && allocationCode.length !== 0) searchData = { allocationCode: allocationCode.trim(), processStatus: 'ALLOCATION_ORDER_WF' }
  else searchData = { processStatus: 'ALLOCATION_ORDER_WF' }
  proxy.$refs.allotOrderDialog.dialogSearch(searchData)
}

const chooseAllotOrderDone = () => {
  dialogController.selectAllotOrder = false
  let dataTool = new proxy.$DataTool()
  let params = dataTool.objectListGetValueByKey(allotSlipDataSource.value.selections, 'allocationCode')
  outputDataSource.value.getQueryByAllotOrderDetail(params).then(res => {
    let totalNumber = 0
    let totalVolume = 0
    saleOrderData.length = 0
    res.forEach((item) => {
      totalNumber += item.number
      totalVolume += item.number * item.volume
      saleOrderData.push(item)
    })
    model.totalNumber = totalNumber
    model.totalVolume = totalVolume
  })
}

const doDialogSearchSaleOrder = (saleOrderCode) => {
  let searchData
  if (saleOrderCode && saleOrderCode.length !== 0) searchData = { saleOrderCode: saleOrderCode.trim(), processStatus: 'SALE_ORDER_MAT' }
  else searchData = { processStatus: 'SALE_ORDER_MAT' }
  proxy.$refs.saleOrderDialog.dialogSearch(searchData)
}

const selectSaleOrder = () => {
  if (!saleSlipDataSource.value) saleSlipDataSource.value = new SaleSlipDataSource({
    tableHeader: [
      {
        label: "销售单号",
        prop: "saleOrderCode",
        width: 150
      }, {
        label: "留料时间",
        prop: "matDate",
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
        label: "分配网点",
        prop: "branchName",
        width: 150
      }, {
        label: "备注",
        prop: "comment",
        width: 200
      }
    ],
    selectUri: '/saleOrderMain/select',
    pageSize: 20
  })
  saleSlipDataSource.value.searchData.processStatus = 'SALE_ORDER_MAT'
  saleSlipDataSource.value.forMatData = (row, column) => {
    if (column.property === 'matDate'){
      return row[column.property] ? changeTime(row[column.property]) : '-'
    }
    if (!row[column.property]) {
      return '-'
    }
    return row[column.property]
  }
  dialogController.selectSaleOrder = true
}

const chooseSaleOrderDone = () => {
  dialogController.selectSaleOrder = false
  let dataTool = new proxy.$DataTool()
  let params = dataTool.objectListGetValueByKey(saleSlipDataSource.value.selections, 'saleOrderCode')
  outputDataSource.value.getQueryBySaleOrderDetail(params).then(res => {
    let totalNumber = 0
    let totalVolume = 0
    saleOrderData.length = 0
    res.forEach((item) => {
      totalNumber += item.number
      totalVolume += item.number * item.volume
      saleOrderData.push(item)
      console.log(item)
    })
    model.totalNumber = totalNumber
    model.totalVolume = totalVolume
  })
}

const saleOrderDetailHeader = [
  {
    label: "销售单号",
    prop: "saleOrderCode",
    width: 150
  }, {
    label: "调拨单号",
    prop: "allocationCode",
    width: 150
  }, {
    label: '套机码 / 单机码',
    prop: 'materialCode',
    width: 150
  }, {
    label: '规格型号',
    prop: 'materialSpecification',
    width: 200
  }, {
    label: "数量",
    prop: "number",
    width: 80
  }, {
    label: "产品质量",
    prop: "materialStatus",
    width: 150
  }, {
    label: "商家名称",
    prop: "merchantName",
    width: 150
  }, {
    label: "收货人姓名",
    prop: "customerName",
    width: 150
  }, {
    label: "收货人电话",
    prop: "customerPhone",
    width: 150
  }, {
    label: "收货地址",
    prop: "receiptAddress",
    width: 150
  }, {
    label: '备注',
    prop: 'comment',
    width: 150
  }
]

/* const setCarOrderDetailHeader = [
  {
    label: "派车单号",
    prop: "transportCode",
    width: 150
  }, {
    label: '套机码 / 单机码',
    prop: 'materialCode',
    width: 150
  }, {
    label: '规格型号',
    prop: 'materialSpecification',
    width: 200
  }, {
    label: "数量",
    prop: "number",
    width: 80
  }, {
    label: "产品质量",
    prop: "materialStatus",
    width: 150
  }, {
    label: "商家名称",
    prop: "merchantName",
    width: 150
  }, {
    label: "收货人姓名",
    prop: "customerName",
    width: 150
  }, {
    label: "收货人电话",
    prop: "customerPhone",
    width: 150
  }, {
    label: "收货地址",
    prop: "receiptAddress",
    width: 150
  }, {
    label: '备注',
    prop: 'comment',
    width: 150
  }
] */

const saleOrderData = reactive([])

const saleOrderMaterialHeader = [
  {
    label: "销售单号",
    prop: "saleOrderCode",
    width: 150
  }, {
    label: "调拨单号",
    prop: "allocationCode",
    width: 150
  }, {
    label: "商品类别",
    prop: "sort",
    width: 150
  }, {
    label: "物料代码",
    prop: "materialCode",
    width: 150
  }, {
    label: "条码头",
    prop: "barCodeHead",
    width: 150
  }, {
    label: "型号",
    prop: "materialSpecification",
    width: 150
  }, {
    label: "类型",
    prop: "materialType",
    width: 150
  }, {
    label: "产品质量",
    prop: "materialStatus",
    width: 150
  }, {
    label: "未出库数量",
    prop: "noOutNumber",
    width: 150
  }, {
    label: "应出库数量",
    prop: "shouldOutNumber",
    width: 150
  }, {
    label: "已出库数量",
    prop: "haveOutNumber",
    width: 150
  }, {
    label: "本次出库数量",
    prop: "isOutNumber",
    width: 200,
    needScope: true
  }, {
    label: "仓库名称",
    prop: "warehouseName",
    width: 150
  }, {
    label: "仓位",
    prop: "warehousePositionName",
    width: 150
  }
]

const materialData = reactive([])

onBeforeMount(() => {
  if (!outputDataSource.value) outputDataSource.value = new OutputDataSource({
    selectOneUri: '/outWarehouseOrderMain/selectOne'
  })
  initData()
})

const initData = async () => {
  if (!route.query.id) return
  outputDataSource.value.getHandleOutType().then(res => {
    if (res.code === 200) {
      ingoreType.push(...res.data)
    } else {
      ElMessage.error(res)
    }
  })
  if (!outputDetailSourceScan.value) outputDetailSourceScan.value = new OutputDetailSource({
    selectUri: `/outWarehouseOrderScanDetail/select`,
    pageSize: 10,
    tableHeader: [
      {
        label: "物料代码",
        prop: "materialCode",
        width: 150
      }, {
        label: "条码",
        prop: "barCode",
        width: 150
      }, {
        label: "型号",
        prop: "materialSpecification",
        width: 150
      }, {
        label: "类型",
        prop: "materialType",
        width: 150
      }, {
        label: "产品质量",
        prop: "materialStatus",
        width: 150
      }, {
        label: "仓库名称",
        prop: "warehouseName",
        width: 150
      }, {
        label: "仓位",
        prop: "warehousePositionName",
        width: 150
      }
    ]
  })
  if (!outputDetailSourcePosition.value) outputDetailSourcePosition.value = new OutputDetailSource({
    selectUri: `/outWarehouseOrderPositionDetail/select`,
    pageSize: 10,
    tableHeader: [
      {
        label: "物料代码",
        prop: "materialCode",
        width: 150
      }, {
        label: "型号",
        prop: "materialSpecification",
        width: 150
      }, {
        label: "类型",
        prop: "materialType",
        width: 150
      }, {
        label: "数量",
        prop: "number",
        width: 150
      }, {
        label: "产品质量",
        prop: "materialStatus",
        width: 150
      }, {
        label: "仓库名称",
        prop: "warehouseName",
        width: 150
      }, {
        label: "仓位",
        prop: "warehousePositionName",
        width: 150
      }
    ]
  })
  outputDetailSourcePosition.value.searchData = { outWarehouseCode: route.query.outWarehouseCode }
  outputDetailSourceScan.value.searchData = { outWarehouseCode: route.query.outWarehouseCode }
  const ctx = await Promise.all(
    [
      outputDataSource.value.selectOne(route.query.id),
      outputDataSource.value.getOutWarehouseOrderDetail(route.query.outWarehouseCode),
      outputDataSource.value.getOutWarehouseOrderMaterialDetail(route.query.outWarehouseCode),
      outputDetailSourceScan.value.initData(),
      outputDetailSourcePosition.value.initData()
    ]).catch(err => {
    ElMessageBox.alert(err, '警告', {
      type: 'error'
    })
  })
  model.totalNumber = ctx[0].totalNumber
  model.totalVolume = ctx[0].totalVolume
  active.value = ['OUT_WAREHOUSE_ORDER_CREATE', 'OUT_WAREHOUSE_ORDER_WF', 'OUT_WAREHOUSE_ORDER_OUT', 'OUT_WAREHOUSE_ORDER_DOC'].indexOf(ctx[0].processStatus) + 1
  saleOrderData.length = 0
  materialData.length = 0
  saleOrderData.push(...ctx[1])
  materialData.push(...ctx[2])
}

const exportExcel = async () => {
  if (!exportScanData.value) exportScanData.value = new OutputDetailSource({
    selectUri: `/outWarehouseOrderScanDetail/select`,
    pageSize: 100000,
    tableHeader: [
      {
        label: "物料代码",
        prop: "materialCode",
        width: 150
      }, {
        label: "条码",
        prop: "barCode",
        width: 150
      }, {
        label: "型号",
        prop: "materialSpecification",
        width: 150
      }, {
        label: "类型",
        prop: "materialType",
        width: 150
      }, {
        label: "仓库名称",
        prop: "warehouseName",
        width: 150
      }, {
        label: "仓位",
        prop: "warehousePositionName",
        width: 150
      }
    ]
  })
  exportScanData.value.searchData = { outWarehouseCode: route.query.outWarehouseCode }
  await exportScanData.value.initData()
  let exportData = exportScanData.value.tableData.map(item => {
    let { barCode, materialCode, materialSpecification, materialType, warehouseName, warehousePositionName } = item
    return { barCode, materialCode, materialSpecification, materialType, warehouseName, warehousePositionName }
  })
  let enHeader = [
    'barCode', 'materialCode', 'materialSpecification', 'materialType', 'warehouseName', 'warehousePositionName'
  ]
  let znHeader = {
    barCode: '条码',
    materialCode: '套机码',
    materialSpecification: '规格型号',
    materialType: '物料类型',
    warehouseName: '仓库名称',
    warehousePositionName: '仓位名称'
  }
  let datatool = new proxy.$DataTool()
  datatool.exportExcel(znHeader, enHeader, exportData, `${route.query.outWarehouseCode}扫码明细`)
}

const exportPositionData = async () => {
  if (!exportPosition.value) exportPosition.value = new OutputDetailSource({
    selectUri: `/outWarehouseOrderPositionDetail/select`,
    pageSize: 100000,
    tableHeader: [
      {
        label: "物料代码",
        prop: "materialCode",
        width: 150
      }, {
        label: "型号",
        prop: "materialSpecification",
        width: 150
      }, {
        label: "类型",
        prop: "materialType",
        width: 150
      }, {
        label: "数量",
        prop: "number",
        width: 150
      }, {
        label: "仓库名称",
        prop: "warehouseName",
        width: 150
      }, {
        label: "仓位",
        prop: "warehousePositionName",
        width: 150
      }
    ]
  })
  exportPosition.value.searchData = { outWarehouseCode: route.query.outWarehouseCode }
  await exportPosition.value.initData()
  let exportData = exportPosition.value.tableData.map(item => {
    let { materialCode, materialSpecification, materialType, warehouseName, warehousePositionName } = item
    return { materialCode, materialSpecification, materialType, warehouseName, warehousePositionName }
  })
  let enHeader = [
    'materialCode', 'materialSpecification', 'materialType', 'warehouseName', 'warehousePositionName'
  ]
  let znHeader = {
    materialCode: '套机码',
    materialSpecification: '规格型号',
    materialType: '物料类型',
    warehouseName: '仓库名称',
    warehousePositionName: '仓位名称'
  }
  let datatool = new proxy.$DataTool()
  datatool.exportExcel(znHeader, enHeader, exportData, `${route.query.outWarehouseCode}库位汇总`)
}
const cancel = () => {
  router.go(-1)
}

let outputMaterialSummary = (param) => {
  const { columns, data } = param
  const sums = []
  sums[9] = '合计'
  sums[10] = 0
  sums[11] = 0
  sums[12] = 0
  data.forEach(item => {
    sums[10] += item.noOutNumber
    sums[11] += item.shouldOutNumber
    sums[12] += item.haveOutNumber
  })
  return sums
}
let positionMaterialSummary = (param) => {
  const { columns, data } = param
  const sums = []
  sums[3] = '合计'
  sums[4] = 0
  data.forEach(item => {
    sums[4] += item.number
  })
  return sums
}

const forMatData = (row, column) => {
  if (column.property === 'materialStatus'){
    if (!row[column.property] || row[column.property] === 'GOOD') return '良品'
    else return '不良品'
  }
  if (!row[column.property]) {
    return '-'
  }
  return row[column.property]
}

const clickCell = (row, column, cell, event) => {
  if (active.value < 4) {
    if (ingoreType.includes(row['sort'])){
      maxHaveOutNumber.value = row['noOutNumber']
      row['isOutNumberEdit'] = true
    } else {
      ElMessage.error(`只有商品类别是${ingoreType}的商品可以手动出库`)
    }
  } else {
    return
  }

}

const cancelEidt = (row, type) => {
  row[`${type}Edit`] = false
}

const handleOutput = () => {
  materialData.forEach(item => {
    delete item['isOutNumberEdit']
  })
  outputDataSource.value.handleOut(materialData).then(res => {
    if (res.code === 200) {
      ElMessage.success('出库成功')
      initData()
    } else {
      ElMessage.error(res.message)
    }
  })
}

const doSearch = () => {
  let searchData = { processStatus: 'SALE_ORDER_MAT' }
  if (branchName.value && branchName.value.trim().length !== 0){
    searchData.branchName = branchName.value.trim()
  }
  if (matRange.value && matRange.value[0] && matRange.value[1]){
    searchData.matStartTime = Date.parse(matRange.value[0])
    searchData.matEndTime = Date.parse(matRange.value[1])
  }
  proxy.$refs.saleOrderDialog.dialogSearch(searchData)
}

const selectSetCarOrder = () => {
  if (!setCarDataSource.value) {
    setCarDataSource.value = new SetCarDataSource({
      tableHeader: [
        {
          label: "派车编号",
          prop: "transportCode",
          width: 150
        }, {
          label: "承运商名称",
          prop: "carrierName",
          width: 150
        }, {
          label: "司机名称",
          prop: "driverName",
          width: 150
        }, {
          label: "司机电话",
          prop: "driverPhone",
          width: 150
        }, {
          label: "车牌号",
          prop: "licensePlateNumber",
          width: 150
        }, {
          label: "车型",
          prop: "carType",
          width: 150
        }, {
          label: '出库仓库',
          prop: 'warehouseName',
          width: 150
        }
      ]
    })
  }
  getSetCar()
  selectSetCar.value = true
}

const getSetCar = () => {
  Object.keys(setCarSearchData).forEach(key => {
    if (setCarSearchData[key] === '') {
      delete setCarSearchData[key]
    }
  })
  setCarDataSource.value.getSetCarData(setCarSearchData).then(res => {
    if (res.code === 200) {
      setCarDataSource.value.tableData.length = 0
      setCarDataSource.value.tableData.push(...res.data.list)
    } else {
      ElMessage.error(res.message)
    }
  })
}

const getSetCarKeys = (row) => {
  let list = []
  list.push(row.transportCode)
  outputDataSource.value.qveryBytransportcodeDetail(list).then(res => {
    if (res.code === 200) {
      saleOrderData.length = 0
      saleOrderData.push(...res.data)
      model['totalNumber'] = 0
      model['totalVolume'] = 0
      saleOrderData.forEach(item => {
        model['totalNumber'] += item['number']
        model['totalVolume'] += item['totalVolume']
      })
      selectSetCar.value = false
    } else {
      ElMessage.success(res)
    }
  })
}
</script>

<style scoped lang="less">
.saleOrder-table{
  margin-top: 20px;
  padding-top: 2px;
  padding-bottom: 30px;
  width: 90%;
  background: #fff;
  border-radius: 10px;
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
:deep(.el-dialog__title){
  display: flex;
  align-items: center;
}
</style>