<template>
    <!-- 返佣设置-打码模式-固定比例 -->
    <Dialog ref="dialog" width="400" :title="state.title" buttonCenter top="15vh" @confirm="handleSubmit(operateForm)" @cancel="cancel">
        <el-form ref="operateForm" :rules="state.rules" :model="state.formData" :label-width="$locale == 'zh' ? '90px' : 'auto'">
            <el-form-item :label="$t('固定层级:')" prop="bizId">
                <el-select style="width: 100%" :disabled="!!itemData.id" v-model="state.formData.bizId" :placeholder="$t('请选择固定层级')">
                    <el-option v-for="item in metaData.fixedLevel" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('每万返佣:')" prop="awardAmount">
                <el-input-number style="width: 100%;" v-model="state.formData.awardAmount" :controls="false" :precision="0" :min="0"
                    :placeholder="$t('请输入返佣金额')" />
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
    metaData: {
        type: Object,
        default: () => {
            return {}
        },
    },
})
const dialog = ref(null)
const operateForm = ref(null)
const state = reactive({
    title: '',
    formData: {},
    rules: {
        bizId: [{ required: true, message: $t('请选择固定层级！'), trigger: 'change' }],
        awardAmount: [{ required: true, message: $t('请输入每万返佣！'), trigger: 'blur' }],
    }
})

onMounted(() => {
    state.formData = { ...props.itemData }
    state.formData.type = 1
    state.title = state.formData.id ? $t('修改') : $t('新增')
})

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            dialog.value.showLoading()
            postRebateSettingData(state.formData).then(() => {
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
