<template>
  <div class="main">
    <div class="data-filter">
      <data-filter
        ref="filter"
        :filter-items="allotSlipDataSource.tableHeader"
        @openDialog="dialogSearch"
        @search="allotSlipDataSource.search($event,allotSlipDataSource,proxy.$refs.table)"
      />
    </div>
    <div class="extend-handle">
      <div class="extend-handle-left">
        <el-button
          class="handle-btn"
          color="#4a78bd"
          style="color: #666"
          plain
          @click="setOver"
        >
          手动归档
        </el-button>
        <el-button
          v-authority="'FUNCTION_SET_ALLOCATION_ORDER_INVALID'"
          class="handle-btn"
          color="#4a78bd"
          style="color: #666"
          plain
          @click="setInvalid"
        >
          调拨单无效
        </el-button>
        <el-button
          class="handle-btn"
          color="#4a78bd"
          style="color: #666"
          plain
          @click="exportExcel"
        >
          调拨单导出
        </el-button>
        <el-button
          class="handle-btn"
          color="#4a78bd"
          style="color: #666"
          plain
          @click="goPrint"
        >
          打印调拨单
        </el-button>
        <el-popconfirm
          :title="`是否确定删除 ` + allotSlipDataSource.selections.length + ` 条数据`"
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
        <span style="display:inline-block;margin-left:20px;font-size:12px;color:red">
          Tips: 按住shift + 鼠标滚轮可以横向滚动表格 && 按住 Ctrl + 鼠标左键快捷选择
        </span>
      </div>
      <div class="extend-handle-right">
        <el-dropdown trigger="click" @command="createNewAllot">
          <el-button
            class="handle-btn mr10"
            color="#4a78bd"
            style="color: #666"
            plain
          >
            新建调拨单<el-icon class="el-icon--right">
              <arrow-down />
            </el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="BIG_TO_PRE">
                从大仓调入前置仓
              </el-dropdown-item>
              <el-dropdown-item command="PRE_TO_BIG">
                从前置仓调出至大仓
              </el-dropdown-item>
              <el-dropdown-item command="PRE_TO_PRE">
                前置仓平调
              </el-dropdown-item>
              <el-dropdown-item command="PICK_ORDER">
                根据提货订单调拨
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <v-table
      ref="table"
      need-check-box
      need-end-handle
      :total="allotSlipDataSource.total"
      :current-page="allotSlipDataSource.currentPage"
      :page-size="allotSlipDataSource.pageSize"
      :table-data="allotSlipDataSource.tableData"
      :columns="allotSlipDataSource.tableHeader"
      :loading="loading&&!isShowDialogSearch"
      :for-mat-data="allotSlipDataSource.forMatDataV2"
      @selectionChange="allotSlipDataSource.selectionChange($event,allotSlipDataSource,proxy.$refs.table)"
      @refresh="allotSlipDataSource.initData(allotSlipDataSource,proxy.$refs.table)"
      @editRow="goCompile"
      @deleteRow="deleteRecord"
      @current-change="allotSlipDataSource.currentPageChange($event,allotSlipDataSource,proxy.$refs.table)"
      @sizeChange="allotSlipDataSource.pageSizeChange($event,allotSlipDataSource,proxy.$refs.table)"
      @editTableHeader="isShowEditTableHeader = true"
    />
  </div>
  <selectDialogTable
    ref="warseHouseDialog"
    :is-show="isShowDialogSearch"
    :width="'50%'"
    :data-source="wareHouseDataSource"
    :title="'选择大仓'"
    small
    :is-show-search-input="true"
    :search-input-placeholder="'请输入大仓名称搜索'"
    :loading="warseHouseLoading"
    @close-dialog="isShowDialogSearch=false"
    @doDialogSearch="doDialogSearch"
    @chooseRow="chooseRow"
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
          :is-show-edit-table-header="isShowEditTableHeader" :modules="'allotSlip'"
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
import { onBeforeMount, ref, getCurrentInstance, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import selectDialogTable from '@/components/common/selectDialogTable.vue'
import { WareHouseDataSource, loading as warseHouseLoading } from '../../utils/warehouse/index'
import { AllotSlipDataSource, loading } from '../../utils/allotSlip/index'
import { ElMessage, ElMessageBox } from 'element-plus'
const { proxy } = getCurrentInstance()
const router = useRouter()
let allotSlipDataSource = ref(null)

const isShowEditTableHeader = ref(false)

const updateHeaderCompleted = () => {
  isShowEditTableHeader.value = false
  allotSlipDataSource.value.initTableHeader()
}

let route = useRoute()
watch(() => route.path, (newPath, oldPath) => {
  if (newPath === '/inventory/allot/allotSlip') {
    if (!allotSlipDataSource.value) allotSlipDataSource.value = new AllotSlipDataSource({
      modules: 'allotSlip',
      selectUri: '/allocationOrderMain/select',
      deleteUri: '/allocationOrderMain/delete',
      selectOneUri: '/allocationOrderMain/getOne'
    })
    allotSlipDataSource.value.initData(this)
  }
})

onBeforeMount(() => {
  if (!allotSlipDataSource.value) allotSlipDataSource.value = new AllotSlipDataSource({
    modules: 'allotSlip',
    selectUri: '/allocationOrderMain/select',
    deleteUri: '/allocationOrderMain/delete',
    selectOneUri: '/allocationOrderMain/getOne'
  })
  allotSlipDataSource.value.initTableHeader()
  allotSlipDataSource.value.initData(this, proxy.$refs.table)
})

const deleteRecord = ({ allocationCode, processStatus, id }) => {
  if (processStatus !== 'ALLOCATION_ORDER_CREATE'){
    ElMessage.error('仅制单状态的调拨单支持删除')
    return
  }
  ElMessageBox.alert('是否确认删除这条数据', '提示', {
    type: 'error',
    showCancelButton: true,
    cancelButtonText: '再想想',
    confirmButtonText: '确认删除',
    confirmButtonClass: 'delete-confirm-btn',
    callback: (action) => {
      if (action === 'cancel') return
      else {
        let params = { list: [allocationCode] }
        allotSlipDataSource.value.delete(params, proxy.$refs.table).then((res) => {
          if (res === 200){
            ElMessage.success('成功删除1条数据')
          } else ElMessage.error(res)
        })
      }
    }
  })
}

const deleteRecords = () => {
  if (allotSlipDataSource.value.selections.length === 0){
    ElMessage.error('请先选择数据')
    return
  }
  let dataTool = new proxy.$DataTool()
  if (dataTool.processLimitation(allotSlipDataSource.value.selections, ['ALLOCATION_ORDER_CREATE'])){
    ElMessageBox.alert('是否确认手动归档', '提示', {
      type: 'error',
      showCancelButton: true,
      cancelButtonText: '再想想',
      confirmButtonText: '确认删除',
      confirmButtonClass: 'delete-confirm-btn',
      callback: (action) => {
        if (action === 'cancel') return
        else {
          let params = { list: [allocationCode] }
          allotSlipDataSource.value.delete(params, proxy.$refs.table).then((res) => {
            if (res === 200){
              ElMessage.success('成功删除1条数据')
            } else ElMessage.error(res)
          })
        }
      }
    })
    let params = { list: dataTool.objectListGetValueByKey(allotSlipDataSource.value.selections, 'allocationCode') }
    allotSlipDataSource.value.delete(params, proxy.$refs.table).then((res) => {
      if (res === 200){
        ElMessage.success('成功删除' + params.list.length + '条数据')
      } else ElMessage.error(res)
    })
  } else {
    ElMessage.error('仅制单状态的调拨单支持删除')
    return
  }
}

const setOver = async () => {
  if (allotSlipDataSource.value.selections.length === 0){
    ElMessage.error('请先选择数据')
    return
  }
  let dataTool = new proxy.$DataTool()
  if (dataTool.processLimitation(allotSlipDataSource.value.selections, ['PRE_TO_BIG'], 'allocationType')){
    ElMessageBox.alert('是否确认手动归档？确认后无法回退', '提示', {
      type: 'warning',
      showCancelButton: true,
      cancelButtonText: '再想想',
      confirmButtonText: '确认归档',
      confirmButtonClass: 'ask-confirm-btn',
      callback: async (action) => {
        if (action === 'cancel') return
        else {
          let ctx = await allotSlipDataSource.value.setPreToBigDocStatus({ list: dataTool.objectListGetValueByKey(allotSlipDataSource.value.selections, 'allocationCode', 'list') })
          if (ctx === 200){
            ElMessage.success('成功归档')
            allotSlipDataSource.value.initData(this, proxy.$refs.table)
          } else ElMessage.error(ctx)
        }
      }
    })
  } else {
    ElMessage.error('手动归档只支持前置仓到大仓的调拨单！')
    return
  }
}

let wareHouseDataSource = ref(null)
const isShowDialogSearch = ref(false)

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
  dataFilterTemp = propObj
}

