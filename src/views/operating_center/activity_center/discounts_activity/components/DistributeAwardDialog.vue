<template>
    <!-- 运营中心-优惠活动列表-活动列表/已关闭活动-自定义活动-奖励审核派发-派发奖励 -->
    <Dialog ref="dialog" width="400" :title="$t('派发奖励')" top="10vh" buttonCenter @confirm="handleSubmit(deployFormRef)" @cancel="cancel">
        <el-form class="rule-deploy" ref="deployFormRef" :model="state.formData" :rules="state.rules" :label-width="$locale == 'zh' ? '85px' : 'auto'">
            <el-form-item :label="$t('奖励金额:')" prop="reward">
                <el-input-number v-model="state.formData.reward" style="width: 100%" :controls="false" :precision="2" :min="0.01"
                    :placeholder="$t('请输入奖励金额')" />
            </el-form-item>
            <el-form-item :label="$t('稽核倍数:')" prop="auditMultiple">
                <el-input-number v-model="state.formData.auditMultiple" style="width: 100%" :controls="false" :precision="2" :min="0"
                    :placeholder="$t('请输入稽核倍数')" />
            </el-form-item>
            <el-form-item :label="$t('领取方式:')" prop="status">
                <el-select style="width: 100%" v-model="state.formData.status" :placeholder="$t('请选择领取方式')">
                    <el-option v-for="item in metaData.dispatchMode" :key="item.value" :label="item.label" :value="+item.value" />
                </el-select>
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { postActivityAward } from '@/api/discounts_center'
import { ref, reactive } from 'vue'

const emits = defineEmits(['close', 'refresh'])
const props = defineProps({
    metaData: {
        type: Object,
        default: () => {
            return {}
        }
    },
    auditData: {
        type: Object,
        default: () => {
            return {}
        },
    },
})
const state = reactive({
    formData: {},
    rules: {
        reward: [{ required: true, message: $t('请输入奖励金额！'), trigger: 'blur' }],
        auditMultiple: [{ required: true, message: $t('请输入稽核倍数！'), trigger: 'blur' }],
        status: [{ required: true, message: $t('请选择领取方式！'), trigger: 'change' }]
    }
})
const deployFormRef = ref(null)
const dialog = ref(null)

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            let params = { ...state.formData }
            params.status = params.status === 2 ? 5 : 2
            params.ids = props.auditData.id
            params.promotionId = props.auditData.promotionId
            params.all = false
            dialog.value.showLoading()
            postActivityAward(params).then(() => {
                cancel()
                emits('refresh')
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
.rule-deploy {
    .items-box {
        .el-form-item__label {
            display: none;
        }
    }
}
</style>
