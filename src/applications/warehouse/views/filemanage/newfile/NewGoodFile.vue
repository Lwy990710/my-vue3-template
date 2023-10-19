<template>
  <div class="main">
    <div v-loading="goodLoading" class="message_area">
      <goBack :back-config="backConfig" />
      <div class="form_area">
        <div class="form_title">
          {{ route.query.id ? '编辑商品' : '新增商品' }}
        </div>
        <!--         <NewFileForm
          ref="formRef"
          :elements="goodFormData.elements"
          :model="goodData"
          @selectChange="goodSelectChange"
        /> -->
        <el-form
          ref="formRef"
          class="form_area"
          :rules="goodDataRules"
          :model="goodData" label-width="150px"
          :inline="true"
          style="width:90%;margin:0 auto;"
        >
          <el-form-item label="产品名称" prop="materialName">
            <el-input
              v-model="goodData.materialName" :disabled="materialNameIsDisabled"
              placeholder="请输入产品名称,例: 冷静王"
            />
          </el-form-item>
          <el-form-item label="套机码" prop="materialCode">
            <el-input
              v-model="goodData.materialCode" :disabled="Boolean(route.query.id)"
              placeholder="请输入套机码"
            />
          </el-form-item>
          <el-form-item label="规格型号" prop="materialSpecification">
            <el-input v-model="goodData.materialSpecification" placeholder="请输入套机码" />
          </el-form-item>
          <el-form-item label="产品类型" prop="materialType">
            <el-select
              v-model="goodData.materialType" :disabled="Boolean(route.query.id)"
              placeholder="请选择产品类型"
            >
              <el-option
                v-for="option in materialTypeOptions"
                :key="option.label"
                :label="option.label"
                :value="option.value"
              >
                {{ option.label }}
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="产品类别" prop="sort">
            <el-input
              v-model="goodData.sort" :disabled="materialNameIsDisabled"
              placeholder="请输入产品类别,例：空调"
            />
          </el-form-item>
          <el-form-item
            v-if="goodData.materialType !== '套机'" label="条码头"
            prop="barCodeHead"
          >
            <el-input v-model="goodData.barCodeHead" placeholder="请输入条码头" />
          </el-form-item>
          <el-form-item
            v-if="goodData.materialType !== '套机'" label="重量(千克)"
            prop="weight"
          >
            <el-input v-model="goodData.weight" placeholder="请输入重量(千克)" />
          </el-form-item>
          <el-form-item
            v-if="goodData.materialType !== '套机'" label="体积(立方米)"
            prop="volume"
          >
            <el-input v-model="goodData.volume" placeholder="请输入体积(立方米)" />
          </el-form-item>
        </el-form>
        <div v-show="goodData.materialType === '套机'">
          <el-divider content-position="center">
            物料信息
          </el-divider>
          <div>
            <div>
              <el-button
                type="primary"
                @click="openFittingDialog"
              >
                新增物料
              </el-button>
            </div>
            <el-dialog
              v-model="showFittingDialog" :title="title[isCompile]" center
              width="60%" @close="closeFittingDialog"
            >
              <NewFileForm
                ref="fittingFormRef"
                :elements="fittingFormData.elements"
                :model="fittingData"
                @openDialog="openOldFittingDialog"
              />
              <el-dialog
                v-model="showOldMaterialDialog" title="物料信息"
                center width="60%"
              >
                <div style="margin: 15px 0">
                  <el-input
                    v-model="searchList.materialCode" placeholder="请输入物料代码"
                    style="width:40%"
                  >
                    <template #append>
                      <el-button @click="getFittingData">
                        <el-icon><Search /></el-icon>
                      </el-button>
                    </template>
                  </el-input>
                  <span style="display:inline-block;margin-left:20px;font-size:12px;color:#f56c6c">Tips: 双击某行进行选择</span>
                </div>
                <el-table
                  highlight-current-row
                  :data="fittingTableData" border
                  :header-cell-style="{background: '#f3f4f6'}"
                  :row-style="{height: '35px'}"
                  :cell-style="{padding: '0'}"
                  @row-dblclick="chooseMaterialRow"
                >
                  <el-table-column
                    align="center" prop="materialCode"
                    label="物料代码"
                  />
                  <el-table-column
                    align="center" prop="materialSpecification"
                    label="物料型号"
                  />
                  <el-table-column
                    align="center" prop="materialType"
                    label="物料类型"
                  />
                  <el-table-column
                    align="center" prop="barCodeHead"
                    label="条码头"
                  />
                  <el-table-column
                    align="center" prop="weight"
                    label="重量"
                  />
                  <el-table-column
                    align="center" prop="volume"
                    label="体积"
                  />
                </el-table>
                <div class="page">
                  <el-pagination
                    background
                    layout="prev, pager, next"
                    :total="fittingTotal"
                    :page-size="fittingPageSize"
                    hide-on-single-page
                    @current-change="currentChange"
                  />
                </div>
              </el-dialog>
              <template #footer>
                <span class="dialog-footer">
                  <el-button type="primary" @click="putFittingData">
                    确定
                  </el-button>
                  <el-button @click="showFittingDialog = false">关闭</el-button>
                </span>
              </template>
            </el-dialog>
            <el-table
              highlight-current-row
              :row-style="{height: '35px'}"
              :cell-style="{padding: '0'}"
              :data="chooseFittingData"
              style="margin-top: 20px"
              :header-cell-style="{background:'rgb(238, 241, 246)'}"
            >
              <el-table-column
                align="center" prop="materialCode"
                label="物料代码"
              />
              <el-table-column
                align="center" prop="materialSpecification"
                label="物料型号"
              />
              <el-table-column
                align="center" prop="materialType"
                label="物料类型"
              />
              <el-table-column
                align="center" prop="barCodeHead"
                label="条码头"
              />
              <el-table-column
                align="center" prop="weight"
                label="重量"
              />
              <el-table-column
                align="center" prop="volume"
                label="体积"
              />
              <el-table-column
                align="center" prop="partNumber"
                label="净数量"
              />
              <el-table-column align="center" label="操作">
                <template #default="scope">
                  <el-button
                    text type="primary"
                    @click="compile(scope)"
                  >
                    编辑
                  </el-button>
                  <el-popconfirm
                    title="是否确定删除"
                    confirm-button-text="确定"
                    cancel-button-text="再想想"
                    @confirm="deleteRecord(scope)"
                  >
                    <template #reference>
                      <el-button text type="danger">
                        删除
                      </el-button>
                    </template>
                  </el-popconfirm>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
      <div v-if="route.query.materialType&&route.query.materialType!=='套机'" class="barcode">
        <span style="font-size:14px;color:#606266" class="mr10">
          <el-popover placement="left" width="300">
            <template #reference>
              <el-icon style="color:orange"><Warning /></el-icon>
            </template>
            <template #default>
              附加条码头列表用于一个物料多种条码的情况
            </template>
          </el-popover>
          附加条码头列表：
        </span>
        <el-tag
          v-for="barCode,idx in barCodeList"
          :key="barCode"
          class="mx-1 mr20"
          closable
          :disable-transitions="false"
          @close="handleClose(barCode)"
          @click="editRow(idx,barCode.barCodeHead)"
        >
          <el-input
            v-if="editIdx === idx"
            ref="InputRef"
            v-model="barCodeValue"
            v-focus
            class="ml-1 w-20"
            style="width:60px"
            :maxlength="5"
            size="small"
            @blur="editBlur(barCode)"
          />
          <span v-else>
            {{ barCode.barCodeHead }}
          </span>
        </el-tag>
        <el-input
          v-if="inputVisible"
          ref="InputRef"
          v-model="inputValue"
          v-focus
          class="ml-1 w-20"
          style="width:60px"
          :maxlength="5"
          size="small"
          @keyup.enter="handleInputConfirm"
          @blur="handleInputConfirm"
        />
        <el-button
          v-else class="button-new-tag ml-1"
          size="small" @click="showInput"
        >
          + 新条码头
        </el-button>
      </div>
      <el-divider
        border-style="dashed"
      />
      <div class="handle_area">
        <el-button
          v-authority="'MENU_MERCHANT_ARCHIVE_WRITE'"
          type="primary" style="margin-right:30px"
          @click="save(formRef)"
        >
          保存
        </el-button>
        <el-button type="danger" @click="cancel">
          取消
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import goBack from '@/components/common/goBack.vue'
import NewFileForm from '@/components/NewFileForm.vue'
import { onBeforeMount, reactive, ref, nextTick, getCurrentInstance } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { loading, deleteCodeHeads, updateBarCode, addMaterial, getMaterial, getMaterialById, addMaterExcel, getNestingMaterial, removeFittings, materialBarCodeHeads } from '@/applications/warehouse/utils/good/index'
import { Search } from '@element-plus/icons-vue'
const { proxy } = getCurrentInstance()
let fittingFormRef = ref(null)
let backConfig = [{ title: '档案管理', path: '' }, { title: '商品档案', path: '' }, { title: '新增商品档案', path: '' }]
let searchList = reactive({ isMaterial: 1, materialCode: '' })
let showOldMaterialDialog = ref(false)
let fittingTotal = ref(0)
let fittingTableData = reactive([])
let fittingPage = ref(1)
let fittingPageSize = ref(10)
let index = ref(-1)
let goodLoading = ref(loading)
let materialCodeIsDisabled = ref(false)
let materialNameIsDisabled = ref(false)
let materialTypeOptions = reactive([{
  label: '套机',
  value: '套机'
}, {
  label: '单机',
  value: '单机'
}])
const title = ['新增物料', '编辑物料']
let isCompile = ref(0)
let router = useRouter()
let route = useRoute()
let showFittingDialog = ref(false)
let chooseFittingData = reactive([])
let goodData = reactive({
  materialName: '',
  materialCode: '',
  materialSpecification: '',
  materialType: '',
  barCodeHead: '',
  sort: '',
  weight: 0,
  volume: 0,
  comment: ''
})
let fittingData = reactive({
  materialCode: '',
  materialSpecification: '',
  materialType: '',
  barCodeHead: '',
  weight: 0,
  volume: 0,
  comment: '',
  partNumber: 1
})
let fittingFormData = reactive({
  elements: [
    {
      element: 'dialog',
      label: '物料代码(单机)',
      prop: 'materialCode',
      rules: [{
        required: true,
        message: '物料代码不能为空',
        trigger: 'blur'
      }],
      disabled: materialCodeIsDisabled
    }, {
      label: '物料型号',
      prop: 'materialSpecification',
      rules: [{
        required: true,
        message: '物料型号不能为空',
        trigger: 'blur'
      }]
    }, {
      element: 'select',
      label: '物料类型',
      prop: 'materialType',
      options: [{
        label: '内机',
        value: '内机'
      }, {
        label: '外机',
        value: '外机'
      }, {
        label: '配件',
        value: '配件'
      }],
      rules: [{
        required: true,
        message: '物料类型不能为空',
        trigger: 'blur'
      }]
    }, {
      label: '条码头',
      prop: 'barCodeHead'
    }, {
      label: '重量(千克)',
      prop: 'weight'
    }, {
      label: '体积(立方米)',
      prop: 'volume'
    }, {
      label: '净数量',
      prop: 'partNumber',
      rules: [{
        required: true,
        message: '净数量不能为空',
        trigger: 'blur'
      }]
    }
  ]
})