const goPrint = () => {
  if (allotSlipDataSource.value.selections.length < 1) {
    ElMessage.error('请先选择数据')
    return
  }
  let printAllotNumArr = allotSlipDataSource.value.selections.map(item => {
    return item.numberOfPrints
  })
  let list = allotSlipDataSource.value.selections.map(item => {return item.allocationCode})
  sessionStorage.setItem('printAllotData', JSON.stringify(list))
  sessionStorage.setItem('printAllotNumArr', JSON.stringify(printAllotNumArr))
  const routerUrl = router.resolve('/print/allotSlip')
  window.open(routerUrl.href, '_blank')
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

const createNewAllot = (command) => {
  allotSlipDataSource.value.createAllocationOrder(command).then(res => {
    if (res.code === 200){
      ElMessage.success('创建成功')
      proxy.$refs.table.clearSelection()
      allotSlipDataSource.value.initData().then(() => {
        goCompile(res.data)
      })
    } else ElMessage.error(res)
    console.log(res)
  })
}

const goCompile = ({ id, allocationCode, allocationType }) => {
  router.push({
    path: '/inventory/allot/allotSlip/newFile',
    query: { id, allocationCode, allocationType }
  })
}

const exportExcel = () => {
  if (allotSlipDataSource.value.selections.length < 1) {
    ElMessage.error('请先选择数据')
    return
  }
  let params = { list: [] }
  let dataTool = new proxy.$DataTool()
  let codeList = allotSlipDataSource.value.selections.map(item => {return item.allocationCode})
  params.list.push(...codeList)
  allotSlipDataSource.value.exportAllotSlip(params).then(res => {
    if (res.code === 200) {
      let exportData = res.data.list.map(item => {
        let { createTime, updateTime, allocationCode, pickingOrderCode, pickUpWarehouse, goodsPickingKey, materialCode, materialType, materialSpecification, number, comment } = item
        createTime = dataTool.timeStamp2Time(createTime, 'yyyy-MM-dd HH:mm:ss')
        updateTime = dataTool.timeStamp2Time(updateTime, 'yyyy-MM-dd HH:mm:ss')
        return { createTime, updateTime, allocationCode, pickingOrderCode, pickUpWarehouse, goodsPickingKey, materialCode, materialType, materialSpecification, number, comment }
      })
      let znHeader = {
        createTime: '创建时间',
        updateTime: '更新时间',
        allocationCode: '调拨单号',
        pickingOrderCode: '发货单号',
        pickUpWarehouse: '提货仓库',
        goodsPickingKey: '提货密钥',
        materialCode: '物料代码',
        materialType: '物料类型',
        materialSpecification: '规格型号',
        number: '总数量',
        comment: '备注'
      }
      let enHeader = [
        'createTime', 'updateTime', 'allocationCode', 'pickingOrderCode', 'pickUpWarehouse', 'goodsPickingKey', 'materialCode', 'materialType', 'materialSpecification', 'number', 'comment'
      ]
      dataTool.exportExcel(znHeader, enHeader, exportData, '调拨单')
    } else {
      ElMessage.error(res.message)
    }
  })
}

const setInvalid = () => {
  let data = allotSlipDataSource.value.selections.map(item => item.allocationCode)
  let params = {
    list: data
  }
  allotSlipDataSource.value.setAllotInvaild(params).then(res => {
    if (res.code === 200) {
      ElMessage.success('设置成功')
      allotSlipDataSource.value.initData()
    } else {
      ElMessageBox.alert(res, '警告', {
        type: 'error',
        confirmButtonText: '确定',
        dangerouslyUseHTMLString: true
      })
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
</style>