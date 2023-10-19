<template>
  <div class="main">
    <div class="data-filter">
      <data-filter
        ref="filter"
        :filter-items="inventoryCheckDataSource.tableHeader"
        @search="inventoryCheckDataSource.search($event,inventoryCheckDataSource,proxy.$refs.table)"
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
          导出excel
        </el-button>
        <el-button
          class="handle-btn"
          color="#4a78bd"
          style="color: #666"
          plain
          @click="exportMonthExcel"
        >
          按截止月份导出结余
        </el-button>
        <span style="display:inline-block;margin-left:20px;font-size:12px;color:red">
          Tips: 按住shift + 鼠标滚轮可以横向滚动表格 && 按住 Ctrl + 鼠标左键快捷选择
        </span>
      </div>
      <div class="extend-handle-right" />
    </div>
    <v-table
      ref="table"
      need-check-box
      need-end-handle
      load-prompt="获取库存需要点时间,请耐心等待......"
      :customize-end-handle="customizeEndHandle"
      :default-end-handle="false"
      :total="inventoryCheckDataSource.total"
      :current-page="inventoryCheckDataSource.currentPage"
      :page-size="inventoryCheckDataSource.pageSize"
      :table-data="inventoryCheckDataSource.tableData"
      :columns="inventoryCheckDataSource.tableHeader"
      :for-mat-data="inventoryCheckDataSource.forMatData"
      :loading="loading"
      @selectionChange="inventoryCheckDataSource.selectionChange($event,inventoryCheckDataSource,proxy.$refs.table)"
      @refresh="initData"
      @current-change="inventoryCheckDataSource.currentPageChange($event,inventoryCheckDataSource,proxy.$refs.table)"
      @sizeChange="inventoryCheckDataSource.pageSizeChange($event,inventoryCheckDataSource,proxy.$refs.table)"
    />
    <el-dialog
      v-model="flowDialog" center
      :show-close="false"
      width="80%"
    >
      <template #header>
        <div class="jx-dialog-header">
          <div>
            <span class="mr20">{{ `流水明细： 物料代码${materialCode}` }}</span>
            <el-button
              type="primary" plain
              @click="exportFlowExcel"
            >
              导出明细
            </el-button>
          </div>
          <el-button
            class="dialog-close-btn"
            type="danger" icon="CloseBold"
            circle
            @click="(flowDialog=false)"
          />
        </div>
      </template>
      <div>
        <SimpleTable
          :show-tips="false" :loading="loading"
          :table-header="flowTableHeader" :table-data="tableData" :need-page="false"
        >
          <template #orderType="params">
            {{ orderType[params.row.orderType] }}
          </template>
          <template #orderCode="params">
            <el-button
              text type="primary" style="background: transparent"
              @click="flowDetails(params.row)"
            >
              {{ params.row.orderCode }}
            </el-button>
          </template>
          <template #changeNum="params">
            <div style="font-weight: bold;color: #e6a23c">
              {{ params.row.changeNum }}
            </div>
          </template>
          <template #optType="params">
            <el-tag style="font-weight: bold" :type="params.row.optType === 'MINUS' ? 'danger' : 'primary'">
              {{ optType[params.row.optType] }}
            </el-tag>
          </template>
          <template #surplusNum="params">
            <div style="font-weight: bold;color:#67c23a">
              {{ params.row.surplusNum }}
            </div>
          </template>
          <template #materialStatus="params">
            <div>
              {{ status[params.row.materialStatus] }}
            </div>
          </template>
          <template #createTime="params">
            <div>
              {{ changeTime(params.row.createTime) }}
            </div>
          </template>
        </SimpleTable>
      </div>
    </el-dialog>
    <el-dialog
      v-model="monthDialog" title="选择月份" center
      width="40%" show-close
    >
      <div style="width:200px;margin: 0 auto">
        <el-date-picker
          v-model="exportMonth"
          value-format="YYYY-M"
          type="month"
          placeholder="选择要导出的月份"
        />
      </div>
      <template #footer>
        <el-button type="primary" @click="exportMonthMaterial">
          确定
        </el-button>
        <el-button @click="monthDialog = false">
          取消
        </el-button>
      </template>
    </el-dialog>
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
          :is-show-edit-table-header="isShowEditTableHeader" :modules="'user'"
          @updateCompleted="updateHeaderCompleted"
        />
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import VTable from '@/components/public/virtualTable.vue'
import SimpleTable from '@/components/SimpleTable.vue'
import dataFilter from '@/components/common/dataFilter.vue'
import dynamicHeader from '@/components/common/dynamicHeader.vue'
import { onBeforeMount, ref, getCurrentInstance, h, reactive } from 'vue'
import { InventoryCheckDataSource, loading } from '../../utils/inventoryCheck/index'
import { ElMessage, ElButton } from 'element-plus'
import { changeTime } from '../../public/jxRequest'
import router from '@/applications/warehouse/router'
const { proxy } = getCurrentInstance()
const exportMonth = ref('')
const monthDialog = ref(false)
let inventoryCheckDataSource = ref(null)
const isShowEditTableHeader = ref(false)
let flowDialog = ref(false)
let materialCode = ref(false)
let tableData = reactive([])
let optType = { MINUS: '减少', PLUS: '增加' }
let slipTypeArr = {
  OUT_WAREHOUSE_ORDER: { path: '/inventory/output/newFile', key: 'outWarehouseCode' },
  IN_WAREHOUSE_ORDER: { path: '/inventory/input/newFile', key: 'inWarehouseCode' },
  STOCK_POSITION_RESET: { path: '/inventory/adjust', key: 'materialCode' },
  PICKING_ORDER: { path: '/inventory/pickup/newFile', key: 'pickingOrderCode' },
  SALE_ORDER: { path: '/sale/slip/newFile', key: 'saleOrderCode' },
  MERCHANT_ALLOCATION_ORDER: { path: '/sale/newSaleExChange/slip/newFile', key: 'merchantAllocationOrderCode' },
  SALE_RETURN_ORDER: { path: '/sale/salereturn/slip', key: 'saleOrderReturnCode' },
  ALLOCATION_ORDER: { path: '/inventory/allot/allotSlip/newFile', key: 'allocationCode' },
  INVENTORY_ORDER: { path: '/other/new/check', key: 'inventorySheetOrderCode' },
  OUT_CHANGE_BARCODE: { path: '/inventory/output/newFile', key: 'outWarehouseCode' }
}
let orderType = {
  OUT_WAREHOUSE_ORDER: "出库单",
  IN_WAREHOUSE_ORDER: "入库单",
  STOCK_POSITION_RESET: "库位调整单",
  PICKING_ORDER: "提货单",
  SALE_ORDER: "销售单",
  SALE_RETURN_ORDER: "销售退货单",
  ALLOCATION_ORDER: "调拨单",
  INVENTORY_ORDER: "盘点单",
  MERCHANT_ALLOCATION_ORDER: '商家调拨单'
}
let status = {
  GOOD: '良品',
  BAD: '不良品'
}
let flowTableHeader = reactive([
  {
    label: '商家名称',
    prop: 'merchantName'
  }, {
    label: '操作类型',
    prop: 'orderType',
    needScope: true
  }, {
    label: '相关单号',
    prop: 'orderCode',
    needScope: true,
    width: 250
  }, {
    label: '变动数量',
    prop: 'changeNum',
    needScope: true
  }, {
    label: '变动类型',
    prop: 'optType',
    needScope: true
  }, {
    label: '结余数量',
    prop: 'surplusNum',
    needScope: true
  }, {
    label: '状态',
    prop: 'materialStatus',
    needScope: true
  }, {
    label: '规格型号',
    prop: 'materialSpecification'
  }, {
    label: '创建时间',
    prop: 'createTime',
    needScope: true,
    width: 300
  }
])
const updateHeaderCompleted = () => {
  isShowEditTableHeader.value = false
}

