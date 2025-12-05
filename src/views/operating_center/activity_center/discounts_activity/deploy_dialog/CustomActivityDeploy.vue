<template>
    <!-- 运营中心-优惠活动列表-活动配置弹窗-自定义活动 -->
    <el-form :model="state.formData" ref="formRef" :rules="state.rules" :disabled="deployData.operationType === 2"
        class="activity-deploy custom-deploy" :label-width="$locale == 'zh' ? '115px' : 'auto'">
        <el-form-item :label="$t('活动名称:')" prop="name">
            <el-input style="width: 100%" v-model="state.formData.name" :placeholder="$t('请输入活动名称')" />
        </el-form-item>
        <el-form-item :label="$t('活动排序:')">
            <el-input-number v-model="state.formData.sort" style="width: 200px" :controls="false" :precision="0" :min="0"
                :placeholder="$t('填0或者不填默认排最前面')" />
        </el-form-item>
        <!-- <el-row>
                    <el-col :span="12" >
                        <el-form-item :label="$t('活动排序:')">
                            <el-input-number v-model="state.formData.sort" style="width: 200px" :controls="false" :precision="0"
                                :min="0" :placeholder="$t('填0或者不填默认排最前面')" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12" >
                        <el-form-item :label-width="$locale == 'zh' ? '98px' : 'auto'" :label="$t('循环方式:')" prop="cycleMode">
                            <el-select v-model="state.formData.cycleMode" style="width: 200px" :placeholder="$t('请选择循环方式')">
                                <el-option v-for="item in provideData.metaData.cycleMode" :key="item.value" :label="item.label"
                                    :value="item.value * 1">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item :label="$t('稽核倍数:')" prop="auditMultiple">
                    <el-input-number style="width: 200px" v-model="state.formData.auditMultiple" :min="0" :precision="2"
                        :controls="false" :placeholder="$t('请输入稽核倍数')" />
                </el-form-item> -->
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
        <el-form-item :label="$t('展示方式:')" prop="rules_.type" v-if="!provideData.isCustomize()">
            <el-radio-group v-model="state.formData.rules_.type" @change="state.formData.remark = '',state.formData.rules_.applyFor = false">
                <el-radio :label="0">{{$t('活动方式')}}</el-radio>
                <el-radio :label="1">{{$t('外部跳转')}}</el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item v-if="state.formData.rules_.type === 1" :label="$t('跳转地址:')" prop="remark">
            <el-input style="width: 100%" v-model="state.formData.remark" :placeholder="$t('请输入跳转地址')" />
        </el-form-item>
        <template v-if="state.formData.rules_.type === 0">
            <el-form-item :label="$t('优惠申请:')" v-if="!provideData.isCustomize()">
                <el-switch v-model="state.formData.rules_.applyFor" />
            </el-form-item>
            <template v-if="state.formData.rules_.applyFor">
                <el-row>
                    <el-col :span="13">
                        <el-form-item :label="$t('申请次数条件:')" prop="rules_.condType">
                            <el-select v-model="state.formData.rules_.condType" style="width: 200px" :placeholder="$t('请选择申请次数条件')">
                                <el-option v-for="item in provideData.metaData.redEnvelopeCondType" :key="item.value" :label="item.label"
                                    :value="Number(item.value)"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="11">
                        <el-form-item :label-width="$locale == 'zh' ? '120px' : 'auto'" :label="$t('每日申请次数:')" prop="rules_.dailyNum"
                            :rules="[{ required: true, message: $t('请输入每日申请次数上限！'), trigger: 'blur' }]">
                            <el-input-number v-model="state.formData.rules_.dailyNum" style="width: 200px" :controls="false" :precision="0" :min="1"
                                :placeholder="$t('请输入每日申请次数上限')" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item v-if="[1,2].includes(state.formData.rules_.condType)" class="gLevels-box" :label="$t('申请次数:')">
                    <div v-for="(item, index) in state.formData.rules_.tiers" :key="item" class="gLevels-small">
                        <span>{{state.formData.rules_.condType === 2 ? $t('当日打码金额满') : $t('当日充值金额满')}}</span>
                        <el-form-item :prop="'rules_.tiers.' + index + '.amount'"
                            :rules="[{ required: true, message: $t('请输入金额！'), trigger: 'blur' }]" label-width="0">
                            <el-input-number class="special-input" v-model="item.amount" :controls="false" :precision="2" :min="0.01"
                                :max="999999999999999" :placeholder="$t('输入金额')" />
                        </el-form-item>
                        <span>{{$t('，奖励申请次数')}}</span>
                        <el-form-item :prop="'rules_.tiers.' + index + '.count'"
                            :rules="[{ required: true, message: $t('请输入申请次数！'), trigger: 'blur' }]" label-width="0">
                            <el-input-number class="special-input" v-model="item.count" :controls="false" :precision="0" :min="1"
                                :placeholder="$t('申请次数')" />
                        </el-form-item>
                        <div class="operate">
                            <el-button v-throttle type="primary" @click="handleAdd(index,'tiers')" :icon="Plus">
                            </el-button>
                            <el-button v-throttle v-if="state.formData.rules_.tiers.length > 1" type="danger" @click="handleDel(index,'tiers')"
                                :icon="Minus">
                            </el-button>
                        </div>
                    </div>
                </el-form-item>
                <!-- <el-form-item v-if="state.formData.rules_.condType === 2" :label="$t('申请次数类型:')" prop="rules_.fixed">
                        <el-radio-group v-model="state.formData.rules_.fixed">
                            <el-radio :label="true">{{$t('固定')}}</el-radio>
                            <el-radio :label="false">{{$t('按打码')}}</el-radio>
                        </el-radio-group>
                    </el-form-item> -->
                <!-- <template v-if="state.formData.rules_.condType === 2 && state.formData.rules_.fixed">
                        <el-form-item label=" " class="items-row">
                            <span>{{$t('当前游戏打码达')}}</span>
                            <el-form-item prop="rules_.condAmount" label-width="0">
                                <el-input-number class="special-input" v-model="state.formData.rules_.condAmount"
                                    :controls="false" :precision="2" :min="0.01" :placeholder="$t('打码金额')"/>
                            </el-form-item>
                            <span>{{$t('，可申请')}}</span>
                            <el-form-item prop="rules_.count" label-width="0">
                                <el-input-number class="special-input" v-model="state.formData.rules_.count" :controls="false"
                                    :precision="0" :min="1" :placeholder="$t('申请次数')"/>{{$t('次')}}</el-form-item>
                        </el-form-item>
                        <el-form-item :label="$t('额外加赠:')">
                            <el-switch v-model="state.formData.rules_.subjoinStatus" />
                            <el-form-item class="items-row">
                                <el-form-item>
                                    <el-select v-model="state.formData.rules_.subjoinType" style="width: 80px" :placeholder="$t('周期')">
                                        <el-option :label="$t('每日')" :value="1" />
                                        <el-option :label="$t('每周')" :value="2" />
                                        <el-option :label="$t('每月')" :value="3" />
                                    </el-select>
                                </el-form-item>
                                <span style="margin-left: 5px">{{$t('打码每满')}}</span>
                                <el-form-item>
                                    <el-input-number class="special-input" v-model="state.formData.rules_.subjoinAmount"
                                        :controls="false" :precision="2" :min="0.01" :placeholder="$t('打码金额')"/>
                                </el-form-item>
                                <span>{{$t('，加赠')}}</span>
                                <el-form-item>
                                    <el-input-number class="special-input" v-model="state.formData.rules_.subjoincount"
                                        :controls="false" :precision="0" :min="0" :placeholder="$t('申请次数')"/>{{$t('次')}}</el-form-item>
                            </el-form-item>
                        </el-form-item>
                    </template>
                    <el-form-item v-if="state.formData.rules_.condType === 2 && state.formData.rules_.fixed === false"
                        class="gLevels-box" :label="$t('申请次数:')">
                        <div v-for="(item, index) in state.formData.rules_.tiers" :key="item" class="gLevels-small">
                            <span>{{$t('当日打码金额满')}}</span>
                            <el-form-item :prop="'rules_.tiers.' + index + '.amount'"
                                :rules="[{ required: true, message: $t('请输入金额！'), trigger: 'blur' }]" label-width="0">
                                <el-input-number class="special-input" v-model="item.amount" :controls="false" :precision="2"
                                    :min="0.01" :placeholder="$t('输入金额')" />
                            </el-form-item>
                            <span>{{$t('，奖励申请次数')}}</span>
                            <el-form-item :prop="'rules_.tiers.' + index + '.count'"
                                :rules="[{ required: true, message: $t('请输入申请次数！'), trigger: 'blur' }]" label-width="0">
                                <el-input-number class="special-input" v-model="item.count" :controls="false" :precision="0"
                                    :min="1" :placeholder="$t('申请次数')"/>
                            </el-form-item>
                            <div class="operate">
                                <el-button v-throttle type="primary" @click="handleAdd(index,'tiers')" :icon="Plus"></el-button>
                                <el-button v-throttle v-if="state.formData.rules_.tiers.length > 1" type="danger"
                                    @click="handleDel(index,'tiers')" :icon="Minus">
                                </el-button>
                            </div>
                        </div>
                    </el-form-item> -->
                <el-row>
                    <el-col :span="13">
                        <el-form-item :label="$t('扣除方式:')" prop="rules_.back">
                            <el-select v-model="state.formData.rules_.back" style="width: 200px" :placeholder="$t('请选择扣除方式')">
                                <el-option :label="$t('申请未通过，次数返回')" :value="true" />
                                <el-option :label="$t('申请未通过，次数扣除')" :value="false" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="11">
                        <el-form-item v-if="!state.formData.rules_.condType" :label-width="$locale == 'zh' ? '120px' : 'auto'" :label="$t('申请次数上限:')"
                            prop="rules_.limit">
                            <el-input-number v-model="state.formData.rules_.limit" style="width: 200px" :controls="false" :precision="0" :min="1"
                                :placeholder="$t('请输入申请次数上限')" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item class="gLevels-box" :label="$t('申请信息:')">
                    <div v-for="(item, index) in state.formData.rules_.issues" :key="index" class="gLevels-small">
                        <el-input style="width: 80%;margin-right: 5px" v-model="item.content" :placeholder="$t('请输入申请问题')" />
                        <div class="operate">
                            <el-button v-throttle type="primary" @click="handleAdd(index,'issues')" :icon="Plus">
                            </el-button>
                            <el-button v-throttle v-if="state.formData.rules_.issues.length > 1" type="danger" @click="handleDel(index,'issues')"
                                :icon="Minus">
                            </el-button>
                        </div>
                    </div>
                </el-form-item>
            </template>
        </template>
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
        <template v-if="state.formData.rules_.type === 0">
            <el-form-item :label="$t('内页样式:')" prop="rules_.pageStyle">
                <el-radio-group v-model="state.formData.rules_.pageStyle" @change="state.formData.remark = ''">
                    <el-radio :label="0" v-if="!isCustomizeTemplate">{{$t('图片')}}</el-radio>
                    <el-radio :label="1">{{$t('文本')}}</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item v-if="state.formData.rules_.pageStyle === 0" :label="$t('规则图片:')" prop="remark">
                <UploadImage v-model="state.formData.remark" :size="1536" :width="702" :disabled="deployData.operationType === 2"
                    :tip="$t('请上传702*N或等比例，PNG/JPG/GIF格式小于1536KB的图片')">
                </UploadImage>
            </el-form-item>
            <el-form-item v-if="state.formData.rules_.pageStyle === 1" :label="$t('背景颜色:')" prop="rules_.bgColor">
                <el-color-picker v-model="state.formData.styleConfig.bgColor" show-alpha />
            </el-form-item>
            <el-form-item v-if="state.formData.rules_.pageStyle === 1" :label="$t('规则说明:')" prop="content">
                <div class="rule-box">
                    <Tinymce v-model="state.formData.styleConfig.content" v-model:isUploading="isUploading" :width="$locale == 'zh' ? '700px' : '600px'"
                        :disabled="deployData.operationType === 2">
                    </Tinymce>
                    <div class="rule-box-preview" :style="{'backgroundColor': state.formData.styleConfig.bgColor || ''}"
                        v-html="state.formData.styleConfig.content">
                    </div>
                </div>
            </el-form-item>
        </template>
        <!-- <el-form-item v-if="state.formData.rules_.type === 0" :label="$t('规则说明:')" prop="remark">
            <Tinymce v-model="state.formData.remark" :disabled="deployData.operationType === 2">
            </Tinymce>
        </el-form-item> -->
        <el-form-item :label="$t('会员等级:')" prop="levelList">
            <el-checkbox v-model="state.formData.isCheckedAllLevel" :indeterminate="state.formData.isIndeterminateLevel"
                @change="(val) => checkChange(val,'levelList',1)">{{$t('全部等级')}}</el-checkbox>
            <el-checkbox-group v-model="state.formData.levelList" @change="(val) => checkChange(val,'isCheckedAllLevel',0)">
                <el-checkbox v-for="item in provideData.metaData.userLevel" :key="item" :label="item.value">{{ item.label }}
                </el-checkbox>
            </el-checkbox-group>
        </el-form-item>
    </el-form>
