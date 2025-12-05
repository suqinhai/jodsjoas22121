<template>
    <!-- 运营中心-优惠活动列表-活动配置弹窗-幸运红包抽奖活动 -->
    <el-form :model="state.formData" ref="formRef" :rules="state.rules" :disabled="deployData.operationType === 2"
        class="activity-deploy lucky-red-packet-deploy" :label-width="$locale == 'zh' ? '115px' : '185px'">
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
                <el-form-item :label="$t('稽核倍数:')" prop="auditMultiple">
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
        <el-form-item :label="$t('标签:')" v-if="provideData.showTagCheck()">
            <el-checkbox-group v-model="state.formData.attachConfig.tags">
                <el-checkbox v-for="item in provideData.tagList()" :key="item" :value="item.value" :label="item.value">{{ item.label }}
                </el-checkbox>
            </el-checkbox-group>
        </el-form-item>
        <el-row>
            <el-col :span="12">
                <el-form-item :label="$t('注册IP唯一:')">
                    <el-switch v-model="state.formData.rules_.ipLimit" />
                </el-form-item>
            </el-col>
            <el-col :span="12">
                <el-form-item :label="$t('仅限App端领取:')">
                    <el-switch v-model="state.formData.rules_.appLimit" />
                </el-form-item>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="12">
                <el-form-item :label="$t('抽奖时间:')" prop="rules_.type">
                    <el-select :disabled="isDisabled" v-model="state.formData.rules_.type" :placeholder="$t('请选择抽奖时间')" style="width: 200px"
                        clearable>
                        <el-option v-for="item in provideData.metaData.luckyRedType" :key="item.value" :label="item.label" :value="+item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-col>
            <el-col :span="12">
                <el-form-item :label="$t('设置场次:')" v-if="state.formData.rules_.type === 0" prop="rules_.frequency">
                    <el-select :disabled="isDisabled" v-model="state.formData.rules_.frequency" :placeholder="$t('请选择设置场次')" style="width: 200px">
                        <el-option v-for="item in 11" :key="item" :label="item + $t('次')" :value="item">
                        </el-option>
                    </el-select>
                    <div>{{$t('注：如果场次为5,指的是玩家每小时可抽5次奖')}}</div>
                </el-form-item>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="12" v-if="state.formData.rules_.type !== 2">
                <el-form-item :label="$t('领取时长:')" prop="rules_.timeout">
                    <el-select :disabled="isDisabled" v-model="state.formData.rules_.timeout" :placeholder="$t('请选择领取时长')" style="width: 200px">
                        <el-option :label="'5' + $t('分钟')" :value="5"></el-option>
                        <el-option :label="'20' + $t('分钟')" :value="20"></el-option>
                        <el-option :label="'30' + $t('分钟')" :value="30"></el-option>
                        <el-option :label="'50' + $t('分钟')" :value="50"></el-option>
                    </el-select>
                    <div>{{$t('如：系统发放时间1:00，领取时长30，需在1:30内领取完')}}</div>
                </el-form-item>
            </el-col>
            <el-col :span="12">
                <el-form-item :label="$t('倒计时提醒') + ':'" prop="rules_.countdown">
                    <el-input-number :disabled="isDisabled" style="width: 200px;margin-right: 3px" v-model="state.formData.rules_.countdown" :min="1"
                        :max="9999" :precision="0" :controls="false" placeholder="倒计时提醒" />
                    {{$t('分钟')}}
                </el-form-item>
            </el-col>
        </el-row>
        <el-form-item v-if="state.formData.rules_.type !== 0" class="gLevels-box" :label="$t('设置时段:')">
            <template v-if="state.formData.rules_.type === 1">
                <div v-for="(item, index) in state.formData.rules_.timePeriodList" :key="item" class="gLevels-small">
                    <div>
                        <el-time-picker :disabled="isDisabled" style="width: 200px;" v-model="item.selectTime" is-range format="HH:mm"
                            value-format="HH:mm" :default-value="[new Date(2025, 0, 0, 0, 0), new Date(2025, 0, 0, 23, 59)]"
                            :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')" />
                    </div>
                    <div class="operate" v-if="!isDisabled">
                        <el-button v-throttle v-if="state.formData.rules_.timePeriodList.length < 24" type="primary"
                            @click="handleAddTime(index,'timePeriodList')" :icon="Plus"></el-button>
                        <el-button v-throttle v-if="state.formData.rules_.timePeriodList.length > 1" type="danger"
                            @click="handleDelTime(index,'timePeriodList')" :icon="Minus">
                        </el-button>
                    </div>
                </div>
                <div>{{$t('注：最大配置24条，设置时段内随机一个时间开始抽奖抽一次，该时间段的开始时间+领取时长=结束时间，配置两个时段之间的间隔必须大于等于领取时长。')}}</div>
            </template>
            <template v-if="state.formData.rules_.type === 2">
                <div v-for="(item, index) in state.formData.rules_.fixedTimeList" :key="item" class="gLevels-small">
                    <div>
                        <el-time-picker :disabled="isDisabled" style="width: 120px;" v-model="item.selectTime" format="HH:mm" value-format="HH:mm"
                            :default-value="new Date(2025, 0, 1, 0, 0, 0)" :placeholder="$t('选择时间')" />
                    </div>
                    <div class="operate" v-if="!isDisabled">
                        <el-button v-throttle v-if="state.formData.rules_.fixedTimeList.length < 24" type="primary"
                            @click="handleAddTime(index,'fixedTimeList')" :icon="Plus"></el-button>
                        <el-button v-throttle v-if="state.formData.rules_.fixedTimeList.length > 1" type="danger"
                            @click="handleDelTime(index,'fixedTimeList')" :icon="Minus">
                        </el-button>
                    </div>
                </div>
                <div>{{$t('注：最大配置24条，此抽奖活动需要在设置时间后5分钟内领取完毕，校验配置时间段相续不可低于5分钟。')}}</div>
            </template>
        </el-form-item>
        <div class="rules-small-box" v-for="(item,index) in state.formData.rules_.claimLimits" :key="index">
            <el-card>
                <el-form-item :label="$t('VIP等级:')" :prop="'rules_.claimLimits.' + index + '.vips'"
                    :rules="{ required: true, message: $t('必选项不能为空！'), trigger: 'change' }">
                    <el-select :disabled="isDisabled" style="width: 80%" v-model="item.vips" multiple filterable :placeholder="$t('VIP等级（可多选）')">
                        <el-option :disabled="disabledOption(index,+item.value)" v-for="item in provideData.metaData.userLevel" :key="item.value"
                            :label="item.label" :value="+item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item :label="$t('领取条件:')">
                    <el-radio-group :disabled="isDisabled" v-model="item.limit">
                        <el-radio :value="false" :label="false">{{$t('无条件')}}</el-radio>
                        <el-radio :value="true" :label="true">{{$t('限制条件')}}</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-row v-if="item.limit">
                    <el-col :span="12">
                        <el-form-item :label="$t('当日充值') + ':'">
                            <el-input-number :disabled="isDisabled" v-model="item.recharge" :controls="false" :precision="0" :min="0" :max="999999999"
                                :placeholder="$t('当日充值')" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item :label="$t('当日打码') + ':'">
                            <el-input-number :disabled="isDisabled" v-model="item.play" :controls="false" :precision="0" :min="0" :max="999999999"
                                :placeholder="$t('当日打码')" />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row>
                    <el-col :span="12">
                        <el-form-item :label="$t('奖励类型:')">
                            <el-select :disabled="isDisabled" v-model="item.rewardType">
                                <el-option :label="$t('金额')" :value="0" />
                                <el-option :label="$t('票券')" :value="1" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12" v-if="item.rewardType === 0">
                        <el-form-item :label="$t('奖励金额:')" :prop="'rules_.claimLimits.' + index + '.reward'"
                            :rules="{ required: true, message: $t('请输入奖励金额！'), trigger: 'blur' }">
                            <el-input-number :disabled="isDisabled" v-model="item.reward" :min="0.01" :max="provideData.inputNumberMax" :precision="2"
                                :controls="false" :placeholder="$t('请输入奖励金额')" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row v-if="item.rewardType === 1">
                    <el-col :span="12">
                        <el-form-item :label="$t('奖励票券类型') + ':'">
                            <el-select :disabled="isDisabled" v-model="item.ticketType" :placeholder="$t('票券类型')" @change="item.ticketId = ''">
                                <el-option v-for="ims in provideData.metaData.ticketType" :key="ims.value" :label="ims.label" :value="+ims.value" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item :label="$t('奖励票券') + ':'" :prop="'rules_.claimLimits.' + index + '.ticketId'"
                            :rules="{ required: true, message: $t('必选项不能为空！'), trigger: 'change' }">
                            <el-select :disabled="isDisabled" filterable clearable v-model="item.ticketId" :placeholder="$t('请选择票券')">
                                <el-option :disabled="ims.isDisabled" v-for="ims in provideData.getOptionData(item)" :key="ims.id" :label="ims.name"
                                    :value="ims.id">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-card>

            <div class="operate" v-if="!isDisabled && deployData.operationType !== 2">
                <el-button v-throttle v-if="state.formData.rules_.claimLimits.length < 10" type="primary" @click="handleAdd(index)" :icon="Plus">
                </el-button>
                <el-button v-throttle v-if="state.formData.rules_.claimLimits.length > 1" type="danger" @click="handleDel(index)" :icon="Minus">
                </el-button>
            </div>
        </div>

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
import { reactive, ref, onMounted, inject, computed, defineExpose } from "vue"
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
        bonusType: 1,
        rules_: {
            ipLimit: false,
            appLimit: false,
            type: 0,
            claimLimits: [{ limit: false, rewardType: 0, reward: undefined, ticketType: 0, ticketId: '', recharge: undefined, play: undefined, vips: [] }],
            timePeriodList: [{ selectTime: [] }],
            fixedTimeList: [{ selectTime: '' }],
        },
        attachConfig: {
            tags: [],
        }
    },
    rules: {
        name: { required: true, message: $t('必填项不能为空！'), trigger: "blur" },
        auditMultiple: { required: true, message: $t('必填项不能为空！'), trigger: "blur" },
        beginTime: { required: true, message: $t('请选择活动开始时间！'), trigger: 'change' },
        endTime: { required: true, message: $t('请选择活动结束时间！'), trigger: 'change' },
        showBeginTime: { required: true, message: $t('请选择开始展示时间！'), trigger: 'change' },
        showEndTime: { required: true, message: $t('请选择结束展示时间！'), trigger: 'change' },
        image: { required: true, message: $t('宣传图不能为空！'), trigger: 'change' },
        remark: { required: true, message: $t('必填项不能为空！'), trigger: "blur" },
        'rules_.type': { required: true, message: $t('必选项不能为空！'), trigger: "change" },
        'rules_.frequency': { required: true, message: $t('必选项不能为空！'), trigger: "change" },
        'rules_.timeout': { required: true, message: $t('必选项不能为空！'), trigger: "change" },
        'rules_.countdown': { required: true, message: $t('必填项不能为空！'), trigger: "blur" },
    },
    rulesList: [
        { selectTime: [] },
    ],
})
const formRef = ref(null)
const provideData = inject('provideData')

