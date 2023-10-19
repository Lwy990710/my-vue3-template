<template>
  <div>
    <div class="message_area">
      <goBack :back-config="backConfig" />
      <div class="form_area bfc">
        <!--         <el-steps
          :active="active"
          align-center
          finish-status="success"
        >
          <el-step title="制单" />
          <el-step title="盘点中" />
          <el-step title="审核" />
          <el-step title="归档" />
        </el-steps> -->
      </div>
      <!--       <el-divider content-position="center">
        盘点明细
      </el-divider>
      <div class="table">
        <simple-table
          ref="checkDetailTable"
          :loading="missionLoading" need-change-size
          :show-tips="false" :table-header="checkMissionDetailDataSource.tableHeader"
          :table-data="checkMissionDetailDataSource.tableData" :total="checkMissionDetailDataSource.total"
          @current-change="checkMissionDetailDataSource.currentPageChange($event,checkMissionDetailDataSource,proxy.$refs.checkDetailTable)"
          @sizeChange="checkMissionDetailDataSource.pageSizeChange($event,checkMissionDetailDataSource,proxy.$refs.checkDetailTable)"
        />
      </div> -->
      <div>
        <data-filter
          ref="filter"
          is-pad
          :filter-items="checkPersonDataSource.tableHeader"
          @search="personSearch"
        />
        <div style="padding: 10px">
          <el-button type="primary" @click="finishCheck">
            盘点完成
          </el-button>
          <el-button type="success" @click="openDialog">
            新增盘点物料
          </el-button>
          <el-button type="danger" @click="back">
            返回
          </el-button>
        </div>
        <div class="table">
          <simple-table
            ref="personTable"
            :loading="missionLoading && positionLoading" need-change-size
            :show-tips="true" :table-header="checkPersonDataSource.tableHeader"
            :tips="'Tips：点击实盘数量单元格可修改实盘数量'"
            :for-mat-data="personForMatData"
            :current-page="checkPersonDataSource.currentPage"
            :table-data="checkPersonDataSource.tableData"
            :page-size="checkPersonDataSource.pageSize"
            :total="checkPersonDataSource.total"
            @current-change="checkPersonDataSource.currentPageChange($event,checkPersonDataSource)"
            @sizeChange="checkPersonDataSource.pageSizeChange($event,checkPersonDataSource)"
            @cellDbClick="clickCell"
          >
            <template #firmOfferQuantity="scope">
              <div v-if="scope.row.firmOfferQuantityEdit">
                <el-input-number
                  ref="firmOfferQuantityInput"
                  v-model="scope.row.firmOfferQuantity"
                  style="width: 80%"
                  :min="0" :controls="false"
                  @blur="cancelEidt(scope.row,'firmOfferQuantity')"
                />
              </div>
              <div v-else>
                {{ scope.row.firmOfferQuantity }}
              </div>
            </template>
          </simple-table>
        </div>
        <el-dialog
          v-model="showDialog" width="20%"
          :show-close="false" center :close-on-click-modal="false"
        >
          <template #header>
            <div class="jx-dialog-header">
              <h4>
                新增盘点物料
              </h4>
              <div>
                <el-button
                  class="dialog-close-btn" type="danger"
                  icon="CloseBold"
                  circle
                  @click="closeDialog"
                />
              </div>
            </div>
          </template>
          <div style="text-align:center">
            <el-form :model="newRecord" :rules="rules">
              <el-form-item label="条码" prop="barCodes">
                <el-input
                  v-model="newRecord.barCodes" style="width: 200px"
                  placeholder="输入物料条码"
                />
              </el-form-item>
              <el-form-item label="规格型号" prop="materialSpecification">
                <el-input
                  v-model="newRecord.materialSpecification" style="width: 200px"
                  placeholder="输入规格型号"
                >
                  <template #append>
                    <el-button @click="getMaterialSpecification">
                      <el-icon><Search /></el-icon>
                    </el-button>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item label="仓位" prop="warehousePositionName">
                <el-select
                  v-model="newRecord.warehousePositionName" style="width: 200px"
                  placeholder="选择仓位" filterable
                >
                  <el-option
                    v-for="item in wareHousePositionDataSource.tableData" :key="item.id"
                    :label="item.positionsName" :value="`${item.positionsName}+${item.positionCode}}`"
                  />
                </el-select>
              </el-form-item>
            </el-form>
          </div>
          <template #footer>
            <el-button type="primary" @click="addCheckRecord">
              保存
            </el-button>
            <el-button @click="closeDialog">
              取消
            </el-button>
          </template>
        </el-dialog>
        <el-dialog
          v-model="showMaterialSpecificationDialog" width="20%"
          :show-close="false" center :close-on-click-modal="false"
        >
          <template #header>
            <div class="jx-dialog-header">
              <h4>
                选择规格型号
              </h4>
              <div>
                <el-button
                  class="dialog-close-btn" type="danger"
                  icon="CloseBold"
                  circle
                  @click="closeMaterialSpecificationDialog"
                />
              </div>
            </div>
          </template>
          <div style="text-align:center">
            <simple-table
              ref="goodTable"
              need-selection
              :loading="goodLoading"
              :show-tips="false" :table-header="goodDataSource.tableHeader"
              :current-page="goodDataSource.currentPage"
              :table-data="goodDataSource.tableData"
              :total="goodDataSource.total"
              @selectionChange="goodDataSource.selectionChange($event,goodDataSource,proxy.$refs.goodTable)"
            />
          </div>
          <template #footer>
            <el-button type="primary" @click="setMS">
              保存
            </el-button>
            <el-button @click="closeMaterialSpecificationDialog">
              取消
            </el-button>
          </template>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script setup>
