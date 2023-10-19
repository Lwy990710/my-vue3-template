<template>
  <div class="main">
    <div class="message_area">
      <goBack :back-config="backConfig" />
      <div v-loading="shopLoading" class="form_area">
        <div class="form_title">
          {{ route.query.id ? warehousePositionFormData.title.replace('新增', '编辑') : warehousePositionFormData.title }}
        </div>
        <NewFileForm
          ref="formRef"
          :elements="warehousePositionFormData.elements" :disabled="disabled"
          :model="formData"
        />
      </div>
      <el-divider
        border-style="dashed"
      />
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
import { WareHousePositionDataSource, loading } from '@/applications/warehouse/utils/warehouse/index'
import NewFileForm from '@/components/NewFileForm.vue'
import { reactive, ref, onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
let wareHousePositionDataSource = ref(null)
let shopLoading = ref(loading)
let backConfig = reactive([{ title: '档案管理', path: '' }, { title: '仓位档案', path: '' }, { title: '新增仓位档案', path: '' }])
let router = useRouter()
let route = useRoute()
let disabled = ref(false)
let warehousePositionFormData = {
  title: '新增仓位',
  elements: [{
    label: '仓位名',
    prop: 'positionsName',
    rules: [{
      required: true,
      message: '仓位名称不能为空',
      trigger: 'blur'
    }]
  }, {
    label: '容量',
    prop: 'capacity'
  }, {
    label: '位置信息',
    prop: 'location'
  }, {
    label: '备注',
    prop: 'comment'
  }]
}
let formData = reactive({
  positionsName: '',
  capacity: '',
  location: '',
  comment: ''
})
let formRef = ref(null)

onBeforeMount(() => {
  if (!wareHousePositionDataSource.value) {
    wareHousePositionDataSource.value = new WareHousePositionDataSource({
      selectOneUri: '/warehousePosition/selectOne'
    })
  }
  if (route.query.id) {
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

const getWarehousePositionData = () => {
  if (wareHousePositionDataSource.value) {
    wareHousePositionDataSource.value.selectOne(route.query.id).then(res => {
      console.log(res)
      Object.keys(res).forEach(key => {
        formData[key] = res[key]
      })
    })
  }
}

const postWarehouseData = async () => {
  if (!route.query.id) {
    formData['warehouseCode'] = route.query.warehouseCode
    wareHousePositionDataSource.value.addPosition(formData).then(res => {
      if (res.data.code === 200) {
        ElMessage.success('保存成功')
        setTimeout(() => {
          router.go(-1)
        }, 1000)
      }
    })
  } else {
    wareHousePositionDataSource.value.updatePosition(formData).then(res => {
      if (res.data.code === 200) {
        ElMessage.success('保存成功')
        setTimeout(() => {
          router.go(-1)
        }, 1000)
      }
    })
  }
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