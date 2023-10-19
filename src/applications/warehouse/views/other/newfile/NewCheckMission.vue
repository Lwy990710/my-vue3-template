<template>
  <div>
    <div class="message_area">
      <goBack :back-config="backConfig" :need-go-back="false" />
      <div class="form_area bfc">
        <el-steps
          :active="active"
          align-center
          finish-status="success"
        >
          <el-step title="制单" />
          <el-step title="盘点中" />
          <el-step title="审核" />
          <el-step title="归档" />
        </el-steps>
        <div class="form_title">
          {{ formData.id ? checkFormData.title.replace('新增', '编辑') : checkFormData.title }}
        </div>
        <NewFileForm
          ref="formRef"
          v-loading="missionLoading"
          :elements="checkFormData.elements" :disabled="Boolean(active>1)"
          :model="formData"
        />
        <!--         <div v-if="route.query.inventoryType === 'WL' && !route.query.id" class="isChoose">
          <span style="margin-right: 10px">{{ selections.length === 0 ? '需盘点的物料代码：暂无' : '需盘点的物料代码:' }}</span>
          <el-tag
            v-for="item in selections"
            :key="item.id" style="margin-right: 15px;margin-bottom: 10px;"
          >
            {{ item.materialCode }}
          </el-tag>
        </div>
        <div v-if="route.query.inventoryType === 'CW' && !route.query.id" class="isChoose">
          <span style="margin-right: 10px">{{ selections.length === 0 ? '需盘点的仓位：暂无' : '需盘点的仓位:' }}</span>
          <el-tag
            v-for="item in selections"
            :key="item.id" style="margin-right: 15px;margin-bottom: 10px;"
          >
            {{ item.positionsName }}
          </el-tag>
        </div> -->
        <!--         <div v-if="route.query.inventoryType === 'WL' && route.query.id" class="isChoose">
          <span style="margin-right: 10px">需盘点的物料代码</span>
          <el-tag
            v-for="item in checkMissionDetailDataSource.tableData"
            :key="item.id" style="margin-right: 15px;margin-bottom: 10px;"
          >
            {{ item.materialCode }}
          </el-tag>
        </div>
        <div v-if="route.query.inventoryType === 'CW' && route.query.id" class="isChoose">
          <span style="margin-right: 10px">需盘点的仓位:</span>
          <el-tag
            v-for="item in checkMissionDetailDataSource.tableData"
            :key="item.id" style="margin-right: 15px;margin-bottom: 10px;"
          >
            {{ item.warehousePositionName }}
          </el-tag>
        </div> -->
        <div class="isChoose">
          <span style="margin-right: 10px">{{ checkPeopleSelections.length === 0 ? '盘点人员：暂无' : '盘点人员:' }}</span>
          <el-tag
            v-for="item in checkPeopleSelections"
            :key="item.id" style="margin-right: 15px;margin-bottom: 10px;"
          >
            {{ item.inventoryUserName }}
          </el-tag>
        </div>
        <el-dialog
          v-model="showMissionDialog" width="50%"
          :show-close="false" center :close-on-click-modal="false"
        >
          <template #header>
            <div class="jx-dialog-header">
              <h4>
                {{ route.query.inventoryType === 'CW' ? '按仓位创建盘点任务' : '按货物创建盘点任务' }}
                <el-input
                  v-if="route.query.inventoryType === 'CW'"
                  v-model="wareHousePositionDataSource.searchData.positionsName"
                  clearable
                  placeholder="输入仓位名称"
                  style="width:220px;margin-left:20px"
                >
                  <template #append>
                    <el-button icon="Search" @click="initPositionData" />
                  </template>
                </el-input>
                <el-input
                  v-else
                  v-model="inventoryCheckDataSource.searchData.materialCode"
                  clearable
                  placeholder="输入物料代码"
                  style="width:220px;margin-left:20px"
                >
                  <template #append>
                    <el-button icon="Search" @click="initGoodData" />
                  </template>
                </el-input>
              </h4>
              <div>
                <el-button
                  class="dialog-close-btn" type="danger"
                  icon="CloseBold"
                  circle
                  @click="closeMissionDialog"
                />
              </div>
            </div>
          </template>
          <div v-if="route.query.inventoryType === 'CW'">
            <SimpleTable
              ref="positionTable" :loading="positionLoading" :table-header="wareHousePositionDataSource.tableHeader"
              :total="wareHousePositionDataSource.total" :current-page="wareHousePositionDataSource.currentPage"
              :table-data="wareHousePositionDataSource.tableData" :page-size="wareHousePositionDataSource.pageSize"
              :show-tips="false"
              need-selection
              reserve-selection
              need-change-size
              @sizeChange="wareHousePositionDataSource.pageSizeChange($event,wareHousePositionDataSource)"
              @selectionChange="wareHousePositionDataSource.selectionChange($event,wareHousePositionDataSource)"
              @current-change="wareHousePositionDataSource.currentPageChange($event,wareHousePositionDataSource)"
            />
            <div class="isChoose">
              <span style="margin-right: 10px">已选择的仓位:</span>
              <el-tag
                v-for="item in wareHousePositionDataSource.selections"
                :key="item.id" style="margin-right: 15px;margin-bottom: 10px;"
              >
                {{ item.positionsName }}
              </el-tag>
            </div>
          </div>
          <div v-else>
            <SimpleTable
              ref="goodTable" :loading="inventoryCheckLoading" :table-header="inventoryCheckDataSource.tableHeader"
              :total="inventoryCheckDataSource.total" :current-page="inventoryCheckDataSource.currentPage"
              :table-data="inventoryCheckDataSource.tableData" :page-size="inventoryCheckDataSource.pageSize"
              :show-tips="false"
              need-selection
              reserve-selection
              need-change-size
              @sizeChange="wareHousePositionDataSource.pageSizeChange($event,wareHousePositionDataSource)"
              @selectionChange="inventoryCheckDataSource.selectionChange($event,inventoryCheckDataSource)"
              @current-change="inventoryCheckDataSource.currentPageChange($event,inventoryCheckDataSource)"
            />
            <div class="isChoose">
              <span style="margin-right: 10px">已选择的物料代码:</span>
              <el-tag
                v-for="item in inventoryCheckDataSource.selections"
                :key="item.id" style="margin-right: 15px;margin-bottom: 10px;"
              >
                {{ item.materialCode }}
              </el-tag>
            </div>
          </div>
          <template #footer>
            <el-button type="primary" @click="save">
              确定
            </el-button>
            <el-button @click="closeMissionDialog">
              取消
            </el-button>
          </template>
        </el-dialog>
        <el-dialog
          v-model="showPeopleDialog" width="60%"
          :show-close="false" center
        >
          <template #header>
            <div class="jx-dialog-header">
              <h4>
                分配盘点人员
                <el-input
                  v-model="userDataSource.searchData.nickName"
                  clearable
                  placeholder="输入姓名"
                  style="width:220px;margin-left:20px"
                >
                  <template #append>
                    <el-button icon="Search" @click="initUserData" />
                  </template>
                </el-input>
              </h4>
              <div>
                <el-button
                  class="dialog-close-btn" type="danger"
                  icon="CloseBold"
                  circle
                  @click="closePeopleDialog"
                />
              </div>
            </div>
          </template>
          <div>
            <SimpleTable
              ref="peopleTable" :loading="userLoading" :table-header="userDataSource.tableHeader" :need-page="false"
              :current-page="userDataSource.currentPage"
              :table-data="userDataSource.tableData"
              :show-tips="false"
              need-selection
              reserve-selection
              @selectionChange="userDataSource.selectionChange($event,userDataSource)"
            >
              <template #extraHandle>
                <div style="margin: 5px 0">
                  <el-button
                    type="primary" :loading="positionLoading"
                    @click="openUserDialog"
                  >
                    新增盘点账号
                  </el-button>
                </div>
              </template>
            </SimpleTable>
            <div class="isChoose">
              <span style="margin-right: 10px">已选择的人员:</span>
              <el-tag
                v-for="item in userDataSource.selections"
                :key="item.id" style="margin-right: 15px;margin-bottom: 10px;"
              >
                {{ item.nickName }}
              </el-tag>
            </div>
          </div>
          <template #footer>
            <el-button type="primary" @click="saveCheckPeople">
              确定
            </el-button>
            <el-button @click="closePeopleDialog">
              取消
            </el-button>
          </template>
        </el-dialog>
        <el-dialog
          v-model="showUserDialog" width="20%"
          :show-close="false" center :close-on-click-modal="false"
        >
          <template #header>
            <div class="jx-dialog-header">
              <h4>
                新增盘点账号
              </h4>
              <div>
                <el-button
                  class="dialog-close-btn" type="danger"
                  icon="CloseBold"
                  circle
                  @click="closeUserDialog"
                />
              </div>
            </div>
          </template>
          <div v-loading="positionLoading" style="text-align:center">
            <el-form :model="newUser" :rules="rules">
              <el-form-item label="姓名" prop="nickName">
                <el-input
                  v-model="newUser.nickName" style="width: 200px"
                  placeholder="输入账号"
                />
              </el-form-item>
              <el-form-item label="账号" prop="account">
                <el-input
                  v-model="newUser.account" style="width: 200px"
                  placeholder="输入账号"
                />
              </el-form-item>
              <el-form-item>
                <span style="color:red;font-size:20px;font-weight:bold">注：账号密码默认为123@jxwl</span>
              </el-form-item>
            </el-form>
          </div>
          <template #footer>
            <el-button type="primary" @click="addCheckUser">
              保存
            </el-button>
            <el-button @click="closeUserDialog">
              取消
            </el-button>
          </template>
        </el-dialog>
        <div class="handle_left" style="float:left">
          <el-button
            v-if="active !== 1" color="#1e1e1e"
            style="color: #FFFFFF" @click="setIsOpenCheck"
          >
            切换明盘暗盘
          </el-button>
          <el-tooltip
            v-if="active === 2"
            effect="dark"
            placement="bottom"
          >
            <template #content>
              点击之后将所有盘点人的数据进行统计，<br>盘点人数据一致的数据将汇总到实盘数量中
            </template>
            <el-button
              v-if="active === 2"
              v-authority="'FUNCTION_TAKE_STOCK_COLLECT'"
              color="#470079"
              style="color: #FFFFFF" @click="oneClickSummary"
            >
              盘点汇总
            </el-button>
          </el-tooltip>

          <el-button
            v-if="active < 3" type="primary"
            @click="next"
          >
            递交
          </el-button>
          <el-button
            v-if="active === 3" type="primary"
            @click="rollBack"
          >
            回退
          </el-button>
          <el-button
            v-if="active === 3" v-authority="'FUNCTION_TAKE_STOCK_AUDIT'" type="danger"
            @click="next"
          >
            审核
          </el-button>
        </div>
        <div class="handle_right" style="float: right">
          <el-dropdown
            v-if="active > 1"
            trigger="click" class="mr10"
            @command="exportExcel"
          >
            <el-button
              color="#3498db"
              style="color: #FFFFFF"
            >
              导出汇总数据<el-icon class="el-icon--right">
                <arrow-down />
              </el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="finish">
                  导出汇总完成数据
                </el-dropdown-item>
                <el-dropdown-item command="defeat">
                  <el-tooltip
                    effect="dark"
                    placement="left"
                  >
                    <template #content>
                      汇总失败:盘点人之间盘点的数据不一致
                    </template>
                    导出汇总失败数据
                  </el-tooltip>
                </el-dropdown-item>
                <el-dropdown-item command="wrong">
                  <el-tooltip
                    effect="dark"
                    placement="left"
                  >
                    <template #content>
                      汇总异常:盘点人数据一致，但是汇总数据与账面数据不一致
                    </template>
                    导出汇总异常数据
                  </el-tooltip>
                </el-dropdown-item>
                <el-dropdown-item command="wd">
                  导出汇总失败和异常数据
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <el-button
            v-if="active === 1"
            color="#470079"
            style="color: #FFFFFF" @click="makeMission"
          >
            保存
          </el-button>
          <el-button
            v-if="route.query.inventoryType === 'WL' && active === 1" type="primary"
            @click="openDialog"
          >
            选择货物
          </el-button>
          <el-button
            v-if="route.query.inventoryType === 'CW' && active === 1" type="primary"
            @click="openDialog"
          >
            选择仓位
          </el-button>
          <el-button
            v-if="active === 1" type="success"
            @click="openPeopleDialog"
          >
            分配人员
          </el-button>
          <el-button type="danger" @click="back">
            返回
          </el-button>
        </div>
      </div>
      <el-divider content-position="center">
        盘点明细
      </el-divider>
      <data-filter
        ref="filter"
        :filter-items="checkMissionDetailDataSource.tableHeader"
        is-pad @search="missonDetailSearch"
      />
      <div class="table">
        <simple-table
          ref="checkDetailTable"
          :loading="missionLoading" :table-header="checkMissionDetailDataSource.tableHeader"
          :total="checkMissionDetailDataSource.total" :current-page="checkMissionDetailDataSource.currentPage"
          :table-data="checkMissionDetailDataSource.tableData" :page-size="checkMissionDetailDataSource.pageSize"
          :show-tips="true"
          :tips="'Tips:双击备注单元格修改备注'"
          need-change-size
          :for-mat-data="checkDetailForMatData"
          @cellDbClick="clickCell"
          @sizeChange="checkMissionDetailDataSource.pageSizeChange($event,checkMissionDetailDataSource)"
          @current-change="checkMissionDetailDataSource.currentPageChange($event,checkMissionDetailDataSource)"
        >
          <template #processStatus="scope">
            <div :class="processStatusColor(scope.row.processStatus)">
              {{ statusArr[scope.row.processStatus] }}
            </div>
          </template>
          <template #comment="scope">
            <div v-if="scope.row.commentEdit">
              <el-input v-model="scope.row.comment" @blur="cancel(scope.row, 'comment')" />
            </div>
            <div v-else>
              {{ scope.row.comment }}
            </div>
          </template>
        </simple-table>
      </div>
      <div v-if="route.query.id && active > 1">
        <el-divider content-position="center">
          盘点结果
        </el-divider>
        <data-filter
          ref="filter"
          :filter-items="checkPersonDataSource.tableHeader"
          @search="personSearch"
        />
        <div class="table">
          <simple-table
            ref="personTable"
            :loading="missionLoading" need-change-size
            :table-header="checkPersonDataSource.tableHeader"
            :page-size="checkPersonDataSource.pageSize"
            :current-page="checkPersonDataSource.currentPage"
            :total="checkPersonDataSource.total"
            :show-tips="true"
            :tips="'Tips:双击备注单元格修改备注'"
            :for-mat-data="personForMatData"
            :table-data="checkPersonDataSource.tableData"
            @cellDbClick="clickCellP"
            @current-change="checkPersonDataSource.currentPageChange($event,checkPersonDataSource,proxy.$refs.personTable)"
            @sizeChange="checkPersonDataSource.pageSizeChange($event,checkPersonDataSource,proxy.$refs.personTable)"
          >
            <template #extraHandle>
              <div class="extra_handle" style="padding:15px">
                <el-button type="primary" @click="exportExcelByCheckPerson">
                  按盘点人导出盘点结果
                </el-button>
              </div>
            </template>
            <template #comment="scope">
              <div v-if="scope.row.commentEdit">
                <el-input v-model="scope.row.comment" @blur="cancelP(scope.row, 'comment')" />
              </div>
              <div v-else>
                {{ scope.row.comment }}
              </div>
            </template>
            <!--             <template #firmOfferQuantity="scope">
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
            </template> -->
          </simple-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import goBack from '@/components/common/goBack.vue'
