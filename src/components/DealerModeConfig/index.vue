<template>
    <!-- 经销商模式配置 -->
    <div>
        <Dialog ref="dialog" :width="$locale == 'zh' ? 900 : 950" :title="title" top="2vh" :isShowSubmit="!isDisabled" :isCancel="operateType !== 2"
            :operateActions="operateActions" @confirm="handleSubmit(deployFormRef)" @cancel="cancel" @close="emits('close')">
            <el-form class="dealer-mode-config" ref="deployFormRef" :model="state.formData" :rules="state.rules" :disabled="isDisabled"
                :label-width="$locale == 'zh' ? 'auto' : ''">
                <el-form-item v-if="operateType === 3" :label="$t('会员ID:')" prop="userIds">
                    <el-input @input="(val) => state.formData.userIds = val.replace('，','')" v-model="state.formData.userIds" style="width: 100%"
                        type="textarea" :rows="4" :placeholder="$t('请输入会员ID，多个需要用英文逗号隔开')" />
                    <span>{{$t('注：如果添加的会员已经是经销商，或经销商的注册成员，则自动跳过。')}}</span>
                </el-form-item>
                <template v-if="operateType == 2">
                    <el-row>
                        <el-col :span="12">
                            <el-form-item :label="$t('会员账号:')">{{applyData.user?.name || ''}}</el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item :label="$t('申请时间:')">{{applyData.addTime && dateFormat(applyData.addTime) || ''}}</el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="12">
                            <el-form-item :label="$t('联系方式:')">{{applyData.contact}}</el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item :label="$t('联系信息:')">{{applyData.contactNum}}</el-form-item>
                        </el-col>
                    </el-row>
                    <el-form-item :label="$t('申请备注:')">{{applyData.content}}</el-form-item>
                </template>

                <template v-if="[2,3].includes(operateType)">
                    <el-form-item :label="$t('配置选择:')">
                        <el-radio-group v-model="state.configType">
                            <el-radio :label="0">{{$t('智能配置')}}</el-radio>
                            <el-radio :label="1">{{$t('手动配置')}}</el-radio>
                        </el-radio-group>
                        <template v-if="state.configType === 0">
                            <el-table :data="state.modeDataList" border style="width: 400px">
                                <el-table-column label="#" width="50" align="center">
                                    <template #default="{ row }">
                                        <el-checkbox v-model="row.checked" @change="checkChange(row)" />
                                    </template>
                                </el-table-column>
                                <el-table-column prop="name" :label="$t('经销商模式名称')" min-width="200" align="center" />
                                <el-table-column :label="$t('模式配置')" min-width="100" align="center">
                                    <template #default="{ row }">
                                        <el-button v-throttle type="primary" text @click="handleModeConfig(row.id)">{{$t('查看')}}</el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                            <div v-if="userData.isHasMenuPermiss('merchant.dealer.awardCfgList')" class="jump-box">
                                <div class="jump-box-main" @click="handleGo">{{$t('前往添加')}}
                                    <img src="@/assets/img/common/arrows_right.png" alt="">
                                </div>
                            </div>
                        </template>
                    </el-form-item>
                    <el-card class="el-card-bottom">
                        <template #header>{{$t('三级分佣设置')}}</template>
                        <el-row>
                            <el-col :span="14">
                                <el-form-item>
                                    <template #label>
                                        {{$t('三级分佣')}}
                                        <span class="explain pointer" @click.native.prevent="handleExplain(6)">
                                            <el-icon :size="16">
                                                <QuestionFilled />
                                            </el-icon>
                                        </span>:
                                    </template>
                                    <el-radio-group v-model="state.formData.commissionRule.rateType">
                                        <el-radio :label="1">{{$t('首充三级分佣')}}</el-radio>
                                        <el-radio :label="2">{{$t('累计充值三级分佣')}}</el-radio>
                                    </el-radio-group>
                                </el-form-item>
                            </el-col>
                            <el-col :span="10">
                                <el-form-item :label="$t('充值金额:')" prop="commissionRule.limitAmount">
                                    <el-input-number v-model="state.formData.commissionRule.limitAmount" :controls="false" :precision="0" :min="0"
                                        :max="999999999999999" />
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-form-item :label="$t('一级分佣:')" prop="commissionRule.rate">
                            <el-input-number v-model="state.formData.commissionRule.rate" :controls="false" :precision="2" :min="0" :max="100" />
                            %
                        </el-form-item>
                    </el-card>
                </template>

                <div v-if="operateType === 1 || (operateType === 2 && state.configType === 1)" class="title">{{$t('注：该配置提交后生成商户智能配置模版。')}}
                </div>
                <el-form-item :label="$t('使用站点:')" v-if="operateType < 2 && !!dealerSite.length">
                    <MerchantSiteSelect :disabled="operateType < 1" :optionData="dealerSite" :isClassify="false" style="width: 100%" isShowAll
                        multiple v-model="state.formData.siteId" :placeholder="$t('选择使用站点（可多选）')">
                    </MerchantSiteSelect>
                </el-form-item>

                <template v-if="operateType !== 4 && state.configType === 1">
                    <el-form-item :label="$t('经销商模式名称') + ':'" prop="name">
                        <el-input :disabled="!!itemData.id" v-model="state.formData.name" style="width: 300px" maxlength="10" show-word-limit />
                    </el-form-item>
                    <el-form-item>
                        <template #label>
                            {{$t('返佣计算')}}
                            <span class="explain pointer" @click.native.prevent="handleExplain(1)">
                                <el-icon :size="16">
                                    <QuestionFilled />
                                </el-icon>
                            </span>:
                        </template>
                        <el-radio-group :disabled="!!itemData.id" v-model="state.formData.rebateModel">
                            <el-radio :label="0">{{$t('直属')}}</el-radio>
                            <el-radio :label="1">{{$t('所有')}}</el-radio>
                        </el-radio-group>
                    </el-form-item>
                </template>

                <template v-if="state.configType === 1">
                    <el-card :class="{'disabled-box': !!itemData.id && !state.formData.rebateRule.firstRecharge.enable}">
                        <template #header>
                            <el-form-item>
                                <template #label>
                                    {{$t('首充分配条件')}}
                                    <span class="explain pointer" @click.native.prevent="handleExplain(2)">
                                        <el-icon :size="16">
                                            <QuestionFilled />
                                        </el-icon>
                                    </span>{{!!itemData.id ? '' : ':'}}
                                </template>
                                <el-radio-group :disabled="!!itemData.id" v-model="state.formData.rebateRule.firstRecharge.enable">
                                    <el-radio :label="true">{{$t('启用')}}</el-radio>
                                    <el-radio :label="false">{{$t('停用')}}</el-radio>
                                </el-radio-group>
                            </el-form-item>
                        </template>
                        <template v-if="state.formData.rebateRule.firstRecharge.enable">
                            <el-form-item :label="$t('首充门槛:')" prop="rebateRule.firstRecharge.threshold"
                                :rules="{ required: state.formData.rebateRule.firstRecharge.enable, message: messageText, trigger: 'blur'}">
                                <el-input-number v-model="state.formData.rebateRule.firstRecharge.threshold" :controls="false" :precision="0"
                                    :min="0" />
                            </el-form-item>
                            <el-row>
                                <el-col :span="14">
                                    <el-form-item :label="$t('首充奖励:')">
                                        <el-radio-group :disabled="!!itemData.id" v-model="state.formData.rebateRule.firstRecharge.rewardType"
                                            @change="delete state.formData.rebateRule.firstRecharge.rewardValue">
                                            <el-radio :label="0">{{$t('按充值比例')}}</el-radio>
                                            <el-radio :label="1">{{$t('固定金额')}}</el-radio>
                                        </el-radio-group>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="10">
                                    <el-form-item :label="state.formData.rebateRule.firstRecharge.rewardType ? $t('奖励金额:') : $t('奖励比例:')"
                                        prop="rebateRule.firstRecharge.rewardValue"
                                        :rules="{ required: state.formData.rebateRule.firstRecharge.enable, message: messageText, trigger: 'blur'}">
                                        <el-input-number v-model="state.formData.rebateRule.firstRecharge.rewardValue" :controls="false"
                                            :precision="state.formData.rebateRule.firstRecharge.rewardType ? 2 : 1" :min="0"
                                            :max="state.formData.rebateRule.firstRecharge.rewardType ? 999999999999999 : 100" />
                                        {{state.formData.rebateRule.firstRecharge.rewardType ? '' : '%'}}
                                    </el-form-item>
                                </el-col>
                            </el-row>
                        </template>
                    </el-card>

                    <el-card :class="{'disabled-box': !!itemData.id && !state.formData.rebateRule.totalRecharge.enable}">
                        <template #header>
                            <el-form-item>
                                <template #label>
                                    {{$t('累计充值条件')}}
                                    <span class="explain pointer" @click.native.prevent="handleExplain(3)">
                                        <el-icon :size="16">
                                            <QuestionFilled />
                                        </el-icon>
                                    </span>{{!!itemData.id ? '' : ':'}}
                                </template>
                                <el-radio-group :disabled="!!itemData.id" v-model="state.formData.rebateRule.totalRecharge.enable">
                                    <el-radio :label="true">{{$t('启用')}}</el-radio>
                                    <el-radio :label="false">{{$t('停用')}}</el-radio>
                                </el-radio-group>
                            </el-form-item>
                        </template>
                        <template v-if="state.formData.rebateRule.totalRecharge.enable">
                            <el-form-item :label="$t('累计充值:')" prop="rebateRule.totalRecharge.threshold"
                                :rules="{ required: state.formData.rebateRule.totalRecharge.enable, message: messageText, trigger: 'blur'}">
                                <el-input-number v-model="state.formData.rebateRule.totalRecharge.threshold" :controls="false" :precision="0"
                                    :min="0" />
                            </el-form-item>
                            <el-row>
                                <el-col :span="14">
                                    <el-form-item :label="$t('首充奖励:')">
                                        <el-radio-group :disabled="!!itemData.id" v-model="state.formData.rebateRule.totalRecharge.rewardType"
                                            @change="delete state.formData.rebateRule.totalRecharge.rewardValue">
                                            <el-radio :label="0">{{$t('按充值比例')}}</el-radio>
                                            <el-radio :label="1">{{$t('固定金额')}}</el-radio>
                                        </el-radio-group>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="10">
                                    <el-form-item :label="state.formData.rebateRule.totalRecharge.rewardType ? $t('奖励金额:') : $t('奖励比例:')"
                                        prop="rebateRule.totalRecharge.rewardValue"
                                        :rules="{ required: state.formData.rebateRule.totalRecharge.enable, message: messageText, trigger: 'blur'}">
                                        <el-input-number v-model="state.formData.rebateRule.totalRecharge.rewardValue" :controls="false"
                                            :precision="state.formData.rebateRule.totalRecharge.rewardType ? 2 : 1" :min="0"
                                            :max="state.formData.rebateRule.totalRecharge.rewardType ? 999999999999999 : 100" />
                                        {{state.formData.rebateRule.totalRecharge.rewardType ? '' : '%'}}
                                    </el-form-item>
                                </el-col>
                            </el-row>
                        </template>
                    </el-card>

                    <el-card :class="{'disabled-box': !!itemData.id && !state.formData.rebateRule.inviteCondition.enable}">
                        <template #header>
                            <el-form-item>
                                <template #label>
                                    {{$t('下级邀请条件')}}
                                    <span class="explain pointer" @click.native.prevent="handleExplain(4)">
                                        <el-icon :size="16">
                                            <QuestionFilled />
                                        </el-icon>
                                    </span>{{!!itemData.id ? '' : ':'}}
                                </template>
                                <el-radio-group :disabled="!!itemData.id" v-model="state.formData.rebateRule.inviteCondition.enable">
                                    <el-radio :label="true">{{$t('启用')}}</el-radio>
                                    <el-radio :label="false">{{$t('停用')}}</el-radio>
                                </el-radio-group>
                            </el-form-item>
                        </template>
                        <el-row v-if="state.formData.rebateRule.inviteCondition.enable">
                            <el-col :span="14">
                                <el-form-item :label="$t('下级邀请人数:')" prop="rebateRule.inviteCondition.threshold"
                                    :rules="{ required: state.formData.rebateRule.inviteCondition.enable, message: messageText, trigger: 'blur'}">
                                    <el-input-number v-model="state.formData.rebateRule.inviteCondition.threshold" :controls="false" :precision="0"
                                        :min="1" :max="100000" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="10">
                                <el-form-item :label="$t('奖励金额:')" prop="rebateRule.inviteCondition.rewardValue"
                                    :rules="{ required: state.formData.rebateRule.inviteCondition.enable, message: messageText, trigger: 'blur'}">
                                    <el-input-number v-model="state.formData.rebateRule.inviteCondition.rewardValue" :controls="false" :precision="1"
                                        :min="0" :max="999999999999999" />
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-card>

                    <el-card :class="{'disabled-box': !!itemData.id && !state.formData.rebateRule.firstRechargeThreshold.enable}">
                        <template #header>
                            <el-form-item>
                                <template #label>
                                    {{$t('首充门槛条件')}}
                                    <span class="explain pointer" @click.native.prevent="handleExplain(5)">
                                        <el-icon :size="16">
                                            <QuestionFilled />
                                        </el-icon>
                                    </span>:
                                </template>
                                <el-radio-group :disabled="!!itemData.id" v-model="state.formData.rebateRule.firstRechargeThreshold.enable">
                                    <el-radio :label="true">{{$t('启用')}}</el-radio>
                                    <el-radio :label="false">{{$t('停用')}}</el-radio>
                                </el-radio-group>
                            </el-form-item>
                        </template>
                        <el-row v-if="state.formData.rebateRule.firstRechargeThreshold.enable">
                            <el-col :span="14">
                                <el-form-item :label="$t('首充人数达到:')" prop="rebateRule.firstRechargeThreshold.threshold"
                                    :rules="{ required: state.formData.rebateRule.firstRechargeThreshold.enable, message: messageText, trigger: 'blur'}">
                                    <el-input-number v-model="state.formData.rebateRule.firstRechargeThreshold.threshold" :controls="false"
                                        :precision="0" :min="1" :max="1000" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="10">
                                <el-form-item :label="$t('奖励金额:')" prop="rebateRule.firstRechargeThreshold.rewardValue"
                                    :rules="{ required: state.formData.rebateRule.firstRechargeThreshold.enable, message: messageText, trigger: 'blur'}">
                                    <el-input-number v-model="state.formData.rebateRule.firstRechargeThreshold.rewardValue" :controls="false"
                                        :precision="1" :min="0" :max="999999999999999" />
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-card>

                    <el-card class="el-card-special" :class="{'disabled-box': !!itemData.id && !state.formData.rebateRule.vipLevelReward.enable}">
                        <template #header>
                            <el-form-item>
                                <template #label>
                                    {{$t('VIP等级奖励')}}
                                    <span class="explain pointer" @click.native.prevent="handleExplain(7)">
                                        <el-icon :size="16">
                                            <QuestionFilled />
                                        </el-icon>
                                    </span>{{!!itemData.id ? '' : ':'}}
                                </template>
                                <el-radio-group :disabled="!!itemData.id" v-model="state.formData.rebateRule.vipLevelReward.enable">
                                    <el-radio :label="true">{{$t('启用')}}</el-radio>
                                    <el-radio :label="false">{{$t('停用')}}</el-radio>
                                </el-radio-group>
                            </el-form-item>
                        </template>
                        <el-table v-if="state.formData.rebateRule.vipLevelReward.enable" :data="state.formData.rebateRule.vipLevelReward.rewards"
                            border>
                            <el-table-column :label="$t('等级')" width="90" align="center">
                                <template #default="{ row }">
                                    VIP{{row.level}}
                                </template>
                            </el-table-column>
                            <el-table-column :label="$t('总充值')" min-width="180" align="center">
                                <template #default="{ row,$index }">
                                    <span v-if="isDisabled">{{row.totalRecharge}}</span>
                                    <el-form-item v-if="!isDisabled" :prop="'rebateRule.vipLevelReward.rewards.' + $index + '.totalRecharge'"
                                        :rules=" { required: state.formData.rebateRule.vipLevelReward.enable, message: '', trigger: 'blur' }"
                                        label-width="0">

                                        <el-input-number style="width: 170px" v-model="row.totalRecharge" :controls="false" :precision="0"
                                            :placeholder="$t('输入金额')" :min="0" :max="999999999999999" />
                                    </el-form-item>
                                </template>
                            </el-table-column>
                            <el-table-column :label="$t('总人数')" min-width="145" align="center">
                                <template #default="{ row,$index }">
                                    <span v-if="isDisabled">{{row.totalNum}}</span>
                                    <el-form-item v-if="!isDisabled" :prop="'rebateRule.vipLevelReward.rewards.' + $index + '.totalNum'"
                                        :rules=" { required: state.formData.rebateRule.vipLevelReward.enable, message: '', trigger: 'blur' }"
                                        label-width="0">
                                        <el-input-number style="width: 130px" v-model="row.totalNum" :controls="false" :precision="0"
                                            :placeholder="$t('输入人数')" :min="1" :max="1000000" />
                                    </el-form-item>
                                </template>
                            </el-table-column>
                            <el-table-column :label="$t('按总充值奖励')" min-width="140px" align="center">
                                <template #default="{ row,$index }">
                                    <span v-if="isDisabled">{{row.rechargeFixedReward}}</span>
                                    <el-form-item v-if="!isDisabled" :prop="'rebateRule.vipLevelReward.rewards.' + $index + '.rechargeFixedReward'"
                                        :rules=" { required: state.formData.rebateRule.vipLevelReward.enable, message: '', trigger: 'blur' }"
                                        label-width="0">
                                        <el-input-number style="width: 130px" v-model="row.rechargeFixedReward" :controls="false" :precision="0"
                                            :placeholder="$t('输入金额')" :min="0" :max="999999999999999" />
                                    </el-form-item>
                                </template>
                            </el-table-column>
                            <el-table-column :label="$t('按人数固定金额')" min-width="160" align="center">
                                <template #default="{ row,$index }">
                                    <span v-if="isDisabled">{{row.numFixedReward}}</span>
                                    <el-form-item v-if="!isDisabled" :prop="'rebateRule.vipLevelReward.rewards.' + $index + '.numFixedReward'"
                                        :rules=" { required: state.formData.rebateRule.vipLevelReward.enable, message: '', trigger: 'blur' }"
                                        label-width="0">
                                        <el-input-number style="width: 140px" v-model="row.numFixedReward" :controls="false" :precision="0"
                                            :placeholder="$t('输入金额')" :min="0" :max="999999999999999" />
                                    </el-form-item>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-card>
                </template>

                <el-form-item v-if="operateType === 2" :label="$t('审核备注:')">
                    <el-input v-model="state.formData.frontRemark" type="textarea" :rows="4" :placeholder="$t('请输入审核备注')" />
                </el-form-item>
            </el-form>
        </Dialog>

        <ExplainDialog v-if="state.showExplain" :explainType="state.explainType" @close="state.showExplain = false"></ExplainDialog>
        <DealerModeConfig v-if="state.showDealerMode" :operateType="-1" :itemData="state.dealerModeData" @close="state.showDealerMode = false">
        </DealerModeConfig>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import userStore from '@/store/user'
