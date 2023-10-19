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
          <el-step title="制单" />
          <el-step title="审核" />
          <el-step title="归档" />
        </el-steps>
        <div class="form_title">
          {{ route.query.id ? checkFormData.title.replace('新增', '编辑') : checkFormData.title }}
        </div>
        <NewFileForm
          ref="formRef"
          v-loading="loading"
          :elements="checkFormData.elements" :disabled="Boolean(active>=1)"
          :model="formData"
        />
      </div>
      <el-divider content-position="center">
        盘点明细
      </el-divider>
      <div class="table">
        <SimpleTable
          need-index
          :loading="loading" :table-header="checkDetailsTableHeader"
          :table-data="checkDetailsData" :need-page="false"
          :show-tips="false" :need-end-control="Boolean(active==0)"
        >
          <template #extraHandle>
            <div class="extraHandle">
              <el-button
                v-if="Boolean(active==0)"
                class="handle-btn mr12"
                color="#4a78bd"
                style="color: #666"
                plain
                @click="openDialog"
              >
                新增物料
              </el-button>
            </div>
          </template>
          <template #endOption="params">
            <el-button
              type="primary" text
              @click="compileMaterial(params.row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger" text
              @click="deleteMaterial(params.row)"
            >
              删除
            </el-button>
          </template>
        </SimpleTable>
        <el-dialog
          v-model="showDialog" title="新增物料" center
          width="60%" @close="closeDialog"
        >
          <NewFileForm
            ref="fittingFormRef"
            :elements="materialFormData.elements"
            :model="material"
            @openDialog="openCheckTypeDialog"
          />
          <el-dialog
            v-model="chooseMaterialDialog" title="物料信息"
            center width="60%"
          >
            <div style="margin: 15px 0">
              <el-input
                v-model="materialCode"
                placeholder="请输入物料代码"
                style="width:40%;margin: 10px 0;"
              >
                <template #append>
                  <el-button @click="getMaterialData">
                    <el-icon><Search /></el-icon>
                  </el-button>
                </template>
              </el-input>
              <span style="display:inline-block;margin-left:20px;font-size:12px;color:#f56c6c">Tips: 双击某行进行选择</span>
              <div v-if="isGood === 0">
                <SimpleTable
                  :loading="inventoryLoading" :table-header="inventoryCheckDataSource.tableHeader" :table-data="inventoryCheckDataSource.tableData"
                  :show-tips="false" :need-page="false" @chooseRow="chooseRow"
                />
              </div>
              <div v-if="isGood === 1">
                <SimpleTable
                  :current-page="goodDataSource.currentPage"
                  :loading="GoodLoading" :table-header="goodDataSource.tableHeader" :table-data="goodDataSource.tableData" :total="goodDataSource.total"
                  :show-tips="false" :need-page="true" @chooseRow="chooseRow" @current-change="goodDataSource.currentPageChange($event,goodDataSource)"
                />
              </div>
            </div>
          </el-dialog>
          <el-dialog
            v-model="chooseType"
            title="选择盘点类型"
            center width="40%"
          >
            <div style="height:40px;line-height:40px">
              <span>该物料在系统中账面数量是否为0：</span>
              <el-radio-group v-model="isGood" @change="chooseIsGood">
                <el-radio :label="1">
                  是
                </el-radio>
                <el-radio :label="0">
                  否
                </el-radio>
              </el-radio-group>
            </div>
            <el-form :model="checkTypeForm" inline>
              <el-form-item label="物料类型">
                <el-select
                  v-model="checkTypeForm.materialType" placeholder="选择物料类型"
                  @change="selectMaterialType"
                >
                  <el-option label="套机" :value="1" />
                  <el-option label="非套机" :value="0" />
                </el-select>
              </el-form-item>
              <el-form-item v-show="checkTypeForm.materialType === 0" label="选择仓位">
                <el-select
                  ref="selectPosition"
                  v-model="checkTypeForm.positionName" placeholder="选择仓位" filterable
                  @change="changePosition"
                >
                  <el-option
                    v-for="item in wareHousePositionDataSource.tableData" :key="item.id" :label="item.positionsName"
                    :value="item.warehousePositionCode + '+' + item.positionsName"
                  />
                </el-select>
              </el-form-item>
            </el-form>
            <template #footer>
              <span class="dialog-footer">
                <el-button type="primary" @click="openMaterialDialog">
                  确定
                </el-button>
                <el-button @click="chooseType = false">关闭</el-button>
              </span>
            </template>
          </el-dialog>
          <template #footer>
            <span class="dialog-footer">
              <el-button type="primary" @click="putMaterialData">
                确定
              </el-button>
              <el-button @click="closeChooseMaterialDialog">关闭</el-button>
            </span>
          </template>
        </el-dialog>
      </div>
      <div class="handle_area">
        <el-button
          v-if="Boolean(active !== 3)"
          class="handle-btn mr12"
          color="#4a78bd"
          style="color: #666"
          plain
          :loading="loading"
          @click="save"
        >
          保存
        </el-button>
        <el-button
          class="handle-btn-delete mr12"
          color="#f56c6c"
          style="color: #666"
          plain
          @click="cancel"
        >
          返回
        </el-button>
        <el-button
          v-if="canNext"
          class="handle-btn mr12"
          color="#4a78bd"
          style="color: #666"
          plain
          :loading="loading"
          @click="next"
        >
          递交
        </el-button>
        <el-button
          v-if="Boolean(active === 1)"
          class="handle-btn-delete mr12"
          color="#f56c6c"
          style="color: #666"
          plain
          :loading="loading"
          @click="back"
        >
          回退
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import goBack from '@/components/common/goBack.vue'
import MyTable from '@/components/MyTable'
import SimpleTable from '@/components/SimpleTable.vue'
import { CheckDataSource, loading } from '@/applications/warehouse/utils/check/index'
import { InventoryCheckDataSource, loading as inventoryLoading } from '@/applications/warehouse/utils/inventoryCheck/index'
import { WareHousePositionDataSource, loading as GoodLoading } from '@/applications/warehouse/utils/warehouse/index'
import NewFileForm from '@/components/NewFileForm.vue'
import { onMounted, reactive, ref, watch, onBeforeMount, getCurrentInstance } from 'vue'
import { GoodDataSource } from '@/applications/warehouse/utils/good'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { changeTime } from '@/applications/warehouse/public/jxRequest'
let { proxy } = getCurrentInstance()
let compileIndex = ref(-1)
let canNext = ref(true)
let pro = JSON.parse(sessionStorage.getItem("userPermissions"))
const userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
let checkDataSource = ref(null)
let showDialog = ref(false)
let inventoryCheckDataSource = ref(false)
let goodDataSource = ref(null)
let materialCode = ref('')
let chooseMaterialDialog = ref(false)
let status = ['INVENTORY_SHEET_CREATE', 'INVENTORY_SHEET_AUDIT', 'INVENTORY_SHEET_DOC']
let backConfig = reactive([{ title: '其他', path: '' }, { title: '盘点表', path: '' }, { title: '新增盘点表', path: '' }])
let router = useRouter()
let route = useRoute()
let disabled = ref(false)
let isGood = ref(0)
let chooseType = ref(false)
let wareHousePositionDataSource = ref(null)
let checkDetailsData = reactive([])
let checkTypeForm = reactive({
  materialLabel: '套机',
  materialType: 1,
  positionCode: '',
  positionName: ''
})
let checkDetailsTableHeader = [
  {
    label: '仓库名称',
    prop: 'warehouseName'
  }, {
    label: '仓位名称',
    prop: 'warehousePositionName'
  }, {
    label: '物料代码',
    prop: 'materialCode'
  }, {
    label: '规格型号',
    prop: 'materialSpecification'
  }, {
    label: '物料类型',
    prop: 'materialType'
  }, {
    label: '账面数量',
    prop: 'bookQuantity'
  }, {
    label: '实盘数量',
    prop: 'firmOfferQuantity'
  }, {
    label: '盈亏数量',
    prop: 'profitAndLossQuantity'
  }, {
    label: '备注',
    prop: 'comment'
  }
]
let checkFormData = {
  title: '新增盘点记录',
  elements: [{
    label: '盘点日期',
    prop: 'inventorySheetDate',
    element: 'date',
    rules: [{
      required: true,
      message: '盘点日期不能为空',
      trigger: 'blur'
    }]
  }, {
    label: '盈亏总数量',
    prop: 'profitAndLossQuantitySum',
    rules: [{
      required: true,
      message: '盈亏总数量不能为空',
      trigger: 'blur'
    }],
    disabled: true
  }, {
    label: '备注',
    prop: 'comment',
    rules: [{
      required: true,
      message: '备注不能为空',
      trigger: 'blur'
    }]
  }]
}
let formData = reactive({
  inventorySheetDate: '',
  profitAndLossQuantitySum: '',
  comment: '',
  processStatus: 'INVENTORY_SHEET_CREATE',
  inventorySheetDetailList: []
})

