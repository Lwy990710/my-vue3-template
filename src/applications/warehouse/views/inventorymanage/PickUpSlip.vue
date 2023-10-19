<template>
  <div class="main">
    <div class="data-filter">
      <data-filter
        ref="filter"
        :filter-items="pickupDataSource.tableHeader"
        @search="pickupDataSource.search($event,pickupDataSource,proxy.$refs.table)"
      />
    </div>
    <div class="extend-handle">
      <div class="extend-handle-left">
        <el-button
          v-authority="'MENU_PICKING_ORDER_WRITE'"
          class="handle-btn mr12"
          color="#4a78bd"
          style="color: #666"
          plain
          @click="addFile"
        >
          新增
        </el-button>
        <el-upload
          v-authority="'MENU_PICKING_ORDER_WRITE'"
          class="inline-block mr12"
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
        </el-upload>
        <el-button
          class="handle-btn"
          color="#4a78bd"
          style="color: #666"
          plain
          @click="exportData"
        >
          导出Excel
        </el-button>
        <el-dropdown
          v-authority="'FUNCTION_MOVE_PICKING_TO_LOG_SYS'"
          trigger="click"
          @command="moveToLog"
        >
          <el-button
            class="handle-btn ml12"
            color="#4a78bd"
            style="color: #666"
            plain
          >
            推送至物流系统<el-icon class="el-icon--right">
              <arrow-down />
            </el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="1">
                工程机类型
              </el-dropdown-item>
              <el-dropdown-item command="2">
                商家仓类型
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-popconfirm
          :title="`是否确定删除 ` + pickupDataSource.selections.length + ` 条数据`"
          confirm-button-text="确定"
          cancel-button-text="再想想"
          @confirm="deleteRecords"
        >
          <template #reference>
            <el-button
              class="handle-btn-delete ml12"
              color="#f56c6c"
              style="color: #666"
              plain
            >
              批量删除
            </el-button>
          </template>
        </el-popconfirm>
        <el-tooltip
          class="box-item"
          effect="dark"
          content="下载导入模板"
          placement="top"
        >
          <el-button
            color="#5f6368" style="color: #FFFFFF"
            size="small"
            icon="Download" circle
            @click="downloadTemplate"
          />
        </el-tooltip>
        <span style="display:inline-block;margin-left:20px;font-size:12px;color:red">
          Tips: 按住shift + 鼠标滚轮可以横向滚动表格 && 按住 Ctrl + 鼠标左键快捷选择
        </span>
      </div>
      <div class="extend-handle-right">
        <el-button
          v-authority="'MENU_PICKING_ORDER_WRITE'"
          class="handle-btn mr10"
          color="#4a78bd"
          style="color: #666"
          plain
          @click="autoAddVirtualInventory"
        >
          手动增加虚拟库存
        </el-button>
      </div>
    </div>
    <v-table
      ref="table"
      need-check-box
      need-end-handle
      :default-end-handle="false"
      need-dynamic-editing-header
      :customize-end-handle="customHandle"
      :total="pickupDataSource.total"
      :current-page="pickupDataSource.currentPage"
      :page-size="pickupDataSource.pageSize"
      :for-mat-data="pickupDataSource.forMatDataV2"
      :table-data="pickupDataSource.tableData"
      :columns="pickupDataSource.tableHeader"
      :loading="loading"
      @selectionChange="pickupDataSource.selectionChange($event,pickupDataSource,proxy.$refs.table)"
      @refresh="pickupDataSource.initData(pickupDataSource, proxy.$refs.table)"
      @editRow="goCompile"
      @deleteRow="deleteRecord"
      @current-change="pickupDataSource.currentPageChange($event,pickupDataSource,proxy.$refs.table)"
      @sizeChange="pickupDataSource.pageSizeChange($event,pickupDataSource,proxy.$refs.table)"
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
          :is-show-edit-table-header="isShowEditTableHeader" :modules="'pickUpSlip'"
          @updateCompleted="updateHeaderCompleted"
        />
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { ElButton, ElMessage, ElMessageBox } from 'element-plus'
import VTable from '@/components/public/virtualTable.vue'
import dataFilter from '@/components/common/dataFilter.vue'
import dynamicHeader from '@/components/common/dynamicHeader.vue'
import { onBeforeMount, ref, getCurrentInstance, h, watch } from 'vue'
import { formatExcelDate, changeTime } from '../../public/jxRequest'
import { useRouter, useRoute } from 'vue-router'
import { PickupDataSource, loading } from '../../utils/pickup/index'
const _emits = defineEmits(['deleteRow'])
const { proxy } = getCurrentInstance()
const router = useRouter()
let pickupDataSource = ref(null)
let pro = JSON.parse(sessionStorage.getItem("userPermissions"))
let pickupWrite = pro.includes('MENU_PICKING_ORDER_WRITE')
const isShowEditTableHeader = ref(false)
const updateHeaderCompleted = () => {
  isShowEditTableHeader.value = false
  pickupDataSource.value.initTableHeader()
}