const checkedVipData = computed(() => {
    let arr = []
    state.formData.rules_.claimLimits.forEach(item => {
        if (item.vips && item.vips.length) {
            arr.push(...item.vips)
        }
    })
    return arr
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
        let { rules_ } = state.formData
        let { timePeriods, fixedTimes, type } = rules_
        if (type === 1) {
            state.formData.rules_.timePeriodList = timePeriods.map(item => {
                return {
                    selectTime: [getDate(item.start), getDate(item.end)]
                }
            })
        } else if (type === 2) {
            state.formData.rules_.fixedTimeList = fixedTimes.map(item => {
                return { selectTime: getDate(item) }
            })
        }
        state.formData.rules_.claimLimits.forEach(item => {
            item.vips.sort((a, b) => a - b)
            if (!item.ticketId || !item.ticketName) {
                item.ticketType = 0
                item.ticketId = ''
            }
        })
    }
    if (!state.formData.rules_.fixedTimeList) {
        state.formData.rules_.fixedTimeList = [{ selectTime: '' }]
    }
    if (!state.formData.rules_.timePeriodList) {
        state.formData.rules_.timePeriodList = [{ selectTime: [] }]
    }
    if (provideData.isCustomize() && props.deployData.attachConfig) {
        state.formData.attachConfig = JSON.parse(props.deployData.attachConfig)
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

const disabledOption = (index, value) => {
    let { vips = [] } = state.formData.rules_.claimLimits[index]
    return !vips.includes(value) && checkedVipData.value.includes(value)
}

// 删除时间段
const handleDelTime = (index, key) => {
    state.formData.rules_[key].splice(index, 1)
}

// 添加时间段
const handleAddTime = (index, key) => {
    let obj = key === 'fixedTimeList' ? { selectTime: '' } : { selectTime: [] }
    state.formData.rules_[key].splice(index + 1, 0, obj)
}

// 删除奖励配置
const handleDel = (index) => {
    state.formData.rules_.claimLimits.splice(index, 1)
}

// 添加奖励配置
const handleAdd = (index) => {
    state.formData.rules_.claimLimits.splice(index + 1, 0, { limit: false, rewardType: 0, reward: undefined, ticketType: 0, ticketId: '', recharge: undefined, play: undefined, vips: [] })
}

const formValidate = () => {
    formRef.value.validate((valid) => {
        if (valid) {
            if (checkImageUploading(isUploading.value)) return
            let params = deepClone(state.formData)
            let { rules_ } = params
            if (rules_.type !== 0) {
                let arr = rules_.type === 1 ? rules_.timePeriodList.filter((item) => item.selectTime.length) : rules_.fixedTimeList.filter((item) => item.selectTime)
                if (!arr.length) {
                    return ElMessage.warning($t('请至少配置一个派发时间段！'))
                }
                let begin = 0
                if (rules_.type === 1) {
                    let end = 0
                    params.rules_.timePeriods = arr.map(item => {
                        begin = item.selectTime[0].split(':')
                        end = item.selectTime[1].split(':')
                        return {
                            start: (Number(begin[0]) * 60) + Number(begin[1]),
                            end: (Number(end[0]) * 60) + Number(end[1])
                        }
                    })
                    params.rules_.timePeriods.sort((a, b) => a.start - b.start)
                } else {
                    arr.sort((a, b) => a.selectTime[0] - b.selectTime[0])
                    params.rules_.fixedTimes = arr.map(item => {
                        begin = item.selectTime.split(':')
                        return (Number(begin[0]) * 60) + Number(begin[1])
                    })
                    params.rules_.fixedTimes.sort((a, b) => a - b)
                    delete params.rules_.timeout
                }
                delete params.rules_.frequency
            }
            params.rules_.claimLimits.forEach(item => {
                if (!item.ticketId || item.rewardType !== 1) {
                    delete item.ticketType
                    delete item.ticketId
                    delete item.ticketName
                }
            })
            if (!provideData.isCustomize()) {
                delete params.attachConfig
            }
            delete params.rules_.timePeriodList
            delete params.rules_.fixedTimeList
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
defineExpose({ valid: formValidate })
</script>

<style lang="scss">
@import '../styles/index.scss';
.lucky-red-packet-deploy {
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
    .rules-small-box {
        margin-bottom: 20px;
        display: flex;
        .el-card {
            flex: 1;
            .items-row {
                .el-form-item__content {
                    .el-form-item__label-wrap {
                        display: none;
                    }
                }
            }
            .el-input-number {
                width: 196px;
            }
        }
        .operate {
            width: 104px;
            margin-left: 15px;
        }
    }
}
</style>