</template>

<script setup>
import { reactive, ref, onMounted, defineExpose, inject, computed } from "vue"
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
        rules_: {
            type: 0,
            pageStyle: 0,
            applyFor: false,
            fixed: false,
            issues: [{ content: '' }],
            tiers: [
                { amount: undefined, count: undefined }
            ],
        },
        styleConfig: {
            bgColor: '',
            content: ''
        },
        attachConfig: {
            tags: [],
        }
    },
    rules: {
        name: [{ required: true, message: $t('必填项不能为空！'), trigger: "blur" }],
        cycleMode: [{ required: true, message: $t('必选项不能为空！'), trigger: 'change' }],
        auditMultiple: [{ required: true, message: $t('必选项不能为空！'), trigger: 'change' }],
        beginTime: [{ required: true, message: $t('请选择活动开始时间！'), trigger: 'change' }],
        endTime: [{ required: true, message: $t('请选择活动结束时间！'), trigger: 'change' }],
        showBeginTime: [{ required: true, message: $t('请选择开始展示时间！'), trigger: 'change' }],
        showEndTime: [{ required: true, message: $t('请选择结束展示时间！'), trigger: 'change' }],
        image: [{ required: true, message: $t('宣传图不能为空！'), trigger: 'change' }],
        remark: [{ required: true, message: $t('必填项不能为空！'), trigger: "change" }],
        levelList: [{ required: true, message: $t('必选项不能为空！'), trigger: 'change' }],
        'rules_.type': [{ required: true, message: $t('请选择展示方式！'), trigger: "change" }],
        'rules_.condType': [{ required: true, message: $t('请选择申请次数条件！'), trigger: "change" }],
        'rules_.limit': [{ required: true, message: $t('请输入申请次数上限！'), trigger: "blur" }],
        'rules_.back': [{ required: true, message: $t('请选择扣除方式！'), trigger: "change" }],
        'rules_.condAmount': [{ required: true, message: $t('请输入打码金额！'), trigger: "blur" }],
        'rules_.count': [{ required: true, message: $t('请输入申请次数！'), trigger: "blur" }],
        'rules_.pageStyle': [{ required: true, message: $t('请选择页内样式！'), trigger: "change" }],
        'styleConfig.bgColor': [{ required: true, message: $t('请选择背景颜色！'), trigger: "change" }],
        'styleConfig.content': [{ required: true, message: $t('请输入规则说明！'), trigger: "blur" }],
    },
})
const formRef = ref(null)
const provideData = inject('provideData')
const isPPTemplate = computed(() => {
    return userData.getTemplateType() === 5
})
const isCustomizeTemplate = computed(() => {
    return userData.temporaryTemplate?.templateType === 4
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
        let { rules_, remark } = state.formData
        if (!rules_.tiers) {
            state.formData.rules_.tiers = [{ amount: undefined, count: undefined }]
        } else {
            let arr = []
            for (let key in rules_.tiers) {
                arr.push({
                    amount: Number(key),
                    count: Number(rules_.tiers[key]),
                })
            }
            rules_.tiers = arr
        }
        if (!rules_.type && rules_.condType > 0 && rules_.fixed) {
            rules_.tiers = [{
                amount: Number(rules_.condAmount),
                count: Number(rules_.count),
            }]
        }
        if (rules_.pageStyle === 1) {
            let obj = JSON.parse(remark)
            state.formData.styleConfig.bgColor = obj.bgColor
            state.formData.styleConfig.content = obj.content
        }
        if (!rules_.pageStyle && remark.indexOf('http') !== 0) {
            state.formData.rules_.pageStyle = 1
            state.formData.styleConfig.content = remark
        }
        state.formData.rules_.issues = rules_.issues && rules_.issues.length ? rules_.issues.map(item => {
            return { content: item }
        }) : [{ content: '' }]
        if (provideData.isCustomize() && props.deployData.attachConfig) {
            state.formData.attachConfig = JSON.parse(props.deployData.attachConfig)
        }
    }
    if (isCustomizeTemplate.value) {
        state.formData.rules_.pageStyle = 1
    }
})

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

