<template>
  <div>
    <div class="data-filter">
      <data-filter
        ref="filter"
        :filter-items="checkMissionDataSource.tableHeader"
        @search="checkMissionDataSource.search($event,checkMissionDataSource,proxy.$refs.table)"
      />
    </div>
    <div class="extend-handle">
      <div class="extend-handle-left">
        <el-dropdown
          v-authority="'MENU_TAKE_STOCK_TASK_WRITE'" trigger="click"
          @command="addMission"
        >
          <el-button
            class="handle-btn mr10"
            color="#4a78bd"
            style="color: #666"
            plain
          >
            新增盘点任务<el-icon class="el-icon--right">
              <arrow-down />
            </el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="CW">
                按仓位创建
              </el-dropdown-item>
              <el-dropdown-item command="WL">
                按货物创建
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <!--         <el-upload
          class="inline-block ml12 mr12"
          accept=".xlsx, .xls"
          :on-change="fileChoice"
          :show-file-list="false"
          :auto-upload="false"
        >
          <el-button
            class="handle-btn"
            color="#4a78bd"
            style="color: #666"
            plain
          >
            导入Excel
          </el-button>
        </el-upload> -->
        <!--         <el-button
          class="handle-btn ml10"
          color="#4a78bd"
          style="color: #666"
          plain
          @click="exportExcel"
        >
          导出Excel
        </el-button> -->
        <el-popconfirm
          :title="`是否确定删除 ` + checkMissionDataSource.selections.length + ` 条数据`"
          confirm-button-text="确定"
          cancel-button-text="再想想"
          @confirm="deleteRecords"
        >
          <template #reference>
            <el-button
              v-authority="'MENU_TAKE_STOCK_TASK_WRITE'"
              class="handle-btn-delete"
              color="#f56c6c"
              style="color: #666"
              plain
            >
              批量删除
            </el-button>
          </template>
        </el-popconfirm>
        <!--         <el-tooltip
          class="box-item"
          effect="dark"
          content="下载导入模板"
          placement="top"
        >
          <el-button
            class="ml12"
            color="#5f6368" style="color: #FFFFFF"
            size="small"
            icon="Download" circle
            @click="downloadTemplate"
          />
        </el-tooltip> -->
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
      :total="checkMissionDataSource.total"
      :current-page="checkMissionDataSource.currentPage"
      :page-size="checkMissionDataSource.pageSize"
      :for-mat-data="checkMissionDataSource.forMatDataV2"
      :table-data="checkMissionDataSource.tableData"
      :columns="checkMissionDataSource.tableHeader"
      :loading="missionLoading"
      @editRow="goCompile"
      @deleteRow="deleteRecord"
      @selectionChange="checkMissionDataSource.selectionChange($event,checkMissionDataSource,proxy.$refs.table)"
      @refresh="initData"
      @current-change="checkMissionDataSource.currentPageChange($event,checkMissionDataSource,proxy.$refs.table)"
      @sizeChange="checkMissionDataSource.pageSizeChange($event,checkMissionDataSource,proxy.$refs.table)"
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
import { onBeforeMount, ref, getCurrentInstance, watch, reactive } from 'vue'
import { WareHousePositionDataSource, loading as positionLoading } from '../../utils/warehouse'
import { CheckMissionDataSource, loading as missionLoading } from '../../utils/checkMission/checkMission'

import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
const { proxy } = getCurrentInstance()
let checkMissionDataSource = ref(null)
let router = useRouter()
let route = useRoute()
const isShowEditTableHeader = ref(false)
let title = ref('')
let showMissionDialog = ref(false)
let showPeopleDialog = ref(false)
let dataTool = ref(null)
let pro = JSON.parse(sessionStorage.getItem("userPermissions"))
let userInfo = JSON.parse(sessionStorage.getItem("userInfo"))
let checkWrite = pro.includes('MENU_TAKE_STOCK_TASK_WRITE')

watch(() => route.path, (newPath, oldPath) => {
  if (newPath === '/other/mission') {
    if (!checkMissionDataSource.value) checkMissionDataSource.value = new CheckMissionDataSource({
      modules: 'checkMission',
      selectUri: '/inventoryTaskMain/select',
      deleteUri: '/inventoryTaskMain/delete'
    })
    initData()
  }
})

const updateHeaderCompleted = () => {
  isShowEditTableHeader.value = false
  checkMissionDataSource.value.initTableHeader()
}

const addMission = (command) => {
  console.log(111)
  router.push({
    path: '/other/new/mission',
    query: { inventoryType: command }
  })
}

onBeforeMount(() => {
  if (!checkMissionDataSource.value) checkMissionDataSource.value = new CheckMissionDataSource({
    modules: 'checkMission',
    selectUri: '/inventoryTaskMain/select',
    deleteUri: '/inventoryTaskMain/delete'
  })
  checkMissionDataSource.value.initTableHeader()
  initData()
})

