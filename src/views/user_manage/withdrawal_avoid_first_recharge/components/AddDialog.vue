<template>
    <!-- 会员提现免首充-新增 -->
    <Dialog ref="dialog" width="500" :title="$t('新增')" buttonCenter top="15vh" @confirm="handleSubmit(operateForm)" @cancel="cancel">
        <el-form ref="operateForm" :rules="state.rules" :model="state.formData" :label-width="$locale == 'zh' ? '70px' : 'auto'">
            <el-form-item :label="$t('会员ID:')" prop="userIds">
                <el-input @input="(val) => state.formData.userIds = val.replace('，','')" v-model="state.formData.userIds" style="width: 100%"
                    type="textarea" :rows="4" :placeholder="$t('请输入会员ID，多个请用英文逗号隔开')" />
            </el-form-item>
            <el-form-item :label="$t('备注:')">
                <el-input v-model="state.formData.remark" style="width: 100%" type="textarea" :rows="4" :placeholder="$t('请输入备注')" />
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { ref, reactive } from 'vue'
import { postCashIgnoreData } from '@/api/member.js'

const emits = defineEmits(['fetchData', 'close'])
const dialog = ref(null)
const operateForm = ref(null)
const state = reactive({
    formData: {},
    rules: {
        userIds: [
            { required: true, message: $t('请输入会员ID！'), trigger: 'blur' },
            {
                pattern: /^\d[0-9,]*$/,
                message: $t('请输入正确的会员ID，多个请用英文逗号隔开！'),
                trigger: 'change',
            },
        ],
    }
})

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            dialog.value.showLoading()
            postCashIgnoreData(state.formData).then(() => {
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
