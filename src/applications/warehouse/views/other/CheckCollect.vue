<template>
  <div>
    <div class="data-filter">
      <data-filter
        ref="filter"
        :filter-items="checkCollectDataSource.tableHeader"
        @search="checkCollectDataSource.search($event,checkCollectDataSource,proxy.$refs.table)"
      />
    </div>
    <div class="extend-handle">
      <div class="extend-handle-left">
        <el-button
          v-authority="'MENU_TAKE_STOCK_WRITE'"
          class="handle-btn"
          color="#4a78bd"
          style="color: #666"
          plain
          @click="openAddCheckColleckDialog"
        >
          新增
        </el-button>
        <el-popconfirm
          :title="`是否确定删除 ` + checkCollectDataSource.selections.length + ` 条数据`"
          confirm-button-text="确定"
          cancel-button-text="再想想"
          @confirm="deleteRecord"
        >
          <template #reference>
            <el-button
              class="handle-btn-delete"
              color="#f56c6c"
              style="color: #666"
              plain
            >
              批量删除
            </el-button>
          </template>
        </el-popconfirm>
        <el-button
          v-authority="'MENU_TAKE_STOCK_WRITE'"
          class="handle-btn"
          color="#4a78bd"
          style="color: #666"
          plain
          @click="changeStatus('TAKE_STOCK_ING')"
        >
          开始盘点
        </el-button>
        <el-button
          v-authority="'MENU_TAKE_STOCK_WRITE'"
          class="handle-btn"
          color="#4a78bd"
          style="color: #666"
          plain
          @click="changeStatus('TAKE_STOCK_END')"
        >
          结束盘点
        </el-button>
        <!--         <el-button
          v-authority="'MENU_TAKE_STOCK_WRITE'"
          class="handle-btn"
          color="#4a78bd"
          style="color: #666"
          plain
          @click="exportExcel"
        >
          导出Excel
        </el-button>
        <el-popconfirm
          :title="`是否确定删除 ` + checkCollectDataSource.selections.length + ` 条数据`"
          confirm-button-text="确定"
          cancel-button-text="再想想"
          @confirm="deleteRecords"
        >
          <template #reference>
            <el-button
              v-authority="'MENU_TAKE_STOCK_WRITE'"
              class="handle-btn-delete"
              color="#f56c6c"
              style="color: #666"
              plain
            >
              批量删除
            </el-button>
          </template>
        </el-popconfirm> -->
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
      :total="checkCollectDataSource.total"
      :current-page="checkCollectDataSource.currentPage"
      :page-size="checkCollectDataSource.pageSize"
      :for-mat-data="checkCollectDataSource.forMatDataV2"
      :table-data="checkCollectDataSource.tableData"
      :columns="checkCollectDataSource.tableHeader"
      :loading="checkCollectLoading && warehouseLoading"
      @editRow="goCompile"
      @deleteRow="deleteRecord"
      @selectionChange="checkCollectDataSource.selectionChange($event,checkCollectDataSource,proxy.$refs.table)"
      @refresh="initData"
      @current-change="checkCollectDataSource.currentPageChange($event,checkCollectDataSource,proxy.$refs.table)"
      @sizeChange="checkCollectDataSource.pageSizeChange($event,checkCollectDataSource,proxy.$refs.table)"
      @editTableHeader="isShowEditTableHeader = true"
    />
  </div>
  <el-dialog
    v-model="showAddCheckColleckDialog"
    title="新增盘点计划"
    center width="40%"
  >
    <div v-loading="warehouseLoading">
      <NewFileForm
        ref="formRef" style="width:500px;margin: 0 auto" :model="model"
        :elements="formConfig.elements"
      />
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="makeNewCollect">
          确定
        </el-button>
        <el-button @click="showAddCheckColleckDialog = false">关闭</el-button>
      </span>
    </template>
  </el-dialog>
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
          :is-show-edit-table-header="isShowEditTableHeader" :modules="'checkCollect'"
          @updateCompleted="updateHeaderCompleted"
        />
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import VTable from '@/components/public/virtualTable.vue'
import NewFileForm from '@/components/NewFileForm.vue'
import dataFilter from '@/components/common/dataFilter.vue'
import dynamicHeader from '@/components/common/dynamicHeader.vue'
import { changeTime } from '../../public/jxRequest'
import { onBeforeMount, ref, getCurrentInstance, watch, reactive } from 'vue'
import { CheckCollectDataSource, loading as checkCollectLoading } from '../../utils/checkCollect'
import { WareHouseDataSource, loading as warehouseLoading } from '../../utils/warehouse'
import { ElMessage } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
const { proxy } = getCurrentInstance()
let checkCollectDataSource = ref(null)
let wareHouseDataSource = reactive({})
let wareHousePositionDataSource = reactive({})
let warehouseOption = reactive([])
let positionOption = reactive([])
let formRef = ref(null)
let router = useRouter()
let route = useRoute()
const isShowEditTableHeader = ref(false)
let dataTool = null
let showAddCheckColleckDialog = ref(false)
let model = reactive({
  planStartTime: '',
  warehouseName: '',
  warehouseCode: '',
  warehousePositionName: [],
  warehousePositionCode: []
})
let tempObj = {
  planStartTime: '',
  warehouseName: '',
  warehouseCode: ''

/*   warehousePositionName: [],
  warehousePositionCode: [] */
}
let formConfig = {
  elements: [{
    label: '仓库名称',
    prop: 'warehouseName',
    element: 'select',
    options: warehouseOption,
    rules: [{
      required: true, message: '仓库不能为空', trigger: 'blur'
    }]
  }, {
    label: '盘点日期',
    prop: 'planStartTime',
    element: 'date',
    rules: [{
      required: true, message: '盘点日期不能为空', trigger: 'blur'
    }]
  }]

  /*   ,
   {
    label: '仓位名称',
    prop: 'warehousePositionName',
    element: 'select',
    type: 'multiple',
    options: positionOption
  } */

}

