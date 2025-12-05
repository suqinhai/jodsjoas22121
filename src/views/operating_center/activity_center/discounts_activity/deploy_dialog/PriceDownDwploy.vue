<template>
    <!-- 活动中心-活动配置弹窗-砍一刀活动 -->
    <el-form :model="state.formData" ref="formRef" :rules="state.rules" :disabled="deployData.operationType === 2"
        class="activity-deploy recharge-deploy" :label-width="$locale == 'zh' ? '105px' : 'auto'">
        <el-form-item :label="$t('活动名称:')" prop="name">
            <el-input style="width: 100%" v-model="state.formData.name" :placeholder="$t('请输入活动名称')" />
        </el-form-item>
        <el-form-item :label="$t('活动时间:')" class="time-box">
            <el-form-item prop="beginTime" label-width="0">
                <el-date-picker :disabled="isDisabled" v-model="state.formData.beginTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss"
                    :disabled-date="(time) => disabledDate(time)" :placeholder="$t('开始时间')">
                </el-date-picker>
            </el-form-item>
            <span class="stance">{{$t('至')}}</span>
            <el-form-item prop="endTime" label-width="0">
                <el-date-picker :disabled="isDisabled" v-model="state.formData.endTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss"
                    :disabled-date="(time) => disabledDate(time)" :placeholder="$t('结束时间')" :default-time="new Date(2000, 0, 0, 23, 59, 59)">
                </el-date-picker>
            </el-form-item>
        </el-form-item>
        <el-form-item :label="$t('展示时间:')" class="time-box">
            <el-form-item prop="showBeginTime" label-width="0">
                <el-date-picker :disabled="isDisabled" v-model="state.formData.showBeginTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss"

                    :disabled-date="(time) => disabledDate(time)" :placeholder="$t('开始时间')">
                </el-date-picker>
            </el-form-item>
            <span class="stance">{{$t('至')}}</span>
            <el-form-item prop="showEndTime" label-width="0">
                <el-date-picker :disabled="isDisabled" v-model="state.formData.showEndTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss"
                    :disabled-date="(time) => disabledDate(time)" :placeholder="$t('结束时间')" :default-time="new Date(2000, 0, 0, 23, 59, 59)">
                </el-date-picker>
            </el-form-item>
        </el-form-item>
        <el-row>
            <el-col :span="12">
                <el-form-item :label="$t('稽核倍数:')" prop="auditMultiple">
                    <el-input-number style="width: 200px" v-model="state.formData.auditMultiple" :min="0" :precision="2" :controls="false"
                        :placeholder="$t('请输入稽核倍数')" />
                </el-form-item>
            </el-col>
            <el-col :span="12">
                <el-form-item :label="$t('活动排序:')">
                    <el-input-number :disabled="deployData.operationType === 2" v-model="state.formData.sort" style="width: 200px"
                        :controls="false" :precision="0" :min="0" :placeholder="$t('填0或者不填默认排最前面')" />
                </el-form-item>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="12">
                <el-form-item :label="$t('登录前弹窗:')" prop="attachConfig.beforeLoginPop">
                    <el-select v-model="state.formData.attachConfig.beforeLoginPop" :placeholder="$t('请选择弹窗类型')" style="width: 200px">
                        <el-option v-for="item in provideData.metaData.popMode" :key="item.value" :label="item.label" :value="item.value * 1" />
                    </el-select>
                </el-form-item>
            </el-col>
            <el-col :span="12">
                <el-form-item :label="$t('登录后弹窗:')" prop="attachConfig.afterLoginPop">
                    <el-select v-model="state.formData.attachConfig.afterLoginPop" :placeholder="$t('请选择弹窗类型')" style="width: 200px">
                        <el-option v-for="item in provideData.metaData.popMode" :key="item.value" :label="item.label" :value="item.value * 1" />
                    </el-select>
                </el-form-item>
            </el-col>
        </el-row>
        <el-form-item>
            <div class=" item-row">
                <span>{{$t('重置时间')}}</span>
                <el-form-item prop="resetDay" label-width="0">
                    <el-input-number :disabled="isDisabled" style="width: 120px" v-model="state.formData.resetDay"
                        :controls="false" :value="state.formData.resetDay || ''" /> {{$t('天，限制1-30天')}}
                </el-form-item>
            </div>
        </el-form-item>
        <el-form-item>
            <div class="item-row">
                <span>{{$t('分配金额个数')}}</span>
                <el-form-item label="" prop="divideNum" label-width="0">
                    <el-input-number :disabled="isDisabled" style="width: 120px" v-model="state.formData.divideNum"
                        :controls="false" /> {{$t('配置整数，最少5个，最大50')}}
                </el-form-item>
            </div>
        </el-form-item>
        <el-form-item>
            <div class="item-row">{{$t('说明：未满足奖励条件时，最大可触发奖励人数（包括自己抽奖），将剩余额度0.01后不可触发中奖')}}</div>
        </el-form-item>
        <el-form-item>
            <div class="item-row">
                <el-checkbox v-model="state.formData.ipLimitCheck" @change="handleIpLimitCheckChange">{{$t('同注册IP限制')}}</el-checkbox>
                <el-form-item label="" prop="ipLimit" label-width="0">
                    <el-input-number 
                        style="width: 120px" 
                        v-model="state.formData.ipLimit"
                        :controls="false"
                        :disabled="!state.formData.ipLimitCheck"
                    />
                    <span>{{$t('个，之后的会员不做完成条件数据记录')}}</span>
                </el-form-item>
            </div>
        </el-form-item>
        <el-form-item label=" " class="gLevels-box">
            <div class="item-row" style="margin-bottom:5px;">{{$t('条件配置：（上限30个）注：达到最后一档位时，将不可获得最终档奖励，剩余额度达到0.01不可触发中奖')}}</div>
            <div v-for="(item, index) in state.formData.rules_" :key="index" class="gLevels-small">
                <div class="gLevels-small-deploy"
                    :class="{'gLevels-small-deploy-special': state.formData.bonusType === 2 && $locale !== 'zh' && isHasMenuPermiss,'gLevels-small-deploy-other': $locale !== 'zh' && isHasMenuPermiss}">
                    <span>{{$t('累计充值人数')}}</span>
                    <el-form-item :prop="'rules_.' + index + '.rechargePeople'" 
                        label-width="0">
                        <el-input-number v-model="item.rechargePeople" :controls="false" :disabled="isDisabled"/>
                    </el-form-item>
                    <span>{{$t('累计充值金额')}}</span>
                    <el-form-item :prop="'rules_.' + index + '.rechargeAmount'" 
                        label-width="0">
                        <el-input-number v-model="item.rechargeAmount" :controls="false" :disabled="isDisabled"/>
                    </el-form-item>
                    <span>{{$t('累计投注')}}</span>
                    <el-form-item :prop="'rules_.' + index + '.playAmount'"
                        label-width="0">
                        <el-input-number v-model="item.playAmount" :controls="false" :disabled="isDisabled"/>
                    </el-form-item>
                    <span>{{$t('奖励金额')}}</span>
                    <el-form-item :prop="'rules_.' + index + '.rewardAmount'" :rules="[
                        { required: true, message: $t('必填项不能为空！'), trigger: 'blur' },
                        { validator: state.rules.rewardAmountValidator, trigger: 'blur' }
                    ]"
                        label-width="0">
                        <el-input-number v-model="item.rewardAmount" :controls="false" :disabled="isDisabled"/>
                    </el-form-item>

                </div>
                <div class="operate">
                    <el-button v-throttle v-if="state.formData.rules_.length < 30" type="primary" @click="handleAdd(index)" :icon="Plus" :disabled="isDisabled">
                    </el-button>
                    <el-button v-throttle v-if="state.formData.rules_.length > 1" type="danger" @click="handleDel(index)"
                        :icon="Minus" :disabled="isDisabled">
                    </el-button>
                </div>
            </div>
        </el-form-item>
         
        <el-form-item style="margin-bottom:5px;">
            <div>{{$t('前端转盘展示额度：（仅做展示）')}}</div>
        </el-form-item>
        <el-form-item>
        <div class="item-row">
            <div class="label-w">
                <span>{{$t('最小额度')}}</span>
                <el-form-item label="" prop="minAmount" label-width="0">
                    <el-input-number  style="width: 120px" v-model="state.formData.minAmount"
                        :controls="false" />
                </el-form-item>
            </div>
             <div class="label-w">
                <span> {{$t('中间额度')}}</span>
                <el-form-item label="" prop="midAmount" label-width="0">
                     <el-input-number style="width: 120px" v-model="state.formData.midAmount"
                    :controls="false" />
                </el-form-item>
            </div>
             <div class="label-w">
                <span> {{$t('最大额度')}}</span>
                <el-form-item label="" prop="maxAmount" label-width="0">
                      <el-input-number style="width: 120px" v-model="state.formData.maxAmount"
                    :controls="false" />
                </el-form-item>
            </div>
            
        </div>
         </el-form-item>
         <!-- <el-form-item :label="$t('宣传图:')" prop="image">
            <UploadImage v-model="state.formData.image" :size="2048" :width="710" :height="320" :disabled="deployData.operationType === 2"
                :tip="$t('请上传710*320或等比例，PNG/JPG/GIF格式小于2048KB的图片')" @success="uploadSuccess">
            </UploadImage>
        </el-form-item> -->
        <el-form-item :label="$t('宣传图:')" prop="image">
            <UploadImage v-model="state.formData.image" :width="state.limit.width" :height="state.limit.height" :disabled="deployData.operationType === 2"
                    :size="state.limit.size"
                    :tip="`${$t('请上传')}${state.limit.width}*${state.limit.height}${$t('或等比例，PNG/JPG/GIF格式小于')}${state.limit.size}${$t('KB的图片')}`" />
        </el-form-item>
        <el-form-item :label="$t('规则说明:')" prop="remark">
            <Tinymce v-model="state.formData.remark" v-model:isUploading="isUploading" :disabled="deployData.operationType === 2" :width="$locale == 'zh' ? 'auto' : '960px'">
            </Tinymce>
        </el-form-item>
        <el-form-item :label="$t('稽核平台:')">
            <el-radio-group :disabled="isDisabled" v-model="state.formData.auditVendor">
                <el-radio :label="1">{{$t('全部平台')}}</el-radio>
                <el-radio :label="2">{{$t('指定平台')}}</el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item class="gameVendor_row" label=" " v-if="state.formData.auditVendor == 2">
            <el-tabs type="border-card">
                <el-tab-pane v-for="item in state.formData.auditVendorList" :key="item.type"
                    :label="item.label+`(${item.playVendors.length}/${item.vendorList.length})`">
                    <div style="width: 100%">
                        <el-checkbox :disabled="isDisabled" v-model="item.checkAll" :indeterminate="item.isIndeterminate"
                            @change="provideData.checkAllVendor(item)">{{$t('全平台')}}</el-checkbox>
                    </div>
                    <el-checkbox-group :disabled="isDisabled" v-model="item.playVendors" @change="provideData.handleCheckVendor(item)">
                        <el-checkbox v-for="(its,ims) in item.vendorName" :key="ims" :label="item.vendorList[ims]">
                            {{ its }}</el-checkbox>
                    </el-checkbox-group>
                </el-tab-pane>
            </el-tabs>
        </el-form-item>
    </el-form>
