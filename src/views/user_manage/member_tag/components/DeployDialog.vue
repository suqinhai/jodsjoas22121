<template>
    <!-- 会员标签-新增/修改 -->
    <Dialog ref="dialog" width="500" :title="state.title" top="10vh" @confirm="handleSubmit(deployForm)" @cancel="cancel">
        <el-form ref="deployForm" :rules="state.rules" :model="state.formData" :label-width="$locale == 'zh' ? '85px' : 'auto'">
            <el-form-item :label="$t('标签名称:')" prop="name">
                <el-input v-model="state.formData.name" :placeholder="$t('请输入标签名称')" maxlength="10" show-word-limit />
            </el-form-item>
            <el-form-item :label="$t('颜色:')" prop="color">
                <el-color-picker v-model="state.formData.color" />
            </el-form-item>
            <el-form-item :label="$t('描述:')">
                <el-input type="textarea" :rows="4" :placeholder="$t('请输入描述')" v-model="state.formData.summary" show-word-limit maxlength="100" />
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { postMemberTagData } from '@/api/member'

const emits = defineEmits(['close', 'fetchData'])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        },
    }
})

const dialog = ref(null)
const deployForm = ref(null)
const state = reactive({
    formData: {},
    title: '',
    rules: {
        name: [{ required: true, message: $t('请输入标签名称！'), trigger: 'blur' }],
        color: [{ required: true, message: $t('请设置颜色！'), trigger: 'change' }],
    }
})

onMounted(() => {
    state.formData = { ...props.itemData }
    state.formData.type = 0
    state.title = $t('新增')
    if (props.itemData.id) {
        state.title = $t('修改')
    }
})

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            dialog.value.showLoading()
            postMemberTagData(state.formData).then(() => {
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

<style scoped lang="scss">
</style>
