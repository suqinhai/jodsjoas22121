<template>
    <!-- 短信配置-修改短信配置 -->
    <Dialog :title="$t('修改短信配置')" width="500" ref="dialog" @confirm="confirmEdit(formRef)" @cancel="emits('close')">
        <el-form ref="formRef" :model="state.formData" :label-width="$locale == 'zh' ? '100px' : 'auto'" :rule="state.rules">
            <el-form-item :label="$t('商户ID:')">{{merchantInfo.merchant && merchantInfo.merchant.id}}</el-form-item>
            <el-form-item :label="$t('短信提供商:')">
                <el-select v-model="state.formData.vendor" :placeholder="$t('请选择短信提供商')">
                    <el-option v-for="item in vendorList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item label="apikey:" prop="apikey">
                <el-input v-model="state.formData.apikey"></el-input>
            </el-form-item>
            <el-form-item label="secret:" prop="secret">
                <el-input v-model="state.formData.secret"></el-input>
            </el-form-item>
            <el-form-item label="appid:">
                <el-input v-model="state.formData.appid"></el-input>
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { postEditSms } from '@/api/merchant_center'

const prop = defineProps({
    merchantInfo: {
        type: Object,
        default: () => {
            return {}
        }
    },
    vendorList: {
        type: Array,
        default: () => []
    },
})
const emits = defineEmits(['close', 'refresh'])
const state = reactive({
    formData: {},
    rules: {
        apikey: [{ required: true, message: $t('请输入apikey'), trigger: 'blur' }],
        secret: [{ required: true, message: $t('请输入secret'), trigger: 'blur' }]
    },
})
const dialog = ref(null)
const formRef = ref(null)

onMounted(() => {
    const { param = {} } = prop.merchantInfo
    state.formData.vendor = param.vendor
    state.formData.apikey = param.username
    state.formData.secret = param.password
    state.formData.appid = param.appId
})

const confirmEdit = (val) => {
    val.validate((valid) => {
        if (valid) {
            const { vendor, apikey, secret, appid } = state.formData
            let props = {
                vendor: vendor,
                username: apikey,
                password: secret,
                appId: appid
            }
            let params = {
                smsVendor: vendor,
                props: JSON.stringify(props),
                id: prop.merchantInfo.merchant.id
            }
            dialog.value.showLoading()
            postEditSms(params).then(res => {
                if (res.code === 0) {
                    emits('refresh')
                    emits('close')
                }
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