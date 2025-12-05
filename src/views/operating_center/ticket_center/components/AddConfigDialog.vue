<template>
    <!-- 运营中心-票券中心-新增配置 -->
    <Dialog ref="dialogRef" :title="$t('票券配置')" @cancel="emits('close')" top="2vh" width="1040" @confirm="handleSubmit(dialogRef)">
		<el-form class="AddConfigDialog" ref="addFrom" :model="state.formData" :label-width="$locale == 'zh' ? '190px' : '300px'" :rules="state.rules">
			<el-form-item :label="$t('票券类型:')">
				<el-radio-group v-model="state.formData.type" :disabled="state.formData.id ? true : false" @change="changReraioGroup">
					<el-radio v-for="(item,index) in props.metaData.ticketType" :value="item.value" :label="item.value" :key="index" size="large">{{item.label}}</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item :label="$t('票券信息')" class="title"></el-form-item>
			<el-form-item :label="$t('票券名称:')" prop="name">
				<el-input v-model="state.formData.name" :placeholder="$t('请输入票券名称')" maxlength="50"/>
			</el-form-item>
			<el-form-item :label="$t('使用须知:')">
				<el-input v-model="state.formData.content" type="textarea" :rows="4" :placeholder="$t('请输入使用须知')" show-word-limit maxlength="1000"></el-input>
			</el-form-item>
			<el-form-item :label="$t('票券图片:')">
				<UploadImage v-model="state.formData.image" :width="220" :height="220"
					:tip="$t('请上传小于1024kb的220*220的图片')">
				</UploadImage>
			</el-form-item>
			<el-form-item :label="$t('设置金额及流水')" class="title"></el-form-item>
			<el-row>
			    <el-col :span="10" v-if="state.formData.type === 0">
			        <el-form-item :label="$t('奖励金额:')" prop="amountReward">
			            <el-input v-model="state.formData.amountReward" :placeholder="$t('请输入奖励金额')" class="w200"/>
			        </el-form-item>
			    </el-col>
			    <el-col :span="12">
			        <el-form-item :label="$t('稽核倍数要求:')" prop="auditMultiple">
			            <el-input-number v-model="state.formData.auditMultiple" :controls="false" :precision="2"
			                :placeholder="$t('请输入稽核倍数要求')" class="w200"/>
			        </el-form-item>
			    </el-col>
			</el-row>
			<el-form-item v-if="[1,2,3].includes(state.formData.type)">
				<div class="table">
					<div class="text">{{$t('注：单个中奖概率范围：0-100%，总中奖概率100%。')}}</div>
					<el-table class="table-box" border :data="state.formData.rewardConfig">
						<el-table-column prop="min" v-if="state.formData.type === 2 || state.formData.type === 3" :label="$t('金额')" align="center">
							<template #default="{ row }">
								 <el-input-number v-model="row.min" :controls="false" :precision="2"
								     :placeholder="$t('请输入金额')" />
						    </template>
						</el-table-column>
						<el-table-column prop="min" v-if="state.formData.type === 1" :label="$t('最小金额')" align="center">
							<template #default="{ row }">
								 <el-input-number v-model="row.min" :controls="false" :precision="2"
								     :placeholder="$t('请输入最小金额')" />
						    </template>
						</el-table-column>
						<el-table-column prop="max" v-if="state.formData.type === 1" :label="$t('最大金额')" align="center">
							<template #default="{ row }">
								 <el-input-number v-model="row.max" :controls="false" :precision="2"
								     :placeholder="$t('请输入最大金额')" />
						    </template>
						</el-table-column>
						<el-table-column prop="icon" v-if="state.formData.type === 3" :label="$t('图片(100*100)')" align="center">
							<template #default="{ row }">
								 <div class="img-upload">
									<UploadImage v-model="row.icon" :size="100" :width="100" :height="100" isCustomPreview @previewImage="previewPicture(row.icon)">
									</UploadImage>
								 </div>
						    </template>
						</el-table-column>
						<el-table-column prop="rate" :label="$t('中奖概率')" align="center">
							<template #default="{ row }">
								 <el-input-number v-model="row.rate" :controls="false" :precision="0"
								     :placeholder="$t('请输入中奖概率')" :max="100"/>
						    </template>
						</el-table-column>
					</el-table>
					<div class="button" v-if="[1,2].includes(state.formData.type)">
					    <el-button type="primary" v-if="state.formData.rewardConfig?.length < 8"  @click="addRewardConfig">+</el-button>
					    <el-button type="danger" @click="minusRewardConfig" v-if="state.formData.rewardConfig?.length > 1">-</el-button>
					</div>
				</div>
			</el-form-item>
			<el-form-item :label="$t('有效期:')" prop="expireType">
				<el-radio-group v-model="state.formData.expireType">
					<el-radio v-for="(item,index) in props.metaData.ticketExpireType" :value="item.value" :label="item.value" :key="item.value" size="large">
						{{item.label}}
						<span v-if="item.value === 1 && state.formData.expireType === 1">
							<el-input-number v-model="state.formData.expireHour" :controls="false" :precision="0" :min="1" style="width: 50px;margin-right: 5px;"/>{{$t('天')}}</span>
					</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item>
				<el-radio-group v-model="state.formData.receiveScope">
					<el-radio v-for="(item,index) in props.metaData.ticketReceiveScope" :value="item.value" :label="item.value" :key="item.value" size="large">
						{{item.label}}
					</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item :label="$t('领奖条件：（勾选后必填）:')">
			        <el-checkbox v-model="state.formData.rules.bindPhone">{{$t('手机号码')}}</el-checkbox>
					<el-checkbox v-model="state.formData.rules.cashAccount">{{$t('出款账号')}}</el-checkbox>
					<div class="block">
						<el-checkbox v-model="state.formData.rules.amountRuleState">{{$t('检测存款')}}</el-checkbox>
						<div class="line" v-if="state.formData.rules.amountRuleState">
							<span class="span-name">{{$t('总存款金额')}}</span>
							<el-select v-model="state.formData.rules.amountRule.amount.type" filterable clearable :placeholder="$t('请选择')" class="w200">
								<el-option v-for="item in props.metaData.ticketMinRule" :key="item.value" :label="item.label" :value="item.value" />
							</el-select>
							<span class="fh">≥</span><el-input-number v-model="state.formData.rules.amountRule.amount.min" :controls="false" :precision="2"
							    :placeholder="$t('请输入')" class="w200"/>
						</div>
						<div class="line" v-if="state.formData.rules.amountRuleState">
							<span class="span-name">{{$t('总存款次数')}}</span>
							<el-select v-model="state.formData.rules.amountRule.count.type" filterable clearable :placeholder="$t('请选择')" class="w200">
								<el-option v-for="item in props.metaData.ticketMinRule" :key="item.value" :label="item.label" :value="item.value" />
							</el-select>
							<span class="fh">≥</span><el-input-number v-model="state.formData.rules.amountRule.count.min" :controls="false" :precision="0"
							    :placeholder="$t('请输入')" class="w200" :min="0"/>
						</div>
					</div>
					<div class="block">
						<el-checkbox v-model="state.formData.rules.playRuleState">{{$t('检测投注')}}</el-checkbox>
						<div class="line" v-if="state.formData.rules.playRuleState">
							<span class="span-name">{{$t('游戏类型')}}</span>
							<el-select class="select-box w200" v-model="state.formData.rules.playRule.gameType" :placeholder="$t('请选择游戏类型')" clearable @change="changeGameTypes(true)">
							    <el-option v-for="item in props.metaData.gameType" :key="item.value" :label="item.label" :value="item.value" />
							</el-select>
							<span class="span-name ml10">{{$t('游戏厂家')}}</span>
							<el-select class="select-box w200" v-model="state.formData.rules.playRule.vendor" :placeholder="$t('请选择厂家')" clearable>
							    <el-option v-for="item in state.gameVendor" :key="item.value" :label="item.label" :value="item.value" />
							</el-select>
						</div>
						<div class="line" v-if="state.formData.rules.playRuleState">
							<span class="span-name">{{$t('有效投注')}}</span>
							<el-select v-model="state.formData.rules.playRule.validCoin.type" filterable clearable :placeholder="$t('请选择')" class="w200">
								<el-option v-for="item in props.metaData.ticketMinRule" :key="item.value" :label="item.label" :value="item.value" />
							</el-select>
							<span class="fh">≥</span><el-input-number v-model="state.formData.rules.playRule.validCoin.min" :controls="false" :precision="2"
							    :placeholder="$t('请输入')" class="w200" />
						</div>
					</div>
					<div class="block">
						<el-checkbox v-model="state.formData.rules.winLoseRuleState">{{$t('检测游戏输')}}</el-checkbox>
						<div class="line" v-if="state.formData.rules.winLoseRuleState">
							<span class="span-name">{{$t('总输金额')}}</span>
							<span><el-input-number v-model="state.formData.rules.winLoseRule.loseCoin" :controls="false" :precision="2"
							    :placeholder="$t('请输入')" style="width: 150px" /></span>
						</div>
					</div>
					<div class="block">
						<el-checkbox v-model="state.formData.rules.inviteRuleState">{{$t('邀请注册人数')}}</el-checkbox>
						<div class="line" v-if="state.formData.rules.inviteRuleState">
							<span class="span-name">{{$t('直属注册人数')}}</span>
							<span><el-input-number v-model="state.formData.rules.inviteRule.directCount" :controls="false" :precision="0"
							    :placeholder="$t('请输入')" style="width: 150px" /></span>
						</div>
					</div>
			</el-form-item>
		</el-form>
		<div v-if="state.dialogVisible && state.dialogImageUrl" class="preview" @click="state.dialogVisible = false">
		    <div class="preview-box">
		        <img class="preview-img" :src="state.dialogImageUrl" alt="">
		    </div>
		</div>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue"
