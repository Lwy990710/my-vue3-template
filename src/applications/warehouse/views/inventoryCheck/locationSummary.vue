<template>
  <div class="main">
    <div class="data-filter">
      <data-filter
        ref="filter"
        hide-reset
        :filter-items="inventoryCheckDataSource.tableHeader"
        @openDialog="dialogSearch"
        @search="search"
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
          @click="choosePosition"
        >
          批量调整仓位
        </el-button>
        <span style="display:inline-block;margin-left:20px;font-size:12px;color:red">
          Tips: 按住shift + 鼠标滚轮可以横向滚动表格 && 按住 Ctrl + 鼠标左键快捷选择
        </span>
      </div>
      <div class="extend-handle-right" />
    </div>
    <el-dialog
      v-model="showAdjustPosition"
      title="选择目的仓位"
      center width="20%"
    >
      <div style="width: 200px;margin: 0 auto;text-align:center">
        <el-select
          v-model="targetPositionCode" placeholder="请选择仓位"
          filterable
        >
          <el-option
            v-for="item in positionList" :key="item.positionCode"
            :label="item.positionsName" :value="item.warehousePositionCode"
          />
        </el-select>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="adjustMaterial">
            确认调整
          </el-button>
          <el-button @click="showAddCheckColleckDialog = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
    <v-table
      ref="table"
      need-end-handle
      need-check-box
      load-prompt="获取库存需要点时间,请耐心等待......"
      :default-end-handle="false"
      :customize-end-handle="customizeEndHandle"
      :total="inventoryCheckDataSource.total"
      :current-page="inventoryCheckDataSource.currentPage"
      :page-size="inventoryCheckDataSource.pageSize"
      :table-data="inventoryCheckDataSource.tableData"
      :columns="inventoryCheckDataSource.tableHeader"
      :for-mat-data="inventoryCheckDataSource.forMatData"
      :loading="loading&&!isShowDialogSearch&&!isShowBillFlow&&!isShowGoodDialog"
      @selectionChange="inventoryCheckDataSource.selectionChange($event,inventoryCheckDataSource,proxy.$refs.table)"
      @refresh="initData"
      @current-change="inventoryCheckDataSource.currentPageChange($event,inventoryCheckDataSource,proxy.$refs.table)"
      @sizeChange="inventoryCheckDataSource.pageSizeChange($event,inventoryCheckDataSource,proxy.$refs.table)"
    />
  </div>
  <selectDialogTable
    ref="warseHouseDialog"
    :is-show="isShowDialogSearch"
    :width="'50%'"
    :data-source="wareHouseDataSource"
    :title="'选择所属仓库'"
    small
    :is-show-search-input="true"
    :search-input-placeholder="'请输入仓库名称搜索'"
    :loading="warseHouseLoading"
    @close-dialog="isShowDialogSearch=false"
    @doDialogSearch="doDialogSearch"
    @chooseRow="chooseRow"
  />
  <selectDialogTable
    ref="dialogtable"
    :width="'60%'"
    :search-input-placeholder="'输入物料代码搜索'"
    :is-show="isShowGoodDialog"
    :data-source="goodDataSource"
    :title="'选择要查询的物料'"
    :is-show-search-input="false"
    :search-value-key="'test'"
    :loading="warseHouseLoading"
    @close-dialog="isShowGoodDialog=false"
    @chooseRow="chooseGoodRow"
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
            <el-button icon="Search" @click="doGoodDialogSearch" />
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
            <el-button icon="Search" @click="doGoodDialogSearch" />
          </template>
        </el-input>
      </div>
    </template>
  </selectDialogTable>
  <billFlow
    :is-show="isShowBillFlow"
    :header="billFlowHeader"
    :data="billFlowData"
    title="库位库存流水帐"
    width="88%"
    @closeDialog="isShowBillFlow=false"
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
          :is-show-edit-table-header="isShowEditTableHeader" :modules="'user'"
          @updateCompleted="updateHeaderCompleted"
        />
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import billFlow from './components/billFlow.vue'
import VTable from '@/components/public/virtualTable.vue'
import dataFilter from '@/components/common/dataFilter.vue'
import dynamicHeader from '@/components/common/dynamicHeader.vue'
import selectDialogTable from '@/components/common/selectDialogTable.vue'
import { onBeforeMount, ref, getCurrentInstance, onMounted, h, reactive } from 'vue'
import { WareHouseDataSource, WareHousePositionDataSource, loading as warseHouseLoading } from '../../utils/warehouse/index'
import { InventoryCheckDataSource, loading } from '../../utils/inventoryCheck/index'
import { ElMessage, ElButton } from 'element-plus'
const { proxy } = getCurrentInstance()
let inventoryCheckDataSource = ref(null)
let wareHousePositionDataSource = ref(null)
const isShowEditTableHeader = ref(false)
const isShowDialogSearch = ref(false)
const isShowGoodDialog = ref(false)
const isShowBillFlow = ref(false)
const showAdjustPosition = ref(false)
let positionList = reactive([])
let targetPositionCode = ref('')
let userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
const goodDataSource = ref(null)
const updateHeaderCompleted = () => {
  isShowEditTableHeader.value = false
}

