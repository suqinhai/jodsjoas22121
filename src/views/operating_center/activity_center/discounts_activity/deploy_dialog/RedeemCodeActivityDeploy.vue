<template>
    <!-- 运营中心-优惠活动列表-活动配置弹窗-兑换码活动 -->
    <el-form :model="state.formData" ref="formRef" :rules="state.rules" :disabled="deployData.operationType === 2"
        class="activity-deploy redeem-code-deploy" :label-width="$locale == 'zh' ? '125px' : state.formData.rules_.type === 0 ? 'auto' : '153px'">
        <el-form-item :label="$t('活动名称:')" prop="name">
            <el-input style="width: 100%" v-model="state.formData.name" :placeholder="$t('请输入活动名称')" />
        </el-form-item>
        <el-form-item :label="$t('活动时间:')" class="time-box">
            <el-form-item prop="beginTime" label-width="0">
                <el-date-picker :disabled="isDisabled" v-model="state.formData.beginTime" type="date" value-format="YYYY-MM-DD HH:mm:ss"
                    :disabled-date="(time) => disabledDate(time)" :placeholder="$t('开始时间')">
                </el-date-picker>
            </el-form-item>
            <span class="stance">{{$t('至')}}</span>
            <el-form-item prop="endTime" label-width="0">
                <el-date-picker v-model="state.formData.endTime" type="date" value-format="YYYY-MM-DD HH:mm:ss"
                    :disabled-date="(time) => disabledDate(time)" :placeholder="$t('结束时间')">
                </el-date-picker>
            </el-form-item>
        </el-form-item>
        <!-- <el-form-item :label="$t('展示时间:')" class="time-box">
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
        </el-form-item> -->
        <el-row>
            <el-col :span="13">
                <el-form-item :label="$t('活动排序:')">
                    <el-input-number v-model="state.formData.sort" :controls="false" :precision="0" :min="0" :placeholder="$t('请输入排序值')" />
                </el-form-item>
            </el-col>
            <el-col :span="11">
                <el-form-item :label="$t('稽核倍数:')" prop="auditMultiple">
                    <el-input-number v-model="state.formData.auditMultiple" :min="0" :precision="2" :controls="false" :placeholder="$t('请输入稽核倍数')" />
                </el-form-item>
            </el-col>
        </el-row>
        <el-form-item :label="$t('标签:')" v-if="provideData.showTagCheck()">
            <el-checkbox-group v-model="state.formData.attachConfig.tags">
                <el-checkbox v-for="item in provideData.tagList()" :key="item" :value="item.value" :label="item.value">{{ item.label }}
                </el-checkbox>
            </el-checkbox-group>
        </el-form-item>
        <div class="rules-small-box" v-for="(item,index) in state.formData.rules_.items" :key="index">
            <el-card>
                <el-row>
                    <el-col :span="10.5">
                        <el-form-item :label="$t('兑换码:')" :prop="'rules_.items.' + index + '.code'"
                            :rules="[{ required: true, message: $t('必填项不能为空！'), trigger: 'blur' }]">
                            <el-input style="width: 196px" :disabled="isDisabled" v-model="item.code" :placeholder="$t('请输入兑换码')" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12.5">
                        <el-form-item :label="$t('使用次数:')" :prop="'rules_.items.' + index + '.total'"
                            :rules="[{ required: true, message: $t('必填项不能为空！'), trigger: 'blur' }]">
                            <el-input-number v-model="item.total" :controls="false" :precision="0" :min="1" :max="9999"
                                :placeholder="$t('请输入使用次数')" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item :label="$t('有效期截止时间:')" :prop="'rules_.items.' + index + '.timeout'"
                    :rules="{ required: true, message: $t('必选项不能为空！'), trigger: 'change' }">
                    <el-date-picker style="width: 196px" v-model="item.timeout" type="datetime" value-format="YYYY-MM-DD HH:mm:ss"
                        :disabled-date="(time) => disabledDate(time)" :placeholder="$t('请选择时间')">
                    </el-date-picker>
                </el-form-item>
                <el-row>
                    <el-col :span="10.5">
                        <el-form-item :label="$t('充值要求:')">
                            <el-input-number v-model="item.recharge" :controls="false" :precision="0" :min="0" :max="999999999"
                                :placeholder="$t('充值要求')" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12.5">
                        <el-form-item :label="$t('打码要求:')">
                            <el-input-number v-model="item.playCoin" :controls="false" :precision="0" :min="0" :max="999999999"
                                :placeholder="$t('打码要求')" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item :label="$t('VIP等级:')" :prop="'rules_.items.' + index + '.levels'"
                    :rules="{ required: true, message: $t('必选项不能为空！'), trigger: 'change' }">
                    <el-select style="width: 80%" v-model="item.levels" multiple filterable :placeholder="$t('VIP等级（可多选）')">
                        <el-option :disabled="disabledOption(index,+item.value)" v-for="item in provideData.metaData.userLevel" :key="item.value"
                            :label="item.label" :value="+item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item :label-width="$locale == 'zh' ? '115px' : 'auto'" :label="$t('指定代理/渠道:')">
                    <el-radio-group v-model="item.type">
                        <el-radio :value="1" :label="1">{{$t('指定代理ID')}}</el-radio>
                        <el-radio :value="2" :label="2">{{$t('指定渠道')}}</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item v-if="item.type === 1" :label="$t('指定代理ID') + ':'" :prop="'rules_.items.' + index + '.agentIds'" :rules="{
                        pattern: /^\d+(?:,\d+)*$/,
                        message: $t('请输入正确的代理ID，多个需要用英文逗号隔开！'),
                        trigger: 'change',
                    }">
                    <el-input @input="(val) => item.agentIds = val.replace('，','')" v-model="item.agentIds" style="width: 100%" type="textarea"
                        :rows="4" :placeholder="$t('请输入代理ID，多个需要用英文逗号隔开')" />
                </el-form-item>
                <template v-if="item.type === 2">
                    <el-form-item :label="$t('指定渠道') + ':'">
                        <el-select style="width: 80%" v-model="item.channelIds" multiple filterable :placeholder="$t('请选择渠道（可多选）')">
                            <el-option v-for="item in channelList" :key="item.id" :label="item.name" :value="item.id" />
                        </el-select>
                    </el-form-item>
                </template>

                <el-row>
                    <el-col :span="10.5">
                        <el-form-item :label="$t('优惠方式:')">
                            <el-select v-model="item.bonusType">
                                <el-option :label="$t('固定奖金')" :value="1" />
                                <el-option :label="$t('随机奖金')" :value="2" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12.5">
                        <el-form-item v-if="item.bonusType === 1" :label="$t('赠送金额:')" :prop="'rules_.items.' + index + '.reward'"
                            :rules="{ required: true, message: $t('请输入赠送金额！'), trigger: 'blur' }">
                            <el-input-number v-model="item.reward" :min="0.01" :max="provideData.inputNumberMax" :precision="2" :controls="false"
                                :placeholder="$t('请输入赠送金额')" />
                        </el-form-item>
                        <el-form-item class="items-row" v-if="item.bonusType === 2" :label="$t('赠送金额:')">
                            <el-form-item :prop="'rules_.items.' + index + '.min'"
                                :rules="{ required: true, message: $t('请输入赠送金额！'), trigger: 'blur' }">
                                <el-input-number style="width: 100px" v-model="item.min" :min="0.01" :max="provideData.inputNumberMax" :precision="2"
                                    :controls="false" :placeholder="$t('金额最小值')" @blur="inputBlur(index)" />
                            </el-form-item>
                            <span style="margin: 0 5px 0 -5px">~</span>
                            <el-form-item :prop="'rules_.items.' + index + '.max'"
                                :rules="{ required: true, message: $t('请输入赠送金额！'), trigger: 'blur' }">
                                <el-input-number style="width: 100px" v-model="item.max" :min="0.01" :max="provideData.inputNumberMax" :precision="2"
                                    :controls="false" :placeholder="$t('金额最大值')" @blur="inputBlur(index)" />
                            </el-form-item>
                            <el-button v-throttle type="primary" @click="handleProbabilityConfig(index)">{{$t('概率配置')}}</el-button>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="10.5">
                        <el-form-item :label="$t('赠送票券类型') + ':'">
                            <el-select v-model="item.ticketType" :placeholder="$t('票券类型')" @change="item.ticketId = ''">
                                <el-option v-for="ims in provideData.metaData.ticketType" :key="ims.value" :label="ims.label" :value="+ims.value" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12.5">
                        <el-form-item :label="$t('赠送票券') + ':'">
                            <el-select filterable clearable v-model="item.ticketId" :placeholder="$t('请选择票券')">
                                <el-option :disabled="ims.isDisabled" v-for="ims in provideData.getOptionData(item)" :key="ims.id" :label="ims.name"
                                    :value="ims.id">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-card>
            <div class="operate">
                <el-button :disabled="isDisabled" v-throttle v-if="state.formData.rules_.items.length < 10" type="primary" @click="handleAdd(index)"
                    :icon="Plus">
                </el-button>
                <el-button :disabled="isDisabled" v-throttle v-if="state.formData.rules_.items.length > 1" type="danger" @click="handleDel(index)"
                    :icon="Minus">
                </el-button>
            </div>
        </div>
        <el-row>
            <el-col :span="13">
                <el-form-item :label="$t('展示彩金:')">
                    <el-switch v-model="state.formData.rules_.show" />
                </el-form-item>
            </el-col>
            <el-col :span="11">
                <el-form-item :label="$t('展示金额:')" prop="rules_.showReward"
                    :rules="[{ required: state.formData.rules_.show, message: $t('请输入展示金额！'), trigger: 'blur' }]">
                    <el-input-number v-model="state.formData.rules_.showReward" :min="0.01" :max="provideData.inputNumberMax" :precision="2"
                        :controls="false" :placeholder="$t('请输入展示金额')" />
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
            <Tinymce v-model="state.formData.remark" v-model:isUploading="isUploading" :disabled="deployData.operationType === 2" :width="$locale == 'zh' ? 'auto' : '850px'">
            </Tinymce>
        </el-form-item>
        <el-form-item :label="$t('稽核平台:')">
            <el-radio-group :disabled="isDisabled" v-model="state.formData.auditVendor">
                <el-radio :value="1" :label="1">{{$t('全部平台')}}</el-radio>
                <el-radio :value="2" :label="2">{{$t('指定平台')}}</el-radio>
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
                        <el-checkbox v-for="(its,ims) in item.vendorName" :key="ims" :value="item.vendorList[ims]" :label="item.vendorList[ims]">
                            {{ its }}</el-checkbox>
                    </el-checkbox-group>
                </el-tab-pane>
            </el-tabs>
        </el-form-item>
    </el-form>
