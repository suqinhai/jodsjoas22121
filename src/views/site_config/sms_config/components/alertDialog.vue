<template>
    <!-- 短信配置-余额不足提醒设置 -->
    <Dialog :title="$t('余额不足提醒设置')" ref="dialog" width="500" @confirm="confirmEdit(formRef)" @cancel="emits('close')">
        <el-form ref="formRef" :model="state.formData" :rule="state.rules" label-width="auto">
            <el-form-item :label="$t('短信商余额≤')" prop="smsBalance">
                <el-input-number v-model="state.formData.smsBalance" :min="0" :placeholder="$t('请输入短信商余额')" />
            </el-form-item>
            <el-form-item :label="$t('通知内容:')" prop="remindContent">
                <el-input v-model="state.formData.remindContent" type="textarea" :placeholder="$t('请输入通知内容')" show-word-limit rows="6"
                    maxlength="1000" />
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { postEditSmsRemind } from '@/api/merchant_center'
import userStore from '@/store/user'

const prop = defineProps(['remindInfo'])
const emits = defineEmits(['close', 'refresh'])
const state = reactive({
    formData: {},
    rules: {
        smsBalance: [{ required: true, message: $t('请输入短信商余额！'), trigger: 'blur' }],
        remindContent: [{ required: true, message: $t('请输入通知内容！'), trigger: 'blur' }]
    },
})
const userData = userStore()
const dialog = ref(null)
const formRef = ref(null)

onMounted(() => {
    if (prop.remindInfo) {
        state.formData.smsBalance = prop.remindInfo.smsBalance
        state.formData.remindContent = prop.remindInfo.remindContent
    }
})
const confirmEdit = (val) => {
    val.validate((valid) => {
        if (valid) {
            let params = {
                ...state.formData,
                id: userData.userInfo.merchantId
            }
            dialog.value.showLoading()
            postEditSmsRemind(params).then(() => {
                emits('refresh')
                emits('close')
            }).catch(() => {
                dialog.value.closeLoading()
            })
        } else {
            ElMessage.warning($t('请完善表单内容再进行提交'))
        }
    })
}
</script>

<style lang="scss">
</style>