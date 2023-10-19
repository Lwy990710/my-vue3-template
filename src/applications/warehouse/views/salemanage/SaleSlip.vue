<template>
  <div class="main">
    <div class="data-filter">
      <data-filter
        :filter-items="saleSlipDataSource.tableHeader"
        use-data-filter
        :expand-filter-items="expandFilterItems"
        @currentDayChange="saleSlipDataSource.currentDayChange($event,saleSlipDataSource)"
        @search="saleSlipDataSource.search($event,saleSlipDataSource,proxy.$refs.table)"
      />
    </div>
    <div class="extend-handle">
      <div class="extend-handle-left">
        <el-button
          class="handle-btn"
          color="#4a78bd"
          style="color: #666"
          plain
          @click="goAdd"
        >
          新增
        </el-button>
        <el-button
          class="handle-btn"
          color="#4a78bd"
          style="color: #666"
          plain
          @click="goPrint"
        >
          打印配送单
        </el-button>
        <el-upload
          class="inline-block ml12"
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
          class="handle-btn ml12"
          color="#4a78bd"
          style="color: #666"
          plain
          @click="exportExcel"
        >
          导出Excel
        </el-button>
        <el-popconfirm
          :title="'是否确定删除' + saleSlipDataSource.selections.length +'条数据'"
          confirm-button-text="确定"
          cancel-button-text="再想想"
          @confirm="deleteRecords"
        >
          <template #reference>
            <el-button
              class="handle-btn-delete ml10"
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
            class="ml12"
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
        <el-dropdown trigger="click" @command="flowMaterial">
          <el-button
            class="handle-btn mr10"
            color="#4a78bd"
            style="color: #666"
            plain
          >
            一键留料<el-icon class="el-icon--right">
              <arrow-down />
            </el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="stop">
                遇到错误中止所有操作
              </el-dropdown-item>
              <el-dropdown-item command="continue">
                遇到错误保留已成功数据
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
      :total="saleSlipDataSource.total"
      :current-page="saleSlipDataSource.currentPage"
      :page-size="saleSlipDataSource.pageSize"
      :table-data="saleSlipDataSource.tableData"
      :columns="saleSlipDataSource.tableHeader"
      :loading="loading&&!isShowCheckLocus&&!isShowLoading"
      :default-end-handle="false"
      :customize-end-handle="customizeEndHandle"
      :end-handle-width="220"
      :for-mat-data="saleSlipDataSource.forMatDataV2"
      @selectionChange="saleSlipDataSource.selectionChange($event,saleSlipDataSource,proxy.$refs.table)"
      @refresh="saleSlipDataSource.initData(saleSlipDataSource, proxy.$refs.table,true)"
      @editRow="goCompile"
      @deleteRow="deleteRecord"
      @current-change="saleSlipDataSource.currentPageChange($event,saleSlipDataSource,proxy.$refs.table)"
      @sizeChange="saleSlipDataSource.pageSizeChange($event,saleSlipDataSource,proxy.$refs.table)"
      @editTableHeader="isShowEditTableHeader = true"
    />
  </div>
  <el-dialog
    v-model="isShowLoading"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    width="22%"
    lock-scroll
  >
    <template #header="{ titleId, titleClass }">
      <div class="jx-dialog-header">
        <h4 :id="titleId" :class="titleClass">
          批量留料可能需要一点时间，请耐心等待
        </h4>
      </div>
    </template>
    <div class="content flex-center">
      <el-progress
        type="circle" :percentage="percentage"
        :status="percentage===100?'success':''"
        class="mb10"
      />
      {{ percentage===100?'':'留料中，请勿进行其他操作......' }}
      <div v-if="percentage===100" class="mb20">
        <span style="color:green;font-size:16px;font-weight:800" class="mr10">成功：{{ flowDetail.successOrder.length }}</span>
        <span style="color:red;font-size:16px;font-weight:800" class="mr10">失败：{{ flowDetail.failOrder.length }}</span>
        <span style="color:blue;font-size:16px;font-weight:800">总共：{{ flowDetail.allLength }}</span>
      </div>
    </div>
    <div class="mt10">
      <el-button
        v-if="percentage===100" type="danger"
        style="float:right;margin-right:10px"
        @click="closeLoading"
      >
        关闭
      </el-button>
      <el-button
        v-if="percentage===100" type="primary"
        style="float:right;margin-right:10px"
        @click="flowDetails=true"
      >
        查看详情
      </el-button>
    </div>
  </el-dialog>
  <el-dialog
    v-model="flowDetails"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    width="50%"
    top="4%"
    lock-scroll
  >
    <template #header="{ titleId, titleClass }">
      <div class="jx-dialog-header">
        <h4 :id="titleId" :class="titleClass">
          批量留料详情
        </h4>
      </div>
    </template>
    <div class="demo-collapse">
      <div class="mb20">
        <span style="color:green;font-size:16px;font-weight:800" class="mr10">成功：{{ flowDetail.successOrder.length }}</span>
        <span style="color:red;font-size:16px;font-weight:800" class="mr10">失败：{{ flowDetail.failOrder.length }}</span>
        <span style="color:blue;font-size:16px;font-weight:800">总共：{{ flowDetail.allLength }}</span>
      </div>
      <div
        class="mb20" style="font-size:16px;font-weight:800"
      >
        成功留料单号：{{ flowDetail.successOrder.join(' ') }}
      </div>
      <div>
        <span style="color:red;font-size:16px;font-weight:800" class="mb20 inline-block">失败详情：</span>
        <el-collapse>
          <el-collapse-item
            v-for="item in flowDetail.failOrder" :key="item.order"
            :title="'销售订单号：' + item.order"
            :name="item.order"
          >
            <div>
              {{ item.message }}
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
    <div class="mt10">
      <el-button
        type="danger" style="float:right;margin-right:10px"
        @click="flowDetails=false"
      >
        关闭
      </el-button>
    </div>
  </el-dialog>
  <el-dialog
    v-model="isShowCheckLocus"
    title="物流轨迹查看"
    :close-on-click-modal="false"
    :show-close="false"
    width="70%"
    top="20px"
  >
    <template #header="{ titleId, titleClass }">
      <div class="jx-dialog-header">
        <h4 :id="titleId" :class="titleClass">
          物流轨迹查看 {{ isCheckingSaleOrderCode }}
        </h4>
        <el-button
          class="dialog-close-btn"
          type="danger" icon="CloseBold"
          circle
          @click="(isShowCheckLocus=false)"
        />
      </div>
    </template>
    <div class="bfc">
      <locus v-if="isShowCheckLocus" :init-data="locusData" />
    </div>
  </el-dialog>
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
          :is-show-edit-table-header="isShowEditTableHeader" :modules="'sale'"
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
import locus from './components/locus.vue'
import { onBeforeMount, ref, getCurrentInstance, watch, h, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { SaleSlipDataSource, loading } from '../../utils/sale/index'
import { ElMessage, ElMessageBox, ElButton } from 'element-plus'

const route = useRoute()

watch(() => route.path, (newPath, oldPath) => {
  if (newPath === '/sale/slip') {
    if (!saleSlipDataSource.value) saleSlipDataSource.value = new SaleSlipDataSource({
      modules: 'sale',
      selectUri: '/saleOrderMain/select',
      deleteUri: '/saleOrderMain/delete',
      selectOneUri: '/'
    })
    saleSlipDataSource.value.initData(this, proxy.$refs.table, true)
  }
})

const { proxy } = getCurrentInstance()
const router = useRouter()
let saleSlipDataSource = ref(null)
const isShowEditTableHeader = ref(false)
const isShowLoading = ref(false)
const percentage = ref(0)

const flowDetails = ref(false)
const flowDetail = reactive({
  successOrder: [],
  failOrder: []
})

let dataTool = null // 数据工具类实例

const updateHeaderCompleted = () => {
  isShowEditTableHeader.value = false
  saleSlipDataSource.value.initTableHeader()
}

onBeforeMount(() => {
  if (!dataTool) dataTool = new proxy.$DataTool()
  if (!saleSlipDataSource.value) saleSlipDataSource.value = new SaleSlipDataSource({
    modules: 'sale',
    selectUri: '/saleOrderMain/select',
    deleteUri: '/saleOrderMain/delete',
    selectOneUri: '/',
    useDefaultTimeRangeFilter: true,
    defaultTimeRangeDay: 7
  })
  if (!dataTool) dataTool = new proxy.$DataTool()
  saleSlipDataSource.value.initTableHeader()
  initData()
})

const initData = () => {
  saleSlipDataSource.value.initData(this, proxy.$refs.table)
}

const deleteRecord = ({ id, processStatus }) => {
  if (processStatus !== 'SALE_ORDER_CREATE'){
    ElMessage.error('仅制单支持删除')
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
        saleSlipDataSource.value.delete(params, proxy.$refs.table).then((res) => {
          if (res === 200){
            ElMessage.success('成功删除1条数据')
          } else ElMessage.error(res)
        })
      }
    }
  })
}

