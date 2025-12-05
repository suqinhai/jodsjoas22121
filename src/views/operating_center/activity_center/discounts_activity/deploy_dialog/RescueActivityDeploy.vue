<template>
    <!-- 运营中心-优惠活动列表-活动配置弹窗-救援金活动 -->
    <el-form :model="state.formData" ref="formRef" :rules="state.rules" :disabled="deployData.operationType === 2"
        class="activity-deploy rescue-deploy" :label-width="$locale == 'zh' ? '90px' : 'auto'">
        <el-form-item :label="$t('活动名称:')" prop="name">
            <el-input style="width: 100%" v-model="state.formData.name" :placeholder="$t('请输入活动名称')" />
        </el-form-item>
        <el-row>
            <el-col :span="14">
                <el-form-item :label="$t('活动排序:')">
                    <el-input-number v-model="state.formData.sort" style="width: 200px" :controls="false" :precision="0" :min="0"
                        :placeholder="$t('填0或者不填默认排最前面')" />
                </el-form-item>
            </el-col>
            <el-col :span="10">
                <el-form-item :label-width="$locale == 'zh' ? '98px' : 'auto'" :label="$t('稽核倍数:')" prop="auditMultiple">
                    <el-input-number style="width: 200px" v-model="state.formData.auditMultiple" :min="0" :precision="2" :controls="false"
                        :placeholder="$t('请输入稽核倍数')" />
                </el-form-item>
            </el-col>
        </el-row>

        <el-form-item :label="$t('活动时间:')" class="time-box">
            <el-form-item prop="beginTime" label-width="0">
                <el-date-picker :disabled="isDisabled" v-model="state.formData.beginTime" :type="!provideData.isCustomize() ? 'datetime' : 'date'"
                    value-format="YYYY-MM-DD HH:mm:ss" :disabled-date="(time) => disabledDate(time)" :placeholder="$t('开始时间')">
                </el-date-picker>
            </el-form-item>
            <span class="stance">{{$t('至')}}</span>
            <el-form-item prop="endTime" label-width="0">
                <el-date-picker v-model="state.formData.endTime" :type="!provideData.isCustomize() ? 'datetime' : 'date'"
                    value-format="YYYY-MM-DD HH:mm:ss" :disabled-date="(time) => disabledDate(time)" :placeholder="$t('结束时间')"
                    :default-time="new Date(2000, 0, 0, 23, 59, 59)">
                </el-date-picker>
            </el-form-item>
        </el-form-item>
        <template v-if="!provideData.isCustomize()">
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
                <el-form-item>
                    <el-checkbox v-model="state.formData.review" :disabled="isDisabled" :label="$t('人工审核（勾选后，奖励需要人工审核后发放）')" :true-label="1" :false-label="0"></el-checkbox>
                </el-form-item>
            </el-form-item>
            <!-- <el-form-item :label="$t('奖励周期:')" prop="awardCycle">
                <el-radio-group v-model="state.formData.awardCycle">
                    <el-radio :label="1">{{$t('每日奖励')}}</el-radio>
                </el-radio-group>
            </el-form-item> -->

            <el-form-item :label="$t('奖励类型:')" prop="bonusType">
                <el-radio-group v-model="state.formData.bonusType">
                    <el-radio :label="1">{{$t('固定金额')}}</el-radio>
                    <el-radio :label="3">{{$t('比例奖励')}}</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label=" " class="gLevels-box">
                <div v-for="(item, index) in state.formData.rules_" :key="item" class="gLevels-small">
                    <div class="gLevels-small-deploy"
                        :class="{'gLevels-small-deploy-special': $locale !== 'zh','gLevels-small-deploy-other': $locale !== 'zh'}">
                        <span>{{$t('今日充值≥')}}</span>
                        <el-form-item :prop="'rules_.' + index + '.recharge'" :rules="[{ required: true, message: $t('请输入金额！'), trigger: 'blur' }]"
                            label-width="0">
                            <el-input-number v-model="item.recharge" :controls=" false" :precision="2" :min="0" :max="999999999999999"
                                :placeholder="$t('输入金额')" />
                        </el-form-item>
                        <span>{{$t('，昨日负盈利≥')}}</span>
                        <el-form-item :prop="'rules_.' + index + '.amount'" :rules="[{ required: true, message: $t('请输入金额！'), trigger: 'blur' }]"
                            label-width="0">
                            <el-input-number v-model="item.amount" :controls=" false" :precision="2" :min="0.01" :max="999999999999999"
                                :placeholder="$t('输入金额')" />
                        </el-form-item>
                        <span>{{$t('，额外奖励')}}</span>
                        <el-form-item :prop="'rules_.' + index + '.ratio'" :rules="[{ required: true, message: $t('请输入额外奖励！'), trigger: 'blur' }]"
                            label-width="0">
                            <el-input-number v-model="item.ratio" :controls="false" :precision="2" :min="0" :max="999999999999999"
                                :placeholder="$t('额外奖励')" />
                        </el-form-item>
                        <span v-if="state.formData.bonusType === 3">%</span>
                        <div class="gLevels-small-deploy-ticket">
                            <span class="label">{{ $locale !== 'zh' ? $t('奖励票券') : $t('，奖励票券')}}</span>
                            <el-select style="width: 120px" v-model="item.ticketType" :placeholder="$t('票券类型')" @change="item.ticketId = ''">
                                <el-option v-for="ims in provideData.metaData.ticketType" :key="ims.value" :label="ims.label" :value="+ims.value" />
                            </el-select>
                            <el-select style="width: 180px" filterable clearable v-model="item.ticketId" :placeholder="$t('请选择票券')">
                                <el-option :disabled="ims.isDisabled" v-for="ims in provideData.getOptionData(item)" :key="ims.id" :label="ims.name"
                                    :value="ims.id">
                                </el-option>
                            </el-select>
                        </div>
                    </div>
                    <div class="operate">
                        <el-button v-throttle type="primary" @click="handleAdd(index)" :icon="Plus"></el-button>
                        <el-button v-throttle v-if="state.formData.rules_.length > 1" type="danger" @click="handleDel(index)" :icon="Minus">
                        </el-button>
                    </div>
                </div>
            </el-form-item>
        </template>
        <template v-if="provideData.isCustomize()">
            <el-form-item :label="$t('标签:')" v-if="provideData.showTagCheck()">
                <el-checkbox-group v-model="state.formData.attachConfig.tags">
                    <el-checkbox v-for="item in provideData.tagList()" :key="item" :value="item.value" :label="item.value">{{ item.label }}
                    </el-checkbox>
                </el-checkbox-group>
            </el-form-item>
            <el-form-item :label="$t('奖励配置:')">
                <div>{{$t('净亏损和奖励同时配置才会生效，配置不同游戏类型的亏损分开计算，不合并。')}}</div>
                <el-tabs type="border-card" v-model="state.currentType">
                    <el-tab-pane v-for="item in provideData.metaData.gameType" :key="item.value" :label="item.label" :name="+item.value">
                        <div class="rules-deploy" v-if="state.formData.rules_[state.currentType]">
                            <el-table style="width: 400px" :data="state.formData.rules_[state.currentType]" border>
                                <el-table-column :label="$t('净亏损')" align="center" min-width="200">
                                    <template #default="{ row }">
                                        <el-input-number :disabled="isDisabled" style="width: 100%" v-model="row.amount" :min="1" :max="999999999"
                                            :precision="0" :controls="false" :placeholder="$t('输入1-999999999')" />
                                    </template>
                                </el-table-column>
                                <el-table-column :label="$t('奖励')" align="center" min-width="200">
                                    <template #default="{ row }">
                                        <el-input-number :disabled="isDisabled" style="width: 100%" v-model="row.reward" :min="0.01" :max="999999999"
                                            :precision="2" :controls="false" :placeholder="$t('输入0.01-999999999')" />
                                    </template>
                                </el-table-column>
                            </el-table>
                            <div class="operate-box" v-if="!isDisabled">
                                <el-button v-throttle v-if="state.formData.rules_[state.currentType].length > 0" type="danger" @click="handleDel"
                                    :icon="Minus">
                                </el-button>
                                <el-button v-throttle v-if="state.formData.rules_[state.currentType].length < 100" type="primary" @click="handleAdd"
                                    :icon="Plus"></el-button>
                            </div>
                        </div>
                    </el-tab-pane>
                </el-tabs>
            </el-form-item>
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
        <el-form-item :label="$t('规则说明:')" prop="remark">
            <Tinymce v-model="state.formData.remark" v-model:isUploading="isUploading" :disabled="deployData.operationType === 2" :width="$locale == 'zh' ? 'auto' : '880px'">
            </Tinymce>
        </el-form-item>
        <el-form-item :label="$t('会员等级:')" prop="levelList" v-if="provideData.isCustomize()">
            <el-checkbox v-model="state.formData.isCheckedAllLevel" :indeterminate="state.formData.isIndeterminateLevel"
                @change="(val) => checkChange(val,'levelList',1)">{{$t('全部等级')}}</el-checkbox>
            <el-checkbox-group v-model="state.formData.levelList" @change="(val) => checkChange(val,'isCheckedAllLevel',0)">
                <el-checkbox v-for="item in provideData.metaData.userLevel" :key="item" :label="item.value">{{ item.label }}
                </el-checkbox>
            </el-checkbox-group>
        </el-form-item>
        <el-form-item :label="$t('游戏平台:')">
            <el-radio-group :disabled="isDisabled" v-model="state.formData.vendor">
                <el-radio :label="1">{{$t('全部平台')}}</el-radio>
                <el-radio :label="2">{{$t('指定平台')}}</el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item class="gameVendor_row" label=" " v-if="state.formData.vendor == 2">
            <el-tabs type="border-card">
                <el-tab-pane v-for="item in state.formData.playVendorList" :key="item.type"
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
import { reactive, ref, onMounted, inject, computed } from "vue"
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
        // awardCycle: 1,
        bonusType: 1,
        rules_: [],
        attachConfig: {
            tags: [],
        },
        review: 0,
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
    },
    currentType: 1,
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
    if (!provideData.isCustomize()) {
        if (props.deployData.id) {
            state.oldImage = props.deployData.image.split(',')
            if (isPPTemplate.value) {
                state.formData.image = state.oldImage[1]
            } else {
                state.formData.image = state.oldImage[0]
            }
            state.formData.rules_.forEach(item => {
                if (!item.ticketId || !item.ticketName) {
                    item.ticketType = 0
                    item.ticketId = ''
                }
            })
        } else {
            state.formData.rules_.push({ recharge: undefined, amount: undefined, ratio: undefined, ticketType: 0, ticketId: '' })
        }
    } else {
        if (props.deployData.id && props.deployData.attachConfig) {
            state.formData.attachConfig = JSON.parse(props.deployData.attachConfig)
        }
        if (!props.deployData.id || !Object.keys(state.formData.rules_).length) {
            state.formData.rules_ = {}
        }
        provideData.metaData.gameType.forEach(item => {
            if (!state.formData.rules_[item.value]) {
                state.formData.rules_[item.value] = [{
                    amount: undefined,
                    reward: undefined,
                }]
            }
        })
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

//  删除等级
const handleDel = (index) => {
    if (provideData.isCustomize()) {
        state.formData.rules_[state.currentType].splice(state.formData.rules_[state.currentType].length - 1, 1)
    } else {
        state.formData.rules_.splice(index, 1)
    }
}

//  添加一级
const handleAdd = (index) => {
    if (provideData.isCustomize()) {
        state.formData.rules_[state.currentType].push({
            amount: undefined,
            reward: undefined,
        })
    } else {
        state.formData.rules_.splice(index + 1, 0, {
            recharge: undefined,
            amount: undefined,
            ratio: undefined,
            ticketType: 0,
            ticketId: '',
        })
    }
}

const formValidate = () => {
    formRef.value.validate((valid, fields) => {
        if (valid) {
            if (checkImageUploading(isUploading.value)) return
            let params = deepClone(state.formData)
            if (provideData.isCustomize()) {
                params.showBeginTime = params.beginTime
                params.showEndTime = params.endTime
                let total = 0
                provideData.metaData.gameType.forEach(item => {
                    params.rules_[item.value] = params.rules_[item.value].filter(its => its.reward && its.amount)
                    total += params.rules_[item.value].length
                    if (!params.rules_[item.value].length) delete params.rules_[item.value]
                })
                if (!total) return ElMessage.warning($t('请至少配置一种游戏类型的完整奖励规则再进行提交！'))
            } else {
                params.rules_.forEach(item => {
                    if (!item.ticketId) {
                        delete item.ticketType
                        delete item.ticketId
                        delete item.ticketName
                    }
                })
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
.rescue-deploy {
    .el-date-editor {
        width: 200px;
    }
    .gLevels-box {
        .el-input-number {
            width: 100px !important;
        }
        .gLevels-small-deploy-special {
            width: 760px;
        }
    }
    .rules-deploy {
        display: flex;
        align-items: flex-end;

        .operate-box {
            margin-left: 15px;
        }
    }
}
</style>