//删除等级
const handleDel = (index, key) => {
    state.formData.rules_[key].splice(index, 1)
}

//添加一级
const handleAdd = (index, key) => {
    let obj = {
        content: ''
    }
    if (key === 'tiers') {
        obj = {
            amount: undefined,
            count: undefined,
        }
    }
    state.formData.rules_[key].splice(index + 1, 0, obj)
}

const formValidate = () => {
    formRef.value.validate((valid) => {
        if (valid) {
            if (checkImageUploading(isUploading.value)) return
            let params = deepClone(state.formData)
            let { rules_, styleConfig } = params
            if (rules_.type === 1) {
                delete rules_.issues
                delete rules_.tiers
                delete rules_.pageStyle
                delete rules_.applyFor
            } else {
                let arr = rules_.issues.filter(item => item.content)
                rules_.issues = arr.map(item => item.content)
                if (!arr.length) {
                    if (rules_.applyFor) {
                        return ElMessage.warning($t('请至少设置一个问题！'))
                    } else {
                        delete rules_.issues
                    }
                }
                if (rules_.condType > 0) {
                    if (rules_.tiers.length === 1) {
                        rules_.condAmount = rules_.tiers[0].amount
                        rules_.count = rules_.tiers[0].count
                        rules_.fixed = true
                        delete rules_.tiers
                    } else {
                        rules_.fixed = false
                        let isRepetition = false
                        rules_.tiers.forEach((item, index) => {
                            if (rules_.tiers.some((ims, ins) => ims.amount === item.amount && index !== ins)) {
                                isRepetition = true
                            }
                        })
                        if (isRepetition) return ElMessage.warning($t('申请次数阶梯配置金额存在重复，请修改后再提交！'))
                        let obj = {}
                        rules_.tiers.forEach(item => {
                            obj[item.amount] = item.count
                        })
                        rules_.tiers = obj
                    }
                } else {
                    delete rules_.tiers
                }
            }
            if (rules_.pageStyle === 1) {
                params.remark = JSON.stringify(styleConfig)
                delete params.styleConfig
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

defineExpose({ valid: formValidate })
</script>

<style lang="scss">
@import '../styles/index.scss';
.custom-deploy {
    .items-row {
        .el-form-item__content {
            display: flex;
            .el-form-item {
                width: fit-content;
            }
        }
    }

    .special-input {
        width: 135px;
        margin: 0 5px;
    }

    .rule-box {
        display: flex;
        justify-content: space-between;
        &-preview {
            width: 290px;
            height: 500px;
            border: 1px solid #ccc;
            border-radius: 4px;
            vertical-align: top;
            overflow: auto;
        }
    }
}
</style>
