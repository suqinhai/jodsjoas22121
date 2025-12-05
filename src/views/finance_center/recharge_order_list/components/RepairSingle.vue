<template>
    <!-- 财务中心-充值订单列表-补单 -->
    <Dialog ref="dialog" width="750" :title="$t('补单')" top="10vh" @confirm="handleSubmit(deployFormRef)" @cancel="cancel">
        <el-form ref="deployFormRef" class="create-order" :model="state.formData" :rules="state.rules"
            label-width="155px">
            <el-row>
                <el-col :span="10">
                    <el-form-item :label="$t('会员账号:')">
                        <span>{{props.orderData.username}}</span>
                    </el-form-item>
                </el-col>
                <el-col :span="14">
                    <el-form-item :label="$t('订单号:')">
                        <span>{{props.orderData.orderNo}}</span>
                    </el-form-item>
                </el-col>
            </el-row>
			<el-row>
			    <el-col :span="10">
			        <el-form-item :label="$t('订单金额:')">
			            <span>{{props.orderData.amount}}</span>
			        </el-form-item>
			    </el-col>
			    <el-col :span="14">
			        <el-form-item :label="$t('赠送金额:')">
			            <span>{{props.orderData.giftAmount}}</span>
			        </el-form-item>
			    </el-col>
			</el-row>
			<el-row>
				<el-col :span="20">
					<el-form-item :label="userData.merchantInfo.country === 'UZ' ? $t('实际到账金额（USDT）:') : $t('实际到账金额（本地币）:')" :label-width="$locale == 'zh' ? '175px' : 'auto'">
					    <span>{{props.orderData.totalAmount}}</span>
					</el-form-item>
				</el-col>
			</el-row>
			<el-form-item label="txid" prop="tradeNo">
                <el-input style="width: 100%" type="input" :placeholder="$t('请输入txid')"
                    v-model="state.formData.tradeNo" />
            </el-form-item>
           <el-form-item :label="$t('备注:')">
                <el-input style="width: 100%" type="textarea" :rows="3" :placeholder="$t('请输入备注')"
                    v-model="state.formData.remark" show-word-limit maxlength="255" />
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { postOperateOrder } from '@/api/finance'
import { ref, reactive, computed, onMounted } from 'vue'

const emits = defineEmits(['close', 'fetchData'])
const state = reactive({
    formData: {},
    rules: {
        tradeNo: { required: true, message: $t('请输入txid'), trigger: 'blur' },
    }
})
const deployFormRef = ref(null)
const dialog = ref(null)
const props = defineProps({
    orderData: {
        type: Object,
        default: {}
    }
})

const handleSubmit = (el)=>{
	el.validate((valid, fields) => {
	    if (valid) {
	        dialog.value.showLoading()
	        postOperateOrder({
	            id: props.orderData.id,
	        	merchantId: props.orderData.merchant.id,
	            force: false,
	        	...state.formData
	        }).then(() => {
	        	emits('close')
	            emits('fetchData')
	        	dialog.value.closeLoading()
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
.create-order {
}
</style>
