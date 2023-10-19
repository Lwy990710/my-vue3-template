<template>
  <div class="main">
    <div class="message_area">
      <goBack :back-config="backConfig" />
      <div class="form_area">
        <el-steps
          :active="active"
          align-center
          finish-status="success"
        >
          <el-step title="未开始" />
          <el-step title="盘点中" />
          <el-step title="盘点结束" />
        </el-steps>
        <div class="form_title">
          {{ route.query.id ? collectFormData.title.replace('新增', '编辑') : collectFormData.title }}
        </div>
        <NewFileForm
          ref="formRef"
          :elements="collectFormData.elements"
          :model="formData"
        />
        <div class="handle_area">
          <el-button
            class="handle-btn-delete mr12"
            color="#f56c6c"
            style="color: #666"
            plain
            @click="cancel"
          >
            返回
          </el-button>
        </div>
      </div>
      <el-divider content-position="center">
        汇总明细
      </el-divider>
      <!--       <div class="data-filter">
        <data-filter
          ref="filter"
          :filter-items="checkCollectDataSource.tableHeader"
          @search="checkCollectDataSource.search($event,checkCollectDataSource,proxy.$refs.table)"
        />
      </div> -->
      <div class="table">
        <div class="data-filter" style="width:100%">
          <data-filter
            ref="filter"
            :filter-items="checkCollectDetailsDataSource.tableHeader"
            @search="checkCollectDetailsDataSource.search($event,checkCollectDetailsDataSource,proxy.$refs.table)"
          />
        </div>
        <SimpleTable
          ref="table"
          need-end-control
          need-change-size
          need-selection
          :options-width="150"
          :show-tips="false" :table-header="checkCollectDetailsDataSource.tableHeader"
          :table-data="checkCollectDetailsDataSource.tableData"
          :loading="false"
          :current-page="checkCollectDetailsDataSource.currentPage"
          :total="checkCollectDetailsDataSource.total"
          @selectionChange="checkCollectDetailsDataSource.selectionChange($event,checkCollectDetailsDataSource,proxy.$refs.table)"
          @sizeChange="checkCollectDetailsDataSource.pageSizeChange($event,checkCollectDetailsDataSource,proxy.$refs.table)"
          @currentChange="checkCollectDetailsDataSource.currentPageChange($event,checkCollectDetailsDataSource,proxy.$refs.table)"
        >
          <template #extraHandle>
            <div class="extend-handle">
              <div class="extend-handle-left">
                <el-button
                  class="handle-btn"
                  color="#4a78bd"
                  style="color: #666"
                  plain
                  @click="exportCollectMaterial"
                >
                  导出excel
                </el-button>
              </div>
            </div>
          </template>
          <template #endOption="scope">
            <el-button
              style="background:transparent"
              text type="primary"
              @click="collectDetail(scope.row)"
            >
              盘点详情
            </el-button>
          </template>
        </SimpleTable>
        <el-dialog
          v-model="detailDialog" title="盘点详情"
          center :show-close="false" width="70%"
        >
          <template #header>
            <div class="jx-dialog-header">
              <div>
                <span class="mr20">{{ `汇总明细： 物料代码${materialCode}` }}</span>
                <el-button
                  class="handle-btn ml20"
                  color="#4a78bd"
                  style="color: #666"
                  plain
                  @click="exportCollectMaterialDetails"
                >
                  导出物料盘点明细
                </el-button>
              </div>

              <el-button
                class="dialog-close-btn"
                type="danger" icon="CloseBold"
                circle
                @click="(detailDialog = false)"
              />
            </div>
          </template>
          <SimpleTable
            :loading="loading" :show-tips="false" :table-header="collectMaterialDetailHeader"
            :table-data="collectMaterialDetailData" :need-page="false"
          >
            <template #image="scope">
              <el-button
                v-if="scope.row.image" text
                type="primary" style="background:transparent" @click="downloadImage(scope.row.image)"
              >
                点击下载
              </el-button>
              <span v-else>暂无图片</span>
            </template>
          </SimpleTable>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script setup>
