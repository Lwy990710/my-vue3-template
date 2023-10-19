<template>
  <div class="main">
    <div class="message_area">
      <goBack :back-config="backConfig" />
      <div class="form_area">
        <el-steps
          class="steps"
          :active="active"
          align-center
          finish-status="success"
        >
          <el-step title="等待取件" />
          <el-step title="入库中" />
          <el-step title="归档" />
        </el-steps>
        <div class="form_title">
          {{ route.query.id ? formData.title.replace('新增', '编辑') + '   '+ route.query.saleOrderReturnCode: formData.title }}
        </div>
        <NewFileForm
          ref="formRef"
          :elements="formData.elements" :disabled="disabled"
          :model="model"
          @openDialog="openDialog"
        />
      </div>
      <el-divider
        border-style="dashed"
      />
      <div v-if="active<=1" class="handle_area">
        <el-button
          type="primary" style="margin-right:30px"
          :loading="false"
          @click="save"
        >
          保存
        </el-button>
        <el-button type="danger" @click="cancel">
          取消
        </el-button>
      </div>
    </div>
    <div class="saleOrder-table">
      <el-divider content-position="center">
        退货汇总表
      </el-divider>
      <div class="saleOrder-table-data">
        <SimpleTable
          ref="simpleTable"
          :max-height="500"
          :options-width="100"
          :loading="loading"
          :show-tips="false"
          :page-size="20"
          :current-page="saleReturnSlipDetailDataSource.currentPage"
          :for-mat-data="saleReturnSlipDetailDataSource.forMatData"
          :table-header="saleReturnSlipDetailDataSource.tableHeader"
          :table-data="saleReturnSlipDetailDataSource.tableData"
          :total="saleReturnSlipDetailDataSource.total"
          :need-end-control="false"
          need-index
          small
          @current-change="saleReturnSlipDetailDataSource.currentPageChange($event,saleReturnSlipDetailDataSource)"
        />
      </div>
    </div>
    <selectDialogTable
      ref="dialogtableWarehouse"
      :width="'50%'"
      :search-input-placeholder="'输入仓库名称搜索'"
      :is-show="selectWarehouse"
      :data-source="wareHouseDataSource"
      :title="'选择仓库'"
      :is-show-search-input="true"
      :loading="loading"
      @close-dialog="selectWarehouse=false"
      @doDialogSearch="doDialogSearchWarehouse"
      @chooseRow="chooseRowWarehouse"
    />
  </div>
</template>

