<template>
    <!-- 运营中心-优惠活动列表-活动配置弹窗-余额救援金活动 -->
    <el-form :model="state.formData" ref="formRef" :rules="state.rules" :disabled="deployData.operationType === 2"
        class="activity-deploy balance-rescue-deploy" :label-width="$locale == 'zh' ? '105px' : 'auto'">
        <el-form-item :label="$t('活动名称:')" prop="name">
            <el-input style="width: 100%" v-model="state.formData.name" :placeholder="$t('请输入活动名称')" />
        </el-form-item>
        <el-row>
            <el-col :span="12">
                <el-form-item :label="$t('活动排序:')">
                    <el-input-number v-model="state.formData.sort" style="width: 200px" :controls="false" :precision="0" :min="0"
                        :placeholder="$t('填0或者不填默认排最前面')" />
                </el-form-item>
            </el-col>
            <el-col :span="12">
                <el-form-item :label-width="$locale == 'zh' ? '98px' : 'auto'" :label="$t('稽核倍数:')" prop="auditMultiple">
                    <el-input-number style="width: 200px" v-model="state.formData.auditMultiple" :min="0" :precision="2" :controls="false"
                        :placeholder="$t('请输入稽核倍数')" />
                </el-form-item>
            </el-col>
        </el-row>

        <el-form-item :label="$t('活动时间:')" class="time-box">
            <el-form-item prop="beginTime" label-width="0">
                <el-date-picker :disabled="isDisabled" v-model="state.formData.beginTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss"
                    :disabled-date="(time) => disabledDate(time)" :placeholder="$t('开始时间')">
                </el-date-picker>
            </el-form-item>
            <span class="stance">{{$t('至')}}</span>
            <el-form-item prop="endTime" label-width="0">
                <el-date-picker v-model="state.formData.endTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss"
                    :disabled-date="(time) => disabledDate(time)" :placeholder="$t('结束时间')" :default-time="new Date(2000, 0, 0, 23, 59, 59)">
                </el-date-picker>
            </el-form-item>
        </el-form-item>
        <el-form-item :label="$t('展示时间:')" class="time-box">
            <el-form-item prop="showBeginTime" label-width="0">
                <el-date-picker v-model="state.formData.showBeginTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss"
                    :disabled-date="(time) => disabledDate(time)" :placeholder="$t('开始时间')">
                </el-date-picker>
            </el-form-item>
            <span class="stance">{{$t('至')}}</span>
            <el-form-item prop="showEndTime" label-width="0">
                <el-date-picker v-model="state.formData.showEndTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss"
                    :disabled-date="(time) => disabledDate(time)" :placeholder="$t('结束时间')" :default-time="new Date(2000, 0, 0, 23, 59, 59)">
                </el-date-picker>
            </el-form-item>
        </el-form-item>
        <el-form-item :label="$t('已充值会员:')" class="gLevels-box">
            <div class="gLevels-small gLevels-small-deploy-other">
                <span>{{$t('账户余额小于')}}</span>
                <el-form-item prop="rules_.paidRule.balance" label-width="0">
                    <el-input-number v-model="state.formData.rules_.paidRule.balance" :controls="false" :precision="2" :min="0.01"
                        :max="999999999999999" :placeholder="$t('账户余额')" />
                </el-form-item>
                <span>，</span>
                <el-radio-group v-model="state.paidType">
                    <el-radio :label="false">{{$t('奖励充值金额的')}}
                        <el-input-number :disabled="state.paidType" v-model="state.formData.rules_.paidRule.ratio" :controls="false" :precision="2"
                            :min="0" :max="100" :placeholder="$t('奖励比例')" />%
                    </el-radio>
                    <el-radio :label="true">{{$t('固定金额')}}
                        <el-input-number :disabled="!state.paidType" v-model="state.formData.rules_.paidRule.fixedAmount" :controls="false"
                            :precision="2" :min="0" :max="999999999999999" :placeholder="$t('奖励金额')" />
                    </el-radio>
                </el-radio-group>
            </div>
            <div class="gLevels-small-deploy-ticket">
                <span class="label">{{ $t('奖励票券') }}</span>
                <el-select style="width: 120px" v-model="state.formData.rules_.paidRule.ticketType" :placeholder="$t('票券类型')"
                    @change="state.formData.rules_.paidRule.ticketId = ''">
                    <el-option v-for="ims in provideData.metaData.ticketType" :key="ims.value" :label="ims.label" :value="+ims.value" />
                </el-select>
                <el-select style="width: 180px" filterable clearable v-model="state.formData.rules_.paidRule.ticketId" :placeholder="$t('请选择票券')">
                    <el-option :disabled="isDisabled" v-for="ims in provideData.getOptionData(state.formData.rules_.paidRule)" :key="ims.id"
                        :label="ims.name" :value="ims.id">
                    </el-option>
                </el-select>
            </div>
        </el-form-item>
        <el-form-item :label="$t('未充值会员:')" class="gLevels-box">
            <div class="gLevels-small gLevels-small-deploy-other">
                <span>{{$t('账户余额小于')}}</span>
                <el-form-item prop="rules_.unpaidRule.balance" label-width="0">
                    <el-input-number v-model="state.formData.rules_.unpaidRule.balance" :controls="false" :precision="2" :min="0.01"
                        :max="999999999999999" :placeholder="$t('账户余额')" />
                </el-form-item>
                <span>{{$t('，打码金额达到')}}</span>
                <el-form-item prop="rules_.unpaidRule.reachPlay" label-width="0">
                    <el-input-number v-model="state.formData.rules_.unpaidRule.reachPlay" :controls="false" :precision="0" :min="0"
                        :max="999999999999999" :placeholder="$t('打码金额')" />
                </el-form-item>
            </div>
            <div style="margin-bottom: 10px">
                <el-radio-group v-model="state.unpaidType">
                    <el-radio :label="false">{{$t('奖励打码金额的')}}
                        <el-input-number :disabled="state.unpaidType" v-model="state.formData.rules_.unpaidRule.ratio" :controls="false"
                            :precision="2" :min="0" :max="100" :placeholder="$t('奖励比例')" />%
                    </el-radio>
                    <el-radio :label="true">{{$t('固定金额')}}
                        <el-input-number :disabled="!state.unpaidType" v-model="state.formData.rules_.unpaidRule.fixedAmount" :controls="false"
                            :precision="2" :min="0" :max="999999999999999" :placeholder="$t('奖励金额')" />
                    </el-radio>
                </el-radio-group>
            </div>
            <div class="gLevels-small-deploy-ticket">
                <span class="label">{{ $t('奖励票券') }}</span>
                <el-select style="width: 120px" v-model="state.formData.rules_.unpaidRule.ticketType" :placeholder="$t('票券类型')"
                    @change="state.formData.rules_.unpaidRule.ticketId = ''">
                    <el-option v-for="ims in provideData.metaData.ticketType" :key="ims.value" :label="ims.label" :value="+ims.value" />
                </el-select>
                <el-select style="width: 180px" filterable clearable v-model="state.formData.rules_.unpaidRule.ticketId" :placeholder="$t('请选择票券')">
                    <el-option :disabled="ims.isDisabled" v-for="ims in provideData.getOptionData(state.formData.rules_.unpaidRule)" :key="ims.id"
                        :label="ims.name" :value="ims.id">
                    </el-option>
                </el-select>
            </div>
        </el-form-item>
        <el-form-item :label="$t('奖励次数:')" class="gLevels-box">
            <div class="gLevels-small" style="margin-bottom: 0">
                <span>{{$t('当日奖励发放次数')}}</span>
                <el-form-item prop="rules_.dailyLimitNum" label-width="0">
                    <el-input-number v-model="state.formData.rules_.dailyLimitNum" :controls="false" :precision="0" :min="1"
                        :placeholder="$t('日发放次数')" />
                </el-form-item>
                <span>{{$t('，奖励发放总次数')}}</span>
                <el-form-item prop="rules_.totalLimitNum" label-width="0">
                    <el-input-number v-model="state.formData.rules_.totalLimitNum" :controls="false" :precision="0" :min="1"
                        :placeholder="$t('发放总次数')" />
                </el-form-item>
            </div>
        </el-form-item>
         <div class="module-item">
                <el-form-item :label="$t('奖励上限:')" prop="rules_.bonusLimit" class="item-row">{{$t('最高赠送金额')}}
                    <el-input-number style="width: 120px;margin: 0 3px" v-model="state.formData.rules_.bonusLimit" :min="0" :max="999999999999999"
                        :precision="2" :controls="false" :placeholder="$t('请输入奖励上限')" />
                </el-form-item>
                 <el-form-item>
                    <el-checkbox v-model="state.formData.review" :disabled="isDisabled" :label="$t('人工审核（勾选后，奖励需要人工审核后发放）')" :true-label="true" :false-label="false"></el-checkbox>
                </el-form-item>
        </div>
        <el-form-item :label="$t('领奖后限制:')">
            <el-switch v-model="state.formData.rules_.needRecharge" />
            <div>{{$t('注：开启时用户发放救援彩金后，再次进入游戏提示用户去充值才可进入游戏')}}</div>
        </el-form-item>
        <el-form-item :label="$t('限制游戏:')">
            <el-switch v-model="state.formData.rules_.canCtrlGame" />
            <div>{{$t('注：开启后只可进控制游戏（NEWPG、NEWJILI、NEWPP）')}}</div>
        </el-form-item>
        <template v-if="state.formData.rules_.canCtrlGame">
            <el-form-item :label-width="$locale == 'zh' ? '180px' : 'auto'" :label="$t('控制游戏池子分配比例:')" style="margin-bottom: 10px">
                {{userData.siteInfo.commissionMode === 2 ? $t('打码模式') : $t('损益模式')}}</el-form-item>
            <el-form-item :label-width="$locale == 'zh' ? '50px' : '150px'" class="gLevels-box">
                <div class="gLevels-small">
                    <span>{{$t('控输（RTP＜100），')}}</span>
                    <template v-if="userData.siteInfo.commissionMode === 2">{{$t('触发比例人数')}}<el-form-item prop="rules_.lossOdds" label-width="0">
                            <el-input-number v-model="state.formData.rules_.lossOdds" :controls="false" :precision="2" :min="0"
                                :placeholder="$t('人数比例')" />
                        </el-form-item>
                        %，
                    </template>
                    <span>RTP</span>
                    <el-form-item prop="rules_.lossControlType" label-width="0">
                        <el-select style="width: 120px;margin: 0 5px" v-model="state.formData.rules_.lossControlType" :placeholder="$t('请选择RTP')">
                            <el-option v-for="item in controlLoseList" :key="item.value" :label="item.label" :value="+item.value" />
                        </el-select>
                    </el-form-item>
                </div>
                <div class="gLevels-small" v-if="userData.siteInfo.commissionMode === 2">
                    <span>{{$t('控赢（RTP＞100），触发比例人数')}}</span>
                    <el-form-item prop="rules_.winOdds" label-width="0">
                        <el-input-number v-model="state.formData.rules_.winOdds" :controls="false" :precision="2" :min="0"
                            :placeholder="$t('人数比例')" />
                    </el-form-item>
                    <span>%，RTP</span>
                    <el-form-item prop="rules_.controlType" label-width="0">
                        <el-select style="width: 120px;margin: 0 5px" v-model="state.formData.rules_.controlType" :placeholder="$t('请选择RTP')">
                            <el-option v-for="item in controlWinList" :key="item.value" :label="item.label" :value="+item.value" />
                        </el-select>
                    </el-form-item>
                    <span>{{$t('，余额限制')}}</span>
                    <el-form-item prop="rules_.minBalance" label-width="0">
                        <el-input-number v-model="state.formData.rules_.minBalance" :controls="false" :precision="2" :min="0" :max="999999999999999"
                            :placeholder="$t('最小值')" @blur="inputBblur" />
                    </el-form-item>
                    <span>~</span>
                    <el-form-item prop="rules_.maxBalance" label-width="0">
                        <el-input-number v-model="state.formData.rules_.maxBalance" :controls="false" :precision="2" :min="0" :max="999999999999999"
                            :placeholder="$t('最大值')" @blur="inputBblur" />
                    </el-form-item>
                </div>
                <div v-if="userData.siteInfo.commissionMode === 2">{{$t('注：触发比例人数配置总和需等于100%')}}</div>
            </el-form-item>
        </template>
        <el-form-item :label="$t('三方游戏限制:')" class="gameVendor_row" v-if="!state.formData.rules_.canCtrlGame">
            {{$t('限制游戏未开启时生效，勾选可以进入，不勾选就被限制进入；NEWPG除外；白名单会员不受限制。')}}
            <div>
                <el-tabs type="border-card">
                    <el-tab-pane v-for="item in state.formData.playVendorList" :key="item.type"
                        :label="item.label+`(${item.playVendors.length}/${item.vendorList.length})`">
                        <div style="width: 100%">
                            <el-checkbox v-model="item.checkAll" :indeterminate="item.isIndeterminate" @change="provideData.checkAllVendor(item)">
                                {{$t('全平台')}}</el-checkbox>
                        </div>
                        <el-checkbox-group v-model="item.playVendors" @change="provideData.handleCheckVendor(item)">
                            <el-checkbox v-for="(its,ims) in item.vendorName" :key="ims" :label="item.vendorList[ims]">
                                {{ its }}</el-checkbox>
                        </el-checkbox-group>
                    </el-tab-pane>
                </el-tabs>
            </div>
        </el-form-item>

        <!-- <el-form-item :label="$t('宣传图:')" prop="image">
            <UploadImage v-model="state.formData.image" :size="2048" :width="710" :height="320" :disabled="deployData.operationType === 2"
                :tip="$t('请上传710*320或等比例，PNG/JPG/GIF格式小于2048KB的图片')">
            </UploadImage>
        </el-form-item> -->
        <el-form-item :label="$t('宣传图:')" prop="image">
            <UploadImage v-model="state.formData.image" :width="state.limit.width" :height="state.limit.height" :disabled="deployData.operationType === 2"
                    :size="state.limit.size"
                    :tip="`${$t('请上传')}${state.limit.width}*${state.limit.height}${$t('或等比例，PNG/JPG/GIF格式小于')}${state.limit.size}${$t('KB的图片')}`" />
        </el-form-item>
        <el-form-item :label="$t('规则说明:')" prop="remark">
            <Tinymce v-model="state.formData.remark" v-model:isUploading="isUploading" :disabled="deployData.operationType === 2" :width="$locale == 'zh' ? 'auto' : '850px'">
            </Tinymce>
        </el-form-item>
    </el-form>
