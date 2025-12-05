<template>
    <!-- 运营中心-网红排行榜奖励-网红排行榜数据表格-配置赠送/批量赠送 -->
    <Dialog ref="dialog" width="500" :title="itemData.userIds ? $t('批量赠送') : $t('配置赠送') " buttonCenter top="15vh" @confirm="handleSubmit(operateForm)"
        @cancel="cancel">
        <el-form ref="operateForm" :rules="state.rules" :model="state.formData" label-width="auto">
            <el-form-item v-if="itemData.userIds" :label="$t('已选择人数:')">
                {{ itemData.userIds.length }}
            </el-form-item>
            <template v-else>
                <el-form-item :label="$t('网红ID:')">
                    {{ itemData.user?.id || '' }}
                </el-form-item>
                <el-form-item :label="$t('网红账号:')">
                    {{ itemData.user?.name || '' }}
                </el-form-item>
            </template>
            <el-form-item :label="$t('奖励金额:')" prop="reward">
                <el-input-number v-model="state.formData.reward" :controls="false" :precision="2" :min="0" :max="99999999"
                    :placeholder="$t('请输入奖励金额')" />
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { postBloggerGiveReward } from '@/api/operation'

const emits = defineEmits(['fetchData', 'close'])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        }
    },
    type: {
        type: Number,
        default: 0,
    },
})
const state = reactive({
    formData: {},
    rules: {
        reward: { required: true, message: $t('请输入奖励金额！'), trigger: 'blur' },
    }
})
const dialog = ref(null)
const operateForm = ref(null)

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            if (props.itemData.userIds) {
                state.formData.userIds = props.itemData.userIds.join(',')
            } else {
                state.formData.userIds = props.itemData.user.id
            }
            state.formData.rewardType = props.itemData.userIds ? 1 : 0
            state.formData.merchantId = props.itemData.merchantId
            dialog.value.showLoading()
            postBloggerGiveReward(state.formData).then(() => {
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
.deploy-tips {
    color: red;
}
</style>
