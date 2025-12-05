<template>
    <!-- 财务中心-人工加扣款-新增 -->
    <Dialog ref="dialog" width="750" :title="$t('会员余额修正')" top="10vh" @confirm="handleSubmit(deployFormRef)" @cancel="cancel">
        <el-form ref="deployFormRef" :model="state.formData" :rules="state.rules" :label-width="$locale == 'zh' ? '135px' : 'auto'">
            <el-form-item :label="$t('会员ID:')" prop="userId">
                <el-input :disabled="state.isSearch" @input="(val) => state.formData.userId = val.replace(/\D/g,'')" v-model="state.formData.userId"
                    style="width: 245px;margin-right: 20px" :placeholder="$t('请输入会员ID')" />
                <el-button v-throttle type="primary" @click="handleSearch">{{state.isSearch ?$t('重 置'): $t('搜 索')}}</el-button>
            </el-form-item>
            <el-row>
                <el-col :span="9">
                    <el-form-item :label="$t('商户ID:')">
                        <span>{{state.memberInfo.merchantId}}</span>
                    </el-form-item>
                </el-col>
                <el-col :span="9">
                    <el-form-item :label="$t('会员ID:')">
                        <span>{{state.memberInfo.user && state.memberInfo.user.id ? state.memberInfo.user.id : ''}}</span>
                    </el-form-item>
                </el-col>
                <el-col :span="9">
                    <el-form-item :label="$t('会员账号:')">
                        <span>{{state.memberInfo.user && state.memberInfo.user.name ? state.memberInfo.user.name : ''}}</span>
                    </el-form-item>
                </el-col>
                <el-col :span="9">
                    <el-form-item :label="$t('会员余额:')">
                        <span>{{state.memberInfo.activeAmount}}</span>
                    </el-form-item>
                </el-col>
                <el-col :span="9">
                    <el-form-item :label="$t('可直接提现金额:')">
                        <template #label>
                            <el-tooltip effect="dark" :content="$t('说明：不受提现规则限制。')" placement="top">
                                <el-icon class="pointer" :size="15" style="margin-top: 8px;margin-right: 2px;">
                                    <QuestionFilled />
                                </el-icon>
                            </el-tooltip>
                            <div>{{$t('可直接提现金额:')}}</div>
                        </template>
                        <span>{{state.memberInfo.unlimited}}</span>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-form-item :label="$t('操作:')">
                <el-radio-group :disabled="!state.isSearch" v-model="state.formData.tradeType" @change="changeTradeType">
                    <el-radio v-for="item in balanceAdjustType" :key="item.value" :label="item.value*1"
                        :disabled="item.value*1 === 21 && state.memberInfo.activeAmount <= 0">{{item.label}}</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item :label="$t('修正金额:')" prop="tradeAmount" :rules="[
                { required:!state.formData.ticketId?true:false, message: $t('请输入修正金额！'), trigger: 'blur' },
                { type: 'number', max: typeof rechargeAmountMax === 'number' ? rechargeAmountMax : 99999999, 
                message: `${$t('修正金额最大值为')}${typeof rechargeAmountMax === 'number' ? rechargeAmountMax : 99999999}！`, trigger: 'blur' }
            ]">
                <el-input-number :disabled="!state.isSearch" style="width: 100%" v-model="state.formData.tradeAmount" :controls="false" :precision="2"
                    :min="0.01" :placeholder="$t('修正金额最小输入0.01')" />
                <!-- <el-input-number v-else :disabled="!state.isSearch" style="width: 100%" v-model="state.formData.tradeAmount"
                    :controls="false" :precision="2"
                    :placeholder="$t('请输入大于0的整数且不得大于单笔加款限额(')+ userData.userInfo.rechargeAmountMax +')'" /> -->
                <!-- <div style="font-size: 12px">{{$t('人工加款时请输入正数，人工扣款时请输入负数')}}</div> -->
            </el-form-item>

            <el-form-item :label="$t('派送票券:')" v-if="state.formData.tradeType == 20" prop="ticketType" :rules="[
                { required: state.formData.tradeAmount?false:true, message:$t('请选择票券'), trigger:'change'}
            ]">
                <el-select v-model="state.formData.ticketType" @change="getTicketNames" :disabled="!state.isSearch" clearable>
                    <el-option v-for="item in ticketTypes" :key="item.value" :label="item.label" :value="item.value"></el-option>
                </el-select>
                <el-select v-model="state.formData.ticketId" :disabled="!state.isSearch">
                    <el-option v-for="item in state.ticketNames" :key="item.id" :label="item.name" :value="item.id"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('稽核倍数:')" v-if="state.formData.tradeType === 20 && !state.formData.directLimit">
                <el-input-number :disabled="!state.isSearch" style="width: 100%" v-model="state.formData.auditFactor" :controls="false" :precision="2"
                    :min="0" :placeholder="$t('请输入稽核倍数')" />
            </el-form-item>
            <el-form-item :label="$t('可直接提现:')" v-if="state.formData.tradeType === 20">
                <el-radio-group v-model="state.formData.directLimit">
                    <el-radio :label="true">{{$t('可提现')}}</el-radio>
                    <el-radio :label="false">{{$t('不可提现')}}</el-radio>
                </el-radio-group>
                <!-- <el-switch v-model="state.formData.directLimit" :active-value="true" :inactive-value="false" /> -->
            </el-form-item>
            <el-form-item :label="$t('备注:')" prop="remark">
                <el-input :disabled="!state.isSearch" style="width: 100%" type="textarea" :rows="4" :placeholder="$t('请输入备注')"
                    v-model="state.formData.remark" show-word-limit maxlength="50" />
            </el-form-item>
            <el-form-item :label="$t('前端备注:')">
                <el-input style="width: 100%" type="textarea" :rows="4" :placeholder="$t('请输入前端备注')" v-model="state.formData.pcRemark" show-word-limit
                    maxlength="50" />
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, defineProps, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import userStore from '@/store/user'
import { postBalanceRevisionData } from '@/api/finance'
import { getTicketList } from '@/api/operation'
import { getMemberBalance, getCommonMeta } from '@/api/common'

