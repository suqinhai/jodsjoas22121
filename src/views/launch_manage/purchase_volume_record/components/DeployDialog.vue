<template>
    <!-- 广告消耗录入-渠道消耗金额录入 -->
    <Dialog ref="dialog" width="670" :title="$t('渠道消耗金额') + (!state.formData.id ? $t('录入') : $t('修改'))" buttonCenter top="10vh" @confirm="handleSubmit(operateForm)" @cancel="cancel">
        <el-form ref="operateForm" :rules="state.rules" :model="state.formData" :label-width="$locale == 'zh' ? '150px' : 'auto'">
            <el-form-item :label="$t('站点:')" prop="merchantId">
                <MerchantSiteSelect @change="getChannelDataList" isNeedDefault :clearable="false" style="width: 200px" v-model="state.formData.merchantId" />
            </el-form-item>
			<el-form-item :label="$t('选择渠道:')" prop="channelId">
                <el-select v-model="state.formData.channelId" :placeholder="$t('请选择渠道')" style="width: 196px">
                    <el-option v-for="item in state.channelList" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('消耗金额（USDT）:')" prop="cost">
                <el-input-number style="width: 196px" v-model="state.formData.cost" :controls="false" :precision="0" :min="0"
                    :placeholder="$t('请输入消耗金额')" />
            </el-form-item>
            <el-form-item :label="$t('消耗日期:')" prop="reportTime">
                <el-date-picker style="width: 196px" v-model="state.formData.reportTime" type="date" :placeholder="$t('请选择日期')"
                    value-format="YYYY-MM-DD" :disabled="itemData.type === 'edit'"/>
            </el-form-item>
			<el-form-item :label="$t('备注:')" prop="remark">
			    <el-input style="width: 100%" type="textarea" :rows="4" :placeholder="$t('请输入备注')" v-model="state.formData.remark" show-word-limit
			        maxlength="100" />
			</el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { ref, reactive, onMounted } from 'vue'
import commonStore from '@/store/common'
import { postPurchaseVolumeData } from '@/api/data_center.js'
import { getChannelData } from '@/api/common'
import { disabledCurrentDateAfter } from '@/common/util'

const emits = defineEmits(['fetchData', 'close'])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        }
    },
})
const dialog = ref(null)
const operateForm = ref(null)
const commonData = commonStore()
const state = reactive({
    formData: {},
    rules: {
		merchantId: { required: true, message: $t('请选择站点') + '！', trigger: 'change' },
        channelId: { required: true, message: $t('请选择渠道') + '！', trigger: 'change' },
        cost: { required: true, message: $t('请输入消耗金额') + '！', trigger: 'blur' },
        reportTime: { required: true, message: $t('请选择日期') + '！', trigger: 'change' },
    },
	channelList: []
})


onMounted(()=>{
	getChannelDataList(props.itemData.merchantId)
	if(props.itemData.type === 'edit'){
		state.formData.id = props.itemData.id
		state.formData.merchantId = props.itemData.merchantId
		state.formData.channelId = props.itemData.channelId
		state.formData.cost = props.itemData.cost
		state.formData.reportTime = props.itemData.reportTime_
		state.formData.remark = props.itemData.remark
	}else{
		state.formData = {}
		state.formData.merchantId = commonData.currentMerchantSite.id
	}
})

const getChannelDataList = async (merchantId)=> {
	state.formData.channelId = ''
	await getChannelData({merchantId}).then(res => {
	    state.channelList = res.data || []
	})
}

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            dialog.value.showLoading()
            postPurchaseVolumeData(state.formData).then(() => {
                emits('close')
                emits('fetchData')
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
.deploy-tips {
    color: red;
}
</style>
