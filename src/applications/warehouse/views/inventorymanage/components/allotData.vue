<template>
  <div class="bfc">
    <el-dialog
      v-model="showDialog"
      :title="title"
      :close-on-click-modal="false"
      :show-close="false"
      :width="width"
    >
      <template #header="{ titleId, titleClass }">
        <div class="jx-dialog-header">
          <h4 :id="titleId" :class="titleClass">
            {{ title }}
          </h4>
          <el-button
            class="dialog-close-btn"
            type="danger" icon="CloseBold"
            circle
            @click="closeDialog"
          />
        </div>
      </template>
      <span class="title">调拨物料详情</span>
      <el-table
        :data="data[0].pickingOrderDetailVOList?dataPickUpSlip:data"
        class="mt10"
        border
        style="width: 100%"
        :header-cell-style="{ background: '#454c5c', color: '#fff', borderColor: 'rgba(192, 192, 192,.5)' }"
        :row-style="{height: '35px',background:'#fafafa',borderColor:'rgba(192, 192, 192,.5)'}"
      >
        <el-table-column
          v-for="item in dataHeader"
          :key="item.prop"
          :prop="item.prop"
          :label="item.label"
          :width="item.width"
          align="center"
          :formatter="forMatData"
          show-overflow-tooltip
        >
          <template #default="{ row ,column}">
            <span v-if="column.property === 'isUrgent'" :class=" row.isUrgent === '是'? 'high-show':''"> {{ row.isUrgent?row.isUrgent:'-' }} </span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="!data[0].pickingOrderDetailVOList"
          prop="address" label="输入调拨数量"
          width="150"
        >
          <template #default="{ row }">
            <el-input-number
              v-model="row.number"
              placeholder="调拨数量" :min="1" :max="row.canBeAllocationNumber?row.canBeAllocationNumber:row.nowNumber?row.nowNumber:row.goodsAmount"
              size="small"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="address" label="输入备注"
        >
          <template #default="{ row }">
            <el-input
              v-model="row.comment"
              size="small"
              width="100px" placeholder="输入备注"
              clearable
            />
          </template>
        </el-table-column>
      </el-table>
      <div class="mt10">
        <el-button
          type="primary" class="footer-btn"
          @click="submitForm"
        >
          {{ confirmBtnText }}
        </el-button>
        <el-button
          type="danger" class="footer-btn"
          @click="closeDialog"
        >
          取消
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { onBeforeMount, reactive, ref, getCurrentInstance, watch, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const _props = defineProps({
  // 是否展示弹框
  isShow: {
    type: Boolean,
    default: false
  },

  // 弹框标题
  title: {
    type: String,
    default: ''
  },

  confirmBtnText: {
    type: String,
    default: '确定'
  },

  width: {
    type: String,
    default: '50%'
  },

  data: {
    type: Object,
    default: () => {return []}
  }
})

// 开启弹窗事件
const showDialog = computed({
  get(){
    return _props.isShow
  },
  set(){
    //null
  }
})

const _emits = defineEmits(['closeDialog', 'submitForm'])

const closeDialog = () => _emits('closeDialog') // 关闭弹窗事件

const submitForm = () => {
  if (!_props.data[0].pickingOrderDetailVOList){
    let idx = _props.data.findIndex((item) => !item.number || item.number === 0)
    if (idx !== -1){
      ElMessage.error('调拨的物料数量不可以为0')
      return
    }
  }
  _props.data[0].pickingOrderDetailVOList ? _emits('submitForm', dataPickUpSlip) : _emits('submitForm', _props.data)
}

let dataHeader = reactive([
  {
    label: "是否紧急调拨",
    prop: "isUrgent",
    width: 110,
    isShow: true,
    isFixed: true
  }, {
    label: "套机码",
    prop: "materialCode",
    width: 150,
    type: 'text',
    isShow: true,
    isFixed: false
  }, {
    label: "物料名称",
    prop: "materialName",
    width: 150,
    type: 'text',
    isShow: true,
    isFixed: false
  }, {
    label: "物料型号",
    prop: "materialSpecification",
    width: 200,
    type: 'text',
    isShow: true,
    isFixed: false
  }, {
    label: "物料类型",
    prop: "materialType",
    width: 200,
    type: 'text',
    isShow: true,
    isFixed: false
  }, {
    label: "所属大仓",
    prop: "warehouseName",
    width: 150,
    type: 'text',
    isShow: true,
    isFixed: false
  }
])

const dataPickUpSlip = reactive([])

watch(() => _props.isShow, () => {
  if (_props.data[0].pickingOrderDetailVOList){
    dataPickUpSlip.length = 0
    _props.data.forEach(item => {
      let temp = {
        warehouseName: item.deliverWarehouse,
        warehouseCode: item.deliverWarehouseCode,
        goodsPickingKey: item.goodsPickingKey,
        pickingOrderCode: item.pickingOrderCode
      }
      item.pickingOrderDetailVOList.forEach(mat => {
        temp.machineSetCode = mat.machineSetCode
        temp.specification = mat.specification
        temp.goodsAmount = mat.goodsAmount
        temp.totalVolume = mat.totalVolume
        dataPickUpSlip.push(JSON.parse(JSON.stringify(temp)))
      })
    })
    let headerList = [
      {
        label: "发货单号",
        prop: "pickingOrderCode",
        width: 150
      }, {
        label: "提货密钥",
        prop: "goodsPickingKey",
        width: 150
      }, {
        label: "套机码",
        prop: "machineSetCode",
        width: 150
      }, {
        label: "规格型号",
        prop: "specification",
        width: 200
      }, {
        label: "总数量",
        prop: "goodsAmount",
        width: 150
      }, {
        label: "总体积",
        prop: "totalVolume",
        width: 150
      }, {
        label: "提货仓库",
        prop: "warehouseName",
        width: 150
      }
    ]
    dataHeader.length = 0
    dataHeader.push(...headerList)
  }
})

const forMatData = (row, column) => {
  if (!row[column.property] && row[column.property] !== 0) {
    return '-'
  }
  return row[column.property]
}

// if (!data[0].isUrgent) dataHeader.shift()
</script>

<style lang="less" scoped>
.title{
  font-size: 16px;
  font-weight: 700;
  margin: 0px 0 10px 0;
  display: inline-block;
  text-align: center;
  width: 100%;
}
.footer-btn{
  float:right;
  margin-right:10px
}
.high-show{
  color:@red;
  font-size: 16px;
  font-weight: 1000;
}
</style>