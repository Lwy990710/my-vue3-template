<template>
  <div class="main">
    <div class="message_area">
      <goBack :back-config="backConfig" />
      <div class="form_area">
        <div class="form_title">
          {{ route.query.id ? shopFormData.title.replace('新增', '编辑') : shopFormData.title }}
        </div>
        <NewFileForm
          ref="formRef"
          v-loading="loading"
          :elements="shopFormData.elements" :disabled="disabled"
          :model="formData" @openDialog="openDialog"
        />
        <div class="message-box">
          <div>
            <span>是否接收工程单短信：</span>
            <el-radio-group v-model="formData.isSendToBSms" class="ml-4">
              <el-radio label="yes" size="large">
                是
              </el-radio>
              <el-radio label="no" size="large">
                否
              </el-radio>
            </el-radio-group>
          </div>
          <div>
            <span>是否接收用户单短信：</span>
            <el-radio-group v-model="formData.isSendToCSms" class="ml-4">
              <el-radio label="yes" size="large">
                是
              </el-radio>
              <el-radio label="no" size="large">
                否
              </el-radio>
            </el-radio-group>
          </div>
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
            ref="warehouseTable" :data="wareHouseDataSource.tableData" border
            style="width: 100%"
            :header-cell-style="{ background: '#454c5c', color: '#fff', borderColor: 'rgba(192, 192, 192,.5)' }"
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
      </div>
      <el-divider
        border-style="dashed"
      />
      <div class="handle_area">
        <el-button
          v-if="!loading"
          type="primary" style="margin-right:30px"
          @click="save"
        >
          保存
        </el-button>
        <el-button type="danger" @click="cancel">
          取消
        </el-button>
      </div>
    </div>
    <selectDialogTable
      ref="dialogtableShops"
      :width="'60%'"
      :search-input-placeholder="'输入销售公司名称搜索'"
      :is-show="isShowSelectSale"
      :data-source="saleDataSource"
      :title="'请选择销售公司'"
      :is-show-search-input="true"
      :loading="loading"
      @close-dialog="isShowSelectSale=false"
      @doDialogSearch="doDialogSearchSale"
      @chooseRow="chooseRowSale"
    />
  </div>
</template>