</template>

<script setup>
import { reactive, ref, onMounted, inject, computed } from "vue"
import { ElMessage } from "element-plus"
import userStore from '@/store/user'
import { deepClone, add } from "@/common/util/index"
import { checkImageUploading } from '@/common/util'
const isUploading = ref(false)
const props = defineProps({
    deployData: {
        type: Object,
        default: () => {
            return {}
        },
    },
    isDisabled: {
        type: Boolean,
        default: false,
    },
    disabledDate: {
        type: Function,
        default: () => { },
    },
})
const state = reactive({
    oldImage: [],
    limit: {
        width: 710,
        height: 320,
        size: 2048
    },
    paidType: false,
    unpaidType: false,
    formData: {
        // bonusType: 1,
        rules_: {
            unpaidRule: {},
            paidRule: {},
        },
        review: false,
    },
    rules: {
        name: [{ required: true, message: $t('必填项不能为空！'), trigger: "blur" }],
        auditMultiple: [{ required: true, message: $t('必选项不能为空！'), trigger: 'change' }],
        beginTime: [{ required: true, message: $t('请选择活动开始时间！'), trigger: 'change' }],
        endTime: [{ required: true, message: $t('请选择活动结束时间！'), trigger: 'change' }],
        showBeginTime: [{ required: true, message: $t('请选择开始展示时间！'), trigger: 'change' }],
        showEndTime: [{ required: true, message: $t('请选择结束展示时间！'), trigger: 'change' }],
        image: [{ required: true, message: $t('宣传图不能为空！'), trigger: 'change' }],
        remark: [{ required: true, message: $t('必填项不能为空！'), trigger: "blur" }],
        // levelList: [{ required: true, message: $t('必选项不能为空！'), trigger: 'change' }],
        'rules_.bonusLimit': [{ required: true, message: $t('必填项不能为空！'), trigger: 'change' }],
        'rules_.dailyLimitNum': [{ required: true, message: $t('必填项不能为空！'), trigger: "blur" }],
        'rules_.totalLimitNum': [{ required: true, message: $t('必填项不能为空！'), trigger: "blur" }],
        'paidRule.balance': [{ required: true, message: $t('必填项不能为空！'), trigger: "blur" }],
        'rules_.unpaidRule.balance': [{ required: true, message: $t('必填项不能为空！'), trigger: "blur" }],
        'rules_.unpaidRule.reachPlay': [{ required: true, message: $t('必填项不能为空！'), trigger: "blur" }],
        'rules_.lossControlType': [{ required: true, message: $t('必选项不能为空！'), trigger: "blur" }],
        'rules_.controlType': [{ required: true, message: $t('必选项不能为空！'), trigger: "blur" }],
        'rules_.lossOdds': [{ required: true, message: $t('必填项不能为空！'), trigger: "blur" }],
        'rules_.winOdds': [{ required: true, message: $t('必填项不能为空！'), trigger: "blur" }],
        'rules_.minBalance': [{ required: true, message: $t('必填项不能为空！'), trigger: "blur" }],
        'rules_.maxBalance': [{ required: true, message: $t('必填项不能为空！'), trigger: "blur" }],
    },
})
const formRef = ref(null)
const provideData = inject('provideData')
const userData = userStore()

