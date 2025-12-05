<template>
    <!-- 运营中心-优惠活动列表-活动配置弹窗-红包活动 -->
    <div>
        <el-form :model="state.formData" ref="formRef" :rules="state.rules" :disabled="deployData.operationType === 2"
            class="activity-deploy red-packet-deploy" :label-width="$locale == 'zh' ? '115px' : '230px'">
            <el-form-item :label="$t('活动名称:')" prop="name">
                <el-input style="width: 100%" v-model="state.formData.name" :placeholder="$t('请输入活动名称')" />
            </el-form-item>
            <el-row>
                <el-col :span="10">
                    <el-form-item :label="$t('活动排序:')">
                        <el-input-number v-model="state.formData.sort" style="width: 200px" :controls="false" :precision="0" :min="0"
                            :placeholder="$t('填0或者不填默认排最前面')" />
                    </el-form-item>
                </el-col>
                <el-col :span="14">
                    <el-form-item :label-width="$locale == 'zh' ? '200px' : '200px'" :label="$t('稽核倍数:')" prop="auditMultiple">
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
            <el-form-item class="gLevels-box" :label="$t('每日派发时间:')">
                <div v-for="(item, index) in state.rulesList" :key="item" class="gLevels-small">
                    <div>
                        <el-time-picker style="width: 200px;" v-model="item.selectTime" is-range format="HH:mm" value-format="HH:mm"
                            :default-value="[new Date(2025, 0, 0, 0, 0), new Date(2025, 0, 0, 23, 59)]" :start-placeholder="$t('开始时间')"
                            :end-placeholder="$t('结束时间')" />
                    </div>
                    <div class="operate">
                        <el-button v-throttle v-if="state.rulesList.length < 24" type="primary" @click="handleAdd(index)" :icon="Plus"></el-button>
                        <el-button v-throttle v-if="state.rulesList.length > 1" type="danger" @click="handleDel(index)" :icon="Minus">
                        </el-button>
                    </div>
                </div>
            </el-form-item>
            <el-row>
                <el-col :span="12">
                    <el-form-item>
                        <template #label>
                            <span class="pointer" @click.native.prevent="lookRedPacketExplain(1)">
                                {{$t('领取条件')}}<el-icon :size="16">
                                    <QuestionFilled />
                                </el-icon>:
                            </span>
                        </template>
                        <el-select :disabled="isDisabled" v-model="state.formData.rules_.condType" :placeholder="$t('请选择领取条件')" style="width: 200px">
                            <el-option v-for="item in provideData.metaData.redEnvelopeCondType" :key="item.value" :label="item.label"
                                :value="Number(item.value)">
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item v-if="state.formData.rules_.condType" :label="$t('条件金额:')" prop="rules_.condAmount">
                        <el-input-number style="width: 200px" v-model="state.formData.rules_.condAmount" :min="0.01" :precision="2" :controls="false"
                            placeholder="0.00" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-form-item prop="bonusType">
                <template #label>
                    <span class="pointer" @click.native.prevent="lookRedPacketExplain(2)">
                        {{$t('奖励类型')}}<el-icon :size="16">
                            <QuestionFilled />
                        </el-icon>:
                    </span>
                </template>
                <el-radio-group :disabled="isDisabled" v-model="state.formData.bonusType">
                    <el-radio :label="1">{{$t('固定金额')}}</el-radio>
                    <el-radio :label="2">{{$t('随机奖励')}}</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-row>
                <el-col :span="10">
                    <el-form-item :label="$t('红包总数:')" prop="rules_.total">
                        <el-input-number style="width: 100%" v-model="state.formData.rules_.total" :min="1" :max="99999999" :precision="0"
                            :controls="false" :placeholder="$t('请输入红包总数')" />
                    </el-form-item>
                </el-col>
                <el-col :span="14">
                    <el-form-item v-if="state.formData.bonusType === 1" :label="$t('单个金额:')" prop="rules_.reward"
                        :label-width="$locale == 'zh' ? '200px' : '200px'">
                        <el-input-number style="width: 190px" v-model="state.formData.rules_.reward" :min="0.01" :max="999999999" :precision="2"
                            :controls="false" :placeholder="$t('请输入单个金额')" />
                    </el-form-item>
                    <el-form-item class="items-row" v-if="state.formData.bonusType === 2" :label="$t('单个金额范围:')"
                        :label-width="$locale == 'zh' ? '200px' : '200px'">
                        <el-form-item prop="rules_.min" label-width="0">
                            <el-input-number style="width: 100px" v-model="state.formData.rules_.min" :min="0.01" :max="999999999" :precision="2"
                                :controls="false" :placeholder="$t('金额最小值')" @blur="inputBlur" />
                        </el-form-item>
                        <span style="margin: 0 3px 0 -7px">~</span>
                        <el-form-item prop="rules_.max" label-width="0">
                            <el-input-number style="width: 100px" v-model="state.formData.rules_.max" :min="0.01" :max="999999999" :precision="2"
                                :controls="false" :placeholder="$t('金额最大值')" @blur="inputBlur" />
                        </el-form-item>
                        <el-button v-throttle type="primary" @click="handleProbabilityConfig">{{$t('概率配置')}}</el-button>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="10">
                    <el-form-item :label="$t('总次数上限:')" prop="rules_.count">
                        <template #label>
                            <span class="pointer" @click.native.prevent="lookRedPacketExplain(3)">
                                {{$t('总次数上限')}}<el-icon :size="16">
                                    <QuestionFilled />
                                </el-icon>:
                            </span>
                        </template>
                        <el-input-number style="width: 100%" v-model="state.formData.rules_.count" :min="0" :max="9999" :precision="0"
                            :controls="false" :placeholder="$t('请输入总次数上限')" />
                    </el-form-item>
                </el-col>
                <el-col :span="14">
                    <el-form-item :label-width="$locale == 'zh' ? '200px' : 'auto'" v-if="state.formData.bonusType === 2" :label="$t('每个时间段红包总金额:')"
                        prop="rules_.totalAmount">
                        <el-input-number style="width: 190px" v-model="state.formData.rules_.totalAmount" :min="1" :max="999999999999999"
                            :precision="2" :controls="false" :placeholder="$t('请输入金额')" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="10">
                    <el-form-item :label="$t('限抢次数:')" prop="rules_.limit">
                        <template #label>
                            <span class="pointer" @click.native.prevent="lookRedPacketExplain(3)">
                                {{$t('限抢次数')}}<el-icon :size="16">
                                    <QuestionFilled />
                                </el-icon>:
                            </span>
                        </template>
                        <el-input-number style="width: 100%" v-model="state.formData.rules_.limit" :min="1" :max="100" :precision="0"
                            :controls="false" :placeholder="$t('请输入限抢次数')" />
                    </el-form-item>
                </el-col>
                <el-col :span="14">
                    <el-form-item :label="$t('每个时间段红包总数:')" :label-width="$locale == 'zh' ? '200px' : '360px'">
                        <el-input-number style="width: 190px" v-model="state.formData.rules_.periodTotal" :min="1" :max="50000" :precision="0"
                            :controls="false" :placeholder="$t('请输入每个时间段红包总数')" />
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
                <Tinymce v-model="state.formData.remark" v-model:isUploading="isUploading" :disabled="deployData.operationType === 2" :width="$locale == 'zh' ? 'auto' : '780px'">
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

        <RedPacketExplainDialog v-if="state.showRedPacketExplain" :type="state.explainType" @close="state.showRedPacketExplain = false">
        </RedPacketExplainDialog>
    </div>
