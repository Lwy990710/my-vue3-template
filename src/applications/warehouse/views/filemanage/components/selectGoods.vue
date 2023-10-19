<template>
  <div>
    <selectDialogTable
      ref="dialogtable"
      :width="'60%'"
      :search-input-placeholder="'输入物料代码搜索'"
      :is-show="showDialog"
      :data-source="goodDataSource"
      :title="'选择物料'"
      :is-show-search-input="false"
      :search-value-key="'test'"
      :loading="goodLoading"
      @close-dialog="closeDialog"
      @chooseRow="inputDone"
    >
      <template #customOperation>
        <div>
          <el-input
            v-model="searchDataGood.materialCode"
            clearable
            placeholder="输入物料代码搜索"
            style="width:180px;margin-left:20px"
            size="small"
          >
            <template #append>
              <el-button icon="Search" @click="doDialogSearch" />
            </template>
          </el-input>
          <el-input
            v-model="searchDataGood.materialSpecification"
            clearable
            placeholder="输入商品型号搜索"
            size="small"
            style="width:180px;margin-left:20px"
          >
            <template #append>
              <el-button icon="Search" @click="doDialogSearch" />
            </template>
          </el-input>
        </div>
      </template>
    </selectDialogTable>
  </div>
</template>

<script setup>
import { GoodDataSource, loading as goodLoading } from '@/applications/warehouse/utils/good/index'
import selectDialogTable from '@/components/common/selectDialogTable.vue'
import { onBeforeMount, reactive, ref, watch, getCurrentInstance, computed } from 'vue'
const { proxy } = getCurrentInstance()
const goodDataSource = ref(null)
const _props = defineProps({
  // 是否展示选择框
  isShow: {
    type: Boolean,
    default: false
  }
})

const _emits = defineEmits(['closeDialog', 'inputDone'])

const closeDialog = () => _emits('closeDialog') // 关闭弹窗事件
const inputDone = (val) => _emits('inputDone', val)

// 关闭弹窗事件

onBeforeMount(() => {
  if (!goodDataSource.value) goodDataSource.value = new GoodDataSource({
    selectUri: '/material/select',
    pageSize: 10, // 页大小
    tableHeader: [{
      label: "产品名称",
      prop: "materialName",
      width: 150
    }, {
      label: "套机码",
      prop: "materialCode",
      width: 150
    }, {
      label: "规格型号",
      prop: "materialSpecification",
      width: 180
    }, {
      label: "物料类型",
      prop: "materialType",
      width: 180
    }]
  })
})

let searchDataGood = reactive({
  materialCode: '',
  materialSpecification: ''
})

watch(() => _props.isShow, () => {
  if (_props.isShow) {
    goodDataSource.value.searchData = {}
  } else {
    searchDataGood.materialCode = ''
    searchDataGood.materialSpecification = ''
  }
})

const showDialog = computed({
  get(){
    return _props.isShow
  },
  set(){
    //null
  }
}) // 开启弹窗事件

const doDialogSearch = (val) => {
  if (searchDataGood.materialCode.length === 0 && searchDataGood.materialSpecification.length === 0){
    proxy.$refs.dialogtable.dialogSearch({})
  } else if (searchDataGood.materialCode.length !== 0 && searchDataGood.materialSpecification.length !== 0){
    proxy.$refs.dialogtable.dialogSearch({ materialCode: searchDataGood.materialCode.trim(), materialSpecification: searchDataGood.materialSpecification.trim() })
  } else if (searchDataGood.materialCode.length !== 0){
    proxy.$refs.dialogtable.dialogSearch({ materialCode: searchDataGood.materialCode.trim() })
  } else proxy.$refs.dialogtable.dialogSearch({ materialSpecification: searchDataGood.materialSpecification.trim() })
}
</script>

<style scoped lang="less">
:deep(.el-dialog__title){
  display: flex;
  justify-self: center;
  align-items: center;
}
</style>