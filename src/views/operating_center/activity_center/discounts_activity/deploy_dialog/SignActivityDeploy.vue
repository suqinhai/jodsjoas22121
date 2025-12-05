<template>
    <!-- 运营中心-优惠活动列表-活动配置弹窗-签到活动 -->
    <div>
        <el-form :model="state.formData" ref="formRef" :rules="state.rules" class="activity-deploy sign-deploy" label-width="auto"
            :disabled="deployData.operationType === 2">
            <el-form-item :label="$t('活动条件:')">
                <el-radio-group :disabled="!!deployData.id" v-model="state.formData.rules_.signType">
                    <el-radio :label="1">{{$t('常规签到')}}</el-radio>
                    <el-radio :label="2" v-if="!provideData.isCustomize()">{{$t('控制签到')}}</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item :label="$t('活动名称:')" prop="name">
                <el-input style="width: 100%" :disabled="deployData.operationType === 2" v-model="state.formData.name" :placeholder="$t('请输入活动名称')" />
            </el-form-item>
            <el-row>
                <el-col :span="13">
                    <el-form-item :label="$t('活动时间:')" class="time-box">
                        <el-form-item prop="beginTime" label-width="0">
                            <el-date-picker :disabled="isDisabled" v-model="state.formData.beginTime" type="datetime"
                                value-format="YYYY-MM-DD HH:mm:ss" :disabled-date="(time) => disabledDate(time)" :placeholder="$t('开始时间')">
                            </el-date-picker>
                        </el-form-item>
                        <span class="stance">{{$t('至')}}</span>
                        <el-form-item prop="endTime" label-width="0">
                            <el-date-picker :disabled="deployData.operationType === 2" v-model="state.formData.endTime" type="datetime"
                                value-format="YYYY-MM-DD HH:mm:ss" :disabled-date="(time) => disabledDate(time)" :placeholder="$t('结束时间')"
                                :default-time="new Date(2000, 0, 0, 23, 59, 59)">
                            </el-date-picker>
                        </el-form-item>
                    </el-form-item>
                </el-col>
                <el-col :span="11">
                    <el-form-item :label-width="$locale == 'zh' ? 'auto' : '200px'" :label="$t('活动排序:')">
                        <el-input-number :disabled="deployData.operationType === 2" v-model="state.formData.sort" style="width: 200px"
                            :controls="false" :precision="0" :min="0" :placeholder="$t('填0或者不填默认排最前面')" />
                    </el-form-item>
                </el-col>
            </el-row>

            <el-row>
                <el-col :span="13">
                    <el-form-item :label="$t('展示时间:')" class="time-box">
                        <el-form-item prop="showBeginTime" label-width="0">
                            <el-date-picker :disabled="deployData.operationType === 2" v-model="state.formData.showBeginTime" type="datetime"
                                value-format="YYYY-MM-DD HH:mm:ss" :disabled-date="(time) => disabledDate(time)" :placeholder="$t('开始时间')">
                            </el-date-picker>
                        </el-form-item>
                        <span class="stance">{{$t('至')}}</span>
                        <el-form-item prop="showEndTime" label-width="0">
                            <el-date-picker :disabled="deployData.operationType === 2" v-model="state.formData.showEndTime" type="datetime"
                                value-format="YYYY-MM-DD HH:mm:ss" :disabled-date="(time) => disabledDate(time)" :placeholder="$t('结束时间')"
                                :default-time="new Date(2000, 0, 0, 23, 59, 59)">
                            </el-date-picker>
                        </el-form-item>
                    </el-form-item>
                </el-col>
                <el-col :span="11" v-if="state.formData.rules_.signType === 1">
                    <el-form-item :label-width="$locale == 'zh' ? 'auto' : '200px'" :label="$t('稽核倍数:')" prop="auditMultiple">
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
            <el-row>
                <el-col :span="13">
                    <el-form-item :label="$t('签到方式:')" prop="rules_.signMode">
                        <el-radio-group :disabled="isDisabled" v-model="state.formData.rules_.signMode">
                            <el-radio :label="1">{{$t('连续签到')}}</el-radio>
                            <el-radio :label="2">{{$t('累计签到')}}</el-radio>
                        </el-radio-group>
                    </el-form-item>
                </el-col>
                <el-col :span="11" v-if="provideData.isCustomize()">
                    <el-form-item :label-width="$locale == 'zh' ? 'auto' : '200px'" :label="$t('绑定提现方式:')">
                        <el-switch :disabled="isDisabled" v-model="state.formData.rules_.cashAccount" :active-value="1" :inactive-value="0" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-form-item v-if="provideData.isCustomize()" :label="$t('签到规则:')" prop="cycleMode">
                <el-radio-group :disabled="isDisabled" v-model="state.formData.cycleMode">
                    <el-radio v-for="item in provideData.metaData.signCycleMode" :key="item.value" :label="item.value * 1">
                        {{ item.label }}
                    </el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item :label="$t('签到周期:')" prop="rules_.signCycle">
                <el-radio-group :disabled="isDisabled" v-model="state.formData.rules_.signCycle">
                    <el-radio v-for="item in provideData.metaData.signCycle" :key="item.value" :label="item.value * 1">
                        {{ item.label }}
                    </el-radio>
                    <el-radio v-if="provideData.isCustomize()" :label="-1" style="margin-right: 5px">{{ $t('自定义') }}</el-radio>
                </el-radio-group>
                <template v-if="state.formData.rules_.signCycle === -1">
                    <el-input-number :disabled="isDisabled" v-model="state.formData.rules_.signTime" style="width: 100px;margin-right: 5px"
                        :controls="false" :precision="0" :min="1" :max="30" :placeholder="$t('签到周期')" @blur="dayChange" />{{$t('天')}}
                </template>
            </el-form-item>
            <!-- <el-form-item> -->
            <el-table :data="state.formData.rules_.rules" border style="width:100%;margin-bottom: 20px" :style="{'max-width': (dialogWidth - 370 - 80) + 'px'}">
                <el-table-column :label="$t('类型')" width="105px" align="center">
                    <template #default="{ row }">
                        <el-select :disabled="isDisabled" v-model="row.type" :placeholder="$t('请选择类型')">
                            <el-option :label="$t('固定')" :value="1"></el-option>
                            <el-option :label="$t('随机')" :value="2"></el-option>
                        </el-select>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('奖励金额')" min-width="210px" align="center">
                    <template #default="{ row,$index }">
                        <div>
                            <el-form-item v-if="row.type === 1" :prop="'rules_.rules.' + $index + '.rewardAmount'"
                                :rules="[{ required: !provideData.isCustomize(), message: $t('请输入奖励金额！'), trigger: 'blur' }]" label-width="0">
                                <el-input-number :disabled="isDisabled" style="width: 240px" v-model="row.rewardAmount" :min="0.01" :precision="2"
                                    :controls="false" :placeholder="$t('奖励金额')" />
                            </el-form-item>
                            <div class="items-row" v-if="row.type === 2">
                                <div v-if="state.formData.rules_.signType === 2">
                                    <el-form-item style="margin-bottom: 10px" :prop="'rules_.rules.' + $index + '.rewardMinAmount'"
                                        :rules="[{ required: !provideData.isCustomize(), message: $t('请输入奖励金额！'), trigger: 'blur' }]" label-width="0">
                                        <el-input-number :disabled="isDisabled" style="width: 92px" v-model="row.rewardMinAmount" :min="0.01"
                                            :precision="2" :controls="false" :placeholder="$t('金额最小值')" @blur="inputBlur(row)" />
                                    </el-form-item>
                                    <el-form-item :prop="'rules_.rules.' + $index + '.rewardMaxAmount'"
                                        :rules="[{ required: !provideData.isCustomize(), message: $t('请输入奖励金额！'), trigger: 'blur' }]" label-width="0">
                                        <el-input-number :disabled="isDisabled" style="width: 92px" v-model="row.rewardMaxAmount" :min="0.01"
                                            :precision="2" :controls="false" :placeholder="$t('金额最大值')" @blur="inputBlur(row)" />
                                    </el-form-item>
                                </div>

                                <template v-else>
                                    <el-form-item :prop="'rules_.rules.' + $index + '.rewardMinAmount'"
                                        :rules="[{ required: !provideData.isCustomize(), message: $t('请输入奖励金额！'), trigger: 'blur' }]" label-width="0">
                                        <el-input-number :disabled="isDisabled" style="width: 92px" v-model="row.rewardMinAmount" :min="0.01"
                                            :precision="2" :controls="false" :placeholder="$t('金额最小值')" @blur="inputBlur(row)" />
                                    </el-form-item>
                                    <span style="margin: 0 5px">~</span>
                                    <el-form-item :prop="'rules_.rules.' + $index + '.rewardMaxAmount'"
                                        :rules="[{ required: !provideData.isCustomize(), message: $t('请输入奖励金额！'), trigger: 'blur' }]" label-width="0">
                                        <el-input-number :disabled="isDisabled" style="width: 92px" v-model="row.rewardMaxAmount" :min="0.01"
                                            :precision="2" :controls="false" :placeholder="$t('金额最大值')" @blur="inputBlur(row)" />
                                    </el-form-item>
                                </template>
                                <el-button :disabled="isDisabled" style="margin-left: 5px;padding: 0 15px" v-throttle type="primary"
                                    @click="handleProbabilityConfig($index)">{{$t('概率配置')}}</el-button>
                            </div>
                        </div>
                        <div style="margin-top: 10px" v-if="deployData?.merchant?.custom">
                            <el-select :style="{'width': state.formData.rules_.signType === 2 ? '115px' : '140px'}" :disabled="isDisabled"
                                v-model="row.ticketType" :placeholder="$t('票券类型')" @change="row.ticketId = ''">
                                <el-option v-for="ims in provideData.metaData.ticketType" :key="ims.value" :label="ims.label" :value="+ims.value" />
                            </el-select>
                            <el-select :style="{'width': state.formData.rules_.signType === 2 ? '135px' : '190px'}" :disabled="isDisabled" filterable
                                clearable v-model="row.ticketId" :placeholder="$t('请选择票券')">
                                <el-option :disabled="ims.isDisabled" v-for="ims in provideData.getOptionData(row)" :key="ims.id" :label="ims.name"
                                    :value="ims.id">
                                </el-option>
                            </el-select>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('充值要求')" min-width="120px" align="center">
                    <template #default="{ row,$index }">
                        <el-form-item :prop="'rules_.rules.' + $index + '.reachRecharge'"
                            :rules="[{ required: true, message: $t('请输入充值要求！'), trigger: 'blur' }]" label-width="0">
                            <el-input-number :disabled="isDisabled" style="width: 100%" v-model="row.reachRecharge" :min="0" :precision="2"
                                :controls="false" :placeholder="$t('充值要求')" />
                        </el-form-item>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('打码要求')" min-width="120px" align="center">
                    <template #default="{ row,$index }">
                        <el-form-item :prop="'rules_.rules.' + $index + '.reachPlay'"
                            :rules="[{ required: true, message: $t('请输入打码要求！'), trigger: 'blur' }]" label-width="0">
                            <el-input-number :disabled="isDisabled" style="width: 100%" v-model="row.reachPlay" :min="0" :precision="2"
                                :controls="false" :placeholder="$t('打码要求')" />
                        </el-form-item>
                    </template>
                </el-table-column>
                <el-table-column width="100" align="center" v-if="!provideData.isCustomize()">
                    <template #header>
                        <div>{{$t('已签到图标')}}</div>
                        <div>(104*104)</div>
                    </template>
                    <template #default="{ row }">
                        <div class="upload-box">
                            <UploadImage :disabled="isDisabled" v-model="row.icon" :size="100" :width="104" :height="104" isCustomPreview
                                @previewImage="previewImage">
                            </UploadImage>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column width="100" align="center" v-if="!provideData.isCustomize()">
                    <template #header>
                        <div>{{$t('未签到图标')}}</div>
                        <div>(104*104)</div>
                    </template>
                    <template #default="{ row }">
                        <div class="upload-box">
                            <UploadImage :disabled="isDisabled" v-model="row.noIcon" :size="100" :width="104" :height="104" isCustomPreview
                                @previewImage="previewImage">
                            </UploadImage>
                        </div>
                    </template>
                </el-table-column>
                <template v-if="state.formData.rules_.signType === 2">
                    <el-table-column :label="$t('余额打码稽核')" min-width="195px" align="center">
                        <template #default="{ row,$index }">
                            <div class="cell-row">
                                <span>{{$t('余额')}}</span>
                                <el-form-item label-width="0" :prop="'rules_.rules.' + $index + '.balance'"
                                    :rules="[{ required: true, message: $t('请输入余额！'), trigger: 'blur' }]">
                                    <el-input-number :disabled="isDisabled" style="width: 100px" v-model="row.balance" :min="0" :precision="2"
                                        :controls="false" :placeholder="$t('余额')" />
                                </el-form-item>
                            </div>
                            <!-- <div style="margin-top: 10px"> -->
                            <div class="cell-row">
                                <span>{{$t('≥余额，稽核倍数')}}</span>
                                <el-form-item label-width="0" :prop="'rules_.rules.' + $index + '.upAuditMultiple'"
                                    :rules="[{ required: true, message: $t('稽核倍数！'), trigger: 'blur' }]">
                                    <el-input-number :disabled="isDisabled" style="width: 100px" v-model="row.upAuditMultiple" :min="0" :precision="2"
                                        :controls="false" :placeholder="$t('稽核倍数')" />
                                </el-form-item>
                            </div>
                            <!-- <div style="margin-top: 10px"> -->
                            <div class="cell-row">
                                <span>{{$t('＜余额，稽核倍数')}}</span>
                                <el-form-item label-width="0" :prop="'rules_.rules.' + $index + '.dnAuditMultiple'"
                                    :rules="[{ required: true, message: $t('请输入稽核倍数！'), trigger: 'blur' }]">
                                    <el-input-number :disabled="isDisabled" style="width: 100px" v-model="row.dnAuditMultiple" :min="0" :precision="2"
                                        :controls="false" :placeholder="$t('稽核倍数')" />
                                </el-form-item>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('领取优惠后使用rtp')" width="142px" align="center">
                        <template #default="{ row,$index }">
                            <el-button style="padding: 0 15px" v-throttle type="primary" @click="handleRtp($index)">
                                {{$t('配置')}}
                            </el-button>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('操作')" width="190px" align="center">
                        <template #default="{ row,$index }">
                            <el-button v-if="!!$index" :disabled="isDisabled" style="padding: 0 15px" v-throttle type="primary"
                                @click="handleSync($index)">
                                {{$t('同步上面配置')}}</el-button>
                        </template>
                    </el-table-column>
                </template>
            </el-table>
            <!-- </el-form-item> -->
            <!-- <el-form-item :label="$t('宣传图:')" prop="image">
                <UploadImage v-model="state.formData.image" :size="2048" :width="710" :height="320" :disabled="deployData.operationType === 2"
                    :tips="$t('请上传710*320或等比例，PNG/JPG/GIF格式小于2048KB的图片')">
                </UploadImage>
            </el-form-item> -->
            <el-form-item :label="$t('宣传图:')" prop="image">
                <UploadImage v-model="state.formData.image" :width="state.limit.width" :height="state.limit.height" :disabled="deployData.operationType === 2"
                        :size="state.limit.size"
                        :tip="`${$t('请上传')}${state.limit.width}*${state.limit.height}${$t('或等比例，PNG/JPG/GIF格式小于')}${state.limit.size}${$t('KB的图片')}`" />
            </el-form-item>
            <el-form-item :label="$t('规则说明:')" prop="remark">
                <Tinymce v-model="state.formData.remark" v-model:isUploading="isUploading" :disabled="deployData.operationType === 2" width="1000px">
                </Tinymce>
            </el-form-item>
            <el-form-item :label="$t('会员等级:')" prop="levelList" v-if="provideData.isShowLevels">
                <el-checkbox :disabled="deployData.operationType === 2" v-model="state.formData.isCheckedAllLevel"
                    :indeterminate="state.formData.isIndeterminateLevel" @change="(val) => checkChange(val,'levelList',1)">{{$t('全部等级')}}
                </el-checkbox>
                <el-checkbox-group v-model="state.formData.levelList" @change="(val) => checkChange(val, 'isCheckedAllLevel', 0)">
                    <el-checkbox :disabled="deployData.operationType === 2" v-for="item in provideData.metaData.userLevel" :key="item"
                        :label="item.value">{{ item.label }}
                    </el-checkbox>
                </el-checkbox-group>
            </el-form-item>
            <!-- <el-form-item :label="$t('游戏平台:')" prop="vendor">
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
                    <el-checkbox-group :disabled="isDisabled" v-model="item.playVendors"
                        @change="provideData.handleCheckVendor(item)">
                        <el-checkbox v-for="(its,ims) in item.vendorName" :key="ims" :label="item.vendorList[ims]">
                            {{ its }}</el-checkbox>
                    </el-checkbox-group>
                </el-tab-pane>
            </el-tabs>
        </el-form-item> -->
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
                <el-form-item :label="$t('顶部标题:')" prop="attachConfig.title">
                    <el-input style="width: 100%" v-model="state.formData.attachConfig.title" :placeholder="$t('请输入标题内容')" />
                </el-form-item>
                <el-form-item :label="$t('底部说明:')">
                    <Tinymce v-model="state.formData.attachConfig.desc" v-model:isUploading="isUploading" :disabled="deployData.operationType === 2" width="1000px">
                    </Tinymce>
                </el-form-item>
            </template>
        </el-form>

        <SignRtpDeploy v-if="state.showRtpDeploy" :isDisabled="isDisabled" :itemData="state.itemData" @close="state.showRtpDeploy = false"
            @setRtpData="setRtpData">
        </SignRtpDeploy>
    </div>
