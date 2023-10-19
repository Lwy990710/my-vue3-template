<template>
  <div v-loading="loading" class="main">
    <div
      v-for="(item,index) in tableData"
      :key="item.outWarehouseCode"
      class="print_area"
    >
      <div class="top_area">
        <div class="title">
          嘉贤物流出库单
        </div>
        <div class="code">
          <img :id="'barcode' + item.outWarehouseCode">
        </div>
      </div>
      <table
        class="table"
        borderSpacing="0" cellspacing="0"
        border="1" cellpadding="5" bordercolor="black"
      >
        <tr>
          <td>出库日期:</td>
          <td :id="'outWarehouseDate' + item.outWarehouseCode" />
          <td>出库单号:</td>
          <td colspan="3">
            {{ item.outWarehouseCode }}
          </td>
        </tr>
        <tr>
          <td>总体积</td>
          <td>{{ item.totalVolume }}</td>
          <td>总数量</td>
          <td colspan="3">
            {{ item.totalNum }}
          </td>
        </tr>
        <tr>
          <td>备注</td>
          <td colspan="5">
            {{ item.comment }}
          </td>
        </tr>
        <tr>
          <td>物料代码</td>
          <td>规格型号</td>
          <td>类型</td>
          <td>出库数量</td>
          <td>仓位</td>
          <td>备注</td>
        </tr>
        <tr v-for="outputData in item.outWarehouseData" :key="outputData.materialCode">
          <td>{{ outputData.materialCode }}</td>
          <td>{{ outputData.materialSpecification }}</td>
          <td>{{ outputData.materialType }}</td>
          <td>{{ outputData.shouldOutNumber }}</td>
          <td>{{ outputData.warehousePositionName }}</td>
          <td>{{ outputData.comment }}</td>
        </tr>
      </table>
      <div class="foot">
        <div :id="'printDate' + item.outWarehouseCode" class="sub">
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
import { OutputDataSource, loading } from '@/applications/warehouse/utils/output/index'
import { ElMessage } from 'element-plus'
const router = useRouter()
const route = useRoute()
let nickName = JSON.parse(sessionStorage.getItem('userInfo')).nickName
let commentArr = ref(JSON.parse(sessionStorage.getItem('commentArr')))
let printOutWarehouseData = ref(JSON.parse(sessionStorage.getItem('printOutWarehouseData')))
let printOutPutNumArr = ref(JSON.parse(sessionStorage.getItem('printOutPutNumArr')))
let tableData = reactive([])
let outputDataSource = ref(null)
let customList = reactive({})
let totalNum = ref(0)
onBeforeMount(() => {
  if (!outputDataSource.value) {
    outputDataSource.value = new OutputDataSource({})
  }
  getData()
})

const getData = async () => {
  let params = []
  params = printOutWarehouseData.value
  for (let j = 0; j < params.length ;j++){
    let res = await outputDataSource.value.getOutWarehouseOrderMaterialDetail(params[j])
    let temp = {
      outWarehouseCode: params[j],
      outWarehouseData: res
    }
    let totalNum = 0
    let totalVolume = 0
    res.forEach(item => {
      totalNum += item.shouldOutNumber
      totalVolume += item.totalVolume
    })
    temp['comment'] = commentArr.value[j]
    temp['totalNum'] = totalNum
    temp['totalVolume'] = totalVolume
    temp['printNum'] = printOutPutNumArr.value[j]
    tableData.push(temp)
  }
  setTimeout(() => {
    console.log(tableData)
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
  let time = getTime()
  let parmas = tableData.map(item => {return item.outWarehouseCode})
  outputDataSource.value.printOutPutNum(parmas)
  printOutWarehouseData.value.forEach(item => {
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
  console.log(printOutWarehouseData.value, 'data')
  printOutWarehouseData.value.forEach(item => {
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