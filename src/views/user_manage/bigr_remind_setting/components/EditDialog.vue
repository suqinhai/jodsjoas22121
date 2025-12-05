<template>
    <!-- 大R提醒设置-编辑 -->
    <Dialog ref="dialog" width="400" :title="$t('修改')" buttonCenter top="12vh" @confirm="handleSubmit(operateForm)" @cancel="cancel">
        <el-form ref="operateForm" :rules="state.rules" :model="state.formData" :label-width="$locale == 'zh' ? '90px' : 'auto'">
            <el-form-item :label="$t('类型:')">
                {{state.formData.level_}}
            </el-form-item>
            <el-form-item :label="$t('累计充值:')" prop="amount">
                <el-input-number style="width: 100%" v-model="state.formData.amount" :controls="false" :precision="2" :min="0"
                    :placeholder="$t('请输入累计充值金额')" />
            </el-form-item>
            <el-form-item :label="$t('开关:')">
                <el-switch v-model="state.formData.popup" />
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { ref, reactive, onMounted } from 'vue'
import { postMetaData } from '@/api/common'

const emits = defineEmits(['fetchData', 'close'])
const props = defineProps({
    deployData: {
        type: Object,
        default: () => {
            return {}
        }
    },
    currentIndex: {
        default: '',
    },
})
const dialog = ref(null)
const operateForm = ref(null)
const state = reactive({
    formData: {},
    dataList: [],
    rules: {
        amount: [{ required: true, message: $t('请输入累计充值金额！'), trigger: 'blur' }],
    }
})

onMounted(() => {
    state.dataList = props.deployData.config
    state.formData = state.dataList[props.currentIndex]
})

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            let { label, id, type } = props.deployData
            let params = {
                label,
                id,
                type,
                config: JSON.stringify(state.dataList)
            }
            dialog.value.showLoading()
            postMetaData(params).then(() => {
                // ElMessage.success($t('提交成功！'))
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
