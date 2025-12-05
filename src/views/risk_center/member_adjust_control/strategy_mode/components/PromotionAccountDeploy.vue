<template>
    <!-- 会员调控-数据列表（专业模式）-推广账号配置 -->
    <Dialog ref="dialog" width="400" :title="$t('推广账号配置')" top="10vh" buttonCenter @confirm="handleSubmit(deployFormRef)" @cancel="emits('close')">
        <el-form ref="deployFormRef" :model="state.formData" :rules="state.rules" :label-width="$locale == 'zh' ? '85px' : 'auto'">
            <el-form-item :label="$t('控制类型:')" prop="type">
                <el-select v-model="state.formData.type" :placeholder="$t('控制类型')">
                    <el-option v-for="item in showData" :key="item.value" :label="item.label" :value="Number(item.value)" />
                </el-select>
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { postUserLevelControl } from '@/api/risk_control'
import { ElMessage } from 'element-plus'

const emits = defineEmits(['close', 'fetchData'])
const props = defineProps({
    defaultData: {
        default: ''
    },
    metaData: {
        type: Object,
        default: {}
    },
})
const state = reactive({
    formData: {},
    rules: {
        type: { required: true, message: $t('请选择控制类型！'), trigger: 'blur' },
    },
})
const deployFormRef = ref(null)
const dialog = ref(null)

const showData = computed(() => {
    return props.metaData.controlTypeList.filter(item => +item.value)
})

onMounted(() => {
    state.formData.type = props.defaultData
})

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            dialog.value.showLoading()
            postUserLevelControl(state.formData).then(() => {
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
</script>

<style lang="scss" >
.member-control {
}
</style>
