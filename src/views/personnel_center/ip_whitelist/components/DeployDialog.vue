<template>
    <Dialog ref="dialog" width="500" :title="itemData.merchant ? $t('修改'):$t('新增')" top="10vh" @confirm="handleSubmit(operateForm)" @cancel="cancel">
        <el-form ref="operateForm" :rules="state.rules" :model="state.formData" :label-width="$locale == 'zh' ? '65px' : 'auto'">
            <el-form-item label="IP:" prop="ips">
                <el-input @input="(val) => state.formData.ips = val.replace('，','')" v-model="state.formData.ips" type="textarea" style="width:100%"
                    :rows="4" :placeholder="$t('请输入IP，多个需要用英文逗号隔开')" />
            </el-form-item>
            <el-form-item :label="$t('备注:')">
                <el-input style="width: 100%" type="textarea" :rows="4" :placeholder="$t('请输入备注')" v-model="state.formData.remark" show-word-limit
                    maxlength="50" />
            </el-form-item>

        </el-form>
    </Dialog>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { ref, reactive, onMounted } from 'vue'
import { postMerchantWhitelistConfig } from '@/api/manage_config'

const emits = defineEmits(['fetchData', 'close'])
const props = defineProps({
    itemData: {
        type: Object,
        default: {}
    },
})
const dialog = ref(null)
const operateForm = ref(null)
const state = reactive({
    formData: {},
    rules: {
        ips: [
            { required: true, message: $t('请输入IP！'), trigger: 'blur' },
            {
                pattern: /^\d[0-9.,]*\d$/,
                message: $t('请输入正确格式的IP，多个需要用英文逗号隔开！'),
                trigger: 'change',
            }
        ],
    },
})

onMounted(() => {
    if (props.itemData.id) {
        let { remark, ips, id, group } = props.itemData
        state.formData = {
            remark,
            ips,
            id,
            merchantId: group.id
        }
    }

})

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            state.formData.type = 1
            dialog.value.showLoading()
            postMerchantWhitelistConfig(state.formData).then(() => {
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
