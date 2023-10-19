<template>
  <div class="main">
    <div class="message_area">
      <goBack :back-config="backConfig" />
      <div class="form_area">
        <el-steps
          class="steps"
          :active="active"
          align-center
          finish-status="success"
        >
          <el-step title="制单" />
          <el-step title="留料" />
          <el-step title="出库中" />
          <el-step title="归档" />
          <el-step title="退货" />
        </el-steps>
        <div class="form_title">
          {{ route.query.id ? formData.title.replace('新增', '编辑') + '   ' + route.query.saleOrderCode : formData.title }}
        </div>
        <NewFileForm
          ref="formRef"
          v-loading="loading && !dialogController.selectGoodForm&&!dialogController.selectGoodTable&&!dialogController.selectCustomer&&!dialogController.selectArea"
          :elements="formData.elements"
          :disabled="disabled"
          :model="model"
          :disabled-date="disabledDate"
          @openDialog="openDialog"
        />
      </div>
      <el-divider content-position="center">
        物料明细
      </el-divider>
      <div class="good-detail">
        <div class="extraHandle" style="padding-top:0">
          <el-button
            :disabled="active > 1"
            type="primary" color="#48C776"
            class="mr12"
            style="color: #FFFFFF"
            @click="dialogController.selectGoodForm=true"
          >
            新增商品
          </el-button>
          <span style="display:inline-block;margin-left:20px;font-size:18px;color:red">
            Tips: 双击数量和备注单元格可以编辑
          </span>
        </div>
        <el-table
          :data="goods"
          border
          style="width: 100%"
          :header-cell-style="{ background: '#454c5c', color: '#fff', borderColor: 'rgba(192, 192, 192,.5)' }"
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
              <div v-if="item.prop==='deliveredNumber'" @dblclick="numberEdit(scope)">
                <span v-if="!isNumberEdit || numberEditRow !== scope.$index"> {{ scope.row.deliveredNumber }} </span>
                <el-input
                  v-else-if="isNumberEdit && scope.$index===numberEditRow"
                  v-model="scope.row.deliveredNumber"
                  type="number"
                  autofocus
                  placeholder="请填写数量"
                  :min="1" size="small"
                  :max="scope.row.nowNumber"
                  @blur="editNumberBlur(scope,scope.row.deliveredNumber,scope.row.nowNumber)"
                />
              </div>
              <div v-if="item.prop==='materialStatus'">
                {{ scope.row.materialStatus==='BAD'?'不良品':'良品' }}
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
                    :disabled="active > 1"
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
      <div class="handle_area">
        <el-button
          v-if="active <= 3&&!loading" type="primary"
          style="margin-right:30px"
          :loading="false"
          @click="save"
        >
          保存
        </el-button>
        <el-button
          v-if="active === 2 " type="warning"
          style="margin-right:30px"
          :loading="false"
          @click="back"
        >
          回退
        </el-button>
        <el-button type="danger" @click="cancel">
          取消
        </el-button>
        <el-tooltip
          v-if="active===1&&canClickFlow"
          class="box-item"
          effect="dark"
          content="该操作不会自动保存，修改完数据后请确保已经保存"
          placement="top"
        >
          <el-button
            class="ml42"
            color="#fb460a"
            style="color: #FFFFFF"
            @click="flowMaterial"
          >
            留料
          </el-button>
        </el-tooltip>
      </div>
    </div>

    <selectDialogForm
      ref="dialogForm"
      :width="'60%'"
      :is-show="dialogController.selectGoodForm"
      :title="'新增物料'"
      :form-el="formElGood"
      @close-dialog="dialogController.selectGoodForm=false"
      @emitOpenDialog="emitOpenDialog"
      @inputDone="inputDone"
    />
    <selectDialogTable
      ref="dialogtable"
      :width="'60%'"
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
    <selectDialogTable
      ref="dialogtableCustomer"
      :width="'58%'"
      :search-input-placeholder="'输入客户姓名搜索'"
      :is-show="dialogController.selectCustomer"
      :data-source="customerDataSource"
      :title="'选择收货客户'"
      :is-show-search-input="true"
      :loading="loading"
      @close-dialog="dialogController.selectCustomer=false"
      @doDialogSearch="doDialogSearchCustomer"
      @chooseRow="chooseRowCustomer"
    />
    <selectDialogTable
      ref="dialogtableWarehouse"
      :width="'50%'"
      :search-input-placeholder="'输入仓库名称搜索'"
      :is-show="dialogController.selectWarehouse"
      :data-source="wareHouseDataSource"
      :title="'选择仓库'"
      :is-show-search-input="true"
      :loading="warseHouseLoading"
      @close-dialog="dialogController.selectWarehouse=false"
      @doDialogSearch="doDialogSearchWarehouse"
      @chooseRow="chooseRowWarehouse"
    />
    <selectDialogTable
      ref="dialogtableArea"
      :width="'60%'"
      :is-show="dialogController.selectArea"
      :data-source="areaDataSource"
      :title="'选择地区 && 发货仓 '"
      :is-show-search-input="false"
      :loading="areaLoading"
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
  </div>
