<template>
    <!-- 顶部-提示音设置 -->
    <Dialog ref="dialog" :width="$locale == 'zh' ? '400' : '500'" :title="$t('提示音设置')" buttonCenter top="15vh" @confirm="handleSubmit(deployForm)"
        @cancel="cancel">
        <el-form ref="deployForm" :rules="state.rules" :model="state.formData" label-width="auto">
            <el-form-item :label="$t('间隔时间:')" prop="rpt">
                <el-input-number style="margin-right: 5px" v-model="state.formData.rpt" :controls="false" :precision="0" :min="0"
                    :placeholder="$t('请输入间隔时间')" />S
            </el-form-item>
            <div v-for="item in MSG_REMINDING_PATH_PERMISS" :key="item.key">
                <el-form-item :label="item.label + ':'" v-if="userData.isHasMenuPermiss(item.permissCode)">
                    <el-switch v-model="state.formData[item.key]" :active-value="1" :inactive-value="0" />
                </el-form-item>
            </div>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted, defineEmits } from 'vue'
import { ElMessage } from 'element-plus'
import { postMsgRemindingConfig } from '@/api/common'
import userStore from '@/store/user'
import {
    MSG_REMINDING_PATH_PERMISS,
} from '@/common/util/appConfig'

const emits = defineEmits(['close'])
const userData = userStore()
const dialog = ref(null)
const deployForm = ref(null)
const state = reactive({
    formData: {},
    rules: {
        rpt: [
            { required: true, message: $t('请输入间隔时间！'), trigger: 'blur' },
            { type: 'number', min: 100, max: 3600, message: $t('请输入大于等于100小于3600的整数！'), trigger: 'change' }
        ],
    }
})

onMounted(() => {
    state.formData = { ...userData.msgRemindingConfig }
})

const handleSubmit = (el) => {
    el.validate(async (valid, fields) => {
        if (valid) {
            try {
                state.formData.msg = 0
                state.formData.profitspy = 0
                dialog.value.showLoading()
                await postMsgRemindingConfig({ conf: JSON.stringify(state.formData) })
                userData.getRemindingConfig('reset')
                cancel()
            } catch (err) {
                dialog.value.closeLoading()
            }
        } else {
            ElMessage.warning($t('请完善表单内容再进行提交！'))
        }
    })
}

const cancel = () => {
    emits('close')
}

</script>

<style  lang="scss">
.edit-password {
}
</style>