import { postTicketAddOrEdit } from '@/api/operation.js'
import { deepClone } from '@/common/util'
import { getGameVendorList } from '@/api/common'

const emits = defineEmits(['close','refreshData'])
const props = defineProps({
    metaData: {
        type: Object,
        default: () => {
            return {}
        }
    },
	itemData: {
        type: Object,
        default: () => {
            return {}
        }
    },
})
const dialogRef = ref(null)
const state = reactive({
	dialogVisible: false,
	dialogImageUrl: '',
	formData: {
		expireType: 0,
		receiveScope: 1,
		type: 0,
		rewardConfig:[],
		rules: {
			bindPhone: false,
			cashAccount: false, 
			amountRule: { 
				amount: { 
				   type: '', 
				   min: '' 
				},
				count: { 
			       type: '', 
			       min: ''
			    }
			},
			playRule: { 
			    gameType: 'all',
			    vendor: 'all',
			    validCoin: {
			      type: '', 
			      min: ''
			    }
			},
			winLoseRule: {
			    loseCoin: ''
			},
			inviteRule: { 
			    directCount: ''
			}
		}
	},
	rules: {
		name: [{ required: true, message: $t('请输入票券名称'), trigger: 'blur' }],
		amountReward: [{ required: true, message: $t('请输入奖励金额'), trigger: 'blur' }],
		auditMultiple: [{ required: true, message: $t('请输入稽核倍数要求'), trigger: 'blur' }],
		expireType: [{ required: true, message: $t('请选择有效期'), trigger: 'change' }]
	},
	gameVendor: []
})