onBeforeMount(() => {
  if (!inventoryCheckDataSource.value) inventoryCheckDataSource.value = new InventoryCheckDataSource({
    tableHeader: [
      {
        title: "商家名称",
        dataKey: "merchantName",
        key: "merchantName",
        width: 200,
        type: 'text',
        isShow: true,
        isFixed: true
      }, {
        title: "物料代码 / 套机码",
        dataKey: "materialCode",
        key: "materialCode",
        width: 200,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        title: "商品名称",
        dataKey: "materialName",
        key: "materialName",
        width: 300,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        title: "规格型号",
        dataKey: "materialSpecification",
        key: "materialSpecification",
        width: 300,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        label: '产品质量',
        prop: 'materialStatus',
        width: 120,
        type: 'select',
        options: [{
          label: '良品',
          value: 'GOOD'
        }, {
          label: '不良品',
          value: 'BAD'
        }],
        isShow: true,
        isFixed: false
      }, {
        title: "产品类型",
        dataKey: "materialType",
        key: "materialType",
        width: 200,
        type: 'select',
        options: [{
          label: '套机',
          value: '套机'
        }, {
          label: '单机',
          value: '单机'
        }, {
          label: '内机',
          value: '内机'
        }, {
          label: '外机',
          value: '外机'
        }],
        isShow: true,
        isFixed: false
      }, {
        title: "现有量",
        dataKey: "nowNumber",
        key: "nowNumber",
        width: 200,
        type: 'none',
        isShow: true,
        isFixed: false
      }, {
        title: "冻结量",
        dataKey: "frozenNumber",
        key: "frozenNumber",
        width: 200,
        type: 'none',
        isShow: true,
        isFixed: false
      }
    ],
    selectUri: '/stockMerchant/select',
    deleteUri: '/',
    selectOneUri: '/'
  })
  inventoryCheckDataSource.value.forMatData = (key, value) => {
    let materialStatus = {
      GOOD: "良品",
      BAD: "不良品"
    }
    switch (key){
    case 'materialStatus': {
      return materialStatus[value]
    }
    default: {
      if (key.toLowerCase().indexOf('time') !== -1){
        return new DataTool().timeStamp2Time(value, 'yyyy-MM-dd hh:mm:ss')
      } else return value ? value : '-'
    }
    }
  }
  initData()
})

