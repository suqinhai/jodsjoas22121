<template>
    <!-- 任务中心-注册账号 -->
    <Dialog ref="dialog" :width="800" :title="$t('修改')" top="2vh" @confirm="handleSubmit(deployFormRef)" @cancel="cancel">
        <el-form class="rule-deploy" ref="deployFormRef" :model="state.formData" :rules="state.rules"
            :label-width="$locale == 'zh' ? '120px' : 'auto'">
            <el-form-item :label="$t('任务条件:')">
                {{metaData.newcomerTaskType.find(item => +item.value === state.formData.rewardType)?.label || ''}}
            </el-form-item>
            <el-form-item :label="$t('是否开启:')">
                <el-switch v-model="state.formData.enable" />
            </el-form-item>
            <el-form-item :label="$t('提示气泡:')">
                <el-switch v-model="state.formData.tip" />
            </el-form-item>
            <el-form-item :label="$t('宣传图:')" prop="icon">
                <UploadImage v-model="state.formData.icon" :size="2048" :width="33" :height="33" :tip="$t('请上传33*33或等比例，PNG/JPG/GIF格式的图片')">
                </UploadImage>
            </el-form-item>
            <el-form-item :label="$t('奖励金额:')" prop="amount">
                <el-input-number v-model="state.formData.amount" style="width: 200px" :controls="false" :precision="2" :min="0"
                    :placeholder="$t('请输入奖励金额')" />
            </el-form-item>
            <el-form-item :label="$t('奖励活跃度:')" prop="point">
                <el-input-number v-model="state.formData.point" style="width: 200px" :controls="false" :precision="0" :min="0"
                    :placeholder="$t('请输入奖励活跃度')" />
            </el-form-item>
            <el-form-item :label="$t('奖励票券:')">
                <el-select v-model="state.formData.ticketType" :placeholder="$t('请选择票券类型')" @change="state.formData.ticketId = ''">
                    <el-option v-for="ims in metaData.ticketType" :key="ims.value" :label="ims.label" :value="+ims.value" />
                </el-select>
                <el-select filterable clearable v-model="state.formData.ticketId" :placeholder="$t('请选择票券')">
                    <el-option :disabled="ims.isDisabled" v-for="ims in provideData.getOptionData(state.formData)" :key="ims.id" :label="ims.name"
                        :value="ims.id">
                    </el-option>
                </el-select>
            </el-form-item>
            <!--<el-form-item :label="$t('排序:')">
			    <el-input-number v-model="state.formData.sort" style="width: 200px" :controls="false" :precision="0" :min="1" :placeholder="$t('请输入排序')" />
			</el-form-item> -->
            <el-form-item :label="$t('稽核倍数:')" prop="config.auditFactor">
                <el-input-number v-model="state.formData.config.auditFactor" style="width: 200px" :controls="false" :precision="2" :min="1"
                    :placeholder="$t('请输入稽核倍数')" />
            </el-form-item>
            <el-form-item :label="$t('任务介绍:')" prop="name">
                <el-input v-model="state.formData.name" :placeholder="$t('请输入任务介绍')" />
            </el-form-item>
            <el-form-item :label="$t('更多限制:')">
                <el-checkbox-group v-model="state.formData.config.limits">
                    <el-checkbox v-for="item in metaData.taskRewardLimit" :key="item.value" :label="+item.value" :value="+item.value">
                        {{ item.label }}</el-checkbox>
                </el-checkbox-group>
                <div class="ip_show">
                    <el-checkbox disabled :value="true" v-model="state.formData.config.ipNumShow">{{$t('禁止同登录ip重复领奖')}}</el-checkbox> <span
                        class="span">≥
                        <el-input v-model="state.formData.config.ipNum" :placeholder="$t('人数')" style="width: 150px;" /></span>
                </div>
                <div class="device_show">
                    <el-checkbox disabled :value="true" v-model="state.formData.config.deviceNumShow">{{$t('禁止同登录设备号重复领奖')}}</el-checkbox> <span
                        class="span">≥
                        <el-input v-model="state.formData.config.deviceNum" :placeholder="$t('人数')" style="width: 150px;" /></span>
                </div>
            </el-form-item>
            <el-form-item :label="$t('领取入口:')" prop="clients">
                <el-checkbox-group v-model="state.formData.config.clients">
                    <el-checkbox label="WAP" value="WAP">H5</el-checkbox>
                    <el-checkbox label="Android" value="Android">Android-App</el-checkbox>
                    <el-checkbox label="iOS" value="iOS">iOS-App</el-checkbox>
                </el-checkbox-group>
            </el-form-item>
            <el-form-item :label="$t('参与层级:')" prop="layerIds">
                <el-checkbox v-model="state.isCheckedAll" :indeterminate="state.isIndeterminate" @change="checkAll">{{$t('全部层级')}}</el-checkbox>
                <el-checkbox-group v-model="state.formData.config.layerIds" @change="handleCheck">
                    <el-checkbox v-for="item in metaData.memberLevel" :key="item.id" :label="item.id" :value="item.id">{{ item.name }}</el-checkbox>
                </el-checkbox-group>
                <div>{{$t('说明：不勾选参与层级就不展示，且可领奖的任务也不可显示。')}}</div>
            </el-form-item>
            <el-form-item :label="$t('奖励发放:')">
                <el-checkbox-group v-model="state.formData.config.review">
                    <el-checkbox :label="true" :value="true">{{$t('人工审核')}}</el-checkbox>
                </el-checkbox-group>
            </el-form-item>
            <el-form-item :label="$t('指定代理/渠道:')">
				<el-checkbox v-model="state.formData.agantOrChannel">{{$t('已选择')}}
				</el-checkbox>
				<template v-if="state.formData.agantOrChannel">
					<div></div>
					<el-radio-group v-model="state.formData.agantOrChannelSelect">
						<el-radio :label="1">{{$t('指定代理ID（限制顶级）')}}</el-radio>
						<el-radio :label="2">{{$t('指定渠道')}}</el-radio>
					</el-radio-group>
					<el-form-item :label="$t('指定代理ID（限制顶级）')" v-if="state.formData.agantOrChannelSelect === 1">
						<el-input v-model="state.formData.agentIds"></el-input>
					</el-form-item>
					<el-form-item :label="$t('指定渠道:')" v-if="state.formData.agantOrChannelSelect === 2">
						<el-select v-model="state.formData.channelIds" :placeholder="$t('请选择渠道')" multiple>
							<el-option v-for="item in state.channelList" :key="item.id" :label="item.name" :value="item.id.toString()" />
						</el-select>
					</el-form-item>
				</template>
			</el-form-item>
            <el-form-item :label="$t('稽核平台:')" prop="auditVendor">
                <el-radio-group v-model="state.formData.config.auditVendor">
                    <el-radio :label="1" :value="1">{{$t('全部平台')}}</el-radio>
                    <el-radio :label="2" :value="2">{{$t('指定平台')}}</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label=" " v-if="state.formData.config.auditVendor == 2">
                <el-tabs type="border-card">
                    <el-tab-pane v-for="item in state.playVendorList" :key="item.type" :label="item.label+`(${item.playVendors.length})`">
                        <div style="width: 100%">
                            <el-checkbox v-model="item.checkAll" :value="true" :indeterminate="item.isIndeterminate" @change="checkAllVendor(item)">
                                {{$t('全平台')}}
                            </el-checkbox>
                        </div>
                        <el-checkbox-group v-model="item.playVendors" @change="handleCheckVendor(item)">
                            <el-checkbox v-for="(its,index) in item.vendorList" :key="index" :label="its" :value="its">
                                {{ item.vendorName[index] || '' }}
                            </el-checkbox>
                        </el-checkbox-group>
                    </el-tab-pane>
                </el-tabs>
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted, inject } from 'vue'
import { postTaskRuleConfig } from '@/api/discounts_center'
import { deepClone } from "@/common/util/index"
import { getChannelListData } from '@/api/data_center.js'

