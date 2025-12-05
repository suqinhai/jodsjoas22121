<template>
    <!-- 稽核管理-新增稽核 -->
    <Dialog ref="dialog" :width="$locale == 'zh' ? 450 : 600" :title="$t('新增稽核')" top="10vh" @confirm="handleSubmit(deployFormRef)" @cancel="cancel">
        <el-form ref="deployFormRef" class="create-order" :model="state.formData" :rules="state.rules" label-width="auto">
            <el-form-item :label="$t('站点:')">
                <MerchantSiteSelect isNeedDefault :clearable="false" style="width: 200px" v-model="state.formData.merchantId" @change="resetSearch" />
            </el-form-item>
            <el-form-item :label="$t('会员ID:')" prop="userId">
                <el-input :disabled="state.isSearch" @input="(val) => state.formData.userId = val.replace(/\D/g,'')" v-model="state.formData.userId"
                    style="width: 200px;margin-right: 10px" :placeholder="$t('请输入会员ID')" />
                <el-button v-throttle type="primary" @click="handleSearch">{{state.isSearch ?$t('重 置'): $t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item :label="$t('会员ID:')">
                <span>{{state.memberInfo.id}}</span>
            </el-form-item>
            <el-form-item :label="$t('会员账号:')">
                <span>{{state.memberInfo.name}}</span>
            </el-form-item>
            <el-form-item :label="$t('稽核流水(需打码):')" :label-width="$locale == 'vi' ? '267px' : $locale == 'en' ? '230px' : '134px'" prop="amount">
                <el-input-number :disabled="!state.isSearch" v-model="state.formData.amount" :controls="false" style="width: 220px" :precision="0"
                    :min="0" :placeholder="$t('请输入稽核金额')" />
            </el-form-item>
            <div class="tips">{{$t('说明：输完就自动解除稽核。')}}</div>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { postMemberAuditTask } from '@/api/finance'
import { getUserBaseDetail } from '@/api/common'

// const props = defineProps({
//     formData: {
//         type: Object,
//         default: () => {}
//     },
// })
const emits = defineEmits(['close', 'fetchData'])
const state = reactive({
    isSearch: false,
    formData: {},
    memberInfo: {},
    rules: {
        userId: { required: true, message: $t('请输入会员ID！'), trigger: 'blur' },
        amount: { required: true, message: $t('请输入稽核金额！'), trigger: 'blur' },
    }
})
const deployFormRef = ref(null)
const dialog = ref(null)

const handleSearch = () => {
    if (state.isSearch) {
        resetSearch()
    } else {
        if (!state.formData.userId) {
            return ElMessage.warning($t('请输入会员ID再进行搜索！'))
        }
        dialog.value.showLoading()
        getUserBaseDetail({ id: state.formData.userId, merchantId: state.formData.merchantId }).then((res) => {
            if (res.data) {
                state.memberInfo = res.data
                state.isSearch = true
            } else {
                ElMessage.warning($t('会员不存在当前站点，请核对会员站点！'))
            }
            dialog.value.closeLoading()
        }).catch((data) => {
            dialog.value.closeLoading()
        })
    }
}

const resetSearch = () => {
    delete state.formData.userId
    state.memberInfo = {}
    state.isSearch = false
}

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            dialog.value.showLoading()
            const data = {
                ...state.formData
            }
            postMemberAuditTask(data).then(() => {
                cancel()
                emits('fetchData')
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
</style>
