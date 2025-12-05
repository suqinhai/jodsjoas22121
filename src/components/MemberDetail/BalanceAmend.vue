<template>
    <!-- 会员详情弹窗-会员信息-人工修正 -->
    <Dialog ref="dialogRef" width="600" :title="$t('会员余额人工修正')" buttonCenter top="8vh" @confirm="handleSubmit(deployForm)" @cancel="cancel">
        <el-form ref="deployForm" :rules="state.rules" :model="state.formData" :label-width="$locale == 'zh' ? '90px' : 'auto'">
            <el-row>
                <el-col :span="13">
                    <el-form-item :label="$t('会员账号:')">
                        {{itemData.username}}
                    </el-form-item>
                </el-col>
                <el-col :span="11">
                    <el-form-item :label="$t('账户余额:')">
                        {{itemData.activeAmount}}
                    </el-form-item>
                </el-col>
            </el-row>
            <el-form-item :label="$t('操作:')">
                <el-radio-group v-model="state.formData.tradeType">
                    <el-radio v-for="item in metaData.balanceAdjustType" :key="item.value" :label="item.value*1"
                        :disabled="item.value*1 === 21 && itemData.activeAmount <= 0">{{item.label}}</el-radio>
                    <!-- <el-radio :label="2" :disabled="!itemData.activeAmount">{{$t('人工扣款')}}</el-radio> -->
                </el-radio-group>
            </el-form-item>
            <el-form-item :label="$t('修正金额:')" prop="tradeAmount" :rules="[
                { required: true, message: $t('请输入修正金额！'), trigger: 'blur' },
                { type: 'number', max: typeof rechargeAmountMax === 'number' ? rechargeAmountMax : 99999999,
                message: `${$t('修正金额最大值为')}${typeof rechargeAmountMax === 'number' ? rechargeAmountMax : 99999999}！`, trigger: 'change' }
            ]">
                <el-input-number style="width: 100%" v-model="state.formData.tradeAmount" :controls="false" :precision="2" :min="0.01"
                    :placeholder="$t('修正金额最小输入0.01')" />
                <!-- <el-input-number v-else style="width: 100%" v-model="state.formData.tradeAmount" :controls="false" :precision="0"
                    :placeholder="$t('请输入大于0的整数且不得大于单笔加款限额(') + userData.userInfo.rechargeAmountMax +')'" /> -->
            </el-form-item>
            <el-form-item :label="$t('稽核倍数:')" v-if="state.formData.tradeType === 20 && !state.formData.directLimit">
                <el-input-number style="width: 100%" v-model="state.formData.auditFactor" :controls="false" :precision="2" :min="0"
                    :placeholder="$t('请输入稽核倍数')" />
            </el-form-item>
            <el-form-item :label="$t('可直接提现:')" v-if="state.formData.tradeType === 20">
                <el-radio-group v-model="state.formData.directLimit">
                    <el-radio :label="true">{{$t('可提现')}}</el-radio>
                    <el-radio :label="false">{{$t('不可提现')}}</el-radio>
                </el-radio-group>
                <!-- <el-switch v-model="state.formData.directLimit" :active-value="true" :inactive-value="false" /> -->
            </el-form-item>
            <el-form-item :label="$t('备注:')" prop="remark">
                <el-input style="width: 100%" type="textarea" :rows="4" :placeholder="$t('请输入备注')" v-model="state.formData.remark" show-word-limit
                    maxlength="50" />
            </el-form-item>
            <el-form-item :label="$t('前端备注:')">
                <el-input style="width: 100%" type="textarea" :rows="4" :placeholder="$t('请输入前端备注')" v-model="state.formData.pcRemark" show-word-limit
                    maxlength="50" />
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, defineEmits, defineProps, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { postBalanceRevisionData } from '@/api/finance'
import userStore from '@/store/user'

const emits = defineEmits(['fetchData', 'close'])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        }
    },
    metaData: {
        type: Object,
        default: () => {
            return {}
        }
    }
})
const state = reactive({
    formData: {
        tradeType: 20,
        directLimit: false
    },
    rules: {
        remark: [
            { required: true, message: $t('请输入备注！'), trigger: 'blur' },
        ]
    }
})
const dialogRef = ref(null)
const deployForm = ref(null)
const userData = userStore()

const rechargeAmountMax = computed(() => {
    return userData.userInfo.rechargeAmountMax
})

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            dialogRef.value.showLoading()
            if (state.formData.tradeType !== 20) state.formData.directLimit = false
            if (state.formData.tradeType !== 20 || state.formData.directLimit) delete state.formData.auditFactor
            state.formData.userId = props.itemData.id
            state.formData.merchantId = props.itemData.merchantId
            postBalanceRevisionData(state.formData).then(res => {
                // ElMessage.success($t('提交成功！'))
                cancel()
                emits('fetchData', 'memberInfoRef')
            }).catch(err => {
                dialogRef.value.closeLoading()
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