</template>

<script setup>
import selectDialogForm from '@/components/common/selectDialogForm.vue'
import selectDialogTable from '@/components/common/selectDialogTable.vue'
import goBack from '@/components/common/goBack.vue'
import NewFileForm from '@/components/NewFileForm.vue'
import { GoodDataSource, loading as goodLoading } from '@/applications/warehouse/utils/good/index'
import { AreaDataSource, loading as areaLoading } from '@/applications/warehouse/utils/area/index'
import { SaleSlipDataSource, loading as loading, CustomerDataSource } from '@/applications/warehouse/utils/sale/index'
import { onBeforeMount, reactive, ref, watch, getCurrentInstance } from 'vue'
import { WareHouseDataSource, loading as warseHouseLoading } from '../../../utils/warehouse/index'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
const { proxy } = getCurrentInstance()
let router = useRouter()
let route = useRoute()
let active = ref(0)
let backConfig = [{ title: '销售管理', path: '' }, { title: '销售订单', path: '' }, { title: '新增销售订单', path: '' }]
let disabled = ref(false)

const processStatus = [
  'SALE_ORDER_CREATE', 'SALE_ORDER_MAT', 'SALE_ORDER_OUT', 'SALE_ORDER_DOC', 'SALE_ORDER_RETURN'
]

const dialogController = reactive({
  selectGoodForm: false,
  selectGoodTable: false,
  selectCustomer: false,
  selectWarehouse: false,
  selectArea: false
})

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
    label: "数量",
    prop: "deliveredNumber"
  }, {
    label: "产品质量",
    prop: "materialStatus"
  }, {
    label: "体积",
    prop: "volume"
  }
]

let goods = reactive([])

let goodDataSource = ref(null)
let saleDataSource = ref(null)
let searchDataGood = reactive({
  materialCode: '',
  materialSpecification: '',
  materialStatus: 'GOOD'
})

const formElGood = reactive([
  {
    label: '物料代码',
    element: 'input',
    type: 'dialog',
    prop: 'materialCode',
    rules: [{
      required: true,
      message: '物料代码不能为空',
      trigger: 'blur'
    }]
  }, {
    label: '物料名称',
    element: 'input',
    type: 'text',
    prop: 'materialName',
    disabled: true
  }, {
    label: '物料型号',
    element: 'input',
    type: 'text',
    prop: 'materialSpecification',
    rules: [{
      required: true,
      message: '物料型号不能为空',
      trigger: 'blur'
    }],
    disabled: true
  }, {
    label: '数量',
    element: 'input',
    type: 'text',
    prop: 'deliveredNumber',
    rules: [{
      required: true,
      message: '数量不能为空',
      trigger: 'blur'
    }]
  }, {
    label: '现存数量',
    element: 'input',
    type: 'text',
    prop: 'nowNumber',
    disabled: true
  }, {
    label: '体积 / 件',
    element: 'input',
    type: 'text',
    prop: 'volume',
    disabled: true
  }, {
    label: '产品质量',
    element: 'select',
    options: [{
      label: '良品',
      value: 'GOOD'
    }, {
      label: '不良品',
      value: 'BAD'
    }],
    prop: 'materialStatus',
    disabled: true
  }

])