import dataFilter from '@/components/common/dataFilter.vue'
import goBack from '@/components/common/goBack.vue'
import SimpleTable from '@/components/SimpleTable.vue'
import NewFileForm from '@/components/NewFileForm.vue'
import { onMounted, reactive, ref, watch, onBeforeMount, getCurrentInstance } from 'vue'
import { CheckCollectDetailsDataSource, loading } from '@/applications/warehouse/utils/checkCollect'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { changeTime } from '@/applications/warehouse/public/jxRequest'
import { DataTool } from '@/js/tool-class/dataTool'
let { proxy } = getCurrentInstance()
let pro = JSON.parse(sessionStorage.getItem("userPermissions"))
const userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
let status = ['INVENTORY_SHEET_CREATE', 'INVENTORY_SHEET_AUDIT', 'INVENTORY_SHEET_DOC']
let backConfig = reactive([{ title: '其他', path: '' }, { title: '盘点汇总表', path: '' }, { title: '新增盘点汇总表', path: '' }])
let activeArr = []
let router = useRouter()
let route = useRoute()
let disabled = ref(false)
let detailDialog = ref(false)
let checkCollectDetailsDataSource = ref(null)
let formData = reactive({
  inventorySheetDate: '',
  profitAndLossQuantitySum: '',
  comment: '',
  processStatus: 'INVENTORY_SHEET_CREATE',
  inventorySheetDetailList: []
})
let materialCode = ref('')
let collectFormData = {
  title: '新增盘点汇总',
  elements: [
    {
      label: '盘点汇总单号',
      prop: 'takeStockRecordCode',
      disabled: true
    }, {
      label: '计划盘点日期',
      prop: 'planStartTime',
      element: 'date',
      disabled: true
    }, {
      label: '盘点开始日期',
      prop: 'startTime',
      disabled: true
    }, {
      label: '初始盘点总数量',
      prop: 'totalSysNumber',
      disabled: true
    }, {
      label: '实际盘点总数量',
      prop: 'totalRealNumber',
      disabled: true
    }, {
      label: '盘点仓库',
      prop: 'warehouseName',
      disabled: true
    }
  ]
}

let collectMaterialDetailHeader = reactive([
  {
    label: '盘点汇总单号',
    prop: 'takeStockRecordCode'
  }, {
    label: '仓库名称',
    prop: 'warehouseName'
  }, {
    label: '仓位名称',
    prop: 'positionsName'
  }, {
    label: '条码头',
    prop: 'barCodeHead'
  }, {
    label: '物料代码',
    prop: 'materialCode'
  }, {
    label: '物料类型',
    prop: 'materialType'
  }, {
    label: '数量',
    prop: 'number'
  }, {
    label: '盘点人',
    prop: 'recordPerson'
  }, {
    label: '属性',
    prop: 'materialAttribute'
  }, {
    label: '图片',
    prop: 'image',
    needScope: true
  }, {
    label: '备注',
    prop: 'materialComment'
  }
])
let collectMaterialDetailData = reactive([])
let active = ref(0)

let formRef = ref(null)
let materialTypeOptions = reactive([])
onBeforeMount(() => {
  if (!checkCollectDetailsDataSource.value){
    checkCollectDetailsDataSource.value = new CheckCollectDetailsDataSource({
      selectUri: '/takeStock/selectDetail',
      tableHeader: [
        {
          label: '盘点汇总单号',
          prop: 'takeStockRecordCode',
          type: 'none'
        }, {
          label: '仓库名称',
          prop: 'warehouseName',
          type: 'none'
        }, {
          label: '仓位名称',
          prop: 'positionsName',
          type: 'text'
        }, {
          label: '条码头',
          prop: 'barCodeHead',
          type: 'text'
        }, {
          label: '物料代码',
          prop: 'materialCode',
          type: 'text'
        }, {
          label: '物料类型',
          prop: 'materialType',
          type: 'select',
          options: materialTypeOptions
        }, {
          label: '数量',
          prop: 'number'
        }, {
          label: '盘点人',
          prop: 'recordPerson',
          type: 'text'
        }, {
          label: '属性',
          prop: 'materialAttribute'
        }, {
          label: '备注',
          prop: 'materialComment'
        }
      ]
    })
  }
  if (JSON.parse(route.query.rowData)) {
    getCheckData()
  }
  getType()
})