let materialFormData = {
  elements: [
    {
      label: '仓库名称',
      prop: 'warehouseName',
      disabled: true
    }, {
      label: '仓位名称',
      prop: 'warehousePositionName',
      disabled: true
    }, {
      label: '物料代码',
      prop: 'materialCode',
      element: 'dialog',
      disabled: true
    }, {
      label: '规格型号',
      prop: 'materialSpecification',
      disabled: true
    }, {
      label: '物料名称',
      prop: 'materialName',
      disabled: true
    }, {
      label: '物料类型',
      prop: 'materialType',
      disabled: true
    }, {
      label: '账面数量',
      prop: 'bookQuantity',
      disabled: true
    }, {
      label: '实盘数量',
      prop: 'firmOfferQuantity',
      rules: [{
        required: true,
        message: '实盘数量不能为空',
        trigger: 'blur'
      }]
    }, {
      label: '盈亏数量',
      prop: 'profitAndLossQuantity',
      disabled: true
    }, {
      label: '备注',
      prop: 'comment',
      rules: [{
        required: true,
        message: '备注不能为空',
        trigger: 'blur'
      }]
    }
  ]
}

let material = reactive({
  warehouseName: '',
  warehouseCode: '',
  warehousePositionName: '',
  warehousePositionCode: '',
  materialCode: '',
  materialSpecification: '',
  materialName: '',
  materialType: '',
  bookQuantity: 0,
  firmOfferQuantity: 0,
  profitAndLossQuantity: 0,
  comment: ''
})