<script setup>
import selectDialogTable from '@/components/common/selectDialogTable.vue'
import goBack from '@/components/common/goBack.vue'
import NewFileForm from '@/components/NewFileForm.vue'
import { reactive, ref, onBeforeMount, getCurrentInstance } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { loading, updateMerchant, getMerchantDetail, ShopDataSource } from '../../../utils/shop/index'
import { WareHouseDataSource } from '@/applications/warehouse/utils/warehouse'
const { proxy } = getCurrentInstance()
let warehouseSearch = reactive({ warehouseName: '', warehouseType: 'PRE' })
let wareHouseDataSource = ref(null)
let showSelectWare = ref(false)
let isShowSelectSale = ref(false)
let backConfig = reactive([{ title: '档案管理', path: '' }, { title: '商家档案', path: '' }, { title: '新增商家档案', path: '' }])
let router = useRouter()
let route = useRoute()
let disabled = ref(false)
const selectShops = ref(false)
let active = ref(0)
let shopFormData = {
  title: '新增商家',
  elements: [
    {
      label: '商家名称',
      prop: 'merchantName',
      rules: [{
        required: true,
        message: '商家名称不能为空',
        trigger: 'blur'
      }]
    }, {
      label: '商家简称',
      prop: 'merchantShortName',
      rules: [{
        required: true,
        message: '商家简称不能为空',
        trigger: 'blur'
      }]
    }, {
      label: '商家绑定仓库',
      prop: 'warehouseName',
      rules: [{
        required: true,
        message: '商家简称不能为空',
        trigger: 'blur'
      }],
      element: 'dialog',
      disabled: true
    }, {
      label: '机构代码',
      prop: 'institutionCode',
      rules: [{
        required: true,
        message: '机构代码不能为空',
        trigger: 'blur'
      }]
    }, {
      label: '商家联系人',
      prop: 'merchantLinkman',
      rules: [{
        required: true,
        message: '联系人不能为空',
        trigger: 'blur'
      }]
    }, {
      label: '手机号(账号)',
      prop: 'merchantPhone',
      rules: [{
        required: true,
        message: '手机号不能为空',
        trigger: 'blur'
      }, {
        min: 11,
        max: 11,
        message: '请输入正确格式的手机号',
        trigger: 'blur'
      }]
    }, {
      label: '商家类型',
      prop: 'belongCompanyType',
      element: 'select',
      options: [{
        label: '格匠',
        value: 'GE_JIANG'
      }, {
        label: '广州销售公司',
        value: 'GUANG_ZHOU'
      }, {
        label: '佛山销售公司',
        value: 'FO_SHAN'
      }, {
        label: '其他销售公司',
        value: 'OTHER'
      }]
    }, {
      label: '所属销司计费规则',
      prop: 'belongCompanyCostRule',
      element: 'select',
      options: [{
        label: '格匠',
        value: 'GE_JIANG'
      }, {
        label: '广州销售公司',
        value: 'GUANG_ZHOU'
      }, {
        label: '佛山销售公司',
        value: 'FO_SHAN'
      }, {
        label: '其他销售公司',
        value: 'OTHER'
      }]
    }, {
      label: '商家属性',
      prop: 'merchantType',
      element: 'select',
      options: [{
        label: '前置仓商家',
        value: 'PRE'
      }, {
        label: '大仓商家',
        value: 'BIG'
      }, {
        label: '销售公司',
        value: 'SALES'
      }, {
        label: '其他商家',
        value: 'OTHER'
      }]
    }, {
      label: '商家联系电话',
      prop: 'linkmanPhone'
    }, {
      label: '电子邮箱',
      prop: 'email'
    }, {
      label: '门店地址',
      prop: 'storeAddress'
    }, {
      label: '收货人',
      prop: 'receiptPerson'
    }, {
      label: '收货电话',
      prop: 'receiptPhone'
    }, {
      label: '收货地址',
      prop: 'receiptAddress'
    }, {
      label: '省',
      prop: 'province'
    }, {
      label: '市',
      prop: 'city'
    }, {
      label: '区',
      prop: 'region'
    }, {
      label: '街道',
      prop: 'street'
    }, {
      label: '备注',
      prop: 'comment'
    }, {
      label: '所属销售公司',
      prop: 'belongSalesCompanyName',
      element: 'dialog',
      disabled: true
    }
  ]
}
let formData = reactive({
  merchantName: '',
  merchantShortName: '',
  warehouseName: '',
  warehouseCode: '',
  institutionCode: '',
  merchantPhone: '',
  merchantLinkman: '',
  linkmanPhone: '',
  email: '',
  storeAddress: '',
  receiptPerson: '',
  receiptPhone: '',
  receiptAddress: '',
  province: '',
  city: '',
  region: '',
  street: '',
  comment: ''
})
let formRef = ref(null)

onBeforeMount(() => {
  if (route.query.id) {
    shopFormData.elements[5].disabled = true
    getShopData()
  }
  shopDataSource.value = new ShopDataSource({
    selectUri: '/merchant/select',
    tableHeader: dataHeader,
    pageSize: 10
  })
})

const save = async () => {
  await formRef.value.ruleFormRef.validate((valid, fields) => {
    if (valid) {
      let reg = /^[\u4E00-\u9FA5]+$/
      if (reg.test(formData.belongCompanyType)){
        formData.belongCompanyType = belongCompanyTypeRe[formData.belongCompanyType]
      }
      formData.isSendToBSms = formData.isSendToBSms === 'yes'
      formData.isSendToCSms = formData.isSendToCSms === 'yes'
      postShopData()
    } else {
      console.log('error submit!', fields)
    }
  })
}

const chooseWarehouse = (row) => {
  formData['warehouseCode'] = row['warehouseCode']
  formData['warehouseName'] = row['warehouseName']
  showSelectWare.value = false
}

const openDialog = (val) => {
  if (val !== 'warehouseName'){
    if (!saleDataSource.value) saleDataSource.value = new ShopDataSource({
      selectUri: '/merchantAllocationOrder/selectMerchantArchive',
      tableHeader: [{
        label: "销售公司名称",
        prop: "merchantName",
        width: 300
      }, {
        label: "商家类型",
        prop: "belongCompanyType",
        width: 200
      }, {
        label: "商家联系人",
        prop: "merchantLinkman",
        width: 200
      }, {
        label: "手机号",
        prop: "merchantPhone",
        width: 300
      }]
    })
    saleDataSource.value.forMatData = (row, column) => {
      if (column.property === 'belongCompanyType'){
        return belongCompanyType[row[column.property]]
      }
      if (!row[column.property] && row[column.property] !== 0) {
        return '-'
      } if (column.property.toLowerCase().indexOf('time') !== -1) {
        return new proxy.$DataTool().timeStamp2Time(row[column.property], 'yyyy-MM-dd hh:mm:ss')
      }
      return row[column.property]
    }
    saleDataSource.value.searchData.merchantType = 'SALES'
    isShowSelectSale.value = true
    return
  }
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
}