</template>

<script setup>
import { reactive, ref, onMounted, watch, defineExpose, inject, defineAsyncComponent, computed } from "vue"
import { Plus, Minus } from "@element-plus/icons-vue"
import { ElMessage } from "element-plus"
import { deepClone } from "@/common/util/index"
import userStore from '@/store/user'
import { checkImageUploading } from '@/common/util'
const isUploading = ref(false)
const userData = userStore()

const SignRtpDeploy = defineAsyncComponent(() => import("./SignRtpDeploy.vue"))

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
    dialogWidth: {
        type: Number,
        default: 1000,
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
            signType: 1,
            cashAccount: 0,
            rules: [],
        },
        attachConfig: {
            tags: [],
        }
    },
    rules: {
        name: { required: true, message: $t('必填项不能为空'), trigger: "blur" },
        beginTime: { required: true, message: $t('请选择活动开始时间！'), trigger: 'change' },
        endTime: { required: true, message: $t('请选择活动结束时间！'), trigger: 'change' },
        showBeginTime: { required: true, message: $t('请选择开始展示时间！'), trigger: 'change' },
        showEndTime: { required: true, message: $t('请选择结束展示时间！'), trigger: 'change' },
        auditMultiple: { required: true, message: $t('必选项不能为空'), trigger: "blur" },
        remark: { required: true, message: $t('必填项不能为空'), trigger: "blur" },
        image: { required: true, message: $t('宣传图不能为空！'), trigger: 'change' },
        levelList: { required: true, message: $t('必选项不能为空'), trigger: "blur" },
        cycleMode: { required: true, message: $t('必选项不能为空'), trigger: "change" },
        'rules_.signMode': { required: true, message: $t('必选项不能为空'), trigger: "change" },
        'rules_.signCycle': { required: true, message: $t('必选项不能为空'), trigger: "change" },
        'attachConfig.title': { required: true, message: $t('必填项不能为空'), trigger: "blur" },
    },
    currentIndex: '',
    operateIndex: '',
    itemData: {},
    showRtpDeploy: false,
})
const formRef = ref(null)
const provideData = inject('provideData')