const emits = defineEmits(['close', 'refreshData'])
const props = defineProps({
    metaData: {
        type: Object,
        default: () => {
            return {}
        },
    },
    currentIndex: {
        type: Number,
        default: 0
    },
    configData: {
        type: Object,
        default: () => {
            return {}
        }
    },
    merchantVendorList: {
        type: Array,
        default: () => []
    },
})
const state = reactive({
    formData: {
        config: {}
    },
    rules: {
        name: { required: true, message: $t('请输入任务介绍！'), trigger: 'blur' },
        icon: { required: true, message: $t('请上传图标！'), trigger: 'change' },
        amount: { required: true, message: $t('请输入奖励金额！'), trigger: 'blur' },
        point: { required: true, message: $t('请输入奖励活跃度！'), trigger: 'blur' },
        'config.auditFactor': { required: true, message: $t('请输入稽核倍数'), trigger: 'blur' },
    },
    playVendorList: [],
    isCheckedAll: false,
    isIndeterminate: false,
    channelList: []
})
const deployFormRef = ref(null)
const dialog = ref(null)
const provideData = inject('provideData')

onMounted(() => {
    let { rewardType, enable, icon, amount, point, sort, tip, name, config = {}, ticketType = 0, ticketId, ticketName } = deepClone(props.configData.rule[props.currentIndex])
    state.formData = { rewardType, enable, icon, amount, point, sort, tip, name, config, ticketType, ticketId, ticketName }
    state.formData.config.ipNumShow = true
    state.formData.config.deviceNumShow = true
    state.isCheckedAll = config.layerIds?.length === props.metaData?.memberLevel?.length
    state.isIndeterminate =
        config.layerIds?.length > 0 && config.layerIds?.length < props.metaData?.memberLevel?.length
    state.formData.config.review = config.review ? [config.review] : []
    config.auditVendors ? state.formData.config.auditVendor = 2 : state.formData.config.auditVendor = 1
    config.auditVendors ? config.auditVendors = JSON.parse(config.auditVendors) : ''
    if( state.formData.config.agentIds || state.formData.config.channelIds){
        state.formData.agantOrChannel = true
    }
    if( state.formData.config.agentIds){
        state.formData.agantOrChannelSelect = 1
        state.formData.agentIds = state.formData.config.agentIds
    }
    if( state.formData.config.channelIds){
        state.formData.agantOrChannelSelect = 2
        state.formData.channelIds = state.formData.config.channelIds.split(',')
    }
    // state.formData.channelIds = state.formData.channelIds ? state.formData.channelIds.split(',') : []
    // if(agentIds || channelIds) { state.formData.agantOrChannel = true }
    // if(agentIds) { state.formData.agantOrChannelSelect = 1 }
    // if(channelIds) { state.formData.agantOrChannelSelect = 2 }

    let arr = []
    if (config.auditVendors?.length) {
        config.auditVendors.forEach(item => {
            item.vendors?.split(',').forEach((its) => {
                arr.push({
                    vendors: its,
                    type: item.type
                })
            })
        })
    }

    state.playVendorList = props.merchantVendorList.map(item => {
        let selectList = []
        let sameGameData = arr.filter(its => +item.value === +its.type)
        if (sameGameData.length) {
            selectList = sameGameData.map(its => its.vendors)
        }
        item.checkAll = item.vendorList.length === selectList.length
        item.isIndeterminate = !!selectList.length && item.vendorList.length > selectList.length
        item.playVendors = selectList
        return item
    })

    getChannelListData({ _page: 1,_size: 999}).then((res)=>{
		state.channelList = res.data || []
	})
})

