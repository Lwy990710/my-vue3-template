<template>
  <div
    v-if="messageList.length!==0" class="icon"
    @click.stop="showMessageDialog"
  >
    <el-badge :value="noReadCount" class="item">
      <el-icon size="30">
        <Comment />
      </el-icon>
    </el-badge>
  </div>
  <div v-if="isShowMessage" class="message med box-shadow">
    <div class="handle-message">
      <div>
        <el-popconfirm
          title="确定要全部设置为已读吗？" width="220px"
          @confirm="allRead"
        >
          <template #reference>
            <el-button
              type="success"
              class="med"
              size="small"
            >
              全部已读
            </el-button>
          </template>
        </el-popconfirm>
        <el-popconfirm
          title="确定要隐藏已读吗？确定后无法恢复" width="280px"
          @confirm="allDelete"
        >
          <template #reference>
            <el-button
              type="danger"
              class="med"
              size="small"
            >
              隐藏已读
            </el-button>
          </template>
        </el-popconfirm>
      </div>
      <div>
        <el-button
          type="warning"
          class="med"
          size="small"
          @click="isShowMessage=false"
        >
          关闭
        </el-button>
      </div>
    </div>
    <div
      v-for="o in messageList" :key="o.id"
      class="box-card med"
    >
      <div class="box-card-item med">
        <el-badge
          v-if="!o.isRead" is-dot
          class="med"
        >
          <span class="box-card-item-span1">{{ o.messageTitle }}</span>
        </el-badge>
        <span v-else class="box-card-item-span1">{{ o.messageTitle }}</span>
        <span class="box-card-item-span2">{{ o.messageContent }}</span>
      </div>
      <el-button
        v-if="!o.isRead" type="success"
        class="med"
        size="small"
        @click="updateStatus(o)"
      >
        已阅
      </el-button>
      <el-popconfirm
        v-if="o.isRead"
        title="确定要隐藏吗？确定后无法恢复" width="260px"
        @confirm="deleteMessage(o)"
      >
        <template #reference>
          <el-button
            type="danger"
            class="med"
            size="small"
          >
            隐藏
          </el-button>
        </template>
      </el-popconfirm>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeMount, reactive, getCurrentInstance, h } from 'vue'
import { Message } from '@/applications/warehouse/utils/message/message'
import { ElButton } from 'element-plus'

const { proxy } = getCurrentInstance()
const isShowMessage = ref(false)
const message = ref(null)
const messageList = reactive([])
const noReadCount = ref(0)
const notify = ref(null)

onBeforeMount(() => {
  message.value = new Message()
  message.value.selectMessageList().then(res => {
    messageList.length = 0
    messageList.push(...res.data.list)
  })
  message.value.selectUnreadMessageCount().then(res => {
    noReadCount.value = res.data
    if (noReadCount.value > 0){
      if (notify.value) notify.value.close()
      notify.value = proxy.$notify({
        title: '通知',
        message: h(ElButton, { onClick: () => {showMessageDialog()}, type: 'danger', text: true }, () => '您有新的未读消息，点击查看详情'),
        duration: 0
      })
    }
  })
  setInterval(() => {
    message.value.selectUnreadMessageCount().then(res => {
      noReadCount.value = res.data
      if (+res.data > 0){
        message.value.selectMessageList().then(res => {
          messageList.length = 0
          messageList.push(...res.data.list)
        })
        if (notify.value) notify.value.close()
        notify.value = proxy.$notify({
          title: '通知',
          message: h(ElButton, { onClick: () => {showMessageDialog()}, type: 'danger', text: true }, () => '您有新的未读消息，点击查看详情'),
          duration: 0
        })
      }
    })
  }, 1800000)
})

const updateStatus = ({ id }) => {
  message.value.updateStatus([id]).then(res => {
    if (res.code === 200){
      message.value.selectMessageList().then(res => {
        messageList.length = 0
        messageList.push(...res.data.list)
      })
      message.value.selectUnreadMessageCount().then(res => {
        noReadCount.value = res.data
      })
    }
  })
}

const deleteMessage = ({ id }) => {
  message.value.deleteMessage([id]).then(res => {
    if (res.code === 200){
      message.value.selectMessageList().then(res => {
        messageList.length = 0
        messageList.push(...res.data.list)
        if (messageList.length === 0){
          isShowMessage.value = false
        }
      })
      message.value.selectUnreadMessageCount().then(res => {
        noReadCount.value = res.data
      })
    }
  })
}

const showMessageDialog = () => {
  isShowMessage.value = !isShowMessage.value
  if (notify.value) notify.value.close()
  message.value.selectMessageList().then(res => {
    messageList.length = 0
    messageList.push(...res.data.list)
  })
}

const allRead = () => {
  const params = messageList.map(item => item.id)
  message.value.updateStatus(params).then(res => {
    if (res.code === 200){
      message.value.selectMessageList().then(res => {
        messageList.length = 0
        messageList.push(...res.data.list)
        if (messageList.length === 0){
          isShowMessage.value = false
        }
      })
      message.value.selectUnreadMessageCount().then(res => {
        noReadCount.value = res.data
      })
    }
  })
}

const allDelete = () => {
  let params = messageList.filter(item => item.isRead)
  params = params.map(item => item.id)
  message.value.deleteMessage(params).then(res => {
    if (res.code === 200){
      message.value.selectMessageList().then(res => {
        messageList.length = 0
        messageList.push(...res.data.list)
        if (messageList.length === 0){
          isShowMessage.value = false
        }
      })
      message.value.selectUnreadMessageCount().then(res => {
        noReadCount.value = res.data
      })
    }
  })
}
</script>

<style lang="less" scoped>
.icon{
  position: fixed;
  top: 7vh;
  left: 94vw;
  display: flex;
  padding: 10px;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  font-size: 18px;
  z-index: 2001;
  opacity: .9;
  cursor: pointer;
}
.message{
  position: fixed;
  top: 12vh;
  left: 68vw;
  width: 500px;
  z-index: 2001;
  background: white;
  border-radius: 10px;
  opacity: 0;
  overflow-y: scroll;
  animation-name: showMessage;
  animation-duration: .5s;
  animation-fill-mode:forwards;
  animation-timing-function:linear;
  scrollbar-color: #e5e5e5 #f7f7f9; /* 滑块颜色  滚动条背景颜色 */
  scrollbar-width: thin; /* 滚动条宽度有三种：thin、auto、none */
}
::-webkit-scrollbar{
  width: 4px;
  background: #eff1f2;
  border: 12px;
  height: 4px;
}
.box-card{
  padding:  16px 20px;
  z-index: 2001;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
}
.box-card-item{
  display: flex;
  flex-direction: column;
}
.box-card-item-span1{
  font-size: 14px;
  color: orange;
}
.box-card-item-span2{
  font-size: 14px;
  color: #5f6368;
  display: inline-block;
  width: 400px;
}
@keyframes showMessage{
  from{
    opacity: 0;
    height: 0px;
  }
  to{
    opacity: 1;
    height: 400px;
  }
}
.handle-message{
  display: flex;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px dashed #ebeef5;
  background: #f6f6f6;
}
</style>