const controlWinList = computed(() => {
    let { ctrlLoseType = [], ctrlPools = [] } = provideData.metaData
    return ctrlPools.filter(item => ctrlLoseType.every(its => +its.value !== +item.value))
})
const controlLoseList = computed(() => {
    let { ctrlLoseType = [] } = provideData.metaData
    return ctrlLoseType.filter(item => +item.value < 10)
})
const isPPTemplate = computed(() => {
    return userData.getTemplateType() === 5
})
onMounted(() => {
    if(isPPTemplate.value) {
        state.limit.width = 656
        state.limit.height = 176
    }
    state.formData = Object.assign(state.formData, deepClone(props.deployData))
    if (!state.formData.id) {
        state.formData.rules_ = {
            dailyLimitNum: 1,
            totalLimitNum: 1,
            unpaidRule: {
                balance: 1,
                ticketType: 0,
                ticketId: ''
            },
            paidRule: {
                balance: 1,
                ticketType: 0,
                ticketId: ''
            },
            canCtrlGame: false,
            needRecharge: true,
        }
    }
    if (props.deployData.id) {
        state.oldImage = props.deployData.image.split(',')
        if (isPPTemplate.value) {
            state.formData.image = state.oldImage[1]
        } else {
            state.formData.image = state.oldImage[0]
        }
    }
    let { rules_ } = state.formData
    if (!rules_.unpaidRule.ticketId || !rules_.unpaidRule.ticketName) state.formData.rules_.unpaidRule.ticketType = 0
    if (!rules_.paidRule.ticketId || !rules_.paidRule.ticketName) state.formData.rules_.paidRule.ticketType = 0
    state.paidType = Object.keys(state.formData.rules_.paidRule).includes('fixedAmount')
    state.unpaidType = Object.keys(state.formData.rules_.unpaidRule).includes('fixedAmount')
    state.formData.vendor = 2
    state.formData.auditVendor = 1
    state.formData.review = state.formData.review || rules_?.review ? true : false
})

