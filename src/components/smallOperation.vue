<template>
  <div class="header mr60">
    <div class="header_right">
      <div>
        <el-dropdown class="flex-center">
          <span class="el-dropdown-link" :style="{color:color}">
            {{ nickName }}
            <el-icon class="el-icon--right">
              <arrow-down />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>
                <el-button
                  text style="background:transparent"
                  @click="showDialog=true"
                >
                  修改密码
                </el-button>
              </el-dropdown-item>
              <!-- <el-dropdown-item>
                <el-button
                  text style="background:transparent"
                  @click="updateTableHeader"
                >
                  更新表头
                </el-button>
              </el-dropdown-item> -->
              <el-dropdown-item>
                <el-button
                  text style="background:transparent"
                  @click="clearStorage"
                >
                  清空所有个性设置
                </el-button>
              </el-dropdown-item>
              <el-dropdown-item>
                <el-button
                  text style="background:transparent"
                  @click="isShowUserSetting=true"
                >
                  个性化
                </el-button>
              </el-dropdown-item>
              <el-dropdown-item>
                <el-button
                  text style="background:transparent"
                  @click="quit"
                >
                  退出登录
                </el-button>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <el-dialog
        v-model="showDialog" title="修改密码"
        :close-on-click-modal="false"
        :show-close="false"
        width="20%"
      >
        <template #header="{ titleId, titleClass }">
          <div class="jx-dialog-header">
            <h4 :id="titleId" :class="titleClass">
              修改密码
            </h4>
            <el-button
              class="dialog-close-btn"
              type="danger" icon="CloseBold"
              circle
              @click="closeDialog"
            />
          </div>
        </template>
        <div>
          <el-form :model="passwordData">
            <el-form-item
              label="输入旧密码" label-width="150"
              style="margin: 15px 0"
            >
              <el-input
                v-model="passwordData.oldPassword" placeholder="请输入旧密码"
                type="password"
                autocomplete="new-password"
                show-password
              />
            </el-form-item>
            <el-form-item
              label="输入新密码" label-width="150"
              style="margin: 15px 0"
            >
              <el-input
                v-model="passwordData.newPassword" placeholder="请输入新密码"
                type="password"
                autocomplete="new-password"
                show-password
              />
            </el-form-item>
            <el-form-item
              label="重复新密码" label-width="150"
              style="margin: 15px 0"
            >
              <el-input
                v-model="passwordData.pardonPassword" placeholder="请输入新密码"
                type="password"
                autocomplete="new-password"
                show-password
              />
            </el-form-item>
          </el-form>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button type="primary" @click="updatePassword">
              保存
            </el-button>
            <el-button @click="closeDialog">取消</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
    <userSetting
      :is-show="isShowUserSetting"
      title="自定义您的字体和颜色"
      @close-dialog="isShowUserSetting=false"
    />
  </div>
</template>

<script setup>
import userSetting from './public/userSetting.vue'
import { reactive, ref } from 'vue'
import { changePassword } from '@/applications/warehouse/utils/user'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useStore } from "vuex"
import MD5 from 'js-md5'
const props = defineProps({
  color: {
    type: String,
    default: '#fff'
  }
})
let isShowUserSetting = ref(false)
let nickName = JSON.parse(sessionStorage.getItem('userInfo')).nickName
let account = JSON.parse(sessionStorage.getItem('userInfo')).account
let showDialog = ref(false)
let passwordData = reactive({
  oldPassword: '',
  newPassword: '',
  pardonPassword: ''
})
const router = useRouter()
const data = reactive({
  search: '',
  isSearch: false
})

const clearStorage = () => {
  ElMessageBox.alert('是否确定清空您设置？清空后需要重新设置！', '提示', {
    type: 'warning',
    showCloseButton: true,
    confirmButtonText: '确认清空',
    callback: (action) => {
      if (action !== 'cancel') {
        localStorage.clear()
        ElMessageBox.alert('清空完成！刷新后生效', '提示', {
          type: 'success',
          confirmButtonText: '立即刷新',
          callback: (action) => {
            location.reload()
          }
        })
      }
    }
  })
}

const closeDialog = () => {
  passwordData.oldPassword = ''
  passwordData.newPassword = ''
  passwordData.pardonPassword = ''
  showDialog.value = false
}

const updatePassword = () => {
  if (passwordData.newPassword !== passwordData.pardonPassword) {
    ElMessage.error('两次输入的新密码不一致')
  } else {
    let params = {
      oldPassword: MD5('jxwl' + passwordData.oldPassword),
      newPassword: MD5('jxwl' + passwordData.newPassword),
      account
    }
    changePassword(params).then(res => {
      if (res.data.code === 1005){
        ElMessage.error('旧密码输入错误')
      } else if (res.data.code === 200) {
        ElMessage.success('密码修改成功')
        setTimeout(() => {
          router.push('/login')
        }, 1000)
      }
    })
  }
}

const updateTableHeader = () => {
  const runningProject = sessionStorage.getItem('runningProject')
  if (!runningProject) return
  else {
    if (runningProject === 'logistics'){
      let header = JSON.parse(localStorage.getItem('client-header-store'))
      let temp = {
        label: '项目类别',
        prop: 'refProjectCategory',
        width: 180,
        type: 'text',
        isShow: true,
        isFixed: false
      }
      header.logistics.tableHeader.push(temp)
      header.logistics.defaultTableHeader.push(temp)
      localStorage.setItem('client-header-store', JSON.stringify(header))
      ElMessageBox.alert('更新完成！刷新后生效', '提示', {
        type: 'success',
        confirmButtonText: '立即刷新',
        callback: (action) => {
          location.reload()
        }
      })
    } else {
      let header = JSON.parse(localStorage.getItem('warehouse-header-store'))
      header.merchantMonthBill.tableHeader.push(temp1)
      header.merchantMonthBill.defaultTableHeader.push(temp1)
      header.sale.tableHeader.push(temp2)
      header.sale.defaultTableHeader.push(temp2)
      localStorage.setItem('warehouse-header-store', JSON.stringify(header))
      ElMessageBox.alert('更新完成！刷新后生效', '提示', {
        type: 'success',
        confirmButtonText: '立即刷新',
        callback: (action) => {
          location.reload()
        }
      })
    }
  }
}

const quit = () => {
  ElMessageBox.alert('是否退出登录 ?', '提示', {
    // if you want to disable its autofocus
    // autofocus: false,
    type: 'error',
    confirmButtonText: '确定退出',
    callback: (action) => {
      if (action === 'confirm') {
        sessionStorage.clear()
        router.push('/login')
      }
    }
  })
}
</script>

<style lang="less" scoped>
.search {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-content: space-around;
    justify-content: space-evenly
}

.el-dropdown-link{
  cursor:default;
  color:#fff
}
</style>