import goBack from '@/components/common/goBack.vue'
import SimpleTable from '@/components/SimpleTable.vue'
import dataFilter from '@/components/common/dataFilter'
import { CheckMissionDataSource, loading as missionLoading } from '../../utils/checkMission/checkMission'
import { GoodDataSource, loading as goodLoading } from '@/applications/warehouse/utils/good'
import NewFileForm from '@/components/NewFileForm.vue'
import { onMounted, reactive, ref, watch, onBeforeMount, getCurrentInstance } from 'vue'
import { WareHousePositionDataSource, loading as positionLoading } from '@/applications/warehouse/utils/warehouse'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
let { proxy } = getCurrentInstance()
let allocationData = ref(null)
let pro = JSON.parse(sessionStorage.getItem("userPermissions"))
const userInfo = JSON.parse(sessionStorage.getItem('userInfo'))

let backConfig = reactive([{ title: '其他', path: '' }, { title: '盘点工作', path: '' }, { title: '个人盘点工作', path: '' }])
let router = useRouter()
let route = useRoute()
let showDialog = ref(false)
let newRecord = reactive({
  barCodes: '',
  warehousePositionName: '',
  materialSpecification: '',
  materialCode: ''
})

let rules = reactive({
  warehousePositionName: [{ required: true, message: '仓位不能为空', trigger: 'blur' }]
})
let positionList = reactive([])
onBeforeMount(() => {
  allocationData.value = JSON.parse(sessionStorage.getItem('allocationData'))
  initDataSource()
  if (allocationData.value.id) {
    initData()
  }
})

const initDataSource = () => {
  if (!checkPersonDataSource.value) {
    checkPersonDataSource.value = new CheckMissionDataSource({
      selectUri: '/inventoryTaskDetailAllocation/select',
      tableHeader: checkPersonTableHeader,
      pageSize: 10
    })
  }

  if (!wareHousePositionDataSource.value) {
    wareHousePositionDataSource.value = new WareHousePositionDataSource({
      selectUri: '/warehousePosition/select',
      pageSize: 100000
    })
  }
}

const initData = () => {
  if (allocationData.value.isOpenCheck === 2) {
    checkPersonDataSource.value.tableHeader = checkPersonTableHeader.filter(item => {
      return item.label !== '账面数量' && item.label !== '盈亏数量'
    })
    console.log(checkPersonDataSource.value.tableHeader)
  }
  wareHousePositionDataSource.value.searchData['warehouseCode'] = userInfo.warehouseCode
  wareHousePositionDataSource.value.initData()
  checkPersonDataSource.value.searchData['inventoryTaskOrderCode'] = allocationData.value.inventoryTaskOrderCode
  checkPersonDataSource.value.searchData['inventoryUserName'] = route.query.inventoryUserName
  checkPersonDataSource.value.initData()
}
let checkPersonDataSource = ref(null) //盘点结果
let wareHousePositionDataSource = ref(null)
const back = () => {
  router.go(-1)
}

