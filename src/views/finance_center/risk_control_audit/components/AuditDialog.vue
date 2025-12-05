<template>
    <!-- 财务中心-提现风控审核-审核 -->
    <Dialog ref="dialog" width="600" :title="$t('风控审核')" top="10vh" buttonCenter :otherActions="[$t('拒绝')]" :operateActions="[$t('取消'),$t('通过')]"
        @confirm="handleSubmit(1)" @cancel="cancel" @otherEvent="handleSubmit(0)">
        <el-form ref="formRef" :model="formData" :label-width="$locale == 'zh' ? '130px' : 'auto'" :rules="rules">
            <el-form-item :label="$t('会员账号:')">
                {{itemData.user && itemData.user.name ? itemData.user.name : '' }}
            </el-form-item>
            <el-form-item :label="$t('会员层级:')">
                {{itemData.layerName || '' }}
            </el-form-item>
            <el-form-item :label="$t('账号风控触发次数:')">
                {{itemData.accountRiskNum || 0 }}
                <el-button v-throttle :disabled="!itemData.accountRiskNum" type="primary" text
                    @click="router.push(`/risk-center/brush-monitoring?userId=${itemData.user.id}`)">{{$t('点击查看')}}</el-button>
            </el-form-item>
            <el-form-item :label="$t('游戏风控触发次数:')">
                {{itemData.gameRiskNum || 0 }}
                <el-button v-throttle :disabled="!itemData.gameRiskNum" type="primary" text
                    @click="router.push(`/risk-center/game-profit-monitor?userId=${itemData.user.id}`)">{{$t('点击查看')}}</el-button>
            </el-form-item>
            <el-form-item :label="$t('备注:')" prop="remark">
                <el-input type="textarea" :rows="6" :placeholder="$t('请输入备注')" v-model="formData.remark" show-word-limit maxlength="100" />
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { postRiskControlFirstVerify } from '@/api/finance'

const emits = defineEmits(['fetchData', 'close'])
const props = defineProps({
    itemData: {
        type: Object,
        default: {}
    },
})
const dialog = ref(null)
const formData = ref({})
const rules = ref({
    remark: [{ required: true, message: $t('请输入备注！'), trigger: 'blur' }],
})
const router = useRouter()

const formRef = ref(null)

const handleSubmit = (status) => {
    formRef.value.validate(valid => {
        if (!valid) return
        
        let params = {
            remark: formData.value.remark,
            id: props.itemData.id,
            status,
        }
        dialog.value.showLoading()
        postRiskControlFirstVerify(params)
            .then(() => {
                cancel()
                emits('fetchData')
            })
            .catch(() => {
                dialog.value.closeLoading()
            })
    })
}

const cancel = () => {
    emits('close')
}
</script>

<style lang="scss">
</style>
