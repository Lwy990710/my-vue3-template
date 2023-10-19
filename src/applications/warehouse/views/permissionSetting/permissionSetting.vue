<template>
  <div v-loading="loading" class="content">
    <h4>设置权限</h4>
    <div class="check">
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
        v-if="job.length!==0"
        type="primary"
        class="ml30"
        :loading="loading"
        @click="save"
      >
        保存
      </el-button>
    </div>
    <div v-if="job.length!==0" class="check">
      <el-checkbox-group
        v-model="checkedPerList"
      >
        <el-checkbox
          v-for="per in allPer" :key="per.resourceName"
          :label="per.code"
          fill="red"
        >
          <span :style="per.code.indexOf('MENU')!==-1?{color:'red'}:{color:'orange'}">{{
            per.resourceName
          }}</span>
        </el-checkbox>
      </el-checkbox-group>
    </div>
    <h4 class="mt100">
      同步权限
    </h4>
    <el-checkbox
      v-model="checked1" label="同步菜单权限"
      size="large"
    />
    <el-checkbox
      v-model="checked2" label="同步数据权限"
      size="large"
    />
    <div class="changePer">
      <el-select
        v-model="jobIdOut" class="m-2"
        placeholder="将该职位权限赋值给"
      >
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-icon class="ml10 mr10">
        <Switch />
      </el-icon>
      <el-select
        v-model="jobIdin" class="m-2"
        placeholder="该职位"
      >
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-button
        type="warning" class="ml30"
        :loading="loading"
        @click="copyPer"
      >
        同步权限
      </el-button>
    </div>
    <el-button
      type="danger" class="mt30"
      @click="go('/advancedPermission')"
    >
      <el-icon class="mr10">
        <Stamp />
      </el-icon>数据权限
    </el-button>
    <el-button
      class="mt30"
      type="primary"
      @click="go('/userSetting')"
    >
      <el-icon class="mr10">
        <Avatar />
      </el-icon>帐号管理
    </el-button>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { ref, onBeforeMount, reactive } from 'vue'
import { utilsPer, loading } from '../../utils/permissionSetting'
import { useRouter } from 'vue-router'
const router = useRouter()
let utils = ref(null)
let options = reactive([])
let allPer = reactive([])
onBeforeMount(async () => {
  utils.value = new utilsPer()
  let allPers = await utils.value.getAllPer()
  allPer.length = 0
  allPer.push(...allPers)
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
const perList = reactive([])
const checkedPerList = ref([])
const jobChange = async (val) => {
  jobId.value = val
  let per = await utils.value.getPer(val)
  checkedPerList.value.length = 0
  perList.length = 0
  per.forEach(item => {
    checkedPerList.value.push(item.code)
    perList.push(item)
  })
}

const save = async () => {
  let params = checkedPerList.value.map(item => {
    let temp = {
      jobId: jobId.value,
      code: item
    }
    return temp
  })
  let ctx = await utils.value.setPer(jobId.value, params)
  if (ctx.code === 200) {
    jobChange(jobId.value)
    ElMessage.success('设置成功, 重新登录生效 !')
  }
  else ElMessage.error(ctx)
}

const jobIdOut = ref('')
const jobIdin = ref('')

const checked1 = ref(false)
const checked2 = ref(false)

const copyPer = async () => {
  if (!checked1.value && !checked2.value){
    ElMessage.error('请先选择需要同步何种权限')
    return
  }
  if (checked1.value && checked2.value){
    let ctx = await Promise.all([utils.value.copyResource(jobIdOut.value, jobIdin.value), utils.value.copyDataRule(jobIdOut.value, jobIdin.value)])
    if (ctx[0].code === 200 && ctx[1].code === 200){
      jobIdOut.value = ''
      if (jobId.value) jobChange(jobId.value)
      ElMessage.success('同步成功')
    } else ElMessage.error(ctx)
    return
  }
  let ctx
  if (checked1.value) ctx = await utils.value.copyResource(jobIdOut.value, jobIdin.value)
  else ctx = await utils.value.copyDataRule(jobIdOut.value, jobIdin.value)
  if (ctx.code === 200) {
    jobIdOut.value = ''
    jobIdin.value = ''
    if (jobId.value) jobChange(jobId.value)
    ElMessage.success('同步成功')
  }
  else ElMessage.error(ctx)
}

const go = (path) => {
  router.push(path)
}
</script>

<style lang="less" scoped>
.content{
  padding: 10px;
  height:100vh;
  background: @white;
  .check{
      margin:30px 0;
      display: flex;
      width: 86vw;
  }
}
.changePer{
  display: flex;
  align-items: center;
  margin-top: 20px;
}
</style>