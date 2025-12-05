<template>
    <!-- 财务中心-转账订单列表-审核 -->
    <Dialog ref="dialog" width="550" :title="$t('拒绝')" top="10vh" buttonCenter @confirm="handleSubmit(auditForm)" @cancel="cancel"
        :operateActions="[$t('取消'), $t('拒绝')]">
        <el-form ref="auditForm" class="deploy-form" :model="state.formData" :rules="rules">
            <el-form-item prop="remark">
                <el-input v-model="state.formData.remark" type="textarea" rows="4" maxlength="255" show-word-limit :placeholder="$t('请输入前端备注')" />
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { postTransferReviewData } from "@/api/finance.js"

const emits = defineEmits(['close','fetchData'])

const state = reactive({
	formData: {}
})
const dialog = ref()
const auditForm = ref()

const props = defineProps({
    orderData: {
        type: Object,
        default: {}
    }
})

const rules = ref({
	remark: [{ required: true, message: $t('请输入前端备注'), trigger: 'blur' }],
})

const handleSubmit = (el)=>{
	el.validate((valid, fields) => {
	    if (valid) {
	        const params = {
	        	id: props.orderData.id,
	        	status: -9,
				...state.formData
	        }
	        dialog.value.showLoading()
	        postTransferReviewData(params).then(res => {
	            cancel()
	            emits('fetchData')
	        }).catch(err => {
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
</style>