import SimpleTable from '@/components/SimpleTable.vue'
import dataFilter from '@/components/common/dataFilter'
import { WareHouseDataSource, WareHousePositionDataSource, loading as positionLoading } from '@/applications/warehouse/utils/warehouse/index'
import { CheckMissionDataSource, loading as missionLoading } from '../../../utils/checkMission/checkMission'
import { UserDataSource, loading as userLoading } from '@/applications/warehouse/utils/user/user'
import NewFileForm from '@/components/NewFileForm.vue'
import { onMounted, reactive, ref, watch, onBeforeMount, getCurrentInstance } from 'vue'
import { InventoryCheckDataSource, loading as inventoryCheckLoading } from '@/applications/warehouse/utils/inventoryCheck/index'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { changeTime } from '@/applications/warehouse/public/jxRequest'

let { proxy } = getCurrentInstance()
let warehouseDataSource = ref(null)
let wareHousePositionDataSource = ref(null)
let userDataSource = ref(null)
let inventoryCheckDataSource = ref(null)
let checkPeopleSelections = ref([])
let compileIndex = ref(-1)
let canNext = ref(true)
let pro = JSON.parse(sessionStorage.getItem("userPermissions"))
const userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
let status = ['INVENTORY_SHEET_CREATE', 'INVENTORY_SHEET_AUDIT', 'INVENTORY_SHEET_DOC']
let backConfig = reactive([{ title: '其他', path: '' }, { title: '盘点任务', path: '' }, { title: '新增盘点任务', path: '' }])
let router = useRouter()
let route = useRoute()
let active = ref(1)
let showMissionDialog = ref(false)
let showPeopleDialog = ref(false)
let showUserDialog = ref(false)
let checkFormData = reactive({
  title: '新增盘点计划',
  elements: [
    {
      label: '盘点单号',
      prop: 'inventoryTaskOrderCode',
      disabled: true
    }, {
      label: '盘点名称',
      prop: 'inventoryTaskName',
      rules: [{
        required: true,
        message: '盘点名称不能为空',
        trigger: 'blur'
      }]
    }, {
      label: '盘点类型',
      prop: 'inventoryType',
      disabled: true
    }, {
      element: 'date',
      prop: 'inventoryTaskDate',
      label: '盘点日期',
      rules: [{
        required: true,
        message: '盘点日期不能为空',
        trigger: 'blur'
      }]
    }, {
      element: 'select',
      prop: 'isOpenCheck',
      label: '盘点方式',
      options: [{
        label: '明盘',
        value: 1
      }, {
        label: '暗盘',
        value: 2
      }],
      rules: [{
        required: true,
        message: '盘点方式不能为空',
        trigger: 'blur'
      }]
    }, {
      prop: 'profitAndLossQuantitySum',
      label: '盈亏总数量',
      disabled: true
    }
  ]
})
let formData = reactive({
  inventoryType: route.query.inventoryType === 'WL' ? '按物料盘点' : '按仓位盘点',
  inventoryTaskOrderCode: '',
  inventoryTaskDate: '',
  inventoryTaskName: '',
  isOpenCheck: '',
  profitAndLossQuantitySum: 0
})

