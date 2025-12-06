
<template>
    <!-- 活动中心-活动配置弹窗-新拼多多活动 -->
    <el-form :model="state.formData" ref="formRef" :rules="state.rules" :disabled="deployData.operationType === 2" class="activity-deploy pinduoduo-deploy" :label-width="$locale == 'zh' ? '105px' : 'auto'">
        <el-form-item :label="$t('活动名称:')" prop="name">
            <el-input style="width: 80%" v-model="state.formData.name" :placeholder="$t('请输入活动名称')" />
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
        <el-form-item :label="$t('领奖人工审核')">
            <el-checkbox v-model="state.formData.isReview" :label="$t('已开启')" :true-label="1" :false-label="0"></el-checkbox>
        </el-form-item>
        <el-form-item :label="$t('重置时间')" prop="resetDay">
            <el-input-number :disabled="isDisabled" style="width: 120px" v-model="state.formData.resetDay" :controls="false" :value="state.formData.resetDay || ''" /> {{$t('天，限制1-30天')}}
        </el-form-item>
        <el-form-item :label="$t('有效注册充值要求')"  prop="rechargeAmount" label-width="auto">
            <el-input-number v-model="state.formData.rechargeAmount" :controls="false" :max="99999"></el-input-number>
            <span>{{ $t('（限制0-99999，配置0则不限制充值额度）') }}</span>
        </el-form-item>
        <el-form-item required :label="$t('条件配置：（填写整数1-99999）')" style="margin-bottom:0;" label-width="auto"></el-form-item>
        <!-- <div style="color:var(--el-text-color-regular);font-weight: 600;">{{ $t('条件配置：（填写整数1-99999）') }}</div> -->
        <div class="item-row">
            <div class="label-w">
                <span>{{$t('有效注册人数')}}&nbsp;</span>
                <el-form-item label="" prop="rechargePeople"  label-width="0">
                    <el-input style="width: 120px" v-model="state.formData.rechargePeople" @input="(val) => state.formData.rechargePeople = val.replace(/\D/g,'')"></el-input>
                </el-form-item>
            </div>
            <div class="label-w">
                <span>&nbsp;{{$t('中奖金额范围')}}&nbsp;</span>
                <el-form-item label="" prop="minAmount" label-width="0">
                    <el-input-number style="width: 120px" :max="99999" :min="1" v-model="state.formData.minAmount"
                    :controls="false" />
                </el-form-item>
                -
                <el-form-item label="" prop="maxAmount" label-width="0">
                    <el-input-number style="width: 120px" :max="99999" :min="state.formData.minAmount" v-model="state.formData.maxAmount"
                    :controls="false" />
                </el-form-item>
            </div>
        </div>
        <el-row>
            <el-form-item label-width="0">
                <div>{{$t('前端转盘展示：（默认序号1中奖）')}}</div>
                <div>{{$t('请上传64*64规格或等比例，png、JPG图片，50kb以内。')}}</div>
            </el-form-item>
        </el-row>
        <el-row>
             <el-form-item label-width="0">
                <el-table :data="state.formData.icons" border style="width: 360px">
                    <el-table-column :label="$t('序号')" width="100" align="center">
                        <template #default="{ row, $index }">
                            {{$index + 1}}
                        </template>
                    </el-table-column>
                    <el-table-column  align="center">
                        <template #header>
                            <div>{{$t('图标')}}</div>
                            <div>(64*64)</div>
                        </template>
                        <template #default="{ row }">
                            <div class="upload-box">
                                <UploadImage v-model="row.icon" :size="50" :width="64" :height="64" isCustomPreview @previewImage="previewImage">
                                </UploadImage>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </el-form-item>
        </el-row>
        
        <el-form-item :label="$t('宣传图:')" prop="image" :label-width="$locale == 'zh' ? '105px' : '160px'">
            <UploadImage v-model="state.formData.image" :width="state.limit.width" :height="state.limit.height" :disabled="deployData.operationType === 2"
                    :size="state.limit.size"
                    :tip="`${$t('请上传')}${state.limit.width}*${state.limit.height}${$t('或等比例，PNG/JPG/GIF格式小于')}${state.limit.size}${$t('KB的图片')}`" />
        </el-form-item>
        <el-form-item :label="$t('规则说明:')" prop="remark" :label-width="$locale == 'zh' ? '105px' : '160px'">
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
            rechargeAmount:undefined,
            rechargePeople:undefined,
            minAmount: undefined,
            maxAmount: undefined,
            icons:[
                {icon: '/img/default/gold.png' },
                {icon: '/img/default/gold.png' },
                {icon: '/img/default/gold.png' },
                {icon: '/img/default/gold.png' },
                {icon: '/img/default/gold.png' },
                {icon: '/img/default/gold.png' },
                {icon: '/img/default/gold.png' },
                {icon: '/img/default/gold.png' }
            ]
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
            rechargeAmount: [{ required: true, message: $t('必填项不能为空！'), trigger: 'change' }],
            rechargePeople: [{ 
                validator: (rule, value, callback) => {
                    if (value < 1) {
                        callback(new Error($t('不能少于1')));
                    } else if (value > 99999) {
                        callback(new Error($t('不能大于99999')));
                    } else {
                        callback();
                    }
                }, 
                trigger: 'change' 
            }],
            minAmount: [{ required: true, message: $t('必填项不能为空！'), trigger: 'change' }],
            maxAmount: [{ 
                validator: (rule, value, callback) => {
                    if (value <= state.formData.minAmount) {
                        callback(new Error($t('最大值必须大于最小值')));
                    } else {
                        callback();
                    }
                }, 
                trigger: 'change' 
            }],
        },
        isValidate: false,
        currentIndex: '',
    })
    const formRef = ref(null)
    const provideData = inject('provideData')
    const emits = defineEmits(['updateContentEdit'])
    const isPPTemplate = computed(() => {
        return userData.getTemplateType() === 5
    })
    onMounted(() => {
        if(isPPTemplate.value) {
            state.limit.width = 656
            state.limit.height = 176
        }
        state.formData = Object.assign(state.formData, deepClone(props.deployData))
        const { resetDay, minAmount, maxAmount, rechargeAmount,rechargePeople,isReview,icons} = state.formData.rules_
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
            state.formData.minAmount = minAmount
            state.formData.maxAmount = maxAmount
            state.formData.rechargeAmount = rechargeAmount
            state.formData.rechargePeople = rechargePeople
            state.formData.isReview = (state.formData.isReview || isReview ? 1 : 0)
            let arr =  icons.split(',')
            state.formData.icons.forEach((item,index) => item.icon = arr[index])
        }
    })

    const formValidate = () => {
        state.isValidate = true
        if (state.formData.icons.find(item => !item.icon)) return ElMessage.warning($t('请上传奖励图标'))
        formRef.value.validate((valid, fields) => {
            if (valid) {
                if (checkImageUploading(isUploading.value)) return
                let params = deepClone(state.formData)
                // params.attachConfig = JSON.stringify(params.attachConfig)
                params.rules_ = {
                    resetDay: state.formData.resetDay,
                    minAmount: state.formData.minAmount,
                    maxAmount: state.formData.maxAmount,
                    rechargeAmount: state.formData.rechargeAmount,
                    rechargePeople: state.formData.rechargePeople,
                    isReview: state.formData.isReview || 0,
                    icons:state.formData.icons.map(item => item.icon).join(',')
                }
                delete params.icons
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

    // 预览
    const previewImage = (val) => {
        provideData.previewPicture(val)
    }

    defineExpose({valid: formValidate })
</script>

<style lang="scss">
    @import '../styles/index.scss';
    .pinduoduo-deploy {
        .item-row {
            margin:10px 0 20px;
            display: flex;
            justify-content: start;
            align-items: baseline;
            .label-w {
                display: flex;
                align-items: center;
                .el-form-item {
                    margin-bottom:0;
                }
            }
            .el-input-number {
                width: 120px;
                margin: 0 5px;
            }
        } 
        .el-table--border {
            .el-upload-list__item {
                width: 80px;
                height: 80px;
            }
            .el-upload--picture-card {
                width: 80px;
                height: 80px;
            }
        }
        
    }
    
</style>