</template>

<script setup>
import { reactive, ref, onMounted, defineExpose, computed, defineAsyncComponent, inject } from "vue"
import { Plus, Minus } from "@element-plus/icons-vue"
import { ElMessage } from "element-plus"
import { deepClone } from "@/common/util/index"
import userStore from '@/store/user'
import { checkImageUploading } from '@/common/util'
const isUploading = ref(false)
const userData = userStore()

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
    isHasMenuPermiss: {
        type: Boolean,
        default: false
    }
})
const state = reactive({
    oldImage: [],
    limit: {
        width: 710,
        height: 320,
        size: 2048
    },
    formData: {
        promotionCond: 1,
        bonusType: 1,
        rules_: [],
        attachConfig: {
            beforeLoginPop: 0,
            afterLoginPop: 0,
        },
        showBeginTime: '',
        showEndTime: '',
        resetDay: undefined,
        divideNum: undefined,
        ipLimitCheck: false,
        ipLimit: undefined,
        minAmount: undefined,
        maxAmount: undefined,
        midAmount: undefined,

    },
    rules: {
        name: [{ required: true, message: $t('必填项不能为空！'), trigger: "blur" }],
        beginTime: [{ required: true, message: $t('请选择活动开始时间！'), trigger: 'change' }],
        endTime: [{ required: true, message: $t('请选择活动结束时间！'), trigger: 'change' }],
        showBeginTime: [{ required: true, message: $t('请选择开始展示时间！'), trigger: 'change' }],
        showEndTime: [{ required: true, message: $t('请选择结束展示时间！'), trigger: 'change' }],
        bonusType: [{ required: true, message: $t('必选项不能为空！'), trigger: 'change' }],
        image: [{ required: true, message: $t('宣传图不能为空！'), trigger: 'change' }],
        remark: [{ required: true, message: $t('必填项不能为空！'), trigger: "blur" }],
        promotionCond: [{ required: true, message: $t('必选项不能为空！'), trigger: 'change' }],
        auditMode: [{ required: true, message: $t('必选项不能为空！'), trigger: 'change' }],
        auditMultiple: [{ required: true, message: $t('必填项不能为空！'), trigger: "blur" }],
        cycleMode: [{ required: true, message: $t('必选项不能为空！'), trigger: 'change' }],
        levelList: [{ required: true, message: $t('必选项不能为空！'), trigger: 'change' }],
        'attachConfig.beforeLoginPop': [{ required: true, message: $t('必选项不能为空！'), trigger: 'change' }],
        'attachConfig.afterLoginPop': [{ required: true, message: $t('必选项不能为空！'), trigger: 'change' }],
        //重置时间
        resetDay: [
            { required: true, message: $t('必填项不能为空！'), trigger: 'change' },
            { 
                validator: (rule, value, callback) => {
                    if (value < 1 || value > 30) {
                        callback(new Error($t('请输入正确的数字！')));
                    } else {
                        callback();
                    }
                }, 
                trigger: 'change' 
            }
        ],
        //分配金额
        divideNum: [
            { required: true, message: $t('必填项不能为空！'), trigger: 'change' },
            { 
                validator: (rule, value, callback) => {
                    if (value < 5 || value > 50) {
                        callback(new Error($t('请输入正确的数字！')));
                    } else {
                        callback();
                    }
                }, 
                trigger: 'change' 
            }
        ],
        //同注册IP
        ipLimit: [
            {
                validator: (rule, value, callback) => {
                    if (!state.formData.ipLimitCheck) {
                        return callback();
                    }
                    if (value === undefined || value === null || value === '') {
                        return callback(new Error($t('必填项不能为空！')));
                    }
                    if (typeof value !== 'number' || value < 1) {
                        return callback(new Error($t('请输入正确的数字！')));
                    }
                    callback();
                },
                trigger: 'change'
            }
        ],
        minAmount: [{ required: true, message: $t('必填项不能为空！'), trigger: 'change' }],
        maxAmount: [{ required: true, message: $t('必填项不能为空！'), trigger: 'change' }],
        midAmount: [{ required: true, message: $t('必填项不能为空！'), trigger: 'change' }],
        rewardAmountValidator: (rule, value, callback) => {
            if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
                callback(new Error($t('请输入大于0的整数')));
            } else {
                callback();
            }
        }

    },
    isValidate: false,
    currentIndex: '',
})
const formRef = ref(null)
const provideData = inject('provideData')
const emits = defineEmits(['updateContentEdit'])