const getWarehouseData = () => {
  if (warehouseSearch['warehouseName'] === '') {
    delete warehouseSearch['warehouseName']
  }
  wareHouseDataSource.value.searchData = warehouseSearch
  wareHouseDataSource.value.initData()
  console.log(wareHouseDataSource)
}

let belongCompanyType = {
  GE_JIANG: "格匠",
  GUANG_ZHOU: "广州销售公司",
  FO_SHAN: "佛山销售公司",
  OTHER: "其他销售公司"
}
let belongCompanyTypeRe = {
  "格匠": 'GE_JIANG',
  "广州销售公司": 'GUANG_ZHOU',
  "佛山销售公司": "FO_SHAN",
  "其他销售公司": 'OTHER'
}

const getShopData = async () => {
  getMerchantDetail(route.query.id).then(res => {
    let shop = res.data.data
    if (shop.merchantList && shop.merchantList.length !== 0) shops.push(...shop.merchantList)
    Object.keys(shop).forEach(key => {
      formData[key] = shop[key]
    })
    formData.isSendToBSms = formData.isSendToBSms ? 'yes' : 'no'
    formData.isSendToCSms = formData.isSendToCSms ? 'yes' : 'no'
    formData.belongCompanyType = belongCompanyType[formData.belongCompanyType]
  })
}

const postShopData = async () => {
  let merchantList = { list: [] }
  if (route.query.id) {
    formData["id"] = route.query.id
    formData["merchantCode"] = route.query.merchantCode
  }
  merchantList.list.push(formData)
  merchantList.list[0].merchantList = shops
  updateMerchant(merchantList).then(res => {
    if (res.data.code === 200) {
      ElMessage({
        message: '保存成功',
        type: 'success'
      })
      if (route.query.id) getShopData()
      else {
        setTimeout(() => {
          router.go(-1)
        }, 1000)
      }
    } else if (res === 3001){
      ElMessage.error('系统中已存在! 请勿重复添加')
    }
  })
}

const shopDataSource = ref(null)
const saleDataSource = ref(null)

const doDialogSearchSale = (val) => {
  if (val && val.length !== 0) proxy.$refs.dialogtableShops.dialogSearch({ merchantName: val.trim() })
  else proxy.$refs.dialogtableShops.dialogSearch({})
}

const chooseRowSale = (val) => {
  formData.belongSalesCompanyCode = val.merchantCode
  formData.belongSalesCompanyName = val.merchantName
  isShowSelectSale.value = false
}

const dataHeader = [
  {
    label: "商家名称",
    prop: "merchantName",
    width: 300
  }, {
    label: "商家绑定仓库",
    prop: "warehouseName",
    width: 200
  }, {
    label: "商家联系电话",
    prop: "linkmanPhone",
    width: 300
  }, {
    label: "商家联系人",
    prop: "merchantLinkman",
    width: 200
  }, {
    label: "手机号",
    prop: "merchantPhone",
    width: 300
  }, {
    label: "门店地址",
    prop: "storeAddress",
    width: 300
  }
]

const shops = reactive([])

const handleDetele = (val) => {
  if (active.value > 1) return
  shops.splice(val, 1)
}

const cancel = () => {
  router.go(-1)
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
  .page {
    display: flex;
    justify-content: center ;
  }
}
.detail{
  border-radius: 8px;
  margin-top: 10px;
  background: #fff;
  width: 100%;
  padding: 8px;
}
:deep(.el-divider__text){
  font-size: 18px;
  font-weight: 800;
}
}
.message-box{
  width: 86%;
  margin: 0 auto;
  span{
    display: inline-block;
    width: 150px;
    font-size: 14px;
    margin-right: 12px;
    margin-left: 12px;
    color: #606266;
  }
}
</style>