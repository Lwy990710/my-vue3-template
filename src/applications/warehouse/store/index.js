import { createStore } from 'vuex'
import createPersistedstate from 'vuex-persistedstate'
import goodsFile from './goodsFile/index'
import shopsFile from './shopsFile/index'
import carTeamFile from './carTeamFile/index'
import allotSlip from './allotSlip/index'
import adjustSlip from './adjustSlip/index'
import inputSlip from './inputSlip/index'
import outputSlip from './outputSlip/index'
import sale from './sale/index'
import saleReturn from './saleReturn/index'
import inventoryCheck from './inventoryCheck/index'
import original from './original/index'
import check from './check/index'
import allotPlan from './allotPlan/index'
import areaFile from './areaFile'
import warehouseFile from './warehouse/warehouseFIle'
import checkCollect from './checkCollect'
import outputScan from './outputScan'
import pickUpSlip from './pickUpSlip'
import checkAllocation from './checkAllocation/checkAllocation'
import checkMission from './checkMission/checkMission'
export default createStore({
  state: {
  },
  getters: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    goodsFile,
    shopsFile,
    carTeamFile,
    allotSlip,
    allotPlan,
    adjustSlip,
    inputSlip,
    outputSlip,
    sale,
    saleReturn,
    inventoryCheck,
    check,
    original,
    areaFile,
    warehouseFile,
    checkCollect,
    outputScan,
    pickUpSlip,
    checkAllocation,
    checkMission
  },
  plugins: [createPersistedstate({
    storage: window.localStorage,
    key: 'warehouse-header-store',
    paths: [
      'goodsFile', 'shopsFile', 'carTeamFile', 'allotSlip', 'adjustSlip', 'allotPlan',
      'inputSlip', 'outputSlip', 'sale', 'saleReturn', 'inventoryCheck',
      'check', 'original', 'areaFile', 'warehouseFile', 'checkCollect', 'outputScan', 'pickUpSlip', 'checkAllocation', 'checkMission'
    ]
  })]
})