const initData = () => {
  inventoryCheckDataSource.value.initData()
}

const exportExcel = () => {
  let { selections } = inventoryCheckDataSource.value
  if (selections.length === 0) {
    ElMessage.error('请选择数据')
    return
  } else {
    let data = selections.map(item => {
      let { merchantName, materialName, materialCode, materialSpecification, materialType, nowNumber, frozenNumber, safeNumber, excessNumber } = item
      return {
        merchantName, materialName, materialCode, materialSpecification, materialType, nowNumber, frozenNumber, safeNumber, excessNumber
      }
    })
    const enHeader = [
      'merchantName', 'materialName', 'materialCode', 'materialSpecification', 'materialType', 'nowNumber', 'frozenNumber', 'safeNumber', 'excessNumber'
    ]
    let znHeader = {
      merchantName: '仓库名称',
      materialName: '商品名称',
      materialCode: '物料代码 / 套机码',
      materialSpecification: '规格型号',
      materialType: '产品类型',
      nowNumber: '现有数量',
      frozenNumber: '冻结量',
      safeNumber: '安全库存',
      excessNumber: '库存上限'
    }
    new proxy.$DataTool().exportExcel(znHeader, enHeader, data, '商家库存')
  }
}

const customizeEndHandle = (rowData) => {
  return [h('div', { class: 'table-handel-div' }, [h(
    ElButton,
    { onClick: () => { checkDetails(rowData) }, type: "primary", icon: "Tickets", text: true, style: 'padding:0;margin:0;background:transparent' },
    { default: () => "查看流水" }
  )])]
}

const checkDetails = (row) => {
  let params = { merchantCode: row.merchantCode, materialCode: row.materialCode, materialStatus: row.materialStatus }
  inventoryCheckDataSource.value.checkFlow(params).then(res => {
    if (res.code === 200) {
      tableData.length = 0
      tableData.push(...res.data)
    } else {
      ElMessage.error(res)
    }
  })
  flowDialog.value = true
  materialCode.value = row.materialCode
}

