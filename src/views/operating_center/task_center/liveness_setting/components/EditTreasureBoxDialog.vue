<template>
    <!-- 任务中心-活跃度设置-修改 -->
    <Dialog ref="dialog" :width="$locale == 'zh' ? 500 : 540" :title="$t('修改')" top="15vh" buttonCenter @confirm="handleSubmit(deployFormRef)"
        @cancel="cancel">
        <el-form class="treasure-box-deploy" ref="deployFormRef" :model="state.formData" :rules="state.rules"
            :label-width="$locale == 'zh' ? '100px' : '155px'">
            <el-form-item :label="$t('宝箱名称:')" prop="name">
                <el-input v-model="state.formData.name" :placeholder="$t('请输入宝箱名称')" maxlength="20" show-word-limit />
            </el-form-item>
            <el-form-item :label="$t('所需活跃度:')" prop="point">
                <el-input-number v-model="state.formData.point" style="width: 100%" :controls="false" :precision="0" :min="0"
                    :placeholder="$t('请输入所需活跃度')" />
            </el-form-item>
            <el-form-item :label="$t('奖励类型:')" prop="random">
                <el-radio-group v-model="state.formData.random">
                    <el-radio :label="true">{{$t('随机')}}</el-radio>
                    <el-radio :label="false">{{$t('固定')}}</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item :label="$t('奖励金额:')" prop="reward" v-if="!state.formData.random">
                <el-input-number v-model="state.formData.reward" style="width: 100%" :controls="false" :precision="2" :min="0"
                    :placeholder="$t('请输入奖励金额')" />
            </el-form-item>
            <el-form-item :label="$t('奖励金额:')" v-if="state.formData.random" class="items-box">
                <el-form-item prop="min" label-width="0px">
                    <el-input-number v-model="state.formData.min" style="width: 100%" :controls="false" :precision="2" :min="0"
                        :placeholder="$t('请输入奖励金额')" />
                </el-form-item>
                <span style="margin: 0 5px">~</span>
                <el-form-item prop="max" label-width="0px">
                    <el-input-number v-model="state.formData.max" style="width: 100%" :controls="false" :precision="2" :min="0"
                        :placeholder="$t('请输入奖励金额')" />
                </el-form-item>
            </el-form-item>

        </el-form>
    </Dialog>
</template>

<script setup>
import { postTaskRuleConfig } from '@/api/discounts_center.js'
import { ref, reactive, onMounted } from 'vue'
import { deepClone } from '@/common/util'

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
        name: { required: true, message: $t('请输入宝箱名称！'), trigger: 'blur' },
        point: { required: true, message: $t('请输入所需活跃度！'), trigger: 'blur' },
        random: { required: true, message: $t('请选择奖励类型！'), trigger: 'change' },
        reward: { required: true, message: $t('请输入奖励金额！'), trigger: 'blur' },
        min: { required: true, message: $t('请输入奖励金额！'), trigger: 'blur' },
        max: [
            { required: true, message: $t('请输入奖励金额！'), trigger: 'blur' },
            {
                validator: (rule, value, callback) => {
                    if (value >= 0 && state.formData.min >= 0 && value < state.formData.min) {
                        callback(new Error(`${$t('请输入大于等于')}${state.formData.min}${$t('的数值')}`))
                    } else {
                        callback()
                    }
                }, trigger: 'change'
            }
        ],
    }
})
const deployFormRef = ref(null)
const dialog = ref(null)

onMounted(() => {
    let { name, point = undefined, random = false, reward = undefined, min = undefined, max = undefined } = props.configData.rule[props.currentIndex]
    state.formData = {
        name,
        point,
        random,
        reward,
        min,
        max,
    }
})

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
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
.treasure-box-deploy {
    .items-box {
        .el-form-item__content {
            display: flex;
            .el-form-item {
                width: 47%;
            }
            .el-form-item__label {
                display: none;
            }
        }
    }
}
</style>
