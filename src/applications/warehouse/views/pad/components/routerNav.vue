<template>
  <div style="overflow-x: hidden;">
    <el-menu
      class="el-menu-demo"
      mode="horizontal"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b"
      :default-active="route.path"
      router
    >
      <el-menu-item index="/padSaleOrders">
        销售订单
      </el-menu-item>
      <el-menu-item index="/trajectory">
        物流轨迹
      </el-menu-item>
      <el-menu-item index="/padHome">
        退出登录
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<style lang="less" scoped>

</style>