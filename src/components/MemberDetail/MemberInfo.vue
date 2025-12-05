<template>
    <!-- 会员详情弹窗-会员信息 -->
    <div class="member-info">
        <div class="box">
            <div class="small-box">
                <div class="box-head">{{$t('基本信息')}}<span style="margin-left:15px" v-permiss="'admin.user.edit'">
                        <el-button v-throttle type="primary" text v-if="state.basicsDisabled && !userData.userInfo.limitEditSecret"
                            @click="state.basicsDisabled = false">{{$t('编辑')}}
                        </el-button>
                        <el-button v-throttle type="primary" text v-if="!state.basicsDisabled" @click="getData('basics')">{{$t('取消')}}</el-button>
                        <el-button v-throttle type="primary" text v-if="!state.basicsDisabled" @click="handleSave('basics',1)">{{$t('保存')}}
                        </el-button>
                    </span>
                </div>
                <el-form class="form-box" :rules="state.rules" :model="state.memberData" :label-width="$locale == 'zh' ? '140px' : 'auto'">
                    <div class="form-head">
                        <div class="icon">
                            <div class="icon-box">
                                <img class="avatar" :src="state.memberData.avatar" alt="">
                            </div>
                            <el-button v-throttle type="primary" text v-if="!state.basicsDisabled && userData.getTemplateType() === 4"
                                @click="state.showAvatarDialog = true">
                                {{$t('更换头像')}}</el-button>
                        </div>
                        <div style="flex:1">
                            <el-form-item :label="$t('会员账号:')">
                                {{state.memberData.username}}
                            </el-form-item>
                            <el-row>
                                <el-form-item :label="$t('会员ID:')">
                                    {{state.memberData.id}}
                                </el-form-item>
                                <el-form-item :label="$t('信誉分:')" prop="creditScore">
                                    <el-input-number :placeholder="$t('请输入整数0-100')" :controls="false" :max="100" :min="0" v-model="state.memberData.creditScore" v-if="!state.basicsDisabled"></el-input-number>
                                   <span v-else> {{ state.memberData.creditScore }}</span>
                                </el-form-item>
                            </el-row>
                        </div>
                        <!--          <div style="flex:1">
                            <el-form-item :label="$t('会员等级:')">
                                {{state.memberData.level_}}
                            </el-form-item>
                            <el-form-item :label="$t('上级代理:')">
                                {{ state.memberData.agentUsername|| $t('无')}}
                            </el-form-item>
                        </div> -->
                    </div>
                    <el-form-item>
                        <template #label>
                            <div @click="explainType = 0, showExplainDialog = true" class="angentExplainDiv">{{$t('上级代理')}}<el-icon
                                    class="angentExplain">
                                    <QuestionFilled />
                                </el-icon>:
                            </div>
                        </template>
                        <template #default>
                            <el-input style="width: 200px" v-model="state.memberData.agentUserId" :disabled="state.agentDisabled"
                                :placeholder="$t('请输入上级代理')" />
                            <el-button v-throttle v-if="state.agentDisabled" type="primary" text @click="state.agentDisabled = false">{{$t('编辑')}}
                            </el-button>
                            <el-button v-throttle v-if="!state.agentDisabled" type="primary" text
                                @click="state.agentDisabled = true;getData('agentUserId')">{{$t('取消')}}</el-button>
                            <el-button v-throttle v-if="!state.agentDisabled" type="primary" text @click="saveAgent">{{$t('保存')}}</el-button>
                        </template>
                    </el-form-item>
                    <el-form-item :label="$t('会员昵称:')" v-if="userData.getTemplateType() === 4">
                        <el-input style="width: 200px" :disabled="state.basicsDisabled" v-model="state.basicsData.nickname"
                            :placeholder="$t('请输入会员昵称')" />
                    </el-form-item>
                    <el-form-item :label="$t('会员等级:')">
                        <el-select style="width: 200px" :disabled="state.basicsDisabled" v-model="state.basicsData.level" :placeholder="$t('VIP等级')">
                            <el-option v-for="item in metaData.userLevel" :key="item.value" :label="item.label" :value="+item.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="$t('账号状态:')">
                        <span v-if="state.statusDisabled">{{state.memberData.status_}}</span>
                        <el-select v-if="!state.statusDisabled" v-model="state.type" :placeholder="$t('请选择账号状态')">
                            <el-option :label="$t('解除兑换密码限制')" :value="0" />
                            <el-option v-for="item in metaData.userHandleType" :key="item.value" :label="item.label" :value="Number(item.value)" />
                        </el-select>
                        <el-button v-throttle v-if="state.statusDisabled" type="primary" text @click="state.statusDisabled = false">{{$t('编辑')}}
                        </el-button>
                        <el-button v-throttle v-if="!state.statusDisabled" type="primary" text @click="state.statusDisabled = true;state.type = ''">
                            {{$t('取消')}}</el-button>
                        <el-button v-throttle v-if="!state.statusDisabled" type="primary" text @click="postMemberStatus">{{$t('保存')}}</el-button>
                    </el-form-item>
                    <el-form-item>
                        <template #label>
                            <div @click="explainType = 1, showExplainDialog = true" class="angentExplainDiv">{{$t('会员层级')}}<el-icon
                                    class="angentExplain">
                                    <QuestionFilled />
                                </el-icon>:
                            </div>
                        </template>
                        <el-select style="width: 200px" :disabled="state.basicsDisabled" v-model="state.basicsData.fixTag" clearable filterable
                            :placeholder="$t('请选择会员层级')">
                            <el-option v-for="item in [...metaData.autoLevel,...metaData.fixedLevel]" :key="item.id" :label="item.name"
                                :value="item.id" />
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="$t('会员标签:')">
                        <el-select style="width: 480px" :disabled="state.basicsDisabled" v-model="state.basicsData.userTagId" clearable multiple
                            :multiple-limit="3" filterable :placeholder="$t('请选择会员标签')">
                            <el-option v-for="item in metaData.memberTag" :key="item.value" :label="item.label" :value="+item.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="$t('备注:')">
                        <el-input style="width: 480px" :disabled="state.basicsDisabled" type="textarea" :rows="4" :placeholder="$t('请输入备注')"
                            v-model="state.basicsData.remark" show-word-limit maxlength="30" />
                    </el-form-item>
                    <!-- <el-form-item :label="$t('返水名称:')"> -->
                    <!-- <el-select v-model="state.basicsData.status" :placeholder="$t('请选择返水名称')">
                            <el-option :label="$t('注册时间')" :value="1" />
                            <el-option :label="$t('最后登录时间')" :value="2" />
                            <el-option :label="$t('首充时间')" :value="3" />
                        </el-select> -->
                    <!-- </el-form-item> -->
                    <el-form-item :label="$t('注册来源:')" class="mb6">
                        {{state.memberData.source_}}
                    </el-form-item>
                    <el-form-item :label="$t('验证方式:')" class="mb6">
                        {{state.memberData.loginWay_}}
                    </el-form-item>
                    <el-form-item :label="$t('注册时间:')" class="mb6">
                        {{state.memberData.addTime}}
                    </el-form-item>
                    <!-- <el-form-item :label="$t('注册域名:')"> -->
                    <!-- <a :href="state.memberData.id"></a> -->
                    <!-- <a :href="'http://'+state.memberData.lastLoginIp" target="_Blank">{{state.memberData.lastLoginIp}}</a> -->
                    <!-- </el-form-item> -->
                    <el-form-item :label="$t('注册IP:')" class="mb6">
                        {{state.memberData.regIp}}
                    </el-form-item>
                    <el-form-item :label="$t('注册设备:')" class="mb6">
                        {{state.memberData.client_}}
                    </el-form-item>
                    <el-form-item :label="$t('最后登录时间:')" class="mb6">
                        {{state.memberData.lastLoginTime}}
                    </el-form-item>
                    <el-form-item :label="$t('最后登录IP:')">
                        {{state.memberData.lastLoginIp}}
                    </el-form-item>
                </el-form>
            </div>
            <div class="box-right">
                <div class="small-box el-form-bottom-0">
                    <div class="box-head">{{$t('资金信息')}}</div>
                    <el-form class="form-box" :model="state.memberData">
                        <el-form-item :label="$t('会员余额:')" :label-width="$locale == 'zh' ? '110px' : 'auto'">
                            {{(state.memberData.activeAmount + state.memberData.frozenAmount).toFixed(2) || 0}}{{`${$t('（可用')}${state.memberData.activeAmount || 0} + ${$t('冻结')}${state.memberData.frozenAmount || 0}）`}}
                            <el-button v-permiss="'merchant.account.adjust'" v-throttle type="danger" text style="padding: 8px 0;margin-left:10px"
                                @click="emits('showAmendDialog',{ data: state.memberData, key: 'amendDialogShow'})">{{$t('人工修正')}}</el-button>
                        </el-form-item>
                        <el-form-item :label="$t('存钱宝金额（累计收益):')" :label-width="$locale == 'zh' ? '170px' : 'auto'">
                            {{state.memberData.totalIncome_ || 0}}
                        </el-form-item>
                        <el-form-item :label="$t('冻结余额:')" :label-width="$locale == 'zh' ? '110px' : 'auto'">
                            {{state.memberData.frozenAmount || 0}}
                        </el-form-item>
                    </el-form>
                </div>
                <div class="small-box el-form-bottom-0">
                    <div class="box-head">{{$t('充值信息')}}<el-button v-if="isOrderPermiss" v-throttle type="primary" text style="margin-left:15px"
                            @click="handleGo">{{$t('详情')}}</el-button>
                    </div>
                    <el-form class="form-box" :model="state.memberData" :label-width="$locale == 'zh' ? '110px' : '180px'">
                        <div class="items">
                            <el-form-item :label="$t('充值次数:')">
                                {{state.memberData.rechargeNums || 0}}
                            </el-form-item>
                            <el-form-item :label="$t('充值金额:')">
                                {{state.memberData.totalRecharge || 0}}
                            </el-form-item>
                        </div>
                        <div class="items">
                            <el-form-item :label="$t('提现次数:')">
                                {{state.memberData.cashNums || 0}}
                            </el-form-item>
                            <el-form-item :label="$t('提现金额:')">
                                {{state.memberData.cashAmount || 0}}
                            </el-form-item>
                        </div>
                        <div class="items">
                            <el-form-item :label="$t('今日充值金额:')">
                                {{state.memberData.todayRechargeAmount || 0}}
                            </el-form-item>
                            <el-form-item :label="$t('今日提现金额:')">
                                {{state.memberData.todayCashAmount || 0}}
                            </el-form-item>
                        </div>
                        <el-form-item :label="$t('充提差额:')" :label-width="$locale == 'zh' ? '110px' : '250px'">
                            {{state.memberData.difference || 0}}
                        </el-form-item>
                    </el-form>
                </div>
                <div class="small-box el-form-bottom-0">
                    <div class="box-head">{{$t('操作信息')}}</div>
                    <el-form class="form-box" :model="state.memberData" label-width="auto">
                        <div class="items">
                            <el-form-item :label="$t('总有效投注:')">
                                {{state.memberData.validCoinTotal || 0}}
                            </el-form-item>
                            <el-form-item :label="$t('今日有效投注:')">
                                {{state.memberData.validCoinTotalDay || 0}}
                            </el-form-item>
                        </div>
                        <div class="items">
                            <el-form-item :label="$t('总输赢:')">
                                {{state.memberData.winLoseCoinTotal || 0}}
                            </el-form-item>
                            <el-form-item :label="$t('今日输赢:')">
                                {{state.memberData.winLoseCoinTotalDay || 0}}
                            </el-form-item>
                        </div>
                        <el-form-item :label="$t('代理佣金:')">
                            {{state.memberData.totalCommission || 0}}
                        </el-form-item>
                        <el-form-item :label="$t('活动优惠:')">
                            <div>{{$t('累计返水')}}：{{state.memberData.rebateAmount || '0.00'}}</div>
                            <div>{{$t('活动奖励')}}：{{state.memberData.activityAmount || '0.00'}}</div>
                            <div>{{$t('任务奖励')}}：{{state.memberData.taskAmount || '0.00'}}</div>
                        </el-form-item>
                    </el-form>
                </div>
                <div class="small-box">
                    <div class="box-head">{{$t('账户安全')}}</div>
                    <el-form class="form-box" ref="passwordForm" :rules="state.rules" :model="state.passwordData"
                        :label-width="$locale == 'zh' ? '80px' : 'auto'">
                        <div></div>
                        <el-form-item :label="$t('登录密码:')" prop="password">
                            <el-input v-model="state.passwordData.password" :disabled="state.passwordDisabled1" style="width:220px"
                                :placeholder="$t('请输入登录密码')" />
                            <span v-permiss="'admin.user.changePwd'">
                                <el-button v-throttle type="primary" text v-if="state.passwordDisabled1 && !userData.userInfo.limitEditSecret"
                                    @click="state.passwordDisabled1 = false">
                                    {{$t('编辑')}}</el-button>
                                <el-button v-throttle type="primary" style="padding: 0;margin: 0 15px" text v-if="!state.passwordDisabled1"
                                    @click="state.passwordDisabled1 = true,state.passwordData.password = ''">{{$t('取消')}}</el-button>
                                <el-button v-throttle type="primary" style="padding: 0" text v-if="!state.passwordDisabled1"
                                    @click="handleEdit('password',3)">{{$t('保存')}}</el-button>
                            </span>
                        </el-form-item>
                        <el-form-item :label="$t('提现密码:')" prop="exchangePassword">
                            <el-input :disabled="state.passwordDisabled2" v-model="state.passwordData.exchangePassword" style="width:220px"
                                :placeholder="$t('请输入提现密码')" />
                            <span v-permiss="'admin.user.changePwd'">
                                <el-button v-throttle type="primary" text v-if="state.passwordDisabled2 && !userData.userInfo.limitEditSecret"
                                    @click="state.passwordDisabled2 = false">
                                    {{$t('编辑')}}</el-button>
                                <el-button v-throttle type="primary" style="padding: 0;margin: 0 15px" text v-if="!state.passwordDisabled2"
                                    @click="state.passwordDisabled2 = true,state.passwordData.exchangePassword = ''">{{$t('取消')}}</el-button>
                                <el-button v-throttle type="primary" style="padding: 0" text v-if="!state.passwordDisabled2"
                                    @click="handleEdit('exchangePassword',4)">{{$t('保存')}}</el-button>
                            </span>
                        </el-form-item>
                    </el-form>
                </div>
            </div>
        </div>
        <div class="box" style="margin-top: 20px">
            <div class="small-box" style="width: 100%">
                <div class="box-head">{{$t('账户信息')}}<span style="margin-left:15px" v-permiss="'admin.user.edit'">
                        <el-button v-throttle type="primary" text v-if="state.accountDisabled && !userData.userInfo.limitEditSecret"
                            @click="state.accountDisabled = false">{{$t('编辑')}}
                        </el-button>
                        <el-button v-throttle type="primary" text v-if="!state.accountDisabled" @click="getData('account')">{{$t('取消')}}</el-button>
                        <el-button v-throttle type="primary" text v-if="!state.accountDisabled" @click="handleSave('account',2)">{{$t('保存')}}
                        </el-button>
                    </span>
                </div>
                <el-form class="form-box" :rules="state.rules" :disabled="state.accountDisabled" :model="state.accountData"
                    :label-width="$locale == 'zh' ? '100px' : 'auto'">
                    <div class="items">
                        <el-form-item :label="$t('姓名:')">
                            <el-input v-if="state.accountDisabled || userData.userInfo.limitEditSecret" :disabled="userData.userInfo.limitEditSecret"
                                v-model="state.memberData.showRealName" style="width:250px" :placeholder="$t('请输入姓名')" />
                            <el-input v-else-if="!userData.userInfo.limitEditSecret" v-model="state.accountData.realName" style="width:250px"
                                :placeholder="$t('请输入姓名')" />
                        </el-form-item>
                        <el-form-item :label="$t('性别:')">
                            <el-select v-model="state.accountData.gender" style="width:250px" :placeholder="$t('请选择性别')">
                                <el-option :label="$t('女')" :value="0" />
                                <el-option :label="$t('男')" :value="1" />
                            </el-select>
                        </el-form-item>
                        <el-form-item :label="$t('生日:')">
                            <el-date-picker v-model="state.accountData.birthday" type="date" style="width: 150px" format="YYYY-MM-DD"
                                value-format="YYYY-MM-DD" :placeholder="$t('设置生日')" />
                        </el-form-item>
                    </div>
                    <div class="items">
                        <el-form-item :label="$t('邮箱:')" prop="email">
                            <el-input v-if="state.accountDisabled || userData.userInfo.limitEditSecret" :disabled="userData.userInfo.limitEditSecret"
                                v-model="state.memberData.showEmail" style="width:250px" :placeholder="$t('请输入邮箱')" />
                            <el-input v-else-if="!userData.userInfo.limitEditSecret" v-model="state.accountData.email" style="width:250px"
                                :placeholder="$t('请输入邮箱')" />
                        </el-form-item>
                        <el-form-item :label="$t('手机号:')">
                            <el-input v-if="state.accountDisabled  || userData.userInfo.limitEditSecret" :disabled="userData.userInfo.limitEditSecret"
                                v-model="state.memberData.showPhone" style="width:250px" :placeholder="$t('请输入手机号')" />
                            <el-input v-else-if="!userData.userInfo.limitEditSecret" v-model="state.accountData.phone" style="width:250px"
                                :placeholder="$t('请输入手机号')" />
                        </el-form-item>
                        <el-form-item label="Viber:" v-if="userData.getTemplateType() === 4">
                            <el-input v-if="state.accountDisabled" v-model="state.memberData.viber" style="width:250px"
                                :placeholder="$t('请输入Viber')" />
                            <el-input v-else v-model="state.accountData.viber" style="width:250px" :placeholder="$t('请输入Viber')" />
                        </el-form-item>
                    </div>
                    <div class="items">
                        <el-form-item label="Facebook:">
                            <el-input v-if="state.accountDisabled" v-model="state.memberData.facebook" style="width:250px"
                                :placeholder="$t('请输入Facebook')" />
                            <el-input v-else v-model="state.accountData.facebook" style="width:250px" :placeholder="$t('请输入Facebook')" />
                        </el-form-item>
                        <el-form-item label="Telegram:">
                            <el-input v-if="state.accountDisabled" v-model="state.memberData.telegram" style="width:250px"
                                :placeholder="$t('请输入Telegram')" />
                            <el-input v-else v-model="state.accountData.telegram" style="width:250px" :placeholder="$t('请输入Telegram')" />
                        </el-form-item>
                        <el-form-item label="WhatsApp:">
                            <el-input v-if="state.accountDisabled" v-model="state.memberData.whatsapp" style="width:250px"
                                :placeholder="$t('请输入WhatsApp')" />
                            <el-input v-else v-model="state.accountData.whatsapp" style="width:250px" :placeholder="$t('请输入WhatsApp')" />
                        </el-form-item>
                    </div>
                </el-form>
            </div>
        </div>

        <ExplainDialog :explainType="explainType" v-if="showExplainDialog" @close="showExplainDialog = false"></ExplainDialog>
        <AvatarDeploy :memberData="state.memberData" v-if="state.showAvatarDialog" @close="state.showAvatarDialog = false" @setAvatar="setAvatar">
        </AvatarDeploy>
    </div>
