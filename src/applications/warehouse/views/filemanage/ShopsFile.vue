<template>
  <div class="main">
    <div class="data-filter">
      <data-filter
        ref="filter"
        :filter-items="shopDataSource.tableHeader"
        @search="shopDataSource.search($event,adjustDataSource,proxy.$refs.table)"
      />
    </div>
    <div class="extend-handle">
      <div class="extend-handle-left">
        <el-button
          class="handle-btn"
          color="#4a78bd"
          style="color: #666"
          plain
          @click="addFile"
        >
          新增
        </el-button>
        <el-upload
          class="inline-block mr12 ml12"
          accept=".xlsx, .xls"
          :before-upload="beforeUpload"
          :show-file-list="false"
          :http-request="()=>{}"
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
          style="color: #666;"
          plain
          @click="exportExcel"
        >
          批量导出
        </el-button>
        <el-popconfirm
          :title="`是否确定删除 ${shopDataSource.selections.length} 条数据`"
          confirm-button-text="确定"
          cancel-button-text="取消"
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
          class="handle-btn mr12"
          color="#4a78bd"
          style="color: #666"
          plain
          @click="searchSaleCop"
        >
          绑定销售公司
        </el-button>
      </div>
    </div>
    <v-table
      ref="table"
      need-end-handle
      need-check-box
      :total="shopDataSource.total"
      :current-page="shopDataSource.currentPage"
      :page-size="shopDataSource.pageSize"
      :table-data="shopDataSource.tableData"
      :columns="shopDataSource.tableHeader"
      :loading="loading&&!isShowSelectSale"
      :default-end-handle="false"
      :customize-end-handle="customizeEndHandle"
      :for-mat-data="shopDataSource.forMatDataV2"
      @selectionChange="shopDataSource.selectionChange($event,shopDataSource,proxy.$refs.table)"
      @refresh="shopDataSource.initData(shopDataSource, proxy.$refs.table)"
      @editRow="goCompile"
      @deleteRow="deleteRecord"
      @current-change="shopDataSource.currentPageChange($event,shopDataSource,proxy.$refs.table)"
      @sizeChange="shopDataSource.pageSizeChange($event,shopDataSource,proxy.$refs.table)"
      @editTableHeader="isShowEditTableHeader = true"
    />
    <selectDialogTable
      ref="dialogtableSale"
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
            :is-show-edit-table-header="isShowEditTableHeader" :modules="'shopsFile'"
            @updateCompleted="updateHeaderCompleted"
          />
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import * as XLSX from "xlsx"
import VTable from '@/components/public/virtualTable.vue'
import dataFilter from '@/components/common/dataFilter.vue'
import selectDialogTable from '@/components/common/selectDialogTable.vue'
import dynamicHeader from '@/components/common/dynamicHeader.vue'
import { useStore } from "vuex"
import { ref, onBeforeMount, getCurrentInstance, watch, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox, ElButton } from 'element-plus'
import { loading, updateMerchant, ShopDataSource } from '../../utils/shop/index'
import { changeTime, getTime } from '@/applications/warehouse/public/jxRequest/index'
const { proxy } = getCurrentInstance()
const permissionsArr = JSON.parse(sessionStorage.getItem('userPermissions'))
const { _state } = useStore()
let router = useRouter()
const isShowEditTableHeader = ref(false)
const saleDataSource = ref(null)
const isShowSelectSale = ref(false)
let shopDataSource = ref(null)
const setTableHeader = () => {
  tableHeader.length = 0
  tableHeader.push(..._state.data.shopsFile.tableHeader.filter((item) => item.isShow))
}

let belongCompanyType = {
  GE_JIANG: "格匠",
  GUANG_ZHOU: "广州销售公司",
  FO_SHAN: "佛山销售公司",
  OTHER: "其他销售公司"
}