const deleteRecords = () => {
  let params = []
  if (saleSlipDataSource.value.selections.length === 0){
    ElMessage.error('请先选择数据')
    return
  }
  else {
    if (!dataTool.processLimitation(saleSlipDataSource.value.selections, ['SALE_ORDER_CREATE'])){
      ElMessage.error('仅制单状态支持删除')
      return
    }
    params = dataTool.objectListGetValueByKey(saleSlipDataSource.value.selections, 'id')
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
        saleSlipDataSource.value.delete(params, proxy.$refs.table).then((res) => {
          if (res === 200){
            ElMessage.success(`成功删除${params.length}条数据`)
          } else ElMessage.error(res)
        })
      }
    }
  })

}

const fileChoice = async (file) => {
  const userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
  if (userInfo.jobId !== 34) {
    ElMessage.error('只有商家账号可以导入销售订单')
    return
  }
  if (!dataTool) dataTool = new proxy.$DataTool()
  let xlsxData = await dataTool.xlsx2DataObject(file.raw)
  let list = handleXlsxData(xlsxData)
  if (!list) return
  let params = {
    list: handleXlsxData(xlsxData)
  }
  saleSlipDataSource.value.addSaleOrder(params).then(res => {
    if (res.code === 200){
      ElMessage.success('导入成功')
      saleSlipDataSource.value.initData()
    } else ElMessageBox.alert(res, '警告', {
      type: 'error'
    })
  })
}

