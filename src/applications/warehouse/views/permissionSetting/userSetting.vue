<template>
  <div class="content">
    <goBack :back-config="backConfig" />
    <div class="data-filter">
      <data-filter
        :filter-items="perData.tableHeader"
        @search="perData.search($event,perData,proxy.$refs.table)"
      />
    </div>
    <div
      class="btn"
      @click="append"
    >
      <el-icon class="mr10">
        <Plus />
      </el-icon>追加一条记录
    </div>
    <v-table
      ref="table"
      need-end-handle
      :total="perData.total"
      :current-page="perData.currentPage"
      :page-size="perData. pageSize"
      :table-data="perData.tableData"
      :columns="perData.tableHeader"
      :loading="loading&&!isShow&&!isShowSelectOrg&&!isShowSelectJob"
      @selectionChange="perData.selectionChange($event,perData,proxy.$refs.table)"
      @refresh="perData.initData(perData)"
      @editRow="goCompile"
      @deleteRow="deleteRecord"
      @current-change="perData.currentPageChange($event,perData,proxy.$refs.table)"
      @sizeChange="perData.pageSizeChange($event,perData,proxy.$refs.table)"
      @editTableHeader="isShowEditTableHeader = true"
    />
    <selectDialogForm
      ref="dialogForm"
      width="44%"
      :form-data="formData"
      :is-show="isShow"
      :title="'请输入账号信息'"
      :form-el="formEl"
      @close-dialog="isShow=false"
      @emitOpenDialog="emitOpenDialog"
      @inputDone="inputDone"
    />
    <selectDialogTable
      ref="orgDialog"
      :is-show="isShowSelectOrg"
      :width="'50%'"
      :data-source="orgData"
      :title="'选择组织'"
      small
      :is-show-search-input="false"
      :loading="false"
      @close-dialog="isShowSelectOrg=false"
      @chooseRow="chooseRowOrg"
    />
    <selectDialogTable
      ref="jobDialog"
      :is-show="isShowSelectJob"
      :width="'50%'"
      :data-source="jobData"
      :title="'选择职位'"
      small
      :is-show-search-input="false"
      :loading="false"
      @close-dialog="isShowSelectJob=false"
      @chooseRow="chooseRowJob"
    />
  </div>
</template>

<script setup>
import selectDialogTable from '@/components/common/selectDialogTable.vue'
import selectDialogForm from '@/components/common/selectDialogForm.vue'
import VTable from '@/components/public/virtualTable.vue'
import goBack from '@/components/common/goBack.vue'
import dataFilter from '@/components/common/dataFilter.vue'
import { ref, onBeforeMount, reactive, getCurrentInstance } from 'vue'
import { utilsPer, loading } from '../../utils/permissionSetting'
let backConfig = [{ title: '权限管理', path: '' }, { title: '账号管理', path: '' }]
const perData = ref(null)
const orgData = ref(null)
const jobData = ref(null)
const isShow = ref(false)
const isShowSelectOrg = ref(false)
const isShowSelectJob = ref(false)
const { proxy } = getCurrentInstance()
onBeforeMount(() => {
  if (!perData.value) perData.value = new utilsPer({
    selectUri: `/user/select`,
    tableHeader: [
      {
        title: "orgId",
        key: "orgId",
        dataKey: "orgId",
        width: 180,
        isShow: true,
        isFixed: true,
        type: 'text'
      }, {
        title: "jobId",
        key: "jobId",
        dataKey: "jobId",
        width: 180,
        isShow: true,
        isFixed: true,
        type: 'text'
      }, {
        title: "account",
        key: "account",
        dataKey: "account",
        width: 260,
        isShow: true,
        isFixed: false,
        type: 'text'
      }, {
        title: "nickName",
        key: "nickName",
        dataKey: "nickName",
        width: 260,
        isShow: true,
        isFixed: false,
        type: 'text'
      }, {
        title: "password",
        key: "password",
        dataKey: "password",
        width: 270,
        isShow: true,
        isFixed: false,
        type: 'text'
      }, {
        title: "type",
        key: "type",
        dataKey: "type",
        width: 260,
        isShow: true,
        isFixed: false,
        type: 'text'
      }, {
        title: "createTime",
        key: "createTime",
        dataKey: "createTime",
        width: 260,
        isShow: true,
        isFixed: false,
        type: 'none'
      }, {
        title: "updateTime",
        key: "updateTime",
        dataKey: "updateTime",
        width: 260,
        isShow: true,
        isFixed: false,
        type: 'none'
      }
    ],
    deleteUri: `/user/delete`
  })
  perData.value.initData()

  //   perData.value.getOrg().then(res => {
  //     console.log(res)
  //   })
  //   perData.value.getJobId().then(res => {
  //     console.log(res)
  //   })

})

