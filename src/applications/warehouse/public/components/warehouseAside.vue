<template>
  <el-menu
    active-text-color="#0075FF"
    :background-color="bgColor"
    class="menu"
    :style="isCollapse?{width:'60px',overflow:'hidden'}:{width:'200px'}"
    style="height: 100vh;padding-bottom:50px"
    :default-active="route.path"
    text-color="#FFFFFF"
    router
    :collapse="isCollapse"
  >
    <el-menu-item index="/home">
      <el-icon><HomeFilled /></el-icon><span class="nav_title">首页</span>
    </el-menu-item>
    <el-sub-menu v-if="isShowFileRouter" index="/file">
      <template #title>
        <el-icon><Memo /></el-icon>
        <span class="nav_title">档案管理</span>
      </template>
      <el-menu-item v-if="userPermissions.includes('MENU_MERCHANT_ARCHIVE_READ')" index="/file/shops">
        商家档案
      </el-menu-item>
      <el-menu-item v-if="userPermissions.includes('MENU_MATERIAL_ARCHIVE_READ')" index="/file/goods">
        商品档案
      </el-menu-item>
      <el-menu-item v-if="userPermissions.includes('MENU_WAREHOUSE_ARCHIVE_READ')" index="/file/warehouse">
        仓库档案
      </el-menu-item>
    </el-sub-menu>
    <el-sub-menu v-if="isShowInventoryRouter" index="/inventory">
      <template #title>
        <el-icon><Box /></el-icon>
        <span class="nav_title">库存管理</span>
      </template>
      <el-menu-item v-if="userPermissions.includes('MENU_PICKING_ORDER_READ')" index="/inventory/pickup">
        提货订单
      </el-menu-item>
      <el-menu-item v-if="userPermissions.includes('MENU_ALLOCATION_PLAN_READ')" index="/inventory/allot/allotPlan">
        调拨计划库
      </el-menu-item>
      <el-menu-item v-if="userPermissions.includes('MENU_ALLOCATION_ORDER_READ')" index="/inventory/allot/allotSlip">
        调拨单
      </el-menu-item>
      <el-menu-item v-if="userPermissions.includes('MENU_IN_WAREHOUSE_ORDER_READ')" index="/inventory/input">
        入库单
      </el-menu-item>
      <el-menu-item v-if="userPermissions.includes('MENU_STOCK_RESET_ORDER_READ')" index="/inventory/adjust">
        调整库位单
      </el-menu-item>
      <el-menu-item v-if="userPermissions.includes('MENU_OUT_WAREHOUSE_ORDER_READ')" index="/inventory/output">
        出库单
      </el-menu-item>
      <el-menu-item index="/inventory/outputScan">
        条码查询
      </el-menu-item>
    </el-sub-menu>
    <el-sub-menu v-if="isShowSaleRouter" index="/sale">
      <template #title>
        <el-icon><ShoppingTrolley /></el-icon>
        <span class="nav_title">销售管理</span>
      </template>
      <el-menu-item v-if="userPermissions.includes('MENU_SALE_ORDER_READ')" index="/sale/slip">
        销售订单
      </el-menu-item>
      <el-menu-item v-if="userPermissions.includes('MENU_SALE_RETURN_ORDER_READ')" index="/sale/salereturn/slip">
        销售退货单
      </el-menu-item>
    </el-sub-menu>
    <el-sub-menu v-if="isShowOtherRouter" index="/other">
      <template #title>
        <el-icon><Folder /></el-icon>
        <span class="nav_title">其他</span>
      </template>
      <el-menu-item v-if="userPermissions.includes('MENU_STOCK_INIT_READ')" index="/other/original">
        期初库存
      </el-menu-item>
      <el-menu-item v-if="userPermissions.includes('MENU_TAKE_STOCK_READ')" index="/other/check">
        盘点表
      </el-menu-item>
      <el-menu-item index="/other/check/collect">
        盘点汇总
      </el-menu-item>
    </el-sub-menu>
    <el-sub-menu v-if="isShowInventoryCheckRouter" index="/inventoryCheck">
      <template #title>
        <el-icon><Search /></el-icon>
        <span class="nav_title">库存查询</span>
      </template>
      <el-menu-item v-if="userPermissions.includes('MENU_STOCK_MAIN_READ')" index="/inventoryCheck/warehouse">
        <span class="nav_title">仓库库存查询</span>
      </el-menu-item>
      <el-menu-item v-if="userPermissions.includes('MENU_STOCK_POSITION_READ')" index="/inventoryCheck/position">
        <span class="nav_title">库位库存查询</span>
      </el-menu-item>
      <el-menu-item v-if="userPermissions.includes('MENU_STOCK_MERCHANT_READ')" index="/inventoryCheck/shops">
        <span class="nav_title">商家库存查询</span>
      </el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>