const handleXlsxData = (pendingData) => {
  let dataTool = new proxy.$DataTool()
  let signShop = ''
  let tempArray = []
  let tempObject = {}
  let materialTempArray = []
  let materialTempObject = {}
  let result = []
  try {
    pendingData.forEach((data, i) => {
      if (i === 0) signShop = data['商家名称']
      else if (data['商家名称'] !== signShop){
        throw new Error('导入数据商家必须唯一')
      }

      // 中文 key 转换英文 key
      let tempFather = {
        receiptAddress: data['收件地址'],
        requireDeliveryDate: typeof data['配送日期'] === 'string' ? Date.parse(data['配送日期'] + " 23:59:59") : null,
        merchantName: data['商家名称'],
        oldOrderCode: data['订单号'],
        saleOrderCode: data['订单号'],
        warehouseName: data['仓库'],
        customerName: data['收件人'],
        customerPhone: data['收件人电话'].toString(),
        branchName: data['网点名称'],
        comment: data['备注'],
        orderMaker: data['抛单员'],
        salesman: data['业务员'],
        saleOrderDetailList: []
      }
      // 解析地址
      let addressParseResult = dataTool.addressParse(tempFather.receiptAddress)
      tempFather.province = addressParseResult.province ? addressParseResult.province : ''
      tempFather.city = addressParseResult.city ? addressParseResult.city : ''
      tempFather.area = addressParseResult.area ? addressParseResult.area : ''
      tempFather.street = addressParseResult.details ? addressParseResult.details : ''

      // 根据销售单号聚合 如果销售单号存在不处理
      if (!tempArray.includes(tempFather.oldOrderCode)){
        result.push(tempFather)

        // 推入临时数组 表示这个销售单号已经存在
        tempArray.push(tempFather.oldOrderCode)

        // 保存当前销售单号的索引
        tempObject[tempFather.oldOrderCode] = tempArray.length - 1
      }

      // 创建商品对象
      let tempSon = {
        materialCode: data['套机码'],
        materialName: data['商品名称'],
        materialSpecification: data['规格型号'],
        deliveredNumber: data['数量']
      }

      // 获取已存在的销售单号的索引
      let idx = tempObject[tempFather.oldOrderCode]

      // 因为相同物料代码的商品数量要+1，所以用物料代码+销售单号的方式做key判断是否存在这个物料
      let jointKey = tempSon.materialCode + result[idx].oldOrderCode

      // 如果不存在这个物料 就加一个进去
      if (!materialTempArray.includes(jointKey)){
        result[idx].saleOrderDetailList.push(tempSon)

        // 推入临时数组 表示这个销售单号下面的这个物料代码已经存在
        materialTempArray.push(jointKey)

        // 保存当前销售单号下面的物料代码的索引
        materialTempObject[jointKey] = result[idx].saleOrderDetailList.length - 1
      } else {
      // 如果存在这个物料，找到这个物料所在的索引
        let materialIdx = materialTempObject[jointKey]

        // 对应索引物料数量+1
        result[idx].saleOrderDetailList[materialIdx].deliveredNumber += 1
      }
    })
  } catch (err){
    ElMessageBox.alert(err, '警告', {
      type: 'error'
    })
    return false
  }
  return result
}

