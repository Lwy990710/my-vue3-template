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
      <div class="handle_area">
        <el-button
          type="primary" style="margin-right:30px"
          :loading="loading" @click="save"
        >
          保存
        </el-button>
        <el-button type="danger" @click="cancel">
          取消
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import goBack from '@/components/common/goBack.vue'
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
let backConfig = reactive([{ title: '档案管理', path: '' }, { title: '商家档案', path: '' }, { title: '新增商家档案', path: '' }])
let router = useRouter()
let route = useRoute()
let disabled = ref(false)
let warehouseFormData = {
  title: '新增仓库',
  elements: [
    {
      label: '仓位名称',
      prop: 'positionsName',
      rules: [{
        required: true,
        message: '仓位名称不能为空',
        trigger: 'blur'
      }]
    }, {
      label: '容量',
      prop: 'capacity',
      rules: [{
        required: true,
        message: '仓库名称不能为空',
        trigger: 'blur'
      }]
    }, {
      label: '仓库名称',
      prop: 'warehouseName',
      rules: [{
        required: true,
        message: '仓库名称不能为空',
        trigger: 'blur'
      }]
    }, {
      label: '位置信息',
      prop: 'location'
    }, {
      label: '备注',
      prop: 'comment'
    }
  ]
}
let formData = reactive({
  positionsName: '',
  capacity: '',
  location: '',
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
      selectUri: '/warehouse/listAllPosition'
    })
  }
  if (route.query.id) {
    getWarehouseData()
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