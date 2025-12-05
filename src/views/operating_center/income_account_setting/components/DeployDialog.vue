<template>
    <!-- 存钱宝设置-编辑 -->
    <Dialog ref="dialog" width="500" :title="$t('编辑')" top="10vh" @confirm="handleSubmit(deployFormRef)" @cancel="cancel">
        <el-form ref="deployFormRef" :model="state.formData" :rules="state.rules" :label-width="$locale == 'zh' ? '120px' : 'auto'">
            <el-form-item :label="$t('年利率(%):')" prop="yearRate">
                <el-input-number v-model="state.formData.yearRate" style="width: 100%" :controls="false" :precision="2" :min="0"
                    :placeholder="$t('请输入年利率')" />
            </el-form-item>
            <el-form-item :label="$t('结算周期(小时):')" prop="period">
                <el-input-number v-model="state.formData.period" style="width: 100%" :controls="false" :precision="1" :min="0" :max="60000"
                    :placeholder="$t('请输入结算周期')" />
            </el-form-item>
            <el-form-item :label="$t('最低存入金额:')" prop="minDeposit">
                <el-input-number v-model="state.formData.minDeposit" style="width: 100%" :controls="false" :precision="2" :min="0"
                    :placeholder="$t('请输入最低存入金额')" />
            </el-form-item>
            <el-form-item :label="$t('利息稽核倍数:')" prop="auditTimes">
                <el-input-number v-model="state.formData.auditTimes" style="width: 100%" :controls="false" :precision="2" :min="0"
                    :placeholder="$t('请输入利息稽核倍数')" />
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { postIncomeAccountRule } from '@/api/discounts_center'
import { ref, reactive, onMounted, defineProps } from 'vue'
import { ElMessage } from 'element-plus'

const emits = defineEmits(['close', 'fetchData'])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        }
    }
})
const state = reactive({
    formData: {},
    rules: {
        yearRate: { required: true, message: $t('请输入年利率！'), trigger: 'blur' },
        period: { required: true, message: $t('请输入结算周期！'), trigger: 'blur' },
        minDeposit: { required: true, message: $t('请输入最低存入金额！'), trigger: 'blur' },
        auditTimes: { required: true, message: $t('请输入利息稽核倍数！'), trigger: 'blur' },
    }
})
const deployFormRef = ref(null)
const dialog = ref(null)

onMounted(() => {
    state.formData = { ...props.itemData }
})

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            dialog.value.showLoading()
            postIncomeAccountRule(state.formData).then(() => {
                // ElMessage.success($t('提交成功！'))
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