const emitOpenDialog = (val) => {
  if (!goodDataSource.value) goodDataSource.value = new GoodDataSource({
    selectUri: '/stockMerchant/select',
    pageSize: 10, // 页大小
    tableHeader: [
      {
        label: "产品名称",
        prop: "materialName",
        width: 150
      }, {
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
      }, {
        label: "冻结量",
        prop: "frozenNumber",
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

const materialStatusChange = (val) => {
  goodDataSource.value.searchData = { materialStatus: val }
  goodDataSource.value.initData()
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

const doDialogSearch = (val) => {
  if (searchDataGood.materialCode.length === 0 && searchDataGood.materialSpecification.length === 0){
    proxy.$refs.dialogtable.dialogSearch({})
  } else if (searchDataGood.materialCode.length !== 0 && searchDataGood.materialSpecification.length !== 0){
    proxy.$refs.dialogtable.dialogSearch({ materialCode: searchDataGood.materialCode.trim(), materialSpecification: searchDataGood.materialSpecification.trim() })
  } else if (searchDataGood.materialCode.length !== 0){
    proxy.$refs.dialogtable.dialogSearch({ materialCode: searchDataGood.materialCode.trim() })
  } else proxy.$refs.dialogtable.dialogSearch({ materialSpecification: searchDataGood.materialSpecification.trim() })
}

const chooseRow = (val) => {
  let newData = {
    materialCode: val.materialCode,
    materialName: val.materialName,
    materialSpecification: val.materialSpecification,
    volume: val.volume,
    nowNumber: val.nowNumber,
    materialStatus: val.materialStatus
  }
  proxy.$refs.dialogForm.updateDialogInput(newData)
  dialogController.selectGoodTable = false
}

const inputDone = (val) => {
  let copyVal = JSON.parse(JSON.stringify(val))
  if (copyVal.deliveredNumber > copyVal.nowNumber){
    ElMessage.error('下单数量不可以大于现存数量')
    return
  }
  let sign = []
  goods.forEach((item, idx) => {
    if (item.materialCode === copyVal.materialCode) sign.push(idx)
  })
  if (sign.length !== 0){
    if (sign.length === 1){
      console.log(goods[sign[0]].materialStatus)
      if (goods[sign[0]].materialStatus === copyVal.materialStatus){
        ElMessage.error('添加失败，当前物料已经添加过了')
        return
      }
    } else {
      if (goods[sign[0]].materialStatus === copyVal.materialStatus || goods[sign[1]].materialStatus === copyVal.materialStatus){
        ElMessage.error('添加失败，当前物料已经添加过了')
        return
      }}
  }
  copyVal.totalVolume = +copyVal.volume * copyVal.deliveredNumber ? +copyVal.volume * copyVal.deliveredNumber : ''
  goods.push(copyVal)
  ElMessage.success('成功添加一个物料')
  dialogController.selectGoodForm = false
}

const handleDetele = (val) => {
  if (active.value > 1) return
  goods.splice(val, 1)
}

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
      }],
      blur: ($event) => {
        if (active.value >= 3 || model.warehouseName) return
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
        dialogController.selectArea = true
      }
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
    }, {
      label: '服务过程描述',
      prop: 'serviceProcessDescription',
      type: 'textarea',
      disabled: true
    }
  ]
})

let model = reactive({})

let formRef = ref(null)

