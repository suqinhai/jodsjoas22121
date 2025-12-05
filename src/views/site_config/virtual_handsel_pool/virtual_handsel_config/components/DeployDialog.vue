<template>
    <!-- 站点配置-虚拟彩金池-虚拟彩金池配置-新增/编辑 -->
    <Dialog ref="dialog" width="650" :title="state.title" buttonCenter top="10vh" @confirm="handleSubmit(operateForm)" @cancel="cancel">
        <el-form class="handsel-pool-deploy" ref="operateForm" :rules="state.rules" :model="state.formData"
            :label-width="$locale == 'zh' ? '115px' : 'auto'">
<!-- 			<el-form-item :label="$t('站点:')" v-if="commonData.merchantSiteList.length > 1">
			    <MerchantSiteSelect isNeedDefault :clearable="false" v-model="state.formData.merchantId" @change="changeSite">
			    </MerchantSiteSelect>
			</el-form-item> -->
            <el-form-item :label="$t('展示位置:')" prop="position">
                <el-select style="width: 200px" v-model="state.formData.position" :placeholder="$t('请选择展示位置')">
                    <el-option v-for="item in displayPosition" :key="item.value" :label="item.label" :value="+item.value" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('跳转位置:')" prop="url">
                <el-select style="width: 200px" v-model="state.formData.url" :placeholder="$t('请选择跳转位置')">
                    <el-option v-for="item in merchantVendorList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('最大展示金额:')" prop="maxAmount" v-if="userData.getTemplateType() !== 5">
                <el-input-number style="width: 200px" v-model="state.formData.maxAmount" :controls="false" :precision="0" :max="9999999999999"
                    :min="1" :placeholder="$t('请输入最大展示金额')" />
            </el-form-item>
            <el-form-item :label="$t('最小展示金额:')" prop="minAmount" v-if="userData.getTemplateType() !== 5">
                <el-input-number style="width: 200px" v-model="state.formData.minAmount" :controls="false" :precision="0" :max="9999999999999"
                    :min="0" :placeholder="$t('请输入最小展示金额')" />
            </el-form-item>
            <el-form-item :label="$t('样式:')" v-if="userData.getTemplateType() === 5">
                <div class="radio-box">
                    <img src="@/assets/img/download_bar/virtual-handsel-banner.png" alt="">
                </div>
			</el-form-item>
			<el-form-item :label="$t('样式:')" prop="style" v-else>
                <el-radio-group v-model="state.formData.style">
					<div v-for="item in state.styleList" :key="item.id" class="radio-box">
					    <img :src="item.styleImage" alt="">
					    <el-radio class="styleName" :label="item.id">{{item.styleName}}</el-radio>
					</div>
			    </el-radio-group>
			</el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { ref, reactive, onMounted, computed } from 'vue'
import { postHomeDeploy, getHomeDeploy } from '@/api/website.js'
import commonStore from '@/store/common'
import userStore from '@/store/user'
const userData = userStore()

const commonData = commonStore()
const emits = defineEmits(['getData', 'close', 'changeSite'])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        }
    },
    metaData: {
        type: Object,
        default: () => {
            return {}
        },
    },
})
const dialog = ref(null)
const operateForm = ref(null)
const state = reactive({
    title: $t('新增'),
    formData: {
        status: 0
    },
    rules: {
        position: [{ required: true, message: $t('请选择展示位置！'), trigger: 'change' }],
        url: [{ required: true, message: $t('请选择跳转位置！'), trigger: 'change' }],
        maxAmount: [{ required: true, message: $t('请输入最大展示金额！'), trigger: 'blur' }],
        minAmount: [{ required: true, message: $t('请输入最小展示金额！'), trigger: 'blur' }],
        style: [{ required: true, message: $t('请选择样式！'), trigger: 'change' }],
    },
	styleList: []
})

onMounted(() => {
    if (props.itemData.id) {
        state.formData = { ...props.itemData }
        state.title = $t('修改')
    }
	dialog.value.showLoading()
	getHomeDeploy({ part: 'validAwardTemplate' }).then(res => {
		res.data?.forEach((item)=>{
			if(!item.styleImage) item.styleImage = props.metaData.styleList.find(its => +item.id === its.value)?.styleImage || ''
		})
	    state.styleList = res.data || []
	    dialog.value.closeLoading()
	}).catch(err => {
	    state.styleList = []
	    dialog.value.closeLoading()
	})
})

const displayPosition = computed(() => {
    if(userData.getTemplateType() === 5){
        return props.metaData.displayPosition.filter(its => [1, 2, 3].includes(+its.value))
    }
    return props.metaData.displayPosition

})

const merchantVendorList = computed(() => {
    if(userData.getTemplateType() === 5){
        return [
        {
            "label": $t('游戏中心'),
            "value": "0"
        }
        ]
    }
    return props.metaData.merchantVendorList
})

const changeSite = () =>{
	dialog.value.showLoading()
	state.formData.position = ''
	state.formData.url = ''
	state.formData.style = ''
	getHomeDeploy({ part: 'validAwardTemplate' }).then(res => {
		res.data?.forEach((item)=>{
			if(!item.styleImage) item.styleImage = props.metaData.styleList.find(its => +item.id === its.value)?.styleImage || ''
		})
	    state.styleList = res.data || []
	    dialog.value.closeLoading()
	}).catch(err => {
	    state.styleList = []
	    dialog.value.closeLoading()
	})
	// emits('changeSite', state.formData.merchantId)
}

const handleSubmit = (el) => {
    el.validate((valid) => {
        if (valid) {
            if(userData.getTemplateType() === 5){
                state.formData.style = 0
                state.formData.maxAmount = 9999
                state.formData.minAmount = 100
            }
            let { maxAmount, minAmount } = state.formData
            if (maxAmount <= minAmount) return ElMessage.warning($t('最大展示金额必须大于最小展示金额！'))
            dialog.value.showLoading()
            postHomeDeploy({
                part: 'awardPools',
                alias: 'awardPools',
                status: 1,
                awardPool: JSON.stringify(state.formData)
            }).then(() => {
                emits('close')
                emits('getData')
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
.handsel-pool-deploy {
    .radio-box {
        width: 150px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        img {
            max-width: 150px;
        }
    }
    .radio-box:nth-child(2n) {
        margin-left: 50px;
    }
}
</style>
<style lang="scss">
	.handsel-pool-deploy {
		.styleName{
			margin-top: 10px;
			.el-radio__label{
				max-width: 200px;
				white-space: normal;
				line-height: 1;
			}
		}
	}
</style>