// 图片预览
const previewPicture = (val) => {
    state.dialogImageUrl = val
    state.dialogVisible = true
}

const changReraioGroup = ()=>{
	if([1,2].includes(state.formData.type)){
		state.formData.rewardConfig = [{}]
	}
	if([3].includes(state.formData.type)){
		state.formData.rewardConfig = [
			{icon:'/img/default/lucky_wheel_gold.png'},
			{icon:'/img/default/lucky_wheel_gold.png'},
			{icon:'/img/default/lucky_wheel_gold.png'},
			{icon:'/img/default/lucky_wheel_gold.png'},
			{icon:'/img/default/lucky_wheel_gold.png'},
			{icon:'/img/default/lucky_wheel_gold.png'},
			{icon:'/img/default/lucky_wheel_gold.png'},
			{icon:'/img/default/lucky_wheel_gold.png'},
		]
	}
}


const changeGameTypes = (clearGameVendors)=>{
	// 获取商家支持的厂家与游戏类型
	const types = state.formData.rules.playRule.gameType === 'all' ? '' : state.formData.rules.playRule.gameType
	getGameVendorList({ types: types }).then(data => {
		if(clearGameVendors) state.formData.rules.playRule.vendor = 'all'
		if(state.formData.rules.playRule.gameType === 'all'){
			state.gameVendor = [{value: 'all', label: $t('全部')}]
		}else{
			data.data.unshift({value: 'all', label: $t('全部')})
			state.gameVendor = data.data
		}
	})
}
	
