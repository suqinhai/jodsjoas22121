<template>
    <!-- 运营中心-优惠活动列表-活动配置弹窗-充值活动 -->
    <el-form :model="state.formData" ref="formRef" :rules="state.rules" :disabled="deployData.operationType === 2"
        class="activity-deploy recharge-deploy" :label-width="$locale == 'zh' ? '110px' : 'auto'">
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
        <el-form-item :label="$t('活动排序:')">
            <el-input-number v-model="state.formData.sort" style="width: 200px" :controls="false" :precision="0" :min="0"
                :placeholder="$t('填0或者不填默认排最前面')" />
        </el-form-item>
        <el-form-item :label="$t('标签:')" v-if="provideData.showTagCheck()">
            <el-checkbox-group v-model="state.formData.attachConfig.tags">
                <el-checkbox v-for="item in provideData.tagList()" :key="item.value" :value="item.value" :label="item.value">{{ item.label }}
                </el-checkbox>
            </el-checkbox-group>
        </el-form-item>
        <el-row>
            <el-col :span="12">
                <el-form-item :label="$t('活动条件:')" prop="promotionCond">
                    <el-select :disabled="isDisabled" v-model="state.formData.promotionCond" :placeholder="$t('请选择活动条件')" style="width: 200px"
                        @change="condChange">
                        <el-option v-show="(!provideData.isCustomize() && +item.value < 8) || provideData.isCustomize()"
                            v-for="item in provideData.metaData.promotionCond" :key="item.value" :label="item.label" :value="item.value * 1">
                        </el-option>
                    </el-select>
                    <div v-if="!provideData.isCustomize()">{{tipsTitle}}</div>
                </el-form-item>
            </el-col>
            <el-col :span="12">
                <el-form-item :label="$t('循环方式:')" prop="cycleMode"
                    v-if="[2,3].includes(state.formData.promotionCond)  && !provideData.isCustomize()">
                    <el-select :disabled="isDisabled" v-model="state.formData.cycleMode" :placeholder="$t('请选择循环方式')" style="width: 200px">
                        <el-option v-for="item in provideData.metaData.cycleMode" :key="item.value" :label="item.label" :value="item.value * 1">
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-col>
        </el-row>
        <el-form-item v-if="state.formData.promotionCond === 8" :label="$t('充值方式:')" prop="attachConfig.payWays">
            <el-checkbox-group v-model="state.formData.attachConfig.payWays">
                <el-checkbox v-for="item in provideData.metaData.payWalletData" :key="item.value" :value="+item.value" :label="item.value">
                    {{ item.label }}
                </el-checkbox>
            </el-checkbox-group>
        </el-form-item>
        <el-row v-if="state.formData.promotionCond === 1 && !provideData.isCustomize()">
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
        <el-row>
            <el-col :span="12" v-if="!provideData.isCustomize()">
                <el-form-item :label="$t('稽核方式:')" prop="auditMode">
                    <el-select v-model="state.formData.auditMode" :placeholder="$t('请选择稽核方式')" style="width: 200px">
                        <el-option v-for="item in showAuditMode" :key="item.value" :label="item.label" :value="item.value * 1">
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-col>
            <el-col :span="12">
                <el-form-item :label="$t('稽核倍数:')" prop="auditMultiple">
                    <el-input-number style="width: 200px" v-model="state.formData.auditMultiple" :min="0" :precision="2" :controls="false"
                        :placeholder="$t('请输入稽核倍数')" />
                </el-form-item>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="12">
                <el-form-item :label="$t('奖金方式:')" prop="bonusType">
                    <el-select :disabled="isDisabled" style="width: 200px" v-model="state.formData.bonusType" :placeholder="$t('请选择奖金方式')"
                        @change="handleChangeBonusType">
                        <el-option
                            v-show="!provideData.isCustomize() || (state.formData.promotionCond !== 2 && +item.value !== 2) || (state.formData.promotionCond === 2  && +item.value === 3)"
                            v-for="item in provideData.metaData.bonusType" :key="item.value" :label="item.label" :value="item.value * 1" />
                    </el-select>
                </el-form-item>
            </el-col>
            <el-col :span="12" v-if="!provideData.isCustomize()">
                <el-form-item :label="$t('派发方式:')" prop="dispatchMode">
                    <el-select v-model="state.formData.dispatchMode" :placeholder="$t('请选择派发方式')" style="width: 200px">
                        <el-option v-for="item in provideData.metaData.dispatchMode" :key="item.value" :label="item.label" :value="item.value * 1" />
                    </el-select>
                </el-form-item>
            </el-col>
        </el-row>

        <el-form-item label=" " class="gLevels-box">
            <div v-for="(item, index) in state.formData.rules_" :key="index" class="gLevels-small">
                <div class="gLevels-small-deploy"
                    :class="{'gLevels-small-deploy-special': state.formData.bonusType === 2 && $locale !== 'zh','gLevels-small-deploy-other': $locale !== 'zh'}">
                    <span>{{$t('充值金额满')}}</span>
                    <el-form-item :prop="'rules_.' + index + '.reachAmount'" :rules="[{ required: true, message: $t('请输入充值金额！'), trigger: 'blur' }]"
                        label-width="0">
                        <el-input-number :disabled="isDisabled" v-model="item.reachAmount" :controls="false" :precision="2" :min="0.01"
                            :max="999999999999999" :placeholder="$t('充值金额')" />
                    </el-form-item>
                    <span>，{{ state.formData.bonusType === 2 ? $t('随机') : "" }}{{$t('奖励金额')}}</span>
                    <el-form-item v-if="state.formData.bonusType === 1" :prop="'rules_.' + index + '.rewardAmount'"
                        :rules="[{ required: true, message: $t('请输入奖励金额！'), trigger: 'blur' }]" label-width="0">
                        <el-input-number :disabled="isDisabled" v-model="item.rewardAmount" :controls="false" :precision="2" :min="0"
                            :max="999999999999999" :placeholder="$t('奖励金额')" />
                    </el-form-item>
                    <el-form-item v-if="state.formData.bonusType === 3" :prop="'rules_.' + index + '.rewardAmountRatio'"
                        :rules="[{ required: true, message: $t('请输入奖励金额！'), trigger: 'blur' }]" label-width="0">
                        <el-input-number :disabled="isDisabled" v-model="item.rewardAmountRatio" :controls="false" :precision="2" :min="0"
                            :placeholder="$t('奖励金额')" />
                    </el-form-item>
                    <el-form-item v-if="state.formData.bonusType === 2" :prop="'rules_.' + index + '.rewardMinAmount'"
                        :rules="[{ required: true, message: $t('请输入奖励金额！'), trigger: 'blur' }]" label-width="0">
                        <el-input-number :disabled="isDisabled" v-model="item.rewardMinAmount" :controls="false" :precision="2" :min="0"
                            :max="999999999999999" :placeholder="$t('奖励金额')" @blur="inputBlur(index)" />
                    </el-form-item>
                    <span v-if="state.formData.bonusType === 2">~</span>
                    <el-form-item v-if="state.formData.bonusType === 2" :prop="'rules_.' + index + '.rewardMaxAmount'"
                        :rules="[{ required: true, message: $t('请输入奖励金额！'), trigger: 'blur' }]" label-width="0">
                        <el-input-number :disabled="isDisabled" v-model="item.rewardMaxAmount" :controls="false" :precision="2" :min="0"
                            :max="999999999999999" :placeholder="$t('奖励金额')" @blur="inputBlur(index)" />
                    </el-form-item>
                    <span>{{ state.formData.bonusType !== 3 ? "" : "%" }}</span>
                    <div class="gLevels-small-deploy-ticket">
                        <span class="label">{{state.formData.bonusType === 2 && $locale !== 'zh' ? $t('奖励票券') : $t('，奖励票券')}}</span>
                        <el-select style="width: 120px" :disabled="isDisabled" v-model="item.ticketType" :placeholder="$t('票券类型')"
                            @change="item.ticketId = ''">
                            <el-option v-for="ims in provideData.metaData.ticketType" :key="ims.value" :label="ims.label" :value="+ims.value" />
                        </el-select>
                        <el-select style="width: 180px" :disabled="isDisabled" filterable clearable v-model="item.ticketId"
                            :placeholder="$t('请选择票券')">
                            <el-option :disabled="ims.isDisabled" v-for="ims in provideData.getOptionData(item)" :key="ims.id" :label="ims.name"
                                :value="ims.id">
                            </el-option>
                        </el-select>
                    </div>
                </div>
                <div class="operate">
                    <el-button :disabled="isDisabled" v-if="state.formData.bonusType === 2" v-throttle type="primary"
                        @click="handleProbabilityConfig(index)">{{$t('概率配置')}}</el-button>
                    <el-button :disabled="isDisabled" v-throttle type="primary" @click="handleAdd(index)" :icon="Plus">
                    </el-button>
                    <el-button :disabled="isDisabled" v-throttle v-if="state.formData.rules_.length > 1" type="danger" @click="handleDel(index)"
                        :icon="Minus">
                    </el-button>
                </div>
            </div>
        </el-form-item>
        <el-form-item :label="$t('宣传图:')" prop="image">
            <UploadImage v-model="state.formData.image" :width="state.limit.width" :height="state.limit.height" :disabled="deployData.operationType === 2"
                    :size="state.limit.size"
                    :tip="`${$t('请上传')}${state.limit.width}*${state.limit.height}${$t('或等比例，PNG/JPG/GIF格式小于')}${state.limit.size}${$t('KB的图片')}`" />
        </el-form-item>
        <el-form-item :label="$t('规则说明:')" prop="remark">
            <Tinymce v-model="state.formData.remark" v-model:isUploading="isUploading" :disabled="deployData.operationType === 2" :width="$locale == 'zh' ? 'auto' : '960px'">
            </Tinymce>
        </el-form-item>
        <template v-if="provideData.isCustomize()">
            <el-form-item :label="$t('会员层级:')" prop="fixLayerList">
                <div style="width: 100%">
                    <el-checkbox v-model="state.formData.isCheckedAllLayer" :indeterminate="state.formData.isIndeterminateLayer"
                        @change="(val) => checkChange(val,'memberLevel','id','fixLayerList','isIndeterminateLayer',1)">{{$t('全部层级')}}</el-checkbox>
                </div>
                <el-checkbox-group v-model="state.formData.fixLayerList"
                    @change="(val) => checkChange(val,'memberLevel','id','isCheckedAllLayer','isIndeterminateLayer',0)">
                    <el-checkbox v-for="item in provideData.metaData.memberLevel" :key="item" :label="item.id">{{ item.name }}
                    </el-checkbox>
                </el-checkbox-group>
            </el-form-item>
            <el-form-item :label="$t('会员等级:')" prop="levelList">
                <el-checkbox v-model="state.formData.isCheckedAllLevel" :indeterminate="state.formData.isIndeterminateLevel"
                    @change="(val) => checkChange(val,'userLevel','value','levelList','isIndeterminateLevel',1)">{{$t('全部等级')}}</el-checkbox>
                <el-checkbox-group v-model="state.formData.levelList"
                    @change="(val) => checkChange(val,'userLevel','value','isCheckedAllLevel','isIndeterminateLevel',0)">
                    <el-checkbox v-for="item in provideData.metaData.userLevel" :key="item" :label="item.value">{{ item.label }}
                    </el-checkbox>
                </el-checkbox-group>
            </el-form-item>
        </template>
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
        <template v-if="provideData.isCustomize()">
            <!-- <div class="deploy-title">{{$t('前端说明')}}</div>
            <el-form-item :label="$t('顶部标题:')">
                <el-input style="width: 100%" v-model="state.formData.attachConfig.title" :placeholder="$t('请输入标题内容')" />
            </el-form-item> -->
            <el-form-item :label="$t('充值页面内容:')">
                <!-- <Tinymce v-model="state.formData.attachConfig.desc" :disabled="deployData.operationType === 2"
                    :width="$locale == 'zh' ? 'auto' : '850'">
                </Tinymce> -->
                <el-input style="width: 100%" type="textarea" :rows="6" :placeholder="$t('请输入充值页面内容')" v-model="state.formData.attachConfig.summary"
                    show-word-limit maxlength="500" />
            </el-form-item>
        </template>
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
        rules_: [
            { reachAmount: undefined, rewardAmount: undefined, ticketType: 0, ticketId: '' },
        ],
        attachConfig: {
            beforeLoginPop: 0,
            afterLoginPop: 0,
        }
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
        dispatchMode: [{ required: true, message: $t('必选项不能为空！'), trigger: 'change' }],
        promotionCond: [{ required: true, message: $t('必选项不能为空！'), trigger: 'change' }],
        auditMode: [{ required: true, message: $t('必选项不能为空！'), trigger: 'change' }],
        auditMultiple: [{ required: true, message: $t('必填项不能为空！'), trigger: "blur" }],
        cycleMode: [{ required: true, message: $t('必选项不能为空！'), trigger: 'change' }],
        fixLayerList: [{ required: true, message: $t('必选项不能为空！'), trigger: 'change' }],
        levelList: [{ required: true, message: $t('必选项不能为空！'), trigger: 'change' }],
        'attachConfig.beforeLoginPop': [{ required: true, message: $t('必选项不能为空！'), trigger: 'change' }],
        'attachConfig.afterLoginPop': [{ required: true, message: $t('必选项不能为空！'), trigger: 'change' }],
        'attachConfig.payWays': { required: true, message: $t('必选项不能为空！'), trigger: 'change' },
    },
    currentIndex: '',
})
const formRef = ref(null)
const provideData = inject('provideData')
const emits = defineEmits(['updateContentEdit'])

