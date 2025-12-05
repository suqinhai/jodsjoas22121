<template>
    <!-- 运营中心-优惠活动列表-活动配置弹窗-新人彩金活动 -->
    <el-form :model="state.formData" ref="formRef" :rules="state.rules" :disabled="deployData.operationType === 2"
        class="activity-deploy handsel-deploy" :label-width="$locale == 'zh' ? '105px' : 'auto'">
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
        <el-row>
            <el-col :span="9">
                <el-form-item :label="$t('活动排序:')">
                    <el-input-number v-model="state.formData.sort" style="width: 150px" :controls="false" :precision="0" :min="0"
                        :placeholder="$t('请输入排序值')" />
                </el-form-item>
            </el-col>
            <el-col :span="15">
                <el-form-item :label-width="$locale == 'zh' ? '140px' : 'auto'" :label="$t('稽核倍数:')" prop="auditMultiple">
                    <el-input-number style="width: 200px" v-model="state.formData.auditMultiple" :min="0" :precision="2" :controls="false"
                        :placeholder="$t('请输入稽核倍数')" />
                </el-form-item>
            </el-col>
        </el-row>
        <el-form-item :label="$t('标签:')" v-if="provideData.showTagCheck()">
            <el-checkbox-group v-model="state.formData.attachConfig.tags">
                <el-checkbox v-for="item in provideData.tagList()" :key="item" :value="item.value" :label="item.value">{{ item.label }}
                </el-checkbox>
            </el-checkbox-group>
        </el-form-item>
        <el-form-item :label="$t('优惠类型:')">
            <el-radio-group v-model="state.formData.rules_.type">
                <el-radio :label="0">{{$t('唯一型兑换码')}}</el-radio>
                <el-radio :label="1">{{$t('通用型兑换码')}}</el-radio>
            </el-radio-group>
        </el-form-item>
        <el-row v-if="state.formData.rules_.type === 0">
            <el-col :span="9">
                <el-form-item :label="$t('兑换码数量:')" prop="rules_.total">
                    <el-input-number v-model="state.formData.rules_.total" style="width: 150px" :controls="false" :precision="0" :min="1"
                        :max="1000000" :placeholder="$t('请输入兑换码数量')" />
                </el-form-item>
            </el-col>
            <el-col :span="15">
                <el-form-item :label-width="$locale == 'zh' ? '140px' : 'auto'" :label="$t('有效期截止时间:')" prop="rules_.timeout">
                    <el-date-picker style="width: 200px" v-model="state.formData.rules_.timeout" type="datetime" value-format="YYYY-MM-DD HH:mm:ss"
                        :disabled-date="(time) => disabledDate(time)" :placeholder="$t('请选择时间')" />
                </el-form-item>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="9">
                <el-form-item :label="$t('首充限制:')">
                    <el-switch v-model="state.formData.rules_.recharge" />
                </el-form-item>
            </el-col>
            <el-col :span="15" v-if="state.formData.rules_.type === 1">
                <el-form-item :label-width="$locale == 'zh' ? '140px' : 'auto'" :label="$t('通用型兑换码:')">
                    <el-input v-model="state.formData.rules_.code" style="width: 200px" :placeholder="$t('请输入通用型兑换码')" />
                </el-form-item>
            </el-col>
        </el-row>

        <el-row>
            <el-col :span="9">
                <el-form-item :label="$t('奖励类型:')" prop="bonusType">
                    <el-select v-model="state.formData.bonusType" style="width: 150px" :placeholder="$t('请选择奖励类型')">
                        <el-option :label="$t('固定奖金')" :value="1" />
                        <el-option :label="$t('随机奖金')" :value="2" />
                    </el-select>
                </el-form-item>
            </el-col>
            <el-col :span="15">
                <el-form-item :label-width="$locale == 'zh' ? '140px' : 'auto'" v-if="state.formData.bonusType !== 2" :label="$t('赠送金额:')"
                    prop="rules_.reward">
                    <el-input-number style="width: 190px" v-model="state.formData.rules_.reward" :min="0.01" :max="999999999999999" :precision="2"
                        :controls="false" :placeholder="$t('请输入赠送金额')" />
                </el-form-item>
                <el-form-item :label-width="$locale == 'zh' ? '140px' : 'auto'" class="items-row" v-if="state.formData.bonusType === 2"
                    :label="$t('赠送金额:')">
                    <el-form-item prop="rules_.min" label-width="0">
                        <el-input-number style="width: 100px" v-model="state.formData.rules_.min" :min="0.01" :max="999999999999999" :precision="2"
                            :controls="false" :placeholder="$t('金额最小值')" @blur="inputBlur" />
                    </el-form-item>
                    <span style="margin: 0 5px 0 -5px">~</span>
                    <el-form-item prop="rules_.max" label-width="0">
                        <el-input-number style="width: 100px" v-model="state.formData.rules_.max" :min="0.01" :max="999999999999999" :precision="2"
                            :controls="false" :placeholder="$t('金额最大值')" @blur="inputBlur" />
                    </el-form-item>
                    <el-button v-throttle type="primary" @click="handleProbabilityConfig">{{$t('概率配置')}}</el-button>
                </el-form-item>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="9">
                <el-form-item :label="$t('奖励票券类型') + ':'">
                    <el-select style="width: 150px" v-model="state.formData.rules_.ticketType" :placeholder="$t('票券类型')"
                        @change="state.formData.rules_.ticketId = ''">
                        <el-option v-for="ims in provideData.metaData.ticketType" :key="ims.value" :label="ims.label" :value="+ims.value" />
                    </el-select>
                </el-form-item>
            </el-col>
            <el-col :span="15">
                <el-form-item :label-width="$locale == 'zh' ? '140px' : 'auto'" :label="$t('奖励票券:')">
                    <el-select style="width: 190px" filterable clearable v-model="state.formData.rules_.ticketId" :placeholder="$t('请选择票券')">
                        <el-option :disabled="ims.isDisabled" v-for="ims in provideData.getOptionData(state.formData.rules_)" :key="ims.id"
                            :label="ims.name" :value="ims.id">
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="9">
                <el-form-item :label="$t('展示彩金:')">
                    <el-switch v-model="state.formData.rules_.show" />
                </el-form-item>
            </el-col>
            <el-col :span="15">
                <el-form-item :label-width="$locale == 'zh' ? '140px' : 'auto'" v-if="state.formData.bonusType !== 2" :label="$t('展示金额:')"
                    prop="rules_.showReward" :rules="[{ required: state.formData.rules_.show, message: $t('请输入展示金额！'), trigger: 'blur' }]">
                    <el-input-number style="width: 190px" v-model="state.formData.rules_.showReward" :min="0.01" :max="999999999999999" :precision="2"
                        :controls="false" :placeholder="$t('请输入展示金额')" />
                </el-form-item>
                <el-form-item :label-width="$locale == 'zh' ? '140px' : 'auto'" class="items-row" v-if="state.formData.bonusType === 2"
                    :label="$t('展示金额:')">
                    <el-form-item prop="rules_.showMin" :rules="[{ required: state.formData.rules_.show, message: $t('请输入金额！'), trigger: 'blur' }]"
                        label-width="0">
                        <el-input-number style="width: 100px" v-model="state.formData.rules_.showMin" :min="0.01" :max="999999999999999"
                            :precision="2" :controls="false" :placeholder="$t('金额最小值')" @blur="inputShowBlur" />
                    </el-form-item>
                    <span style="margin: 0 5px 0 -5px">~</span>
                    <el-form-item prop="rules_.showMax" :rules="[{ required: state.formData.rules_.show, message: $t('请输入金额！'), trigger: 'blur' }]"
                        label-width="0">
                        <el-input-number style="width: 100px" v-model="state.formData.rules_.showMax" :min="0.01" :max="999999999999999"
                            :precision="2" :controls="false" :placeholder="$t('金额最大值')" @blur="inputShowBlur" />
                    </el-form-item>
                </el-form-item>
            </el-col>
        </el-row>

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
            <Tinymce v-model="state.formData.remark" v-model:isUploading="isUploading" :disabled="deployData.operationType === 2" :width="$locale == 'zh' ? 'auto' : '700px'">
            </Tinymce>
        </el-form-item>
        <el-form-item :label="$t('会员等级:')" prop="levelList" v-if="provideData.isShowLevels">
            <el-checkbox v-model="state.formData.isCheckedAllLevel" :indeterminate="state.formData.isIndeterminateLevel"
                @change="(val) => checkChange(val,'levelList',1)">{{$t('全部等级')}}</el-checkbox>
            <el-checkbox-group v-model="state.formData.levelList" @change="(val) => checkChange(val,'isCheckedAllLevel',0)">
                <el-checkbox v-for="item in provideData.metaData.userLevel" :key="item" :label="item.value">{{ item.label }}
                </el-checkbox>
            </el-checkbox-group>
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
import { reactive, ref, onMounted, defineExpose, inject, computed } from "vue"
import { Plus, Minus } from "@element-plus/icons-vue"
import { ElMessage } from "element-plus"
import { deepClone, dateFormat } from "@/common/util/index"
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
        bonusType: 1,
        rules_: {
            type: 0,
            recharge: false,
            show: false,
            ticketType: 0,
            ticketId: '',
        },
        attachConfig: {
            tags: [],
        }
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
        levelList: [{ required: true, message: $t('必选项不能为空！'), trigger: 'change' }],
        bonusType: [{ required: true, message: $t('请选择奖励类型！'), trigger: "change" }],
        'rules_.total': [{ required: true, message: $t('请输入兑换码数量！'), trigger: "blur" }],
        'rules_.timeout': [{ required: true, message: $t('请设置有效期截止时间！'), trigger: "change" }],
        'rules_.reward': [{ required: true, message: $t('请输入赠送金额！'), trigger: "blur" }],
        'rules_.min': [{ required: true, message: $t('请输入金额！'), trigger: "blur" }],
        'rules_.max': [{ required: true, message: $t('请输入金额！'), trigger: "blur" }],
    },
    currentIndex: ''
})
const formRef = ref(null)
const provideData = inject('provideData')
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
        state.formData.rules_.timeout = dateFormat(state.formData.rules_.timeout)
        if (!state.formData.rules_.ticketId || !state.formData.rules_.ticketName) {
            state.formData.rules_.ticketType = 0
            state.formData.rules_.ticketId = ''
        }
        if (provideData.isCustomize() && props.deployData.attachConfig) {
            state.formData.attachConfig = JSON.parse(props.deployData.attachConfig)
        }
    }
})