const checkAllVendor = (row) => {
    row.playVendors = row.checkAll
        ? [...row.vendorList]
        : [];
    row.isIndeterminate = false
};

const handleCheckVendor = (row) => {
    const checkedCount = row.playVendors.length;
    row.checkAll = checkedCount === row.vendorList.length
    row.isIndeterminate =
        checkedCount > 0 && checkedCount < row.vendorList.length
}

// 选择所有层级
const checkAll = (val) => {
    state.formData.config.layerIds = val
        ? props.metaData.memberLevel.map(item => item.id)
        : []
    state.isIndeterminate = false
}

// 层级勾选变化
const handleCheck = (val) => {
    const checkedCount = val.length
    state.isCheckedAll = checkedCount === props.metaData.memberLevel.length
    state.isIndeterminate =
        checkedCount > 0 && checkedCount < props.metaData.memberLevel.length
}

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            let obj = {
                ...deepClone(state.formData)
            }
            obj.config.review.length ? obj.config.review = true : obj.config.review = false
            if(state.formData.agantOrChannel && state.formData.agantOrChannelSelect === 1){ 
                obj.config.agentIds = state.formData.agentIds
                obj.config.channelIds = ''
            }
            if(state.formData.agantOrChannel && state.formData.agantOrChannelSelect === 2 && state.formData.channelIds && state.formData.channelIds.length){
                obj.config.channelIds = state.formData.channelIds.join(",")
                obj.config.agentIds = ''
            }
            if(!state.formData.agantOrChannel){
                obj.config.agentIds = ''
                obj.config.channelIds = ''
            }
            if (obj.config.auditVendor == 2) {
                let arr = []
                state.playVendorList.forEach((item) => {
                    let data = []
                    item.playVendors?.forEach((its) => {
                        data.push(its)
                    })
                    if (data.length) arr.push({ type: item.value, vendors: data.join(',') })
                })
                if (!arr.length) return ElMessage.warning($t('请至少选择一个平台！'))
                obj.config.auditVendors = arr
            } else {
                obj.config.auditVendors = ''
            }
            dialog.value.showLoading()
            let arr = deepClone(props.configData.rule)
            arr.splice(props.currentIndex, 1, obj)
            postTaskRuleConfig({ id: props.configData.id, rule: JSON.stringify(arr) }).then(() => {
                cancel()
                emits('refreshData')
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

<style lang="scss">
.rule-deploy {
    .radio-box .el-radio__label {
        display: flex;
        .items-box {
            .el-form-item__label {
                display: none;
            }
        }
    }
}
.ip_show,
.device_show {
    margin-bottom: 8px;
    .span {
        margin-left: 20px;
        margin-top: -3px;
    }
}
</style>
