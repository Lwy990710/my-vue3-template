<template>
  <div v-if="isShow">
    <el-dialog
      v-model="showDialog"
      :title="title"
      :close-on-click-modal="false"
      :show-close="false"
      :width="width"
      lock-scroll
    >
      <template #header="{ titleId, titleClass }">
        <div class="jx-dialog-header">
          <h4 :id="titleId" :class="titleClass">
            {{ title }}
          </h4>
          <el-button
            class="dialog-close-btn"
            type="danger" icon="CloseBold"
            circle
            @click="closeDialog"
          />
        </div>
      </template>
      <div>
        <el-form
          ref="ruleFormRef"
          :model="myformData"
          label-width="120px"
          class="flex-wrap"
          status-icon
        >
          <el-form-item
            v-for="item in formEl"
            :key="item.prop"
            :label="item.label"
            :rules="item.rules"
            :prop="item.prop"
            class="mr10"
          >
            <el-input
              v-if="item.element === 'input'"
              v-model="myformData[item.prop]"
              :type="item.type" style="width:220px"
              :disabled="item.type === 'dialog'||item.disabled"
              class="mr10"
            >
              <template v-if="item.type === 'dialog'" #append>
                <el-button @click="emitOpenDialog(item.prop)">
                  <el-icon><Edit /></el-icon>
                </el-button>
              </template>
            </el-input>
            <el-select
              v-if="item.element === 'select'"
              v-model="myformData[item.prop]"
              :disabled="item.disabled"
              :placeholder="`请选择${item.label}`"
              :multiple="item.type==='multiple'"
              collapse-tags
              collapse-tags-tooltip
            >
              <el-option
                v-for="option in item.options"
                :key="option.label"
                :label="option.label"
                :value="option.value"
              >
                {{ option.label }}
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <div class="mt10">
        <el-button
          type="primary" style="float:right;margin-right:10px"
          @click="submitForm"
        >
          确定
        </el-button>
        <el-button
          type="danger" style="float:right;margin-right:10px"
          @click="closeDialog"
        >
          取消
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { onBeforeMount, reactive, ref, getCurrentInstance, watch, computed } from 'vue'
const { proxy } = getCurrentInstance()
const _props = defineProps({
  // 是否展示选择框
  isShow: {
    type: Boolean,
    default: false
  },

  // 弹框标题
  title: {
    type: String,
    default: ''
  },

  // 弹框宽度
  width: {
    type: String,
    default: '40%'
  },

  // 表单
  formEl: {
    type: Object,
    default: () => { return {} }
  },

  formData: {
    type: Object,
    default: () => { return {} }
  }
})

watch(() => _props.isShow, () => {
  if (_props.isShow && Object.values(_props.formData).length !== 0){
    Object.assign(myformData.value, _props.formData)
  }
})

let myformData = ref({})
const _emits = defineEmits(['closeDialog', 'inputDone', 'emitOpenDialog'])
const closeDialog = () => {
  myformData.value = {}
  _emits('closeDialog')
}// 关闭弹窗事件

const showDialog = computed({
  get(){
    return _props.isShow
  },
  set(){
    //null
  }
}) // 开启弹窗事件

const emitOpenDialog = (prop) => _emits('emitOpenDialog', prop) // 输入框按钮弹窗

const submitForm = async () => {
  await proxy.$refs.ruleFormRef.validate((valid, fields) => {
    if (valid) {
      _emits('inputDone', JSON.parse(JSON.stringify(myformData.value)))
      myformData.value = {}
      proxy.$refs.ruleFormRef.resetFields()
    } else {
      console.log('error submit!', fields)
    }
  })
}

const updateDialogInput = (propObj) => {
  Object.keys(propObj).forEach(key => {
    myformData.value[key] = propObj[key]
  })
}

defineExpose({
  updateDialogInput
})

/**
 * @param {{ HTML调用实例 }}
 *
 */
//   <selectDialogForm
//     ref="dialogForm"
//     :is-show="isShow"
//     :title="'测试弹框'"
//     :form-el="formEl"
//     @close-dialog="isShow=false"
//     @emitOpenDialog="emitOpenDialog"
//     @inputDone="inputDone"
//   >
/**
 * @param {{ JS 调用实例 }}
 *
 */
// let isShow = ref(false)
// const formEl = reactive([{
//   label: '测试',
//   element: 'input',
//   type: 'text',
//   prop: 'test1',
//   rules: [{
//     required: true,
//     message: '不能为空',
//     trigger: 'blur'
//   }]
// }, {
//   label: '测试',
//   element: 'input',
//   type: 'dialog',
//   prop: 'test2',
//   rules: [{
//     required: true,
//     message: '不能为空',
//     trigger: 'blur'
//   }]
// }])

// const emitOpenDialog = (val) => {
//   let prop = {
//     test2: 9999,
//     test3: 8888
//   }
//   proxy.$refs.dialogForm.updateDialogInput(prop)
// }

// const inputDone = (doneRes) => {
//   console.log(doneRes)
//   isShow = false
// }
</script>

<style lang="less" scoped>
:deep(.el-input__wrapper){
  width:200px;
}
:deep(.el-form-item__label){
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>