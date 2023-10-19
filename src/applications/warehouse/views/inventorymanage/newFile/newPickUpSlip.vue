<template>
  <div class="main">
    <div class="message_area">
      <goBack :back-config="backConfig" />
      <div class="form_area">
        <div class="form_title">
          {{ route.query.id ? formData.title.replace('新增', '编辑') + '  ' + route.query.pickingOrderCode : formData.title }}
        </div>
        <NewFileForm
          ref="formRef"
          :disabled="Boolean(route.query.pickingOrderCode)"
          :elements="formData.elements"
          :model="model"
          @open-dialog="openDialog"
        />
      </div>
      <el-dialog
        v-model="showSelectWare"
        title="选择发货仓库"
        :close-on-click-modal="false"
        :show-close="false"
      >
        <template #header="{ titleId, titleClass }">
          <div class="jx-dialog-header">
            <h4
              :id="titleId"
              :class="titleClass"
            >
              选择发货仓库
              <el-input
                v-model="warehouseSearch.warehouseName"
                clearable
                placeholder="请输入仓库名字"
                style="width:220px;margin-left:20px"
              >
                <template #append>
                  <el-button icon="Search" @click="getWarehouseData" />
                </template>
              </el-input>
              <span style="display:inline-block;margin-left:20px;font-size:12px;color:#f56c6c">Tips: 双击某行进行选择</span>
            </h4>
            <el-button
              class="dialog-close-btn"
              type="danger" icon="CloseBold"
              circle
              @click="(showSelectWare=false)"
            />
          </div>
        </template>
        <el-table
          ref="warehouseTable" v-loading="warehouseLoading" :data="wareHouseDataSource.tableData"
          border style="width: 100%"
          :header-cell-style="{ background: '#1f2430', color: '#fff', borderColor: 'rgba(192, 192, 192,.5)' }"
          :row-style="{height: '35px',background:'#fafafa',borderColor:'rgba(192, 192, 192,.5)'}"
          :cell-style="{padding: '0',borderColor:'rgba(192, 192, 192,.5)',borderLeft:'none'}"
          @row-dblclick="chooseWarehouse"
        >
          <el-table-column
            label="仓库编码" prop="warehouseCode"
            align="center"
          />
          <el-table-column
            label="仓库名称" prop="warehouseName"
            align="center"
          />
        </el-table>
        <div class="page">
          <el-pagination
            background
            layout="prev, pager, next"
            :total="wareHouseDataSource.total"
            :page-size="wareHouseDataSource.pageSize"
            hide-on-single-page
            @current-change="wareHouseDataSource.currentPageChange($event,wareHouseDataSource,proxy.$refs.warehouseTable)"
          />
        </div>
      </el-dialog>
      <el-dialog
        v-model="showSelectShops"
        title="选择商家"
        :close-on-click-modal="false"
        :show-close="false"
      >
        <template #header="{ titleId, titleClass }">
          <div class="jx-dialog-header">
            <h4
              :id="titleId"
              :class="titleClass"
            >
              选择商家
              <el-input
                v-model="shopSearch.merchantName"
                clearable
                placeholder="请输入商家名字"
                style="width:220px;margin-left:20px"
              >
                <template #append>
                  <el-button icon="Search" @click="getShopData" />
                </template>
              </el-input>
              <span style="display:inline-block;margin-left:20px;font-size:12px;color:#f56c6c">Tips: 双击某行进行选择</span>
            </h4>
            <el-button
              class="dialog-close-btn"
              type="danger" icon="CloseBold"
              circle
              @click="(showSelectShops=false)"
            />
          </div>
        </template>
        <el-table
          v-loading="loading" :data="shopData"
          border
          style="width: 100%"
          :header-cell-style="{ background: '#1f2430', color: '#fff', borderColor: 'rgba(192, 192, 192,.5)' }"
          :row-style="{height: '35px',background:'#fafafa',borderColor:'rgba(192, 192, 192,.5)'}"
          :cell-style="{padding: '0',borderColor:'rgba(192, 192, 192,.5)',borderLeft:'none'}"
          @row-dblclick="chooseShop"
        >
          <el-table-column
            label="商家编码" prop="merchantCode"
            align="center"
          />
          <el-table-column
            label="商家名称" prop="merchantName"
            align="center"
          />
        </el-table>
        <div class="page">
          <el-pagination
            background
            layout="prev, pager, next"
            :total="shopTotal"
            :page-size="shopPageSize"
            hide-on-single-page
            @current-change="shopCurrentChange"
          />
        </div>
      </el-dialog>
      <el-divider content-position="center">
        物料信息
      </el-divider>
      <div class="table">
        <SimpleTable
          need-index
          :table-header="tableHeader"
          :need-page="false"
          :loading="false" :show-tips="false" :table-data="DTOlist" :need-end-control="!Boolean(route.query.pickingOrderCode)"
        >
          <template #extraHandle>
            <div class="extraHandle">
              <el-button
                v-if="!Boolean(route.query.pickingOrderCode)"
                type="primary"
                plain
                @click="openFittingDialog"
              >
                新增物料
              </el-button>
            </div>
          </template>
          <template #endOption="params">
            <el-button
              type="primary" text
              @click="compileFitting(params.row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger" text
              @click="deleteFitting(params.row)"
            >
              删除
            </el-button>
          </template>
        </SimpleTable>
        <el-dialog
          v-model="showFittingDialog" title="新增商品" center
          width="60%" @close="closeFittingDialog"
        >
          <NewFileForm
            ref="fittingFormRef"
            :elements="fittingFormData.elements"
            :model="fittingData"
            @openDialog="openOldFittingDialog"
          />
          <el-dialog
            v-model="showOldMaterialDialog" title="物料信息"
            center width="60%"
          >
            <div style="margin: 15px 0">
              <el-input
                v-model="materialSearch.materialCode" placeholder="请输入物料代码"
                style="width:40%;margin: 10px 0;"
              >
                <template #append>
                  <el-button @click="getFittingData">
                    <el-icon><Search /></el-icon>
                  </el-button>
                </template>
              </el-input>
              <span style="display:inline-block;margin-left:20px;font-size:12px;color:#f56c6c">Tips: 双击某行进行选择</span>
              <SimpleTable
                :loading="loading" :table-header="fittingTableHeader" :table-data="goodDataSource.tableData" :total="goodDataSource.total"
                :show-tips="false" @chooseRow="chooseRow" @current-change="goodDataSource.currentPageChange($event,goodDataSource)"
              />
            </div>
          </el-dialog>
          <template #footer>
            <span class="dialog-footer">
              <el-button type="primary" @click="putFittingData">
                确定
              </el-button>
              <el-button @click="showFittingDialog = false">关闭</el-button>
            </span>
          </template>
        </el-dialog>
      </div>
      <div class="handle_area">
        <el-button
          v-authority="'MENU_PICKING_ORDER_WRITE'"
          type="primary"
          style="margin-right:30px"
          :loading="loading"
          @click="save"
        >
          保存
        </el-button>
        <el-button
          type="danger"
          @click="cancel"
        >
          取消
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import goBack from '@/components/common/goBack.vue'
import MyTable from '@/components/MyTable'
import NewFileForm from '@/components/NewFileForm.vue'
import SimpleTable from '@/components/SimpleTable.vue'
import { onBeforeMount, onMounted, reactive, ref, watch, getCurrentInstance } from 'vue'
import { GoodDataSource } from '@/applications/warehouse/utils/good/index'
import { getMerchant } from '@/applications/warehouse/utils/shop/index'
import { WareHouseDataSource, loading as warehouseLoading } from '@/applications/warehouse/utils/warehouse'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { changeTime } from '@/applications/warehouse/public/jxRequest'
import { PickupDataSource, loading } from '@/applications/warehouse/utils/pickup/index'
const { proxy } = getCurrentInstance()
let router = useRouter()
let route = useRoute()
let showSelectWare = ref(false)
let showSelectShops = ref(false)
let shopSearch = reactive({ merchantName: '' })
let materialSearch = reactive({ materialCode: '', isMaterial: 0 })

