<template>
  <div class="main">
    <div class="message_area">
      <goBack :back-config="backConfig" />
      <div class="form_area">
        <el-steps
          :active="active"
          align-center
          finish-status="success"
        >
          <el-step title="制单" />
          <el-step title="等待出库" />
          <el-step title="出库中" />
          <el-step title="调拨中" />
          <el-step title="正在入库" />
          <el-step title="归档" />
          <el-step title="反向调拨" />
          <el-step title="调拨订单无效" />
        </el-steps>
        <div class="form_title">
          {{ route.query.id ? formData.title.replace('新增', '编辑') + '  ' +route.query.allocationCode : formData.title }}
        </div>
        <NewFileForm
          ref="formRef"
          v-loading="loading&&!dialogController.selectWareHouse"
          :elements="formData.elements" :disabled="disabled"
          :model="model"
          @openDialog="emitOpenDialog"
        />
      </div>
      <el-divider content-position="center">
        物料明细
      </el-divider>
      <div class="good-detail">
        <div class="extraHandle" style="padding-top:0">
          <el-button
            :disabled="active > 2"
            type="primary" color="#48C776"
            class="mr12"
            style="color: #FFFFFF"
            @click="addGoods"
          >
            {{ route.query.allocationType==='PICK_ORDER'?'新增提货订单':'新增调拨物料' }}
          </el-button>
          <span style="display:inline-block;margin-left:20px;font-size:18px;color:red">
            Tips: 双击数量和备注单元格可以编辑
          </span>
        </div>
        <el-table
          :data="goods"
          border
          style="width: 100%"
          :header-cell-style="{ background: '#1f2430', color: '#fff', borderColor: 'rgba(192, 192, 192,.5)' }"
          :row-style="{height: '35px',background:'#fafafa',borderColor:'rgba(192, 192, 192,.5)'}"
          :cell-style="{padding: '0',borderColor:'rgba(192, 192, 192,.5)',borderLeft:'none'}"
        >
          <el-table-column
            label="序号"
            type="index"
            width="60"
            align="center"
          />
          <el-table-column
            v-for="item in dataHeader"
            :key="item.prop"
            :prop="item.prop"
            :label="item.label"
            :width="item.width"
            align="center"
            show-overflow-tooltip
          >
            <template #default="scope">
              <div v-if="item.prop==='comment'" @dblclick="commentEdit(scope)">
                <span v-if="!isCommentEdit || commentEditRow !== scope.$index"> {{ scope.row.comment?scope.row.comment:'暂无备注' }} </span>
                <el-input
                  v-else-if="isCommentEdit && scope.$index===commentEditRow"
                  v-model="scope.row.comment"
                  size="small"
                  width="100px"
                  autofocus
                  placeholder="输入备注" clearable
                  @blur="isCommentEdit=false"
                />
              </div>
              <div v-if="item.prop==='number'" @dblclick="numberEdit(scope)">
                <span v-if="!isNumberEdit || numberEditRow !== scope.$index"> {{ scope.row.number }} </span>
                <el-input
                  v-else-if="isNumberEdit && scope.$index===numberEditRow"
                  v-model="scope.row.number"
                  type="number"
                  autofocus
                  placeholder="调拨数量"
                  :min="1" :max="scope.row.canBeAllocationNumber?scope.row.canBeAllocationNumber:scope.row.nowNumber?scope.row.nowNumber:scope.row.goodsAmount" size="small"
                  @blur="editNumberBlur(scope,scope.row.number,scope.row.canBeAllocationNumber?scope.row.canBeAllocationNumber:scope.row.nowNumber?scope.row.nowNumber:scope.row.goodsAmount)"
                />
              </div>
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
                    :disabled="active > 2"
                    type="danger"
                    class="row-options-btn"
                  >
                    删除
                  </el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <el-divider
        border-style="dashed"
      />
      <div class="handle_area">
        <el-button
          v-if="active===1&&!loading"
          type="primary" style="margin-right:30px"
          :loading="loading"
          @click="save"
        >
          保存
        </el-button>
        <el-button
          type="danger" style="margin-right:30px"
          @click="cancel"
        >
          取消
        </el-button>
        <el-button
          v-if="active===1&&goods.length >0&&!loading"
          :disabled="!canClickSubmit"
          color="#1355f3"
          style="color: #FFFFFF"
          @click="submitAllot"
        >
          递交
        </el-button>
      </div>
    </div>
    <selectDialogTable
      ref="tableDialogWarseHouse"
      :is-show="dialogController.selectWareHouse"
      :data-source="wareHouseDataSource"
      :title="'选择仓库'"
      :is-show-search-input="true"
      :search-input-placeholder="'请输入仓库名称搜索'"
      :search-value-key="'test'"
      :loading="warseHouseLoading"
      @close-dialog="dialogController.selectWareHouse=false"
      @doDialogSearch="doDialogSearchWarseHouse"
      @chooseRow="chooseRowWarseHouse"
    />
    <el-dialog
      v-model="dialogController.madeTransferOrder"
      title="选择需要调拨的物料"
      :close-on-click-modal="false"
      draggable
      fullscreen
      lock-scroll
      :show-close="false"
    >
      <template #header="{ titleId, titleClass }">
        <div class="jx-dialog-header">
          <h4 :id="titleId" :class="titleClass">
            选择需要调拨的物料
          </h4>
          <el-button
            class="dialog-close-btn"
            type="danger" icon="CloseBold"
            circle
            @click="dialogController.madeTransferOrder = false"
          />
        </div>
      </template>
      <allotPlan
        v-if="dialogController.madeTransferOrder"
        :goods-filter="goodsFilter" is-component
        @createDone="createDone"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import goBack from '@/components/common/goBack.vue'