let searchDataGood = reactive({
  materialCode: '',
  materialSpecification: ''
})

onBeforeMount(() => {
  if (!inventoryCheckDataSource.value) inventoryCheckDataSource.value = new InventoryCheckDataSource({
    tableHeader: [
      {
        title: "所属仓库",
        dataKey: "warehouseName",
        key: "warehouseName",
        width: 200,
        type: 'dialog',
        isShow: true,
        isFixed: true
      }, {
        title: "所属仓位名称",
        dataKey: "warehousePositionName",
        key: "warehousePositionName",
        width: 200,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        title: "物料代码 / 套机码",
        dataKey: "materialCode",
        key: "materialCode",
        width: 200,
        type: 'dialog',
        isShow: true,
        isFixed: false
      }, {
        title: "规格型号",
        dataKey: "materialSpecification",
        key: "materialSpecification",
        width: 400,
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
        dataKey: "materialNum",
        key: "materialNum",
        width: 200,
        type: 'none',
        isShow: true,
        isFixed: false
      }
    ],
    pageSize: 10000000,
    selectUri: '/stockPosition/select',
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

  //   inventoryCheckDataSource.value.searchData = { warehouseCode: 'CK1000000' }
  //   initData()

})

onMounted(() => {
  let defaultProp = {
    index: 0,
    prop: 'warehouseName'
  }
  dialogSearch(defaultProp)
})

const initData = () => {
  inventoryCheckDataSource.value.initData()
}

let wareHouseDataSource = ref(null)
let dataFilterTemp = {}

const dialogSearch = (propObj) => {
  if (propObj.prop === 'warehouseName'){
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
    isShowDialogSearch.value = true
    dataFilterTemp = propObj
  } else {
    if (!goodDataSource.value) goodDataSource.value = new WareHouseDataSource({
      selectUri: '/material/select',
      pageSize: 10,
      tableHeader: [{
        label: "产品名称",
        prop: "materialName",
        width: 150
      }, {
        label: "物料代码",
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
      }]
    })
    dataFilterTemp = propObj

    // searchDataGood.materialCode = ''
    // searchDataGood.materialSpecification = ''
    goodDataSource.value.searchData = { }
    isShowGoodDialog.value = true
  }

}

const doGoodDialogSearch = () => {
  goodDataSource.value.searchData = {}
  if (searchDataGood.materialCode.trim().length > 0 && searchDataGood.materialSpecification.trim().length > 0){
    goodDataSource.value.searchData.materialCode = searchDataGood.materialCode.trim()
    goodDataSource.value.searchData.materialSpecification = searchDataGood.materialSpecification.trim()
  } else if (searchDataGood.materialCode.trim().length > 0){
    goodDataSource.value.searchData.materialCode = searchDataGood.materialCode.trim()
  } else if (searchDataGood.materialSpecification.trim().length > 0){
    goodDataSource.value.searchData.materialSpecification = searchDataGood.materialSpecification.trim()
  }
  goodDataSource.value.initData()
}

const chooseGoodRow = (val) => {
  inventoryCheckDataSource.value.searchData.materialCode = val.materialCode
  inventoryCheckDataSource.value.initData()
  proxy.$refs.filter.backfill(dataFilterTemp, val.materialCode)
  isShowGoodDialog.value = false
}

const doDialogSearch = (val) => {
  let searchData = { }
  if (val && val.length !== 0) searchData.warehouseName = val.trim()
  proxy.$refs.warseHouseDialog.dialogSearch(searchData)
}

const chooseRow = (val) => {
  inventoryCheckDataSource.value.searchData.warehouseName = val.warehouseName
  proxy.$refs.filter.backfill(dataFilterTemp, val.warehouseName)
  isShowDialogSearch.value = false
  let defaultProp = {
    index: 2,
    prop: 'materialCode'
  }
  dialogSearch(defaultProp)
}

const search = (val) => {
  if (val.warehouseName)
    inventoryCheckDataSource.value.search(val, this, proxy.$refs.table)
  else {
    let defaultProp = {
      index: 0,
      prop: 'warehouseName'
    }
    dialogSearch(defaultProp)
  }
}

const exportExcel = () => {
  let { selections } = inventoryCheckDataSource.value
  if (selections.length === 0) {
    ElMessage.error('请选择数据')
    return
  } else {
    let data = selections.map(item => {
      let { warehouseName, warehousePositionName, materialName, materialCode, materialSpecification, materialType, materialNum, frozenNumber, safeNumber, excessNumber } = item
      return {
        warehouseName, warehousePositionName, materialName, materialCode, materialSpecification, materialType, materialNum, frozenNumber, safeNumber, excessNumber
      }
    })
    const enHeader = [
      'warehouseName', 'warehousePositionName', 'materialName', 'materialCode', 'materialSpecification', 'materialType', 'materialNum', 'frozenNumber', 'safeNumber', 'excessNumber'
    ]
    let znHeader = {
      warehouseName: '仓库名称',
      warehousePositionName: '所属仓位',
      materialName: '商品名称',
      materialCode: '物料代码 / 套机码',
      materialSpecification: '规格型号',
      materialType: '产品类型',
      materialNum: '现有数量',
      frozenNumber: '冻结量',
      safeNumber: '安全库存',
      excessNumber: '库存上限'
    }
    new proxy.$DataTool().exportExcel(znHeader, enHeader, data, '仓位库存')
  }
}

const customizeEndHandle = (rowData) => {
  return [h('div', { class: 'table-handel-div' }, [h(
    ElButton,
    { onClick: () => { checkBillFlow(rowData) }, type: "primary", icon: "DataLine", text: true, style: 'padding:0;margin:0;background:transparent;color:#1271c2' },
    { default: () => "查看库存流水" }
  )])]
}

const billFlowHeader = [
  {
    label: '所属仓库',
    prop: 'warehouseName',
    width: 150
  }, {
    label: '所属仓位',
    prop: 'warehousePositionName',
    width: 150
  }, {
    label: '操作类型',
    prop: 'orderType',
    width: 150
  }, {
    label: '相关单号',
    prop: 'orderCode',
    width: 180
  }, {
    label: '变动数量',
    prop: 'changeNum',
    width: 120
  }, {
    label: '变动类型',
    prop: 'optType',
    width: 120
  }, {
    label: '结余数量',
    prop: 'surplusNum',
    width: 120
  }, {
    label: '物料代码',
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
    label: '物料类型',
    prop: 'materialType',
    width: 100
  }, {
    label: '创建时间',
    prop: 'createTime',
    width: 100
  }
]

const billFlowData = reactive([])

const checkBillFlow = async ({ materialCode, warehouseCode, warehousePositionCode, materialStatus }) => {
  let params = {
    materialCode,
    warehouseCode,
    warehousePositionCode,
    materialStatus
  }
  let ctx = await inventoryCheckDataSource.value.getPositionRecord(params)
  if (ctx.code === 200){
    billFlowData.length = 0
    billFlowData.push(...ctx.data)
    isShowBillFlow.value = true
  } else proxy.$message.error(ctx)
}

const choosePosition = async () => {
  let { selections } = inventoryCheckDataSource.value
  if (selections.length === 0) {
    ElMessage.error('请选择数据')
    return
  }
  if (!wareHousePositionDataSource.value) {
    wareHousePositionDataSource.value = new WareHousePositionDataSource({
      selectUri: '/warehouse/listAllPosition',
      pageSize: 100000
    })
  }
  wareHousePositionDataSource.value.searchData = { warehouseCode: userInfo.warehouseCode }
  await wareHousePositionDataSource.value.initData()
  positionList.push(...wareHousePositionDataSource.value.tableData)
  showAdjustPosition.value = true
}

const adjustMaterial = async () => {
  let { selections } = inventoryCheckDataSource.value
  let data = selections.map(item => {
    item['desWarehousePositionCode'] = targetPositionCode
    item['orgWarehousePositionCode'] = item.warehousePositionCode
    let { materialCode, desWarehousePositionCode, orgWarehousePositionCode } = item
    return { materialCode, desWarehousePositionCode, orgWarehousePositionCode }
  })
  let params = { list: [...data] }
  inventoryCheckDataSource.value.adjustBatch(params).then(res => {
    if (res.code === 200) {
      ElMessage.success('调整成功,详情请去库位调整页面查看')
      showAdjustPosition.value = false
    } else {
      ElMessage.error(res.message)
    }
  })
}
</script>

<style lang="less" scoped>
.main {
    .table{
    padding: 10px;
    background-color: #ffffff;
    }
}
:deep(.el-dialog__title){
  display: flex;
  justify-self: center;
  align-items: center;
}
</style>