import commonStore from '@/store/common'
import { getDealerModelSmartList, getDealerModelData, getMerchantMaximumVip, postDealerModelData, postAuditDealerApply, addDealerData } from '@/api/dealer'
import { deepClone, dateFormat } from '@/common/util'
const ExplainDialog = defineAsyncComponent(() => import('./ExplainDialog.vue'))
const DealerModeConfig = defineAsyncComponent(() => import('@/components/DealerModeConfig/index.vue'))

let messageText = $t('必填项不能为空！')
const emits = defineEmits(['close', 'fetchData', 'showExplain'])
const props = defineProps({
    operateType: {
        type: Number || String,
        default: ''
    },
    itemData: {
        type: Object,
        default: {}
    },
    applyData: {
        type: Object,
        default: {}
    },
})
const state = reactive({
    configType: 0,
    formData: {
        rebateModel: 0,
        rebateRule: {
            firstRecharge: {
                enable: false,
                rewardType: 0
            },
            totalRecharge: {
                enable: false,
                rewardType: 0
            },
            inviteCondition: {
                enable: false,
                rewardType: 1
            },
            firstRechargeThreshold: {
                enable: false,
                rewardType: 1
            },
            vipLevelReward: {
                enable: false,
                rewards: []
            },
        },
        commissionRule: {
            rateType: 1,
        }
    },
    rules: {
        name: { required: true, message: messageText, trigger: 'blur' },
        'commissionRule.limitAmount': { required: true, message: messageText, trigger: 'blur' },
        'commissionRule.rate': { required: true, message: messageText, trigger: 'blur' },
    },
    showDealerMode: false,
    showExplain: false,
    explainType: 1,
    modeDataList: [],
    checkedId: '',
    dealerModeData: {}
})
const deployFormRef = ref(null)
const dialog = ref(null)
const userData = userStore()
const commonData = commonStore()
const router = useRouter()

