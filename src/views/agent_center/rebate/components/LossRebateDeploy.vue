<template>
    <!-- 返佣设置-亏损模式-新增/修改 -->
    <Dialog ref="dialog" width="450" :title="state.title" buttonCenter top="15vh" @confirm="handleSubmit(operateForm)" @cancel="cancel">
        <el-form ref="operateForm" :rules="state.rules" :model="state.formData" :label-width="$locale == 'zh' ? '90px' : 'auto'">
            <el-form-item :label="$t('有效人数≥')" prop="inCoin">
                <el-input-number style="width: 100%" v-model="state.formData.inCoin" :controls="false" :precision="0" :min="0"
                    :placeholder="$t('请输入有效人数')" />
            </el-form-item>
            <el-form-item :label="$t('净盈利≥')" prop="awardAmount">
                <el-input-number style="width: 100%" v-model="state.formData.awardAmount" :controls="false" :precision="2" :min="0"
                    :placeholder="$t('请输入净盈利')" />
            </el-form-item>
            <el-form-item :label="$t('返佣比例')" prop="rate">
                <el-input-number style="width: 93%;margin-right: 5px" v-model="state.formData.rate" :controls="false" :precision="2" :min="0"
                    :placeholder="$t('请输入返佣比例')" />%
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { ref, reactive, onMounted } from 'vue'
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
    title: '',
    formData: {},
    rules: {
        inCoin: [{ required: true, message: $t('请输入有效人数！'), trigger: 'blur' }],
        awardAmount: [{ required: true, message: $t('请输入净盈利！'), trigger: 'blur' }],
        rate: [{ required: true, message: $t('请输入返佣比例！'), trigger: 'blur' }],
    }
})

onMounted(() => {
    state.formData = { ...props.itemData }
    state.formData.type = 3
    state.title = state.formData.id ? $t('修改') : $t('新增')
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
