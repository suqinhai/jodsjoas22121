<template>
    <!-- 财务中心-提现风控审核-备注 -->
    <Dialog ref="dialog" width="550" :title="$t('备注')" top="10vh" buttonCenter @confirm="handleSubmit" @cancel="cancel"
        :operateActions="[$t('取消'), $t('保存')]">
        <el-form ref="auditForm" class="deploy-form" :model="state.formData">
            <el-form-item>
                <el-input v-model="state.formData.remark" type="textarea" rows="4" maxlength="300" show-word-limit :placeholder="$t('请输入备注')" />
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { postRemark } from "@/api/risk_control.js"

const emits = defineEmits(['close', 'fetchData'])
const props = defineProps({
    orderData: {
        type: Object,
        default: {}
    },
})
const state = reactive({
    formData: {}
})
const dialog = ref()


onMounted(() => {
    state.formData.remark = props.orderData.remark
})

const handleSubmit = () => {
    const params = {
        // merchantId: props.orderData.merchantId,
        id: props.orderData.id,
        remark: state.formData.remark,
        step: 1,
    }
    dialog.value.showLoading()
    postRemark(params).then(res => {
        cancel()
        emits('fetchData')
    }).catch(err => {
        dialog.value.closeLoading()
    })
}

const cancel = () => {
    emits('close')
}

</script>

<style lang="scss">
</style>