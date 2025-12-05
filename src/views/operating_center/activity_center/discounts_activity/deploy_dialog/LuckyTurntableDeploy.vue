<template>
    <!-- 运营中心-优惠活动列表-活动配置弹窗-幸运转盘活动 -->
    <el-form :model="state.formData" ref="formRef" :rules="state.rules" :disabled="deployData.operationType === 2"
        class="activity-deploy lucky-turntable-deploy" :label-width="$locale == 'zh' ? '100px' : 'auto'">
        <el-form-item :label="$t('活动名称:')" prop="name">
            <el-input style="width: 100%" v-model="state.formData.name" :placeholder="$t('请输入活动名称')" />
        </el-form-item>
        <el-row>
            <el-col :span="13">
                <el-form-item :label="$t('活动排序:')">
                    <el-input-number v-model="state.formData.sort" style="width: 200px" :controls="false" :precision="0" :min="0"
                        :placeholder="$t('填0或者不填默认排最前面')" />
                </el-form-item>
            </el-col>
            <el-col :span="11">
                <el-form-item :label-width="$locale == 'zh' ? '128px' : 'auto'" :label="$t('稽核倍数:')" prop="auditMultiple">
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
        <el-form-item :label="$t('获得幸运值:')" prop="rules_.convertAmount">
            <el-input-number :disabled="isDisabled" style="width: 120px" v-model="state.formData.rules_.convertAmount" :min="0.01" :precision="2"
                :controls="false" :placeholder="$t('请输入有效投注')" />{{$t('有效投注=1幸运值')}}
        </el-form-item>
        <el-form-item :label="$t('转盘开关:')" prop="turntableList">
            <el-checkbox-group :disabled="isDisabled" v-model="state.formData.turntableList" @change="typeCheckChange">
                <el-checkbox v-for="item in turntableType" :key="item.key" :label="item.key">{{ item.label }}
                </el-checkbox>
            </el-checkbox-group>
        </el-form-item>
        <div class="rule-box" v-if="state.formData.turntableList.length && state.activeType">
            <div class="tab">
                <div v-for="item in turntableType" :key="item.key" class="tab-box pointer"
                    :class="{'active':state.activeType === item.key, 'is-disabled': !state.formData.turntableList.includes(item.key)}"
                    @click="handleTab(item.key)">
                    {{ item.label }}
                </div>
            </div>
            <div v-for="(item,index) in Object.keys(state.rulesList)" :key="index">
                <div v-show="item === state.activeType" style="margin-bottom: 10px">{{$t('消耗幸运值')}}
                    <el-input-number style="width: 120px;margin: 0 5px" v-model="state.rulesList[item].expend" :min="1" :precision="0"
                        :controls="false" :placeholder="$t('请输入消耗幸运值')" />{{$t('幸运值/每次')}}</div>
                <el-table v-show="item === state.activeType" :data="state.rulesList[item].rates" border style="width: 600px">
                    <el-table-column :label="$t('奖励金额')" min-width="120" align="center">
                        <template #default="{ row }">
                            <el-input-number style="width: 100%" v-model="row.amount" :min="0.01" :max="999999999999999" :precision="2"
                                :controls="false" :placeholder="$t('请输入奖励金额')" />
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('中奖率(总和必须小于等于100%)')" min-width="120" align="center">
                        <template #default="{ row }">
                            <el-input-number style="width: 90%" v-model="row.factor" :min="0" :precision="2" :controls="false"
                                :placeholder="$t('请输入中奖率')" />
                            %
                        </template>
                    </el-table-column>
                    <el-table-column width="100" align="center">
                        <template #header>
                            <div>{{$t('图标')}}</div>
                            <div>(100*100)</div>
                        </template>
                        <template #default="{ row }">
                            <div class="upload-box">
                                <UploadImage v-model="row.icon" :size="100" :width="100" :height="100" isCustomPreview @previewImage="previewImage">
                                </UploadImage>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
        <!-- <el-form-item :label="$t('获奖公告:')" prop="rules_.winnerShow">
                <el-switch v-model="state.formData.rules_.winnerShow" :active-value="1" :inactive-value="0" />
                <div class="tips-content">{{$t('最低1小时，最高24小时，最低1条，最高50条')}}</div>
            </el-form-item>
            <el-form-item class="items-row" v-if="state.formData.rules_.winnerShow" style="margin-top: -8px">{{$t('每')}}<el-form-item prop="rules_.interval" :rules="[
                { required: !!state.formData.rules_.winnerShow, message: $t('必选项不能为空！'), trigger:'blur' },
                { type: 'number', max: 24, message: $t('获奖公告间隔最大值为24！'), trigger: 'change' }
                ]" label-width="0">
                    <el-input-number style="width: 150px" v-model="state.formData.rules_.interval" :min="1" :precision="0"
                        :controls="false" />
                </el-form-item>{{$t('小时，随机显示')}}<el-form-item prop="rules_.winnerNum" :rules="[
                { required: !!state.formData.rules_.winnerShow, message: $t('必选项不能为空！'), trigger:'blur' },
                { type: 'number', max: 50, message: $t('获奖公告间隔最大值为50！'), trigger: 'change' }
                ]" label-width="0">
                    <el-input-number style="width: 150px" v-model="state.formData.rules_.winnerNum" :min="1" :precision="0"
                        :controls="false" />
                </el-form-item>{{$t('条')}}</el-form-item> -->
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
            <Tinymce v-model="state.formData.remark" v-model:isUploading="isUploading" :disabled="deployData.operationType === 2" :width="$locale == 'zh' ? 'auto' : '680px'">
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
import { reactive, ref, onMounted, computed, defineExpose, inject } from "vue"
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

