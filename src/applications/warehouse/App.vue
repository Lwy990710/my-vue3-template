<template>
  <div>
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'

/*   setup() {
    provide('echarts', echarts)
  } */
}
</script>

<script setup>
import { watch, ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import Watermark from 'watermark-plus'
const settings = JSON.parse(localStorage.getItem('userSettings'))
const cssGlobal = document.querySelector('*')
if (settings && settings.global && settings.global.fontFamily){
  cssGlobal.style.fontFamily = settings.global.fontFamily
} else {
  cssGlobal.style.fontFamily = `'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
  'Microsoft YaHei', '微软雅黑', Arial, sans-serif`
}

const watermark = ref(null)

const route = useRoute()

onMounted(() => {
  setTimeout(() => {
    sessionStorage.setItem('runningProject', 'warehouseProduction')
  })
})

watch(() => route.path, (newPath, oldPath) => {
  if (route.path === '/login' || route.path === '/padHome' || route.path === '/trajectory') {
    if (watermark.value) watermark.value.destroy()

  } else if (route.path.indexOf('print') !== -1){
    if (watermark.value) watermark.value.destroy()
  } else {
    let userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
    if (!userInfo) return
    if (watermark.value) watermark.value.destroy()
    watermark.value = new Watermark({
      // 传参
      content: ` ${userInfo?.nickName}`,
      fontSize: '16',
      color: 'grey',
      alpha: 0.07,
      width: '22',
      height: '90'
    })
    watermark.value.create()
  }
}, { immediate: true })

function throttle(func, wait) {
  let previous = 0
  return function() {
    let now = Date.now()
    let context = this
    let args = arguments
    if (now - previous > wait) {
      func.apply(context, args)
      previous = now
    }
  }
}

window.addEventListener('mousemove', throttle(() => {
  let dateNow = Date.now()
  if (sessionStorage.getItem('last_move_time')){
    let lastMoveTime = sessionStorage.getItem('last_move_time')
    if (dateNow - lastMoveTime > 3600000){
      ElMessageBox.alert('您在这个页面停留太久了，请刷新', '提示', {
        type: 'warning',
        confirmButtonText: '立即刷新',
        callback: (action) => {
          location.reload()
        }
      })
    }
  }
  sessionStorage.setItem('last_move_time', dateNow)
}, 1000))
</script>

<style lang="less">
@import '@/css/dialog.less';
@import '@/css/drawer.less';
@import '@/css/editPage.less';
@import '@/css/extraHandle.less';
html,
body {
  padding: 0;
  margin: 0;
  background: @bg-gray;
  color: @text;
  backface-visibility: hidden;
  font-size: 18px;
}

* {
  scrollbar-color: #e5e5e5 #f7f7f9; /* 滑块颜色  滚动条背景颜色 */
  scrollbar-width: thin; /* 滚动条宽度有三种：thin、auto、none */
  // font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
  // 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  // font-family: "楷体","楷体_GB2312";
}

#nprogress .bar {
  background: #67C23A !important;
  height: 3px !important;
  z-index: 2001 !important;
  border-radius: 20px !important;
}

::-webkit-scrollbar-track-piece {
  background-color: #F0F2F5;
}

::-webkit-scrollbar {
  width: 9px;
  height: 9px;
}

::-webkit-scrollbar-thumb {
  background-color: gray;
  background-clip: padding-box;
  min-height: 28px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #bbb;
}
input:-webkit-autofill , textarea:-webkit-autofill, select:-webkit-autofill {
	-webkit-box-shadow: 0 0 0px 1000px transparent  inset !important;
  background-color:transparent;
  background-image: none;
  transition: background-color 50000s ease-in-out 0s;
}
/** 滚动条美化 **/
/*定义滚动条高宽及背景 高宽分别对应横竖滚动条的尺寸*/
::-webkit-scrollbar {
	width: 6px;
	height: 8px;
	background-color: #c8c9cc;
}

/*定义滚动条轨道 内阴影+圆角*/
::-webkit-scrollbar-track {
	-webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
	border-radius: 10px;
	background-color: #c8c9cc;
}

/*定义滑块 内阴影+圆角*/
::-webkit-scrollbar-thumb {
	border-radius: 10px;
	-webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, .3);
	background-color: #c8c9cc;
}
</style>
