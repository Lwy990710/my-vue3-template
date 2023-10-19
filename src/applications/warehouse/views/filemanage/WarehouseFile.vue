<template>
  <div class="main">
    <div class="data-filter">
      <data-filter
        ref="filter"
        :filter-items="warehouseDataSource.tableHeader"
        @search="warehouseDataSource.search($event,warehouseDataSource,proxy.$refs.table)"
      />
    </div>
    <div class="extend-handle">
      <div class="extend-handle-left">
        <el-button
          v-authority="'MENU_WAREHOUSE_ARCHIVE_WRITE'"
          class="handle-btn"
          color="#4a78bd"
          style="color: #666"
          plain
          @click="addFile"
        >
          新增
        </el-button>
        <el-popconfirm
          title="是否确定删除这条数据"
          confirm-button-text="确定"
          cancel-button-text="再想想"
          @confirm="deleteRecords"
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
      </div>
    </div>
    <v-table
      ref="table"
      need-check-box
      need-end-handle
      :total="warehouseDataSource.total"
      :current-page="warehouseDataSource.currentPage"
      :page-size="warehouseDataSource.pageSize"
      :table-data="warehouseDataSource.tableData"
      :columns="warehouseDataSource.tableHeader"
      :loading="loading"
      :for-mat-data="warehouseDataSource.forMatDataV2"
      @selectionChange="warehouseDataSource.selectionChange($event,warehouseDataSource)"
      @refresh="initData"
      @editRow="goCompile"
      @deleteRow="deleteRecord"
      @current-change="warehouseDataSource.currentPageChange($event,warehouseDataSource,proxy.$refs.table)"
      @sizeChange="warehouseDataSource.pageSizeChange($event,warehouseDataSource,proxy.$refs.table)"
      @editTableHeader="isShowEditTableHeader = true"
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
            :is-show-edit-table-header="isShowEditTableHeader" :modules="'warehouseFile'"
            @updateCompleted="updateHeaderCompleted"
          />
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import VTable from '@/components/public/virtualTable.vue'
import dataFilter from '@/components/common/dataFilter.vue'
import dynamicHeader from '@/components/common/dynamicHeader.vue'
import { useRoute, useRouter } from "vue-router"
import { ref, onBeforeMount, getCurrentInstance, watch } from 'vue'
import { WareHouseDataSource, loading } from "../../utils/warehouse"
import { ElMessage } from 'element-plus'
const { proxy } = getCurrentInstance()
let route = new useRoute()
let router = new useRouter()
let warehouseDataSource = ref(null)
let pro = JSON.parse(sessionStorage.getItem("userPermissions"))
let warehouseWrite = pro.includes('MENU_WAREHOUSE_ARCHIVE_WRITE')
const isShowEditTableHeader = ref(false)
const updateHeaderCompleted = () => {
  isShowEditTableHeader.value = false
  warehouseDataSource.value.initTableHeader()
}
watch(() => route.path, (newPath, oldPath) => {
  if (newPath === '/file/warehouse') {
    if (!warehouseDataSource.value) warehouseDataSource.value = new WareHouseDataSource({
      modules: 'warehouseFile',
      selectUri: '/warehouse/select',
      selectOneUri: '/warehouse/selectOne'
    })
    warehouseDataSource.value.initData(this)
  }
})

onBeforeMount(() => {
  if (!warehouseDataSource.value) warehouseDataSource.value = new WareHouseDataSource({
    modules: 'warehouseFile',
    selectUri: '/warehouse/select',
    selectOneUri: '/warehouse/selectOne'
  })
  warehouseDataSource.value.initTableHeader()
  warehouseDataSource.value.initData()
})

let addFile = () => {
  if (!warehouseWrite) {
    ElMessage.error('该用户没有操作仓库档案的权限')
    return
  }
  router.push('/file/new/warehouse')
}

let goCompile = (row) => {
  if (!warehouseWrite) {
    ElMessage.error('该用户没有操作仓库档案的权限')
    return
  }
  console.log(row)
  router.push({
    path: '/file/new/warehouse',
    query: { id: row.id, warehouseCode: row.warehouseCode }
  })
}

let initData = () => {
  warehouseDataSource.value.initData()
}

let deleteRecord = (row) => {
  if (!warehouseWrite) {
    ElMessage.error('该用户没有操作仓库档案的权限')
    return
  }
  let params = { list: [] }
  params.list.push(row.id)
  warehouseDataSource.value.deleteWarehouse(params).then(res => {
    if (res.data.code === 200) {
      ElMessage.success('删除成功')
      initData()
    } else {
      ElMessage.error(res.data.message)
    }
  })
}

let deleteRecords = () => {
  if (!warehouseWrite) {
    ElMessage.error('该用户没有操作仓库档案的权限')
    return
  }
  if (warehouseDataSource.value.selections.length === 0) {
    ElMessage.error('请先选择数据')
    return
  }
  let params = { list: [] }
  params.list = warehouseDataSource.value.selections.map(item => {
    return item.id
  })
  warehouseDataSource.value.deleteWarehouse(params).then(res => {
    console.log(res)
    if (res.data.code === 200) {
      ElMessage.success('删除成功')
      initData()
    } else {
      ElMessage.error(res.data.message)
    }
  })
}
</script>

<style lang="less" scoped>
.main {
  width: 100%;
  .table{
    padding: 10px;
    background-color: #ffffff;
  }
}
</style>