const emits = defineEmits(['close', 'fetchData'])
const props = defineProps({
    balanceAdjustType: {
        type: Array,
        default: () => []
    },
    ticketTypes: {
        type: Array,
        default: () => []
    },
})
const state = reactive({
    isSearch: false,
    formData: {
        userId: undefined,
        tradeType: 20,
        directLimit: false
    },
    memberInfo: {},
    rules: {
        userId: [{ required: true, message: $t('请输入会员ID！'), trigger: 'blur' }],
        // tradeAmount: [
        //     { required: true, message: $t('请输入修正金额！'), trigger: 'blur' },
        //     { type: 'number', max: typeof rechargeAmountMax.value === 'number' ? rechargeAmountMax.value : 999999, message: `${$t('修正金额最大值为')}${typeof rechargeAmountMax.value === 'number' ? rechargeAmountMax.value : 999999}！`, trigger: 'change' }
        // ],
        remark: [{ required: true, message: $t('请输入备注！'), trigger: 'blur' }]
    },
    ticketNames: []
})
const deployFormRef = ref(null)
const dialog = ref(null)
const userData = userStore()

const rechargeAmountMax = computed(() => {
    return userData.userInfo.rechargeAmountMax
})

const handleSearch = () => {
    if (state.isSearch) {
        state.formData = {
            userId: '',
            tradeType: 20,
        }
        state.memberInfo = {}
        state.isSearch = false
    } else {
        if (!state.formData.userId) {
            return ElMessage.warning($t('请输入会员ID再进行搜索！'))
        }
        dialog.value.showLoading()
        getMemberBalance({ userId: state.formData.userId }).then((res) => {
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

const changeTradeType = () => {
    if (state.formData.tradeType == 21) {
        state.formData.ticketId = ''
        state.formData.ticketType = ''
    }
}

const getTicketNames = () => {
    state.formData.ticketId = ''
    state.ticketNames = []
    getTicketList({
        merchantId: state.memberInfo.merchantId,
        status: 1,
        type: state.formData.ticketType,
        _page: 1,
        _size: 1000
    }).then(res => {
        state.ticketNames = res.data.list
    })
}

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            state.formData.merchantId = state.memberInfo.merchantId
            if (state.formData.tradeType !== 20) state.formData.directLimit = false
            if (state.formData.tradeType !== 20 || state.formData.directLimit) delete state.formData.auditFactor
            dialog.value.showLoading()
            postBalanceRevisionData(state.formData).then(() => {
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

onMounted(() => {
    userData.getUserInfoDetail()
})

const cancel = () => {
    emits('close')
}
</script>

<style lang="scss">
</style>