import allotPlan from '../AllotPlan.vue'
import NewFileForm from '@/components/NewFileForm.vue'
import { onBeforeMount, reactive, ref, getCurrentInstance } from 'vue'
import selectDialogTable from '@/components/common/selectDialogTable.vue'
import { WareHouseDataSource, loading as warseHouseLoading } from '../../../utils/warehouse/index'
import { AllotSlipDataSource, loading } from '../../../utils/allotSlip/index'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
const { proxy } = getCurrentInstance()
let router = useRouter()
let route = useRoute()
let backConfig = [{ title: '库存管理', path: '' }, { title: '调拨单', path: '' }, { title: '新增调拨单', path: '' }]
let disabled = ref(false)
let canClickSubmit = ref(false)
let active = ref(0)
let allotSlipDataSource = ref(null)
const dialogController = reactive({
  madeTransferOrder: false,
  selectWareHouse: false
})
let formData = {
  title: '新增调拨单',
  elements: [
    {
      label: '调拨类型',
      prop: 'allocationType',
      disabled: true
    }, {
      label: '总数量',
      prop: 'totalNumber',
      disabled: true
    }, {
      label: '总体积',
      prop: 'totalVolume',
      disabled: true
    }, {
      label: '目的仓库',
      prop: 'toWarehouseName',
      disabled: true,
      element: 'dialog',
      rules: [{
        required: true,
        message: '目的仓库不能为空',
        trigger: 'blur'
      }]
    }, {
      label: '提货仓库',
      prop: 'pickWarehouseName',
      disabled: true,
      rules: [{
        required: true,
        message: '提货仓库不能为空',
        trigger: 'blur'
      }],
      element: 'dialog'
    }, {
      label: '推送到物流系统',
      prop: 'isNeedTransport',
      rules: [{
        required: true,
        message: '该项不可为空',
        trigger: 'blur'
      }],
      element: 'select',
      options: [{
        label: '是',
        value: '是'
      }, {
        label: '否',
        value: '否'
      }]
    }, {
      label: '备注',
      prop: 'comment',
      type: 'textarea'
    }, {
      label: '收货人',
      prop: 'receiptPerson',
      rules: [{
        required: true,
        message: '收货人不能为空',
        trigger: 'blur'
      }]
    }, {
      label: '收货电话',
      prop: 'receiptPhone',
      rules: [{
        required: true,
        message: '收货电话不能为空',
        trigger: 'blur'
      }]
    }, {
      label: '收货地址',
      prop: 'receiptAddress',
      type: 'textarea',
      rules: [{
        required: true,
        message: '收货地址不能为空',
        trigger: 'blur'
      }]
    }, {
      label: '承运商姓名',
      prop: 'carrierName',
      disabled: true
    }, {
      label: '司机姓名',
      prop: 'driverName',
      disabled: true
    }, {
      label: '司机电话',
      prop: 'driverPhone',
      disabled: true
    }, {
      label: '车牌号',
      prop: 'licensePlateNumber',
      disabled: true
    }
  ]
}
let model = reactive({})
let formRef = ref(null)

const typeRe = {
  '大仓至前置仓': 'BIG_TO_PRE',
  '前置仓至大仓': 'PRE_TO_BIG',
  '前置仓平调': 'PRE_TO_PRE',
  '提货订单调拨': 'PICK_ORDER'
}