const save = async () => {
  await formRef.value.ruleFormRef.validate((valid, fields) => {
    if (valid) {
    } else {
      ElMessage.error('请完善必填信息')
    }
  })
}

const getCheckData = async () => {
  Object.assign(formData, JSON.parse(route.query.rowData))
  checkCollectDetailsDataSource.value.searchData = { takeStockRecordCode: formData['takeStockRecordCode'] }
  checkCollectDetailsDataSource.value.initData()
}

const collectDetail = async (row) => {
  materialCode.value = row['materialCode']
  let { takeStockRecordCode, warehouseCode, warehousePositionCode, materialAttribute, materialSpecification, materialCod, recordPerson } = row
  await checkCollectDetailsDataSource.value.collectMaterialDetail({ takeStockRecordCode, warehouseCode, warehousePositionCode, materialAttribute, materialSpecification, materialCod, recordPerson }).then(res => {
    console.log(res)
    if (res.code === 200) {
      collectMaterialDetailData.length = 0
      collectMaterialDetailData.push(...res.data.list)

    } else {
      ElMessage.error(res.message)
    }
  })
  detailDialog.value = true
}

const exportCollectMaterial = () => {
  let { selections } = checkCollectDetailsDataSource.value
  if (selections.length < 1) {
    ElMessage.error('请先选择数据')
    return
  }
  let exportData = selections.map(item => {
    let { takeStockRecordCode, warehouseName, positionsName, barCodeHead, materialCode, materialType, number, recordPerson, materialAttribute, materialComment } = item
    return { takeStockRecordCode, warehouseName, positionsName, barCodeHead, materialCode, materialType, number, recordPerson, materialAttribute, materialComment }
  })
  let enHeader = [
    'takeStockRecordCode', 'warehouseName', 'positionsName', 'barCodeHead', 'materialCode', 'materialType', 'number', 'recordPerson', 'materialAttribute', 'materialComment'
  ]
  let znHeader = {
    takeStockRecordCode: '盘点汇总单号',
    warehouseName: '仓库名称',
    positionsName: '仓位名称',
    barCodeHead: '条码头',
    materialCode: '物料代码',
    materialType: '物料类型',
    number: '数量',
    recordPerson: '盘点人',
    materialAttribute: '属性',
    materialComment: '备注'
  }
  new proxy.$DataTool().exportExcel(znHeader, enHeader, exportData, `${exportData[0].takeStockRecordCode}汇总明细`)
}

const exportCollectMaterialDetails = () => {
  let exportData = collectMaterialDetailData.map(item => {
    let { takeStockRecordCode, warehouseName, positionsName, barCodeHead, materialCode, materialType, number, recordPerson, materialAttribute, materialComment } = item
    return { takeStockRecordCode, warehouseName, positionsName, barCodeHead, materialCode, materialType, number, recordPerson, materialAttribute, materialComment }
  })
  let enHeader = [
    'takeStockRecordCode', 'warehouseName', 'positionsName', 'barCodeHead', 'materialCode', 'materialType', 'number', 'recordPerson', 'materialAttribute', 'materialComment'
  ]
  let znHeader = {
    takeStockRecordCode: '盘点汇总单号',
    warehouseName: '仓库名称',
    positionsName: '仓位名称',
    barCodeHead: '条码头',
    materialCode: '物料代码',
    materialType: '物料类型',
    number: '数量',
    recordPerson: '盘点人',
    materialAttribute: '属性',
    materialComment: '备注'
  }
  new proxy.$DataTool().exportExcel(znHeader, enHeader, exportData, `物料${exportData[0].materialCode}汇总明细`)
}

const getType = () => {
  checkCollectDetailsDataSource.value.getMaterialType().then(res => {
    if (res.code === 200) {
      console.log(res.data.list)

      res.data.list.forEach(item => {
        let temp = { label: item, value: item }
        materialTypeOptions.push(temp)
      })
    } else {
      ElMessage.error(res.message)
    }
  })
}

const cancel = () => {
  router.go(-1)
}

const downloadImage = (url) => {
  window.location = `${url}?download`
}
</script>

  <style lang="less" scoped>
  .main {
      width: 100%;
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
  }
  </style>