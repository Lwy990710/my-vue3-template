<template>
  <div class="main">
    <div class="data-filter">
      <data-filter
        ref="filter"
        :filter-items="inventoryCheckDataSource.tableHeader"
        @openDialog="dialogSearch"
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
        <span style="display:inline-block;margin-left:20px;font-size:12px;color:red">
          Tips: 按住shift + 鼠标滚轮可以横向滚动表格 && 按住 Ctrl + 鼠标左键快捷选择
        </span>
      </div>
      <div class="extend-handle-right" />
    </div>
    <v-table
      ref="table"
      need-end-handle
      need-check-box
      load-prompt="获取库存需要点时间,请耐心等待......"
      :default-end-handle="false"
      :customize-end-handle="customizeEndHandle"
      :end-handle-width="280"
      :total="inventoryCheckDataSource.total"
      :current-page="inventoryCheckDataSource.currentPage"
      :page-size="inventoryCheckDataSource.pageSize"
      :table-data="inventoryCheckDataSource.tableData"
      :columns="inventoryCheckDataSource.tableHeader"
      :loading="loading && !isShowDialogSearch&&!isShowBillFlow"
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
  <billFlow
    :is-show="isShowBillFlow"
    :header="billFlowHeader"
    :data="billFlowData"
    title="仓库库存流水帐"
    width="84%"
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
import { onBeforeMount, ref, getCurrentInstance, h, reactive } from 'vue'
import { WareHouseDataSource, loading as warseHouseLoading } from '../../utils/warehouse/index'
import { useRouter } from 'vue-router'
import { InventoryCheckDataSource, loading } from '../../utils/inventoryCheck/index'
import { ElMessage, ElMessageBox, ElButton } from 'element-plus'
const { proxy } = getCurrentInstance()
const router = useRouter()
let inventoryCheckDataSource = ref(null)
const isShowEditTableHeader = ref(false)
const isShowDialogSearch = ref(false)
const isShowBillFlow = ref(false)

const updateHeaderCompleted = () => {
  isShowEditTableHeader.value = false
}

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
        title: "物料代码 / 套机码",
        dataKey: "materialCode",
        key: "materialCode",
        width: 200,
        type: 'text',
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
        title: "商品名称",
        dataKey: "materialName",
        key: "materialName",
        width: 200,
        type: 'text',
        isShow: true,
        isFixed: false
      }, {
        title: "规格型号",
        dataKey: "materialSpecification",
        key: "materialSpecification",
        width: 200,
        type: 'text',
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
      }, {
        title: "安全库存",
        dataKey: "safeNumber",
        key: "safeNumber",
        width: 200,
        type: 'none',
        isShow: true,
        isFixed: false
      }, {
        title: "库存上限",
        dataKey: "excessNumber",
        key: "excessNumber",
        width: 200,
        type: 'none',
        isShow: true,
        isFixed: false
      }
    ],
    selectUri: '/stockMain/select',
    deleteUri: '/',
    selectOneUri: '/'
  })

  initData()
})

const initData = () => {
  inventoryCheckDataSource.value.initData()
}

const deleteRecord = (val, sign) => {
  let params = sign ? [val] : []
  if (inventoryCheckDataSource.value.selections.length > 0 && !sign){
    selections.forEach(item => {
      params.push(item.id)
    })
  } else if (!sign){
    ElMessage.error('请先选择数据')
    return
  }
  inventoryCheckDataSource.value.delete(params, proxy.$refs.table).then((res) => {
    sign ? ElMessage.success('成功删除1条数据') : ElMessage.success(`成功删除${selections.length}条数据`)
  })
}

let wareHouseDataSource = ref(null)
let dataFilterTemp = {}

const dialogSearch = (propObj) => {
  isShowDialogSearch.value = true
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
  dataFilterTemp = propObj
}