const save = async () => {
  await formRef.value.ruleFormRef.validate((valid, fields) => {
    if (valid) {
      if (goods.length === 0){
        ElMessage.error('保存失败，请添加挑拨物料')
        return
      }
      if (route.query.id) {
        model.allocationCode = route.query.allocationCode
        model.id = route.query.id
      }
      let totalVolume = 0
      let totalNumber = 0
      goods.forEach(item => {
        if (item.number) totalNumber += +item.number
        if (item.volume) totalVolume += +item.volume * +item.number
        else if (item.totalVolume) totalVolume += +item.totalVolume
      })
      model.totalNumber = totalNumber
      model.totalVolume = totalVolume
      let params = {
        ...model
      }
      params.allocationType = typeRe[params.allocationType]
      params.allocationOrderDetailList = goods
      let targetWarehouseCode = goods[0].pickUpWarehouseCode
      for (let i = 0; i < goods.length; i++){
        if (goods[i].pickUpWarehouseCode !== targetWarehouseCode){
          ElMessage.error('一张调拨单只允许一个提货大仓')
          return
        }
      }
      allotSlipDataSource.value.updateAllocationOrder(params).then(res => {
        if (res === 200){
          ElMessage.success('保存成功')
          initData()
        } else ElMessage.error(res)
      })
    } else {
      console.log('error submit!', fields)
    }
  })
}

const dataHeader = [
  {
    label: "套机码",
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
    label: "所属大仓",
    prop: "pickUpWarehouse"
  }, {
    label: "调拨数量",
    prop: "number"
  }, {
    label: "体积",
    prop: "volume"
  }, {
    label: "备注",
    prop: "comment"
  }
]

let goods = reactive([])

let wareHouseDataSource = ref(null)

const doDialogSearchWarseHouse = (val) => {
  let searchData = {}
  if (val && val.length !== 0){
    searchData.warehouseName = val.trim()
    searchData.warehouseType = 'PRE'
  } else searchData = { warehouseType: 'PRE' }
  proxy.$refs.tableDialogWarseHouse.dialogSearch(searchData)
}

const dialogProp = ref('')

const emitOpenDialog = (prop) => {
  if (prop === 'toWarehouseName' || prop === 'pickWarehouseName') {
    if (!wareHouseDataSource.value) wareHouseDataSource.value = new WareHouseDataSource({
      selectUri: '/warehouse/select',
      pageSize: 10,
      tableHeader: [{
        label: "仓库名称",
        prop: "warehouseName"
      }, {
        label: "仓库地址",
        prop: "warehouseAddress"
      }, {
        label: "仓库类型",
        prop: "warehouseType"
      }, {
        label: "仓库联系人",
        prop: "warehouseKeeper"
      }]
    })
    if (route.query.allocationType === 'BIG_TO_PRE'){
      if (prop === 'toWarehouseName') wareHouseDataSource.value.searchData = { warehouseType: 'PRE' }
      else wareHouseDataSource.value.searchData = { warehouseType: 'BIG_WAREHOUSE' }
    } else if (route.query.allocationType === 'PRE_TO_BIG'){
      if (prop === 'toWarehouseName') wareHouseDataSource.value.searchData = { warehouseType: 'BIG_WAREHOUSE' }
      else wareHouseDataSource.value.searchData = { warehouseType: 'PRE' }
    } else {
      wareHouseDataSource.value.searchData = { warehouseType: 'PRE' }
    }
    dialogController.selectWareHouse = true
  }
  dialogProp.value = prop
}

const chooseRowWarseHouse = (val) => {
  if (dialogProp.value === 'pickWarehouseName'){
    model.pickWarehouseCode = val.warehouseCode
    model.pickWarehouseName = val.warehouseName
    dialogController.selectWareHouse = false
  } else {
    console.log(val)
    model.toWarehouseCode = val.warehouseCode
    model.toWarehouseName = val.warehouseName
    model.receiptPerson = val.warehouseKeeper
    model.receiptPhone = val.linkmanPhone
    model.receiptAddress = val.warehouseAddress
    dialogController.selectWareHouse = false
  }

}

const createDone = (prop) => {
  if (route.query.allocationType !== 'PICK_ORDER'){
    dialogController.madeTransferOrder = false
    goods.push(...prop.allocationOrderDetailList)
    return
  }
  if (goods.length === 0){
    dialogController.madeTransferOrder = false
    goods.push(...prop.allocationOrderDetailList)
  } else {
    let temp = goods.filter(item => item.pickingOrderCode === prop.allocationOrderDetailList[0].pickingOrderCode)
    if (temp.length > 0){
      proxy.$message.error(temp[0].pickingOrderCode + '该提货订单已经添加过了')
      return
    } else {
      dialogController.madeTransferOrder = false
      goods.push(...prop.allocationOrderDetailList)
    }
  }

  // pickingOrderCode
}

