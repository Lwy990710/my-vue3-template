<template>
  <div class="main">
    <div class="data-filter">
      <data-filter
        ref="filter"
        :filter-items="goodsDataSource.tableHeader"
        @search="goodsDataSource.search($event,goodsDataSource,proxy.$refs.table)"
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
          style="color: #666"
          plain @click="exportExcel"
        >
          批量导出
        </el-button>
        <el-popconfirm
          :title="`是否确定删除 ${goodsDataSource.selections.length} 条数据`"
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
    </div>
    <v-table
      ref="table"
      need-end-handle
      need-check-box
      :end-handle-width="250"
      :default-end-handle="false"
      :customize-end-handle="customizeEndHandle"
      :total="goodsDataSource.total"
      :current-page="goodsDataSource.currentPage"
      :page-size="goodsDataSource.pageSize"
      :table-data="goodsDataSource.tableData"
      :columns="goodsDataSource.tableHeader"
      :loading="loading"
      @selectionChange="goodsDataSource.selectionChange($event,goodsDataSource,proxy.$refs.table)"
      @refresh="goodsDataSource.initData(goodsDataSource, proxy.$refs.table)"
      @editRow="goCompile"
      @deleteRow="deleteRecord"
      @current-change="goodsDataSource.currentPageChange($event,goodsDataSource,proxy.$refs.table)"
      @sizeChange="goodsDataSource.pageSizeChange($event,goodsDataSource,proxy.$refs.table)"
      @editTableHeader="isShowEditTableHeader = true"
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
            :is-show-edit-table-header="isShowEditTableHeader" :modules="'goodsFile'"
            @updateCompleted="updateHeaderCompleted"
          />
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import dataFilter from '@/components/common/dataFilter.vue'
import VTable from '@/components/public/virtualTable.vue'
import dynamicHeader from '@/components/common/dynamicHeader.vue'
import { loading, addMaterExcel, updateBarcodeHeader, GoodDataSource } from '@/applications/warehouse/utils/good/index'
import { changeTime, getTime } from '@/applications/warehouse/public/jxRequest/index'
import { useRouter, useRoute } from 'vue-router'
import { ref, onBeforeMount, getCurrentInstance, h, watch } from 'vue'
import * as XLSX from "xlsx"
import { ElMessage, ElMessageBox, ElButton } from 'element-plus'
const { proxy } = getCurrentInstance()
const permissionsArr = JSON.parse(sessionStorage.getItem('userPermissions'))
let router = useRouter()
let goodsDataSource = ref(null)
const isShowEditTableHeader = ref(false)

const updateHeaderCompleted = () => {
  isShowEditTableHeader.value = false
  goodsDataSource.value.initTableHeader()
}
let route = useRoute()
watch(() => route.path, (newPath, oldPath) => {
  if (newPath === '/file/goods') {
    if (!goodsDataSource.value) goodsDataSource.value = new GoodDataSource({
      modules: 'goodsFile',
      selectUri: '/material/select',
      deleteUri: '/material/delete',
      selectOneUri: '/'
    })
    goodsDataSource.value.initData(this)
  }
})

onBeforeMount(() => {
  if (!goodsDataSource.value) goodsDataSource.value = new GoodDataSource({
    modules: 'goodsFile',
    selectUri: '/material/select',
    deleteUri: '/material/delete',
    selectOneUri: '/'
  })
  goodsDataSource.value.initTableHeader()
  goodsDataSource.value.initData()
})

const addFile = () => {
  if (!checkPermissions()) return
  router.push({
    path: '/file/new/good'
  })
}

const goCompile = ({ id, materialType, materialCode }) => {
  router.push({
    path: '/file/new/good',
    query: { id, materialType, materialCode }
  })
}
const uploadExcel = (data) => {
  if (!checkPermissions()) return
  const header = {
    materialName: '产品类型',
    materialCodeSet: '套机代码',
    materialSpecificationSet: '规格型号',
    materialCode: '单机代码',
    materialSpecification: '单机型号',
    partNumber: '净数量',
    materialType: '物料类型',
    length: '长',
    height: '高',
    volume: '体积',
    weight: '重量',
    width: '宽',
    sort: '分类',
    barCodeHead: '条码头'
  }
  let excelData = []
  console.log(data)
  data.map(item => {
    if (String(item['单机代码']).trim().length >= 1) {
      let temp = {
        materialName: item['产品类型'],
        materialCodeSet: item['套机代码'] + "",
        materialSpecificationSet: item['规格型号'],
        materialCode: item['单机代码'] + "",
        materialSpecification: item['单机型号'],
        partNumber: item['净数量'],
        materialType: item['物料类型'],
        length: item['长'],
        height: item['高'],
        volume: item['体积'],
        weight: item['重量'],
        width: item['宽'],
        sort: item['分类'],
        barCodeHead: item['条码头']
      }
      excelData.push(temp)
    }
  })
  let params = {
    list: excelData
  }
  console.log(params, 'parmas')
  addMaterExcel(params).then(res => {
    if (res === 200) {
      ElMessage.success('导入成功')
      goodsDataSource.value.initData()
    } else {
      ElMessage.error(res)
    }
  })
}