let dataTool = null // 数据工具类实例

let route = useRoute()
watch(() => route.path, (newPath, oldPath) => {
  if (newPath === '/inventory/pickup') {
    if (!pickupDataSource.value) pickupDataSource.value = new PickupDataSource({
      modules: 'pickUpSlip',
      selectUri: '/pickingOrderMain/select',
      deleteUri: '/pickingOrderMain/delete',
      selectOneUri: '/'
    })
    pickupDataSource.value.initData(this)
  }
})

onBeforeMount(() => {
  if (!pickupDataSource.value) pickupDataSource.value = new PickupDataSource({
    modules: 'pickUpSlip',
    selectUri: '/pickingOrderMain/select',
    deleteUri: '/pickingOrderMain/delete',
    selectOneUri: '/'
  })
  pickupDataSource.value.initTableHeader()
  initData()
})

const initData = () => {
  pickupDataSource.value.initData(this, proxy.$refs.table)
}

const deleteRecords = () => {
  if (!pro.includes('FUNCTION_PICKING_ORDER_DELETE')) {
    ElMessage.error('该用户没有删除提货订单的权限')
    return
  }
  let params = []
  if (pickupDataSource.value.selections.length){
    pickupDataSource.value.selections.forEach(item => {
      params.push(item.id)
    })
  } else {
    ElMessage.error('请先选择数据')
    return
  }
  pickupDataSource.value.delete(params, proxy.$refs.table, this).then((res) => {
    if (res === 200){
      ElMessage.success(`成功删除${params.length}条数据`)
    } else ElMessage.error(res)
  })
}

const deleteRecord = (id) => {
  if (!pro.includes('FUNCTION_PICKING_ORDER_DELETE')) {
    ElMessage.error('该用户没有删除提货订单的权限')
    return
  }
  let params = [id]
  ElMessageBox.alert('是否确认删除这条数据', '提示', {
    type: 'error',
    showCancelButton: true,
    cancelButtonText: '再想想',
    confirmButtonText: '确认删除',
    confirmButtonClass: 'delete-confirm-btn',
    callback: (action) => {
      if (action === 'cancel') return
      else {
        pickupDataSource.value.delete(params, proxy.$refs.table, this).then((res) => {
          if (res === 200){
            ElMessage.success('成功删除1条数据')
          } else ElMessage.error(res)
        })
      }
    }
  })
}