let goodDataRules = reactive({
  materialName: [{ required: true, message: '产品名称不能为空', trigger: 'blur' }],
  materialCode: [{ required: true, message: '套机码不能为空', trigger: 'blur' }],
  materialSpecification: [{ required: true, message: '规格型号不能为空', trigger: 'blur' }],
  materialType: [{ required: true, message: '产品类型不能为空', trigger: 'blur' }]
})

let formRef = ref(null)

const barCodeList = reactive([])
const inputValue = ref('')
const barCodeValue = ref('')

const inputVisible = ref(false)
const handleInputConfirm = () => {
  if (inputValue.value) {
    if (String(inputValue.value).length < 5) {
      ElMessage.error('条码头不能少于五位')
      return
    }
    updateBarCode({
      materialCode: route.query.materialCode,
      barCodeHead: inputValue.value
    }).then(res => {
      if (res === 200){
        materialBarCodeHeads(route.query.materialCode).then(res => {
          barCodeList.length = 0
          barCodeList.push(...res.pageInfo.list)
        })
      } else {
        ElMessage.error(res)
      }
    })
    inputValue.value = ''
  }
  inputVisible.value = false
  inputValue.value = ''
}

const showInput = () => {
  const permissionsArr = JSON.parse(sessionStorage.getItem('userPermissions'))
  if (!permissionsArr.includes('FUNCTION_BAR_CODE_HEAD_ADD_LIST')){
    proxy.$message.error('当前没有修改条码头的权限')
    return
  }
  inputVisible.value = true
}

