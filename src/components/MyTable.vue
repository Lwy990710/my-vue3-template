<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="table">
    <slot name="filter" />
    <div class="table_title">
      {{ title }}
    </div>
    <div v-if="needHandle" class="handle">
      <el-button
        v-if="needAddFile"
        color="#48C776"
        style="color: #FFFFFF"
        @click="addFile"
      >
        新增
      </el-button>
      <el-button
        v-if="needPrint"
        color="#48C776"
        style="color: #FFFFFF;"
        @click="printSetCar"
      >
        打印派车单
      </el-button>
      <el-popconfirm
        v-if="optionsBtn!=='material'"
        :title="`是否确定删除 ${selections.length} 条数据`"
        confirm-button-text="确定"
        cancel-button-text="取消"
        @confirm="deleteRecords"
      >
        <template #reference>
          <el-button
            type="danger"
            style="color: #FFFFFF;"
          >
            批量删除
          </el-button>
        </template>
      </el-popconfirm>

      <el-dropdown
        v-if="needPrintSell" style="margin:0 10px"
        @command="printCommand"
      >
        <el-button
          color="#373737"
          style="color: #FFFFFF;"
        >
          打印<el-icon class="el-icon--right">
            <arrow-down />
          </el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="printSupplySlip">
              打印集配单
            </el-dropdown-item>
            <el-dropdown-item command="printDelivery">
              打印配送单
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-upload
        v-if="needUpload"
        class="upload"
        accept=".xlsx, .xls"
        :before-upload="beforeUpload"
        :on-error="handleError"
        :show-file-list="false"
        :http-request="()=>{}"
      >
        <el-button v-if="needUpload" type="primary">
          导入Excel
        </el-button>
      </el-upload>
      <el-button
        v-if="needExport" type="warning"
        style="margin-bottom: 2px" @click="exportExcel"
      >
        批量导出
      </el-button>
      <el-button
        v-if="needStockUp"
        color="#171c27" style="color: #FFFFFF;float:right"
        @click="stockUp"
      >
        一键备货
      </el-button>
      <el-button
        v-if="false"
        color="#a42240" style="color: #FFFFFF;float:right"
        @click="setCarSetting"
      >
        提货设置
      </el-button>
      <!-- <el-button
        v-if="needDownload"
        color="#171c27" style="color: #FFFFFF"
        @click="downloadTemplate"
      >
        下载导入模板
      </el-button> -->
      <el-tooltip
        v-if="needDownload"
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
      <el-dropdown
        v-if="isAllotCarTeam&&permissionsArr.includes('FUNCTION_MOVE_LOG_TO_PRE_WAREHOUSE')"
        trigger="click" style="color: #FFFFFF;float:right;margin-left:12px"
        @command="moreAction"
      >
        <el-button type="primary">
          更多
          <el-icon class="el-icon--right">
            <arrow-down />
          </el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item v-if="permissionsArr.includes('FUNCTION_MOVE_LOG_TO_PRE_WAREHOUSE')" command="LOG_TO_PRE">
              转移至前置仓入库
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-dropdown
        v-if="isAllotCarTeam"
        trigger="click" style="color: #FFFFFF;float:right"
        @command="createSlip"
      >
        <el-button
          type="primary" color="rgb(110, 112, 240)"
          style="color: #FFFFFF;float:right"
        >
          制作派车单
          <el-icon class="el-icon--right">
            <arrow-down />
          </el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-menu>
              <el-dropdown-item v-if="route.path==='/decrease/logistics'" command="normal">
                制作普通派车单
              </el-dropdown-item>
              <el-dropdown-item v-if="route.path==='/decrease/logistics'" command="allocation">
                制作调拨派车单(韶关)
              </el-dropdown-item>
              <el-dropdown-item v-if="route.path==='/decrease/logisticsAllocation'" command="secondaryTrans">
                二次派车
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <!-- <el-tooltip
        v-if="isAllotCarTeam"
        class="box-item"
        effect="dark"
        content="将物流订单转制成派车单"
        placement="top-end"
      >
        <el-button
          color="rgb(110, 112, 240)"
          style="color: #FFFFFF;float:right;margin-left:6px"
          @click="createSlip()"
        >
          一键转制
        </el-button>
      </el-tooltip> -->

      <el-button
        v-if="isAllotCarTeam"
        color="#A42240"
        style="color: #FFFFFF;float:right;margin-right:12px"
        @click="allot()"
      >
        一键分配
      </el-button>
      <el-button
        v-if="isAllotCarTeam"
        color="#fb460a"
        style="color: #FFFFFF;float:right;margin-right:12px"
        @click="scheduleTime"
      >
        一键预约
      </el-button>
      <el-button
        v-if="isAllotCarTeam"
        color="#ff6a00"
        style="color: #FFFFFF;float:right"
        @click="hideDetail"
      >
        {{ isDetail ? '一键折叠': '一键展开' }}
      </el-button>
      <span v-if="needTips" style="display:inline-block;margin-left:20px;font-size:12px;color:red">
        Tips: 按住shift加鼠标滚轮可以横向滚动表格 {{ expandTips }}
      </span>
    </div>
    <slot name="extraHandle" />
    <el-table
      ref="tableRef"
      v-loading="loading"
      class="table-class"
      :max-height="820"
      highlight-current-row
      fix
      :show-summary="needSummary"
      :span-method="objectSpanMethod"
      :summary-method="isLogistics ? logisticsGetSummaries : summary"
      :data="tableData"
      :row-style="rowStyle ? rowStyle:{height: '35px',borderColor:'rgba(192, 192, 192,.5)'}"
      :cell-style="{padding: '0',borderColor:'rgba(192, 192, 192,.5)'}"
      style="width: 100%"
      :border="needBorder"
      :header-cell-style="headerCellStyle"
      :header-row-style="{ borderColor:'rgba(192, 192, 192,.5)'}"
      :row-key="getRowKeys"
      :expand-row-keys="expandList"
      @selection-change="selectionChange"
      @expand-change="expandChange"
    >
      <el-table-column
        v-if="carSlipDetails"
        width="180"
        label="操作"
        align="center"
        fixed="left"
      >
        <template #default="{row}">
          <div v-if="setCarBook||(row.processStatus&&row.processStatus === 'TRANS_DETAIL_AUDIT_ING')" class="flex-center">
            <el-button
              v-if="setCarBook"
              size="small"
              @click="book(row)"
            >
              预约提货时间
            </el-button>
            <el-dropdown
              v-if="row.processStatus&&row.processStatus === 'TRANS_DETAIL_AUDIT_ING'"
              v-authority="'FUNCTION_AUDIT_TRANS_DETAIL'" trigger="click"
              @command="examine($event,row)"
            >
              <el-button
                size="small"
                class="ml10"
                type="danger"
              >
                审核
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="yes">
                    通过
                  </el-dropdown-item>
                  <el-dropdown-item command="no">
                    不通过
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <div v-else class="no-options">
            暂无操作
          </div>
        </template>
      </el-table-column>
      <el-table-column
        v-if="showExpand"
        type="expand"
        fixed="left"
      >
        <template #default="scope">
          <slot name="details" :row="scope.row" />
        </template>
      </el-table-column>
      <el-table-column
        v-if="showAllExpand"
        type="expand"
        fixed="left"
      >
        <template #default="props">
          <expandTable
            :details-table-header="detailsTableHeader"
            :details-table-header-data="props.row.logOrderDetailList"
          />
        </template>
      </el-table-column>
      <el-table-column
        v-if="needSelection"
        type="selection"
        width="55"
        align="center"
        fixed="left"
      />
      <el-table-column
        v-for="item in tableHeader"
        :key="item.prop"
        :fixed="item.isFixed"
        :label="item.label"
        :prop="item.prop"
        :min-width="item.width"
        :formatter="forMatData"
        align="center"
        show-overflow-tooltip
        :sortable="isLogistics"
      >
        <template #header="{ column,$index }">
          <div
            v-if="showHeaderSearchInput"
            @dblclick="showHeaderSearch"
          >
            {{ column.label }}
            <div v-for="(item,idx) in headerInputArr" :key="idx">
              <el-input
                v-if="showExpand||canShowAll ? $index === idx + 2 : $index === idx + 1" v-model="headerInputArr[idx]"
                placeholder="按回车键执行查询"
                style="height: 32px"
                clearable
                @keyup.enter="doHeaderSearch"
              />
            </div>
          </div>
          <div
            v-else
            @dblclick="showHeaderSearch"
          >
            {{ column.label }}
          </div>
        </template>
        <template #default="scope">
          <slot
            v-if="item.image" name="image"
            :row="scope.row"
          />
          <slot
            v-if="item.customContent" name="customContent"
            :row="scope.row"
          />
        </template>
      </el-table-column>
      <el-table-column
        v-if="needEndControl"
        fixed="right"
        label="操作"
        align="center"
        :width="optionsWidth"
      >
        <template #header="{column}">
          <div>
            <span style="margin-right:10px"> {{ column.label }} </span>
            <el-tooltip
              class="box-item"
              effect="dark"
              content="刷新数据"
              placement="top-end"
            >
              <el-button
                icon="Refresh"
                circle
                size="small"
                style="width:20px; height:20px"
                @click="refresh"
              />
            </el-tooltip>
            <el-tooltip
              v-if="needSetHeader"
              class="box-item"
              effect="dark"
              content="设置您喜欢的表头顺序"
              placement="top-end"
            >
              <el-button
                icon="Operation" circle
                size="small"
                style="width:20px; height:20px"
                @click="editTableHeader"
              />
            </el-tooltip>
          </div>
        </template>
        <template #default="scope">
          <div v-if="defaultEndRowOptions" class="flex-center">
            <el-button
              v-if="optionsBtn!=='material'"
              id="optionsBtn"
              text
              type="primary"
              class="row-options-btn"
              @click="goCompile(scope.row.id,scope.row.carrierCode,scope)"
            >
              编辑
            </el-button>
            <el-button
              v-if="optionsBtn==='material'"
              id="optionsBtn"
              text
              type="primary"
              style="background:transparent"
              @click="addMaterial(scope.row)"
            >
              确定
            </el-button>
            <el-popconfirm
              v-if="optionsBtn!=='material'"
              title="是否确定删除这条数据"
              confirm-button-text="确定"
              cancel-button-text="再想想"
              @confirm="deleteRecord(scope.row.id,scope)"
            >
              <template #reference>
                <el-button
                  id="optionsBtn" text
                  type="danger"
                  class="row-options-btn"
                >
                  删除
                </el-button>
              </template>
            </el-popconfirm>
            <slot
              name="expandOptions"
              :row="scope.row"
            />
          </div>
          <div
            v-else style="background:transparent"
            class="flex-center"
          >
            <slot
              name="defaultEndRowOptions"
              :row="scope.row"
            />
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
  <div class="page">
    <el-pagination
      :current-page="currentPage"
      background
      :small="small"
      :layout="needChangeSize ? ' total, sizes, prev, pager, next':' total, prev, pager, next'"
      :page-sizes="[10, 20, 30, 50, 100, 500]"
      :total="total"
      :page-size="pageSize"
      @current-change="currentChange"
      @size-change="handleSizeChange"
    />
  </div>
