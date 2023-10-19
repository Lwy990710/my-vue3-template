<template>
  <div>
    <el-dialog
      v-model="showDialog"
      lock-scroll
      top="50px"
      :title="title"
      :close-on-click-modal="false"
      :show-close="false"
      :width="width"
    >
      <template #header="{ titleId, titleClass }">
        <div class="jx-dialog-header">
          <h4 :id="titleId" :class="titleClass">
            {{ title }}
            <el-button
              class="ml20 handle-btn"
              color="#4a78bd"
              style="color: #666"
              plain
              @click="exportData"
            >
              流水账导出
            </el-button>
            <slot name="customOperation" />
          </h4>
          <el-button
            class="dialog-close-btn"
            type="danger" icon="CloseBold"
            circle
            @click="closeDialog"
          />
        </div>
      </template>
      <div class="dialog-content pb20">
        <el-table
          :data="data"
          class="mt10"
          border
          style="width: 100%"
          :max-height="800"
          :header-cell-style="{ background: '#454c5c', color: '#fff', borderColor: 'rgba(192, 192, 192,.5)' }"
          :row-style="{height: '35px',background:'#fafafa',borderColor:'rgba(192, 192, 192,.5)'}"
        >
          <el-table-column
            v-for="item in header"
            :key="item.prop"
            :prop="item.prop"
            :label="item.label"
            :width="item.width"
            align="center"
            :formatter="forMatData"
            show-overflow-tooltip
          >
            <template #default="{ row ,column }">
              <span
                v-if="column.property==='changeNum'" class="danger"
              >
                {{ row.changeNum }}
              </span>
              <span
                v-if="column.property==='surplusNum'" class="success"
              >
                {{ row.surplusNum }}
              </span>
              <el-tag
                v-if="column.property==='optType'&&row.optType==='MINUS'" class="ml-2"
                type="danger"
              >
                {{ optType[row.optType] }}
              </el-tag>
              <el-tag
                v-if="column.property==='optType'&&row.optType==='PLUS'" class="ml-2"
                type="success"
              >
                {{ optType[row.optType] }}
              </el-tag>
              <el-link
                v-if="column.property==='orderCode'"
                type="primary"
                @click="goPage(row)"
              >
                {{ row.orderCode }}
              </el-link>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { getCurrentInstance, computed } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const { proxy } = getCurrentInstance()
const _props = defineProps({
  isShow: {
    type: Boolean,
    default: false
  },

  // 弹框标题
  title: {
    type: String,
    default: ''
  },

  // 弹框宽度
  width: {
    type: String,
    default: '40%'
  },

  header: {
    type: Array,
    default: () => {
      return []
    }
  },

  data: {
    type: Array,
    default: () => {
      return []
    }
  }
})
const _emits = defineEmits(['closeDialog'])
const closeDialog = () => _emits('closeDialog') // 关闭弹窗事件
const showDialog = computed({
  get(){
    return _props.isShow
  },
  set(){
    //null
  }
}) // 开启弹窗事件

let orderType = {
  OUT_WAREHOUSE_ORDER: "出库单",
  IN_WAREHOUSE_ORDER: "入库单",
  STOCK_POSITION_RESET: "库位调整单",
  PICKING_ORDER: "提货单",
  SALE_ORDER: "销售单",
  SALE_RETURN_ORDER: "销售退货单",
  ALLOCATION_ORDER: "调拨单",
  INVENTORY_ORDER: "盘点单",
  MERCHANT_ALLOCATION_ORDER: '商家调拨单',
  OUT_CHANGE_BARCODE: '出库单更换条码'
}
let optType = {
  PLUS: "+",
  MINUS: "-"
}

const forMatData = (row, column) => {
  if (!row[column.property] && row[column.property] !== 0) {
    return '-'
  } else if (column.property === 'orderType') return orderType[row[column.property]]
  else if (column.property === 'optType') return optType[row[column.property]]
  else if (column.property === 'createTime') return new proxy.$DataTool().timeStamp2Time(row[column.property])
  return row[column.property]
}

