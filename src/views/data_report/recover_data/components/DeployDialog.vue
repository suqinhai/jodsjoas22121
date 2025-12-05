<template>
    <!-- ROI数据统计-买量配置 -->
    <Dialog ref="dialog" :width="$locale == 'zh' ? 400 : 500" :title="$t('买量配置')" buttonCenter top="15vh" @confirm="handleSubmit(operateForm)" @cancel="cancel">
        <el-form ref="operateForm" :rules="state.rules" :model="state.formData" :label-width="$locale == 'zh' ? '85px' : 'auto'">
            <el-form-item :label="$t('渠道:')" prop="channelId">
                <el-select style="width: 100%" v-model="state.formData.channelId" :placeholder="$t('请选择渠道')">
                    <el-option v-for="item in channelData" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('买量成本:')" prop="cost">
                <el-input-number v-model="state.formData.cost" style="width: 100%" :controls="false" :precision="0" :min="1" :placeholder="$t('请输入买量成本')" />
            </el-form-item>
            <el-form-item :label="$t('买量日期:')" prop="reportTime">
                <el-date-picker v-model="state.formData.reportTime" type="date" style="width: 150px" value-format="YYYY-MM-DD" :placeholder="$t('选择日期')" />
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { ref, reactive } from 'vue'
import { postRoiChannelCostDaily } from '@/api/statistics.js'

const emits = defineEmits(['close', 'fetchData'])
const props = defineProps({
    channelData: {
        type: Array,
        default: () => [],
    },
})
const dialog = ref(null)
const operateForm = ref(null)
const state = reactive({
    formData: {},
    rules: {
        channelId: [{ required: true, message: $t('请请选择渠道！'), trigger: 'change' }],
        cost: [{ required: true, message: $t('请输入买量成本！'), trigger: 'blur' }],
        reportTime: [{ required: true, message: $t('请设置买量日期！'), trigger: 'change' }],
    }
})

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            dialog.value.showLoading()
            postRoiChannelCostDaily(state.formData).then(() => {
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