</template>

<script setup>
import * as XLSX from "xlsx"
import { ref, reactive, computed, getCurrentInstance, onMounted, watch, onBeforeMount, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import expandTable from './common/expandTable.vue'
const route = useRoute()
const { proxy } = getCurrentInstance()
const selections = reactive([])
let emit = defineEmits([
  "addFile", "goCompile", "selectionChange",
  "exportExcel", "deleteRecord",
  "currentChange", "uploadExcel",
  "subCarSlip", "deleteRecords",
  'addMaterial', 'sizeChange', 'showExpand',
  'allot', 'scheduleTime', 'createSlip', 'showHeaderSearch', 'doHeaderSearch', 'submit', 'downloadTemplate',
  'printSetCar', 'editTableHeader', 'stockUp', 'printCommand', 'refresh', 'setCarSetting', 'book', 'moreAction', 'examine'
])
let isDetail = ref(false)
const permissionsArr = JSON.parse(sessionStorage.getItem('userPermissions'))
let printCommand = (command) => emit('printCommand', command)
let stockUp = () => emit('stockUp')
let downloadTemplate = () => emit('downloadTemplate')
let printSetCar = () => emit('printSetCar')
let addFile = () => emit('addFile')
let goCompile = (id, carrierCode, scope) => emit('goCompile', id, carrierCode, scope)
let selectionChange = (selection) => {
  selections.length = 0
  selections.push(...selection)
  emit('selectionChange', selection)
}
let exportExcel = () => emit('exportExcel')
let deleteRecord = (id, scope) => emit('deleteRecord', id, scope)
let currentChange = (page) => emit('currentChange', page)
const subCarSlip = (row) => emit('subCarSlip', row)
let deleteRecords = () => emit('deleteRecords')
const addMaterial = (row) => emit('addMaterial', row)
const handleSizeChange = (val) => emit('sizeChange', val)
const scheduleTime = () => emit('scheduleTime')
const createSlip = (command) => emit('createSlip', command)
const allot = (row = null) => emit('allot', row)
const showHeaderSearch = () => emit('showHeaderSearch')
const doHeaderSearch = () => emit('doHeaderSearch', headerInputArr)
const editTableHeader = () => emit('editTableHeader')
const setCarSetting = () => emit('setCarSetting')
const moreAction = (val) => emit('moreAction', val)
const refresh = () => {
  proxy.$refs.tableRef.clearSelection()
  emit('refresh')
}
let expandList = reactive([])
const headerInputArr = reactive([])

let beforeUpload = async (file) => {
  let data = await readFile(file)
  let workbook = XLSX.read(data, { type: "binary" }),
    worksheet = workbook.Sheets[workbook.SheetNames[0]]
  data = XLSX.utils.sheet_to_json(worksheet)
  emit('uploadExcel', data)
}

let readFile = (file) => {
  return new Promise(resolve => {
    let reader = new FileReader()
    reader.readAsBinaryString(file)
    reader.onload = ev => {
      resolve(ev.target.result)
    }
  })
}

let logisticsGetSummaries = (param) => {
  const { columns, data } = param
  const sums = []
  sums[1] = '合计'
  sums[2] = '已选物流订单数：'
  sums[4] = '合计体积（m³）：'
  sums[3] = 0
  sums[5] = 0
  sums[6] = '合计数量：'
  sums[7] = 0
  if (selections.length === 0){
    sums[3] = 0
    sums[5] = 0
    sums[7] = 0
  } else {
    selections.forEach(item => {
      if (item.totalVolume) sums[5] = +sums[5] + item.totalVolume
      if (item.totalNumber) sums[7] = +sums[7] + item.totalNumber
    })
    sums[3] = selections.length
  }
  return sums
}
const initExpand = () => {
  if (props.showAllExpand){
    props.tableData.forEach(item => {
      expandList.push(item.id)
    })
  }
}

const props = defineProps({
  forMatData: {
    type: Function,
    default: (row, column) => { return row[column.property] }
  },
  total: {
    type: Number,
    default: 0
  },
  setCarBook: {
    type: Boolean,
    default: false
  },
  carSlipDetails: {
    type: Boolean,
    default: false
  },
  pageSize: {
    type: Number,
    default: 10
  },
  needChangeSize: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: true
  },
  rowStyle: {
    type: [Boolean, Function],
    default: false
  },
  isPrint: {
    type: Boolean,
    default: true
  },
  needUpload: {
    type: Boolean,
    default: true
  },
  needAddFile: {
    type: Boolean,
    default: true
  },
  needPrint: {
    type: Boolean,
    default: false
  },
  isTransferSlip: {
    type: Boolean,
    default: false
  },
  isSellSlip: {
    type: Boolean,
    default: false
  },
  needBorder: {
    type: Boolean,
    default: true
  },
  needHandle: {
    type: Boolean,
    default: true
  },
  needSummary: {
    type: Boolean,
    default: false
  },
  needSelection: {
    type: Boolean,
    default: false
  },
  small: {
    type: Boolean,
    default: false
  },
  optionsWidth: {
    type: Number,
    default: 260
  },
  needPrintSell: {
    type: Boolean,
    default: false
  },
  needTips: {
    type: Boolean,
    default: true
  },
  needDownload: {
    type: Boolean,
    default: true
  },
  needEndControl: {
    type: Boolean,
    default: true
  },
  needStockUp: {
    type: Boolean,
    default: false
  },
  showHeaderSearchInput: {
    type: Boolean,
    default: false
  },
  showExpand: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  currentPage: {
    type: [Number, String],
    default: 1
  },
  showAllExpand: {
    type: Boolean,
    default: false
  },
  isAllotCarTeam: {
    type: Boolean,
    default: false
  },
  canShowAll: {
    type: Boolean,
    default: false
  },
  needSetHeader: {
    type: Boolean,
    default: false
  },
  needExport: {
    type: Boolean,
    default: true
  },
  defaultEndRowOptions: {
    type: Boolean,
    default: true
  },
  expandTips: {
    type: String,
    default: ''
  },
  optionsBtn: {
    type: String,
    default: ''
  },
  isLogistics: {
    type: Boolean,
    default: false
  },
  headerCellStyle: {
    type: Object,
    default(){
      return { background: '#217346', color: '#fff', borderColor: 'rgba(192, 192, 192,.5)' }
    }
  },
  objectSpanMethod: {
    type: Function,
    default(){
      return (row, column, rowIndex, columnIndex) => {return { } }
    }
  },
  summary: {
    type: Function,
    default(){
      // null
    }
  },
  needHeaderSticky: {
    type: Boolean,
    default: false
  },
  stickyHeight: {
    type: Number,
    default: 400
  },
  tableHeader: {
    type: Array,
    default(){
      return []
    }
  },
  detailsTableHeader: {
    type: Array,
    default(){
      return []
    }
  },
  tableData: {
    type: Array,
    default(){
      return []
    }
  }
})
function handleSticky(){
  scrollThrottle(() => {
    let toTop = document.body.scrollTop || document.documentElement.scrollTop
    let elTable = document.getElementsByClassName('el-table__header-wrapper')[0]
    if (!elTable) return
    if (toTop >= props.stickyHeight){
      elTable.setAttribute('style', 'position:fixed;top:0;z-index:1000')
    } else {
      elTable.removeAttribute('style')
    }
  })
}

