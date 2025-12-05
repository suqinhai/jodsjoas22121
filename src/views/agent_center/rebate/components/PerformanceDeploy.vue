<template>
    <!-- 返佣设置-打码模式-业绩计算 -->
    <Dialog ref="dialog" :width="$locale == 'zh' ? 400 : 500" :title="$t('修改')" buttonCenter top="15vh" @confirm="handleSubmit(operateForm)" @cancel="cancel">
        <el-form ref="operateForm" :rules="state.rules" :model="state.formData" :label-width="$locale == 'zh' ? '160px' : 'auto'">
            <el-form-item v-if="userData.siteInfo.agentMode === 1" :label="$t('周期内总有效投注≥')" prop="inCoin">
                <el-input-number style="width: 100%" v-model="state.formData.inCoin" :controls="false" :precision="2" :min="0"
                    :placeholder="$t('请输入有效投注金额')" />
            </el-form-item>
            <el-form-item :label="userData.siteInfo.agentMode === 1 ? $t('周期内总存款≥') :$t('结算周期内累计存款≥')" prop="rechargeAmount">
                <el-input-number style="width: 100%" v-model="state.formData.rechargeAmount" :controls="false" :precision="2" :min="0"
                    :placeholder="$t('请输入存款金额')" />
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { ref, reactive, onMounted } from 'vue'
import userStore from '@/store/user'
import { postRebateSettingData } from '@/api/agent'

const emits = defineEmits(['fetchData', 'close'])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        }
    },
})
const dialog = ref(null)
const operateForm = ref(null)
const state = reactive({
    formData: {},
    rules: {
        inCoin: [{ required: true, message: $t('请输入有效投注金额！'), trigger: 'blur' }],
        rechargeAmount: [{ required: true, message: $t('请输入存款金额！'), trigger: 'blur' }],
    }
})
const userData = userStore()

onMounted(() => {
    state.formData = { ...props.itemData }
    state.formData.type = 0
})

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            dialog.value.showLoading()
            postRebateSettingData(state.formData).then(() => {
                emits('close')
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

<style scoped lang="scss">
</style>
