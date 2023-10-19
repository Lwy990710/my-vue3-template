<template>
  <div class="Home" style="overflow-x: hidden">
    <messageIcon v-if="userInfo.jobName==='商家'" />
    <el-container>
      <el-aside
        class="aside"
        :style="isCollapse?{width:'60px',backgroundColor:bgColor}:{width:'200px',backgroundColor:bgColor}"
      >
        <div
          v-if="!isCollapse" class="title"
          :style="{backgroundColor:bgColor}"
        >
          {{ env !== 'pro'?'你不可以凶我':'嘉贤物流-仓储' }}
        </div>
        <div
          v-else
          :class="env !== 'pro'?'test-ico':''"
          class="image"
        />
        <!-- 仓储系统导航栏 -->
        <warehouseAside ref="aside" />
      </el-aside>
      <el-container
        id="main" class="container"
        :style="isCollapse?{marginLeft:'60px'}:{marginLeft:'200px'}"
      >
        <el-header class="header">
          <routerTabs
            show-change-collapse
            :bg-color="bgColor" :color="'#fff'"
            @changeCollapse="changeCollapse"
          />
        </el-header>
        <el-main class="main">
          <router-view v-slot="{ Component }">
            <keep-alive>
              <component
                :is="Component" v-if="$route.meta.keepAlive"
                :key="$route.name"
              />
            </keep-alive>
            <component
              :is="Component" v-if="!$route.meta.keepAlive"
              :key="$route.name"
            />
          </router-view>
        </el-main>
      </el-container>
    </el-container>
    <el-backtop
      :right="100" :bottom="40"
    />
  </div>
</template>

<script setup>
import { onBeforeMount, ref, getCurrentInstance } from 'vue'
import warehouseAside from '@/applications/warehouse/public/components/warehouseAside.vue'
import routerTabs from '@/components/routerTabs.vue'
import messageIcon from '@/components/public/messageIconWH.vue'

const { proxy } = getCurrentInstance()
const env = process.env.VUE_APP_TITLE
const bgColor = ref('#1f2430')
const userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
onBeforeMount(() => {
  const settings = JSON.parse(localStorage.getItem('userSettings'))
  if (settings && settings.routerSetting){
    bgColor.value = settings.routerSetting.backgroundColor
  }
})

const isCollapse = ref(false)
const changeCollapse = (val) => {
  isCollapse.value = val
  proxy.$refs.aside.changeCollapse(val)
}
</script>

<style lang="less" scoped>
.aside {
  position: fixed;
  top: 0;
  left: 0;
  background-color: #1f2430;
  width: 200px;
  padding: 0;
  overflow: hidden;
  transition: width 1s;
}

.title {
  width: 198px;
  height: 50px;
  font-size: 24px;
  line-height: 50px;
  background-color: #1f2430;
  color: #FFFFFF;
  font-weight: bold;
  text-align: center;
}

.header {
  width: 100%;
}

:deep(.el-header){
  padding: 0 !important;
}

.main {
  // border-radius: 8px;
  box-shadow: -1px -1px 10px #f0f2f5;
  overflow-x: hidden;
  padding: 0 6px;
  padding-right: 26px;
  background-color: #F0F2F5;
  margin: 0 auto;
  padding-top: 0;
  width: 112%;
}

.container {
  margin-left: 200px;
  transition: 1s;
}

.el-menu {
  border: none;
}

.image{
  width: 40px;
  height: 40px;
  background: url('../../../../public/jxwl.ico');
  background-size: 100% 100%;
  margin: 10px auto;
}
.test-ico{
  background: url('../../../../public/test.ico');
  background-size: 100% 100%;
}
</style>