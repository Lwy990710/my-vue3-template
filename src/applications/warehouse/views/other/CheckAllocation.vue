<template>
  <div>
    <div class="data-filter">
      <data-filter
        ref="filter"
        :filter-items="checkAllocationDataSource.tableHeader"
        @search="checkAllocationDataSource.search($event,checkAllocationDataSource,proxy.$refs.table)"
      />
    </div>
    <div style="padding: 10px">
      <el-button
        color="#4a78bd"
        plain
        @click="printCheck"
      >
        打印盘点单
      </el-button>
    </div>
    <v-table
      ref="table"
      need-end-handle
      need-check-box
      :default-end-handle="false"
      :customize-end-handle="customizeEndHandle"
      :total="checkAllocationDataSource.total"
      :current-page="checkAllocationDataSource.currentPage"
      :page-size="checkAllocationDataSource.pageSize"
      :for-mat-data="checkAllocationDataSource.forMatDataV2"
      :table-data="checkAllocationDataSource.tableData"
      :columns="checkAllocationDataSource.tableHeader"
      :loading="checkAllocationLoading"
      @refresh="initData"
      @current-change="checkAllocationDataSource.currentPageChange($event,checkAllocationDataSource,proxy.$refs.table)"
      @sizeChange="checkAllocationDataSource.pageSizeChange($event,checkAllocationDataSource,proxy.$refs.table)"
      @selectionChange="checkAllocationDataSource.selectionChange($event,checkAllocationDataSource)"
      @editTableHeader="isShowEditTableHeader = true"
    />
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
          :is-show-edit-table-header="isShowEditTableHeader" :modules="'checkMission'"
          @updateCompleted="updateHeaderCompleted"
        />
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import VTable from '@/components/public/virtualTable.vue'
import MyTable from '@/components/MyTable.vue'
import dataFilter from '@/components/common/dataFilter.vue'
import dynamicHeader from '@/components/common/dynamicHeader.vue'
import SimpleTable from '@/components/SimpleTable.vue'
import selectDialogTable from '@/components/common/selectDialogTable.vue'
import selectDialogForm from '@/components/common/selectDialogForm.vue'
import { onBeforeMount, ref, getCurrentInstance, watch, reactive, h } from 'vue'
import { WareHousePositionDataSource, loading as positionLoading } from '../../utils/warehouse'
import { CheckAllocationDataSource, loading as checkAllocationLoading } from '../../utils/checkAllocation/checkAllocation'
import { ElMessage, ElMessageBox, ElButton } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'

const { proxy } = getCurrentInstance()
let checkAllocationDataSource = ref(null)
let router = useRouter()
let route = useRoute()
const isShowEditTableHeader = ref(false)
let title = ref('')
let showMissionDialog = ref(false)
let showPeopleDialog = ref(false)
let checkOption = reactive({
  isOpenCheck: 1,
  checkDate: ''
})
let wareHousePositionDataSource = ref(null)
let inventoryCheckDataSource = ref(null)
let dataTool = ref(null)
let pro = JSON.parse(sessionStorage.getItem("userPermissions"))
let userInfo = JSON.parse(sessionStorage.getItem("userInfo"))
let checkWrite = pro.includes('MENU_TAKE_STOCK_WRITE')

watch(() => route.path, (newPath, oldPath) => {
  if (newPath === '/other/check/allocation') {
    if (!checkAllocationDataSource.value) checkAllocationDataSource.value = new CheckAllocationDataSource({
      modules: 'checkAllocation',
      selectUri: '/InventoryTaskMainAllocation/select',
      deleteUri: '/inventoryTaskMain/delete'
    })
    initData()
  }
})

const updateHeaderCompleted = () => {
  isShowEditTableHeader.value = false
  checkAllocationDataSource.value.initTableHeader()
}

const openPeopleDialog = () => {
  showPeopleDialog.value = true
}

onBeforeMount(() => {
  if (!checkAllocationDataSource.value) checkAllocationDataSource.value = new CheckAllocationDataSource({
    modules: 'checkAllocation',
    selectUri: '/InventoryTaskMainAllocation/select',
    deleteUri: '/inventoryTaskMain/delete'
  })
  checkAllocationDataSource.value.initTableHeader()
  initData()
})

const initData = () => {
  checkAllocationDataSource.value.initData()
}

const customizeEndHandle = (rowData) => {
  return [h('div', { class: 'table-handel-div' }, [h(
    ElButton,
    { onClick: () => { startCheck(rowData) }, type: "primary", icon: "Edit", text: true, style: 'padding:0;margin:0;background:transparent' },
    { default: () => "盘点" }
  )])]
}

const startCheck = (rowData) => {
  sessionStorage.setItem('allocationData', JSON.stringify(rowData))
  router.push({
    path: '/other/check/personal',
    query: { inventoryUserName: rowData['inventoryUserName'] }
  })
}

const printCheck = () => {
  let { selections } = checkAllocationDataSource.value
  if (selections.length === 0) {
    ElMessage.error('请先选择数据')
    return
  }
  sessionStorage.setItem('printCheckAllocationData', JSON.stringify(selections))
  router.push({
    path: '/print/check'
  })
}
</script>

  <style lang="less" scoped>
.table{
      padding: 10px;
      background-color: #ffffff;
    }
</style>