let route = useRoute()
watch(() => route.path, (newPath, oldPath) => {
  if (newPath === '/file/shops') {
    if (!shopDataSource.value) shopDataSource.value = new ShopDataSource({
      modules: 'shopsFile',
      selectUri: '/merchant/select',
      deleteUri: '/merchant/delete',
      selectOneUri: '/'
    })
    shopDataSource.value.initData(this)
  }
})

const updateHeaderCompleted = () => {
  isShowEditTableHeader.value = false
  shopDataSource.value.initTableHeader()
}

const doDialogSearchSale = (val) => {
  if (val && val.length !== 0) proxy.$refs.dialogtableSale.dialogSearch({ merchantName: val.trim() })
  else proxy.$refs.dialogtableSale.dialogSearch({ merchantType: 'SALES' })
}

const searchSaleCop = () => {
  if (shopDataSource.value.selections.length < 1) {
    ElMessage.error({
      message: '请先选择数据'
    })
    return
  }
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
}

const chooseRowSale = (val) => {
  let params = shopDataSource.value.selections.map(item => {
    item.belongSalesCompanyCode = val.merchantCode
    item.belongSalesCompanyName = val.merchantName
    item.merchantList = []
    return item
  })
  updateMerchant({ list: params }).then(res => {
    if (res.data.code === 200) {
      ElMessage.success({
        message: '绑定成功'
      })
      isShowSelectSale.value = false
      shopDataSource.value.initData(this, proxy.$refs.table)
    } else {
      ElMessage.error(res.data.message)
    }
  })
}

onBeforeMount(() => {
  if (!shopDataSource.value) shopDataSource.value = new ShopDataSource({
    modules: 'shopsFile',
    selectUri: '/merchant/select',
    deleteUri: '/merchant/delete',
    selectOneUri: '/'
  })
  shopDataSource.value.initTableHeader()
  shopDataSource.value.initData()
})

let uploadExcel = (data) => {
  console.log(data)
  const header = {
    merchantName: '商家',
    merchantShortName: '商家简称',
    institutionCode: '机构代码',
    linkmanPhone: '商家联系电话',
    merchantLinkman: '商家联系人',
    merchantPhone: '手机号',
    email: '电子邮箱',
    storeAddress: '门店地址',
    receiptPerson: '收货人',
    receiptPhone: '收货电话',
    receiptAddress: '收货地址',
    province: '省',
    city: '市',
    region: '区',
    street: '街道',
    comment: '备注'
  }
  let excelData = []
  let excelObject = {}
  data.map(item => {
    if (item['商家'].replace(/\s*/g, "")){
      Object.keys(item).forEach(dataKey => {
        Object.keys(header).forEach(headerKey => {
          if (header[headerKey] === dataKey) {
            excelObject[headerKey] = item[dataKey]
          }
        })
      })
      excelData.push(excelObject)
      excelObject = {}
    }
  })
  let merchantList = { list: [...excelData] }
  postShopData(merchantList)
  console.log(excelData)
}

const postShopData = async (merchantList) => {
  updateMerchant(merchantList).then(res => {
    if (res.data.code === 200) {
      ElMessage.success({
        message: '数据导入成功'
      })
      shopDataSource.value.initData(this, proxy.$refs.table)
    } else if (res.data.code === 3001) {
      ElMessage.error('存在重复数据，请检查excel')
    }
  })
}

const downloadTemplate = () => {
  window.location = 'https://jxwlapp.oss-cn-guangzhou.aliyuncs.com/excelTemplate/商家信息.xls?download'
}