const inputBlur = () => {
    let { rules_ } = state.formData
    if (typeof rules_.min !== 'number' || typeof rules_.max !== 'number') return
    if (rules_.max < rules_.min) {
        state.formData.rules_.max = rules_.min
    }
}

const inputShowBlur = () => {
    let { rules_ } = state.formData
    if (typeof rules_.showMin !== 'number' || typeof rules_.showMax !== 'number') return
    if (rules_.showMax < rules_.showMin) {
        state.formData.rules_.showMax = rules_.showMin
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

// 打开概率设置弹窗
const handleProbabilityConfig = () => {
    let { max, min, limitOdds = [] } = state.formData.rules_
    if (typeof max !== 'number' || typeof min !== 'number') return ElMessage.warning($t('请配置完奖励金额再进行操作！'))
    if (max <= 0.01) return ElMessage.warning($t('奖励金额必须大于0.01才能配置概率！'))
    provideData.probabilityDeployShow({
        rewardMinAmount: min,
        rewardMaxAmount: max,
        limitOdds,
    })
}

// 设置奖励概率数据
const setProbability = (val) => {
    if (!val.length) return delete state.formData.rules_.limitOdds
    state.formData.rules_.limitOdds = val
}

const formValidate = () => {
    formRef.value.validate((valid) => {
        if (valid) {
            if (checkImageUploading(isUploading.value)) return
            let params = deepClone(state.formData)
            let { rules_, bonusType } = params
            if (bonusType === 2 && rules_.limitOdds && rules_.limitOdds.length) {
                if (rules_.limitOdds.some(item => item.limit < rules_.min || item.limit > rules_.max)) return ElMessage.warning($t('奖励金额改变，请重新配置相关概率！'))
                rules_.limitOdds[rules_.limitOdds.length - 1].limit = rules_.max
            }
            if (bonusType !== 2 || (rules_.limitOdds && !rules_.limitOdds.length)) {
                delete rules_.limitOdds
            }
            if (!rules_.type) delete rules_.code
            if (!rules_.ticketId) {
                delete params.rules_.ticketType
                delete params.rules_.ticketId
                delete params.rules_.ticketName
            }
            if (!provideData.isCustomize()) {
                delete params.attachConfig
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
.handsel-deploy {
    .items-row {
        .el-form-item__content {
            display: flex;
            .el-form-item {
                width: 110px;
            }
        }
    }
}
</style>