const title = computed(() => {
    if (props.operateType === -2) return $t('奖励比例设置') + `-${$t('详情')}`
    if (props.operateType === -1) return $t('模式配置详情')
    if (props.operateType === 0) return $t('生效条件详情')
    if (props.operateType === 1) return $t('奖励比例设置') + `-${props.itemData.id ? $t('修改') : $t('新增')}`
    if (props.operateType === 2) return $t('审核操作')
    if (props.operateType === 3) return $t('添加经销商')
    // if (props.operateType === 4) return $t('修改')
    return ''
})
const isDisabled = computed(() => {
    return props.operateType < 1
})
const operateActions = computed(() => {
    return props.operateType === 2 ? [$t('拒绝'), $t('通过')] : [$t('取消'), $t('提交')]
})
const dealerSite = computed(() => {
    return commonData.merchantSiteList.filter(item => item.enableDealer)
})

onMounted(async () => {
    try {
        state.formData = Object.assign(state.formData, props.itemData)
        let { rebateRule = {}, siteId } = state.formData
        if (siteId) state.formData.siteId = siteId.split(',').map(item => +item)
        if (!rebateRule.vipLevelReward || !rebateRule.vipLevelReward.rewards) state.formData.rebateRule.vipLevelReward.rewards = []
        if (props.operateType > 0) {
            dialog.value.showLoading()
            let { data = {} } = await getMerchantMaximumVip()
            let currentNum = state.formData.rebateRule.vipLevelReward.rewards.length
            let amxNum = data.vipNum - 1
            if (currentNum < amxNum) {
                for (let index = 1; index <= amxNum - currentNum; index++) {
                    state.formData.rebateRule.vipLevelReward.rewards.push({
                        level: currentNum + index,
                    })
                }
            } else if (currentNum > amxNum) {
                state.formData.rebateRule.vipLevelReward.rewards.splice(amxNum, currentNum - amxNum)
            }
        }
        if ([2, 3].includes(props.operateType)) {
            dialog.value.showLoading()
            getDealerModelSmartList({
                _page: 1,
                _size: 9999,
            }).then(({ data }) => {
                if (data && data.list) {
                    state.modeDataList = data.list.map(item => {
                        return {
                            ...item,
                            checked: false
                        }
                    })
                }
                dialog.value.closeLoading()
            }).catch(() => {
                dialog.value.closeLoading()
            })
        } else {
            state.configType = 1
            dialog.value.closeLoading()
        }
    } catch (error) {
        dialog.value.showLoading()
    }
})