let newUser = reactive({
  nickName: '',
  account: ''
})

let rules = reactive({
  nickName: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
  account: [{ required: true, message: '账号不能为空', trigger: 'blur' }]
})

onBeforeMount(() => {
  initDataSource()
  if (route.query.id) {
    initData()
  }
})

const initDataSource = () => {
  if (!checkMissionDataSource.value) {
    checkMissionDataSource.value = new CheckMissionDataSource({
      selectOneUri: '/inventoryTaskMain/selectOne'
    })
  }
  if (!wareHousePositionDataSource.value) {
    wareHousePositionDataSource.value = new WareHousePositionDataSource({
      selectUri: '/warehousePosition/select',
      tableHeader: [{
        label: '仓位编码',
        prop: 'warehousePositionCode'
      }, {
        label: '仓位名',
        prop: 'positionsName'
      }],
      pageSize: 10
    })
  }
  if (!warehouseDataSource.value) {
    warehouseDataSource.value = new WareHouseDataSource({
      selectUri: '/warehouse/select',
      pageSize: 100000
    })
  }
  if (!userDataSource.value) {
    userDataSource.value = new UserDataSource({
      selectUri: '/user/select',
      tableHeader: [{
        label: '姓名',
        prop: 'nickName'
      }, {
        label: '账号',
        prop: 'account'
      }]
    })
  }
  if (!inventoryCheckDataSource.value){
    inventoryCheckDataSource.value = new InventoryCheckDataSource({
      selectUri: '/stockMain/getMaterialByNotTj',
      tableHeader: [{
        label: "物料代码 / 套机码",
        prop: "materialCode"
      }, {
        label: "产品类型",
        prop: "materialType"
      }, {
        label: "商品名称",
        prop: "materialName"
      }, {
        label: "规格型号",
        prop: "materialSpecification"
      }],
      pageSize: 10
    })
  }
  if (!checkMissionDetailDataSource.value) {
    checkMissionDetailDataSource.value = new CheckMissionDataSource({
      tableHeader: inventoryDetailTableHeader,
      selectUri: '/inventoryTaskDetail/select',
      pageSize: 10
    })
  }
  if (!checkPersonDataSource.value) {
    checkPersonDataSource.value = new CheckMissionDataSource({
      selectUri: '/inventoryTaskDetailAllocation/select',
      tableHeader: checkPersonTableHeader,
      pageSize: 10
    })
  }
}

