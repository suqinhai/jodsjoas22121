<template>
    <!-- 首页模块-游戏类型设置-修改 -->
    <Dialog ref="dialog" width="600" :title="$t('修改')" top="5vh" @confirm="handleSubmit(deployFormRef)" @cancel="cancel">
        <el-form ref="deployFormRef" :model="state.formData" :rules="state.rules" :label-width="$locale == 'zh' ? '120px' : 'auto'">
            <el-form-item :label="$t('游戏类型:')">
                <div>{{state.formData.i18Name}}</div>
            </el-form-item>
            <el-form-item :label="$t('排序:')" prop="sort">
                <el-input-number :disabled="state.formData.isDisabled" v-model="state.formData.sort" style="width: 150px" :controls="false"
                    :precision="0" :min="1" :placeholder="$t('请输入排序')" />
            </el-form-item>
            <template v-if="userData.getTemplateType() !== 4">
                <el-form-item :label="$t('激活图标:')" prop="icon">
                    <UploadImage v-model="state.formData.icon" :width="width" :height="height" :size="size" params="icon"
                        :tip="`${$t('请上传')}${width}*${height}${$t('或等比例，PNG/JPG/GIF格式小于')}${size}${$t('KB的图片')}`" />
                </el-form-item>
                <el-form-item :label="$t('未激活图标:')" prop="noIcon">
                    <UploadImage v-model="state.formData.noIcon" :width="width" :height="height" :size="size" params="noIcon"
                        :tip="`${$t('请上传')}${width}*${height}${$t('或等比例，PNG/JPG/GIF格式小于')}${size}${$t('KB的图片')}`" />
                </el-form-item>
            </template>
            <el-form-item :label="$t('首页显示行数:')" prop="homepageRows" v-if="!userData.isCustomTemplate">
                <el-input-number 
                :disabled="state.formData.isDisabled" 
                v-model="state.formData.homepageRows" 
                style="width: 150px" 
                :controls="false"
                :precision="0" 
                :min="1"
                :max="10"
                :placeholder="$t('请输入')" />
            </el-form-item>
            <el-form-item :label="$t('显示开关:')" v-if="state.formData.alias !== 'hot'">
                <el-switch v-model="state.formData.status" :active-value="1" :inactive-value="0" />
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import userStore from '@/store/user'
import { postHomeDeploy } from '@/api/website'

const emits = defineEmits(['close', 'fetchData'])
const props = defineProps({
    itemData: {
        type: Object,
        default: {}
    }
})
const width = 66
const height = 66
const size = 30
const state = reactive({
    formData: {},
    rules: {
        sort: { required: true, message: $t('请输入排序！'), trigger: 'blur' },
        icon: { required: true, message: $t('请上传激活图标！'), trigger: 'change' },
        noIcon: { required: true, message: $t('请上传未激活图标！'), trigger: 'change' },
        homepageRows: { required: true, message: $t('请输入！'), trigger: 'blur' },
    },
})
const deployFormRef = ref(null)
const dialog = ref(null)
const userData = userStore()

onMounted(() => {
    state.formData = { ...props.itemData }
})

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            let params = { ...state.formData }
            params.part = 'gameTypes'
            params.type = 'home'
            delete params.isDisabled
            dialog.value.showLoading()
            postHomeDeploy(params).then(() => {
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

<style lang="scss" scoped>
</style>