let customerDataSource = ref(null)

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

let wareHouseDataSource = ref(null)

const doDialogSearchWarehouse = (val) => {
  if (val && val.length !== 0) proxy.$refs.dialogtableWarehouse.dialogSearch({ warehouseName: val.trim() })
  else proxy.$refs.dialogtableWarehouse.dialogSearch({})
}

const searchVal = reactive({
  province: '',
  city: '',
  area: '',
  street: ''
})

const doDialogSearchArea = () => {
  let searchData = {}
  Object.keys(searchVal).forEach(key => {
    if (searchVal[key].trim().length !== 0) {
      searchData[key] = searchVal[key].trim()
    }
  })
  proxy.$refs.dialogtableArea.dialogSearch(searchData)
}

const chooseRowWarehouse = (val) => {
  model.warehouseCode = val.warehouseCode
  model.warehouseName = val.warehouseName
  dialogController.selectWarehouse = false
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
      tableHeader: [
        {
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
        }, {
          label: "省",
          prop: "province",
          width: 70
        }, {
          label: "市",
          prop: "city",
          width: 70
        }, {
          label: "区",
          prop: "area",
          width: 70
        }, {
          label: "街道",
          prop: "street",
          width: 100
        }
      ]
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

let areaDataSource = ref(null)

let newDataReturn = {}

const save = async () => {
  await formRef.value.ruleFormRef.validate((valid, fields) => {
    if (valid) {
      if (goods.length === 0) {
        ElMessage.error('请添加物料')
        return
      }
      model.saleOrderDetailList = [...goods]
      model.requireDeliveryDate = model.requireDeliveryDate && model.requireDeliveryDate.length !== 0 ? Date.parse(model.requireDeliveryDate + " 23:59:59") : null
      let params = {
        list: [model]
      }
      if (!route.query.id && !newDataReturn.id) {
        saleDataSource.value.addSaleOrder(params).then(res => {
          if (res.code === 200) {
            active.value++
            ElMessage.success('保存成功')
            canClickFlow.value = true
            newDataReturn.id = res.data.id
            newDataReturn.saleOrderCode = res.data.saleOrderCode
            initData()
          } else ElMessage.error(res)
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
            ElMessage.success('保存成功')
            initData()
          } else ElMessage.error(res)
        })
      }
      console.log('success submit!', params)
    } else {
      console.log('error submit!', fields)
    }
  })
}

const back = async () => {
  ElMessageBox.alert(`是否确定回退？`, '提示', {
    type: 'warning',
    showCancelButton: true,
    cancelButtonText: '再想想',
    callback: (action) => {
      if (action === 'cancel') return
      let saleOrderCode = route.query.saleOrderCode ? route.query.saleOrderCode : newDataReturn.saleOrderCode
      saleDataSource.value.previousState(saleOrderCode).then(res => {
        if (res === 200){
          ElMessage.success('回退成功')
          initData()
        } else {
          canClickFlow.value = false
          ElMessage.error(res)
        }
      })
    }
  })
}

let canClickFlow = ref(false)

const flowMaterial = () => {
  if (Date.parse(model.requireDeliveryDate + ' 00:00:00') > Date.now())
  {
    ElMessageBox.alert(`确认数据无误并已保存？留料后无法修改数据！`, '提示', {
      type: 'warning',
      showCancelButton: true,
      cancelButtonText: '再想想',
      callback: (action) => {
        if (action === 'cancel') return
        let params = route.query.saleOrderCode ? [route.query.saleOrderCode] : [newDataReturn.saleOrderCode]
        canClickFlow.value = false
        saleDataSource.value.nextStatus(params).then(res => {
          if (res === 200){
            ElMessage.success('转至留料成功')
            initData()

          // initData()
          } else {
            canClickFlow.value = true
            ElMessage.error(res)
          }
        })
      }
    })
  } else {
    proxy.$message.error('留料时间和配送时间相隔太近了，可能来不及送货噢，请修改配送时间并保存后再试')
    return
  }
}