const isCommentEdit = ref(false)
const isNumberEdit = ref(false)

const commentEditRow = ref(-1)
const numberEditRow = ref(-1)

const commentEdit = (scope) => {
  isCommentEdit.value = true
  commentEditRow.value = scope.$index
}

const commentEditBlur = () => {
  commentEditRow.value = -1
  isCommentEdit.value = false
}

const numberEdit = (scope) => {
  if (route.query.allocationType === 'PICK_ORDER') return

  isNumberEdit.value = true
  numberEditRow.value = scope.$index
}

const editNumberBlur = (scope, number, maxNumber) => {
  goods[scope.$index].number = number > maxNumber ? maxNumber : number < 1 ? 1 : number
  goods[scope.$index].number = +goods[scope.$index].number
  isNumberEdit.value = false
  numberEditRow.value = -1
}

const handleDetele = (val) => {
  goods.splice(val, 1)

}

onBeforeMount(() => {
  if (!allotSlipDataSource.value) allotSlipDataSource.value = new AllotSlipDataSource()
  initData()
})

const submitAllot = () => {
  canClickSubmit.value = false
  ElMessageBox.alert(`确认数据无误并已保存？递交后无法修改调拨单`, '提示', {
    type: 'warning',
    showCancelButton: true,
    cancelButtonText: '再想想',
    callback: (action) => {
      if (action === 'cancel') return
      allotSlipDataSource.value.submitToAllocating(route.query.allocationCode).then(res => {
        if (res === 200){
          ElMessage.success('递交成功')
          initData()
        } else ElMessageBox.alert(res, '警告', {
          type: 'error'
        })
      })
    }
  })
}

const type = {
  BIG_TO_PRE: "大仓至前置仓",
  PRE_TO_BIG: "前置仓至大仓",
  PRE_TO_PRE: "前置仓平调",
  PICK_ORDER: '提货订单调拨'
}

const processStatusList = [
  "ALLOCATION_ORDER_CREATE", 'ALLOCATION_ORDER_WF', 'ALLOCATION_ORDER_OUT', 'ALLOCATION_ORDER_ING', 'ALLOCATION_ORDER_IN_WAREHOUSE_ING', 'ALLOCATION_ORDER_DOC', 'ALLOCATION_ORDER_RETURN', 'ALLOCATION_ORDER_INVALID'
]

const goodsFilter = reactive({
  selectUri: ``,
  filter: {}
})