const downloadTemplate = () => {
  window.location = 'https://jxwlapp.oss-cn-guangzhou.aliyuncs.com/excelTemplate/商品导入模板.xlsx?download'
}

const command = (rowData) => {
  ElMessageBox.prompt('', '修改条码头', {
    confirmButtonText: '保存',
    cancelButtonText: '取消',
    center: true
  })
    .then(({ value }) => {
      let params = {
        materialCode: rowData.materialCode,
        barCodeHead: value || ''
      }
      updateBarcodeHeader(params).then(res => {
        if (res === 200) {
          ElMessage.success('修改成功')
        } else {
          ElMessage.error(res)
        }
      })
    })
}

const deleteRecord = ({ id }) => {
  if (!checkPermissions()) return
  let idList = [id]
  ElMessageBox.alert('是否确认删除这条数据', '提示', {
    type: 'error',
    showCancelButton: true,
    cancelButtonText: '再想想',
    confirmButtonText: '确认删除',
    confirmButtonClass: 'delete-confirm-btn',
    callback: (action) => {
      if (action === 'cancel') return
      else {
        goodsDataSource.value.delete(idList, proxy.$refs.table).then(res => {
          ElMessage({
            message: `已成功删除${idList.length}条数据`,
            type: 'success'
          })
        })
      }
    }
  })
}

const deleteRecords = async () => {
  if (goodsDataSource.value.selections.length < 1) {
    ElMessage.error('请先选择数据')
    return
  }
  if (!checkPermissions()) return
  let idList = []
  goodsDataSource.value.selections.forEach(item => {
    idList.push(item["id"])
  })
  goodsDataSource.value.delete(idList, proxy.$refs.table).then(res => {
    if (res === 200) {
      ElMessage({
        message: `已成功删除${idList.length}条数据`,
        type: 'success'
      })
    }
  })
}

let exportExcel = () => {
  if (goodsDataSource.value.selections.length < 1) {
    ElMessage.error({
      message: '请先选择导出的数据'
    })
  } else {
    const header = [
      "materialName", "materialCode", "materialSpecification", "materialType", "barCodeHead", "weight", "volume", "comment", "updateUser", "updateTime", "createTime", "createUser"
    ]
    const headerZn = { materialName: '产品名称', materialCode: '物料代码', materialSpecification: '规格型号', materialType: '类型', barCodeHead: '条码头', weight: '重量', volume: '体积', comment: '备注', createTime: '创建时间', createUser: '创建人', updateUser: '更新人', updateTime: '更新时间' }
    goodsDataSource.value.selections.map(item => {
      item["createTime"] = changeTime(item["createTime"])
      item["updateTime"] = changeTime(item["updateTime"])
    })
    const newSelections = [headerZn, ...goodsDataSource.value.selections]

    // 将json数据变为sheet数据
    let sheet = XLSX.utils.json_to_sheet(newSelections, { header, skipHeader: true }),

      // 新建表格
      book = XLSX.utils.book_new()

    // 在表格中插入一个sheet
    XLSX.utils.book_append_sheet(book, sheet, "sheet1")

    let now = getTime()

    // 通过xlsx的writeFile方法将文件写入
    XLSX.writeFile(book, `商品信息${now}.xls`)
  }

}

let beforeUpload = async (file) => {
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
  if (permissionsArr.includes('MENU_MERCHANT_ARCHIVE_WRITE')) {
    return true
  } else {
    ElMessage.error('该账号没有维护商品的权限')
    return false
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
      { onClick: () => { command(rowData) }, type: "info", icon: "EditPen", text: true, style: 'padding:0;margin:0;background:transparent' },
      { default: () => "修改条码头" }
    )])]
}
</script>

<style lang="less" scoped>
.main {
  width: 100%;
  .table {
    padding: 10px;
    background-color: #ffffff;
  }
}
</style>