watch(() => model.warehouseName, async (oldValue, newValue) => {
  tempObj.warehouseName = oldValue.split('+')[0]
  tempObj.warehouseCode = oldValue.split('+')[1]

/*   if (JSON.stringify(wareHousePositionDataSource === '{}')) {
    wareHousePositionDataSource = new WareHousePositionDataSource({
      selectUri: '/warehouse/listAllPosition',
      pageSize: 100000
    })
  }
  wareHousePositionDataSource.searchData = { warehouseCode: oldValue.split('+')[1] }
  await wareHousePositionDataSource.initData()
  wareHousePositionDataSource.tableData.forEach(item => {
    let temp = { label: item.positionsName, value: item.warehousePositionCode + "+" + item.positionsName }
    positionOption.push(temp)
  }) */
})

const updateHeaderCompleted = () => {
  isShowEditTableHeader.value = false
  checkCollectDataSource.value.initTableHeader()
}

const addFile = () => {
  router.push({
    path: '/other/new/check'
  })
}

const openAddCheckColleckDialog = async () => {
  showAddCheckColleckDialog.value = true
  if (JSON.stringify(wareHouseDataSource) === '{}') {
    wareHouseDataSource = new WareHouseDataSource({
      selectUri: '/warehouse/select'
    })
  }
  await wareHouseDataSource.initData()
  wareHouseDataSource.tableData.forEach(item => {
    let temp = { label: item.warehouseName, value: item.warehouseName + '+' + item.warehouseCode }
    warehouseOption.push(temp)
  })
}

onBeforeMount(() => {
  if (!checkCollectDataSource.value) checkCollectDataSource.value = new CheckCollectDataSource({
    modules: 'checkCollect',
    selectUri: '/takeStock/selectMainList',
    deleteUri: '/takeStock/deleteMain'
  })
  checkCollectDataSource.value.initTableHeader()
  initData()
})

const initData = () => {
  checkCollectDataSource.value.initData()
}

const goCompile = (row) => {
  let { planStartTime, startTime, totalSysNumber, totalRealNumber, warehouseName, takeStockRecordCode, processStatus } = row
  planStartTime = changeTime(planStartTime).split(' ')[0]
  startTime = changeTime(startTime).split(' ')[0]
  router.push({
    path: '/other/new/check/collect',
    query: { rowData: JSON.stringify({ planStartTime, startTime, totalSysNumber, totalRealNumber, warehouseName, takeStockRecordCode, processStatus }) }
  })
}

const deleteRecord = (rowData) => {
  console.log(rowData)

  if (rowData.id) {
    let { id, processStatus } = rowData
    if (processStatus !== 'TAKE_STOCK_NO_START') {
      ElMessage.error('只有未开始盘点的表单可以删除')
      return
    }
    checkCollectDataSource.value.delete([id]).then(res => {
      if (res === 200) {
        ElMessage.success('删除成功')
      } else {
        ElMessage.error(res)
      }
    })
  } else {
    let filter = checkCollectDataSource.value.selections.filter(item => {return item.processStatus !== 'TAKE_STOCK_NO_START'})
    console.log(filter)
    if (filter.length > 0) {
      ElMessage.error('所选数据中包含已经开始盘点的单据，无法删除')
    } else {
      let idList = checkCollectDataSource.value.selections.map(item => {return item.id})
      checkCollectDataSource.value.delete(idList).then(res => {
        if (res === 200) {
          ElMessage.success('删除成功')
        } else {
          ElMessage.error(res)
        }
      })
    }
  }
}

const makeNewCollect = async () => {
  await formRef.value.ruleFormRef.validate((valid, fields) => {
    if (valid) {
      tempObj['planStartTime'] = Date.parse(model['planStartTime'])
      checkCollectDataSource.value.createCollectSlip(tempObj).then(res => {
        if (res === 200) {
          ElMessage.success('新增盘点汇总表成功')
          showAddCheckColleckDialog.value = false
          initData()
        } else {
          ElMessage.error(res)
        }
      })
    } else {
      console.log('error submit!', fields)
    }
  })
}

const changeStatus = (status) => {
  let { selections } = checkCollectDataSource.value
  if (selections.length < 1) {
    ElMessage.error('请先选择数据')
    return
  }
  if (selections.length > 1) {
    ElMessage.error('一次只能操作一条数据')
    return
  }
  let params = {
    orderCode: selections[0].takeStockRecordCode,
    processStatusEnum: status
  }
  checkCollectDataSource.value.changeCollectStatus(params).then(res => {
    if (res === 200) {
      ElMessage.success('状态修改成功')
      initData()
    } else {
      ElMessage.error(res)
    }
  })
}
</script>

<style lang="less" scoped>
.table{
  padding: 10px;
  background-color: #ffffff;
}
</style>