const setInventory = (rowData, type) => {
  if (type === 1) {
    ElMessageBox.prompt('', '设置安全库存', {
      confirmButtonText: '保存',
      cancelButtonText: '取消',
      center: true
    })
      .then(({ value }) => {

        if (!value) {
          ElMessage.error('数量不能为空')
          return
        }
        let params = {
          materialCode: rowData.materialCode,
          warehouseCode: rowData.warehouseCode,
          safeNumber: Number(value)
        }
        inventoryCheckDataSource.value.setNum(params).then(res => {
          if (res === 200) {
            ElMessage.success('设置成功，请刷新页面')
          } else {
            ElMessage.error(res)
          }
        })
      })
  } else {
    ElMessageBox.prompt('', '设置库存上限', {
      confirmButtonText: '保存',
      cancelButtonText: '取消',
      center: true
    })
      .then(({ value }) => {
        if (!value) {
          ElMessage.error('数量不能为空')
          return
        }
        let params = {
          materialCode: rowData.materialCode,
          warehouseCode: rowData.warehouseCode,
          excessNumber: Number(value)
        }
        inventoryCheckDataSource.value.setNum(params).then(res => {
          if (res === 200) {
            ElMessage.success('设置成功，请刷新页面')
          } else {
            ElMessage.error(res)
          }
        })
      })
  }
}

const customizeEndHandle = (rowData) => {
  return [h('div', { class: 'table-handel-div' }, [h(
    ElButton,
    { onClick: () => { setInventory(rowData, 1) }, type: "primary", icon: "Edit", text: true, style: 'padding:0;margin:0;background:transparent;color:#21a53b' },
    { default: () => "安全库存" }
  )], [h(
    ElButton,
    { onClick: () => { setInventory(rowData, 2) }, type: "primary", icon: "Edit", text: true, style: 'padding:0;margin:0;background:transparent;color:#e43f31' },
    { default: () => "库存上限" }
  )], [h(
    ElButton,
    { onClick: () => { checkBillFlow(rowData) }, type: "primary", icon: "DataLine", text: true, style: 'padding:0;margin:0;background:transparent;color:#1271c2' },
    { default: () => "库存流水" }
  )])]
}

const doDialogSearch = (val) => {
  let searchData = { }
  if (val && val.length !== 0) searchData.warehouseName = val.trim()
  proxy.$refs.warseHouseDialog.dialogSearch(searchData)
}

const chooseRow = (val) => {
  proxy.$refs.filter.backfill(dataFilterTemp, val.warehouseName)
  isShowDialogSearch.value = false
}

const exportExcel = () => {
  let { selections } = inventoryCheckDataSource.value
  if (selections.length === 0) {
    ElMessage.error('请选择数据')
    return
  } else {
    let data = selections.map(item => {
      let { warehouseName, materialName, materialCode, materialSpecification, materialType, nowNumber, frozenNumber, safeNumber, excessNumber } = item
      return {
        warehouseName, materialName, materialCode, materialSpecification, materialType, nowNumber, frozenNumber, safeNumber, excessNumber
      }
    })
    const enHeader = [
      'warehouseName', 'materialName', 'materialCode', 'materialSpecification', 'materialType', 'nowNumber', 'frozenNumber', 'safeNumber', 'excessNumber'
    ]
    let znHeader = {
      warehouseName: '仓库名称',
      materialName: '商品名称',
      materialCode: '物料代码 / 套机码',
      materialSpecification: '规格型号',
      materialType: '产品类型',
      nowNumber: '现存量',
      frozenNumber: '冻结量',
      safeNumber: '安全库存',
      excessNumber: '库存上限'
    }
    new proxy.$DataTool().exportExcel(znHeader, enHeader, data, '仓库库存')
  }
}

const billFlowHeader = [
  {
    label: '所属仓库',
    prop: 'warehouseName',
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
    width: 150
  }
]

const billFlowData = reactive([])

const checkBillFlow = async ({ materialCode, warehouseCode, warehousePositionCode }) => {
  let params = {
    materialCode,
    warehouseCode
  }
  let ctx = await inventoryCheckDataSource.value.getStockMainRecord(params)
  if (ctx.code === 200){
    billFlowData.length = 0
    billFlowData.push(...ctx.data)
    isShowBillFlow.value = true
  } else proxy.$message.error(ctx)
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