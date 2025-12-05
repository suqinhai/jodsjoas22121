<template>
    <!-- 财务中心-转账提现列表-审核 -->
    <Dialog ref="dialog" width="550" :title="$t('审核')" top="10vh" buttonCenter @confirm="handleSubmit(auditForm)" @cancel="cancel"
        :operateActions="[$t('取消'), $t('保存')]">
        <el-form ref="auditForm" class="deploy-form" :model="state.formData" :rules="rules">
			<el-form-item prop="status">
				<el-radio-group v-model="state.formData.status">
					<el-radio :value="item.value" :label="item.value" v-for="(item,index) in batchTypeData">{{item.label}}</el-radio>
				</el-radio-group>
			</el-form-item>
            <el-form-item prop="remark">
                <el-input v-model="state.formData.remark" type="textarea" rows="4" maxlength="200" show-word-limit :placeholder="$t('请输入前端备注')" />
            </el-form-item>
			<div>{{$t('审核操作：')}}</div>
			<div>{{$t('1.锁定：点击锁定后只有锁定者可以操作该笔订单并显示')}}</div>
			<div>{{$t('2.解锁：当操作者解锁后，其他操作者可以锁定')}}</div>
			<div>{{$t('3.确认出款：已经转账成功，点击确认')}}</div>
			<div>{{$t('4.取消出款：取消出款后，出款额度将退回会员余额')}}</div>
			<div>{{$t('5.拒绝：拒绝出款后，出款额度将')}}<span style="color: red;">{{$t('不退回')}}</span>{{$t('会员余额')}}</div>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { postReviewOfflineData } from "@/api/finance.js"

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
    },
	batchTypeData: {
		type: Array,
		default: []
	}
})

const rules = ref({
    status: [{ required: true, message: $t('请选择状态'), trigger: 'blur' }],
	remark: [{ required: true, message: $t('请输入前端备注'), trigger: 'blur' }],
})

onMounted(()=>{
	if(props.orderData.ids) state.formData.status = props.batchTypeData[props.orderData.type].value
})

const handleSubmit = (el)=>{
	el.validate((valid, fields) => {
	    if (valid) {
	        const params = {
	        	status: state.formData.status,
	        	remark: state.formData.remark,
	        	type: state.formData.status === -1 ? 3 : 2
	        }
	        if(props.orderData.ids) params['ids'] = props.orderData.ids
	        if(!props.orderData.ids) params['id'] = props.orderData.id
	        if(state.formData.status === -1) params.status = 0
	        dialog.value.showLoading()
	        postReviewOfflineData(params).then(res => {
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