<template>
  <div class="form_area">
    <el-form
      ref="ruleFormRef"
      :model="model"
      label-width="150px"
      status-icon
      scroll-to-error
      :inline="true"
      :disabled="disabled"
      style="width:86%;"
      class="form"
    >
      <el-form-item
        v-for="item in elements"
        :key="item.prop"
        :rules="item.rules"
        :prop="item.prop"
        :label="item.label+'：'"
        style="padding:4px 0;"
      >
        <el-input
          v-if="!item.element||item.element==='input'"
          v-model="formData[item.prop]"
          :type="item.type ? item.type : 'text' "
          :disabled="item.disabled"
          :placeholder="item.placeholder ? item.placeholder : `请输入${item.label}`"
          @blur="item.blur"
        />
        <el-select
          v-if="item.element === 'select'"
          v-model="formData[item.prop]"
          :disabled="item.disabled"
          :placeholder="item.placeholder ? item.placeholder : `请选择${item.label}`"
          :multiple="item.type==='multiple'"
          collapse-tags
          collapse-tags-tooltip
          @change="val => selectChange(val,item.prop)"
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
        <el-input
          v-if="item.element === 'dialog'" v-model="formData[item.prop]"
          :placeholder="item.placeholder ? item.placeholder : `请选择${item.label}`"
          :disabled="item.disabled"
        >
          <template #append>
            <el-button :disabled="item.dialogDisabled" @click="openDialog(item.prop)">
              <el-icon><Edit /></el-icon>
            </el-button>
          </template>
        </el-input>
        <el-cascader
          v-if="item.element === 'cascader'"
          v-model="formData[item.prop]"
          :options="item.options"
          :placeholder="item.placeholder ? item.placeholder : `请选择${item.label}`"
        />
        <el-upload
          v-if="item.element === 'upload'"
          ref="upload"
          v-model="formData[item.prop]"
          :file-list="filesList"
          :disabled="formData[item.prop].length !== 0"
          action="https://jxwlapp.oss-cn-guangzhou.aliyuncs.com"
          :data="client"
          :limit="1"
          :before-upload="item.beforeUpload"
          :on-success="item.onSuccess"
          :on-error="item.onError"
          :on-change="onUploadChange"
          accept=".png, .jpg, .jpeg"
          :show-file-list="false"
        >
          <div v-if="formData[item.prop].length === 0" class="upLoad-content">
            <el-icon style="font-size:30px">
              <Plus />
            </el-icon>
          </div>
          <template v-if="formData[item.prop].length !== 0" #default>
            <div class="image-content">
              <el-image
                style="width: 130px; height: 130px"
                :src="formData[item.prop]"
                :preview-src-list="[formData[item.prop]]"
                fit="cover"
              />
              <el-tooltip
                class="box-item"
                effect="dark"
                content="重新上传"
                placement="top-start"
              >
                <span id="deleteIcon" @click="handleDelete(item.prop)">
                  <el-icon style="color: red;font-size:18px"><CircleCloseFilled /></el-icon>
                </span>
              </el-tooltip>
            </div>
          </template>
        </el-upload>
        <el-date-picker
          v-if="item.element === 'date'"
          v-model="formData[item.prop]"
          type="date"
          :placeholder="item.placeholder ? item.placeholder : `请选择${item.label}`"
          :format="item.format"
          value-format="YYYY-MM-DD"
          :disabled="typeof item.disabled === 'object' ? false : item.disabled"
          :disabled-date="disabledDate"
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
let emit = defineEmits(["openDialog", 'selectChange'])
let openDialog = (prop) => emit('openDialog', prop)
let selectChange = (val, prop) => {
  let data = { val, prop }
  emit('selectChange', data)
}
let filesList = reactive([])
const ruleFormRef = ref(null)
let props = defineProps({
  elements: {
    type: Array,
    default(){
      return []
    }
  },
  client: {
    type: Object,
    default: () => {return {}}
  },
  model: {
    type: Object,
    default(){return {}}
  },
  disabled: {
    type: Boolean,
    default: false
  },
  disabledDate: {
    type: Function,
    default: () => {
      return false
    }
  }
})
let formData = reactive(props.model)

defineExpose({
  ruleFormRef
})

const handleDelete = (prop) => {
  formData[prop] = ''
  filesList.length = 0
}

const onUploadChange = (val) => {
  if (val.status === 'success'){
    filesList.length = 0
  }
}
</script>

<style lang="less" scoped>
.form_area{
  display: flex;
  justify-content: center;
  :deep(.el-input){
    width: 280px;
    height: 34px;
  }
  .form{
    margin: 0 auto;
  }
  .upLoad-content{
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgb(250, 250, 250);
    border: 1px dashed rgb(205, 208, 214);
    width: 130px;
    height: 130px;
  }
  .image-content{
    display: flex;
    position: relative;
  }
  #deleteIcon{
    position: absolute;
    left: 78%;
    top: 2%;
  }
  :deep(.el-textarea){
    width: 280px;
  }
}
:deep(.el-form){
  padding-right: 0px;
}
</style>