const editIdx = ref(-1)

const editRow = (idx, barCode) => {
  const permissionsArr = JSON.parse(sessionStorage.getItem('userPermissions'))
  if (!permissionsArr.includes('FUNCTION_BAR_CODE_HEAD_ADD_LIST')){
    proxy.$message.error('当前没有修改条码头的权限')
    return
  }
  editIdx.value = idx
  barCodeValue.value = barCode
}

const editBlur = (barCode) => {
  if (String(barCodeValue.value).length < 5) {
    ElMessage.error('条码头不能少于五位')
    return
  }
  editIdx.value = -1
  barCode.barCodeHead = barCodeValue.value
  updateBarCode(barCode).then(res => {
    if (res === 200){
      materialBarCodeHeads(route.query.materialCode).then(res => {
        barCodeList.length = 0
        barCodeList.push(...res.pageInfo.list)
      })
    } else {
      ElMessage.error(res)
    }

  })
}

const handleClose = (tag) => {
  const permissionsArr = JSON.parse(sessionStorage.getItem('userPermissions'))
  if (!permissionsArr.includes('FUNCTION_BAR_CODE_HEAD_ADD_LIST')){
    proxy.$message.error('当前没有修改条码头的权限')
    return
  }
  deleteCodeHeads(tag.id).then(res => {
    if (res === 200){
      materialBarCodeHeads(route.query.materialCode).then(res => {
        barCodeList.length = 0
        barCodeList.push(...res.pageInfo.list)
      })
    } else {
      ElMessage.error(res)
    }
  })
}