const showAuditMode = computed(() => {
    return state.formData.promotionCond === 2 ? provideData.metaData.auditMode.filter(item => +item.value !== 2 && +item.value !== 3) : state.formData.promotionCond === 1 ? provideData.metaData.auditMode : provideData.metaData.auditMode.filter(item => +item.value !== 3)
})
const showBonusType = computed(() => {
    return state.formData.promotionCond === 4 ? provideData.metaData.bonusType.filter(item => +item.value !== 3) : provideData.metaData.bonusType
})
const tipsTitle = computed(() => {
    let { promotionCond } = state.formData
    if (promotionCond === 2) {
        return $t('只稽核奖金，奖励可以逐条领取')
    } else {
        return ''
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
    state.formData = Object.assign(state.formData, deepClone(props.deployData))
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
        state.formData.rules_.forEach(item => {
            if (!item.ticketId || !item.ticketName) {
                item.ticketType = 0
                item.ticketId = ''
            }
        })
    }
    if (!state.formData.attachConfig.tags && provideData.isCustomize()) state.formData.attachConfig.tags = []
})

const condChange = (value) => {
    if (value === 2 && !provideData.isCustomize()) state.formData.auditMode = 1
    if (value === 2 && provideData.isCustomize() && state.formData.bonusType !== 3) {
        state.formData.bonusType = 3
        handleChangeBonusType()
    }
    emits('updateContentEdit', value)
}