const checkPersonTableHeader = [
  {
    label: '盘点单号',
    prop: 'inventoryTaskOrderCode',
    type: 'none'
  }, {
    label: '流程状态',
    prop: 'processStatus',
    type: 'select',
    options: [{
      label: '未盘点',
      value: 'INVENTORY_TASK_ALLOCATION_NOT_STARTED'
    }, {
      label: '盘点完成',
      value: 'INVENTORY_TASK_ALLOCATION_END'
    }, {
      label: '待复盘',
      value: 'INVENTORY_TASK_ALLOCATION_REVIEWED'
    }]
  }, {
    label: '盘点人',
    prop: 'inventoryUserName',
    type: 'none'
  }, {
    label: '仓库名称',
    prop: 'warehouseName',
    type: 'none'
  }, {
    label: '仓位名称',
    prop: 'warehousePositionName',
    type: 'text'
  }, {
    label: '物料代码',
    prop: 'materialCode',
    type: 'text'
  }, {
    label: '物料名称',
    prop: 'materialName',
    type: 'none'
  }, {
    label: '规格型号',
    prop: 'materialSpecification',
    type: 'none'
  }, {
    label: '物料类型',
    prop: 'materialType',
    type: 'none'
  }, {
    label: '账面数量',
    prop: 'bookQuantity',
    type: 'none'
  }, {
    label: '实盘数量',
    prop: 'firmOfferQuantity',
    type: 'none',
    needScope: true
  }, {
    label: '盈亏数量',
    prop: 'profitAndLossQuantity',
    type: 'none'
  }, {
    label: '备注',
    prop: 'comment',
    type: 'text'
  }
]

const personForMatData = (row, column) => {
  let status = {
    INVENTORY_TASK_ALLOCATION_NOT_STARTED: '未盘点',
    INVENTORY_TASK_ALLOCATION_END: '盘点完成',
    INVENTORY_TASK_ALLOCATION_REVIEWED: '待复盘'
  }
  if (column.property === 'processStatus') return status[row[column.property]]
  else if (typeof row[column.property] === 'number') {
    return row[column.property]
  } else {
    return row[column.property] ? row[column.property] : '-'
  }
}

const checkDetailForMatData = (row, column) => {
  let status = {
    INVENTORY_TASK_DETAIL_NOT_STARTED: '等待汇总',
    INVENTORY_TASK_DETAIL_END: '汇总完成',
    INVENTORY_TASK_DETAIL_ERR: '汇总异常'
  }
  if (column.property === 'processStatus') return status[row[column.property]]
  else if (typeof row[column.property] === 'number') {
    return row[column.property]
  } else {
    return row[column.property] ? row[column.property] : '-'
  }

}

const clickCell = (row, column, cell, event) => {
  if (column.property === 'firmOfferQuantity') {
    row['firmOfferQuantityEdit'] = true
  }
}

const cancelEidt = (row, type) => {
  row[`${type}Edit`] = false
  if (!row['firmOfferQuantity']){
    row['firmOfferQuantity'] = 0
  }
  row['profitAndLossQuantity'] = row['firmOfferQuantity'] - row['bookQuantity']
  checkPersonDataSource.value.allocationUpdateBatch(row).then(res => {
    if (res.code === 200) {
      ElMessage.success('盘点成功')
    } else {
      ElMessage.error(res)
    }
    initData()
  })
}

const finishCheck = () => {
  checkPersonDataSource.value.finishCheck(allocationData.value).then(res => {
    if (res.code === 200) {
      ElMessage.success('完结成功')
      initData()
    } else {
      ElMessage.error(res)
    }
  })
}

const closeDialog = () => {
  showDialog.value = false
  Object.keys(newRecord).forEach(key => {
    newRecord[key] = ''
  })
}

