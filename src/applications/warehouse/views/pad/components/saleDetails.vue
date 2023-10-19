<template>
  <div v-loading="goodLoading" style="form-content">
    <NewFileForm
      ref="formRef"
      v-loading="false"
      :elements="formData.elements"
      :disabled="disabled"
      :model="model"
      @openDialog="openDialog"
    />
    <el-button
      type="primary" :disabled="model.processStatus !== 'SALE_ORDER_CREATE' && model.processStatus"
      @click="emitOpenDialog"
    >
      新增物料
    </el-button>
    <goodsList :data="model.list" @delete="handleDelete" />
    <div class="handle-btn">
      <el-button
        v-if="model.processStatus === 'SALE_ORDER_CREATE'||!model.processStatus" type="primary"
        :disabled="goodLoading"
        @click="save"
      >
        保存
      </el-button>
      <el-button
        v-if="model.processStatus === 'SALE_ORDER_CREATE'" type="danger"
        @click="deleteSaleOrder"
      >
        删除
      </el-button>
      <el-button
        v-if="model.processStatus === 'SALE_ORDER_CREATE'" type="success"
        :disabled="goodLoading"
        @click="flowMaterial"
      >
        留料
      </el-button>
      <el-button
        v-if="model.processStatus === 'SALE_ORDER_MAT'" type="warning"
        @click="back"
      >
        回退
      </el-button>
    </div>
  </div>
  <selectDialogTable
    ref="dialogtableCustomer"
    :width="'70%'"
    :search-input-placeholder="'输入客户姓名搜索'"
    :is-show="dialogController.selectCustomer"
    :data-source="customerDataSource"
    :title="'选择收货客户'"
    :is-show-search-input="true"
    :loading="false"
    @close-dialog="dialogController.selectCustomer=false"
    @doDialogSearch="doDialogSearchCustomer"
    @chooseRow="chooseRowCustomer"
  />
  <selectDialogTable
    ref="dialogtableArea"
    :width="'90%'"
    :is-show="dialogController.selectArea"
    :data-source="areaDataSource"
    :title="'选择地区 && 发货仓 '"
    :is-show-search-input="false"
    :loading="false"
    @close-dialog="dialogController.selectArea=false"
    @chooseRow="chooseRowArea"
  >
    <template #customOperation>
      <div>
        <el-input
          v-model="searchVal.province"
          clearable
          placeholder="省"
          style="width:140px;margin-left:20px"
          size="small"
        >
          <template #append>
            <el-button icon="Search" @click="doDialogSearchArea" />
          </template>
        </el-input>
        <el-input
          v-model="searchVal.city"
          clearable
          placeholder="市"
          size="small"
          style="width:140px;margin-left:20px"
        >
          <template #append>
            <el-button icon="Search" @click="doDialogSearchArea" />
          </template>
        </el-input>
        <el-input
          v-model="searchVal.area"
          clearable
          placeholder="区"
          size="small"
          style="width:140px;margin-left:20px"
        >
          <template #append>
            <el-button icon="Search" @click="doDialogSearchArea" />
          </template>
        </el-input>
        <el-input
          v-model="searchVal.street"
          clearable
          placeholder="街道"
          size="small"
          style="width:140px;margin-left:20px"
        >
          <template #append>
            <el-button icon="Search" @click="doDialogSearchArea" />
          </template>
        </el-input>
      </div>
    </template>
  </selectDialogTable>
  <selectDialogTable
    ref="dialogtable"
    :width="'90%'"
    :search-input-placeholder="'输入物料代码搜索'"
    :is-show="dialogController.selectGoodTable"
    :data-source="goodDataSource"
    :title="'选择物料'"
    :is-show-search-input="false"
    :search-value-key="'test'"
    :loading="goodLoading"
    @close-dialog="dialogController.selectGoodTable=false"
    @doDialogSearch="doDialogSearch"
    @chooseRow="chooseRow"
  >
    <template #customOperation>
      <div>
        <el-input
          v-model="searchDataGood.materialCode"
          clearable
          placeholder="输入物料代码搜索"
          style="width:180px;margin-left:20px"
          size="small"
        >
          <template #append>
            <el-button icon="Search" @click="doDialogSearch" />
          </template>
        </el-input>
        <el-input
          v-model="searchDataGood.materialSpecification"
          clearable
          placeholder="输入商品型号搜索"
          size="small"
          style="width:180px;margin-left:20px"
        >
          <template #append>
            <el-button icon="Search" @click="doDialogSearch" />
          </template>
        </el-input>
        <el-radio-group
          v-model="searchDataGood.materialStatus" style="margin-left:30px"
          @change="materialStatusChange"
        >
          <el-radio
            label="GOOD" size="large"
          >
            良品
          </el-radio>
          <el-radio
            label="BAD" size="large"
          >
            不良品
          </el-radio>
        </el-radio-group>
      </div>
    </template>
  </selectDialogTable>
  <el-dialog
    v-model="dialogController.countDialog"
    :title="'请输入数量，最大为  ' + handleGood.nowNumber"
    width="30%"
  >
    <el-input-number
      v-model="handleGood.deliveredNumber" :min="1"
      :max="handleGood.nowNumber"
    />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAdd">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import selectDialogTable from '@/components/common/selectDialogTable.vue'
