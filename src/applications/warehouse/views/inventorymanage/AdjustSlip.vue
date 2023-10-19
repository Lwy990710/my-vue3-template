<template>
  <div class="main">
    <div class="data-filter">
      <data-filter
        ref="filter"
        :filter-items="adjustDataSource.tableHeader"
        @search="adjustDataSource.search($event,adjustDataSource,proxy.$refs.table)"
      />
    </div>

    <v-table
      ref="table"
      :default-end-handle="false"
      need-end-handle
      :total="adjustDataSource.total"
      :current-page="adjustDataSource.currentPage"
      :page-size="adjustDataSource.pageSize"
      :table-data="adjustDataSource.tableData"
      :columns="adjustDataSource.tableHeader"
      :loading="loading"
      @selectionChange="adjustDataSource.selectionChange($event,adjustDataSource,proxy.$refs.table)"
      @refresh="initData"
      @editRow="goCompile"
      @deleteRow="deleteRecord"
      @current-change="adjustDataSource.currentPageChange($event,adjustDataSource,proxy.$refs.table)"
      @sizeChange="adjustDataSource.pageSizeChange($event,adjustDataSource,proxy.$refs.table)"
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
          :is-show-edit-table-header="isShowEditTableHeader" :modules="'adjustSlip'"
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
import { onBeforeMount, ref, getCurrentInstance, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { AdjustDataSource, loading } from '../../utils/adjust/index'
import { ElMessage } from 'element-plus'
const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()
let adjustDataSource = ref(null)
const isShowEditTableHeader = ref(false)

const updateHeaderCompleted = () => {
  isShowEditTableHeader.value = false
  adjustDataSource.value.initTableHeader()
}

onBeforeMount(() => {
  if (!adjustDataSource.value) adjustDataSource.value = new AdjustDataSource({
    modules: 'adjustSlip',
    selectUri: '/stockPositionReset/select',
    deleteUri: '/',
    selectOneUri: '/'
  })
  if (route.query.positionResetCode) {
    adjustDataSource.value.searchData = { positionResetCode: route.query.positionResetCode }
  }
  adjustDataSource.value.initTableHeader()
  if (route.query.materialCode) {
    adjustDataSource.value.searchData = { materialCode: route.query.materialCode }
  }
  initData()
})

onMounted(() => {
  if (route.query.positionResetCode) proxy.$refs.filter.backfill({ type: 'default', index: 0 }, route.query.positionResetCode)
})

const initData = () => {
  adjustDataSource.value.initData(this, proxy.$refs.table)
}

const deleteRecord = (val, sign) => {
  let params = sign ? [val] : []
  if (adjustDataSource.value.selections.length > 0 && !sign){
    selections.forEach(item => {
      params.push(item.id)
    })
  } else if (!sign){
    ElMessage.error('请先选择数据')
    return
  }
  adjustDataSource.value.delete(params, proxy.$refs.table).then((res) => {
    sign ? ElMessage.success('成功删除1条数据') : ElMessage.success(`成功删除${selections.length}条数据`)
  })
}

const goCompile = (id, _, scope) => {
  id = 2
  router.push({
    path: '/inventory/adjust/newFile',
    query: { id }
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
</style>