onMounted(()=>{
	if(props.itemData.id){
		state.formData = {
			...deepClone(props.itemData) 
		}
		if(state.formData.type === 0){
			state.formData.amountReward = state.formData.rewardConfig[0].min
		}
		if(state.formData.expireType === 1){
			state.formData.expireHour = (state.formData.expireHour / 24)
		}
		state.formData.rules.inviteRuleState = state.formData.rules.inviteRule ? true : false
		state.formData.rules.winLoseRuleState = state.formData.rules.winLoseRule ? true : false
		state.formData.rules.playRuleState = state.formData.rules.playRule ? true : false
		state.formData.rules.amountRuleState = state.formData.rules.amountRule ? true : false
		if(!state.formData.rules.amountRuleState){
			state.formData.rules.amountRule = { 
				amount: { 
				   type: '', 
				   min: '' 
				},
				count: { 
			       type: '', 
			       min: ''
			    }
			}
		}
		if(!state.formData.rules.playRuleState){
		   state.formData.rules.playRule = { 
			    gameType: 'all',
			    vendor: 'all',
			    validCoin: {
			      type: '', 
			      min: ''
			    }
			}
		}else{
			state.formData.rules.playRule.gameType = state.formData.rules.playRule.gameType ? state.formData.rules.playRule.gameType : 'all'
			state.formData.rules.playRule.vendor = state.formData.rules.playRule.vendor ? state.formData.rules.playRule.vendor : 'all'
		}
		

		if(!state.formData.rules.winLoseRuleState){
		    state.formData.rules.winLoseRule = {
			    loseCoin: ''
			}
		}
		if(!state.formData.rules.inviteRuleState){
			state.formData.rules.inviteRule = { 
			    directCount: ''
			}
		}
	}
	changeGameTypes()
})

const addRewardConfig = ()=>{
	state.formData.rewardConfig.push({})
}

const minusRewardConfig = ()=>{
	state.formData.rewardConfig.pop()
}

const handleSubmit = ()=>{
	let formData = deepClone(state.formData)
	// formData.auditMode = 0
	if(formData.type === 0){
		formData.rewardConfig = [{'min': formData.amountReward}]
	}
	// if(!formData.rules.bindPhone && !formData.rules.cashAccount && !formData.rules.amountRuleState && 
	// !formData.rules.playRuleState && !formData.rules.winLoseRuleState && !formData.rules.inviteRuleState){
	// 	return ElMessage.warning($t('请选择领奖条件'))
	// }
	if(formData.expireType === 1){
		formData.expireHour = formData.expireHour * 24
	}else{
		delete formData.expireHour
	}
	if(!formData.rules.amountRuleState){
		delete formData.rules.amountRule
	}
	if(!formData.rules.playRuleState){
		delete formData.rules.playRule
	}else{
		if(formData.rules.playRule.gameType === 'all'){
			formData.rules.playRule.gameType = ''
		}
		if(formData.rules.playRule.vendor === 'all'){
			formData.rules.playRule.vendor = ''
		}	
	}
	if(!formData.rules.winLoseRuleState){
		delete formData.rules.winLoseRule
	}
	if(!formData.rules.inviteRuleState){
		delete formData.rules.inviteRule
	}
	delete formData.rules.inviteRuleState
	delete formData.rules.winLoseRuleState
	delete formData.rules.playRuleState
	delete formData.rules.amountRuleState
	delete formData.amountReward
	formData.rewardConfig = JSON.stringify(formData.rewardConfig)
	formData.rules = JSON.stringify(formData.rules)
	dialogRef.value.showLoading()
	postTicketAddOrEdit(formData).then(() => {
		emits('close')
	    emits('refreshData')
	}).catch(() => {
	    dialogRef.value.closeLoading()
	})
}

</script>

<style lang="scss">
.AddConfigDialog{
	.title{
		.el-form-item__label{
			font-size: 20px;
			font-weight: bold;
			padding-left: 10px;
		}
	}
	.span-name{
		margin-right: 10px;
	}
	.fh{
		margin: 0 10px;
	}
	.line{
		margin-bottom: 10px;
	}
	.ml10{
		margin-left: 10px;
	}
	.w200{
		width: 200px;
	}
	.table{
		.text{
			margin-bottom: 10px;
		}
	}
	.table-box{
		width:500px;
		display: inline-block;
		vertical-align: bottom;
	}
	.button{
		display: inline-block;
		display: inline-block;
		vertical-align: bottom;
		margin-left: 10px;
	}
	.el-form-item__content{
		margin-top: -2px;
		.el-radio__input{
			margin-top: -2px;
		}
	}
	.img-upload{
		.el-upload-list__item,.el-upload{
			width: 80px;
			height: 80px;
		}
	}
}

</style>
