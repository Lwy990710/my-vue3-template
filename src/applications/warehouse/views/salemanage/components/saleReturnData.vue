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
      <el-descriptions
        class="margin-top"
        title=""
        :size="'default'"
        :column="3"
        border
      >
        <el-descriptions-item>
          <template #label>
            <div class="cell-item .text-1">
              <el-icon class="cell-icon">
                <Document />
              </el-icon>
              销售单号:
            </div>
          </template>
          <el-tag size="default">
            {{ data.saleOrderCode }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon class="cell-icon">
                <UserFilled />
              </el-icon>
              客户名称:
            </div>
          </template>
          <el-tag size="default">
            {{ data.customerName }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon class="cell-icon">
                <Phone />
              </el-icon>
              客户电话:
            </div>
          </template>
          <el-tag size="default">
            {{ data.customerPhone }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon class="cell-icon">
                <GoodsFilled />
              </el-icon>
              商家名称:
            </div>
          </template>
          <el-tag size="default">
            {{ data.merchantName }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon class="cell-icon">
                <HomeFilled />
              </el-icon>
              收货仓库:
            </div>
          </template>
          <el-tag size="default">
            {{ data.warehouseName }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon class="cell-icon">
                <Odometer />
              </el-icon>
              取件日期:
            </div>
          </template>
          <!-- <el-tag size="default">
            {{ data.pickUpDate ? data.pickUpDate : '-' }}
          </el-tag> -->
          <el-date-picker
            v-model="pickUpDate"
            type="datetime"
            placeholder="选择取件日期"
            size="small"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:00:00"
          />
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon class="cell-icon">
                <MapLocation />
              </el-icon>
              送货地址:
            </div>
          </template>
          <el-tag size="default">
            {{ data.receiptAddress }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              <el-icon class="cell-icon">
                <MapLocation />
              </el-icon>
              备注:
            </div>
          </template>
          <el-input
            v-model="comment" placeholder="请输入备注"
            clearable size="small"
          />
        </el-descriptions-item>
      </el-descriptions>
      <span class="title">销售订单物料详情</span>
      <el-table
        :data="data.saleOrderReturnDetailList"
        class="mt10"
        border
        style="width: 100%"
        :header-cell-style="{ background: '#454c5c', color: '#fff', borderColor: 'rgba(192, 192, 192,.5)' }"
      >
        <el-table-column
          v-for="item in dataHeader"
          :key="item.prop"
          :prop="item.prop"
          :label="item.label"
          :width="item.width"
          align="center"
          show-overflow-tooltip
        >
          <template #default="{ row ,column}">
            <span v-if="column.property === 'isUrgent'" :class=" row.isUrgent === '是'? 'high-show':''"> {{ row.isUrgent }} </span>
          </template>
        </el-table-column>
        <el-table-column prop="returnNumber" label="输入退货数量">
          <template #default="{ row }">
            <el-input-number
              v-model="row.returnNumber"
              placeholder="退货数量" :min="0"
              :max="row.deliveredNumber"
              size="small"
            />
          </template>
        </el-table-column>
        <el-table-column prop="materialStatus" label="物料品质">
          <template #default="{ row }">
            <el-radio-group v-model="row.materialStatus" class="ml-4">
              <el-radio label="GOOD" size="small">
                良品
              </el-radio>
              <el-radio label="BAD" size="small">
                不良品
              </el-radio>
            </el-radio-group>
          </template>
        </el-table-column>
        <el-table-column
          fixed="right" label="操作"
          width="100"
          align="center"
        >
          <template #default="{$index}">
            <el-popconfirm
              title="是否确定删除这条数据"
              confirm-button-text="确定"
              cancel-button-text="再想想"
              @confirm="handleDetele($index)"
            >
              <template #reference>
                <el-button
                  text
                  type="danger"
                  class="row-options-btn"
                >
                  此件不退
                </el-button>
              </template>
            </el-popconfirm>
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
          再想想
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance, watch, computed, reactive } from 'vue'
import { ElMessage } from 'element-plus'
const { proxy } = getCurrentInstance()

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
const data = reactive(_props.data)

// 开启弹窗事件
const showDialog = computed({
  get(){
    return _props.isShow
  },
  set(){
    //null
  }
})

watch(() => _props.isShow, () => {
  pickUpDate.value = ''
  comment.value = ''
  let dataTool = new proxy.$DataTool()
  if (data.pickUpDate) pickUpDate.value = dataTool.timeStamp2Time(data.pickUpDate, 'yyyy-MM-dd hh:mm:ss')
  if (data.comment) comment.value = data.comment
})

const _emits = defineEmits(['closeDialog', 'submitForm'])

const closeDialog = () => _emits('closeDialog') // 关闭弹窗事件

const submitForm = () => {
  let sign = data.saleOrderReturnDetailList.some((item) => item.returnNumber && item.returnNumber !== 0)
  if (!sign){
    ElMessage.error('请确保有一个物料的退货数量不为0')
    return
  }
  let idx = data.saleOrderReturnDetailList.findIndex((item) => !item.materialStatus)
  if (idx !== -1){
    ElMessage.error('请选择物料品质')
    return
  }
  if (pickUpDate && pickUpDate.value.length === 0){
    ElMessage.error('请选择取件时间')
    return
  }
  let submitData = JSON.parse(JSON.stringify(data))
  submitData.pickUpDate = Date.parse(pickUpDate.value)
  submitData.comment = comment.value
  console.log(submitData)
  _emits('submitForm', submitData) // 提交事件
}

const dataHeader = [
  {
    label: "物料代码",
    prop: "materialCode"
  }, {
    label: "物料名称",
    prop: "materialName"
  }, {
    label: "物料型号",
    prop: "materialSpecification"
  }, {
    label: "物料类型",
    prop: "materialType"
  }, {
    label: "销售数量",
    prop: "deliveredNumber"
  }
]

let pickUpDate = ref('')
let comment = ref('')

const handleDetele = (idx) => {
  if (data.saleOrderReturnDetailList.length === 1){
    proxy.$message.error('这是最后一个了噢')
    return
  }
  data.saleOrderReturnDetailList.splice(idx, 1)
}
</script>

<style lang="less" scoped>
.title{
  font-size: 16px;
  font-weight: 700;
  margin: 20px 0 10px 0;
  display: inline-block;
  text-align: center;
  width: 100%;
}

.cell-item{
  display: flex;
  align-items: center;
  font-size: 14px;
}
.cell-icon{
  display: inline-block;
  margin-right: 6px;
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