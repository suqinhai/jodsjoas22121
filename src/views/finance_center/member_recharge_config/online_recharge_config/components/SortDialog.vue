<template>
    <!-- 财务中心-会员充值配置-在线充值配置-前台充值类型排序 -->
    <Dialog ref="dialog" width="600" :title="$t('前台充值类型排序')" top="10vh" :isShowBottomButton="false" @cancel="cancel">
        <div class="sort-deploy">
            <div class="sort-deploy-head">
                <div class="site-box" v-if="commonData.merchantSiteList.length > 1">
                    <span class="label">{{$t('站点:')}}</span>
                    <MerchantSiteSelect :clearable="false" v-model="state.merchantId" @change="selectChange"></MerchantSiteSelect>
                </div>
                <div class="operate" v-if="state.formData.length && userData.isHasPermiss('admin.user-recharge-config.payWalletSort') ">
                    <el-button v-throttle v-if="!state.isDisabled" @click="getData">{{$t('取 消')}}</el-button>
                    <el-button v-throttle type="primary" v-if="!state.isDisabled" @click="handleSubmit(deployFormRef)">{{$t('保 存')}}</el-button>
                    <el-button v-throttle type="primary" v-if="state.isDisabled" @click="state.isDisabled = false">{{$t('修 改')}}</el-button>
                </div>
            </div>

            <el-form ref="deployFormRef" :model="state.formData">
                <el-table :data="state.formData" border>
                    <el-table-column :label="$t('排序')" min-width="120" align="center">
                        <template #default="{ row,$index }">
                            <span v-if="state.isDisabled">{{ row.sort }}</span>
                            <el-form-item v-if="!state.isDisabled" :prop="$index + '.sort'"
                                :rules="{ required: true, message: $t('请输入排序值') + '！', trigger: 'blur' }">
                                <el-input-number v-model="row.sort" style="width: 100%" :controls="false" :precision="0" :min="0"
                                    :placeholder="$t('请输入排序值')" />
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column prop="label" :label="$t('类型')" min-width="200" align="center" />
                    <el-table-column prop="name" :label="$t('自定义名称')" min-width="200" align="center">
                        <template #default="{ row,$index }">
                            <span v-if="state.isDisabled">{{ row.name }}</span>
                            <el-form-item v-if="!state.isDisabled" :prop="$index + '.name'"
                                :rules="{ required: true, message: $t('请输入自定义名称') + '！', trigger: 'blur' }">
                                <el-input v-model="row.name" style="width: 100%" :placeholder="$t('请输入自定义名称')" />
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('推荐角标')" min-width="120" align="center" v-if="userData.getTemplateType() === 4">
                        <template #default="{ row }">
                            <el-switch v-model="row.icon" :active-value="1" :inactive-value="0" />
                        </template>
                    </el-table-column>
                </el-table>
            </el-form>
        </div>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import userStore from '@/store/user'
import commonStore from '@/store/common'
import { getPayWalletSort } from '@/api/finance'
import { postMetaData } from "@/api/common.js"

const emits = defineEmits(['close'])
const state = reactive({
    formData: [],
    merchantId: '',
    isDisabled: true,
    ext: {}
})
const deployFormRef = ref(null)
const dialog = ref(null)
const userData = userStore()
const commonData = commonStore()

onMounted(() => {
    state.merchantId = commonData.currentMerchantSite.id
    getData()
})

const getData = () => {
    dialog.value.showLoading()
    getPayWalletSort({ merchantId: state.merchantId }).then(({ data, ext = {} }) => {
        state.formData = data || []
        state.ext = { ...ext }
        state.isDisabled = true
        dialog.value.closeLoading()
    }).catch(() => {
        dialog.value.closeLoading()
    })
}

const selectChange = () => {
    state.formData = []
    state.isDisabled = true
    getData()
}

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            let params = {
                ...state.ext,
                value: JSON.stringify(state.formData),
                merchantId: state.merchantId
            }
            dialog.value.showLoading()
            postMetaData(params).then(() => {
                getData()
            }).catch(() => {
                dialog.value.closeLoading()
            })
        } else {
            ElMessage.warning($t('请完善表单内容再进行提交！'))
        }
    })
}

const cancel = () => {
    emits('close')
}
</script>

<style lang="scss">
.sort-deploy {
    margin-bottom: 40px;
    &-head {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        margin-top: -5px;
        .site-box {
            .label {
                font-weight: bold;
                margin-right: 10px;
            }
        }
        .operate {
            flex: 1;
            display: flex;
            justify-content: flex-end;
        }
    }
}
</style>
