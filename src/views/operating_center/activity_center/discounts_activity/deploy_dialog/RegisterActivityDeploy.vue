<template>
    <!-- 运营中心-优惠活动列表-活动配置弹窗-注册活动 -->
    <el-form :model="state.formData" ref="formRef" :rules="state.rules" :disabled="deployData.operationType === 2" class="activity-deploy bet-deploy"
        :label-width="$locale == 'zh' ? '110px' : 'auto'">
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
        <el-form-item :label="$t('标签:')" v-if="provideData.showTagCheck()">
            <el-checkbox-group v-model="state.formData.attachConfig.tags">
                <el-checkbox v-for="item in provideData.tagList()" :key="item.value" :value="item.value" :label="item.value">{{ item.label }}
                </el-checkbox>
            </el-checkbox-group>
        </el-form-item>
        <el-form-item :label="$t('活动目标:')" prop="rules_.tasks">
            <el-checkbox-group v-model="state.formData.rules_.tasks">
                <el-checkbox v-for="item in provideData.metaData.registerTaskType" :key="item.value" :value="+item.value" :label="+item.value">
                    {{ item.label }}
                </el-checkbox>
            </el-checkbox-group>
        </el-form-item>
        <el-form-item :label="$t('人工审核:')">
            <el-checkbox v-model="state.formData.rules_.review">{{$t('勾选后会员领奖时，将进入人工审核')}}
            </el-checkbox>
        </el-form-item>
        <el-form-item :label="$t('首页弹窗提示:')">
            <el-checkbox v-model="state.formData.rules_.popup">{{$t('已开启')}}
            </el-checkbox>
        </el-form-item>
        <el-form-item :label="$t('奖励设置:')" class="gLevels-box">
            <div class="gLevels-small">
                <div class="gLevels-small-deploy">
                    <span>{{$t('奖励金额')}}</span>
                    <el-form-item :prop="'rules_.reward'" label-width="0">
                        <el-input-number :disabled="isDisabled" v-model="state.formData.rules_.reward" :controls="false" :precision="2" :min="0"
                            :max="999999999999999" :placeholder="$t('奖励金额')" />
                    </el-form-item>
                    <div class="gLevels-small-deploy-ticket">
                        <span class="label">{{ $locale !== 'zh' ? $t('奖励票券') : $t('，奖励票券')}}</span>
                        <el-select style="width: 120px" :disabled="isDisabled" v-model="state.formData.rules_.ticketType" :placeholder="$t('票券类型')"
                            @change="state.formData.rules_.ticketId = ''">
                            <el-option v-for="ims in provideData.metaData.ticketType" :key="ims.value" :label="ims.label" :value="+ims.value" />
                        </el-select>
                        <el-select style="width: 180px" :disabled="isDisabled" filterable clearable v-model="state.formData.rules_.ticketId"
                            :placeholder="$t('请选择票券')">
                            <el-option :disabled="ims.isDisabled" v-for="ims in provideData.getOptionData(state.formData.rules_)" :key="ims.id"
                                :label="ims.name" :value="ims.id">
                            </el-option>
                        </el-select>
                    </div>
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
            <Tinymce v-model="state.formData.remark" v-model:isUploading="isUploading" :disabled="deployData.operationType === 2" :width="$locale == 'zh' ? 'auto' : '850px'">
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
        <template v-if="provideData.isCustomize()">
            <div class="deploy-title">{{$t('前端说明')}}</div>
            <el-form-item :label="$t('顶部标题:')">
                <el-input style="width: 100%" v-model="state.formData.attachConfig.title" :placeholder="$t('请输入标题内容')" />
            </el-form-item>
            <el-form-item :label="$t('底部说明:')">
                <Tinymce v-model="state.formData.attachConfig.desc" v-model:isUploading="isUploading" :disabled="deployData.operationType === 2"
                    :width="$locale == 'zh' ? 'auto' : '850'">
                </Tinymce>
            </el-form-item>
        </template>
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
        auditVendor: 1,
        rules_: {
            ticketType: 0,
            ticketId: '',
            popup: false,

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
        image: [{ required: true, message: $t('宣传图不能为空！'), trigger: 'change' }],
        remark: [{ required: true, message: $t('必填项不能为空！'), trigger: "blur" }],
        'rules_.tasks': [{ required: true, message: $t('必选项不能为空！'), trigger: "change" }],
        'rules_.reward': [{ required: true, message: $t('必填项不能为空！'), trigger: "blur" }],
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
        if (!state.formData.rules_.ticketId || !state.formData.rules_.ticketName) {
            state.formData.rules_.ticketType = 0
            state.formData.rules_.ticketId = ''
        }
        if (provideData.isCustomize() && props.deployData.attachConfig) {
            state.formData.attachConfig = JSON.parse(props.deployData.attachConfig)
        }
    }
})

// 表单校验
const formValidate = () => {
    formRef.value.validate((valid) => {
        if (valid) {
            if (checkImageUploading(isUploading.value)) return
            let params = deepClone(state.formData)
            params.showBeginTime = params.beginTime
            params.showEndTime = params.endTime
            if (!params.rules_.ticketId) {
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

defineExpose({ valid: formValidate })
</script>

<style lang="scss">
@import '../styles/index.scss';
.bet-deploy {
    .gLevels-small-deploy-special {
        width: 580px;
    }
    .deploy-title {
        font-weight: 700;
        font-size: 16px;
        color: #000;
        margin-bottom: 10px;
    }
}
</style>
