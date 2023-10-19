<template>
  <div
    v-loading="loading"
    class="main"
  >
    <div
      v-for="item in tableData" :key="item.id"
      class="print_area"
    >
      <div class="top_area">
        <div class="title">
          {{ item.processStatus === 'SALE_ORDER_RETURN' ? '嘉贤物流退货单' : '嘉贤物流配送单' }}
        </div>
        <div class="code">
          <img :id="'barcode' + item.saleOrderCode">
        </div>
      </div>
      <table
        class="table"
        borderSpacing="0" cellspacing="0"
        border="1" cellpadding="5" bordercolor="black"
      >
        <tr>
          <td>商家信息</td>
          <td>商家名称</td>
          <td>{{ item.merchantName }}</td>
          <td>商家联系人</td>
          <td>{{ item.merchantLinkman }}</td>
          <td>商家联系电话</td>
          <td>{{ item.merchantPhone }}</td>
        </tr>
        <tr>
          <td rowspan="3">
            收货信息
          </td>
          <td>收货人</td>
          <td>{{ item.customerName }}</td>
          <td>收货电话</td>
          <td>{{ item.customerPhone }}</td>
          <td>要求配送时间</td>
          <td>{{ item.requireDeliveryDate }}</td>
        </tr>
        <tr>
          <td>收货地址</td>
          <td colspan="5">
            {{ item.receiptAddress }}
          </td>
        </tr>
        <tr>
          <td>备注信息</td>
          <td colspan="5">
            {{ item.comment }}
          </td>
        </tr>
        <tr>
          <td colspan="2">
            产品类型
          </td>
          <td colspan="2">
            规格型号
          </td>
          <td colspan="2">
            物料代码
          </td>
          <td>数量</td>
        </tr>
        <tr v-for="details in item['details']" :key="details.materialCode">
          <td colspan="2">
            {{ details.materialName }}
          </td>
          <td colspan="2">
            {{ details.materialSpecification }}
          </td>
          <td colspan="2">
            {{ details.materialCode }}
          </td>
          <td>{{ details.deliveredNumber }}</td>
        </tr>
        <tr>
          <td rowspan="2">
            服务项
          </td>
          <td colspan="3">
            核对型号与数量一致 （是）（否）
          </td>
          <td colspan="3">
            核对货物外包装完好 （是）（否）
          </td>
        </tr>
        <tr>
          <td colspan="3">
            送货入户 （是）（否）
          </td>
          <td colspan="3">
            送货人员是否满意 （是）（否）
          </td>
        </tr>
        <tr>
          <td>
            收货确认
          </td>
          <td>
            收货人签字：
          </td>
          <td />
          <td>
            签收件数：
          </td>
          <td />
          <td>
            签收时间；
          </td>
          <td />
        </tr>
      </table>
      <div class="foot">
        <div :id="'printDate' + item.saleOrderCode" class="sub">
          打印日期:
        </div>
        <div class="sub">
          打印次数:{{ item.printNum }}
        </div>
        <div class="sub">
          打印人: {{ nickName }}
        </div>
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
import { getTime, changeTime } from '@/applications/warehouse/public/jxRequest/index'
import { onBeforeMount, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SaleSlipDataSource, loading } from '@/applications/warehouse/utils/sale/index'
import { ElMessage } from 'element-plus'
const router = useRouter()
const route = useRoute()
let nickName = JSON.parse(sessionStorage.getItem('userInfo')).nickName
let printSaleData = ref(JSON.parse(sessionStorage.getItem('printSaleData')))
let tableData = reactive([])
let saleSlipDataSource = ref(null)
let customList = reactive({})
let totalNum = ref(0)
onBeforeMount(() => {
  if (!saleSlipDataSource.value) {
    saleSlipDataSource.value = new SaleSlipDataSource({
      selectOneUri: '/saleOrderMain/selectOne'
    })
  }
  getData()
})

const getData = async () => {
  await makeTableData()
}

const makeTableData = async () => {
  let printData = printSaleData.value
  console.log(printData)
  printData.idList.forEach((item, index) => {
    saleSlipDataSource.value.selectOne(item).then(res => {
      let temp = {}
      Object.assign(temp, res)
      temp['printNum'] = printData.printSaleSlipNumList[index]
      temp['requireDeliveryDate'] = changeTime(temp['requireDeliveryDate']).slice(0, 10)
      console.log(temp['requireDeliveryDate'])
      temp['details'] = []
      let params = { saleOrderCode: printData.saleCodeList[index] }
      saleSlipDataSource.value.searchSaleOrderDetails(params).then(res => {
        temp['details'].push(...res.list)
        tableData.push(temp)
        console.log(tableData)
      })
    })
  })

}

const close = () => {
  window.close()
}
const printTable = async () => {
  tableData.forEach(item => {
    item.printNum++
  })
  await makeBarcode()
  saleSlipDataSource.value.printSaleNum(printSaleData.value.saleCodeList)
  let time = getTime()
  printSaleData.value.saleCodeList.forEach(item => {
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
  printSaleData.value.saleCodeList.forEach(item => {
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
        font-size: 16px;
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
        font-weight: bold;
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
        font-weight: bold;
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