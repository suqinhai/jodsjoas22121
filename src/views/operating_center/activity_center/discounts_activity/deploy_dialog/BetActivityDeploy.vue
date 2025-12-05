<template>
    <!-- 运营中心-优惠活动列表-活动配置弹窗-打码活动 -->
    <el-form :model="state.formData" ref="formRef" :rules="state.rules" :disabled="deployData.operationType === 2" class="activity-deploy bet-deploy"
        :label-width="$locale == 'zh' ? '90px' : 'auto'">
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
                <el-form-item :label-width="$locale == 'zh' ? '98px' : 'auto'" :label="$t('循环方式:')" prop="cycleMode">
                    <el-select :disabled="isDisabled" v-model="state.formData.cycleMode" style="width: 200px" :placeholder="$t('请选择循环方式')">
                        <el-option v-for="item in provideData.metaData.cycleMode" :key="item.value" :label="item.label" :value="item.value * 1">
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-col>
        </el-row>
        <el-form-item :label="$t('稽核倍数:')" prop="auditMultiple">
            <el-input-number style="width: 200px" v-model="state.formData.auditMultiple" :min="0" :precision="2" :controls="false"
                :placeholder="$t('请输入稽核倍数')" />
        </el-form-item>
        <el-form-item v-if="provideData.isCustomize() && state.formData.cycleMode === 1" :label-width="$locale == 'zh' ? '112px' : 'auto'"
            :label="$t('奖励过期时间:')" prop="attachConfig.expireTime">
            <div style="width: 100%">
                <el-radio-group v-model="state.formData.attachConfig.expireTime">
                    <el-radio :label="24"> {{ $t('24小时') }} </el-radio>
                    <el-radio :label="48"> {{ $t('48小时') }} </el-radio>
                    <el-radio :label="-1" style="margin-right: 5px">{{ $t('自定义') }}</el-radio>
                </el-radio-group>
                <template v-if="state.formData.attachConfig.expireTime === -1">
                    <el-input-number v-model="state.formData.attachConfig.cycleTime" style="width: 100px;margin-right: 3px" :controls="false"
                        :precision="0" :min="1" :max="1000" :placeholder="$t('过期时间')" />
                    {{$t('小时')}}
                </template>
            </div>
            <div style="color: red">{{$t('注：可设置时间，需为活动结束时间内。')}}</div>
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
        <el-form-item :label="$t('标签:')" v-if="provideData.showTagCheck()">
            <el-checkbox-group v-model="state.formData.attachConfig.tags">
                <el-checkbox v-for="item in provideData.tagList()" :key="item" :value="item.value" :label="item.value">{{ item.label }}
                </el-checkbox>
            </el-checkbox-group>
        </el-form-item>
        <!-- <el-form-item :label="$t('展示时间:')" prop="promotionShow">
                <div>
                    <el-date-picker v-model="state.formData.promotionShow" type="datetimerange" value-format="YYYY-MM-DD HH:mm:ss"
                        :disabled-date="(time) => emits('disabledDate',time)" :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')" :shortcuts="shortcuts"
                        :default-time="defaultTime">
                    </el-date-picker>
                </div>
            </el-form-item> -->

        <el-form-item :label="$t('奖励设置:')" class="gLevels-box">
            <div v-for="(item, index) in state.formData.rules_" :key="item" class="gLevels-small">
                <div class="gLevels-small-deploy"
                    :class="{'gLevels-small-deploy-special': $locale !== 'zh','gLevels-small-deploy-other': $locale !== 'zh'}">
                    <span>{{$t('有效投注金额满')}}</span>
                    <el-form-item :prop="'rules_.' + index + '.reachAmount'" :rules="[{ required: true, message: $t('请输入有效投注金额！'), trigger: 'blur' }]"
                        label-width="0">
                        <el-input-number :disabled="isDisabled" v-model="item.reachAmount" :controls="false" :precision="2" :min="0.01"
                            :max="999999999999999" :placeholder="$t('有效投注金额')" />
                    </el-form-item>
                    <span>{{$t('，奖励金额')}}</span>
                    <el-form-item :prop="'rules_.' + index + '.rewardAmount'" :rules="[{ required: true, message: $t('请输入奖励金额！'), trigger: 'blur' }]"
                        label-width="0">
                        <el-input-number :disabled="isDisabled" v-model="item.rewardAmount" :controls="false" :precision="2" :min="0"
                            :max="999999999999999" :placeholder="$t('奖励金额')" />
                    </el-form-item>
                    <div class="gLevels-small-deploy-ticket">
                        <span class="label">{{ $locale !== 'zh' ? $t('奖励票券') : $t('，奖励票券')}}</span>
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
                    <el-button :disabled="isDisabled" v-throttle type="primary" @click="handleAdd(index)" :icon="Plus">
                    </el-button>
                    <el-button :disabled="isDisabled" v-throttle v-if="state.formData.rules_.length > 1" type="danger" @click="handleDel(index)"
                        :icon="Minus">
                    </el-button>
                </div>
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
            <Tinymce v-model="state.formData.remark" v-model:isUploading="isUploading" :disabled="deployData.operationType === 2" :width="$locale == 'zh' ? 'auto' : '750px'">
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
        vendor: 1,
        auditVendor: 1,
        rules_: [
            { reachAmount: undefined, rewardAmount: undefined, ticketType: 0, ticketId: '' },
        ],
        attachConfig: {
            tags: [],
        }
    },
    rules: {
        name: { required: true, message: $t('必填项不能为空！'), trigger: "blur" },
        cycleMode: { required: true, message: $t('必选项不能为空！'), trigger: 'change' },
        auditMultiple: { required: true, message: $t('必选项不能为空！'), trigger: 'change' },
        beginTime: { required: true, message: $t('请选择活动开始时间！'), trigger: 'change' },
        endTime: { required: true, message: $t('请选择活动结束时间！'), trigger: 'change' },
        showBeginTime: { required: true, message: $t('请选择开始展示时间！'), trigger: 'change' },
        showEndTime: { required: true, message: $t('请选择结束展示时间！'), trigger: 'change' },
        image: { required: true, message: $t('宣传图不能为空！'), trigger: 'change' },
        remark: { required: true, message: $t('必填项不能为空！'), trigger: "blur" },
        levelList: { required: true, message: $t('必选项不能为空！'), trigger: 'change' },
        'attachConfig.expireTime': { required: true, message: $t('必选项不能为空'), trigger: "change" },
    },
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
        state.formData.rules_.forEach(item => {
            if (!item.ticketId || !item.ticketName) {
                item.ticketType = 0
                item.ticketId = ''
            }
        })
        if (provideData.isCustomize()) {
            if (props.deployData.attachConfig) state.formData.attachConfig = JSON.parse(props.deployData.attachConfig)
            if (state.formData.attachConfig.expireTime && ![24, 48].includes(state.formData.attachConfig.expireTime)) {
                state.formData.attachConfig.cycleTime = state.formData.attachConfig.expireTime
                state.formData.attachConfig.expireTime = -1

            }
        }
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
const handleDel = (index) => {
    state.formData.rules_.splice(index, 1)
}

//添加一级
const handleAdd = (index) => {
    state.formData.rules_.splice(index + 1, 0, {
        reachAmount: undefined,
        rewardAmount: undefined,
        ticketType: 0,
        ticketId: '',
    })
}

// 表单校验
const formValidate = () => {
    formRef.value.validate((valid) => {
        if (valid) {
            if (checkImageUploading(isUploading.value)) return
            let params = deepClone(state.formData)
            params.rules_.forEach(item => {
                if (!item.ticketId) {
                    delete item.ticketType
                    delete item.ticketId
                    delete item.ticketName
                }
            })
            if (!provideData.isCustomize()) {
                delete params.attachConfig
            } else {
                if (params.cycleMode === 1) {
                    if (params.attachConfig.expireTime === -1) {
                        if (!params.attachConfig.cycleTime) return ElMessage.warning($t('请设置自定义奖励过期时间后再进行提交！'))
                        params.attachConfig.expireTime = params.attachConfig.cycleTime
                    }
                } else {
                    delete params.attachConfig.expireTime
                }
                delete params.attachConfig.cycleTime
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
.bet-deploy {
    .gLevels-small-deploy-special {
        width: 580px;
    }
}
</style>