const addCheckRecord = () => {
  if (newRecord['materialSpecification'].trim().length > 0) {
    let params = {
      inventoryTaskOrderCode: checkPersonDataSource.value.tableData[0].inventoryTaskOrderCode,
      warehouseCode: userInfo.warehouseCode,
      warehouseName: userInfo.warehouseName,
      warehousePositionName: newRecord.warehousePositionName.split('+')[0],
      warehousePositionCode: newRecord.warehousePositionName.split('+')[1],
      materialCode: newRecord.materialCode,
      inventoryUserId: checkPersonDataSource.value.tableData[0].inventoryUserId,
      inventoryUserName: checkPersonDataSource.value.tableData[0].inventoryUserName
    }
    checkPersonDataSource.value.addCheckRecord(params).then(res => {
      if (res.code === 200) {
        ElMessage.success('新增成功')
        initData()
      } else {
        ElMessage.error(res)
      }
      closeDialog()
    })
  } else {
    let params = {
      inventoryTaskOrderCode: checkPersonDataSource.value.tableData[0].inventoryTaskOrderCode,
      warehouseCode: userInfo.warehouseCode,
      warehouseName: userInfo.warehouseName,
      warehousePositionName: newRecord.warehousePositionName.split('+')[0],
      warehousePositionCode: newRecord.warehousePositionName.split('+')[1],
      barCodes: newRecord.barCodes,
      inventoryUserId: checkPersonDataSource.value.tableData[0].inventoryUserId,
      inventoryUserName: checkPersonDataSource.value.tableData[0].inventoryUserName
    }
    checkPersonDataSource.value.addCheckRecord(params).then(res => {
      if (res.code === 200) {
        ElMessage.success('新增成功')
        initData()
      } else {
        ElMessage.error(res)
      }
      closeDialog()
    })
  }

}

const openDialog = () => {
  showDialog.value = true
}

const personSearch = (data) => {
  data['inventoryTaskOrderCode'] = allocationData.value.inventoryTaskOrderCode
  checkPersonDataSource.value.search(data, checkPersonDataSource.value, proxy.$refs.personTable)
}

let goodDataSource = ref(null)
let showMaterialSpecificationDialog = ref(false)
const getMaterialSpecification = async () => {
  if (!goodDataSource.value) {
    goodDataSource.value = new GoodDataSource({
      selectUri: '/material/select',
      pageSize: 10,
      tableHeader: [{
        label: '规格型号',
        prop: 'materialSpecification'
      }]
    })
  }
  goodDataSource.value.searchData['materialSpecification'] = newRecord['materialSpecification']
  await goodDataSource.value.initData()
  if (goodDataSource.value.total <= 10) {
    showMaterialSpecificationDialog.value = true
  } else {
    ElMessage.error('数据量太大，请输入更准确的型号')
  }

}

const setMS = () => {
  let { selections } = goodDataSource.value
  if (selections.length > 1) {
    ElMessage.error('只能选择一条数据')
  } else {
    newRecord['materialSpecification'] = selections[0]['materialSpecification']
    newRecord['materialCode'] = selections[0]['materialCode']
    closeMaterialSpecificationDialog()
  }
}

const closeMaterialSpecificationDialog = () => {
  proxy.$refs.goodTable.clearSelection()
  showMaterialSpecificationDialog.value = false
}
</script>

<style lang="less" scoped>
    .message_area {
    border-radius: 8px;
    padding: 10px;
    background-color: #ffffff;

    .form_area {
        padding: 15px;
        padding-bottom: 0;
        .form_title {
        text-align: center;
        font-size: 24px;
        color: #595959;
        font-weight: 700;
        }
    }

    .handle_area {
        margin: 15px auto;
        text-align: center;
    }
    }
    .table_area {
    margin-top: 20px;
    .position_table {
        border-radius: 8px;
        margin-bottom: 20px;
        padding: 15px;
        background-color: #ffffff;
    }
    .table-title{
    width: 100%;
    border: 1px solid #fff;
    text-align: center;
    font-weight: 700;
    font-size: 20px;
    }
    }

    :deep(.el-divider__text){
      margin-top: 0;
      font-size: 16px;
      font-weight: 700;
  }

  .isChoose {
        margin: 15px 0;
    }
</style>