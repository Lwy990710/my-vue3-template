<template>
  <div>
    <!--     <vue-particles
      color="#f0f0f0"
      :particle-opacity="0.7"
      :particles-number="100"
      shape-type="circle"
      :particle-size="4"
      lines-color="#f0f0f0"
      :lines-width="0"
      :line-linked="false"
      :line-opacity="1"
      :lines-distance="80"
      :move-speed="3"
      :hover-effect="false"
      hover-mode="grab"
      :click-effect="false"
      click-mode="bubble"
    /> -->
    <div class="background">
      <div v-loading="loading" class="login_box">
        <div class="login_title">
          仓储系统
        </div>
        <div class="form_area">
          <el-form label-width="70px" :model="user">
            <el-form-item label="用户名" style="color:#fff">
              <el-input
                v-model="user.userName"
                clearable
                placeholder="输入用户名"
              />
            </el-form-item>
            <el-form-item label="密码">
              <el-input
                v-model="user.password"
                type="passworld"
                placeholder="输入密码"
                clearable
                show-password
                @keyup.enter="login"
              />
            </el-form-item>
            <el-form-item label-width="12px">
              <div style="width: 100%;text-align: center;">
                <div style="display:flex;justify-content: space-around;">
                  <div>
                    <el-button
                      style="height: 40px;line-height: 40px;"
                      class="logn-btn"
                      type="primary"
                      @click="login"
                    >
                      登 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 录
                    </el-button>
                  </div>
                  <div>
                    <el-button
                      class="register-btn"
                      style="height: 40px;line-height: 40px;"
                      @click="openDialog"
                    >
                      注&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 册
                    </el-button>
                  </div>
                </div>
                <div>
                  <el-button text @click="switchPad">
                    切换平板简易模式
                  </el-button>
                </div>
              </div>
            </el-form-item>
          </el-form>
          <div style="float:right;">
            <el-checkbox
              v-model="isShops"
              style="color:#222222;font-size: bold;" label="商家"
              border
            />
          </div>
        </div>
      </div>
    </div>
    <el-dialog
      v-model="showDialog" title="注册"
      center width="350" :show-close="false"
    >
      <el-form
        ref="resigterForm"
        style="margin-top: 8px;" :model="formData"
        :rules="rules"
      >
        <el-form-item
          style="border-bottom: none;" label="手机号"
          prop="phone"
        >
          <el-input
            v-model="formData.phone"
            style="box-shadow: 0 0 0 1px #dcdfe6 inset;border-radius: 5px;"
            placeholder="输入手机号"
          />
        </el-form-item>
        <el-form-item
          style="border-bottom: none;" label="用户名"
          prop="username"
        >
          <el-input
            v-model="formData.username"
            style="box-shadow: 0 0 0 1px #dcdfe6 inset;border-radius: 5px;"
            placeholder="输入用户名"
          />
        </el-form-item>
        <el-form-item
          style="border-bottom: none;" label="密码"
          prop="password"
        >
          <el-input
            v-model="formData.password"
            style="box-shadow: 0 0 0 1px #dcdfe6 inset;border-radius: 5px;"
            type="password"
            clearable placeholder="输入密码"
          />
        </el-form-item>
        <el-form-item
          style="border-bottom: none;" label="验证码"
          prop="code"
        >
          <el-input
            v-model="formData.code"
            style="width: 50%;box-shadow: 0 0 0 1px #dcdfe6 inset;border-radius: 5px;margin-right: 8px;"
            placeholder="输入验证码"
          />
          <el-button
            v-if="allowSend" type="primary"
            @click="sendCode"
          >
            发送验证码
          </el-button>
          <el-button v-else disabled>
            {{ `重新发送(${count})` }}
          </el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="register">
            确定
          </el-button>
          <el-button @click="showDialog = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import MD5 from 'js-md5'