const rewardData = computed(() => {
    return { 
        rechargePeople: undefined, 
        rechargeAmount: undefined, 
        playAmount: undefined, 
        rewardAmount: undefined 
    }
})
const isPPTemplate = computed(() => {
    return userData.getTemplateType() === 5
})
onMounted(() => {
    if(isPPTemplate.value) {
        state.limit.width = 656
        state.limit.height = 176
    }
    state.formData.rules_ = [{ ...rewardData.value }]
    state.formData = Object.assign(state.formData, deepClone(props.deployData))
    const { resetDay, divideNum, ipLimit, minAmount, maxAmount, midAmount,conditions} = state.formData.rules_
    if (props.deployData.id) {
        state.oldImage = props.deployData.image.split(',')
        if (isPPTemplate.value) {
            state.formData.image = state.oldImage[1]
        } else {
            state.formData.image = state.oldImage[0]
        }
        if (!state.formData.attachConfig) {
            state.formData.attachConfig = {
                beforeLoginPop: 0,
                afterLoginPop: 0,
            }
        } else {
            state.formData.attachConfig = JSON.parse(state.formData.attachConfig)
        }
        state.formData.resetDay = resetDay
        state.formData.divideNum = divideNum
        state.formData.ipLimit = ipLimit === 0 ? '' : ipLimit
        state.formData.minAmount = minAmount
        state.formData.maxAmount = maxAmount
        state.formData.midAmount = midAmount
        state.formData.rules_ = conditions
        state.formData.ipLimitCheck = ipLimit ? true : false

    }
})


