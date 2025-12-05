<!--
 * @Author: yilaisai
 * @Date: 2025-04-18 10:36:14
 * @LastEditors: yilaisai
 * @LastEditTime: 2025-04-18 13:03:27
-->
<template>
    <!-- 客服配置-常见问题-新增/编辑 -->
    <Dialog ref="dialog" width="900" :title="state.title" top="5vh" @confirm="handleSubmit(deployForm)" @cancel="cancel">
        <el-form ref="deployForm" :rules="state.rules" :model="state.formData" :label-width="$locale == 'zh' ? '100px' : 'auto'">
            <el-form-item :label="$t('排序:')" prop="sort">
                <el-input-number v-model="state.formData.sort" style="width: 150px" :controls="false" :precision="0" :min="1"
                    :placeholder="$t('请输入排序值')" />
            </el-form-item>
            <el-form-item :label="$t('问题标题:')" prop="title">
                <el-input v-model="state.formData.title" :placeholder="$t('请输入问题标题')" type="textarea" :rows="4" maxlength="100" show-word-limit />
            </el-form-item>
            <el-form-item :label="$t('图标:')" prop="iconUrl" v-if="userData.getTemplateType() !== 4">
                <UploadImage v-model="state.formData.iconUrl" :width="100" :height="100" :size="100"
                    :tip="$t('请上传100*100或等比例，PNG/JPG/GIF格式小于100KB的图片')" />
            </el-form-item>
            <el-form-item :label="$t('问题说明:')" prop="content">
                <Tinymce v-model="state.formData.content" :width="$locale == 'zh' ? 'auto' : '650px'"></Tinymce>
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { postCommonProblemData } from '@/api/service'
import userStore from '@/store/user'

const emits = defineEmits(['close', 'fetchData'])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        }
    },
})
const dialog = ref(null)
const deployForm = ref(null)
const state = reactive({
    formData: {},
    title: $t('新增'),
    rules: {
        sort: [{ required: true, message: $t('请输入排序值！'), trigger: 'blur' }],
        title: [{ required: true, message: $t('请输入问题标题！'), trigger: 'blur' }],
        iconUrl: [{ required: true, message: $t('请上传图标！'), trigger: 'change' }],
        content: [{ required: true, message: $t('请输入问题说明！'), trigger: 'blur' }],
    },
})
const userData = userStore()

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
            postCommonProblemData(state.formData).then(() => {
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