const initData = () => {
  if (route.query.id || newDataReturn.id) {
    saleDataSource.value.selectOne(route.query.id || newDataReturn.id).then(res => {
      Object.keys(res).forEach(key => {
        if (key === 'requireDeliveryDate') {
          let dataTool = new proxy.$DataTool()
          model[key] = dataTool.timeStamp2Time(res[key])
        }
        else model[key] = res[key]
      })
      active.value = processStatus.findIndex(item => item === model.processStatus) + 1
      if (active.value === 1) canClickFlow.value = true
      const userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
      formData.elements[6].element = 'dialog'
      formData.elements[4].element = 'input'
      formData.elements[0].element = 'dialog'
      if (active.value >= 1){
        formData.elements[0].element = 'input'
      }
      if (active.value > 1 && userInfo.jobId === 34) {
        formData.elements[6].element = 'input'
      }
      if (active.value <= 2 && userInfo.jobId !== 34) formData.elements[4].element = 'dialog'
      if (active.value > 2 && userInfo.jobId !== 34) delete formData.elements[6].element
      if (active.value > 3) disabled.value = true
      saleDataSource.value.searchSaleOrderDetails({ saleOrderCode: route.query.saleOrderCode || newDataReturn.saleOrderCode }).then(res => {
        goods.length = 0
        goods.push(...res.list)
      })
    })
  }

}

const getShopAndWarehouseByUserId = () => {
  const userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
  saleDataSource.value.queryByAccountId(userInfo.userId).then(res => {
    if (res.code && res.code === 200) {
      model.merchantName = res.data.merchantName
      model.merchantCode = res.data.merchantCode
    }
    else {
      ElMessageBox.alert(res, '提示', {
        type: 'error',
        confirmButtonText: '返回',
        callback: (action) => {
          router.go(-1)
        }
      })
    }
  })
}

onBeforeMount(() => {
  if (!saleDataSource.value) saleDataSource.value = new SaleSlipDataSource({
    selectOneUri: '/saleOrderMain/selectOne'
  })
  if (!route.query.id) getShopAndWarehouseByUserId()
  initData()
})

const isNumberEdit = ref(false)

const numberEditRow = ref(-1)

const numberEdit = (scope) => {
  if (active.value > 1) return
  isNumberEdit.value = true
  numberEditRow.value = scope.$index
}

const editNumberBlur = (scope, number, maxNumber) => {
  goods[scope.$index].deliveredNumber = +number < 1 ? 1 : +number > +maxNumber ? +maxNumber : +number
  isNumberEdit.value = false
  numberEditRow.value = -1
  goods[scope.$index].totalVolume = goods[scope.$index].deliveredNumber * goods[scope.$index].volume
}

const cancel = () => {
  router.go(-1)
}
const disabledDate = (val) => {
  // let dateTool = new proxy.$DataTool()
  let nowDate = Date.parse(new Date())
  let selectDate = Date.parse(val)

  // let signDate = Date.parse(dateTool.timeStamp2Time(nowDate) + ' 18:00:00')
  if (selectDate < nowDate) return true

  // if (nowDate > signDate && selectDate === Date.parse(dateTool.timeStamp2Time(nowDate) + ' 00:00:00') + 86400000) return true
  else return false
}
</script>

<style scoped lang="less">
.steps{
  display: flex;
  justify-content: center;
}
.good-detail{
  border-radius: 8px;
  margin-top: 20px;
  background: #fff;
}
.selectMaterial-type{
  display: inline-block;
  margin-left: 20px;
}
:deep(.el-divider__text){
  font-size: 18px;
  font-weight: 800;
}
:deep(.el-dialog__title){
  display: flex;
  justify-self: center;
  align-items: center;
}
.handle_area{

  margin: 15px 0 !important;
}
</style>