const handleXlsxData = (pendingData) => {
  let handleXlsxData = [] // 最终数据列表
  let hasAddInDataList = [] // 存储已经添加在最终数据列表的数据 聚合用
  let hasAddInDetailList = [] // 存储已经添加在最终数据列表的数据的详情列表 聚合用
  let materialTempObject = {}
  pendingData.forEach((data, idx) => {
    let isString = typeof data['下单日期'] //判断日期格式
    console.log(isString, 'type')
    let temp = {
      gejiangOrderCode: data['发货单号'],
      merchantName: data['商家名称'],
      deliverWarehouse: data['发货仓库'],
      orderTime: isString === 'string' ? Date.parse(data['下单日期']) : Date.parse(formatExcelDate(data['下单日期'])),
      goodsPickingKey: data['提货密钥'].toString(),
      orderNotes: data['订单备注'],
      otherNotes: data['送货备注'],
      totalAmount: 0,
      detailExcelDTOList: []
    } // 定义原始数据

    // 判断是否添加过需要聚合的数据,如果没有则添加到最终数据列表里面,如果有跳过
    if (!hasAddInDataList.includes(temp.gejiangOrderCode)) {
      hasAddInDataList.push(temp.gejiangOrderCode)
      handleXlsxData.push(temp)
    }

    let materialTemp = {
      materialName: data['商品名称'],
      specification: data['规格型号'],
      goodsAmount: parseInt(data['数量']),
      machineSetCode: data['套机码']
    }

    // 找到需要聚合数据具体在哪个索引值,找到后把新物料加入到detail列表
    let orderIndex = hasAddInDataList.findIndex(gejiangOrderCode => gejiangOrderCode === temp.gejiangOrderCode)

    // 判断是否添加过需要聚合的数据的详情列表,如果没有则添加到最终数据详情列表里面,如果有对应索引加数量
    if (!hasAddInDetailList.includes(temp.gejiangOrderCode + materialTemp.machineSetCode)){
      hasAddInDetailList.push(temp.gejiangOrderCode + materialTemp.machineSetCode)
      handleXlsxData[orderIndex].detailExcelDTOList.push(materialTemp)

      // 保存当前销售单号下面的物料代码的索引
      materialTempObject[temp.gejiangOrderCode + materialTemp.machineSetCode] = handleXlsxData[orderIndex].detailExcelDTOList.length - 1
    } else {
      let materialIdx = materialTempObject[temp.gejiangOrderCode + materialTemp.machineSetCode]
      handleXlsxData[orderIndex].detailExcelDTOList[materialIdx].goodsAmount += materialTemp.goodsAmount
    }
    handleXlsxData[orderIndex].totalAmount += materialTemp.goodsAmount
  })
  return handleXlsxData
}

const fileChoice = async (file) => {
  if (!pickupWrite) {
    ElMessage.error('该用户没有操作提货订单的权限')
    return
  }
  if (!dataTool) dataTool = new proxy.$DataTool()
  let xlsxData = await dataTool.xlsx2DataObject(file.raw)
  let params = {
    list: handleXlsxData(xlsxData)
  }

  pickupDataSource.value.excelAddBatch(params).then(res => {
    if (res === 200){
      ElMessage.success('导入成功')
      initData()
    } else {
      ElMessageBox.alert(res, '警告', {
        type: 'error',
        confirmButtonText: '确定',
        dangerouslyUseHTMLString: true
      })
    }
  })
}

const goCompile = ({ id, pickingOrderCode }) => {
  router.push({
    path: '/inventory/pickup/newFile',
    query: { id, pickingOrderCode }
  })
}

const addFile = () => {
  if (!pickupWrite) {
    ElMessage.error('该用户没有操作提货订单的权限')
    return
  }
  router.push({
    path: '/inventory/pickup/newFile'
  })
}

const customHandle = (rowData) => {
  return [h('div', { class: 'table-handel-div' }, [h(
    ElButton,
    { onClick: () => { goCompile(rowData) }, type: "primary", icon: "Edit", text: true, style: 'padding:0;margin:0;background:transparent' },
    { default: () => "编辑" }
  ), h(
    ElButton,
    { onClick: () => { deleteRecord(rowData.id, 1) }, type: "danger", icon: "Delete", text: true, style: 'padding:0;margin:0;background:transparent' },
    { default: () => "删除" }
  )])]
}

const autoAddVirtualInventory = () => {
  if (pickupDataSource.value.selections.length === 0){
    ElMessage.error('请先选择数据')
    return
  }
  let index = pickupDataSource.value.selections.findIndex(item => item.isAddStock === '是')
  if (index !== -1){
    ElMessage.error('仅允许未增加虚拟库存的订单手动增加虚拟库存')
    return
  }
  let params = new proxy.$DataTool().objectListGetValueByKey(pickupDataSource.value.selections, 'pickingOrderCode', 'list')
  ElMessageBox.alert('确认增加虚拟库存吗？', '提示', {
    type: 'warning',
    showCancelButton: true,
    cancelButtonText: '再想想',
    confirmButtonText: '确认',
    callback: (action) => {
      if (action === 'cancel') return
      else {
        pickupDataSource.value.doAddMerchantStock(params, proxy.$refs.table, this).then((res) => {
          if (res.code === 200){
            ElMessage.success('手动添加虚拟库存成功')
            pickupDataSource.value.initData(this, proxy.$refs.table)
          } else ElMessage.error(res)
        })
      }
    }
  })
}