const turntableType = [
    { label: $t('白银转盘'), key: 'silver' },
    { label: $t('黄金转盘'), key: 'gold' },
    { label: $t('钻石转盘'), key: 'diamond' },
]
const initData = {
    expend: undefined,
    rates: [
        { amount: undefined, factor: undefined, icon: '/img/default/lucky_wheel_gold.png' },
        { amount: undefined, factor: undefined, icon: '/img/default/lucky_wheel_gold.png' },
        { amount: undefined, factor: undefined, icon: '/img/default/lucky_wheel_gold.png' },
        { amount: undefined, factor: undefined, icon: '/img/default/lucky_wheel_gold.png' },
        { amount: undefined, factor: undefined, icon: '/img/default/lucky_wheel_gold.png' },
        { amount: undefined, factor: undefined, icon: '/img/default/lucky_wheel_gold.png' },
        { amount: undefined, factor: undefined, icon: '/img/default/lucky_wheel_gold.png' },
        { amount: undefined, factor: undefined, icon: '/img/default/lucky_wheel_gold.png' },
        { amount: undefined, factor: undefined, icon: '/img/default/lucky_wheel_gold.png' },
        { amount: undefined, factor: undefined, icon: '/img/default/lucky_wheel_gold.png' },
    ]
}
const state = reactive({
    oldImage: [],
    limit: {
        width: 710,
        height: 320,
        size: 2048
    },
    formData: {
        turntableList: [],
        rules_: {},
    },
    rules: {
        name: [{ required: true, message: $t('必填项不能为空！'), trigger: "blur" }],
        auditMultiple: [{ required: true, message: $t('必填项不能为空！'), trigger: "blur" }],
        beginTime: [{ required: true, message: $t('请选择活动开始时间！'), trigger: "blur" }],
        endTime: [{ required: true, message: $t('请选择活动结束时间！'), trigger: "blur" }],
        showBeginTime: [{ required: true, message: $t('请选择开始展示时间！'), trigger: "blur" }],
        showEndTime: [{ required: true, message: $t('请选择结束展示时间！'), trigger: "blur" }],
        turntableList: [{ required: true, message: $t('必选项不能为空！'), trigger: "blur" }],
        image: [{ required: true, message: $t('宣传图不能为空！'), trigger: "blur" }],
        remark: [{ required: true, message: $t('必填项不能为空！'), trigger: "blur" }],
        levelList: [{ required: true, message: $t('必选项不能为空！'), trigger: "blur" }],
        'rules_.convertAmount': [{ required: true, message: $t('必填项不能为空！'), trigger: "blur" }],
    },
    activeType: '',
    rulesList: {
        silver: {},
        gold: {},
        diamond: {},
    }
})
const formRef = ref(null)
const provideData = inject('provideData')