const openDialog = () => {
  let userInfo = JSON.parse(sessionStorage.getItem("userInfo"))
  if (route.query.inventoryType === 'CW') {
    wareHousePositionDataSource.value.searchData['warehouseCode'] = userInfo.warehouseCode
    wareHousePositionDataSource.value.initData()
  } else {
    inventoryCheckDataSource.value.searchData['canBeBreak'] = false
    inventoryCheckDataSource.value.searchData['warehouseName'] = userInfo.warehouseName
    inventoryCheckDataSource.value.initData()
  }
  showMissionDialog.value = true

}

const initData = () => {
  if (route.query.id) {
    checkMissionDataSource.value.selectOne(route.query.id).then(res => {

      Object.assign(formData, res)
      formData['inventoryType'] = formData['inventoryType'] === 'CW' ? '按仓位盘点' : '按物料盘点'
      checkMissionDataSource.value.getUserObject(formData['inventoryTaskOrderCode']).then(res => {
        if (res.code === 200) {
          checkPeopleSelections.value.length = 0
          checkPeopleSelections.value.push(...res.data)
          inventoryUserOpts.length = 0
          checkPeopleSelections.value.forEach(item => {
            let temp = {
              label: item['inventoryUserName'],
              value: item['inventoryUserName']
            }

            inventoryUserOpts.push(temp)
          })
        }
      })
      formData['inventoryType'] === 'CW' ? '按仓位盘点' : '按物料盘点'
      active.value = ['INVENTORY_TASK_CREATE', 'INVENTORY_TASK_START', 'INVENTORY_TASK_AUDIT', 'INVENTORY_TASK_DOC'].indexOf(formData['processStatus']) + 1
      formData['inventoryTaskDate'] = changeTime(res['inventoryTaskDate'])
      checkPersonDataSource.value.searchData['inventoryTaskOrderCode'] = formData.inventoryTaskOrderCode
      checkMissionDetailDataSource.value.searchData['inventoryTaskOrderCode'] = formData.inventoryTaskOrderCode

      Promise.all([checkPersonDataSource.value.initData(), checkMissionDetailDataSource.value.initData()])
    })
  }
}