const goPage = async ({ orderType, orderCode }) => {
  let ctx = await new proxy.$DataTool().getBaseClassByOrderCode({ orderCode, orderType })
  if (!ctx.data){
    proxy.$message.error('该订单已被删除')
    return
  }
  let routerUrl = ``
  switch (orderType){
  case 'OUT_WAREHOUSE_ORDER': {
    routerUrl = `/inventory/output/newFile?id=${ctx.data.id}&outWarehouseCode=${ctx.data.outWarehouseCode}`
    break
  }
  case 'IN_WAREHOUSE_ORDER': {
    routerUrl = `/inventory/input/newFile?id=${ctx.data.id}&inWarehouseCode=${ctx.data.inWarehouseCode}`
    break
  }
  case 'STOCK_POSITION_RESET': {
    routerUrl = `/inventory/adjust?positionResetCode=${orderCode}`
    break
  }
  case 'PICKING_ORDER': {
    routerUrl = `/inventory/pickup/newFile?id=${ctx.data.id}&pickingOrderCode=${ctx.data.pickingOrderCode}`
    break
  }
  case 'SALE_ORDER': {
    routerUrl = `/sale/slip/newFile?id=${ctx.data.id}&saleOrderCode=${ctx.data.saleOrderCode}`
    break
  }
  case 'SALE_RETURN_ORDER': {
    routerUrl = `/sale/salereturn/slip/newFile?id=${ctx.data.id}&saleOrderReturnCode=${ctx.data.saleOrderReturnCode}`
    break
  }
  case 'ALLOCATION_ORDER': {
    routerUrl = `/inventory/allot/allotSlip/newFile?id=${ctx.data.id}&allocationCode=${ctx.data.allocationCode}&allocationType=${ctx.data.allocationType}`
    break
  }
  case 'INVENTORY_ORDER': {
    routerUrl = `/other/new/check?id=${ctx.data.id}&inventorySheetOrderCode=${ctx.data.inventorySheetOrderCode}`
    break
  }
  case 'MERCHANT_ALLOCATION_ORDER': {
    routerUrl = `/sale/newSaleExChange/slip/newFile?id=${ctx.data.id}&shopallottype=${ctx.data.shopallottype}&merchantAllocationOrderCode=${ctx.data.merchantAllocationOrderCode}`
    break
  }
  case 'OUT_CHANGE_BARCODE': {
    routerUrl = `/inventory/output/newFile?id=${ctx.data.id}&outWarehouseCode=${ctx.data.outWarehouseCode}`
    break
  }
  default: {
    proxy.$message.error('暂无此单号明细')
  }
  }
  window.open(router.resolve(routerUrl).href, '_blank')
}

const exportData = () => {
  if (_props.data.length === 0){
    proxy.$message.error('当前数据为空')
    return
  }
  let dataTool = new proxy.$DataTool()
  let orderTypeChange = {
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
  let optTypeChange = {
    PLUS: "+",
    MINUS: "-"
  }
  let data = _props.data.map(item => {
    let { warehouseName, warehousePositionName, orderType, orderCode, changeNum, optType, surplusNum, materialCode, materialName, materialSpecification, materialType, createTime } = item
    orderType = orderTypeChange[orderType]
    optType = optTypeChange[optType]
    createTime = dataTool.timeStamp2Time(createTime)
    return { warehouseName, warehousePositionName, orderType, orderCode, changeNum, optType, surplusNum, materialCode, materialName, materialSpecification, materialType, createTime }
  })
  const enHeader = [
    'warehouseName', 'warehousePositionName', 'orderType', 'orderCode', 'changeNum', 'optType', 'surplusNum', 'materialCode', 'materialName', 'materialSpecification', 'materialType', 'createTime'
  ]
  let znHeader = {
    warehouseName: '所属仓库',
    warehousePositionName: '所属仓位',
    orderType: '操作类型',
    orderCode: '相关单号',
    changeNum: '变动数量',
    optType: '变动类型',
    surplusNum: '结余数量',
    materialCode: '物料代码',
    materialName: '商品名称',
    materialSpecification: '规格型号',
    materialType: '物料类型',
    createTime: '创建时间'
  }
  dataTool.exportExcel(znHeader, enHeader, data, data[0].materialCode + '_物料流水账')
}
</script>

<style scoped lang="less">
:deep(.el-table__body tr:hover > td) {
   background-color: #e2e2e2 !important;
}
</style>