</template>

<script setup>
import { reactive, ref, onMounted, computed, defineExpose, inject } from "vue"
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
    channelList: {
        type: Array,
        default: () => [],
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
            type: 1,
            show: false,
            items: [
                {
                    code: '', total: undefined, type: 1, bonusType: 1, reward: undefined, min: undefined, max: undefined,
                    ticketType: 0, ticketId: '', recharge: undefined, playCoin: undefined, levels: []
                }
            ]
        },
        attachConfig: {
            tags: [],
        }
    },
    rules: {
        name: { required: true, message: $t('必填项不能为空！'), trigger: "blur" },
        auditMultiple: { required: true, message: $t('必选项不能为空！'), trigger: 'change' },
        beginTime: { required: true, message: $t('请选择活动开始时间！'), trigger: 'change' },
        endTime: { required: true, message: $t('请选择活动结束时间！'), trigger: 'change' },
        showBeginTime: { required: true, message: $t('请选择开始展示时间！'), trigger: 'change' },
        showEndTime: { required: true, message: $t('请选择结束展示时间！'), trigger: 'change' },
        image: { required: true, message: $t('宣传图不能为空！'), trigger: 'change' },
        remark: { required: true, message: $t('必填项不能为空！'), trigger: "blur" },
        levelList: { required: true, message: $t('必选项不能为空！'), trigger: 'change' },
        bonusType: { required: true, message: $t('请选择奖励类型！'), trigger: "change" },
        'rules_.total': { required: true, message: $t('请输入兑换码数量！'), trigger: "blur" },
        'rules_.timeout': { required: true, message: $t('请设置有效期截止时间！'), trigger: "change" },
        'rules_.reward': { required: true, message: $t('请输入赠送金额！'), trigger: "blur" },
        'rules_.min': { required: true, message: $t('请输入金额！'), trigger: "blur" },
        'rules_.max': { required: true, message: $t('请输入金额！'), trigger: "blur" },
    },
    currentIndex: ''
})
const formRef = ref(null)
const provideData = inject('provideData')