const inputBblur = () => {
    let { minBalance, maxBalance } = state.formData.rules_
    if (typeof minBalance !== 'number' || typeof maxBalance !== 'number') return
    if (minBalance > maxBalance) {
        state.formData.rules_.maxBalance = minBalance
    }
}

// 复选框勾选变化
const checkChange = (currentValue, targetKey, type) => {
    provideData.checkboxChange({
        currentValue,
        metaKey: 'userLevel',
        dependData: state.formData,
        targetKey,
        indeterminateKey: 'isIndeterminateLevel',
        type
    })
}

const formValidate = () => {
    formRef.value.validate((valid, fields) => {
        if (valid) {
            if (checkImageUploading(isUploading.value)) return
            let params = deepClone(state.formData)
            let { rules_ } = params
            delete params.rules_.winOrLose
            if (rules_.totalLimitNum < rules_.dailyLimitNum) {
                return ElMessage.warning($t('日奖励发放次数必须大于奖励发放总次数！'))
            }
            if (!rules_.canCtrlGame) {
                delete params.rules_.controlType
                delete params.rules_.winOdds
                delete params.rules_.lossControlType
                delete params.rules_.lossOdds
            } else {
                if (userData.siteInfo.commissionMode !== 2) {
                    delete params.rules_.controlType
                    delete params.rules_.winOdds
                    delete params.rules_.lossOdds
                    delete params.rules_.maxBalance
                    delete params.rules_.minBalance
                } else {
                    if (add(rules_.winOdds, rules_.lossOdds) !== 100) return ElMessage.warning($t('触发比例人数配置总和需等于100%！'))
                    if (rules_.maxBalance <= rules_.minBalance) return ElMessage.warning($t('余额限制最大值必须大于最小值！'))
                }
            }
            if (state.paidType) {
                delete params.rules_.paidRule.ratio
            } else {
                delete params.rules_.paidRule.fixedAmount
            }
            if (state.unpaidType) {
                delete params.rules_.unpaidRule.ratio
            } else {
                delete params.rules_.unpaidRule.fixedAmount
            }
            if (rules_.unpaidRule.ticketId) {
                delete params.rules_.unpaidRule.ticketType
                delete params.rules_.unpaidRule.ticketId
                delete params.rules_.unpaidRule.ticketName
            }
            if (rules_.paidRule.ticketId) {
                delete params.rules_.paidRule.ticketType
                delete params.rules_.paidRule.ticketId
                delete params.rules_.paidRule.ticketName
            }
            const imageArry = isPPTemplate.value 
                ? [state.oldImage[0], params.image]
                : [params.image, state.oldImage[1]];
            params.image = imageArry.join(',');
            params.rules_.review = deepClone(params.review)
            params.review = params.review ? 1 : 0
            provideData.submit(params)
        } else {
            ElMessage.warning($t('请完善表单内容再进行提交！'))
        }
    })
}

defineExpose({ valid: formValidate })
</script>

<style lang="scss">
@import '../styles/index.scss';
.balance-rescue-deploy {
    .gLevels-box {
        .el-input-number {
            width: 100px !important;
        }

        .gLevels-small {
            margin-bottom: 10px !important;
        }
        // .gLevels-small-deploy-other {
        //     margin-bottom: 10px;
        // }
    }
    .module-item {
        display: flex;
        margin-bottom: 10px;
    }
    .item-row .el-form-item__error {
        margin-left: 82px;
    }
}
</style>