const goAdd = () => {
  const userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
  if (+userInfo.jobId !== 34) {
    ElMessage.error('只有商家账号可以创建销售订单')
    return
  }
  router.push({
    path: '/sale/slip/newFile'
  })
}

const goCompile = ({ id, saleOrderCode }) => {
  // const userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
  // if (+userInfo.jobId !== 34) {
  //   ElMessage.error('只有商家账号可以编辑销售订单')
  //   return
  // }
  router.push({
    path: '/sale/slip/newFile',
    query: { id, saleOrderCode }
  })
}

const exportExcel = () => {
  if (saleSlipDataSource.value.selections.length < 1) {
    ElMessage.error('请先选择数据')
  } else {
    let list = saleSlipDataSource.value.selections.map(item => item.saleOrderCode)
    let params = list
    let enHeader = [
      "createTime",
      "updateTime",
      'saleOrderCode',
      'customerName',
      'customerPhone',
      'receiptAddress',
      'requireDeliveryDate',
      'merchantName',
      'province',
      'city',
      'area',
      'street',
      'comment',
      'serviceProcessDescription',
      'materialCode',
      'materialSpecification',
      'deliveredNumber',
      'warehouseName'
    ]
    let znHeader = {
      createTime: '制单时间',
      updateTime: '最后修改时间',
      saleOrderCode: '销售单号',
      customerName: "客户姓名",
      customerPhone: '客户电话',
      receiptAddress: '收货地址',
      requireDeliveryDate: '要求配送日期',
      merchantName: '商家名称',
      province: '省',
      city: '市',
      area: '区',
      street: '街道',
      comment: '备注',
      serviceProcessDescription: '服务过程描述',
      materialCode: '物料代码',
      materialSpecification: '规格型号',
      deliveredNumber: '数量',
      warehouseName: '发货仓'
    }
    saleSlipDataSource.value.outSaleOrderMainAndDetail(params).then(async res => {
      if (res.code === 200) {
        if (!dataTool) dataTool = new proxy.$DataTool()
        let exportData = []
        res.data.forEach(item => {
          let { createTime,
            updateTime, saleOrderCode, customerName,
            customerPhone,
            receiptAddress,
            requireDeliveryDate,
            merchantName,
            province,
            city,
            area,
            street,
            comment,
            serviceProcessDescription,
            warehouseName } = item
          createTime = dataTool.timeStamp2Time(createTime, 'yyyy-MM-dd hh:mm:ss')
          updateTime = dataTool.timeStamp2Time(updateTime, 'yyyy-MM-dd hh:mm:ss')
          requireDeliveryDate = dataTool.timeStamp2Time(requireDeliveryDate)
          item.saleOrderDetailList.forEach(mat => {
            let temp = { createTime,
              updateTime, saleOrderCode, customerName,
              customerPhone,
              receiptAddress,
              requireDeliveryDate,
              merchantName,
              province,
              city,
              area,
              street,
              comment,
              serviceProcessDescription,
              warehouseName }
            let { materialCode,
              materialSpecification,
              deliveredNumber } = mat
            temp.materialCode = materialCode
            temp.materialSpecification = materialSpecification
            temp.deliveredNumber = deliveredNumber
            exportData.push(temp)
          })
        })
        dataTool.exportExcel(znHeader, enHeader, exportData, '销售订单')
      }
    })
  }
}

