<template>
  <div v-loading="loading" class="main">
    <div
      v-for="(item,index) in tableData"
      :key="item.inWarehouseCode"
      class="print_area"
    >
      <div class="top_area">
        <div class="title">
          嘉贤物流入库单
        </div>
        <div class="code">
          <img :id="'barcode' + item.inWarehouseCode">
        </div>
      </div>
      <table
        class="table"
        borderSpacing="0" cellspacing="0"
        border="1" cellpadding="5" bordercolor="black"
      >
        <tr>
          <td>入库日期:</td>
          <td :id="'outWarehouseDate' + item.inWarehouseCode" />
          <td>入库单号:</td>
          <td colspan="3">
            {{ item.inWarehouseCode }}
          </td>
        </tr>
        <tr>
          <td>入库类型</td>
          <td>{{ inputType[item.inputType] }}</td>
          <td>总数量</td>
          <td colspan="3">
            {{ item.totalNum }}
          </td>
        </tr>
        <tr>
          <td>物料代码</td>
          <td>规格型号</td>
          <td>类型</td>
          <td>入库数量</td>
          <td>备注</td>
        </tr>
        <tr v-for="inputData in item.inWarehouseData" :key="inputData.materialCode">
          <td>{{ inputData.materialCode }}</td>
          <td>{{ inputData.materialSpecification }}</td>
          <td>{{ inputData.materialType }}</td>
          <td>{{ inputData.shouldInNumber }}</td>
          <td>{{ inputData.comment }}</td>
        </tr>
      </table>
      <div class="foot">
        <div :id="'printDate' + item.inWarehouseCode" class="sub">
          制单日期:
        </div>
        <div class="sub">
          打印次数: {{ item.printNum }}
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
import { IutputDataSource, loading } from '@/applications/warehouse/utils/input/index'
import { ElMessage } from 'element-plus'
const router = useRouter()
const route = useRoute()
let nickName = JSON.parse(sessionStorage.getItem('userInfo')).nickName
let printInWarehouseData = ref(JSON.parse(sessionStorage.getItem('printInputData')))
let printInputType = ref(JSON.parse(sessionStorage.getItem('printInputType')))
let printInputNumArr = ref(JSON.parse(sessionStorage.getItem('printInputNumArr')))
let inputType = {
  ALLOCATION: "调拨入库",
  SALE_RETURN: "销售订单退货"
}
let tableData = reactive([])
let iutputDataSource = ref(null)
let customList = reactive({})
let totalNum = ref(0)
onBeforeMount(() => {
  if (!iutputDataSource.value) {
    iutputDataSource.value = new IutputDataSource({
      selectUri: ''
    })
  }
  getData()
})

const getData = async () => {
  let type = printInputType.value
  let params = []
  params = printInWarehouseData.value

  for (let j = 0; j < params.length ;j++){
    let request = { inWarehouseCode: params[j] }
    let res = await iutputDataSource.value.printInputSlip(request)
    let temp = {
      inWarehouseCode: params[j],
      inWarehouseData: res
    }
    let totalNum = 0
    let inputType = type[j]
    res.forEach(item => {
      totalNum += item.shouldInNumber
    })
    temp['totalNum'] = totalNum
    temp['inputType'] = inputType
    temp['printNum'] = printInputNumArr.value[j]
    tableData.push(temp)
  }
  console.log(tableData)

  setTimeout(() => {
    makeBarcode()
  }, 0)
}
const close = () => {
  window.close()
}
const printTable = () => {
  tableData.forEach(item => {
    item.printNum++
  })
  let parmas = tableData.map(item => {return item.inWarehouseCode})
  iutputDataSource.value.printInputNum(parmas)
  let time = getTime()
  printInWarehouseData.value.forEach(item => {
    let id = 'outWarehouseDate' + item
    document.getElementById(id).innerHTML = time
    let id2 = 'printDate' + item
    document.getElementById(id2).innerHTML = "制单日期:" + time
  })
  setTimeout(() => {
    document.getElementById('handle_area').style.display = 'none'
    window.print()
    document.getElementById('handle_area').style.display = 'block'
  }, 1000)
}

const makeBarcode = () => {
  printInWarehouseData.value.forEach(item => {
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