<script setup>
import selectDialogTable from '@/components/common/selectDialogTable.vue'
import SimpleTable from '@/components/SimpleTable.vue'
import goBack from '@/components/common/goBack.vue'
import NewFileForm from '@/components/NewFileForm.vue'
import { onBeforeMount, reactive, ref, getCurrentInstance } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SaleReturnSlipDataSource, loading as loading, SaleReturnSlipDetailDataSource } from '@/applications/warehouse/utils/saleReturn/index'
let router = useRouter()
let route = useRoute()
let active = ref(0)
let backConfig = [{ title: '销售管理', path: '' }, { title: '销售退货单', path: '' }, { title: '编辑退货单', path: '' }]
let disabled = ref(false)
const { proxy } = getCurrentInstance()
let formData = {
  title: '销售退货单',
  elements: [
    {
      label: '销售单号',
      prop: 'saleOrderCode',
      disabled: true
    }, {
      label: '销售退货单号',
      prop: 'saleOrderReturnCode',
      disabled: true
    }, {
      label: '取件日期',
      prop: 'pickUpDate',
      disabled: true
    }, {
      label: '商家名称',
      prop: 'merchantName',
      disabled: true
    }, {
      label: '客户名称',
      prop: 'customerName',
      disabled: true
    }, {
      label: '客户电话',
      prop: 'customerPhone',
      disabled: true
    }, {
      label: '送货地址',
      prop: 'receiptAddress',
      type: 'textarea',
      disabled: true
    }, {
      label: '收货仓库',
      prop: 'warehouseName',
      element: 'dialog',
      disabled: true
    }, {
      label: '备注',
      prop: 'comment',
      type: 'textarea',
      disabled: true
    }
  ]
}
let model = reactive({})
let formRef = ref(null)
const saleReturnSlipDataSource = ref(null)
const saleReturnSlipDetailDataSource = ref(null)
const save = async () => {
  await formRef.value.ruleFormRef.validate((valid, fields) => {
    if (valid) {
      if (route.query.id) model.id = +route.query.id
      model.saleOrderReturnDetailList = saleReturnSlipDetailDataSource.value.tableData
      model.pickUpDate = Date.parse(model.pickUpDate + ' 00:00:00')
      let params = {
        list: [model]
      }
      saleReturnSlipDetailDataSource.value.updateBatch(params).then(res => {
        if (res.code === 200){
          proxy.$message.success('修改成功')
          initData()
        } else {
          proxy.$message.error(res)
        }
      })
    } else {
      console.log('error submit!', fields)
    }
  })
}
onBeforeMount(() => {
  initData()
})
const initData = async () => {
  saleReturnSlipDataSource.value = new SaleReturnSlipDataSource({
    selectOneUri: `/saleOrdersReturn/selectOne`
  })

  saleReturnSlipDetailDataSource.value = new SaleReturnSlipDetailDataSource({
    selectUri: `/saleOrderReturnDetail/select`,
    tableHeader: [
      {
        label: '退货单号',
        prop: 'saleOrderReturnCode',
        width: 150
      }, {
        label: '物料代码',
        prop: 'materialCode',
        width: 150
      }, {
        label: '产品名称',
        prop: 'materialName',
        width: 150
      }, {
        label: '物料代码',
        prop: 'materialCode',
        width: 150
      }, {
        label: '型号',
        prop: 'materialSpecification',
        width: 150
      }, {
        label: '物料品质',
        prop: 'materialStatus',
        width: 150
      }, {
        label: '取回数量',
        prop: 'pickUpNumber',
        width: 150
      }, {
        label: '退货数量',
        prop: 'returnNumber',
        width: 150
      }, {
        label: '创建时间',
        prop: 'createTime',
        width: 150
      }, {
        label: '更新时间',
        prop: 'updateTime',
        width: 150
      }
    ]
  })
  saleReturnSlipDetailDataSource.value.searchData = {
    saleOrderReturnCode: route.query.saleOrderReturnCode
  }
  if (route.query.id) {
    let ctx = await saleReturnSlipDataSource.value.selectOne(route.query.id)
    saleReturnSlipDetailDataSource.value.initData()
    Object.assign(model, ctx)
    model.pickUpDate = new proxy.$DataTool().timeStamp2Time(model.pickUpDate)
    active.value = ['SALE_ORDER_RETURN_PICK_UP', 'SALE_ORDER_RETURN_PUT', 'SALE_ORDER_RETURN_DOC'].indexOf(model.processStatus) + 1
    if (active.value > 1) disabled.value = true
  }
}
const cancel = () => {
  router.go(-1)
}

const selectWarehouse = ref(false)
const wareHouseDataSource = ref(null)
const openDialog = () => {
  if (!wareHouseDataSource.value) wareHouseDataSource.value = new SaleReturnSlipDetailDataSource({
    selectUri: '/warehouse/select',
    pageSize: 10,
    tableHeader: [{
      label: "仓库名称",
      prop: "warehouseName"
    }, {
      label: "仓库地址",
      prop: "warehouseAddress"
    }, {
      label: "仓库类型",
      prop: "warehouseType"
    }, {
      label: "仓库联系人",
      prop: "warehouseKeeper"
    }]
  })
  wareHouseDataSource.value.searchData = { warehouseType: 'PRE' }
  selectWarehouse.value = true
}
const doDialogSearchWarehouse = (val) => {
  if (val && val.length !== 0) proxy.$refs.dialogtableWarehouse.dialogSearch({ warehouseType: 'PRE', warehouseName: val.trim() })
  else proxy.$refs.dialogtableWarehouse.dialogSearch({ warehouseType: 'PRE' })
}

const chooseRowWarehouse = (val) => {
  model.warehouseCode = val.warehouseCode
  model.warehouseName = val.warehouseName
  selectWarehouse.value = false
}
</script>

<style lang="less" scoped>
.steps{

  display: flex;
  justify-content: center;
}
.saleOrder-table{
  border-radius: 10px;
  margin-top: 20px;
  padding-top: 2px;
  padding-bottom: 30px;
  width: 89%;
  background: #fff;
  &-data{
    width: 96%;
    margin:0 auto;
  }
}
:deep(.el-divider__text){
  font-size: 16px;
  font-weight: 800;
}
</style>