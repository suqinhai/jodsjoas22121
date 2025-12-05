<template>
    <!-- 运营中心-优惠活动列表-活动列表/已关闭活动-新人彩金活动-兑换码管理-生成兑换码 -->
    <Dialog ref="dialog" width="400" :title="$t('生成兑换码')" buttonCenter top="15vh" @confirm="handleSubmit(operateForm)" @cancel="cancel">
        <el-form ref="operateForm" :rules="state.rules" :model="state.formData" :label-width="$locale == 'zh' ? '100px' : 'auto'">
            <el-form-item :label="$t('兑换码数量:')" prop="count">
                <el-input-number style="width: 100%" v-model="state.formData.count" :controls="false" :precision="0" :min="1" :max="99999"
                    :placeholder="$t('请输入兑换码数量')" />
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { ref, reactive } from 'vue'
import { postRedeemCodeConfig } from '@/api/discounts_center.js'

const emits = defineEmits(['refresh', 'close'])
const props = defineProps({
    activityId: {
        type: Number,
        default: ''
    },
})
const dialog = ref(null)
const operateForm = ref(null)
const state = reactive({
    formData: {},
    rules: {
        count: [{ required: true, message: $t('请输入兑换码数量！'), trigger: 'blur' }],
    }
})

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            state.formData.id = props.activityId
            dialog.value.showLoading()
            postRedeemCodeConfig(state.formData).then(() => {
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

<style scoped lang="scss">
</style>