let warehouseSearch = reactive({ warehouseName: '' })
let shopTotal = ref(0)
let shopPageSize = ref(10)
let shopCurrentPage = ref(1)
let wareHouseDataSource = ref(null)
let pickupDataSource = ref(null)
let showFittingDialog = ref(false)
let showOldMaterialDialog = ref(false)
let backConfig = [{ title: '库存管理', path: '' }, { title: '提货订单', path: '' }, { title: '新增提货订单', path: '' }]
let goodDataSource = ref(null)
let compileIndex = ref(0)
let DTOlist = reactive([])
let warehouseData = reactive([])
let shopData = reactive([])

let tableHeader = reactive([
  {
    label: '产品名称',
    prop: 'materialName'
  }, {
    label: '套机码',
    prop: 'machineSetCode'
  }, {
    label: '规格型号',
    prop: 'specification'
  }, {
    label: '货物体积',
    prop: 'goodsVolume'
  }, {
    label: '货物数量',
    prop: 'goodsAmount'
  }
])

let fittingTableHeader = reactive([
  {
    label: '产品名称',
    prop: 'materialName'
  }, {
    label: '物料代码',
    prop: 'materialCode'
  }, {
    label: '物料型号',
    prop: 'materialSpecification'
  }, {
    label: '物料类型',
    prop: 'materialType'
  }, {
    label: '货物体积',
    prop: 'volume'
  }
])

