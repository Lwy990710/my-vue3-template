<template>
  <div class="content">
    <goBack :back-config="backConfig" />
    <div class="check mt20 ml20">
      <el-select
        v-model="job" class="m-2"
        placeholder="选择职位"
        @change="jobChange"
      >
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-button
        type="warning"
        class="ml30"
        :loading="loading"
        @click="save"
      >
        保存
      </el-button>
    </div>
    <div class="per-content">
      <div class="title">
        <div
          style="width:100px"
          class="header-item"
        >
          <span
            style="width:50px;color:orange"
            class="title-item"
          >
            职位ID
          </span>
        </div>
        <div
          style="width:500px"
          class="header-item"
        >
          <span
            style="color:orange"
            class="title-item"
          >
            应用表
          </span>
        </div>
        <div
          class="header-item"
        >
          <span
            style="color:orange"
            class="title-item"
          >
            组别
          </span>
        </div>
        <div
          class="header-item"
        >
          <span
            style="color:orange"
            class="title-item"
          >
            ruleField
          </span>
        </div>
        <div
          class="header-item"
        >
          <span
            style="color:orange"
            class="title-item"
          >
            expression
          </span>
        </div>
        <div
          class="header-item"
        >
          <span
            style="color:orange"
            class="title-item"
          >
            表达式值
          </span>
        </div>
      </div>
      <VueDraggableNext
        v-loading="loading"
        :disabled="editMsg.row!==-1&&editMsg.column!==-1"
        :list="dataList"
        chosen-class="chosen"
        group="name"
        force-fallback="true"
        animation="500"
        :fallback-tolerance="4"
        @start="drag = true"
        @end="end"
      >
        <transition-group>
          <div
            v-for="element,idx in dataList" :key="element.toString()"
            class="title"
          >
            <div
              style="width:100px"
              class="header-item" :title="element.jobId"
            >
              <el-input
                v-if="editMsg.row===idx&&editMsg.column===1"
                v-model="element.jobId"
                placeholder="Please input" clearable
                autofocus
                @blur="blur"
              />
              <span v-else> {{ element.jobId?element.jobId:'-' }} </span>
            </div>
            <div
              style="width:500px"
              class="header-item" :title="element.ruleTable"
              @dblclick="editRow(2,idx,element)"
            >
              <el-input
                v-if="editMsg.row===idx&&editMsg.column===2"
                v-model="element.ruleTable"
                placeholder="Please input" clearable
                autofocus
                @blur="blur"
              />
              <span v-else> {{ element.ruleTable?element.ruleTable:'-' }} </span>
            </div>
            <div
              class="header-item" :title="element.groupCode"
              @dblclick="editRow(3,idx,element)"
            >
              <el-input
                v-if="editMsg.row===idx&&editMsg.column===3"
                v-model="element.groupCode"
                placeholder="Please input" clearable
                autofocus
                @blur="blur"
              />
              <span v-else> {{ element.groupCode?element.groupCode:'-' }} </span>
            </div>
            <div
              class="header-item" :title="element.ruleField"
              @dblclick="editRow(4,idx,element)"
            >
              <el-input
                v-if="editMsg.row===idx&&editMsg.column===4"
                v-model="element.ruleField"
                placeholder="Please input" clearable
                autofocus
                @blur="blur"
              />
              <span v-else> {{ element.ruleField?element.ruleField:'-' }} </span>
            </div>
            <div
              class="header-item" :title="element.expression"
              @dblclick="editRow(5,idx,element)"
            >
              <el-input
                v-if="editMsg.row===idx&&editMsg.column===5"
                v-model="element.expression"
                placeholder="Please input" clearable
                autofocus
                @blur="blur"
              />
              <span v-else> {{ element.expression?element.expression:'-' }} </span>
            </div>
            <div
              class="header-item" :title="element.expressionValue"
              @dblclick="editRow(6,idx,element)"
            >
              <el-input
                v-if="editMsg.row===idx&&editMsg.column===6"
                v-model="element.expressionValue"
                placeholder="Please input" clearable
                autofocus
                @blur="blur"
              />
              <span v-else> {{ element.expressionValue?element.expressionValue:'-' }} </span>
            </div>
          </div>
        </transition-group>
      </VueDraggableNext>
    </div>
    <div
      class="btn"
      @click="append"
    >
      <el-icon class="mr10">
        <Plus />
      </el-icon>追加一条记录
    </div>
  </div>
</template>

<script setup>
import { VueDraggableNext } from 'vue-draggable-next'
import goBack from '@/components/common/goBack.vue'
import { ElMessage } from 'element-plus'
import { ref, onBeforeMount, reactive } from 'vue'
import { utilsPer, loading } from '../../utils/permissionSetting'
import { useRouter } from 'vue-router'
let backConfig = [{ title: '权限管理', path: '' }, { title: '数据权限', path: '' }]
const router = useRouter()
let utils = ref(null)
let options = reactive([])
let allPer = reactive([])
const drag = ref(false)
const end = (val) => {
  drag.value = false
}
onBeforeMount(async () => {
  utils.value = new utilsPer()
  utils.value.getJob().then(res => {
    let list = res.map(item => {
      let temp = {
        value: item.id,
        label: item.name + ' ' + item.id
      }
      return temp
    })
    options.push(...list)
  })
})
const job = ref('')
const jobId = ref(0)
const dataList = reactive([])
const jobChange = async (val) => {
  jobId.value = val
  let ctx = await utils.value.getDataRule(val)
  dataList.length = 0
  dataList.push(...ctx)
  console.log(ctx)
}

const header = [
  { label: '职位ID' }, { label: '应用表' }, { label: '组别' }, { label: 'ruleField' }, { label: 'expression' }, { label: '表达式值' }
]

const editMsg = reactive({
  column: -1,
  row: -1
})

const editRow = (column, row, rowData) => {
  editMsg.row = row
  editMsg.column = column
  console.log(column, row, rowData)
}
const blur = () => {
  editMsg.row = -1
  editMsg.column = -1
}
const append = () => {
  dataList.push({
    jobId: jobId.value,
    expression: '',
    expressionValue: '',
    groupCode: '',
    ruleField: '',
    ruleTable: ''
  })
}

const save = async () => {
  let ctx = await utils.value.setDataRule(jobId.value, dataList)
  if (ctx.code === 200) {
    if (jobId.value) jobChange(jobId.value)
    ElMessage.success('保存成功')
  }
}
</script>

<style lang="less" scoped>
.content{
padding: 10px;
background: @white;
margin: 0 auto;
.per-content{
    width: 88vw;
    margin: 50px 0;
}
.header{
    margin-top: 80px;
    width: 80vw;
    &-item{
        width: 360px;
        padding: 6px 20px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        border-right:1px solid #23aaf2;
        cursor: default;
    }
}

.title{
    display: flex;
    align-items: center;
    text-align: center;
    padding: 10px 20px;
    width: 80vw;
    margin: 0 auto ;
    border-bottom:1px solid #23aaf2;
    border-left:1px solid #23aaf2;
    border-right:1px solid #23aaf2;
}
.title:nth-child(1){
    border-top:1px solid #23aaf2;
}
.title-item{
    display: inline-block;
    width: 100px;
}
.btn{
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    width: 110px;
    padding: 10px;
    border:1px dashed #23aaf2;
    cursor: pointer;
    margin-bottom: 30px;
}
.btn:hover{
    color:#23aaf2;
}
}
</style>