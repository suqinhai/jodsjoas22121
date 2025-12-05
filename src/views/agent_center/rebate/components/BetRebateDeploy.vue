<template>
    <!-- 返佣设置-打码模式-新增/修改 -->
    <Dialog ref="dialog" :width="$locale == 'zh' ? 500 : 600" :title="state.title" buttonCenter top="15vh" @confirm="handleSubmit(operateForm)" @cancel="cancel">
        <el-form ref="operateForm" :rules="state.rules" :model="state.formData" :label-width="$locale == 'zh' ? '180px' : 'auto'">
            <el-form-item :label="$t('有效投注业绩(单位：万):')" prop="inCoin">
                <el-input-number style="width: 100%" v-model="state.formData.inCoin" :controls="false" :precision="4" :min="0"
                    :placeholder="$t('不可小于上级额度')" />
            </el-form-item>
            <el-form-item :label="$t('每万返佣:')" prop="awardAmount">
                <el-input-number style="width: 100%" v-model="state.formData.awardAmount" :controls="false" :precision="0" :min="0"
                    :placeholder="$t('请输入返佣金额')" />
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { ref, reactive, onMounted } from 'vue'
import { postRebateSettingData } from '@/api/agent'
import { mul, div } from '@/common/util'

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
    title: $t('新增'),
    formData: {},
    rules: {
        inCoin: [{ required: true, message: $t('请输入有效投注业绩！'), trigger: 'blur' }],
        awardAmount: [{ required: true, message: $t('请输入每万返佣！'), trigger: 'blur' }],
    }
})

onMounted(() => {
    state.formData = { ...props.itemData }
    if (state.formData.inCoin) state.formData.inCoin = div(state.formData.inCoin, 10000)
    state.formData.type = 2
    state.title = state.formData.id ? $t('修改') : $t('新增')
})

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            let params = { ...state.formData }
            params.inCoin = mul(params.inCoin, 10000)
            dialog.value.showLoading()
            postRebateSettingData(params).then(() => {
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