watch(
    () => state.formData.rules_.signCycle,
    (val) => {
        if (val !== -1) {
            dataProcessing(val)
        }
    }
)
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
        state.formData.rules_.rules.forEach(item => {
            if (!item.ticketId || !item.ticketName) {
                item.ticketType = 0
                item.ticketId = ''
            }
        })
        if (provideData.isCustomize()) {
            if (props.deployData.attachConfig) state.formData.attachConfig = JSON.parse(props.deployData.attachConfig)
            if (![7, 15, 30].includes(state.formData.rules_.signCycle)) {
                state.formData.rules_.signTime = state.formData.rules_.signCycle
                state.formData.rules_.signCycle = -1
            }
        }
    } else {
        state.formData.rules_.signCycle = 7
    }
})

const dayChange = () => {
    let { signCycle, signTime } = state.formData.rules_
    if (signCycle === -1 && typeof signTime === 'number') {
        dataProcessing(signTime)
    }
}

const dataProcessing = (val) => {
    if (state.formData.rules_.rules.length > val) {
        state.formData.rules_.rules.splice(val)
    } else if (state.formData.rules_.rules.length < val) {
        let controlObj = { pools: {}, cash: true, minBalance: undefined, balance: undefined, upAuditMultiple: undefined, dnAuditMultiple: undefined, }
        for (let i = state.formData.rules_.rules.length; i < val; i++) {
            let icon = (i + 1) % 3 === 1 ? '/img/default/sign_box1_open.png' : (i + 1) % 3 === 2 ? '/img/default/sign_box2_open.png' : '/img/default/sign_box3_open.png'
            let noIcon = (i + 1) % 3 === 1 ? '/img/default/sign_box1_close.png' : (i + 1) % 3 === 2 ? '/img/default/sign_box2_close.png' : '/img/default/sign_box3_close.png'
            state.formData.rules_.rules.push({
                type: 1,
                reachRecharge: undefined,
                reachPlay: undefined,
                rewardAmount: undefined,
                rewardMinAmount: undefined,
                rewardMinAmount: undefined,
                icon,
                noIcon,
                ticketType: 0,
                ticketId: '',
                ...controlObj,
            })
        }
    }
}

