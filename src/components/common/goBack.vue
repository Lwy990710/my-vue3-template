<template>
  <div class="head_nav pl20">
    <el-button
      v-if="needGoBack" class="head_nav-btn"
      plain @click="goBack"
    >
      <el-icon class="head_nav-goBack">
        <Back />
      </el-icon>返回
    </el-button>
    <div
      v-for="(item, index) in _backConfig" :key="index"
      class="head_nav-items"
    >
      <span class="route_text"> {{ item.title }}</span>
      <span v-if="(index!==_backConfig.length-1)" class="separator"> > </span>
    </div>
  </div>
</template>

<script setup>
import { reactive, onBeforeMount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
const _router = useRouter()
const _route = useRoute()
const _props = defineProps({
  backConfig: {
    type: Array,
    default(){
      return []
    }
  },
  needGoBack: {
    type: Boolean,
    default: true
  }
})
let _backConfig = reactive(_props.backConfig)
const goBack = function(){
  _router.go(-1)
}
onBeforeMount(() => {
  if (_route.query.id){
    _backConfig[2].title = _backConfig[2].title.replace('新增', '编辑')
  }
})
</script>

<style lang="less" scoped>
.head_nav{
  border-bottom: 1px solid rgb(235, 238, 245);
  height:60px;
  line-height:60px;
  min-width: 200px;
  display: flex;
  align-items: center;
  &-btn{
    margin-right: 10px;
  }
  &-goBack{
      margin-right:2px;
      cursor: pointer;
      font-size: 16px;
      display: inline-block;
  }
  .route_text{
      font-size: 14px;
      color:#606266;
  }
  .route_text:last-child{
      color: orange;
  }
  .separator{
      font-size: 16px;
      display: inline-block;
      margin: 0 6px;
  }
  :deep(.el-button:hover){
    border-color: rgb(255, 165, 0,);
    color: #606266;
  }
}
</style>