let fittingFormRef = ref(null)

let active = ref(0)

let formRef = ref(null)

onBeforeMount(() => {
  if (!checkDataSource.value) {
    checkDataSource.value = new CheckDataSource({
      selectOneUri: '/inventorySheet/selectOne'
    })
  }
  if (!wareHousePositionDataSource.value) {
    wareHousePositionDataSource.value = new WareHousePositionDataSource({
      selectUri: '/warehouse/listAllPosition',
      pageSize: 10000
    })
  }
  if (route.query.id) {
    getCheckData()
  }
})

const save = async () => {
  await formRef.value.ruleFormRef.validate((valid, fields) => {
    if (valid) {
      postCheckData()
    } else {
      ElMessage.error('请完善必填信息')
    }
  })
}

const getCheckData = () => {
  if (checkDataSource.value) {
    checkDataSource.value.selectOne(route.query.id).then(res => {
      Object.keys(res).forEach(key => {
        formData[key] = res[key]
      })
      formData['inventorySheetDate'] = changeTime(formData['inventorySheetDate'])
      active.value = status.indexOf(res.processStatus)
      if (active.value === 2) {
        active.value++
      }
      isCanNext()
      let params = {
        currentPage: 1,
        pageSize: 1000,
        inventorySheetDetail: { inventorySheetOrderCode: route.query.inventorySheetOrderCode }
      }
      checkDataSource.value.checkDetailSelect(params).then(res => {
        if (res.data.code === 200) {
          checkDetailsData.length = 0
          checkDetailsData.push(...res.data.data.pageInfo.list)
        }
      })
    })
  }
}

