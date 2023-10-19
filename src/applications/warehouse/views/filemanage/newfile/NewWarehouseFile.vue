<template>
  <div class="main">
    <div class="message_area">
      <goBack :back-config="backConfig" />
      <div v-loading="shopLoading" class="form_area">
        <div class="form_title">
          {{ route.query.id ? warehouseFormData.title.replace('新增', '编辑') : warehouseFormData.title }}
        </div>
        <NewFileForm
          ref="formRef"
          :elements="warehouseFormData.elements" :disabled="disabled"
          :model="formData"
        />
      </div>
      <el-divider
        border-style="dashed"
      />
      <div v-if="route.query.warehouseCode" class="table_area">
        <div class="position_table">
          <div class="table-title">
            仓位信息
          </div>
          <SimpleTable
            ref="table"
            :loading="loading"
            :current-page="wareHousePositionDataSource.currentPage"
            :total="wareHousePositionDataSource.total"
            :page-size="wareHousePositionDataSource.pageSize"
            :table-header="wareHousePositionDataSource.tableHeader"
            :table-data="wareHousePositionDataSource.tableData"
            :show-tips="false" :need-end-control="true"
            @current-change="wareHousePositionDataSource.currentPageChange($event,wareHousePositionDataSource)"
          >
            <template #extraHandle>
              <div class="extraHandle">
                <el-button
                  class="ml10"
                  type="danger"
                  @click="addFile"
                >
                  新增
                </el-button>
              </div>
            </template>
            <template #endOption="params">
              <el-button
                text
                type="primary"
                class="row-options-btn"
                @click="goCompile(params.row.id)"
              >
                编辑
              </el-button>
              <el-popconfirm
                title="是否确定删除这条数据"
                confirm-button-text="确定"
                cancel-button-text="再想想"
                @confirm="deleteRecord(params.row.warehousePositionCode)"
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
            </template>
          </SimpleTable>
        </div>
      </div>
      <div class="handle_area">
        <el-button
          v-authority="'MENU_WAREHOUSE_ARCHIVE_WRITE'"
          type="primary" style="margin-right:30px"
          :loading="loading" @click="save"
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
import SimpleTable from '@/components/SimpleTable.vue'
import { WareHousePositionDataSource } from '@/applications/warehouse/utils/warehouse/index'
import NewFileForm from '@/components/NewFileForm.vue'
import { reactive, ref, onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { WareHouseDataSource, loading } from '@/applications/warehouse/utils/warehouse'
onBeforeMount(() => {
  if (route.query.id) {
    getWarehouseData()
  }
})
let wareHousePositionDataSource = ref(null)
let warehouseDataSource = ref(null)
let shopLoading = ref(loading)
let backConfig = reactive([{ title: '档案管理', path: '' }, { title: '仓库档案', path: '' }, { title: '新增仓库档案', path: '' }])
let router = useRouter()
let route = useRoute()
let disabled = ref(false)
let warehouseFormData = {
  title: '新增仓库',
  elements: [
    {
      label: '仓库名称',
      prop: 'warehouseName',
      rules: [{
        required: true,
        message: '仓库名称不能为空',
        trigger: 'blur'
      }]
    }, {
      label: '仓库类型',
      prop: 'warehouseType',
      element: 'select',
      options: [{
        label: '商家仓',
        value: 'MERCHANT'
      }, {
        label: '中转仓',
        value: 'TRANSFER'
      }, {
        label: '前置仓',
        value: 'PRE'
      }, {
        label: '大仓',
        value: 'BIG_WAREHOUSE'
      }],
      rules: [{
        required: true,
        message: '仓库类型不能为空',
        trigger: 'blur'
      }]
    }, {
      label: '仓库地址',
      prop: 'warehouseAddress',
      rules: [{
        required: true,
        message: '仓库地址不能为空',
        trigger: 'blur'
      }]
    }, {
      label: '仓库负责人',
      prop: 'warehouseKeeper',
      rules: [{
        required: true,
        message: '仓库负责人不能为空',
        trigger: 'blur'
      }]
    }, {
      label: '仓库联系人电话',
      prop: 'linkmanPhone',
      rules: [{
        required: true,
        message: '仓库联系人电话不能为空',
        trigger: 'blur'
      }]
    }, {
      label: '备注',
      prop: 'comment'
    }
  ]
}
let formData = reactive({
  warehouseName: '',
  warehouseType: '',
  warehouseAddress: '',
  warehouseKeeper: '',
  linkmanPhone: '',
  comment: ''
})
let formRef = ref(null)

onBeforeMount(() => {
  if (!warehouseDataSource.value) {
    warehouseDataSource.value = new WareHouseDataSource({
      selectOneUri: '/warehouse/selectOne'
    })
  }
  if (!wareHousePositionDataSource.value) {
    wareHousePositionDataSource.value = new WareHousePositionDataSource({
      selectUri: '/warehouse/listAllPosition',
      deleteUri: '/warehousePosition/delete',
      tableHeader: [
        {
          label: '仓位编码',
          prop: 'warehousePositionCode'
        }, {
          label: '仓位名',
          prop: 'positionsName'
        }, {
          label: '容量',
          prop: 'capacity'
        }, {
          label: '位置信息',
          prop: 'location'
        }, {
          label: '备注',
          prop: 'comment'
        }
      ]
    })
  }
  if (route.query.id) {
    getWarehouseData()
    getWarehousePositionData()
  }
})

const save = async () => {
  await formRef.value.ruleFormRef.validate((valid, fields) => {
    if (valid) {
      postWarehouseData()
    } else {
      console.log('error submit!', fields)
    }
  })
}

const getWarehouseData = () => {
  if (warehouseDataSource.value) {
    warehouseDataSource.value.selectOne(route.query.id).then(res => {
      Object.keys(res).forEach(key => {
        formData[key] = res[key]
      })
    })
  }
}

const addFile = () => {
  router.push({
    path: '/file/new/position',
    query: { warehouseCode: route.query.warehouseCode }
  })
}

const goCompile = (id) => {
  router.push({
    path: '/file/new/position',
    query: { id }
  })
}

const deleteRecord = (code) => {
  let params = []
  params.push(code)
  wareHousePositionDataSource.value.delete(params).then(res => {
    if (res === 200) {
      ElMessage.success('删除成功')
    }
  })
}

const getWarehousePositionData = () => {
  if (wareHousePositionDataSource.value) {
    wareHousePositionDataSource.value.searchData = { warehouseCode: route.query.warehouseCode }
    wareHousePositionDataSource.value.initData()
  }
}

const postWarehouseData = async () => {
  let params = { list: [] }
  params.list.push(formData)
  warehouseDataSource.value.addOrUpdateWarehouse(params).then(res => {
    console.log(res)
    if (res.data.code === 200) {
      ElMessage({
        message: '保存成功',
        type: 'success'
      })
      setTimeout(() => {
        router.go(-1)
      }, 1000)
    } else {ElMessage.error(res.data.message)}
  })
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

}
</style>