const initPositionData = () => {
  wareHousePositionDataSource.value.initData()
}

const initGoodData = () => {
  inventoryCheckDataSource.value.initData()
}

const closeMissionDialog = () => {
  if (route.query.inventoryType === 'CW') {
    proxy.$refs.positionTable.clearSelection()
  } else {
    proxy.$refs.goodTable.clearSelection()
  }
  showMissionDialog.value = false
}
let checkPersonDataSource = ref(null) //盘点结果
let checkMissionDetailDataSource = ref(null) //盘点明细
let checkMissionDataSource = ref(null) //盘点主表
const save = () => {
  let list = route.query.inventoryType === 'CW' ? wareHousePositionDataSource.value.selections.map(item => item.warehousePositionCode) : inventoryCheckDataSource.value.selections.map(item => item.materialCode)
  let params = {
    inventoryType: route.query.inventoryType,
    tempList: list
  }
  checkMissionDetailDataSource.value.inventoryTaskDetailList(params).then(res => {
    if (res.code === 200) {
      checkMissionDetailDataSource.value.tableData.length = 0
      checkMissionDetailDataSource.value.tableData.push(...res.data)
      closeMissionDialog()
      ElMessage.success('获取成功')
    } else {
      ElMessage.error(res)
    }

  })
}

const back = () => {
  router.push({
    path: '/other/mission'
  })
}