</template>

<script setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import { dateFormat } from '@/common/util'
import { ref, reactive, onMounted, inject, defineExpose, computed, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import userStore from '@/store/user'
import { getMemberDetail, postMemberData, postMemberPassword, operateMemberConfig } from '@/api/member'
import { PASSWORD_REG } from '@/common/util/appConfig'
import { postChangeEdit } from '@/api/agent'
const ExplainDialog = defineAsyncComponent(() => import('./ExplainDialog.vue'))
const AvatarDeploy = defineAsyncComponent(() => import('./AvatarDeploy.vue'))

const emits = defineEmits(['showAmendDialog'])
const props = defineProps({
    metaData: {
        type: Object,
        default: {}
    },
})

const provideData = inject('provideData')
const explainType = ref(0)
const state = reactive({
    type: '',
    memberData: {},
    basicsData: {},
    passwordData: {},
    accountData: {},
    basicsDisabled: true,
    agentDisabled: true,
    statusDisabled: true,
    accountDisabled: true,
    passwordDisabled1: true,
    passwordDisabled2: true,
    rules: {
        password: [
            {
                pattern: PASSWORD_REG,
                message: $t('请输入6到16个字符，支持字母、数字、符号！'),
                trigger: 'change',
            },
        ],
        exchangePassword: [{
            pattern:
                /^[0-9]{6}$/,
            message: $t('提现密码仅限6位数字！'),
            trigger: 'change',
        },],
        email: [
            {
                pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: $t('请输入正确格式的邮箱地址！'),
                trigger: 'change',
            },
        ],
        creditScore: [
            {
                required: true,
                message: $t('请输入整数0-100'),
                trigger: 'change',
            },
            {
                pattern: /^[0-9]\d*$/,
                message: $t('请输入整数0-100'),
                trigger: 'change',
            },
        ]
        // realName: [{ required: true, message: $t('请输入姓名！'), trigger: 'blur' }],
        // gender: [{ required: true, message: $t('请选择性别！'), trigger: 'change' }],
    },
    showAvatarDialog: false,
})
const showExplainDialog = ref(false)
const passwordForm = ref(null)
const router = useRouter()
const userData = userStore()

const isOrderPermiss = computed(() => {
    return userData.isHasMenuPermiss('merchant.recharge-log.list')
})

onMounted(() => {
    getData()
})

const saveAgent = (el) => {
    if (state.memberData.agentUserId) {
        postChangeEditSave()
    } else {
        ElMessageBox.alert($t('你当前未填写上级代理ID，如果保存将会调整为顶级代理，是否确定？'), $t('提示'), {
            confirmButtonText: $t('确定'),
            callback: (action) => {
                if (action === 'confirm') {
                    postChangeEditSave()
                }
            },
        })
    }

}

const postChangeEditSave = () => {
    postChangeEdit({
        userId: state.memberData.id,
        inviteUserId: state.memberData.agentUserId,
        merchantId: provideData.merchantId,
    }).then(res => {
        if (res.code === 0) {
            state.agentDisabled = true
            getData('agentUserId')
        }
    })
}

const getData = (key = '') => {
    provideData.showLoading()
    getMemberDetail({ id: provideData.memberId, merchantId: provideData.merchantId }).then(res => {
        let { remark, layerId, layerType, userTagId, realName, gender, birthday = '', email, phone, avatar, facebook, telegram, whatsapp, viber, nickname } = res.data
        state.memberData = res.data
        state.memberData.merchantId = provideData.merchantId
        state.memberData.showRealName = realName
        state.memberData.showEmail = email
        state.memberData.showPhone = phone
        if (userData.userInfo.needAnonymous) {
            !!realName && (state.memberData.showRealName = realName.slice(0, 1) + '****')
            !!email && (state.memberData.showEmail = email.slice(0, 1) + '****' + '@' + email.split('@')[1])
            !!phone && (state.memberData.showPhone = phone.slice(0, 4) + '****' + phone.slice(-4))
        }
        state.memberData.initAvatar = avatar
        if (avatar) {
            state.memberData.avatar = avatar.indexOf('http') === 0 ? avatar : '/img/avatar/' + avatar + (userData.getTemplateType() === 4 ? '' : '.png')
        } else {
            state.memberData.avatar = '/img/default/avatar.png'
        }
        state.memberData.addTime = state.memberData.addTime && (dateFormat(state.memberData.addTime))
        state.memberData.lastLoginTime = state.memberData.lastLoginTime && (dateFormat(state.memberData.lastLoginTime))
        if (!key || key === 'basics') {
            state.basicsDisabled = true
            state.basicsData = {
                id: provideData.memberId,
                remark,
                fixTag: (layerId || layerId === 0) ? JSON.stringify({ id: layerId, type: layerType }) : '',
                userTagId: userTagId ? userTagId.split(',').map(item => +item) : [],
                merchantId: provideData.merchantId,
                level: state.memberData.level,
                avatar,
                nickname
            }
        }
        if (!key || key === 'account') {
            state.accountDisabled = true
            state.accountData = {
                id: provideData.memberId,
                birthday: birthday ? dateFormat(birthday, 'yyyy-MM-DD','',true) : '',
                realName: userData.userInfo.needAnonymous ? '' : realName,
                gender,
                email: userData.userInfo.needAnonymous ? '' : email,
                phone: userData.userInfo.needAnonymous ? '' : phone,
                merchantId: provideData.merchantId,
                facebook,
                telegram,
                whatsapp,
                viber
            }
        }
        if (!key || key === 'passwordData') {
            state.passwordData = { merchantId: provideData.merchantId }
            state.passwordDisabled1 = true
            state.passwordDisabled2 = true
        }
        
        provideData.hideLoading()
    }).catch(() => {
        state.memberData = {}
        provideData.hideLoading()
    })
}

const setAvatar = (val) => {
    state.memberData.initAvatar = val
    if (val.indexOf('http') === 0) {
        state.memberData.avatar = val
    } else {
        state.memberData.avatar = '/img/avatar/' + val + (userData.getTemplateType() === 4 ? '' : '.png')
    }
}

const postMemberStatus = () => {
    if (typeof state.type !== 'number') return ElMessage.warning($t('请选择状态后再进行操作！'))
    provideData.showLoading()
    operateMemberConfig({
        ids: [state.memberData.id],
        type: state.type,
        merchantId: provideData.merchantId,
    }).then(res => {
        state.statusDisabled = true
        state.type = ''
        getData('basics')
    }).catch(() => {
        provideData.hideLoading()
    })
}

const handleSave = (val, part) => {
    let params = { ...state[val + 'Data'], part, merchantId: provideData.merchantId }
    if (val === 'basics') {
        if (state.memberData.nickname && !params.nickname) return ElMessage.warning($t('请输入会员昵称再进行提交！'))
        if (params.fixTag) {
            params.fixTag = JSON.parse(params.fixTag)
            if (params.fixTag.type === 0) { params.autoLayerId = params.fixTag.id }
            if (params.fixTag.type === 1) { params.fixedLayerId = params.fixTag.id }
        }
        delete params.fixTag
        params.userTagId = params.userTagId.length ? params.userTagId.join(',') : ''
        params.avatar = state.memberData.initAvatar
        params.creditScore = state.memberData.creditScore
    } else if (val === 'account') {
        // params.phone = params.phone || state.memberData.phone
        // if (state.memberData.phone_ && !params.phone) return ElMessage.warning($t('请输入手机号再进行提交！'))
        // params.realName = params.realName || state.memberData.realName
        // params.email = params.email || state.memberData.email
        if (state.memberData.phone && !params.phone ) {
            confirmChange(params,val)
            return
        }
    }
    if (val === 'basics') {
        if (params.creditScore < 0 || params.creditScore > 100 || !Number.isInteger(params.creditScore)) {
            ElMessage.warning($t('请输入整数0-100'))
            return
        }
    }
    provideData.showLoading()
    handleSubmit(params,val)
}

const confirmChange = (params,val) => {
    ElMessageBox.confirm(
       `<div>
        <p>${$t('注意：删除后前端手机号码将同步被移除；')}</p>
        <p>${$t('1.若为手机号码注册，删除后不可使用该手机号码登录')}</p>
        <p>${$t('2.若绑定手机号码，删除后解除绑定为空')}</p>
        <p>${$t('3.活动-运营风险设置关联奖励限制，删除后未绑定手机号')}</p>
        </div>`,
        $t('提示'), {
        confirmButtonText: $t('确 定'),
        cancelButtonText: $t('取消'),
        showClose: true,
        type: 'warning',
        dangerouslyUseHTMLString: true,
        customClass: 'custom-confirm-width',
    }).then(() => {
        globalVBus.$emit('globalLoading', true)
        handleSubmit(params)
    }).catch(() => {
        getData(val)
    })
}

const handleSubmit = (params,val) => {
    provideData.showLoading()
    postMemberData(params).then((res) => {
        getData(val)
    }).catch(() => {
        provideData.hideLoading()
    })
}
const handleEdit = (key, part) => {
    if (!state.passwordData[key]) {
        return ElMessage.warning($t('请设置值后再进行提交！'))
    }
    passwordForm.value.validate((valid, fields) => {
        if (valid) {
            postMemberPassword({
                [key]: state.passwordData[key],
                id: provideData.memberId,
                merchantId: provideData.merchantId,
                part
            }).then((res) => {
                getData('passwordData')
            }).catch(() => {
                provideData.hideLoading()
            })
        } else {
            ElMessage.warning($t('请输入正确格式的密码再进行提交！'))
        }
    })
}

// 详情
const handleGo = () => {
    provideData.close()
    router.push(`/finance-center/recharge-order-list?userId=${provideData.memberId}`)
}

defineExpose({
    fetchData: getData
})
</script>

<style lang="scss">
.member-info {
    .angentExplainDiv {
        cursor: pointer;
        .angentExplain {
            margin: 0px 3px;
        }
    }
    .box {
        display: flex;
        justify-content: space-between;
        .small-box {
            flex-shrink: 0;
            width: 659px;
            border-radius: 0 0 8px 8px;
            border: 1px solid #ddd;
            margin-right: 40px;
            &.el-form-bottom-0 {
                .el-form-item {
                    margin-bottom: 0;
                }
            }
            .mb6 {
                margin-bottom: 6px!important;
            }
            .box-head {
                background-color: #ddd;
                height: 40px;
                display: flex;
                // justify-content: space-between;
                align-items: center;
                padding: 0 15px;
            }

            .el-button + .el-button {
                margin-left: 0;
            }
            .form-box {
                width: 100%;
                padding: 20px 20px 5px;

                .form-head {
                    display: flex;
                    .icon {
                        margin-left: 20px;

                        &-box {
                            width: 80px;
                            height: 80px;
                            border-radius: 50%;
                            overflow: hidden;
                        }

                        .avatar {
                            max-width: 80px;
                            max-height: 80px;
                        }
                    }
                }
            }
        }
        .small-box + .small-box {
            margin-top: 10px;
        }
        &-right .small-box {
            width: 530px;
            .items .el-form-item {
                flex: 1;
            }
        }
        .items {
            display: flex;

            .el-form-item {
                flex-shrink: 0;
                width: 400px;
            }
        }
    }
}
</style>
