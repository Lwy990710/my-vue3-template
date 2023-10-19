<template>
  <div class="mt10 content mb30">
    <el-card
      class="box-card mt10"
    >
      <div>
        <div
          v-for="item,idx in data" :key="item.id"
          class="card-content"
        >
          <span class="hidden" style="width:22%">物料代码:{{ item.materialCode }}</span>
          <span class="hidden" style="width:60%">规格型号:{{ item.materialSpecification }}</span>
          <span class="hidden" style="width:12%">品质:{{ item.materialStatus ==='GOOD'?'良品':'不良品' }}</span>
          <span style="width:10%">数量:{{ item.deliveredNumber }}</span>
          <el-button
            type="danger" text
            @click="handleDelete(idx)"
          >
            删除
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import saleDetails from './saleDetails.vue'
import { ref } from "vue"

const _props = defineProps({
  data: {
    data: Array,
    default: () => {
      return []
    }
  }
})

const _emits = defineEmits(['delete'])

const handleDelete = (idx) => {
  _emits('delete', idx)
}
</script>

<style lang="less" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}
.card-header-left{
  display: flex;
  flex-direction: column;
}
.card-content{
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  align-items: center;
}
</style>