const exportData = () => {
  if (pickupDataSource.value.selections.length < 1) {
    ElMessage.error('请先选择数据')
    return
  }
  let znHeader = {
    processStatus: '流程状态',
    createTime: '制单时间',
    updateTime: '最后修改时间',
    gejiangOrderCode: '发货单号',
    orderTime: '下单日期',
    merchantName: '商家名称',
    deliverWarehouse: '发货仓库',
    goodsPickingKey: '提货密钥',
    specification: '规格型号',
    machineSetCode: '套机码',
    goodsAmount: '数量'
  }
  let enHeader = [
    "processStatus",
    "createTime",
    "updateTime",
    'pickingOrderCode',
    'orderTime',
    'merchantName',
    'deliverWarehouse',
    'goodsPickingKey',
    'specification',
    'machineSetCode',
    'goodsAmount'
  ]
  let exportData = []
  pickupDataSource.value.selections.forEach(item => {
    let temp = {
      processStatus: pickupDataSource.value.forMatDataV2('processStatus', item.processStatus),
      createTime: changeTime(item.createTime),
      updateTime: changeTime(item.updateTime),
      gejiangOrderCode: item.gejiangOrderCode,
      orderTime: changeTime(item.orderTime).slice(0, 10),
      merchantName: item.merchantName,
      deliverWarehouse: item.deliverWarehouse,
      goodsPickingKey: item.goodsPickingKey

    }
    item.pickingOrderDetailVOList.forEach(item => {
      let col = {
        processStatus: temp.processStatus,
        createTime: temp.createTime,
        updateTime: temp.updateTime,
        gejiangOrderCode: temp.gejiangOrderCode,
        orderTime: temp.orderTime,
        merchantName: temp.merchantName,
        deliverWarehouse: temp.deliverWarehouse,
        goodsPickingKey: temp.goodsPickingKey,
        specification: item.specification,
        goodsAmount: item.goodsAmount,
        machineSetCode: item.machineSetCode
      }
      exportData.push(col)
    })
  })
  setTimeout(() => {
    if (!dataTool) dataTool = new proxy.$DataTool()
    dataTool.exportExcel(znHeader, enHeader, exportData, '提货订单')
  }, 100)
}

const downloadTemplate = () => {
  window.location = 'https://jxwlapp.oss-cn-guangzhou.aliyuncs.com/excelTemplate/提货订单导入模板.xlsx?download'
}

const moveToLog = (val) => {
  if (pickupDataSource.value.selections.length === 0){
    proxy.$message.error('请先选择数据')
    return
  }
  let params = []
  for (let i = 0; i < pickupDataSource.value.selections.length;i++){
    if (pickupDataSource.value.selections[i].processStatus !== 'PICK_ORDER_NO_ALLOCATION'){
      proxy.$message.error('只有未调拨的提货订单可以操作')
      return
    } else params.push(pickupDataSource.value.selections[i].pickingOrderCode)
  }
  pickupDataSource.value.moveToLogSys({ warehouseFlag: +val, params }).then(res => {
    if (res.code === 200){
      proxy.$message.success('推送成功')
      initData()
    } else {
      proxy.$message.error(res)
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
  .expand-tableData{
    width: 70vw;
    margin-left: 4vw;
}
.descriptions{
  display: flex;
  align-items: center;
  &-idx{
    width: 28px;
    height: 22px;
    border: 1px solid #303133;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 12px;
    color: #303133;
  }
  &-item{
    padding: 8px;
    width: 150px;
    margin-left: 20px;
    &-span{
    font-weight: 700;
  }
  }
  .dlong{
    width: 600px;
  }
  .long{
    width: 250px;
  }

}
}
</style>