const initData = () => {
  checkMissionDataSource.value.initData()
}

const goCompile = (row) => {
  router.push({
    path: '/other/new/mission',
    query: { id: row.id, inventoryType: row.inventoryType, inventoryTaskOrderCode: row.inventoryTaskOrderCode }
  })
}

const deleteRecord = (val) => {
  if (!pro.includes('MENU_TAKE_STOCK_TASK_WRITE')) {
    ElMessage.error('该账号没有删除数据的权限')
    return
  }
  let params = []
  params.push(val.id)
  ElMessageBox.alert('确定要删除吗', '提示', {
    type: 'error',
    showCancelButton: true,
    cancelButtonText: '取消',
    confirmButtonText: '确认删除',
    callback: (action) => {
      if (action === 'cancel') return
      else {
        checkMissionDataSource.value.delete(params, proxy.$refs.table).then((res) => {
          if (res === 200) {
            ElMessage.success('删除成功')
          } else {
            ElMessage.error(res)
          }
        })
      }
    }
  })

}

const deleteRecords = () => {
  if (checkMissionDataSource.value.selections.length < 1) {
    ElMessage.error('请先选择数据')
  } else {
    let filter = checkMissionDataSource.value.selections.filter(item => item['processStatus'] !== 'INVENTORY_TASK_CREATE')
    if (filter.length > 0) {
      ElMessage.error('只有制单状态的数据可以删除')
      return
    }
    let list = checkMissionDataSource.value.selections.map(item => item.id)
    checkMissionDataSource.value.delete(list, proxy.$refs.table).then((res) => {
      ElMessage.success(`成功删除${list.length}条数据`)
    })
  }
}

const exportExcel = (command) => {
  if (checkMissionDataSource.value.selections.length < 1) {
    ElMessage.error('请先选择数据')
  } else {
    let list = checkMissionDataSource.value.selections.map(item => item['inventoryTaskOrderCode'])
    let status = {
      success: ['BIG_INVENTORY_TASK_DETAIL_END'],
      wrong: ['BIG_INVENTORY_TASK_DETAIL_NOT_STARTED', 'BIG_INVENTORY_TASK_DETAIL_ERR']
    }
    let params = {
      inventoryTaskOrderCodeList: list,
      processStatusEnumList: status[command]
    }
    checkMissionDataSource.value.exportAllData(params).then(res => {
      if (res.code === 200) {
        let enHeader = [
          'inventoryTaskOrderCode', 'processStatus', 'warehouseName', 'warehousePositionName', 'materialCode', 'materialName', 'materialSpecification', 'materialType', 'bookQuantity', 'firmOfferQuantity', 'profitAndLossQuantity', 'comment'
        ]
        let zhHeader = {
          inventoryTaskOrderCode: '盘点单号',
          processStatus: '流程状态',
          warehouseName: '仓库名称',
          warehousePositionName: '仓位名称',
          materialCode: '物料代码',
          materialName: '物料名称',
          materialSpecification: '规格型号',
          materialType: '物料类型',
          bookQuantity: '账面数量',
          firmOfferQuantity: '实盘数量',
          profitAndLossQuantity: '盈亏数量',
          comment: '备注'
        }
        res.data['nameList'].forEach(item => {
          enHeader.push(`inventoryUserName-${item}`)
          zhHeader[`inventoryUserName-${item}`] = `${item}实盘数`
        })
        let exportData = makeData(res.data['exportAllDataVOList'])
        console.log(exportData)
        new proxy.$DataTool().exportExcel(zhHeader, enHeader, exportData, `汇总${command === 'success' ? '成功' : '异常'}数据`)
      } else {
        ElMessage.error(res)
      }
    })
  }
}
const makeData = (data) => {
  let status = {
    BIG_INVENTORY_TASK_DETAIL_NOT_STARTED: '汇总失败',
    BIG_INVENTORY_TASK_DETAIL_END: '汇总完成',
    BIG_INVENTORY_TASK_DETAIL_ERR: '汇总异常'
  }
  data.forEach(item => {
    item['actualCheckVOList'].forEach(checkUser => {
      item[`inventoryUserName-${checkUser['inventoryUserName']}`] = checkUser['firmOfferQuantity']
    })
    item['processStatus'] = status[item['processStatus']]
    delete item['isOpenCheck']
    delete item['actualCheckVOList']
    delete item['barCodes']
    delete item['warehousePositionCode']
    delete item['warehouseCode']
  })
  return data
}
</script>

  <style lang="less" scoped>
.table{
      padding: 10px;
      background-color: #ffffff;
    }
</style>