const deleteRecord = (val) => {
  let params = {
    user: val
  }
  proxy.$alert('是否确认删除数据', '提示', {
    type: 'error',
    showCancelButton: true,
    cancelButtonText: '再想想',
    confirmButtonText: '确认删除',
    confirmButtonClass: 'delete-confirm-btn',
    callback: (action) => {
      if (action === 'cancel') return
      else {
        perData.value.delete(params).then(res => {
          if (res === 200) proxy.$message.success('删除成功')
          else proxy.$message.error(res)

        })
      }
    }
  })

}

const formEl = reactive([
  {
    label: 'orgId',
    element: 'input',
    type: 'dialog',
    prop: 'orgId'
  }, {
    label: 'jobId',
    element: 'input',
    type: 'dialog',
    prop: 'jobId'
  }, {
    label: 'account',
    element: 'input',
    type: 'text',
    prop: 'account'
  }, {
    label: 'nickName',
    element: 'input',
    type: 'text',
    prop: 'nickName'
  }, {
    label: 'type',
    element: 'input',
    type: 'text',
    prop: 'type'
  }, {
    label: 'password',
    element: 'input',
    type: 'textarea',
    prop: 'password'
  }
])

const formData = reactive({
  orgId: '',
  jobId: '',
  account: '',
  nickName: '',
  password: '',
  type: ''
})
const isAdd = ref(true)
const goCompile = (val) => {
  isShow.value = true
  isAdd.value = false
  Object.assign(formData, val)
}

const append = () => {
  Object.assign(formData, {
    orgId: '',
    jobId: '',
    account: '',
    nickName: '',
    password: '',
    type: ''
  })
  isAdd.value = true
  isShow.value = true
}

const inputDone = (val) => {
  if (isAdd.value){
    if (val.type.length === 0) val.type = null
    perData.value.add(val).then(res => {
      if (res === 200){
        proxy.$message.success('创建成功')
        isShow.value = false
        perData.value.initData()
      } else proxy.$message.error(res)

    })
  } else {
    if (val.type && val.type.length === 0) val.type = null
    perData.value.update(val).then(res => {
      if (res === 200){
        proxy.$message.success('更新成功')
        isShow.value = false
        perData.value.initData()
      } else proxy.$message.error(res)

    })
  }
  perData.value.initData()
}

const emitOpenDialog = (val) => {
  if (val === 'orgId') {
    if (!orgData.value) orgData.value = new utilsPer({
      selectUri: `/org/select`,
      tableHeader: [{
        prop: "name",
        label: "name",
        width: 180
      }, {
        prop: "id",
        label: "id",
        width: 180
      }]
    })
    isShowSelectOrg.value = true
  }
  else {
    if (!jobData.value) jobData.value = new utilsPer({
      selectUri: `/job/select`,
      tableHeader: [{
        prop: "name",
        label: "name",
        width: 180
      }, {
        prop: "id",
        label: "id",
        width: 180
      }]
    })
    isShowSelectJob.value = true
  }
}

const chooseRowOrg = (val) => {
  proxy.$refs.dialogForm.updateDialogInput({ orgId: val.id })
  isShowSelectOrg.value = false
}
const chooseRowJob = (val) => {
  proxy.$refs.dialogForm.updateDialogInput({ jobId: val.id })
  isShowSelectJob.value = false
}
</script>

<style lang="less" scoped>
.content{
  width: 100%;
    background: @white;
}
.content-data{
    width: 80vw;
}
.btn{
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    width: 110px;
    padding: 8px;
    border:1px dashed #23aaf2;
    cursor: pointer;
    margin: 10px 10px;
}
.btn:hover{
    color:#23aaf2;
}
</style>