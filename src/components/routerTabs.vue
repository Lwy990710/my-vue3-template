
<template>
  <div class="pl20 pb10 pt10 pr10 mytabNav" :style="{background:bgColor,color:color}">
    <div class="tab-list">
      <div v-if="showChangeCollapse">
        <el-icon
          v-if="!isCollapse"
          class="mr10" style="cursor: pointer"
          @click="changeCollapse"
        >
          <Fold />
        </el-icon>
        <el-icon
          v-else
          class="mr10" style="cursor: pointer"
          @click="changeCollapse"
        >
          <Expand />
        </el-icon>
      </div>
      <div
        v-for="item,idx in openTab.slice(0,10)"
        :key="item.name"
        class="tab pointer mr10 flex-center"
        :style="activeIndex===idx?{background:'#4a78bd',color:'#fff',transition:'none'}:{}"
        @click="changeRoute(idx,item.path,item.query)"
      >
        <span class="router-span pointer .text-1" :title="item.meta.title">
          {{ item.meta.title }}
        </span>
        <el-icon
          class="ml6 closeIcon" :style="activeIndex===idx?{visibility:'visible',position:'static',transition:'none'}:{}"
          @click.stop="removeTab(idx)"
        >
          <CloseBold />
        </el-icon>
      </div>
      <el-tooltip
        class="box-item"
        effect="dark"
        content="关闭其他选项卡"
        placement="bottom"
      >
        <el-button
          class="mr10"
          circle
          icon="Delete"
          type="info"
          size="small"
          @click="closeOrther"
        />
      </el-tooltip>
      <el-popover
        v-if="openTab.length>10"
        placement="right"
        :width="200"
        trigger="hover"
      >
        <template #reference>
          <el-button
            class="m-2" style="border-radius: 20px;color:#fff;background:#203339;height:28px"
            :style="activeIndex>=10?{background:'#4a78bd'}:{}"
          >
            更多...
          </el-button>
        </template>
        <div class="tab-list flex-center">
          <div
            v-for="item,idx in openTab.slice(10,openTab.length)"
            :key="item.name"
            class="tab pointer mr10 flex-center mb10"
            :style="activeIndex===idx+10?{background:'#4a78bd',color:'#fff',transition:'none'}:{}"
            @click="changeRoute(idx+10,item.path,item.query)"
          >
            <span class="router-span pointer .text-1" :title="item.meta.title">
              {{ item.meta.title }}
            </span>
            <el-icon
              class="ml6 closeIcon" :style="activeIndex===idx+10?{visibility:'visible',position:'static',transition:'none'}:{}"
              @click.stop="removeTab(idx+10)"
            >
              <CloseBold />
            </el-icon>
          </div>
        </div>
      </el-popover>
    </div>
    <div class="flex-center">
      <smallOperation :color="userColor" />
    </div>
  </div>
</template>

