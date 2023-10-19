<template>
  <div class="login">
    <div v-loading="loading" class="login-box">
      <span class="mb10">嘉贤物流 欢迎您</span>
      <el-form label-width="70px" :model="user">
        <el-form-item label="用户名">
          <el-input
            v-model="user.userName"
            clearable
            style="width:220px"
          />
        </el-form-item>
        <el-form-item label="密码">
          <el-input
            v-model="user.password"
            type="passworld"
            clearable
            show-password
            style="width:220px"
          />
        </el-form-item>
        <el-form-item label-width="12px">
          <div style="width: 100%;text-align: center;">
            <el-button
              class="logn-btn"
              type="primary"
              @click="login"
            >
              登 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 录
            </el-button>
            <el-button
              class="logn-btn"
              type="danger"
              @click="back"
            >
              返 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 回
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import MD5 from 'js-md5'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { reactive } from 'vue'
import { loading, userLogin, getResourse } from '../../utils/login/index'

const router = useRouter()

let user = reactive({
  userName: '',
  password: ''
})

const login = async () => {
  if (user.userName === '' || user.password === '') {
    ElMessage.error({
      message: '用户名或密码不能为空'
    })
  } else {
    /** 请求校验 */
    let params = {
      account: user.userName,
      password: MD5('jxwl' + user.password)
    }
    params.account = 'JXS' + user.userName
    userLogin(params).then(res => {
      if (res){
        getResourse().then(res => {
          let { data: { data } } = res
          sessionStorage.setItem('userPermissions', JSON.stringify(data))
          ElMessage({
            message: '登录成功',
            type: 'success'
          })
          router.push('/padSaleOrders')
        }).catch(err => {
          ElMessage.error('当前账号没设置权限，无法登录')
        })
      } else return
    })
  }
}

const back = () => {
  router.push('/')
}
</script>

<style lang="less" scoped>
.login {
  width: 100%;
  height: 100vh;
  background: #051c47;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  .login-box{
    background: #e9e9e9;
    width: 500px;
    height: 300px;
    border-radius: 18px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
}
</style>