const inputBlur = (index) => {
    if (state.formData.bonusType !== 2) return
    let { rules_ } = state.formData
    let { rewardMinAmount, rewardMaxAmount } = rules_[index]
    if (typeof rewardMaxAmount !== 'number' || typeof rewardMinAmount !== 'number') return
    if (rewardMaxAmount < rewardMinAmount) {
        state.formData.rules_[index].rewardMaxAmount = rewardMinAmount
    }
}

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

// 复选框勾选变化
const checkChange = (currentValue, metaKey, key, targetKey, indeterminateKey, type) => {
    provideData.checkboxChange({
        currentValue,
        metaKey,
        dependData: state.formData,
        targetKey,
        indeterminateKey,
        key,
        type,
    })
}

//  修改奖金方式
const handleChangeBonusType = (val) => {
    state.formData.rules_ = [{
        reachAmount: undefined,
        rewardAmount: undefined,
        rewardMinAmount: undefined,
        rewardMaxAmount: undefined,
        rewardAmountRatio: undefined,
        ticketType: 0,
        ticketId: ''
    }]
}


//  删除等级
const handleDel = (index) => {
    state.formData.rules_.splice(index, 1)
}

//添加一级
const handleAdd = (index) => {
    state.formData.rules_.splice(index + 1, 0, {
        reachAmount: undefined,
        rewardAmount: undefined,
        rewardMinAmount: undefined,
        rewardMaxAmount: undefined,
        rewardAmountRatio: undefined,
        ticketType: 0,
        ticketId: ''
    })
}