<script setup>
import smallOperation from '@/components/smallOperation.vue'
import { onBeforeMount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'

const emits = defineEmits(['changeCollapse'])

const props = defineProps({
  bgColor: {
    type: String,
    default: '#fff'
  },
  color: {
    type: String,
    default: '#666'
  },
  userColor: {
    type: String,
    default: '#fff'
  },
  showChangeCollapse: {
    type: Boolean,
    default: false }
})
const activeIndex = ref(0)
const openTab = reactive([])
const route = useRoute()
const router = useRouter()
watch(() => route.path, (newValue, oldValue) => {
  if (newValue.indexOf('/new') !== -1) return
  let sign = openTab.findIndex(item => item.path === newValue)
  if (sign < 0){
    let temp = {
      name: route.matched[route.matched.length - 1].name,
      path: route.matched[route.matched.length - 1].path,
      query: route.query,
      meta: route.matched[route.matched.length - 1].meta
    }
    openTab.push(temp)
    if (newValue !== '/decrease/setcar/createSubSlip'){
      let i = router.options.routes[1].children.findIndex(item => openTab[openTab.length - 1].path.indexOf(item.path) !== -1)
      if (i !== -1){
        router.options.routes[1].children[i].children.map(item => {
          if (item.path === openTab[openTab.length - 1].path){
            item.meta.keepAlive = true
          }
        })
      }
    }
    activeIndex.value = openTab.length - 1
  } else {
    openTab.length = 0
    openTab.push(...JSON.parse(sessionStorage.getItem('routerTabs')))
    activeIndex.value = sign
  }
}, { immediate: true })

watch(() => openTab.length, () => {
  sessionStorage.setItem('routerTabs', JSON.stringify(openTab))
  sessionStorage.setItem('activeIndex', JSON.stringify(activeIndex.value))
})

watch(activeIndex, () => {
  sessionStorage.setItem('activeIndex', JSON.stringify(activeIndex.value))
})

onBeforeMount(() => {
  if (sessionStorage.getItem('routerTabs')){
    openTab.length = 0
    openTab.push(...JSON.parse(sessionStorage.getItem('routerTabs')))
  }
  if (sessionStorage.getItem('activeIndex')) activeIndex.value = JSON.parse(sessionStorage.getItem('activeIndex'))
  sessionStorage.setItem('routerTabs', JSON.stringify(openTab))
  sessionStorage.setItem('activeIndex', JSON.stringify(activeIndex.value))

})

onMounted(() => {
  if (localStorage.getItem('collapse') && localStorage.getItem('collapse') === 'true'){
    isCollapse.value = true
    emits('changeCollapse', isCollapse.value)
  }
})

const changeRoute = (idx, path, query) => {
  activeIndex.value = idx
  router.push({
    path,
    query
  })
}

const isCollapse = ref(false)

const changeCollapse = () => {
  isCollapse.value = !isCollapse.value
  localStorage.setItem('collapse', isCollapse.value)
  emits('changeCollapse', isCollapse.value)
}

const closeOrther = () => {
  openTab.forEach((item, idx) => {
    if (idx !== activeIndex.value) changeRouterKeepAlive(false, idx)
  })
  let temp = openTab[activeIndex.value]
  openTab.length = 0
  openTab.push(temp)
  activeIndex.value = 0
}

const changeRouterKeepAlive = (keepAlive, routeIdx) => {
  let i = router.options.routes[1].children.findIndex(item => openTab[routeIdx].path.indexOf(item.path) !== -1)
  if (i !== -1){
    router.options.routes[1].children[i].children.map(item => {
      if (item.path === openTab[routeIdx].path){
        item.meta.keepAlive = keepAlive
      }
    })
  }

}

const removeTab = (idx) => {
  if (openTab.length === 1){
    ElMessageBox.alert('关闭最后一个标签页面将会退出登录，是否确定', '提示', {
      confirmButtonText: '确定退出',
      callback: (action) => {
        if (action === 'confirm') {
          changeRouterKeepAlive(false, idx)
          openTab.splice(idx, 1)
          sessionStorage.clear()
          router.push('/login')
        }
      }
    })
  } else {
    changeRouterKeepAlive(false, idx)
    if (idx === activeIndex.value && idx === 0) router.push(openTab[++activeIndex.value].path)
    else if (idx === activeIndex.value) router.push(openTab[--activeIndex.value].path)
    if (idx < activeIndex.value) activeIndex.value--
    openTab.splice(idx, 1)
  }
}
</script>

<style lang="less" scoped>
.mytabNav{
  color: #fff;
  position: relative;
  display: flex;
  background: #1f2430;
  height: 30px;
  align-items: center;
  justify-content: space-between;
}
.tab-list{
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }

  .tab{
    z-index: 100;
    font-size: calc(@4x + @3x);
    border: 1px solid #4a78bd;
    padding: @3x @4x;
    border-radius: 20px;
    width: 100px;
    transition: all .5s;
    overflow: hidden;
    background: rgba(42, 187, 135,.1);
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    span{
      display: inline-block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  .router-span{
    z-index: 100;
  }
  .tab:hover .closeIcon,.router-span:hover .closeIcon{
    visibility:visible;
    position:static;
  }
  .tab:hover{
    background: #4a78bd;
    color: #fff;
  }
  .closeIcon{
    border-radius: 50%;
    padding: 2px;
    visibility: hidden;
    position: absolute;
    transition: color .5s;
    transition: background .5s;
  }
  .closeIcon:hover{
    background: @white;
    color: @navColor;
  }
</style>