const checkedVipData = computed(() => {
    let arr = []
    state.formData.rules_.items.forEach(item => {
        if (item.levels && item.levels.length) {
            arr.push(...item.levels)
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
    }
    state.formData.rules_.items.forEach(item => {
        item.type = item.channelIds ? 2 : 1
        if (item.topAgentIds) item.agentIds = item.topAgentIds.join(',')
        item.timeout && (item.timeout = dateFormat(item.timeout))
        if (!item.ticketId || !item.ticketName) {
            item.ticketType = 0
            item.ticketId = ''
        }
    })
    if (props.deployData.attachConfig) {
        state.formData.attachConfig = JSON.parse(props.deployData.attachConfig)
    }
})

const disabledOption = (index, value) => {
    let { levels = [] } = state.formData.rules_.items[index]
    return !levels.includes(value) && checkedVipData.value.includes(value)
}

const inputBlur = (index) => {
    let { min, max } = state.formData.rules_.items[index]
    if (typeof min !== 'number' || typeof max !== 'number') return
    if (max < min) {
        state.formData.rules_.items[index].max = min + 0.01
    }
}

// 打开概率设置弹窗
const handleProbabilityConfig = (index) => {
    let { max, min, limitOdds = [] } = state.formData.rules_.items[index]
    if (typeof max !== 'number' || typeof min !== 'number') return ElMessage.warning($t('请配置完奖励金额再进行操作！'))
    if (max <= 0.01) return ElMessage.warning($t('奖励金额必须大于0.01才能配置概率！'))
    state.currentIndex = index
    provideData.probabilityDeployShow({
        rewardMinAmount: min,
        rewardMaxAmount: max,
        limitOdds,
    })
}

// 设置奖励概率数据
const setProbability = (val) => {
    if (!val.length) return delete state.formData.rules_.items[state.currentIndex].limitOdds
    state.formData.rules_.items[state.currentIndex].limitOdds = val
}

// 删除等级
const handleDel = (index) => {
    state.formData.rules_.items.splice(index, 1)
}

// 添加一级
const handleAdd = (index) => {
    state.formData.rules_.items.splice(index + 1, 0,
        {
            code: '', total: undefined, type: 1, bonusType: 1, reward: undefined, min: undefined, max: undefined,
            ticketType: 0, ticketId: '', recharge: undefined, playCoin: undefined, levels: []

        })
}

const formValidate = () => {
    formRef.value.validate((valid) => {
        if (valid) {
            if (checkImageUploading(isUploading.value)) return
            let params = deepClone(state.formData)
            params.endTime = params.endTime.replace('00:00:00', '23:59:59')
            params.showBeginTime = params.beginTime
            params.showEndTime = params.endTime
            let { rules_ } = params
            let failType = 0
            let failIndex
            for (let index = 0; index < rules_.items.length; index++) {
                let obj = { ...rules_.items[index] }
                if (obj.bonusType === 2 && obj.limitOdds && obj.limitOdds.length) {
                    if (obj.limitOdds.some(its => its.limit < obj.min || its.limit > obj.max)) {
                        failType = 1
                        failIndex = index
                        break
                    }
                    rules_.items[index].limitOdds[obj.limitOdds.length - 1].limit = rules_.items[index].max
                }
                if (obj.bonusType !== 2 || (obj.limitOdds && !obj.limitOdds.length)) {
                    delete rules_.items[index].limitOdds
                }
            }
            if (failType) return ElMessage.warning(`${$t('奖励配置第')}${failIndex + 1}${$t('行奖励金额改变，请重新配置相关概率！')}`)
            params.rules_.items.forEach(item => {
                delete item.topAgentIds
                if (item.type === 1) {
                    delete item.channelIds
                    if (item.agentIds) item.topAgentIds = item.agentIds.split(',')
                } else {
                    if ((item.channelIds && !item.channelIds.length) || !item.channelIds) delete item.channelIds
                }
                if (!item.ticketId) {
                    delete item.ticketType
                    delete item.ticketId
                    delete item.ticketName
                }
                item.agent = item.channelIds || item.topAgentIds ? true : false
                item.levels.sort((a, b) => a - b)
                delete item.agentIds
            })
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
.redeem-code-deploy {
    .el-date-editor {
        width: 200px;
    }
    .items-row {
        .el-form-item__content {
            display: flex;
            .el-form-item {
                width: 110px;
            }
            .el-form-item__error {
                display: none;
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
