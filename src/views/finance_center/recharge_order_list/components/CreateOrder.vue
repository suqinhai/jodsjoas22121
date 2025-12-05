<template>
    <!-- 财务中心-充值订单列表-创建在线订单 -->
    <Dialog ref="dialog" width="550" :title="$t('创建在线订单')" top="10vh" @confirm="handleSubmit(deployFormRef)" @cancel="cancel">
        <el-form ref="deployFormRef" class="create-order" :model="state.formData" :rules="state.rules"
            :label-width="$locale == 'zh' ? '85px' : 'auto'">
            <el-form-item :label="$t('会员ID:')" prop="userId">
                <el-input :disabled="state.isSearch" @input="(val) => state.formData.userId = val.replace(/\D/g,'')" v-model="state.formData.userId"
                    style="width: 250px;margin-right: 10px" :placeholder="$t('请输入会员ID')" />
                <el-button v-throttle type="primary" @click="handleSearch">{{state.isSearch ?$t('重 置'): $t('搜 索')}}</el-button>
            </el-form-item>
            <el-row>
                <el-col :span="11">
                    <el-form-item :label="$t('会员ID:')">
                        <span>{{state.memberInfo.id}}</span>
                    </el-form-item>
                </el-col>
                <el-col :span="13">
                    <el-form-item :label="$t('会员账号:')">
                        <span>{{state.memberInfo.name}}</span>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-form-item :label="$t('订单金额:')" prop="amount" :rules="[
                { required: true, message: $t('请输入订单金额'), trigger: 'blur' },
                { type: 'number', max: typeof rechargeAmountMax === 'number' ? rechargeAmountMax : 999999999999,
                message: `${$t('订单金额最大值为')}${typeof rechargeAmountMax === 'number' ? rechargeAmountMax : 999999999999}！`, trigger: 'change' }
            ]">
                <el-input-number :disabled="!state.isSearch" v-model="state.formData.amount" style="width: 100%" :controls="false" :precision="2"
                    :min="0" :placeholder="$t('请输入订单金额')" />
                <!-- <el-input-number v-else :disabled="!state.isSearch" v-model="state.formData.amount" style="width: 100%"
                    :controls="false" :precision="2" :min="0"
                    :placeholder="$t('请输入订单金额且不得大于单笔加款限额(') + userData.userInfo.rechargeAmountMax +')'" /> -->
            </el-form-item>
            <el-form-item :label="$t('稽核倍数:')">
                <el-input-number :disabled="!state.isSearch" v-model="state.formData.auditFactor" style="width: 100%" :controls="false" :precision="2"
                    :min="0" :placeholder="$t('请输入稽核倍数')" />
            </el-form-item>
            <!-- <el-form-item :label="$t('赠送金额:')">
                <el-input-number :disabled="!state.isSearch" v-model="state.formData.amount" style="width: 100%" :controls="false"
                    :precision="2" :min="0" :placeholder="$t('请输入赠送金额')" />
            </el-form-item> -->
            <el-form-item :label="$t('备注:')">
                <el-input :disabled="!state.isSearch" style="width: 100%" type="textarea" :rows="6" :placeholder="$t('请输入备注')"
                    v-model="state.formData.remark" show-word-limit maxlength="255" />
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { postCreateOrder } from '@/api/finance'
import { getUserBaseDetail } from '@/api/common'
import { ref, reactive, computed, onMounted } from 'vue'
import userStore from '@/store/user'

const userData = userStore()
const emits = defineEmits(['close', 'fetchData'])
const state = reactive({
    isSearch: false,
    formData: {
        userId: undefined,
        amount: undefined,
        auditFactor: undefined,
        remark: '',
    },
    memberInfo: {},
    rules: {
        userId: { required: true, message: $t('请输入会员ID！'), trigger: 'blur' },
    }
})
const deployFormRef = ref(null)
const dialog = ref(null)

const rechargeAmountMax = computed(() => {
    return userData.userInfo.rechargeAmountMax
})

const handleSearch = () => {
    if (state.isSearch) {
        state.formData.userId = undefined
        state.memberInfo = {}
        state.isSearch = false
    } else {
        if (!state.formData.userId) {
            return ElMessage.warning($t('请输入会员ID再进行搜索！'))
        }
        dialog.value.showLoading()
        getUserBaseDetail({ id: state.formData.userId }).then((res) => {
            if (res.data) {
                state.memberInfo = res.data
                state.isSearch = true
            } else {
                ElMessage.warning($t('未查询到此会员ID信息！'))
            }
            dialog.value.closeLoading()
        }).catch((data) => {
            dialog.value.closeLoading()
        })
    }
}

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            dialog.value.showLoading()
            postCreateOrder(state.formData).then(() => {
                cancel()
                emits('fetchData', {})
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

onMounted(() => {
    userData.getUserInfoDetail()
})
</script>

<style lang="scss">
.create-order {
}
</style>
