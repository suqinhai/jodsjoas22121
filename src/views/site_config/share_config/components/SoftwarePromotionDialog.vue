<template>
    <!-- 分享配置-新增/修改 -->
    <Dialog :title="state.title" ref="dialog" @confirm="handleSubmit(deployForm)" @cancel="cancel" width="550">
        <el-form ref="deployForm" :model="state.formData" :rules="state.rules" :label-width="$locale == 'zh' ? '80px' : 'auto'">
            <el-form-item :label="$t('图标:')" prop="info.icon">
                <UploadImage :width="120" :height="120" v-model="state.formData.info.icon" :tip="$t('请上传120*120或等比例，PNG/JPG/GIF格式小于1024KB的图片')">
                </UploadImage>
            </el-form-item>
            <el-form-item :label="$t('名称:')" prop="info.name">
                <el-input v-model="state.formData.info.name" :placeholder="$t('请输入名称')" />
            </el-form-item>
            <el-form-item :label="$t('唤醒H5:')" prop="info.url">
                <el-input v-model="state.formData.info.url" :placeholder="$t('请输入唤醒H5地址')" />
            </el-form-item>
            <el-form-item :label="$t('排序:')" prop="sort">
                <el-input-number style="width: 100%" v-model="state.formData.sort" :controls="false" :precision="0" :min="1"
                    :placeholder="$t('请输入排序值')" />
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { postRebateSettingData } from '@/api/agent.js'
import { ElMessage } from 'element-plus'

const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        }
    }
})
const emits = defineEmits(['close', 'fetchData'])
const dialog = ref(null)
const deployForm = ref(null)
const state = reactive({
    title: $t('新增'),
    formData: {
        info: {}
    },
    rules: {
        'info.name': [{ required: true, message: $t('请输入名称！'), trigger: 'blur' }],
        'info.url': [{ required: true, message: $t('请输入唤醒H5地址！'), trigger: 'blur' }],
        'info.icon': [{ required: true, message: $t('请上传图标！'), trigger: 'change' }],
        sort: [{ required: true, message: $t('请输入排序值！'), trigger: 'blur' }],
    },
})

onMounted(() => {
    if (props.itemData.id) {
        state.title = $t('修改')
        state.formData = { ...props.itemData }
    }
})

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            dialog.value.showLoading()
            let obj = { ...state.formData.info }
            let params = {
                type: 4,
                sort: state.formData.sort,
            }
            params.info = JSON.stringify(obj)
            if (props.itemData.id) params.id = props.itemData.id
            postRebateSettingData(params).then(() => {
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