onBeforeMount(() => {
  if (route.query.materialType) {
    if (route.query.materialType !== '套机' && route.query.materialType !== '单机') {
      materialNameIsDisabled.value = true
    }
  }
  materialCodeIsDisabled.value = Boolean(route.query.id)
  if (route.query.id) {
    if (route.query.materialType !== '套机') {
      getMaterialById(route.query.id).then(res => {
        Object.keys(goodData).forEach(key => {
          goodData[key] = res[key]
        })
        goodData["id"] = res["id"]
      })
    }
    if (route.query.materialType === '套机') {
      getNestingMaterial(route.query.id).then(res => {
        Object.keys(goodData).forEach(key => {
          goodData[key] = res.material[key]
        })
        goodData["id"] = res.material["id"]
        chooseFittingData.length = 0
        chooseFittingData.push(...res.materialStructVOList)
      })
      getFittingData() // 得到旧物料信息
    }
  }
  if (route.query.materialType && route.query.materialType !== '套机') {
    materialBarCodeHeads(route.query.materialCode).then(res => {
      barCodeList.length = 0
      barCodeList.push(...res.pageInfo.list)
    })
  }
})

const save = async (formRef) => {
  let sign = 1

  await formRef.validate((valid, fields) => {
    if (valid) {
      console.log('submit!')
    } else {
      sign = 0
      console.log('error submit!', fields)
    }
  })

  if (sign) {
    if (goodData.materialType !== '套机') {
      goodData.volume = +goodData.volume
      goodData.weight = +goodData.weight

      /*       let list = []
      list.push(goodData)
      let params = {
        list
      }
      console.log(params) */
      addMaterial(goodData).then(res => {
        if (res === 200) {
          ElMessage.success('保存成功')
          setTimeout(() => {
            router.go(-1)
          }, 1000)
        }
      })
    } else {
      if (chooseFittingData.length < 1) {
        ElMessage.error('套机内至少要含有一个物料')
        return
      } else {
        let materialData = []
        chooseFittingData.forEach(item => {
          let temp = {}
          Object.keys(item).forEach(key => {
            if (item[key]) {
              temp[key] = item[key]
            }
          })
          temp["materialName"] = goodData["materialName"] //产品类型
          temp["materialCodeSet"] = goodData["materialCode"] //套机代码
          temp["materialSpecificationSet"] = goodData["materialSpecification"] //规格型号
          if (temp["materialSpecification"] !== '配件') {
            temp["sort"] = goodData["sort"]
          }
          temp["partNumber"] = temp["partNumber"] / 1
          materialData.push(temp)
        })
        let params = {
          list: materialData
        }
        addMaterExcel(params).then(res => {
          if (res === 200) {
            ElMessage.success('保存成功')
            setTimeout(() => {
              router.go(-1)
            }, 1000)
          }
        })
      }
    }
  }
}
const cancel = () => {
  router.go(-1)
}