import goodsList from './goodsList.vue'
import NewFileForm from '@/components/NewFileForm.vue'
import { CustomerDataSource } from '@/applications/warehouse/utils/sale/index'
import { AreaDataSource, loading as areaLoading } from '@/applications/warehouse/utils/area/index'
import { GoodDataSource, loading as goodLoading } from '@/applications/warehouse/utils/good/index'
import { SaleSlipDataSource, loading } from '../../../utils/sale/index'
import { ref, reactive, onMounted, getCurrentInstance } from "vue"
const { proxy } = getCurrentInstance()
const _props = defineProps({
  data: {
    data: Array,
    default: () => {
      return []
    }
  }
})
const _emits = defineEmits(['refresh', 'close', 'deleteSaleOrder'])
const disabled = ref(false)

let formData = reactive({
  title: '新增销售订单',
  elements: [
    {
      label: '客户姓名',
      prop: 'customerName',
      element: 'dialog',
      rules: [{
        required: true,
        message: '客户姓名不能为空',
        trigger: 'blur'
      }]
    }, {
      label: '客户电话',
      prop: 'customerPhone',
      rules: [{
        required: true,
        message: '客户电话不能为空',
        trigger: 'blur'
      }]
    }, {
      label: '要求配送日期',
      prop: 'requireDeliveryDate',
      element: 'date',
      rules: [{
        required: true,
        message: '要求配送日期不能为空',
        trigger: 'blur'
      }]
    }, {
      label: '商家名称',
      prop: 'merchantName',
      rules: [{
        required: true,
        message: '商家名称不能为空',
        trigger: 'blur'
      }],
      disabled: true
    }, {
      label: '发货仓',
      prop: 'warehouseName',
      rules: [{
        required: true,
        message: '发货仓不能为空',
        trigger: 'blur'
      }],
      disabled: true
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
      label: '省',
      prop: 'province',
      disabled: true,
      element: 'dialog',
      dialogDisabled: false
    }, {
      label: '市',
      prop: 'city',
      disabled: true
    }, {
      label: '区',
      prop: 'area',
      disabled: true
    }, {
      label: '街道',
      prop: 'street',
      disabled: true
    }, {
      label: '备注',
      prop: 'comment',
      type: 'textarea'
    }, {
      label: '总数量',
      prop: 'sumNumber',
      disabled: true
    }, {
      label: '抛单员',
      prop: 'orderMaker'
    }, {
      label: '业务员',
      prop: 'salesman'
    }
  ]
})

let model = reactive({})

const dialogController = reactive({
  selectCustomer: false,
  selectArea: false,
  selectGoodTable: false,
  countDialog: false
})

const searchVal = reactive({
  province: '',
  city: '',
  area: '',
  street: ''
})

let searchDataGood = reactive({
  materialCode: '',
  materialSpecification: '',
  materialStatus: 'GOOD'
})

onMounted(() => {
  Object.assign(model, _props.data)
  if (model.processStatus !== 'SALE_ORDER_CREATE' && model.processStatus){
    disabled.value = true
  }
  const userId = JSON.parse(sessionStorage.getItem('userId'))
  saleDataSource.value.queryByAccountId(+userId).then(res => {
    if (res.code && res.code === 200) {
      model.merchantName = res.data.merchantName
      model.merchantCode = res.data.merchantCode
    }
    else {
      proxy.$alert(res, '提示', {
        type: 'error',
        confirmButtonText: '返回',
        callback: (action) => {
          return
        }
      })
    }
  })
})

let customerDataSource = ref(null)
let areaDataSource = ref(null)

const doDialogSearchCustomer = (val) => {
  if (val && val.length !== 0) proxy.$refs.dialogtableCustomer.dialogSearch({ customerName: val.trim(), merchantCode: model.merchantCode })
  else proxy.$refs.dialogtableCustomer.dialogSearch({ merchantCode: model.merchantCode })
}