// 打开概率设置弹窗
const handleProbabilityConfig = (index) => {
    let { rewardMinAmount, rewardMaxAmount, limitOdds = [] } = state.formData.rules_[index]
    if (typeof rewardMinAmount !== 'number' || typeof rewardMaxAmount !== 'number') return ElMessage.warning($t('请配置完奖励金额再进行操作！'))
    if (rewardMaxAmount <= 0.01) return ElMessage.warning($t('奖励金额必须大于0.01才能配置概率！'))
    state.currentIndex = index
    provideData.probabilityDeployShow({
        rewardMinAmount,
        rewardMaxAmount,
        limitOdds,
    })
}

// 设置奖励概率数据
const setProbability = (val) => {
    if (!val.length) return delete state.formData.rules_[state.currentIndex].limitOdds
    state.formData.rules_[state.currentIndex].limitOdds = val
}


//  删除等级
const handleDel = (index) => {
    state.formData.rules_.splice(index, 1)
}

//添加一级
const handleAdd = (index) => {
    state.formData.rules_.splice(index + 1, 0, { ...rewardData.value })
}

// 上传成功
const uploadSuccess = () => {
    if (state.isValidate) {
        formRef.value.validateField(['image'])
    }
}

const handleIpLimitCheckChange = (checked) => {
    if (!checked) {
        state.formData.ipLimit = undefined
        formRef.value?.clearValidate(['ipLimit'])
    } else {
        formRef.value?.validateField(['ipLimit'])
    }
}