const putFittingData = async () => {
  await fittingFormRef.value.ruleFormRef.validate((valid, fields) => {
    if (valid) {
      if (isCompile.value === 0) {
        let temp = JSON.parse(JSON.stringify(fittingData))
        temp.volume = fittingData.volume - 0
        temp.weight = fittingData.weight - 0
        temp.partNumber = fittingData.partNumber - 0
        if (temp.partNumber === 0) {
          ElMessage.error('净数量必须大于零')
          return
        }
        chooseFittingData.push(temp)
        Object.keys(fittingData).forEach(key => {
          if (key === 'volume' || key === 'weight' || key === 'partNumber') {
            fittingData[key] = 0
          } else {
            fittingData[key] = ''
          }
        })
        ElMessage.success('添加成功')
      } else {
        let temp = JSON.parse(JSON.stringify(fittingData))
        temp.volume = fittingData.volume - 0
        temp.weight = fittingData.weight - 0
        temp.partNumber = fittingData.partNumber - 0
        chooseFittingData.splice(index.value, 1, temp)
        Object.keys(fittingData).forEach(key => {
          if (key === 'volume' || key === 'weight' || key === 'partNumber') {
            fittingData[key] = 0
          } else {
            fittingData[key] = ''
          }
        })
        ElMessage.success('修改成功')
        showFittingDialog.value = false
      }
    } else {
      ElMessage.error('请完善必填信息')
    }
  })
}

const deleteRecord = (scope) => {
  let list = []
  list.push(scope.row.materialStructId)
  let params = { list }

  removeFittings(params).then(res => {
    if (res === 200) {
      ElMessage.success('删除成功')
      getNestingMaterial(route.query.id).then(res => {
        Object.keys(goodData).forEach(key => {
          goodData[key] = res.material[key]
        })
        goodData["id"] = res.material["id"]
        chooseFittingData.length = 0
        chooseFittingData.push(...res.materialStructVOList)
      })
    }
  })
}

const compile = (scope) => {
  index.value = scope.$index
  Object.keys(fittingData).forEach(key => {
    fittingData[key] = scope.row[key]
  })
  showFittingDialog.value = true
  isCompile.value = 1
}

const chooseMaterialRow = (row) => {
  Object.keys(fittingData).forEach(key => {
    fittingData[key] = row[key]
  })
  showOldMaterialDialog.value = false
}

const getFittingData = () => {
  if (searchList['materialCode'] === '') {
    delete searchList['materialCode']
  }
  let params = {
    currentPage: fittingPage.value,
    pageSize: fittingPageSize.value,
    material: searchList
  }
  getMaterial(params).then(res => {
    fittingTableData.length = 0
    fittingTableData.push(...res.pageInfo.list)
    fittingTotal.value = res.pageInfo.total
  })
}

const currentChange = (page) => {
  fittingPage.value = page
  getFittingData()
}

const openFittingDialog = () => {
  showFittingDialog.value = true
  materialCodeIsDisabled.value = false
}

const openOldFittingDialog = () => {
  showOldMaterialDialog.value = true
  getFittingData()
}

const closeFittingDialog = () => {
  Object.keys(fittingData).forEach(key => {
    if (key === 'volume' || key === 'weight' || key === 'partNumber') {
      fittingData[key] = 0
    } else {
      fittingData[key] = ''
    }
  })
  materialCodeIsDisabled.value = Boolean(route.query.id)
  isCompile.value = 0
  fittingPage.value = 1
}
</script>

<style lang="less" scoped>
.main {
width: 100%;
.message_area {
  border-radius: 8px;
  padding: 10px;
  background-color: #ffffff;

  .form_area {
    padding: 15px;
    padding-bottom: 0;
    .form_title {
      text-align: center;
      font-size: 24px;
      color: #595959;
      font-weight: 700;
    }
  }

  .handle_area {
    margin: 15px auto;
    text-align: center;
  }
}
:deep(.el-divider__text){
      margin-top: 0;
      font-size: 16px;
      font-weight: 700;
  }
.page {
 display: flex;
 justify-content: center ;
}
.form_area{
  :deep(.el-input){
    width: 280px;
    height: 34px;
  }
  .upLoad-content{
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgb(250, 250, 250);
    border: 1px dashed rgb(205, 208, 214);
    width: 130px;
    height: 130px;
  }
  .image-content{
    display: flex;
    position: relative;
  }
  #deleteIcon{
    position: absolute;
    left: 78%;
    top: 2%;
  }
}
}
.barcode{
  width: 80%;
  margin: 0 auto;
}
</style>