const chooseRowCustomer = (val) => {
  model.customerName = val.customerName
  model.customerPhone = val.customerPhone
  model.receiptAddress = val.receiptAddress
  model.warehouseCode = val?.warehouseCode
  model.warehouseName = val?.warehouseName
  model.province = val?.province
  model.city = val?.city
  model.area = val?.area
  model.street = val?.street
  dialogController.selectCustomer = false
}

const doDialogSearchArea = () => {
  let searchData = {}
  Object.keys(searchVal).forEach(key => {
    if (searchVal[key].trim().length !== 0) {
      searchData[key] = searchVal[key].trim()
    }
  })
  proxy.$refs.dialogtableArea.dialogSearch(searchData)
}

const chooseRowArea = (val) => {
  model.warehouseCode = val.warehouseCode
  model.warehouseName = val.warehouseName
  model.province = val.province
  model.city = val.city
  model.area = val.area
  model.street = val.street
  dialogController.selectArea = false
}

const openDialog = (val) => {
  if (val === 'customerName'){
    if (!customerDataSource.value) customerDataSource.value = new CustomerDataSource({
      selectUri: '/saleOrderMain/queryCustomer',
      pageSize: 10,
      tableHeader: [{
        label: "客户姓名",
        prop: "customerName",
        width: 100
      }, {
        label: "客户电话",
        prop: "customerPhone",
        width: 100
      }, {
        label: "收货地址",
        prop: "receiptAddress",
        width: 150
      }, {
        label: "发货仓",
        prop: "warehouseName",
        width: 100
      }]
    })
    customerDataSource.value.searchData = { merchantCode: model.merchantCode }
    dialogController.selectCustomer = true
  } else if (val === 'warehouseName') {
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
    wareHouseDataSource.value.searchData = { warehouseType: 'PRE' }
    dialogController.selectWarehouse = true
  } else {
    if (!areaDataSource.value) areaDataSource.value = new AreaDataSource({
      selectUri: '/region/select',
      pageSize: 10,
      tableHeader: [
        {
          label: "仓库名称",
          prop: "warehouseName"
        }, {
          label: "省",
          prop: "province"
        }, {
          label: "市",
          prop: "city"
        }, {
          label: "区",
          prop: "area"
        }, {
          label: "街道",
          prop: "street"
        }
      ]
    })
    areaDataSource.value.searchData = { }
    dialogController.selectArea = true
  }

}

const goodDataSource = ref(null)

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

const emitOpenDialog = (val) => {
  if (!goodDataSource.value) goodDataSource.value = new GoodDataSource({
    selectUri: '/stockMerchant/select',
    pageSize: 10, // 页大小
    tableHeader: [
      {
        label: "套机码",
        prop: "materialCode",
        width: 150
      }, {
        label: "规格型号",
        prop: "materialSpecification",
        width: 180
      }, {
        label: "产品类型",
        prop: "materialType",
        width: 100
      }, {
        label: "产品质量",
        prop: "materialStatus",
        width: 100
      }, {
        label: "现有量",
        prop: "nowNumber",
        width: 100
      }
    ]
  })
  searchDataGood.materialCode = ''
  searchDataGood.materialSpecification = ''
  searchDataGood.materialStatus = 'GOOD'
  goodDataSource.value.searchData = { materialStatus: searchDataGood.materialStatus }
  goodDataSource.value.forMatData = forMatData
  goodDataSource.value.currentPage = 1
  dialogController.selectGoodTable = true
}

const doDialogSearch = (val) => {
  if (searchDataGood.materialCode.length === 0 && searchDataGood.materialSpecification.length === 0){
    proxy.$refs.dialogtable.dialogSearch({})
  } else if (searchDataGood.materialCode.length !== 0 && searchDataGood.materialSpecification.length !== 0){
    proxy.$refs.dialogtable.dialogSearch({ materialCode: searchDataGood.materialCode.trim(), materialSpecification: searchDataGood.materialSpecification.trim() })
  } else if (searchDataGood.materialCode.length !== 0){
    proxy.$refs.dialogtable.dialogSearch({ materialCode: searchDataGood.materialCode.trim() })
  } else proxy.$refs.dialogtable.dialogSearch({ materialSpecification: searchDataGood.materialSpecification.trim() })
}

const materialStatusChange = (val) => {
  goodDataSource.value.searchData = { materialStatus: val }
  goodDataSource.value.initData()
}

const handleGood = ref({})