// watch(() => route.path, (newValue, oldValue) => {
//   if (props.needHeaderSticky){
//     if (newValue.indexOf('/new') !== -1){
//       window.removeEventListener('scroll', handleSticky)
//       console.log('移除滚动事件')
//     } else {
//       console.log('加载滚动事件')
//       window.addEventListener("scroll", handleSticky)
//     }
//   }
// }, { immediate: true })

const headerSticky = () => {
  if (props.needHeaderSticky){
    console.log('加载滚动事件')
    window.addEventListener("scroll", handleSticky)
  }
  else return
}
let timer = null
const scrollThrottle = (cb) => {
  if (!timer){
    timer = setTimeout(() => {
      cb()
      timer = null
    }, 500)
  }
} // 滚动节流 暂时好像不用

// onBeforeUnmount(() => {
//   if (props.needHeaderSticky){
//     window.removeEventListener('scroll', handleSticky)
//     console.log('移除滚动事件')
//   }
// })

watch(() => props.showHeaderSearchInput, () => {
  if (props.showHeaderSearchInput) {
    initHeaderSearchInput()
  }
})

const book = (val) => {
  emit('book', val)
}
const examine = (status, row) => {
  emit('examine', { status, row })
}

let temp = Array.from({ length: props.tableHeader.length }, (v, i) => '')
const initHeaderSearchInput = () => {
  headerInputArr.length = 0
  headerInputArr.push(...temp)
}
let rowColor = ref('#fafafa')
const hideDetail = () => {
  if (props.tableData.length === 0) return
  if (isDetail.value) {
    expandList.length = 0
    isDetail.value = false
  } else {
    initExpand()
    isDetail.value = true
  }

}