</template>

<script setup>
import { reactive, ref, onMounted, defineExpose, inject, defineAsyncComponent, computed } from "vue"
import { Plus, Minus } from "@element-plus/icons-vue"
import { ElMessage } from "element-plus"
import { deepClone } from "@/common/util/index"
const RedPacketExplainDialog = defineAsyncComponent(() => import("./RedPacketExplainDialog.vue"))
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
            condType: 0,
        },
    },
    rules: {
        name: [{ required: true, message: $t('必填项不能为空！'), trigger: "blur" }],
        auditMultiple: [{ required: true, message: $t('必填项不能为空！'), trigger: "blur" }],
        beginTime: [{ required: true, message: $t('请选择活动开始时间！'), trigger: 'change' }],
        endTime: [{ required: true, message: $t('请选择活动结束时间！'), trigger: 'change' }],
        showBeginTime: [{ required: true, message: $t('请选择开始展示时间！'), trigger: 'change' }],
        showEndTime: [{ required: true, message: $t('请选择结束展示时间！'), trigger: 'change' }],
        image: [{ required: true, message: $t('宣传图不能为空！'), trigger: 'change' }],
        remark: [{ required: true, message: $t('必填项不能为空！'), trigger: "blur" }],
        levelList: [{ required: true, message: $t('必选项不能为空！'), trigger: 'change' }],
        'rules_.condAmount': [{ required: true, message: $t('必填项不能为空！'), trigger: "blur" }],
        'rules_.total': [{ required: true, message: $t('请输入红包总数！'), trigger: "blur" }],
        'rules_.reward': [{ required: true, message: $t('请输入单个金额！'), trigger: "blur" }],
        'rules_.limit': [{ required: true, message: $t('请输入限抢次数！'), trigger: "blur" }],
        'rules_.count': [{ required: true, message: $t('请输入总次数上限！'), trigger: "blur" }],
        'rules_.min': [{ required: true, message: $t('请输入金额！'), trigger: "blur" }],
        'rules_.max': [{ required: true, message: $t('请输入金额！'), trigger: "blur" }],
    },
    rulesList: [
        { selectTime: [] },
    ],
    showRedPacketExplain: false,
    explainType: '',
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
        let { rules_ } = state.formData
        let { intervals } = rules_
        state.rulesList = intervals.map(item => {
            return {
                selectTime: [getDate(item[0]), getDate(item[1])]
            }
        })
    }
})