const inputBlur = (row) => {
    let { rewardMinAmount, rewardMaxAmount } = row
    if (typeof rewardMinAmount !== 'number' || typeof rewardMaxAmount !== 'number') return
    if (rewardMaxAmount < rewardMinAmount) {
        row.rewardMaxAmount = rewardMinAmount
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
const handleProbabilityConfig = (index) => {
    let { rewardMinAmount, rewardMaxAmount, limitOdds = [] } = state.formData.rules_.rules[index]
    if (typeof rewardMinAmount !== 'number' || typeof rewardMaxAmount !== 'number') return ElMessage.warning($t('请配置完奖励金额再进行操作！'))
    if (rewardMaxAmount <= 0.01) return ElMessage.warning($t('奖励金额必须大于0.01才能配置概率！'))
    state.currentIndex = index
    provideData.probabilityDeployShow({
        rewardMinAmount,
        rewardMaxAmount,
        limitOdds,
    })
}

// 设置奖励概率数据
const setProbability = (val) => {
    if (!val.length) return delete state.formData.rules_.rules[state.currentIndex].limitOdds
    state.formData.rules_.rules[state.currentIndex].limitOdds = val
}

// 同步上方配置
const handleSync = (index) => {
    state.formData.rules_.rules[index] = deepClone(state.formData.rules_.rules[index - 1])
}

// 配置Rtp数据
const handleRtp = (index) => {
    state.operateIndex = index
    state.itemData = state.formData.rules_.rules[index]
    state.showRtpDeploy = true
}

// 设置Rtp数据
const setRtpData = (val) => {
    const { pools, cash, minBalance } = val
    state.formData.rules_.rules[state.operateIndex].pools = pools
    state.formData.rules_.rules[state.operateIndex].cash = cash
    if (minBalance) state.formData.rules_.rules[state.operateIndex].minBalance = minBalance

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
            let { rules_ } = params
            let failType = 0
            let failIndex
            for (let index = 0; index < rules_.rules.length; index++) {
                let obj = { ...rules_.rules[index] }
                if (!obj.ticketId) {
                    delete rules_.rules[index].ticketType
                    delete rules_.rules[index].ticketId
                    delete rules_.rules[index].ticketName
                }
                if (provideData.isCustomize() && !obj.ticketId && ((obj.type === 1 && !obj.rewardAmount) || (obj.type === 2 && !obj.rewardMinAmount))) {
                    failType = 1
                    failIndex = index
                    break
                }
                if (obj.type === 2 && obj.limitOdds && obj.limitOdds.length) {
                    if (obj.limitOdds.some(its => its.limit < obj.rewardMinAmount || its.limit > obj.rewardMaxAmount)) {
                        failType = 2
                        failIndex = index
                        break
                    }
                    rules_.rules[index].limitOdds[obj.limitOdds.length - 1].limit = rules_.rules[index].rewardMaxAmount
                }
                if (obj.type !== 2 || (obj.limitOdds && !obj.limitOdds.length)) {
                    delete rules_.rules[index].limitOdds
                }
            }
            if (failType === 1) return ElMessage.warning(`${$t('奖励配置第')}${failIndex + 1}${$t('行奖励金额和奖励票券至少配置一个！')}`)
            if (failType === 2) return ElMessage.warning(`${$t('奖励配置第')}${failIndex + 1}${$t('行奖励金额改变，请重新配置相关概率！')}`)
            if (!provideData.isCustomize()) {
                delete params.rules_.cashAccount
                delete params.attachConfig
            } else {
                if (rules_.signCycle === -1) {
                    if (!rules_.signTime) return ElMessage.warning($t('请设置自定义签到周期天数后再进行提交！'))
                    params.rules_.signCycle = params.rules_.signTime
                }
                delete params.rules_.signTime
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
.sign-deploy {
    .deploy-title {
        font-weight: 700;
        font-size: 16px;
        color: #000;
        margin-bottom: 10px;
    }
    .upload-box {
        width: 80px;
        height: 80px;
        transform: scale(0.5);
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .self_period {
        width: 60px;
    }
    .el-select {
        width: 78px;
    }
    .nowrap {
        display: flex;
        align-items: center;
    }
    .items-row {
        display: flex;
        justify-content: center;
        align-items: center;
        .el-form-item {
            width: 110px;
            // margin-bottom: 10px;
        }
    }
    .cell-row {
        display: flex;
        align-items: center;
        .el-input {
            margin-left: 5px;
        }
        & + .cell-row {
            margin-top: 10px;
        }
    }
}
</style>
