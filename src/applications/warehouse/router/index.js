import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
NProgress.configure({
  easing: 'ease',
  speed: 500,
  showSpinner: true,
  trickleSpeed: 200,
  minimum: 0.3
})
const routes = [
  {
    path: '/',
    redirect: "/login"
  },
  {
    path: '/main',
    name: 'main',
    component: () => import('../views/Home.vue'),
    children: [
      {
        path: '/home',
        name: 'home',
        meta: {
          title: '首页',
          keepAlive: true
        },
        component: () => import('../views/homePage/index.vue'),
        children: []
      }, {
        path: '/permissionSetting',
        name: 'permissionSetting',
        meta: {
          title: '权限设置',
          keepAlive: false
        },
        component: () => import('../views/permissionSetting/permissionSetting.vue'),
        children: []
      }, {
        path: '/advancedPermission',
        name: 'advancedPermission',
        meta: {
          title: '数据权限',
          keepAlive: false
        },
        component: () => import('../views/permissionSetting/advancedPermission.vue'),
        children: []
      }, {
        path: '/userSetting',
        name: 'userSetting',
        meta: {
          title: '账号管理',
          keepAlive: false
        },
        component: () => import('../views/permissionSetting/userSetting.vue'),
        children: []
      }, {
        path: '/file',
        name: 'file',
        meta: {
          title: '档案管理'
        },
        children: [
          {
            path: '/file/shops',
            name: 'shopsFile',
            component: () => import('../views/filemanage/ShopsFile.vue'),
            meta: {
              title: '商家档案',
              keepAlive: true
            }
          }, {
            path: '/file/new/shop',
            name: 'newShopFile',
            component: () => import('../views/filemanage/newfile/NewShopFile.vue'),
            meta: {
              title: '新增商家',
              keepAlive: false
            }
          }, {
            path: '/file/goods',
            name: 'goodsFile',
            component: () => import('../views/filemanage/GoodsFile.vue'),
            meta: {
              title: '商品档案',
              keepAlive: true
            }
          },
          {
            path: '/file/new/good',
            name: 'newGoodFile',
            component: () => import('../views/filemanage/newfile/NewGoodFile.vue'),
            meta: {
              title: '新增商品',
              keepAlive: false
            }
          },
          {
            path: '/file/warehouse',
            name: 'warehouse',
            component: () => import('../views/filemanage/WarehouseFile.vue'),
            meta: {
              title: '仓库档案',
              keepAlive: true
            }
          },
          {
            path: '/file/new/warehouse',
            name: 'newWarehouseFile',
            component: () => import('../views/filemanage/newfile/NewWarehouseFile.vue'),
            meta: {
              title: '新增仓库',
              keepAlive: false
            }
          },
          {
            path: '/file/new/position',
            name: 'newPositionFile',
            component: () => import('../views/filemanage/newfile/NewWarehousePositionFile.vue'),
            meta: {
              title: '新增仓位',
              keepAlive: false
            }
          }
        ]
      }, {
        path: '/inventory',
        name: 'inventory',
        meta: {
          title: '库存管理'
        },
        children: [
          {
            path: '/inventory/pickup',
            name: 'pickup',
            component: () => import('../views/inventorymanage/PickUpSlip.vue'),
            meta: {
              title: '提货订单',
              keepAlive: true
            }
          },
          {
            path: '/inventory/pickup/newFile',
            name: 'newPickup',
            component: () => import('../views/inventorymanage/newFile/newPickUpSlip.vue'),
            meta: {
              title: '新增提货订单',
              keepAlive: false
            }
          }, {
            path: '/inventory/allot/allotPlan',
            name: 'allotPlan',
            component: () => import('../views/inventorymanage/AllotPlan.vue'),
            meta: {
              title: '调拨计划库',
              keepAlive: true
            }
          }, {
            path: '/inventory/allot/allotSlip',
            name: 'allot',
            component: () => import('../views/inventorymanage/AllotSlip.vue'),
            meta: {
              title: '调拨单',
              keepAlive: true
            }
          },
          {
            path: '/inventory/allot/allotSlip/newFile',
            name: 'newAllot',
            component: () => import('../views/inventorymanage/newFile/newAllotSlip.vue'),
            meta: {
              title: '新增调拨单',
              keepAlive: false
            }
          }, {
            path: '/inventory/input',
            name: 'ipnut',
            component: () => import('../views/inventorymanage/InputSlip.vue'),
            meta: {
              title: '入库单',
              keepAlive: true
            }
          }, {
            path: '/inventory/input/newFile',
            name: 'newIpnut',
            component: () => import('../views/inventorymanage/newFile/newInputSlip.vue'),
            meta: {
              title: '新增入库单',
              keepAlive: false
            }
          }, {
            path: '/inventory/adjust',
            name: 'adjust',
            component: () => import('../views/inventorymanage/AdjustSlip.vue'),
            meta: {
              title: '调整库位单',
              keepAlive: true
            }
          }, {
            path: '/inventory/output',
            name: 'output',
            component: () => import('../views/inventorymanage/OutputSlip.vue'),
            meta: {
              title: '出库单',
              keepAlive: true
            }
          }, {
            path: '/inventory/output/newFile',
            name: 'newOutput',
            component: () => import('../views/inventorymanage/newFile/newOutputSlip.vue'),
            meta: {
              title: '新增出库单',
              keepAlive: false
            }
          }, {
            path: '/inventory/outputScan',
            name: 'outputScan',
            component: () => import('../views/inventorymanage/OutputScan.vue'),
            meta: {
              title: '扫码明细',
              keepAlive: false
            }
          }
        ]
      }, {
        path: '/sale',
        name: 'sale',
        meta: {
          title: '销售管理'
        },
        children: [{
          path: '/sale/slip',
          name: 'sale',
          component: () => import('../views/salemanage/SaleSlip.vue'),
          meta: {
            title: '销售订单',
            keepAlive: true
          }
        }, {
          path: '/sale/slip/newFile',
          name: 'newSale',
          component: () => import('../views/salemanage/newFile/newSaleSlip.vue'),
          meta: {
            title: '新增销售订单',
            keepAlive: false
          }
        }, {
          path: '/sale/salereturn/slip',
          name: 'saleReturn',
          component: () => import('../views/salemanage/SaleReturnSlip.vue'),
          meta: {
            title: '销售退货单',
            keepAlive: true
          }
        }, {
          path: '/sale/salereturn/slip/newFile',
          name: 'newSaleReturn',
          component: () => import('../views/salemanage/newFile/newSaleReturnSlip.vue'),
          meta: {
            title: '新增销售退货单',
            keepAlive: false
          }
        }]
      }, {
        path: '/other',
        name: 'other',
        meta: {
          title: '其他'
        },
        children: [
          {
            path: '/other/original',
            name: 'original',
            component: () => import('../views/other/Original.vue'),
            meta: {
              title: '期初库存'
            }
          }, {
            path: '/other/check',
            name: 'check',
            component: () => import('../views/other/CheckForm.vue'),
            meta: {
              title: '盘点表'
            }
          }, {
            path: '/other/new/check',
            name: 'newcheck',
            component: () => import('../views/other/newfile/NewCheckForm.vue'),
            meta: {
              title: '新增盘点表'
            }
          }, {
            path: '/other/check/collect',
            name: 'checkcollect',
            component: () => import('../views/other/CheckCollect.vue'),
            meta: {
              title: '盘点汇总'
            }
          }, {
            path: '/other/new/check/collect',
            name: 'newCheckcollect',
            component: () => import('../views/other/newfile/NewCheckCollect.vue'),
            meta: {
              title: '新增盘点汇总'
            }
          }, {
            path: '/other/mission',
            name: 'mission',
            component: () => import('../views/other/CheckMission.vue'),
            meta: {
              title: '盘点任务',
              keepAlive: true
            }
          }, {
            path: '/other/new/mission',
            name: 'newMission',
            component: () => import('../views/other/newfile/NewCheckMission.vue'),
            meta: {
              title: '新增盘点任务'
            }
          }, {
            path: '/other/check/personal',
            name: 'personalCheck',
            component: () => import('../views/other/PersonalCheck.vue'),
            meta: {
              title: '盘点工作'
            }
          }, {
            path: '/other/check/allocation',
            name: 'allocation',
            component: () => import('../views/other/CheckAllocation.vue'),
            meta: {
              title: '盘点分配表'
            }
          }
        ]
      }, {
        path: '/inventoryCheck',
        name: 'userManage',
        meta: {
          title: '库存查询'
        },
        children: [{
          path: '/inventoryCheck/warehouse',
          name: 'inventoryCheck',
          component: () => import('../views/inventoryCheck/inventoryCheck.vue'),
          meta: {
            title: '仓库库存查询',
            keepAlive: true
          }
        },
        {
          path: '/inventoryCheck/shops',
          name: 'inventoryCheckShops',
          component: () => import('../views/inventoryCheck/inventoryCheckShops.vue'),
          meta: {
            title: '商家库存查询',
            keepAlive: true
          } },
        {
          path: '/inventoryCheck/position',
          name: 'locationSummary',
          component: () => import('../views/inventoryCheck/locationSummary.vue'),
          meta: {
            title: '库位库存查询',
            keepAlive: true
          } }]
      }
    ]
  },
  {
    path: '/pad',
    name: 'pad',
    children: [{
      path: '/padHome',
      name: 'padHome',
      component: () => import('../views/pad/padHome.vue')
    }, {
      path: '/padSaleOrders',
      name: 'padSaleOrders',
      component: () => import('../views/pad/pages/salesOrder.vue') },
    {
      path: '/trajectory',
      name: 'trajectory',
      component: () => import('../views/pad/trajectory.vue'),
      meta: {
        title: '物流轨迹查询',
        keepAlive: false
      }
    }]
  },

  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login.vue'),
    meta: {
      title: '仓储系统-登录',
      keepAlive: false //设置页面是否需要使用缓存
    }
  },
  {
    path: '/print/outputslip',
    name: 'printOutputSlip',
    component: () => import('../views/inventorymanage/print/printOutputSlip.vue'),
    meta: {
      title: '打印出库单',
      keepAlive: false //设置页面是否需要使用缓存
    }
  },
  {
    path: '/print/inputslip',
    name: 'printInputSlip',
    component: () => import('../views/inventorymanage/print/printInputSlip.vue'),
    meta: {
      title: '打印入库单',
      keepAlive: false //设置页面是否需要使用缓存
    }
  },
  {
    path: '/print/saleslip',
    name: 'PrintSaleSlip',
    component: () => import('../views/salemanage/print/PrintSaleSlip.vue'),
    meta: {
      title: '打印销售订单',
      keepAlive: false //设置页面是否需要使用缓存
    }
  },
  {
    path: '/print/allotSlip',
    name: 'PrintAllotSlip',
    component: () => import('../views/inventorymanage/print/PrintAllotSlip.vue'),
    meta: {
      title: '打印调拨单',
      keepAlive: false //设置页面是否需要使用缓存
    }
  },
  {
    path: '/print/salereturn',
    name: 'PrintSaleReturn',
    component: () => import('../views/salemanage/print/PrintSaleReturnSlip.vue'),
    meta: {
      title: '打印退货单',
      keepAlive: false //设置页面是否需要使用缓存
    }
  },
  {
    path: '/:pathMatch(.*)', redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  base: '/warsehouse/'
})

router.beforeEach((to, from, next) => {
  NProgress.start()
  window.document.title = to.meta.title ? to.meta.title : '嘉贤物流'
  if (to.meta.title === '物流轨迹查询'){
    if (to.query.type === 'user') window.document.title = '用户单轨迹查询'
    else window.document.title = '工程单轨迹查询'
  }
  if (to.path === '/login' || to.path === '/padHome' || to.path === '/trajectory'){
    sessionStorage.clear()
    next()
    return
  }
  const userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
  if (userInfo) {
    console.log(userInfo)
    next()
  }
  else {
    ElMessage.error('登录已过期,请重新登录')
    next('/login')
  }
})

router.afterEach(() => {
  NProgress.done()
})
export default router