const getDate = (val) => {
    let start = ''
    let end = ''
    let hour = 0
    let minute = 0
    if (val < 60) {
        start = '00'
        end = val >= 10 ? String(val) : '0' + String(val)
    } else {
        hour = parseInt(val / 60)
        minute = val - (hour * 60)
        start = hour >= 10 ? String(hour) : '0' + String(hour)
        end = minute >= 10 ? String(minute) : '0' + String(minute)
    }
    return start + ':' + end
}

const inputBlur = () => {
    let { rules_ } = state.formData
    if (typeof rules_.min !== 'number' || typeof rules_.max !== 'number') return
    if (rules_.max < rules_.min) {
        state.formData.rules_.max = rules_.min
    }
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

//  删除等级
const handleDel = (index) => {
    state.rulesList.splice(index, 1)
};

//  添加一级
const handleAdd = (index) => {
    state.rulesList.splice(index + 1, 0, {
        selectTime: []
    })
}


// 查看红包说明
const lookRedPacketExplain = (val) => {
    state.explainType = val
    state.showRedPacketExplain = true
}

const formValidate = () => {
    formRef.value.validate((valid, fields) => {
        if (valid) {
            if (checkImageUploading(isUploading.value)) return
            let params = deepClone(state.formData)
            let arr = state.rulesList.filter((item) => item.selectTime.length)
            if (!arr.length) {
                return ElMessage.warning($t('请至少配置一个派发时间段！'))
            }
            let { rules_, bonusType } = params
            if (bonusType === 2 && rules_.limitOdds && rules_.limitOdds.length) {
                if (rules_.limitOdds.some(item => item.limit < rules_.min || item.limit > rules_.max)) return ElMessage.warning($t('奖励金额改变，请重新配置相关概率！'))
                rules_.limitOdds[rules_.limitOdds.length - 1].limit = rules_.max
            }
            if (bonusType !== 2 || (rules_.limitOdds && !rules_.limitOdds.length)) {
                delete rules_.limitOdds
            }
            if (bonusType !== 2) delete rules_.totalAmount
            let begin = 0
            let end = 0
            rules_.intervals = arr.map(item => {
                begin = item.selectTime[0].split(':')
                end = item.selectTime[1].split(':')
                return [(Number(begin[0]) * 60) + Number(begin[1]), (Number(end[0]) * 60) + Number(end[1])]
            })
            rules_.type = 1
            rules_.status = true
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
.red-packet-deploy {
    .gLevels-box {
        margin-bottom: 10px;
        .gLevels-small {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }
        .operate {
            display: flex;
            align-items: center;
            margin-left: 20px;
        }
    }
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