const flowDetails = async (row) => {
  let params = { orderType: row.orderType, orderCode: row.orderCode }
  let res = await new proxy.$DataTool().getBaseClassByOrderCode(params)
  if (!res.data){
    proxy.$message.error('该订单已被删除')
    return
  }
  if (row.orderType === 'STOCK_POSITION_RESET') {
    let routerUrl = `/inventory/adjust?materialCode=${row.materialCode}`
    window.open(router.resolve(routerUrl).href, '_blank')
  } else if (row.orderType === 'MERCHANT_ALLOCATION_ORDER') {
    let routerUrl = `${slipTypeArr[row.orderType].path}?id=${res.data.id}&${slipTypeArr[row.orderType].key}=${row.orderCode}&shopallottype=${res.data.shopallottype}`
    window.open(router.resolve(routerUrl).href, '_blank')
  } else {
    let routerUrl = `${slipTypeArr[row.orderType].path}?id=${res.data.id}&${slipTypeArr[row.orderType].key}=${row.orderCode}`
    window.open(router.resolve(routerUrl).href, '_blank')
  }

}

const exportFlowExcel = () => {
  let exportData = tableData.map(item => {
    let { merchantName, orderType, orderCode, changeNum, optType, surplusNum, materialSpecification } = item
    return { merchantName, orderType, orderCode, changeNum, optType, surplusNum, materialSpecification }
  })
  exportData.forEach(item => {
    item['orderType'] = orderType[item['orderType']]
    item['optType'] = item['optType'] === "PLUS" ? '增加' : '减少'
    item['materialStatus'] = item['materialStatus'] === "GOOD" ? '良品' : '不良品'
  })
  let enHeader = [
    'merchantName', 'orderType', 'orderCode', 'changeNum', 'optType', 'surplusNum', 'materialSpecification'
  ]
  let znHeader = {
    merchantName: '商家名称',
    orderType: '操作类型',
    orderCode: '相关单号',
    changeNum: '变动数量',
    optType: '变动类型',
    surplusNum: '结余数量',
    materialStatus: '状态',
    materialSpecification: '规格型号'
  }
  new proxy.$DataTool().exportExcel(znHeader, enHeader, exportData, '商家库存流水明细')
}

const headerCellStyle = () => {
  return { background: '#454c5c', color: '#fff', borderColor: 'rgba(192, 192, 192,.5)' }
}

const exportMonthExcel = () => {
  monthDialog.value = true
}

const exportMonthMaterial = () => {
  let arr = exportMonth.value.split('-')
  if (arr[1] === '12'){
    arr[1] = '1'
    arr[0] = Number(arr[0]) + 1 + ""
  } else {
    arr[1] = Number(arr[1]) + 1 + ""
  }
  let time = arr[0] + '-' + arr[1] + "-1 00:00:00"
  let { selections } = inventoryCheckDataSource.value
  if (selections.length < 1) {
    ElMessage.error('请先选择数据')
  } else {
    selections.forEach(item => {
      item['endTime'] = Date.parse(time)
    })
    inventoryCheckDataSource.value.exportMaterialMonthExcel(selections).then(res => {
      if (res.code === 200) {
        if (res.data) {
          let list = [...res.data]
          let exportData = list.map(item => {
            let { merchantName, materialCode, surplusNum, materialSpecification } = item
            return { merchantName, materialCode, surplusNum, materialSpecification }
          })
          let enHeader = ['merchantName', 'materialCode', 'surplusNum', 'materialSpecification']
          let znHeader = {
            merchantName: '商家名称',
            materialCode: '物料代码',
            materialSpecification: '规格型号',
            surplusNum: '结余数量'
          }
          new proxy.$DataTool().exportExcel(znHeader, enHeader, exportData, `商家库存截止${exportMonth.value}结余`)
        }
      } else {
        ElMessage.error(res)
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