const showTurntable = computed(() => {
    return turntableType.filter(item => state.formData.turntableList.includes(item.key))
})
const isPPTemplate = computed(() => {
    return userData.getTemplateType() === 5
})
onMounted(() => {
    if(isPPTemplate.value) {
        state.limit.width = 656
        state.limit.height = 176
    }
    turntableType.forEach(item => {
        state.rulesList[item.key] = deepClone(initData)
    })
    state.formData = Object.assign(state.formData, deepClone(props.deployData))
    if (props.deployData.id) {
        state.oldImage = props.deployData.image.split(',')
        if (isPPTemplate.value) {
            state.formData.image = state.oldImage[1]
        } else {
            state.formData.image = state.oldImage[0]
        }
        state.formData.turntableList = []
        let { rules_ } = state.formData
        turntableType.forEach(item => {
            if (rules_[item.key]) {
                state.rulesList[item.key] = rules_[item.key]
                state.formData.turntableList.push(item.key)
            }
        })
        state.activeType = state.formData.turntableList[0] || ''
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

// 转盘类型勾选
const typeCheckChange = (value) => {
    let arr = turntableType.filter(item => value.includes(item.key))
    if (!arr.some(item => item.key === state.activeType)) {
        state.activeType = value[0]
    }
}

// 转盘切换
const handleTab = (key) => {
    if (state.formData.turntableList.includes(key)) {
        state.activeType = key
    }
}

// 预览
const previewImage = (val) => {
    provideData.previewPicture(val)
}

const formValidate = () => {
    formRef.value.validate((valid) => {
        if (valid) {
            if (checkImageUploading(isUploading.value)) return
            let params = deepClone(state.formData)
            let { turntableList, rules_ } = params
            let isPass = true
            let factorSum = 0
            let arr = Object.values(state.rulesList)
            for (let index = 0; index < arr.length; index++) {
                if (turntableList.includes(turntableType[index].key)) {
                    if (typeof arr[index].expend !== 'number' || !arr[index].rates.every(its => its.amount > 0 && its.icon && its.factor >= 0)) {
                        ElMessage.warning($t('转盘配置每项都为必填，请完善转盘配置再操作！'))
                        isPass = false
                        break
                    }
                    factorSum = arr[index].rates.reduce((pre, item) => pre + (item.factor * 100), 0)
                    if (factorSum === 0 || factorSum > 10000) {
                        ElMessage.warning($t('概率总和必须大于0且小于等于100！'))
                        isPass = false
                        break
                    }
                }
            }
            if (!isPass) return
            turntableType.forEach(item => {
                if (turntableList.includes(item.key)) {
                    rules_[item.key] = state.rulesList[item.key]
                } else {
                    delete rules_[item.key]
                }
            })
            rules_.type = 1
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
.lucky-turntable-deploy {
    .rule-box {
        padding-left: 100px;
        margin-bottom: 10px;
        .tab {
            width: fit-content;
            height: 36px;
            border: 1px solid #409eff;
            border-radius: 2px;
            display: flex;
            margin-bottom: 10px;

            &-box {
                // flex: 1;
                padding: 0 15px;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 12px;
                color: #409eff;
            }

            .tab-box + .tab-box {
                border-left: 1px solid #409eff;
            }

            .active {
                color: #fff;
                background-color: #409eff;
            }
            .is-disabled:hover {
                cursor: not-allowed;
            }
        }
    }
    .upload-box {
        width: 80px;
        height: 80px;
        transform: scale(0.5);
        margin: auto;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .items-row .el-form-item {
        display: inline-flex;
    }
    .tips-content {
        display: inline;
        margin-left: 10px;
    }
}
</style>
