<template>
  <div
    v-loading="loading"
    class="main"
  >
    <div
      v-for="(item,index) in tableData"
      :key="item.id" class="print_area"
    >
      <div class="top_area">
        <div class="title">
          嘉贤物流调拨单
        </div>
        <div class="code">
          <img :id="'barcode' + item.allocationCode">
        </div>
      </div>
      <table
        class="table"
        borderSpacing="0" cellspacing="0"
        border="1" cellpadding="5" bordercolor="black"
      >
        <tr>
          <th rowspan="4">
            承运信息
          </th>
          <th>车队名称</th>
          <td>{{ item.carrierName }}</td>
          <th>调拨单号</th>
          <td colspan="3">
            {{ item.allocationCode }}
          </td>
        </tr>
        <tr>
          <th>司机姓名</th>
          <td>{{ item.driverName }}</td>
          <th>司机电话</th>
          <td>{{ item.dirvierPhone }}</td>
          <th>车牌号</th>
          <td>{{ item.licensPlateNumber }}</td>
        </tr>
        <tr>
          <th>收货人</th>
          <td>{{ item.receiptPerson }}</td>
          <th>收货电话</th>
          <td>{{ item.receiptPhone }}</td>
          <th>总数量</th>
          <td>{{ item.totalNumber }}</td>
        </tr>
        <tr>
          <th>
            收货地址
          </th>
          <td colspan="3">
            {{ item.receiptAddress }}
          </td>
          <th>总体积</th>
          <td>{{ item.totalVolume }}</td>
        </tr>
        <tr>
          <th>调拨类型</th>
          <th>提货仓库</th>
          <th>是否紧急调拨</th>
          <th>产品名称</th>
          <th>产品型号</th>
          <th>数量</th>
          <th>备注</th>
        </tr>
        <tr v-for="material in item.allocationOrderDetailList" :key="material.id">
          <td>{{ allotType[item.allocationType] }}</td>
          <td>{{ item.pickWarehouseName }}</td>
          <td>{{ material.isUrgent }}</td>
          <td>{{ material.materialName }}</td>
          <td>{{ material.materialSpecification }}</td>
          <td>{{ material.number }}</td>
          <td>{{ material.comment }}</td>
        </tr>
      </table>
      <div class="foot">
        <div :id="'printDate' + item.allocationCode" class="sub">
          制单日期:
        </div>
        <div class="sub">
          打印次数: {{ item.numberOfPrints }}
        </div>
        <div class="sub">
          制单人: {{ nickName }}
        </div>
      </div>
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
import { getTime } from '@/applications/warehouse/public/jxRequest/index'
import { onBeforeMount, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AllotSlipDataSource, loading } from '@/applications/warehouse/utils/allotSlip/index'
import { ElMessage } from 'element-plus'
const router = useRouter()
const route = useRoute()
let allotSlipDataSource = ref(null)
let nickName = JSON.parse(sessionStorage.getItem('userInfo')).nickName
let printAllotData = ref(JSON.parse(sessionStorage.getItem('printAllotData')))
let printAllotNumArr = ref(JSON.parse(sessionStorage.getItem('printAllotNumArr')))
let allotType = {
  BIG_TO_PRE: "大仓至前置仓",
  PRE_TO_BIG: "前置仓至大仓",
  PRE_TO_PRE: "前置仓平调"
}
let tableData = reactive([])
let iutputDataSource = ref(null)
let customList = reactive({})
let totalNum = ref(0)
onBeforeMount(() => {
  if (!allotSlipDataSource.value) {
    allotSlipDataSource.value = new AllotSlipDataSource({})
  }

  getData()
})

const getData = async () => {

  let params = []
  params = printAllotData.value

  params.forEach(item => {
    let allocationOrderCode = item
    allotSlipDataSource.value.getOne(allocationOrderCode).then(res => {
      if (res.code === 200) {
        tableData.push(res.data)

      } else {
        ElMessage.error(res.message)
      }

    })
  })
}
const close = () => {
  window.close()
}
const printTable = async () => {
  await makeBarcode()
  tableData.forEach(item => {
    item.numberOfPrints++
  })
  let params = tableData.map(item => {return item.allocationCode})
  allotSlipDataSource.value.printAllotNum(params)
  let time = getTime()
  printAllotData.value.forEach(item => {
    let id2 = 'printDate' + item
    document.getElementById(id2).innerHTML = "打印日期:" + time
  })
  setTimeout(() => {
    document.getElementById('handle_area').style.display = 'none'
    window.print()
    document.getElementById('handle_area').style.display = 'block'
  }, 1000)
}

const makeBarcode = async () => {
  printAllotData.value.forEach(item => {
    JsBarcode('#barcode' + item, item, {
      format: "CODE128", //条形码格式
      height: 35
    })
  })
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
        justify-content: space-around;
        .title {
        text-align: right;
        width: 54%;
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