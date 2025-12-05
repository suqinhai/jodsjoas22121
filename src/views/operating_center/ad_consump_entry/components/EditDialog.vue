<template>
    <!-- 运营中心-广告消耗录入-录入/修改 -->
    <Dialog ref="dialogRef" :title="props.itemData.type === 'edit' ? $t('修改') : $t('录入')" @cancel="emits('close')" top="2vh" width="600" @confirm="handleSubmit(operateForm)">
		<el-form ref="operateForm" :rules="state.rules" :model="state.formData" label-width="120">
		    <el-form-item :label="$t('选择站点:')">
		        <MerchantSiteSelect disabled isNeedDefault :clearable="false" style="width: 200px" v-model="state.formData.siteId" :disabled="false"/>
		    </el-form-item>
			<el-form-item :label="$t('选择日期:')">
			    <el-date-picker value-format="YYYY-MM-DD" v-model="state.formData.period" type="date" :placeholder="$t('请选择')" :disabled-date="disableFutureDates" />
			</el-form-item>
			<el-form-item :label="$t('输入金额:')">
			    <el-input-number v-model="state.formData.fee" style="width: 100%" :controls="false" :precision="2" :min="0"
			        :placeholder="$t('请输入输入金额')" />
			</el-form-item>
			<el-form-item :label="$t('输入备注内容:')">
			     <el-input v-model="state.formData.remark" type="textarea" :placeholder="$t('输入备注内容')" :rows="4" show-word-limit maxlength="500"></el-input>
			</el-form-item>
		</el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue"
import { postAddOrEdit } from '@/api/operation.js'

const emits = defineEmits(["close","fetchDataEnterAmountDialog"])
const dialogRef = ref(null)
const operateForm = ref(null)

const state = reactive({
    formData: {},
    rules: {}
})

const props = defineProps({
    itemData: {
		type: Object,
		default: () => {
			return {}
		}
	},
})


onMounted(()=>{
	if(props.itemData.type === 'edit'){
		state.formData.id = props.itemData.id
		state.formData.siteId = props.itemData.merchantId
		state.formData.period = props.itemData.period_
		state.formData.fee = props.itemData.fee
		state.formData.remark = props.itemData.remark
	}else{
		state.formData.siteId = props.itemData.id
	}
})


const disableFutureDates = (date)=> {
      const today = new Date(); // 当前日期
	  today.setHours(0, 0, 0, 0); // 去除时间部分
	  return date.getTime() > today.getTime(); // 禁用大于今天的日期
}

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            dialogRef.value.showLoading()
            postAddOrEdit(state.formData).then(() => {
                emits('close')
                emits('fetchDataEnterAmountDialog',{type: props.itemData.type})
				dialogRef.value.closeLoading()
            }).catch(err => {
				dialogRef.value.closeLoading()
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