import { ElMessage } from 'element-plus'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { reactive, onBeforeMount, onMounted, ref, getCurrentInstance } from 'vue'
import { loading, userLogin, userRegister, getResourse } from '../utils/login/index'
let { proxy } = getCurrentInstance()
const router = useRouter()
let isPro = process.env.VUE_APP_TITLE === 'pro'
let title = process.env.VUE_APP_TITLE !== 'pro' ? '你不可以凶我' : '嘉贤-仓储'
let sayWord = process.env.VUE_APP_TITLE !== 'pro' ? '你不可以凶我' : '欢迎您！'
let loadPic = ref(require(process.env.VUE_APP_TITLE !== 'pro' ? '../../../../public/assets/images/login/test.png' : '../../../../public/assets/images/login/login-pic1.png'))
let user = reactive({
  userName: '',
  password: ''
})
const isShops = ref(false)
let showDialog = ref(false)
let allowSend = ref(true)
let count = ref(10)
const rules = {
  phone: [{ required: true, message: '手机号不能为空', trigger: 'blur' },
    { min: 11, max: 11, message: '请输入符合格式的手机号', trigger: 'blur' }],
  username: [{ required: true, message: '用户名不能为空', trigger: 'blur' }],
  code: [{ required: true, message: '验证码不能为空', trigger: 'blur' }],
  password: [{ required: true, message: '密码不能为空', trigger: 'blur' }]
}
onMounted(() => {
  user.userName = ''
  user.password = ''
  isShops.value = false
})
let formData = reactive({
  phone: '',
  username: '',
  code: '',
  password: ''
})
let interval = ref(null)

// 登录
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
    if (isShops.value) params.account = 'JXS' + user.userName
    userLogin(params).then(res => {
      if (res){
        getResourse().then(res => {
          let { data: { data } } = res
          sessionStorage.setItem('userPermissions', JSON.stringify(data))
          ElMessage({
            message: '登录成功',
            type: 'success'
          })
          router.push('/home')
        }).catch(err => {
          ElMessage.error('当前账号没设置权限，无法登录')
        })
      } else return
    })
  }

  // 注册用的
  // let psw = MD5('jxwl' + user.password)
  // let params =
  // {
  //   "account": user.userName,
  //   "nickName": "测试专用",
  //   "password": psw
  // }
  // userRegister(params).then(res => {
  //   console.log(res)
  // })

}

const openDialog = () => {
  showDialog.value = true
}

const switchPad = () => {
  router.push('/padHome')
}

const go = () => {
  window.open("https://logistics.jiaxianwuliu.com:80/")
}

const countDown = () => {
  if (!interval.value) {
    interval.value = setInterval(() => {
      allowSend.value = false
      if (count.value > 0) {
        count.value--
      }
      if (count.value === 0) {
        allowSend.value = true
        clearInterval(interval.value)
        interval.value = null
        count.value = 10
      }
    }, 1000)
  }
}

const sendCode = () => {
  countDown()
}

const register = () => {
  proxy.$refs.resigterForm.validate((valid, fields) => {
    if (valid) {
      let params = Object.assign({}, formData)
      params['password'] = MD5(params['password'])
      console.log(params)
    } else {
      console.log('error submit!', fields)
    }
  })
}
</script>

<style lang="less" scoped>
  .background {
    background:#1f2430;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .login_box{
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    border-radius: 15px;
    box-shadow: 0 0 5px #f0f0f0;
    background-color: #f0f0f0;
    width: 400px;
    height: 600px;
    &-img{
      position: absolute;
      top: -36px;
      left: 22%;
    }
  }
  .login_title, .message_title {
    z-index: 10;
    font-size: 24px;
    font-weight: bold;
    color: #222222;
  }
  .form_area {
    margin-top: 40px;
    z-index: 10;
  }
  :deep(.el-input__wrapper){
    box-shadow: none;
    background: none;
    padding: 1px 6px;
  }
  .logn-btn ,.message_link{
    font-weight: 700;
    margin-top: 10px;
    width: 120px;
    height: 36px;
    border-radius: 16px;
    color: #fff;
    background: #1f2430;
    border:none;
  }

  .register-btn{
    font-weight: 700;
    margin-top: 10px;
    width: 120px;
    height: 36px;
    border-radius: 16px;
  }

  .message_link{
    height: 40px;
    width: 180px;
  }
  :deep(.el-form-item:nth-child(1)),:deep(.el-form-item:nth-child(2)){
    width: 300px;
    border-bottom: 1px solid #222222;
    .el-form-item__label{
      text-align: center;
      color: #222222;
    }
  }
  :deep input::-webkit-input-placeholder {
    color: #222222;
    font-size: 15px;
  }

  :deep input:-webkit-autofill {
  -webkit-box-shadow:0 0 0px 1000px white inset;
  -webkit-text-fill-color: #222222;
}
:deep .el-input__inner {
  color: #222; /* 设置字体颜色 */
}
</style>

<style>
  .particles-js-canvas-el {
    width: 100%;
    height: 100%;
    position: absolute;
  }
</style>