const checkChange = ({ id, checked }) => {
    if (checked) {
        state.modeDataList.forEach(item => {
            if (item.id !== id) item.checked = false
        })
        state.checkedId = id
    }
}

const handleSubmit = (el) => {
    if (state.configType === 0 && !state.checkedId) return ElMessage.warning($t('请选择经销商模式再进行提交，如果没有可供选择的经销商模式，请前往【站点配置-经销商模式配置】进行添加！'))
    el.validate((valid, fields) => {
        if (valid) {
            let params = deepClone(state.formData)
            let { commissionRule, siteId, rebateRule, frontRemark, userIds } = state.formData
            delete params.commissionRule
            delete params.frontRemark
            if ([2, 3].includes(props.operateType)) {
                params.siteId = props.operateType === 3 ? commonData.currentMerchantSite.id : props.applyData.merchant.id
                params = {
                    ...commissionRule,
                    status: 1,
                    frontRemark,
                    config: state.configType ? JSON.stringify(params) : '',
                    configId: !state.configType ? state.checkedId : '',
                }
                if (props.operateType === 3) {
                    params.userIds = userIds
                } else {
                    params.id = props.applyData.id
                }
                state.configType ? delete params.configId : delete params.config
                delete params.siteId
            } else {
                params.rebateRule = JSON.stringify(rebateRule)
                if (siteId.length) {
                    params.siteId = siteId.includes(0) ? dealerSite.value.map(item => item.id).join(',') : siteId.join(',')
                } else {
                    params.siteId = ''
                }
            }
            let api = props.operateType === 2 ? postAuditDealerApply : props.operateType === 3 ? addDealerData : postDealerModelData
            dialog.value.showLoading()
            api(params).then(() => {
                emits('close')
                emits('fetchData')
            }).catch(() => {
                dialog.value.closeLoading()
            })
        } else {
            ElMessage.warning($t('请完善表单内容再进行提交！'))
        }
    })
}

