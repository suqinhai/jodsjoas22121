<template>
    <!-- 任务中心-新人福利-修改 -->
    <Dialog ref="dialog" width="600" :title="$t('修改')" top="10vh" @confirm="handleSubmit(deployFormRef)" @cancel="cancel">
        <el-form ref="deployFormRef" :model="state.formData" :rules="state.rules" :label-width="$locale == 'zh' ? '100px' : 'auto'">
            <el-form-item :label="$t('任务条件:')">
                {{metaData.newcomerTaskType.find(item => +item.value === state.formData.rewardType)?.label || ''}}
            </el-form-item>
            <el-form-item :label="$t('任务介绍:')" prop="name">
                <el-input v-model="state.formData.name" :placeholder="$t('请输入任务介绍')" />
            </el-form-item>
            <el-form-item :label="$t('图标:')" prop="icon">
                <UploadImage v-model="state.formData.icon" :width="128" :height="128" :size="200"
                    :tip="$t('请上传128*128或等比例，PNG/JPG/GIF格式小于200KB的图片')" />
            </el-form-item>
            <el-form-item :label="$t('奖励金额:')" prop="amount">
                <el-input-number v-model="state.formData.amount" style="width: 100%" :controls="false" :precision="2" :min="0"
                    :placeholder="$t('请输入奖励金额')" />
            </el-form-item>
            <el-form-item :label="$t('奖励活跃度:')" prop="point">
                <el-input-number v-model="state.formData.point" style="width: 100%" :controls="false" :precision="0" :min="0"
                    :placeholder="$t('请输入奖励活跃度')" />
            </el-form-item>
            <el-form-item :label="$t('奖励票券:')">
                <el-select v-model="state.formData.ticketType" :placeholder="$t('请选择票券类型')" @change="state.formData.ticketId = ''">
                    <el-option v-for="ims in metaData.ticketType" :key="ims.value" :label="ims.label" :value="+ims.value" />
                </el-select>
                <el-select filterable clearable v-model="state.formData.ticketId" :placeholder="$t('请选择票券')">
                    <el-option :disabled="ims.isDisabled" v-for="ims in provideData.getOptionData(state.formData)" :key="ims.id" :label="ims.name"
                        :value="ims.id">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('排序:')">
                <el-input-number v-model="state.formData.sort" style="width: 100%" :controls="false" :precision="0" :min="1"
                    :placeholder="$t('请输入排序')" />
            </el-form-item>
            <el-form-item :label="$t('是否开启:')">
                <el-switch v-model="state.formData.enable" />
            </el-form-item>
            <el-form-item :label="$t('提示气泡:')">
                <el-switch v-model="state.formData.tip" />
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted, inject } from 'vue'
import { postTaskRuleConfig } from '@/api/discounts_center.js'
import { deepClone } from "@/common/util"

const emits = defineEmits(['close', 'refreshData'])
const props = defineProps({
    currentIndex: {
        type: Number,
        default: 0
    },
    metaData: {
        type: Object,
        default: () => {
            return {}
        }
    },
    configData: {
        type: Object,
        default: () => {
            return {}
        }
    }
})
const state = reactive({
    formData: {},
    rules: {
        name: { required: true, message: $t('请输入任务介绍！'), trigger: 'blur' },
        icon: { required: true, message: $t('请上传图标！'), trigger: 'change' },
        amount: { required: true, message: $t('请输入奖励金额！'), trigger: 'blur' },
        point: { required: true, message: $t('请输入奖励活跃度！'), trigger: 'blur' },
    }
})
const deployFormRef = ref(null)
const dialog = ref(null)
const provideData = inject('provideData')

onMounted(() => {
    let { rewardType, name, icon, amount = undefined, point = undefined, sort = undefined, enable = 0, tip = 0, ticketType = 0, ticketId, ticketName } = props.configData.rule[props.currentIndex]
    state.formData = { rewardType, name, icon, enable, tip, amount, point, sort, ticketType, ticketId, ticketName }
})

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            let { amount, ticketId } = state.formData
            if (!amount && !ticketId) return ElMessage.warning($t('奖励金额和奖励票券必须配置一种！'))
            let arr = deepClone(props.configData.rule)
            arr.splice(props.currentIndex, 1, state.formData)
            dialog.value.showLoading()
            postTaskRuleConfig({
                id: props.configData.id,
                rule: JSON.stringify(arr)
            }).then(() => {
                cancel()
                emits('refreshData')
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
.welfare-deploy {
    .items-box {
        .el-form-item__label {
            display: none;
        }
    }
}
</style>