<script setup>
import { onBeforeMount, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
const route = useRoute()
const router = useRouter()

const userPermissions = reactive([])
const isCollapse = ref(false)
const isShowFileRouter = ref(false)
const isShowInventoryRouter = ref(false)
const isShowSaleRouter = ref(false)
const isShowOtherRouter = ref(false)
const isShowInventoryCheckRouter = ref(false)
const isShowBillRouter = ref(false)
const isShowFinanceRouter = ref(true)
const isShowRulesManager = ref(false)

const promision = () => {
  let pro = JSON.parse(sessionStorage.getItem("userPermissions"))
  userPermissions.length = 0
  userPermissions.push(...pro)
  isShowFileRouter.value = userPermissions.includes('MENU_MERCHANT_ARCHIVE_READ') || userPermissions.includes('MENU_MATERIAL_ARCHIVE_READ') || userPermissions.includes('MENU_REGION_ARCHIVE_READ') || userPermissions.includes('MENU_WAREHOUSE_ARCHIVE_READ')
  isShowInventoryRouter.value = userPermissions.includes('MENU_PICKING_ORDER_READ') || userPermissions.includes('MENU_ALLOCATION_PLAN_READ') || userPermissions.includes('MENU_ALLOCATION_ORDER_READ') || userPermissions.includes('MENU_IN_WAREHOUSE_ORDER_READ') || userPermissions.includes('MENU_STOCK_RESET_ORDER_READ') || userPermissions.includes('MENU_OUT_WAREHOUSE_ORDER_READ')
  isShowSaleRouter.value = userPermissions.includes('MENU_SALE_ORDER_READ') || userPermissions.includes('MENU_SALE_RETURN_ORDER_READ') || userPermissions.includes('MENU_MERCHANT_ALLOCATION_READ')
  isShowOtherRouter.value = userPermissions.includes('MENU_STOCK_INIT_READ') || userPermissions.includes('MENU_TAKE_STOCK_READ')
  isShowInventoryCheckRouter.value = userPermissions.includes('MENU_STOCK_MAIN_READ') || userPermissions.includes('MENU_STOCK_MERCHANT_READ') || userPermissions.includes('MENU_STOCK_POSITION_READ')
  isShowBillRouter.value = userPermissions.includes('MENU_PAYABLE_CARRIER_BILL') || userPermissions.includes('MENU_PAYABLE_BRANCH_BILL') || userPermissions.includes('MENU_PAYABLE_MERCHANT_BILL_SALE')
  isShowFinanceRouter.value = userPermissions.includes('MENU_COST_BILL') || userPermissions.includes('MENU_COST_MERCHANT_CHECK') || userPermissions.includes('MENU_COST_SALES_CHECK') || userPermissions.includes('MENU_COST_TICKET') || userPermissions.includes('MENU_COST_RULE') || userPermissions.includes('MENU_MATERIAL_PRICE') || userPermissions.includes('MENU_MATERIAL_CLASSIFY')
  isShowRulesManager.value = userPermissions.includes('MENU_MATERIAL_CLASSIFY') || userPermissions.includes('MENU_MATERIAL_PRICE') || userPermissions.includes('MENU_COST_RULE')
}

const bgColor = ref('#1f2430')

const changeCollapse = (val) => {
  isCollapse.value = val
}

defineExpose({
  changeCollapse
})

onBeforeMount(() => {
  const settings = JSON.parse(localStorage.getItem('userSettings'))
  if (settings && settings.routerSetting){
    bgColor.value = settings.routerSetting.backgroundColor
  }
  promision()
})

const quit = () => {
  ElMessageBox.alert('是否退出登录 ?', '提示', {
    // if you want to disable its autofocus
    // autofocus: false,
    confirmButtonText: '确定退出',
    callback: (action) => {
      if (action === 'confirm') {
        sessionStorage.clear()
        router.push('/login')
      }
    }
  })
}
</script>

<style lang="less" scoped>
.menu {
  width: 200px;
  overflow-x: hidden;
  overflow-y: scroll;
}

.nav_title {
  display: inline-block;
  margin-left: 15px;
}
:deep(.el-menu-item) {
  transition: all 0.5s;
}
:deep(.el-menu-item:hover) {
  background-color: rgba(25, 194, 255, .5)
}
:deep(.is-active:hover) {
  color: rgba(25, 194, 255, 1);
  background-color: rgba(25, 194, 255, .5)
}
</style>