const clearSelection = function() {
  proxy.$refs.tableRef.clearSelection()
}

defineExpose({
  clearSelection
})

const getRowKeys = function(row){
  return row.id
}

const expandChange = (row, expandedRows) => {
  if (!props.showAllExpand){
    if (expandList.length !== 0 && expandList.includes(row.id)){
      expandList.length = 0
      return
    }
    expandList.length = 0
    expandList.push(row.id)
    emit('showExpand', row.logOrderId, row)
  } else {
    console.log(row)
  }
}

const handleError = (err) => {
  console.log(err)
}
</script>

<style lang="less" scoped>
.page {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
.headerRow{
  background: red;
}
.handle {
  padding: 14px 0px 14px 2px;
  .upload {
    display: inline-block;
    margin: 0 10px;
  }
}
.table_title {
  font-size: 16px;
  font-weight: bold;
  line-height: 40px;
  color: #595959;
}

:deep(.el-table__body tr:hover > td) {
   background-color: #e2e2e2 !important;
}

.expand-class{
  background: red;
}

:deep(.el-table__body-wrapper){
  z-index: 20;
  &::-webkit-scrollbar {
    width : 8px;
    height: 8px;
  }
}
:deep(.el-scrollbar__bar.is-horizontal){
  color: #ff0000 !important;
  height: 10px;
}
.table-class{
  border: none;
  }
:deep(.cell){
  div{
    display: inline-block;
  }
}
</style>