<template>
  <div>
    <el-dialog
      v-model="showDialog"
      :title="title"
      :close-on-click-modal="false"
      :show-close="false"
      :width="width"
    >
      <template #header="{ titleId, titleClass }">
        <div class="jx-dialog-header">
          <h4 :id="titleId" :class="titleClass">
            {{ title }}
            <el-radio-group v-model="type" class="ml10">
              <el-radio label="global">
                全局字体设置
              </el-radio>
              <el-radio label="tableSetting">
                表格数据个性化
              </el-radio>
              <el-radio label="routerSetting">
                侧边/导航栏个性化
              </el-radio>
            </el-radio-group>
          </h4>

          <el-button
            class="dialog-close-btn"
            type="danger" icon="CloseBold"
            circle
            @click="closeDialog"
          />
        </div>
      </template>
      <div v-show="type==='global'" class="content">
        <el-tag class="mb10" size="large">
          全局字体设置
        </el-tag>
        <el-button class="ml12" @click="reset('global')">
          重置
        </el-button>
        <div class="content-item mt10">
          <span class="demonstration">字体样式</span>
          <el-radio-group v-model="setting.global.fontFamily" class="ml10">
            <el-radio
              label="'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
  'Microsoft YaHei', '微软雅黑', Arial, sans-serif"
            >
              默认
            </el-radio>
            <el-radio label="&quot;楷体&quot;,&quot;楷体_GB2312&quot;">
              楷体
            </el-radio>
          </el-radio-group>
        </div>
        <el-tag class="mb10" size="large">
          示例
        </el-tag>
        <div class="content-demo" :style="{fontFamily:setting.global.fontFamily}">
          你很帅你很帅你很帅你很帅你很帅你很帅你很帅你很帅你很帅你很帅你很帅你很帅你很帅你很帅你很帅你很帅你很帅你很帅你很帅你很帅你很帅你很帅你很帅你很帅你很帅
        </div>
      </div>
      <div v-show="type==='tableSetting'" class="content">
        <el-tag class="mb10" size="large">
          表格数据个性化 - 限主表
        </el-tag>
        <el-button class="ml12" @click="reset('tableSetting')">
          重置
        </el-button>
        <div class="content-item">
          <span class="demonstration">字体大小</span>
          <el-slider
            v-model="setting.tableSetting.fontSize" :step="1" :max="20" :min="12"
            show-stops
          />
        </div>
        <div class="content-item">
          <span class="demonstration">字体颜色</span>
          <el-color-picker v-model="setting.tableSetting.color" />
        </div>
        <div class="content-item mt10">
          <span class="demonstration">表头颜色</span>
          <el-color-picker v-model="setting.tableSetting.headerColor" />
        </div>
        <el-tag class="mb10" size="large">
          示例
        </el-tag>
        <div class="content-demo" :style="{color:setting.tableSetting.color,fontSize:setting.tableSetting.fontSize + 'px'}">
          你很帅你很帅你很帅你很帅你很帅你很帅你很帅你很帅你很帅你很帅你很帅你很帅你很帅你很帅你很帅你很帅你很帅你很帅你很帅你很帅你很帅你很帅你很帅你很帅你很帅
        </div>
      </div>
      <div
        v-show="type==='routerSetting'" class="content"
      >
        <el-tag class="mb10" size="large">
          侧边/导航栏个性化
        </el-tag>
        <el-button class="ml12" @click="reset('routerSetting')">
          重置
        </el-button>
        <div class="content-item">
          <span class="demonstration">背景颜色</span>
          <el-color-picker v-model="setting.routerSetting.backgroundColor" />
        </div>
        <el-tag class="mb10" size="large">
          示例
        </el-tag>
        <div class="content-demo clo" :style="{height: '300px'}">
          <div class="router-demo-row" :style="setting.routerSetting" />
          <div class="router-demo-clo" :style="setting.routerSetting" />
        </div>
      </div>
      <div class="mt20">
        <el-button
          type="primary" style="float:right;margin-right:10px"
          @click="saveSettings"
        >
          保存
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
  }

})
const _emits = defineEmits(['closeDialog'])
const closeDialog = () => _emits('closeDialog') // 关闭弹窗事件
const type = ref('global')

const showDialog = computed({
  get(){
    return _props.isShow
  },
  set(){
    //null
  }
}) // 开启弹窗事件
const setting = reactive({
  global: {
    fontFamily: `'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
  'Microsoft YaHei', '微软雅黑', Arial, sans-serif`
  },
  tableSetting: {
    fontSize: 14,
    color: '#606266',
    isHighLightChecked: true,
    headerColor: '#606266'
  },
  routerSetting: {
    backgroundColor: '#1b1f2a'
  }
})
const saveSettings = () => {
  proxy.$alert('保存会覆盖之前的设置，是否确认保存？', '提示', {
    type: 'warning',
    showCancelButton: true,
    cancelButtonText: '再想想',
    confirmButtonText: '确认',
    confirmButtonClass: 'ask-confirm-btn',
    callback: (action) => {
      if (action !== 'cancel'){
        localStorage.setItem('userSettings', JSON.stringify(setting))
        proxy.$message.success('保存成功，部分样式刷新后生效')
        closeDialog()
      }
    }
  })
}

const reset = (type) => {
  proxy.$alert('确认重置此设置项吗？', '提示', {
    type: 'warning',
    showCancelButton: true,
    cancelButtonText: '再想想',
    confirmButtonText: '确认',
    confirmButtonClass: 'ask-confirm-btn',
    callback: (action) => {
      if (action !== 'cancel'){
        if (type === 'tableSetting'){
          setting[type] = {
            fontSize: 14,
            color: '#606266'
          }
        } else if (type === 'routerSetting'){
          setting[type] = {
            backgroundColor: '#1b1f2a'
          }
        } else if (type === 'global'){
          setting[type] = {
            fontFamily: `'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
  'Microsoft YaHei', '微软雅黑', Arial, sans-serif`
          }
        }
      }
    }
  })
}

onBeforeMount(() => {
  const settings = JSON.parse(localStorage.getItem('userSettings'))
  if (settings && settings.tableSetting){
    setting.tableSetting = settings.tableSetting
  }
  if (settings && settings.routerSetting){
    setting.routerSetting = settings.routerSetting
  }
  if (settings && settings.global){
    setting.global = settings.global
  }
})
</script>

<style lang="less" scoped>
.content-item{
    display: flex;
    align-items: center;
    span{
        display: inline-block;
        width: 70px;
    }
}
.content-demo{
    border: 1px solid #7c8087;
    padding: 10px;
    border-radius: 12px;
    height: 50px;
}
.router-demo-clo{
  background: red;
  width: 100px;
  height: 200px;
}
.router-demo-row{
  background: red;
  width: 700px;
  height: 100px;
}
</style>