const postCheckData = async () => {
  if (!route.query.id) {
    let params = { list: [] }
    formData['inventorySheetDate'] = Date.parse(formData['inventorySheetDate'])
    formData['inventorySheetDetailList'].length = 0
    formData['inventorySheetDetailList'].push(...checkDetailsData)
    params.list.push(formData)
    checkDataSource.value.addCheckForm(params).then(res => {
      if (res.data.code === 200) {
        ElMessage.success('保存成功,请刷新获取数据')
        setTimeout(() => {
          router.go(-1)
        }, 1000)
      } else {
        ElMessage.error(res.data.message)
      }
    })
  } else {
    formData['inventorySheetDate'] = Date.parse(formData['inventorySheetDate'])
    checkDetailsData.forEach(item => {
      item['inventorySheetOrderCode'] = formData['inventorySheetOrderCode']
    })
    formData['inventorySheetDetailList'].length = 0
    formData['inventorySheetDetailList'].push(...checkDetailsData)
    console.log(formData['inventorySheetDetailList'])
    let params = { list: [] }
    params.list.push(formData)
    checkDataSource.value.updateCheckForm(params).then(res => {
      if (res.data.code === 200) {
        ElMessage.success('保存成功')
        getCheckData()
      }
    })
  }
}
const cancel = () => {
  router.go(-1)
}

const openCheckTypeDialog = () => {
  chooseType.value = true
}

const openDialog = () => {
  Object.assign(material, {
    warehouseName: '',
    warehouseCode: '',
    warehousePositionName: '',
    warehousePositionCode: '',
    materialCode: '',
    materialSpecification: '',
    materialName: '',
    materialType: '',
    bookQuantity: 0,
    firmOfferQuantity: 0,
    profitAndLossQuantity: 0,
    comment: ''
  })
  showDialog.value = true
}

const closeDialog = () => {
  Object.keys(material).forEach(key => {
    material[key] = ''
  })
  material['firmOfferQuantity'] = 0
  showDialog.value = false
}

const getMaterialData = () => {
  if (isGood.value === 0) {
    inventoryCheckDataSource.value.searchData['materialCode'] = materialCode
    inventoryCheckDataSource.value.initData()
  } else {
    goodDataSource.value.searchData['materialCode'] = materialCode
    goodDataSource.value.initData()
  }

}

const openMaterialDialog = () => {
  if (isGood.value === 0) {
    if (checkTypeForm.materialType === 0) {
      materialCode.value = ''
      inventoryCheckDataSource.value = new InventoryCheckDataSource({
        tableHeader: [
          {
            label: "所属仓库",
            prop: "warehouseName"
          }, {
            label: "所属仓位名称",
            prop: "warehousePositionName"
          }, {
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
          }, {
            label: "现有量",
            prop: "materialNum"
          }
        ],
        pageSize: 100000,
        selectUri: '/stockPosition/select'
      })

      inventoryCheckDataSource.value.searchData = { warehouseName: userInfo.warehouseName, warehousePositionName: checkTypeForm.positionName }
      inventoryCheckDataSource.value.initData()
      chooseMaterialDialog.value = true
      chooseType.value = false
    } else {
      materialCode.value = ''
      inventoryCheckDataSource.value = new InventoryCheckDataSource({
        tableHeader: [
          {
            label: "所属仓库",
            prop: "warehouseName"
          }, {
            label: "所属仓位名称",
            prop: "warehousePositionName"
          }, {
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
          }, {
            label: "现有量",
            prop: "nowNumber"
          }
        ],
        pageSize: 100000,
        selectUri: '/stockMain/select'
      })
      inventoryCheckDataSource.value.searchData = { warehouseName: userInfo.warehouseName, materialType: '套机' }
      inventoryCheckDataSource.value.initData()
      chooseMaterialDialog.value = true
      chooseType.value = false
    }
  } else {
    if (checkTypeForm.materialType === 0) {
      materialCode.value = ''
      goodDataSource.value = new GoodDataSource({
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
        pageSize: 10,
        selectUri: '/material/selectTwo'
      })

      goodDataSource.value.searchData = { isMaterial: 1 }
      goodDataSource.value.initData()
      chooseMaterialDialog.value = true
      chooseType.value = false
    } else {
      materialCode.value = ''
      goodDataSource.value = new GoodDataSource({
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
        selectUri: '/material/selectTwo',
        pageSize: 10
      })
      goodDataSource.value.searchData = { isMaterial: 0 }
      goodDataSource.value.initData()
      chooseMaterialDialog.value = true
      chooseType.value = false
    }
  }

}

