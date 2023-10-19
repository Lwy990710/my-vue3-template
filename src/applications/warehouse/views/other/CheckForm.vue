<template>
  <div>
    <div class="data-filter">
      <data-filter
        ref="filter"
        :filter-items="checkDataSource.tableHeader"
        @search="checkDataSource.search($event,checkDataSource,proxy.$refs.table)"
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
          @click="addFile"
        >
          新增
        </el-button>
        <el-button
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
          :title="`是否确定删除 ` + checkDataSource.selections.length + ` 条数据`"
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
        </el-popconfirm>
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
      :default-end-handle="checkWrite"
      :total="checkDataSource.total"
      :current-page="checkDataSource.currentPage"
      :page-size="checkDataSource.pageSize"
      :for-mat-data="checkDataSource.forMatDataV2"
      :table-data="checkDataSource.tableData"
      :columns="checkDataSource.tableHeader"
      :loading="loading"
      @editRow="goCompile"
      @deleteRow="deleteRecord"
      @selectionChange="checkDataSource.selectionChange($event,checkDataSource,proxy.$refs.table)"
      @refresh="initData"
      @current-change="checkDataSource.currentPageChange($event,checkDataSource,proxy.$refs.table)"
      @sizeChange="checkDataSource.pageSizeChange($event,checkDataSource,proxy.$refs.table)"
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
          :is-show-edit-table-header="isShowEditTableHeader" :modules="'check'"
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
import { onBeforeMount, ref, getCurrentInstance, watch } from 'vue'
import { CheckDataSource, loading } from '../../utils/check/index'
import { ElMessage } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
const { proxy } = getCurrentInstance()
let checkDataSource = ref(null)
let router = useRouter()
let route = useRoute()
watch(() => route.path, (newPath, oldPath) => {
  if (newPath === '/sale/salereturn/slip') {
    if (!checkDataSource.value) checkDataSource.value = new CheckDataSource({
      modules: 'check',
      selectUri: '/inventorySheet/select',
      deleteUri: '/inventorySheet/delete',
      selectOneUri: '/'
    })
    checkDataSource.value.initData(this)
  }
})
const isShowEditTableHeader = ref(false)
let dataTool = null
let pro = JSON.parse(sessionStorage.getItem("userPermissions"))
let checkWrite = pro.includes('MENU_TAKE_STOCK_WRITE')
const updateHeaderCompleted = () => {
  isShowEditTableHeader.value = false
  checkDataSource.value.initTableHeader()
}

const addFile = () => {
  router.push({
    path: '/other/new/check'
  })
}

onBeforeMount(() => {
  if (!checkDataSource.value) checkDataSource.value = new CheckDataSource({
    modules: 'check',
    selectUri: '/inventorySheet/select',
    deleteUri: '/inventorySheet/delete',
    selectOneUri: '/'
  })
  checkDataSource.value.initTableHeader()
  initData()
})

const initData = () => {
  checkDataSource.value.initData()
}

const goCompile = (row) => {
  router.push({
    path: '/other/new/check',
    query: { id: row.id, inventorySheetOrderCode: row.inventorySheetOrderCode }
  })
}

const exportExcel = () => {
  if (checkDataSource.value.selections.length < 1) {
    ElMessage.error('请先选择数据')
  } else {
    let list = checkDataSource.value.selections.map(item => item.inventorySheetOrderCode)
    let params = {
      list
    }
    let enHeader = [
      'inventorySheetOrderCode',
      'warehouseName',
      'warehousePositionName',
      'materialName',
      'materialCode',
      'materialSpecification',
      'materialType',
      'bookQuantity',
      'firmOfferQuantity',
      'profitAndLossQuantity',
      'warehouseCode',
      'warehousePositionCode',
      'comment'
    ]
    let znHeader = {
      inventorySheetOrderCode: "盘点单号",
      warehouseName: '仓库名称',
      warehousePositionName: '仓位名称',
      materialName: '物料名称',
      materialCode: '物料代码',
      materialSpecification: '规格型号',
      materialType: '物料类型',
      bookQuantity: '账面数量',
      firmOfferQuantity: '实盘数量',
      profitAndLossQuantity: '盈亏数量',
      warehouseCode: '仓库编码',
      warehousePositionCode: '仓位编码',
      comment: '备注'
    }
    checkDataSource.value.exportCheckForm(params).then(async res => {
      if (res.code === 200) {
        if (!dataTool) dataTool = new proxy.$DataTool()
        dataTool.exportExcel(znHeader, enHeader, res.data, '盘点明细')
      }
    })
  }
}

const deleteRecord = (val) => {
  let params = []
  params.push(val.id)
  checkDataSource.value.delete(params, proxy.$refs.table).then((res) => {
    ElMessage.success('成功删除1条数据')
  })
}

const deleteRecords = () => {
  if (checkDataSource.value.selections.length < 1) {
    ElMessage.error('请先选择数据')
  } else {
    let list = checkDataSource.value.selections.map(item => item.id)
    checkDataSource.value.delete(list, proxy.$refs.table).then((res) => {
      ElMessage.success(`成功删除${list.length}条数据`)
    })
  }

}
</script>

<style lang="less" scoped>
.table{
  padding: 10px;
  background-color: #ffffff;
}
</style>