const customizeEndHandle = (rowData) => {
  return [h('div', { class: 'table-handel-div' }, [h(
    ElButton,
    { onClick: () => { goCompile(rowData) }, type: "primary", icon: "Edit", text: true, style: 'padding:0;margin:0;background:transparent' },
    { default: () => "编辑" }
  ), h(
    ElButton,
    { onClick: () => { deleteRecord(rowData) }, type: "danger", icon: "Delete", text: true, style: 'padding:0;margin:0;background:transparent' },
    { default: () => "删除" }
  ),, h(
      ElButton,
      { onClick: () => { checkLocus(rowData) }, icon: "Van", text: true, style: 'padding:0;margin:0;background:transparent;color:#22a63c' },
      { default: () => "物流轨迹" }
    )])]
}
const isShowCheckLocus = ref(false)
const locusData = ref({})
const isCheckingSaleOrderCode = ref('')
const checkLocus = async ({ saleOrderCode }) => {
  isCheckingSaleOrderCode.value = saleOrderCode
  const ctx = await saleSlipDataSource.value.listBySaleCodeOrBranchOrderCode(saleOrderCode)
  if (!ctx.data){
    ElMessage.warning('这个销售订单还没有轨迹数据,请耐心等待仓库揽收,谢谢')
    return
  }
  locusData.value = ctx.data
  isShowCheckLocus.value = true
}

const goPrint = () => {
  if (saleSlipDataSource.value.selections.length < 1) {
    ElMessage.error('请先选择数据')
    return
  }
  let list = { idList: [], saleCodeList: [], printSaleSlipNumList: [] }
  list.saleCodeList = saleSlipDataSource.value.selections.map(item => item.saleOrderCode)
  list.idList = saleSlipDataSource.value.selections.map(item => item.id)
  list.printSaleSlipNumList = saleSlipDataSource.value.selections.map(item => item.numberOfPrints)
  sessionStorage.setItem('printSaleData', JSON.stringify(list))
  const routerUrl = router.resolve('/print/saleslip')
  window.open(routerUrl.href, '_blank')
}

const downloadTemplate = () => {
  window.location = 'https://jxwlapp.oss-cn-guangzhou.aliyuncs.com/excelTemplate/销售订单导入模板.xls?download'
}

const flowMaterial = (command) => {
  if (saleSlipDataSource.value.selections.length === 0) {
    proxy.$message.error('请选择数据')
    return
  }
  flowDetail.successOrder = []
  flowDetail.failOrder = []
  flowDetail.allLength = saleSlipDataSource.value .selections.length
  ElMessageBox.alert(`确认数据无误并留料？`, '提示', {
    type: 'warning',
    showCancelButton: true,
    cancelButtonText: '再想想',
    callback: async (action) => {
      if (action === 'cancel') return
      isShowLoading.value = true
      let timeout = setInterval(() => {
        let temp = Math.floor(Math.random() * 10)
        if (percentage.value + temp >= 100) {
          clearInterval(timeout)
          return
        } else percentage.value += temp
      }, 1000 * saleSlipDataSource.value.selections.length)
      if (command === 'stop'){
        let params = saleSlipDataSource.value.selections.map(item => item.saleOrderCode)
        let data = await saleSlipDataSource.value.nextStatus(params)
        percentage.value = 100
        if (data === 200) proxy.$alert('留料成功')
        else {
          proxy.$alert(data)
          percentage.value = 0
        }
        clearInterval(timeout)
        isShowLoading.value = false
      }
      else {
        for (let i = 0; i < saleSlipDataSource.value.selections.length; i++){
          let params = [saleSlipDataSource.value.selections[i].saleOrderCode]
          let data = await saleSlipDataSource.value.nextStatus(params)
          if (data === 200){
            flowDetail.successOrder.push(saleSlipDataSource.value.selections[i].saleOrderCode)
          } else {
            flowDetail.failOrder.push({ order: saleSlipDataSource.value.selections[i].saleOrderCode, message: data })
          }
        }
        percentage.value = 100
      }
      initData()
    }
  })
}
const closeLoading = () => {
  isShowLoading.value = false
  percentage.value = 0
}

const expandFilterItems = reactive([])
</script>

<style lang="less" scoped>
.main {
  .table{
    padding: 10px;
    background-color: #ffffff;
  }
}
.content{
  flex-direction: column;
}
</style>