const chooseRow = (row) => {
  console.log(isGood.value)
  if (isGood.value === 0) {
    Object.assign(material, row)
    if (row['materialNum']) {
      material['bookQuantity'] = row['materialNum']
    } else {
      material['bookQuantity'] = row['nowNumber']
    }
    material['firmOfferQuantity'] = 0
    material['profitAndLossQuantity'] = 0
    chooseMaterialDialog.value = false
  } else if (isGood.value === 1){
    Object.assign(material, row)
    material['warehouseName'] = userInfo.warehouseName
    material['warehouseCode'] = userInfo.warehouseCode
    if (checkTypeForm.materialType === 0) {
      material['warehousePositionName'] = checkTypeForm.positionName
      material['warehousePositionCode'] = checkTypeForm.positionCode
    }
    material['bookQuantity'] = 0
    material['firmOfferQuantity'] = 0
    material['profitAndLossQuantity'] = 0
    chooseMaterialDialog.value = false
  }

}

const compileMaterial = (row) => {
  compileIndex.value = row.id
  showDialog.value = true
  Object.keys(row).forEach(key => {
    material[key] = row[key]
  })
}

const deleteMaterial = (row) => {
  checkDetailsData.splice(checkDetailsData.findIndex(item => item.id === row.id), 1)
  formData['profitAndLossQuantitySum'] = 0
  checkDetailsData.forEach(item => {
    formData['profitAndLossQuantitySum'] = Number(formData['profitAndLossQuantitySum']) + Number(item['profitAndLossQuantity'])
  })
  ElMessage.success('删除成功')
}

const putMaterialData = () => {
  if (material['comment'] === ''){
    ElMessage.error('备注不能为空')
    return
  }
  if (compileIndex.value === -1) {
    let temp = {}
    Object.keys(material).forEach(key => {
      temp[key] = material[key]
    })
    temp['profitAndLossQuantity'] = temp['firmOfferQuantity'] - temp['bookQuantity']
    formData['profitAndLossQuantitySum'] = 0
    checkDetailsData.push(temp)
    checkDetailsData.forEach(item => {
      formData['profitAndLossQuantitySum'] = Number(formData['profitAndLossQuantitySum']) + Number(item['profitAndLossQuantity'])
    })
    ElMessage.success('新增成功')
    showDialog.value = false
  } else {
    let index = checkDetailsData.findIndex(item => item.id === compileIndex.value)
    checkDetailsData.splice(index, 1)
    let temp = {}
    Object.keys(material).forEach(key => {
      temp[key] = material[key]
    })
    temp['profitAndLossQuantity'] = temp['firmOfferQuantity'] - temp['bookQuantity']
    formData['profitAndLossQuantitySum'] = 0
    checkDetailsData.push(temp)
    checkDetailsData.forEach(item => {
      formData['profitAndLossQuantitySum'] = Number(formData['profitAndLossQuantitySum']) + Number(item['profitAndLossQuantity'])
    })
    ElMessage.success('编辑成功')
    showDialog.value = false
  }
}

const next = () => {
  let list = []
  list.push(route.query.inventorySheetOrderCode)
  checkDataSource.value.nextStatus(list).then(res => {
    if (res === 200) {
      ElMessage.success('递交成功')
      getCheckData()
    } else {
      ElMessage.error(res)
    }
  })
}

const isCanNext = () => {
  if (active.value === 3) {
    canNext.value = false
  } else if (active.value === 1) {
    if (pro.includes('FUNCTION_INVENTORY_REVIEW')){
      canNext.value = true
    } else {
      canNext.value = false
    }
  } else {
    canNext.value = true
  }
}

const closeChooseMaterialDialog = () => {
  showDialog.value = false
}

const back = () => {
  let list = []
  list.push(route.query.inventorySheetOrderCode)
  checkDataSource.value.backStatus(list).then(res => {
    if (res === 200) {
      ElMessage.success('回退成功')
      getCheckData()
    } else {
      ElMessage.error(res)
    }
  })
}

const selectMaterialType = (val) => {
  checkFormData.materialType = val
  console.log(checkFormData.materialType)
  if (val === 0) {
    wareHousePositionDataSource.value.searchData = { warehouseCode: userInfo.warehouseCode }
    wareHousePositionDataSource.value.initData()
  }
}

const chooseIsGood = (val) => {
  isGood.value = val
}

const changePosition = (val) => {
  console.log(val)
  checkTypeForm.positionCode = val.split('+')[0]
  checkTypeForm.positionName = val.split('+')[1]
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