let model = reactive({
  deliverWarehouse: '',
  deliverWarehouseCode: '',
  orderTime: '',
  goodsPickingKey: '',
  goodsReceiptingAddress: '',
  goodsReceiptingCustomer: '',
  merchantName: '',
  merchantCode: '',
  orderNotes: '',
  otherNotes: '',
  phone: '',
  detailExcelDTOList: []
})
let formData = {
  title: '新增提货订单',
  elements: [
    {
      label: '发货仓库',
      prop: 'deliverWarehouse',
      rules: [{
        required: true,
        message: '发货仓库不能为空',
        trigger: 'blur'
      }],
      disabled: true,
      element: 'dialog'
    }, {
      label: '下单时间',
      prop: 'orderTime',
      rules: [{
        required: true,
        message: '下单时间不能为空',
        trigger: 'blur'
      }],
      element: 'date'
    }, {
      label: '提货密钥',
      prop: 'goodsPickingKey',
      rules: [{
        required: true,
        message: '提货密钥不能为空',
        trigger: 'blur'
      }]
    }, {
      label: '收货地址',
      prop: 'goodsReceiptingAddress',
      rules: [{
        required: true,
        message: '收货地址不能为空',
        trigger: 'blur'
      }]
    }, {
      label: '收货客户',
      prop: 'goodsReceiptingCustomer',
      rules: [{
        required: true,
        message: '收货客户不能为空',
        trigger: 'blur'
      }]
    }, {
      label: '商家名称',
      prop: 'merchantName',
      disabled: true,
      rules: [{
        required: true,
        message: '商家名称不能为空',
        trigger: 'blur'
      }],
      element: 'dialog'
    }, {
      label: '订单备注',
      prop: 'orderNotes',
      type: 'textarea'
    }, {
      label: '送货备注',
      prop: 'otherNotes',
      type: 'textarea'
    }, {
      label: '联系电话',
      prop: 'phone'
    }
  ]
}

let fittingFormData = reactive({
  elements: [
    {
      label: '套机码',
      prop: 'machineSetCode',
      element: 'dialog',
      disabled: true
    }, {
      label: '产品名称',
      prop: 'materialName',
      disabled: true
    }, {
      label: '规格型号',
      prop: 'specification',
      disabled: true
    }, {
      label: '货物体积',
      prop: 'goodsVolume',
      disabled: true
    }, {
      label: '货物数量',
      prop: 'goodsAmount'
    }
  ]
})

let fittingData = reactive({
  machineSetCode: '',
  materialName: '',
  specification: '',
  goodsAmount: 0,
  goodsVolume: 0
})

let formRef = ref(null)
const openDialog = (val) => {
  if (val === 'deliverWarehouse') {
    if (!wareHouseDataSource.value) {
      wareHouseDataSource.value = new WareHouseDataSource({
        tableHeader: [{
          label: '仓库编码',
          prop: 'warehouseCode'
        }, {
          label: '仓库名称',
          prop: 'warehouseName'
        }],
        selectUri: '/warehouse/select',
        pageSize: 10,
        currentPage: 1
      })
    }
    getWarehouseData()
    showSelectWare.value = true
  } else {
    getShopData()
    showSelectShops.value = true
  }
}

const openFittingDialog = () => {
  if (!goodDataSource.value) {
    goodDataSource.value = new GoodDataSource({
      selectUri: '/material/select',
      tableHeader: fittingTableHeader,
      pageSize: 10
    })
    getFittingData()
  }
  showFittingDialog.value = true
}

const closeFittingDialog = () => {
  Object.keys(fittingData).forEach(key => {
    fittingData[key] = ''
  })
  fittingData['goodsVolume'] = 0
  fittingData['goodsAmount'] = 0
}

const openOldFittingDialog = () => {

  showOldMaterialDialog.value = true
}

const putFittingData = () => {
  if (fittingData['goodsAmount'] === 0) {
    ElMessage.error('货物数量不能为0')
    return
  }
  if (compileIndex.value === 0) {
    let temp = {}
    Object.keys(fittingData).forEach(key => {
      temp[key] = fittingData[key]
    })
    DTOlist.push(temp)
    ElMessage.success('新增成功')
    showFittingDialog.value = false
  } else {
    let index = DTOlist.findIndex(item => item.id === compileIndex.value)
    DTOlist.splice(index, 1)
    let temp = {}
    Object.keys(fittingData).forEach(key => {
      temp[key] = fittingData[key]
    })
    DTOlist.push(temp)
    ElMessage.success('编辑成功')
    showFittingDialog.value = false
  }

}