const addGoods = () => {
  if (route.query.allocationType === 'PICK_ORDER'){
    goodsFilter.selectUri = `/pickingOrderMain/select`
    goodsFilter.filter = { processStatus: 'PICK_ORDER_NO_ALLOCATION' }
    goodsFilter.tableHeader = [
      {
        title: "提货订单号",
        dataKey: "pickingOrderCode",
        key: 'pickingOrderCode',
        width: 250,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        title: "发货单号",
        dataKey: "gejiangOrderCode",
        key: 'gejiangOrderCode',
        width: 250,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        title: "提货密钥",
        dataKey: "goodsPickingKey",
        key: 'goodsPickingKey',
        width: 250,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        title: "提货仓库",
        dataKey: "deliverWarehouse",
        key: 'deliverWarehouse',
        width: 250,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        title: "商家名称",
        dataKey: "merchantName",
        key: 'merchantName',
        width: 220,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        title: "货物总数量",
        dataKey: "totalAmount",
        key: 'totalAmount',
        width: 200,
        type: 'none',
        isShow: true,
        isFixed: false
      }, {
        title: "创建时间",
        dataKey: "createTime",
        key: 'createTime',
        width: 200,
        type: 'date',
        isShow: true,
        isFixed: false
      }, {
        title: "创建人",
        dataKey: "createUserName",
        key: 'createUserName',
        width: 200,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        title: "更新时间",
        dataKey: "updateTime",
        key: 'updateTime',
        width: 200,
        type: 'date',
        isShow: true,
        isFixed: false
      }, {
        title: "更新人",
        dataKey: "updateUserName",
        key: 'updateUserName',
        width: 200,
        type: 'text',
        isShow: true,
        isFixed: false
      }
    ]
    dialogController.madeTransferOrder = true
    return
  }
  else if (!model.pickWarehouseCode){
    ElMessage.error('请先选择提货仓库')
    return
  }
  if (model.pickWarehouseCode){
    if (route.query.allocationType === 'BIG_TO_PRE') {
      goodsFilter.selectUri = `/allocationPlan/select`
      goodsFilter.filter = { warehouseCode: model.pickWarehouseCode, materialType: '套机' }
    } else {
      goodsFilter.selectUri = `/stockMain/select`
      goodsFilter.filter = { warehouseCode: model.pickWarehouseCode, materialType: '套机' }
      goodsFilter.tableHeader = [
        {
          title: "所属仓库",
          dataKey: "warehouseName",
          key: "warehouseName",
          width: 200,
          type: 'none',
          isShow: true,
          isFixed: false
        }, {
          title: "套机码 / 单机码",
          dataKey: "materialCode",
          key: "materialCode",
          width: 200,
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
          title: "商品名称",
          dataKey: "materialName",
          key: "materialName",
          width: 200,
          type: 'text',
          isShow: true,
          isFixed: false
        }, {
          title: "类型",
          dataKey: "materialType",
          key: "materialType",
          width: 200,
          type: 'select',
          isShow: true,
          isFixed: false,
          options: [{
            label: '套机',
            value: '套机'
          }, {
            label: '单机',
            value: '单机'
          }]
        }, {
          title: "现有量",
          dataKey: "nowNumber",
          key: "nowNumber",
          width: 200,
          type: 'text',
          isShow: true,
          isFixed: false
        }, {
          title: "冻结量",
          dataKey: "frozenNumber",
          key: "frozenNumber",
          width: 200,
          type: 'text',
          isShow: true,
          isFixed: false
        }, {
          title: "安全库存",
          dataKey: "safeNumber",
          key: "safeNumber",
          width: 200,
          type: 'text',
          isShow: true,
          isFixed: false
        }, {
          title: "库存上限",
          dataKey: "excessNumber",
          key: "excessNumber",
          width: 200,
          type: 'text',
          isShow: true,
          isFixed: false
        }
      ]
    }
    dialogController.madeTransferOrder = true
  }
}

const initData = () => {
  if (route.query.allocationType === 'PICK_ORDER'){
    formData.elements.splice(4, 1)
    dataHeader.length = 0
    dataHeader.push(...[
      {
        label: "发货单号",
        prop: "pickingOrderCode",
        width: 200
      }, {
        label: "提货密钥",
        prop: "goodsPickingKey",
        width: 200
      }, {
        label: "套机码",
        prop: "materialCode",
        width: 200
      }, {
        label: "规格型号",
        prop: "materialSpecification",
        width: 400
      }, {
        label: "物料类型",
        prop: "materialType",
        width: 200
      }, {
        label: "总数量",
        prop: "number",
        width: 200
      }, {
        label: "总体积",
        prop: "totalVolume",
        width: 200
      }, {
        label: "提货仓库",
        prop: "pickUpWarehouse",
        width: 180
      }, {
        label: "备注",
        prop: "comment",
        width: 200
      }
    ])
  }

  const userInfo = JSON.parse(sessionStorage.getItem('userInfo'))

  allotSlipDataSource.value.getOne(route.query.allocationCode).then(res => {
    if (res.code === 200){
      Object.assign(model, res.data)
      active.value = processStatusList.indexOf(model.processStatus) + 1
    }
    model.allocationType = type[model.allocationType]
    canClickSubmit.value = active.value === 1
    disabled.value = active.value > 1
    goods.length = 0
    if (model.allocationOrderDetailList) goods.push(...model.allocationOrderDetailList)

    if (route.query.allocationType === 'BIG_TO_PRE'){
      model.toWarehouseCode = model.toWarehouseCode ? model.toWarehouseCode : userInfo.warehouseCode
      model.toWarehouseName = model.toWarehouseName ? model.toWarehouseName : userInfo.warehouseName
    }
    if (route.query.allocationType === 'PRE_TO_BIG'){
      model.pickWarehouseCode = model.pickWarehouseCode ? model.pickWarehouseCode : userInfo.warehouseCode
      model.pickWarehouseName = model.pickWarehouseName ? model.pickWarehouseName : userInfo.warehouseName
    }
  })
}
const cancel = () => {
  router.go(-1)
}
</script>

<style lang="less" scoped>
.good-detail{
  border-radius: 8px;
  margin-top: 20px;
  background: #fff;
}
.high-show{
  color:@red;
  font-size: 16px;
  font-weight: 1000;
}
:deep(.el-divider__text){
  font-size: 18px;
  font-weight: 800;
}
:deep(.table-virtual){
  width: 100% !important;
}
</style>