const formValidate = () => {
    formRef.value.validate((valid, fields) => {
        if (valid) {
            if (checkImageUploading(isUploading.value)) return
            let params = deepClone(state.formData)
            let { fixLayerList, levelList, promotionCond, rules_, bonusType, attachConfig } = params

            let failType = 0
            let failIndex
            for (let index = 0; index < rules_.length; index++) {
                let obj = { ...rules_[index] }
                if (!obj.ticketId) {
                    delete rules_[index].ticketType
                    delete rules_[index].ticketId
                    delete rules_[index].ticketName
                }
                if (bonusType === 2 && obj.limitOdds && obj.limitOdds.length) {
                    if (obj.limitOdds.some(its => its.limit < obj.rewardMinAmount || its.limit > obj.rewardMaxAmount)) {
                        failType = 1
                        failIndex = index
                        break
                    }
                    rules_[index].limitOdds[obj.limitOdds.length - 1].limit = rules_[index].rewardMaxAmount
                }
                if (bonusType !== 2 || (obj.limitOdds && !obj.limitOdds.length)) {
                    delete rules_[index].limitOdds
                }
            }
            if (failType) return ElMessage.warning(`${$t('奖励配置第')}${failIndex + 1}${$t('行奖励金额改变，请重新配置相关概率！')}`)

            if(provideData.isCustomize()){
                params.fixLayers = fixLayerList && fixLayerList.length ? fixLayerList.join(",") : ''
                params.levels = levelList && levelList.length ? levelList.join(",") : ''
            }
          
            if (promotionCond !== 1) {
                params.attachConfig = {
                    beforeLoginPop: 0,
                    afterLoginPop: 0,
                }
                if (provideData.isCustomize()) params.attachConfig.tags = attachConfig.tags
            }

            if (promotionCond !== 2 && promotionCond !== 3) {
                params.cycleMode = 1
            }
            if (promotionCond === 2) params.auditMode = 1
            if (provideData.isCustomize()) {
                params.auditMode = 1
                params.dispatchMode = 2
                params.attachConfig.payWays = attachConfig.payWays || []
                params.attachConfig.summary = attachConfig.summary
                params.cycleMode = 1
                // delete params.fixLayers
                // delete params.levelList
                if (promotionCond !== 8) delete params.attachConfig.payWays
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
    .deploy-title {
        font-weight: 700;
        font-size: 16px;
        color: #000;
        margin-bottom: 10px;
    }
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
}
</style>