const compileFitting = (row) => {
  compileIndex.value = row.id
  showFittingDialog.value = true
  Object.keys(row).forEach(key => {
    fittingData[key] = row[key]
  })
}

const getFittingData = () => {
  if (materialSearch['materialCode'] === '') {
    delete materialSearch['materialCode']
  }
  goodDataSource.value.searchData = materialSearch
  goodDataSource.value.initData()
}

const getShopData = () => {
  if (shopSearch.merchantName === '') {
    delete shopSearch['merchantName']
  }
  let params = {
    currentPage: shopCurrentPage.value,
    pageSize: shopPageSize.value,
    merchant: shopSearch
  }
  getMerchant(params).then(res => {
    if (res.data.code === 200) {
      shopData.length = 0
      shopData.push(...res.data.data.pageInfo.list)
      console.log(shopData, 'data')
      shopTotal.value = res.data.data.pageInfo.total
    } else {
      ElMessage.error(res.data.message)
    }
  })
}

const getWarehouseData = () => {
  if (warehouseSearch['warehouseName'] === '') {
    delete warehouseSearch['warehouseName']
  }
  wareHouseDataSource.value.searchData = warehouseSearch
  wareHouseDataSource.value.initData()
  console.log(wareHouseDataSource)
}

const shopCurrentChange = (val) => {
  shopCurrentPage.value = val
  getShopData()
}

const chooseWarehouse = (row) => {
  model['deliverWarehouseCode'] = row['warehouseCode']
  model['deliverWarehouse'] = row['warehouseName']
  showSelectWare.value = false
}

const chooseShop = (row) => {
  model['merchantCode'] = row['merchantCode']
  model['merchantName'] = row['merchantName']
  showSelectShops.value = false
}

const chooseRow = (row) => {
  console.log(row)
  fittingData['machineSetCode'] = row['materialCode']
  fittingData['materialName'] = row['materialName']
  fittingData['specification'] = row['materialSpecification']
  fittingData['goodsVolume'] = row['volume']
  showOldMaterialDialog.value = false
}

const deleteFitting = (row) => {
  DTOlist.splice(DTOlist.findIndex(item => item.id === row.id), 1)
  ElMessage.success('删除成功')
}

const getShopAndWarehouseByUserId = () => {
  const userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
  pickupDataSource.value.queryByAccountId(userInfo.userId).then(res => {
    if (res.code && res.code === 200) {
      model.deliverWarehouseCode = res.data.warehouseCode
      model.deliverWarehouse = res.data.warehouseName
      model.merchantName = res.data.merchantName
      model.merchantCode = res.data.merchantCode
    }
  })
}

const save = async () => {
  await formRef.value.ruleFormRef.validate((valid, fields) => {
    if (valid) {
      model.detailExcelDTOList.length = 0
      model.detailExcelDTOList.push(...DTOlist)
      model['orderTime'] = Date.parse(model['orderTime'])
      console.log(model, 'model')
      if (!pickupDataSource.value) {
        pickupDataSource.value = new PickupDataSource({})
      }
      let params = { list: [] }
      params.list.push(model)
      pickupDataSource.value.excelAddBatch(params).then(res => {
        if (res === 200) {
          ElMessage.success('保存成功')
          setTimeout(() => {
            router.go(-1)
          }, 1000)
        } else {
          ElMessage.error(res)
        }
      })
      console.log('success submit!', params)
    } else {
      console.log('error submit!', fields)
    }
  })
}
onBeforeMount(() => {
  if (!pickupDataSource.value) {
    pickupDataSource.value = new PickupDataSource({
      selectUri: '/pickingOrderMain/select'
    })
  }
  getShopAndWarehouseByUserId()
  if (route.query.pickingOrderCode) {
    initData()
  }

})
const initData = async () => {
  pickupDataSource.value.searchData = { pickingOrderCode: route.query.pickingOrderCode }
  await pickupDataSource.value.initData()
  Object.assign(model, pickupDataSource.value.tableData[0])
  model['orderTime'] = changeTime(model['orderTime'])
  Object.assign(DTOlist, pickupDataSource.value.tableData[0]['pickingOrderDetailVOList'])
  console.log(model)
}
const cancel = () => {
  router.go(-1)
}
</script>

<style scoped>
.page {
 display: flex;
 justify-content: center ;
}

:deep(.el-divider__text){
      margin-top: 0;
      font-size: 16px;
      font-weight: 700;
  }
</style>