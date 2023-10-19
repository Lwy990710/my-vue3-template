<template>
  <div v-loading="missionLoading" class="main">
    <div
      v-for="(item,index) in tableData" :key="item.inventoryTaskOrderCode"
      class="print_area"
    >
      <div class="top_area">
        <div class="title">
          盘点任务
        </div>
      </div>
      <table
        class="table"
        borderSpacing="0" cellspacing="0"
        border="1" cellpadding="5" bordercolor="black" style=" border-bottom:none"
      >
        <tr>
          <td>盘点名称:</td>
          <td>{{ item.inventoryTaskName }}</td>
          <td>盘点单号:</td>
          <td>
            {{ item.inventoryTaskOrderCode }}
          </td>
        </tr>
        <tr>
          <td>盘点日期:</td>
          <td>{{ item.inventoryTaskDate }}</td>
          <td>盘点人:</td>
          <td>
            {{ item.inventoryUserName }}
          </td>
        </tr>
      </table>
      <table
        class="table"
        borderSpacing="0" cellspacing="0"
        border="1" cellpadding="5" bordercolor="black" style=" border-top:none"
      >
        <tr>
          <td>仓库名称</td>
          <td>仓位名称</td>
          <td>物料代码</td>
          <td>物料名称</td>
          <td>规格型号</td>
          <td>物料类型</td>
          <td v-if="item.isOpenCheck === 1">
            账面数量
          </td>
          <td>
            实盘数量
          </td>
        </tr>
        <tr v-for="checkData in item.checkList" :key="checkData.id">
          <td>{{ checkData.warehouseName }}</td>
          <td>{{ checkData.warehousePositionName }}</td>
          <td>{{ checkData.materialCode }}</td>
          <td>{{ checkData.materialName }}</td>
          <td>{{ checkData.materialSpecification }}</td>
          <td>{{ checkData.materialType }}</td>
          <td v-if="item.isOpenCheck === 1">
            {{ checkData.bookQuantity }}
          </td>
          <td>{{ checkData.firmOfferQuantity ? checkData.firmOfferQuantity : '' }}</td>
        </tr>
      </table>
      <!--       <div class="foot">
        <div :id="'printDate' + item.id" class="sub">
          制单日期:
        </div>
        <div class="sub">
          打印次数: {{ item.numberOfPrints }}
        </div>
        <div class="sub">
          制单人: {{ nickName }}
        </div>
      </div> -->
      <div v-if="index !== tableData.length - 1" style="page-break-before:always">
          &nbsp;
      </div>
    </div>
    <div id="handle_area">
      <el-button type="primary" @click="printTable">
        打印
      </el-button>
      <el-button type="danger" @click="close">
        关闭
      </el-button>
    </div>
  </div>
</template>

<script setup>
import JsBarcode from 'jsbarcode'
import { getTime } from '@/applications/bigWarehouse/public/jxRequest/index'
import { onBeforeMount, onMounted, reactive, ref, getCurrentInstance } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CheckMissionDataSource, loading as missionLoading } from '../../../utils/checkMission/checkMission'
import { ElMessage } from 'element-plus'
let { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()
let printCheckAllocationData = JSON.parse(sessionStorage.getItem('printCheckAllocationData'))
let tableData = reactive([])
let allocationData = ref(null)
let printOutputDataSource = ref(null)
let customList = reactive({})
let totalNum = ref(0)
onBeforeMount(() => {
  if (!printOutputDataSource.value) {
    printOutputDataSource.value = new CheckMissionDataSource({
      selectUri: '/inventoryTaskDetailAllocation/select',
      pageSize: 100000
    })
  }
  getData()
})

const getData = async () => {
  printCheckAllocationData.forEach(async item => {
    printOutputDataSource.value.searchData['inventoryTaskOrderCode'] = item['inventoryTaskOrderCode']
    let temp = {
      inventoryTaskName: item['inventoryTaskName'],
      inventoryTaskOrderCode: item['inventoryTaskOrderCode'],
      inventoryUserName: item['inventoryUserName'],
      inventoryTaskDate: new proxy.$DataTool().timeStamp2Time(item['inventoryTaskDate'], 'yyyy-MM-dd'),
      isOpenCheck: item['isOpenCheck'],
      checkList: []
    }
    await printOutputDataSource.value.initData()
    temp.checkList.push(...printOutputDataSource.value.tableData)
    tableData.push(temp)
  })
  console.log(tableData)
}
const close = () => {
  router.go(-1)
}
const printTable = () => {
  let time = getTime()
  let params = []

  /*   let id2 = 'printDate' + item.id
  document.getElementById(id2).innerHTML = "打印时间:" + time */
  /*   printOutputDataSource.value.printAllotNum(params) */
  setTimeout(() => {
    document.getElementById('handle_area').style.display = 'none'
    window.print()
    document.getElementById('handle_area').style.display = 'block'
  }, 1000)

}
</script>

    <style lang="less" scoped>
    body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
     .main {
        width: 100%;
        color: black;
      font-family: STHeiti;
        background-color: #FFFFFF !important;
        .print_area {
          width: 1000px;
          margin: 15px auto;
        }
        #handle_area {
          width: 1000px;
          margin: 15px auto;
          padding: 20px;
          text-align: center;
        }
        .top_area {
          display: flex;
          justify-content: center;
          .title {
            text-align: right;
            margin: 10px 0;
            font-size: 26px;
          }
          .code{
            text-align: center;
            width: 33%;
          }
        }
        .foot {
          margin-top: 10px;
          display: flex;
          justify-content: space-around;
          font-size: 18px;
        }
        .sub {
            width: 33%;
            text-align: center;
          }
     }
     .table {
      text-align:center;
      width: 100%
     }
    </style>
    <style>
    @media print {
      @page {
        size: auto A4 landscape;
        margin: 5mm 8mm;
      }
    }
    </style>