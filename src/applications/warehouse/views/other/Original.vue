<template>
  <div>
    <div class="data-filter">
      <data-filter
        ref="filter"
        :filter-items="originalDataSource.tableHeader"
        @search="originalDataSource.search($event,originalDataSource,proxy.$refs.table)"
        @openDialog="dialogSearch"
      />
    </div>
    <v-table
      ref="table"
      :default-end-handle="false"
      need-end-handle
      :total="originalDataSource.total"
      :current-page="originalDataSource.currentPage"
      :page-size="originalDataSource.pageSize"
      :table-data="originalDataSource.tableData"
      :columns="originalDataSource.tableHeader"
      :loading="loading"
      @selectionChange="originalDataSource.selectionChange($event,originalDataSource,proxy.$refs.table)"
      @refresh="initData"
      @current-change="originalDataSource.currentPageChange($event,originalDataSource,proxy.$refs.table)"
      @sizeChange="originalDataSource.pageSizeChange($event,originalDataSource,proxy.$refs.table)"
      @editTableHeader="isShowEditTableHeader = true"
    />
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
          :is-show-edit-table-header="isShowEditTableHeader" :modules="'original'"
          @updateCompleted="updateHeaderCompleted"
        />
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import VTable from '@/components/public/virtualTable.vue'
import dataFilter from '@/components/common/dataFilter.vue'
import dynamicHeader from '@/components/common/dynamicHeader.vue'
import selectDialogTable from '@/components/common/selectDialogTable.vue'
import { onBeforeMount, ref, getCurrentInstance } from 'vue'
import { OriginalDataSource, loading } from '../../utils/original/index'
import { WareHouseDataSource, loading as warseHouseLoading } from '../../utils/warehouse/index'
import { ElMessage } from 'element-plus'
const { proxy } = getCurrentInstance()
let originalDataSource = ref(null)
const isShowEditTableHeader = ref(false)
const isShowDialogSearch = ref(false)
let wareHouseDataSource = ref(null)
const updateHeaderCompleted = () => {
  isShowEditTableHeader.value = false
  originalDataSource.value.initTableHeader()
}
let dataFilterTemp = {}
onBeforeMount(() => {
  if (!originalDataSource.value) originalDataSource.value = new OriginalDataSource({
    modules: 'original',
    selectUri: '/stockMain/select',
    deleteUri: '/',
    selectOneUri: '/'
  })
  originalDataSource.value.initTableHeader()

  initData()
})

const initData = () => {
  originalDataSource.value.initData()
}

const deleteRecord = (val, sign) => {
  let params = sign ? [val] : []
  if (originalDataSource.value.selections.length > 0 && !sign){
    selections.forEach(item => {
      params.push(item.id)
    })
  } else if (!sign){
    ElMessage.error('请先选择数据')
    return
  }
  originalDataSource.value.delete(params, proxy.$refs.table).then((res) => {
    sign ? ElMessage.success('成功删除1条数据') : ElMessage.success(`成功删除${selections.length}条数据`)
  })
}

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

const chooseRow = (val) => {
  proxy.$refs.filter.backfill(dataFilterTemp, val.warehouseName)
  originalDataSource.value.searchData['warehouseCode'] = val.warehouseCode
  originalDataSource.value.initData()
  isShowDialogSearch.value = false
}

const doDialogSearch = (val) => {
  let searchData = { }
  if (val && val.length !== 0) searchData.warehouseName = val.trim()
  proxy.$refs.warseHouseDialog.dialogSearch(searchData)
}
</script>

<style lang="less" scoped>
.table{
  padding: 10px;
  background-color: #ffffff;
}
</style>