const formValidate = () => {
    state.isValidate = true
    formRef.value.validate((valid, fields) => {
        if (valid) {
            if (checkImageUploading(isUploading.value)) return
            let params = deepClone(state.formData)
            let { promotionCond, rules_ } = params
            let isEmpty = rules_.some(item => {
                return (!item.rechargePeople && !item.rechargeAmount && !item.playAmount)
            })
            if (isEmpty) return ElMessage.error($t('累计充值人数,累计充值金额,累计投注不能同时为空!'))
            if (promotionCond !== 1) {
                params.attachConfig = {
                    beforeLoginPop: 0,
                    afterLoginPop: 0,
                }
            }
            // params.attachConfig = JSON.stringify(params.attachConfig)
            params.rules_ = {
                resetDay: state.formData.resetDay,
                divideNum: state.formData.divideNum,
                ipLimit: state.formData.ipLimitCheck ? state.formData.ipLimit : 0,
                minAmount: state.formData.minAmount,
                maxAmount: state.formData.maxAmount,
                midAmount: state.formData.midAmount,
                conditions: [...rules_]
            }
            const imageArry = isPPTemplate.value 
                ? [state.oldImage[0], params.image]
                : [params.image, state.oldImage[1]];
            params.image = imageArry.join(',');
            provideData.submit(params)
            
        } else {
            ElMessage.warning($t('请完善表单内容再进行提交！'))
        }
    })
}

defineExpose({ setProbability, valid: formValidate })
</script>

<style lang="scss">
@import '../styles/index.scss';
.recharge-deploy {
    .gLevels-box {
        .el-input-number {
            width: 100px !important;
        }

        .operate {
            display: flex;
            flex-wrap: nowrap;
        }

        .gLevels-small-deploy-special {
            width: 700px;
        }
    }
    .item-row {
        display: flex;
        justify-content: start;
        align-items: baseline;
        .el-input-number {
            width: 120px;
            margin: 0 5px;
        }
    }
    .label-w{
        display: flex;
        align-items: center;
        justify-content: start;
        align-items: baseline;
    }
}
</style>