const handleGo = () => {
    emits('close')
    router.push('/site-config/dealer-model-config')
}

const handleExplain = (type) => {
    state.explainType = type
    state.showExplain = true
}

const handleModeConfig = (id) => {
    dialog.value.showLoading()
    getDealerModelData({ id }).then(({ data = {} }) => {
        state.dealerModeData = { ...data }
        state.showDealerMode = true
        dialog.value.closeLoading()
    }).catch(() => {
        dialog.value.closeLoading()
    })
}

const cancel = () => {
    if (props.operateType === 2) {
        let { frontRemark } = state.formData
        if (!frontRemark) return ElMessage.warning($t('审核拒绝时，必须填写审核备注！'))
        postAuditDealerApply({
            status: 0,
            id: props.applyData.id,
            frontRemark,
        }).then(() => {
            emits('close')
            emits('fetchData')
        }).catch(() => {
            dialog.value.closeLoading()
        })
        return
    }
    emits('close')
}
</script>

<style lang="scss" >
.dealer-mode-config {
    .el-input-number {
        width: 180px;
    }
    .title {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 20px;
        color: red;
    }
    .jump-box {
        width: 400px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        margin-top: 5px;
        padding: 0 3px;
        height: 15px;
        color: #888;

        .jump-box-main {
            width: fit-content;
            display: flex;
            align-items: center;
            justify-content: space-between;

            img {
                margin-left: 12px;
                width: 12px;
                height: 11px;
            }
            &:hover {
                cursor: pointer;
            }
        }
    }
    .el-card {
        width: 100%;

        .el-card__header {
            padding: 10px 20px;
            .el-form-item {
                margin-bottom: 0;
            }
        }

        .el-card__body {
            padding: 20px 20px 0;
        }

        &-special {
            .el-card__body {
                padding: 20px;
            }
            margin-bottom: 20px;
        }

        &-bottom {
            color: #606266;
            font-weight: bold;
            margin-bottom: 20px;
        }

        & + .el-card {
            margin-top: 10px;
        }
    }
    .disabled-box {
        .el-card__header {
            border: none;
        }
        .el-card__body {
            padding: 0;
        }
    }
}
</style>