let exportExcel = () => {
  if (shopDataSource.value.selections.length < 1) {
    ElMessage.error({
      message: '请先选择导出的数据'
    })
  } else {
    const header = [
      "merchantCode", "merchantName", "merchantShortName", "institutionCode", "merchantPhone", "merchantLinkman", "linkmanPhone", "email", "stroeAddress", "receiptPerson", "receiptPhone", "receiptAddress", "province", "city", "region", "street", "createTime", "createUser", "comment"
    ]
    const headerZn = { merchantCode: '商家编码', merchantName: '商家', merchantShortName: '商家简称', institutionCode: '机构代码', linkmanPhone: '商家联系电话', merchantLinkman: '商家联系人', merchantPhone: '手机号', email: '电子邮箱', stroeAddress: '门店地址', receiptPerson: '收货人', receiptPhone: '收货电话', receiptAddress: '收货地址', province: '省', city: '市', region: '区', street: '街道', createTime: '创建时间', createUser: '创建人', updateTime: '更新时间', updateUser: '更新人', comment: '备注' }

    shopDataSource.value.selections.map(item => {
      item["createTime"] = changeTime(item["createTime"])
      item["updateTime"] = changeTime(item["updateTime"])
    })

    const newSelections = [headerZn, ...shopDataSource.value.selections]

    // 将json数据变为sheet数据
    let sheet = XLSX.utils.json_to_sheet(newSelections, { header, skipHeader: true }),

      // 新建表格
      book = XLSX.utils.book_new()

    // 在表格中插入一个sheet
    XLSX.utils.book_append_sheet(book, sheet, "sheet1")

    let now = getTime()

    // 通过xlsx的writeFile方法将文件写入
    XLSX.writeFile(book, `商家信息${now}.xls`)
  }

}

const deleteRecord = ({ id }) => {
  deleteShop(id)
}

const deleteRecords = () => {
  deleteShops()
}

const deleteShops = async () => {
  if (shopDataSource.value.selections.length < 1) {
    ElMessage.error('请先选择数据')
    return
  }
  if (!checkPermissions()) return
  let idList = []
  shopDataSource.value.selections.forEach(item => {
    idList.push(item["id"])
  })
  shopDataSource.value.delete(idList, proxy.$refs.table).then(res => {
    if (res === 200) {
      ElMessage({
        message: `已成功删除${idList.length}条数据`,
        type: 'success'
      })
    }
  })
}

const deleteShop = async (id) => {
  if (!checkPermissions()) return
  let idList = []
  idList.push(id)
  ElMessageBox.alert('是否确认删除这条数据', '提示', {
    type: 'error',
    showCancelButton: true,
    cancelButtonText: '再想想',
    confirmButtonText: '确认删除',
    confirmButtonClass: 'delete-confirm-btn',
    callback: (action) => {
      if (action === 'cancel') return
      else {
        shopDataSource.value.delete(idList, proxy.$refs.table).then(res => {
          if (res === 200) {
            ElMessage({
              message: `已成功删除${idList.length}条数据`,
              type: 'success'
            })
          }
        })
      }
    }
  })

}

const addFile = () => {
  if (!checkPermissions()) return
  router.push({
    path: '/file/new/shop'
  })
}

const goCompile = ({ id, merchantCode }) => {
  router.push({
    path: '/file/new/shop',
    query: { id, merchantCode }
  })
}

let beforeUpload = async (file) => {
  if (!checkPermissions()) return
  let data = await readFile(file)
  let workbook = XLSX.read(data, { type: "binary" }),
    worksheet = workbook.Sheets[workbook.SheetNames[0]]
  data = XLSX.utils.sheet_to_json(worksheet)
  uploadExcel(data)
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

const checkPermissions = () => {
  if (permissionsArr.includes('FUNCTION_CREATE_MERCHANT')) {
    return true
  } else {
    ElMessage.error('该账号没有维护商家档案的权限')
    return false
  }
}

const customizeEndHandle = (rowData) => {
  return [h('div', { class: 'table-handel-div' }, [h(
    ElButton,
    { onClick: () => { goCompile(rowData) }, type: "primary", icon: "Edit", text: true, style: 'padding:0;margin:0;background:transparent' },
    { default: () => "编辑" }
  )])]
}
</script>

<style lang="less" scoped>
.main {
  width: 100%;
  .table{
    padding: 10px;
    background-color: #ffffff;
  }
}
</style>