let inventoryDetailDataSource = ref(null)
let inventoryUserOpts = reactive([])
const inventoryDetailTableHeader = [
  {
    label: '盘点单号',
    prop: 'inventoryTaskOrderCode',
    type: 'none'
  }, {
    label: '流程状态',
    prop: 'processStatus',
    type: 'select',
    options: [{
      label: '汇总失败',
      value: 'INVENTORY_TASK_DETAIL_NOT_STARTED'
    }, {
      label: '汇总完成',
      value: 'INVENTORY_TASK_DETAIL_END'
    }, {
      label: '汇总异常',
      value: 'INVENTORY_TASK_DETAIL_ERR'
    }],
    needScope: true
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
    type: 'text'
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
    type: 'none'
  }, {
    label: '盈亏数量',
    prop: 'profitAndLossQuantity',
    type: 'none'
  }, {
    label: '备注',
    prop: 'comment',
    type: 'text',
    needScope: true
  }
]

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
    type: 'select',
    options: inventoryUserOpts
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
    type: 'text'
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
    type: 'none'
  }, {
    label: '盈亏数量',
    prop: 'profitAndLossQuantity',
    type: 'none'
  }, {
    label: '备注',
    prop: 'comment',
    type: 'text',
    needScope: true
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

let statusArr = {
  INVENTORY_TASK_DETAIL_NOT_STARTED: '汇总失败',
  INVENTORY_TASK_DETAIL_END: '汇总完成',
  INVENTORY_TASK_DETAIL_ERR: '汇总异常'
}

const checkDetailForMatData = (row, column) => {
  let status = {
    INVENTORY_TASK_DETAIL_NOT_STARTED: '汇总失败',
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

let formRef = ref(null)
const makeMission = async () => {
  await formRef.value.ruleFormRef.validate((valid, fields) => {
    if (valid) {
      ElMessageBox. alert('确定制作盘点计划吗', '提示', {
        type: 'warning',
        confirmButtonText: '确定',
        showCancelButton: true,
        callback: (e) => {
          if (e === 'cancel') return
          else {
            if (route.query.id){
              let params = {
                id: formData['id'],
                inventoryTaskOrderCode: formData['inventoryTaskOrderCode'],
                inventoryTaskName: formData['inventoryTaskName'],
                isOpenCheck: formData['isOpenCheck'],
                inventoryTaskDate: Date.parse(formData['inventoryTaskDate']),
                inventoryUserDtoList: checkPeopleSelections.value,
                inventoryType: route.query.inventoryType,
                inventoryTaskDetailList: checkMissionDetailDataSource.value.tableData
              }
              checkMissionDetailDataSource.value.updateInventoryTaskMain(params).then(res => {
                if (res.code === 200) {
                  ElMessage.success('保存成功')
                  if (route.query.id) {
                    initData()
                  } else {
                    refreshData(formData['id'])
                  }
                } else {
                  ElMessage.error(res)
                }
              })
            } else {
              let params = {
                inventoryTaskName: formData['inventoryTaskName'],
                isOpenCheck: formData['isOpenCheck'],
                inventoryTaskDate: Date.parse(formData['inventoryTaskDate']),
                inventoryUserDtoList: checkPeopleSelections.value,
                inventoryType: route.query.inventoryType,
                inventoryTaskDetailList: checkMissionDetailDataSource.value.tableData
              }
              checkMissionDetailDataSource.value.saveInventoryTaskMain(params).then(res => {
                if (res.code === 200) {
                  ElMessage.success('保存成功')
                  if (route.query.id) {
                    initData()
                  } else {
                    refreshData(res.data)
                  }
                } else {
                  ElMessage.error(res)
                }
              })
            }

          }
        }
      })
    } else {
      console.log('error submit!', fields)
    }
  })
}

const next = () => {
  if (active.value === 1) {
    ElMessageBox.alert('确定递交吗,递交到下一状态后无法修改数据', "警告", {
      type: 'error',
      showCancelButton: true,
      cancelButtonText: '再想想',
      confirmButtonText: '确认',
      callback: (action) => {
        if (action === 'cancel') return
        else {
          checkMissionDataSource.value.nextStatus(formData['inventoryTaskOrderCode']).then(res => {
            if (res.code === 200) {
              ElMessage.success('递交成功')
              initData()
            } else {
              ElMessage.error(res)
            }
          })
        }
      }
    })
  } else {
    checkMissionDataSource.value.nextStatus(formData['inventoryTaskOrderCode']).then(res => {
      if (res.code === 200) {
        ElMessage.success('递交成功')
        initData()
      } else {
        ElMessage.error(res)
      }
    })
  }
}

const rollBack = () => {
  checkMissionDataSource.value.previousState(formData['inventoryTaskOrderCode']).then(res => {
    if (res.code === 200) {
      ElMessage.success('回退成功')
      initData()
    } else {
      ElMessage.error(res)
    }
  })
}

const oneClickSummary = () => {
  checkMissionDataSource.value.oneClickSummary(route.query.inventoryTaskOrderCode).then(res => {
    if (res.code === 200) {
      ElMessage.success('汇总成功')
    } else {
      ElMessageBox.alert(res.data ? res.data : res.message, '警告', {
        type: 'error',
        confirmButtonText: '确定',
        dangerouslyUseHTMLString: true
      })
    }
    initData()
  })
}

const setIsOpenCheck = () => {
  let params = {
    inventoryTaskOrderCode: formData['inventoryTaskOrderCode'],
    isOpenCheck: formData['isOpenCheck'] === 1 ? 2 : 1
  }
  checkMissionDataSource.value.setIsOpenCheck(params).then(res => {
    if (res.code === 200) {
      ElMessage.success('修改成功')
      initData()
    } else {
      ElMessage.error(res)
    }
  })
}
let exportDataSource = ref(null)
const exportExcel = async (command) => {
  let type = {
    finish: ['INVENTORY_TASK_DETAIL_END'],
    defeat: ['INVENTORY_TASK_DETAIL_NOT_STARTED'],
    wrong: ['INVENTORY_TASK_DETAIL_ERR'],
    wd: ['INVENTORY_TASK_DETAIL_NOT_STARTED', 'INVENTORY_TASK_DETAIL_ERR']
  }
  let title = {
    finish: '汇总完成',
    defeat: '汇总失败',
    wrong: '汇总异常',
    wd: '汇总失败和异常'
  }
  let status = {
    INVENTORY_TASK_DETAIL_NOT_STARTED: '汇总失败',
    INVENTORY_TASK_DETAIL_END: '汇总完成',
    INVENTORY_TASK_DETAIL_ERR: '汇总异常'
  }
  if (!exportDataSource.value) {
    exportDataSource.value = new CheckMissionDataSource({
      tableHeader: inventoryDetailTableHeader,
      selectUri: '/inventoryTaskDetail/select',
      pageSize: 100000
    })
  }
  exportDataSource.value.searchData['processStatusEnumList'] = type[command]
  exportDataSource.value.searchData['inventoryTaskOrderCode'] = formData['inventoryTaskOrderCode']
  await exportDataSource.value.initData()
  let { tableData, tableHeader } = exportDataSource.value
  let enHeader = []
  let znHeader = {}
  tableData = tableData.map(item => {
    let { inventoryTaskOrderCode, processStatus, warehouseName, warehousePositionName, materialCode, materialName, materialSpecification, materialType, bookQuantity, firmOfferQuantity, profitAndLossQuantity, comment } = item
    processStatus = status[processStatus]
    return { inventoryTaskOrderCode, processStatus, warehouseName, warehousePositionName, materialCode, materialName, materialSpecification, materialType, bookQuantity, firmOfferQuantity, profitAndLossQuantity, comment }
  })
  tableHeader.forEach(item => {
    enHeader.push(item.prop)
    znHeader[item.prop] = item.label
  })
  new proxy.$DataTool().exportExcel(znHeader, enHeader, tableData, `盘点${title[command]}数据`)

}

const openPeopleDialog = async () => {
  initUserData()
  showPeopleDialog.value = true
}

const initUserData = () => {
  userDataSource.value.searchData['orgId'] = userInfo['orgId']
  userDataSource.value.initData()
}

const closePeopleDialog = () => {
  showPeopleDialog.value = false
  proxy.$refs.peopleTable.clearSelection()
}

const openUserDialog = () => {
  showUserDialog.value = true
}

const closeUserDialog = () => {
  showUserDialog.value = false
  Object.keys(newUser).forEach(key => {
    newUser[key] = ''
  })
}

const saveCheckPeople = () => {
  let { selections } = userDataSource.value
  checkPeopleSelections.value.length = 0
  selections = selections.map(item => {
    let temp = {
      inventoryUserId: item.id,
      inventoryUserName: item.nickName
    }
    checkPeopleSelections.value.push(temp)
  })
  closePeopleDialog()
}

const addCheckUser = () => {
  let params = {
    account: newUser.account,
    nickName: newUser.nickName,
    orgId: userInfo.orgId,
    jobId: 67,
    password: '1c911681dba213501f7264934399f337'
  }
  userDataSource.value.addUser(params).then(res => {
    if (res.code === 200) {
      ElMessage.success('新增成功')
      showUserDialog.value = false
      initUserData()
      Object.keys(newUser).forEach(key => {
        newUser[key] = ''
      })
    }
  })
}

const refreshData = (id) => {
  checkMissionDataSource.value.selectOne(id).then(res => {
    Object.assign(formData, res)
    formData['inventoryType'] = formData['inventoryType'] === 'CW' ? '按仓位盘点' : '按物料盘点'
    checkMissionDataSource.value.getUserObject(formData['inventoryTaskOrderCode']).then(res => {
      if (res.code === 200) {
        checkPeopleSelections.value.length = 0
        checkPeopleSelections.value.push(...res.data)
        inventoryUserOpts.length = 0
        checkPeopleSelections.value.forEach(item => {
          let temp = {
            label: item['inventoryUserName'],
            value: item['inventoryUserName']
          }

          inventoryUserOpts.push(temp)
        })
      }
    })
    router.push({ query: { id, inventoryTaskOrderCode: formData.inventoryTaskOrderCode, inventoryType: route.query.inventoryType } })
    active.value = ['INVENTORY_TASK_CREATE', 'INVENTORY_TASK_START', 'INVENTORY_TASK_AUDIT', 'INVENTORY_TASK_DOC'].indexOf(formData['processStatus']) + 1
    formData['inventoryTaskDate'] = changeTime(res['inventoryTaskDate'])
    checkPersonDataSource.value.searchData['inventoryTaskOrderCode'] = formData.inventoryTaskOrderCode
    checkMissionDetailDataSource.value.searchData['inventoryTaskOrderCode'] = formData.inventoryTaskOrderCode
    Promise.all([checkPersonDataSource.value.initData(), checkMissionDetailDataSource.value.initData()])
  })
}

const personSearch = (data) => {
  data['inventoryTaskOrderCode'] = route.query.inventoryTaskOrderCode
  checkPersonDataSource.value.search(data, checkPersonDataSource.value, proxy.$refs.personTable)
}

const missonDetailSearch = (data) => {
  data['inventoryTaskOrderCode'] = route.query.inventoryTaskOrderCode
  checkMissionDetailDataSource.value.search(data, checkMissionDetailDataSource.value, proxy.$refs.checkDetailTable)
}

const processStatusColor = (status) => {
  let arr = {
    INVENTORY_TASK_DETAIL_NOT_STARTED: 'red',
    INVENTORY_TASK_DETAIL_END: 'green',
    INVENTORY_TASK_DETAIL_ERR: 'yellow'
  }
  return arr[status]
}

const clickCell = async (row, column, cell, event) => {
  if (column.property === 'comment') {
    row['commentEdit'] = true
  }
}

const cancel = (row, type) => {
  if (active.value === 4) {
    ElMessage.error('归档状态无法修改备注')
    row[`${type}Edit`] = false
    return
  }
  checkMissionDetailDataSource.value.updateComment(row).then(res => {
    if (res.code === 200) {
      ElMessage.success('修改成功')
      checkMissionDetailDataSource.value.initData()
    } else {
      ElMessage.error(res)
    }
  })
  row[`${type}Edit`] = false
}

const clickCellP = async (row, column, cell, event) => {
  if (column.property === 'comment') {
    row['commentEdit'] = true
  }
}

const cancelP = (row, type) => {
  checkPersonDataSource.value.updateCommentP(row).then(res => {
    if (res.code === 200) {
      ElMessage.success('修改成功')
      checkPersonDataSource.value.initData()
    } else {
      ElMessage.error(res)
    }
  })
  row[`${type}Edit`] = false
}

let exportPeopleDataSource = ref(null)
const exportExcelByCheckPerson = () => {
  let status = {
    INVENTORY_TASK_ALLOCATION_NOT_STARTED: '未盘点',
    INVENTORY_TASK_ALLOCATION_END: '盘点完成',
    INVENTORY_TASK_ALLOCATION_REVIEWED: '待复盘'
  }
  if (!exportPeopleDataSource.value) {
    exportPeopleDataSource.value = new CheckMissionDataSource({
      selectUri: '/inventoryTaskDetailAllocation/select',
      tableHeader: checkPersonTableHeader,
      pageSize: 100000
    })
  }
  let sheetList = []
  let zhHeader = {}
  let enHeader = []
  exportPeopleDataSource.value.tableHeader.forEach(item => {
    zhHeader[item['prop']] = item['label']
    enHeader.push(item.prop)
  })
  checkPeopleSelections.value.forEach(async (item, index) => {
    exportPeopleDataSource.value.searchData = item
    await exportPeopleDataSource.value.initData()
    let temp = {
      zhHeader,
      enHeader,
      data: [...exportPeopleDataSource.value.tableData],
      name: item['inventoryUserName']
    }
    temp['data'] = temp['data'].map(item => {
      let { inventoryTaskOrderCode, processStatus, inventoryUserName, warehouseName, warehousePositionName, materialCode, materialName, materialSpecification, materialType, bookQuantity, firmOfferQuantity, profitAndLossQuantity, comment } = item
      processStatus = status[processStatus]
      return { inventoryTaskOrderCode, processStatus, inventoryUserName, warehouseName, warehousePositionName, materialCode, materialName, materialSpecification, materialType, bookQuantity, firmOfferQuantity, profitAndLossQuantity, comment }
    })
    sheetList.push(temp)
    if (index === checkPeopleSelections.value.length - 1) {
      new proxy.$DataTool().complexExcel(sheetList, '盘点工作')
    }
  })
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

    .red {
      font-weight: bold;
      color: red
    }

    .yellow {
      font-weight: bold;
      color: #e6a23c
    }

    .green {
      font-weight: bold;
      color: green;
    }
</style>