const chooseRow = ({ materialCode, materialName, materialSpecification, materialStatus, nowNumber, totalVolume }) => {
  handleGood.value = {
    materialCode, materialName, materialSpecification, materialStatus, nowNumber, totalVolume
  }
  dialogController.countDialog = true
}

const confirmAdd = () => {
  let tempCode = handleGood.value.materialCode
  dialogController.countDialog = false
  dialogController.selectGoodTable = false
  if (!model.list){
    model.list = [handleGood.value]
    return
  }
  let idx = model.list.findIndex(item => item.materialCode === tempCode)
  if (idx === -1){
    proxy.$message.success('添加成功')
    model.list.push(handleGood.value)
  } else {
    model.list[idx].deliveredNumber = handleGood.value.deliveredNumber
    proxy.$message.success('这个物料已经添加过了，已经为你更新了它的数量')
  }
  Object.assign({}, handleGood.value)

}

const handleDelete = (idx) => {
  model.list.splice(idx, 1)
}

let formRef = ref(null)
let saleDataSource = ref(new SaleSlipDataSource({ deleteUri: '/saleOrderMain/delete', selectUri: '/saleOrderMain/select' }))

const save = async () => {
  await formRef.value.ruleFormRef.validate((valid, fields) => {
    if (valid) {
      if (model.list.length === 0) {
        proxy.$message.error('请添加物料')
        return
      }
      model.saleOrderDetailList = [...model.list]
      model.requireDeliveryDate = model.requireDeliveryDate && model.requireDeliveryDate.length !== 0 ? Date.parse(model.requireDeliveryDate) : null
      let params = {
        list: [model]
      }
      if (!model.id) {
        saleDataSource.value.addSaleOrder(params).then(res => {
          if (res.code === 200) {
            proxy.$message.success('保存成功')
            _emits('close', res.data)
          } else proxy.$message.error(res)
        })
      }
      else {
        let sum = 0
        params.list[0].saleOrderDetailList.forEach(item => {
          sum += item.deliveredNumber
        })
        params.list[0].sumNumber = sum
        saleDataSource.value.updateSaleOrder(params).then(res => {
          if (res === 200) {
            proxy.$message.success('保存成功')
            _emits('close', model)
          } else proxy.$message.error(res)
        })
      }
    } else {
      console.log('error submit!', fields)
    }
  })
}

const flowMaterial = () => {
  proxy.$alert(`确认数据无误并已保存？留料后无法修改数据！`, '提示', {
    type: 'warning',
    showCancelButton: true,
    cancelButtonText: '再想想',
    callback: (action) => {
      if (action === 'cancel') return
      let params = [model.saleOrderCode]
      saleDataSource.value.nextStatus(params).then(res => {
        if (res === 200){
          proxy.$message.success('转至留料成功')
          _emits('close', model)
        } else {
          proxy.$message.error(res)
        }
      })
    }
  })
}

const back = async () => {
  proxy.$alert(`是否确定回退？`, '提示', {
    type: 'warning',
    showCancelButton: true,
    cancelButtonText: '再想想',
    callback: (action) => {
      if (action === 'cancel') return
      let saleOrderCode = model.saleOrderCode
      saleDataSource.value.previousState(saleOrderCode).then(res => {
        if (res === 200){
          proxy.$message.success('回退成功')
          _emits('close', model)
        } else {
          proxy.$message.error(res)
        }
      })
    }
  })
}

const deleteSaleOrder = () => {
  let { id, processStatus } = model
  if (processStatus !== 'SALE_ORDER_CREATE'){
    ElMessage.error('仅制单支持删除')
    return
  }
  let params = [id]
  proxy.$alert('是否确认删除这条数据', '提示', {
    type: 'error',
    showCancelButton: true,
    cancelButtonText: '再想想',
    confirmButtonText: '确认删除',
    confirmButtonClass: 'delete-confirm-btn',
    callback: (action) => {
      if (action === 'cancel') return
      else {
        saleDataSource.value.delete(params).then((res) => {
          if (res === 200){
            proxy.$message.success('成功删除1条数据')
            _emits('deleteSaleOrder', model)
          } else ElMessage.error(res)
        })
      }
    }
  })

}
</script>

<style lang="less" scoped>
.form-content{
  position: relative;
}
.handle-btn{
	position: fixed;
	top: 0%;
	left: 10%;
	height: 60px;
	width: 100%;
	line-height: 60px;
	padding-left: 20px;
}
:deep(.form){
	margin-top:50px !important;
}
:deep(.el-dialog__title){
  display: flex;
  justify-self: space-around;
  align-items: center;
	flex-wrap: wrap;
}
:deep(.jx-dialog-header){
	height: 40px;
}
</style>