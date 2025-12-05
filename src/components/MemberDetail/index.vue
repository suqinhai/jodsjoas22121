<template>
    <!-- 会员详情弹窗 -->
    <div class="member-detail">
        <Dialog v-if="showTabList.length" ref="dialog" width="1300" :title="$t('会员信息')" :isShowSubmit="false" top="2vh" @cancel="cancel">
            <div>
                <el-tabs v-model="state.type">
                    <el-tab-pane v-for="(item,index) in showTabList" :key="index" :label="item.title" :name="item.value">
                    </el-tab-pane>
                </el-tabs>
                <MemberInfo ref="memberInfoRef" :metaData="metaData" v-if="state.type === 0" @showAmendDialog="showDialog"></MemberInfo>
                <WithdrawalAccount ref="withdrawalRef" @showDialog="showDialog" v-if="state.type === 1"></WithdrawalAccount>
                <AccountTransaction v-if="state.type === 2" :metaData="metaData"></AccountTransaction>
                <BetStatistics v-if="state.type === 3"></BetStatistics>
                <MemberMessage @showDialog="showDialog" v-if="state.type === 4"></MemberMessage>
                <MemberLog v-if="state.type === 5"></MemberLog>
                <RelevancyAccount :metaData="metaData" v-if="state.type === 6"></RelevancyAccount>
            </div>
        </Dialog>

        <MessageInfo :itemData="state.itemData" v-if="state.messageInfoShow" @close="state.messageInfoShow = false">
        </MessageInfo>
        <EditDialog v-if="state.editDialogShow" :memberId="commonData.memberId" :merchantId="props.merchantId" :itemData="state.itemData"
            @fetchData="fetchData" @close="state.editDialogShow = false"></EditDialog>
        <BalanceAmend v-if="state.amendDialogShow" :itemData="state.itemData" :metaData="metaData" @fetchData="fetchData"
            @close="state.amendDialogShow = false"></BalanceAmend>
        <WithdrawalExplain v-if="state.explainShow" @close="state.explainShow = false"></WithdrawalExplain>
    </div>
</template>

<script setup>
import { defineAsyncComponent, reactive, ref, provide, defineEmits, computed, onMounted, defineProps } from 'vue'
import { ElMessage } from 'element-plus'
import userStore from '@/store/user'
import commonStore from '@/store/common'
import { getCommonMeta, getMemberTagItems, getLevelConfig, getUserGradeData } from '@/api/common'
const MemberInfo = defineAsyncComponent(() => import('./MemberInfo.vue'))
const WithdrawalAccount = defineAsyncComponent(() => import('./WithdrawalAccount.vue'))
const AccountTransaction = defineAsyncComponent(() => import('./AccountTransaction.vue'))
const BetStatistics = defineAsyncComponent(() => import('./BetStatistics.vue'))
const MemberMessage = defineAsyncComponent(() => import('./MemberMessage.vue'))
const MemberLog = defineAsyncComponent(() => import('./MemberLog.vue'))
const RelevancyAccount = defineAsyncComponent(() => import('./RelevancyAccount.vue'))
const EditDialog = defineAsyncComponent(() => import('./EditDialog.vue'))
const BalanceAmend = defineAsyncComponent(() => import('./BalanceAmend.vue'))
const WithdrawalExplain = defineAsyncComponent(() => import('./WithdrawalExplain.vue'))

const emits = defineEmits(['resetData', 'close'])
const props = defineProps({
    merchantId: {
        default: ''
    }
})
const tabData = [
    { title: $t('会员信息'), value: 0, permissionCode: 'admin.user.detail' },
    { title: $t('提现账户'), value: 1, permissionCode: 'merchant.account.list' },
    { title: $t('账户交易'), value: 2, permissionCode: 'merchant.user-coin-log.list' },
    { title: $t('投注统计'), value: 3, permissionCode: 'admin.game-play-log.statByUser' },
    { title: $t('会员消息'), value: 4, permissionCode: 'admin.user-msg.list' },
    { title: $t('会员日志'), value: 5, permissionCode: 'merchant.user-operation-log.userLog' },
    { title: $t('关联账号'), value: 6, permissionCode: 'admin.user-bot-spy.list' },
]
const state = reactive({
    type: 0,
    itemData: {},
    messageInfoShow: false,
    editDialogShow: false,
    amendDialogShow: false,
    explainShow: false,
})
const dialog = ref(null)
const memberInfoRef = ref(null)
const withdrawalRef = ref(null)
let metaData = reactive({
    userLevel: [],
    fixedLevel: [],
    autoLevel: [],
    memberTag: [],
    botSpyType: [],
    botSpyPunish: [],
    balanceAdjustType: [],
    coinTradeType: [],
    userHandleType: [],
})
const userData = userStore()
const commonData = commonStore()

const showTabList = computed(() => {
    return tabData.filter(item => userData.isHasPermiss(item.permissionCode))
})

onMounted(() => {
    state.type = showTabList.value[0] ? showTabList.value[0].value : ''
    if (!showTabList.value.length) {
        commonData.memberDetailShow = false
        ElMessage.warning($t('暂无查看权限，请添加相关权限后再操作！'))
    }

    userData.getUserInfoDetail()
})

// getCommonMeta({ types: 'botSpyType,botSpyPunish,balanceAdjustType,userLevel,coinTradeType,userHandleType', merchantId: props.merchantId }).then(res => {
getCommonMeta({ types: 'botSpyType,botSpyPunish,balanceAdjustType,coinTradeType,userHandleType', merchantId: props.merchantId }).then(res => {
    metaData = Object.assign(metaData, res.data || {})
    if (metaData.userHandleType.length) {
        metaData.userHandleType = metaData.userHandleType.filter(item => +item.value < 10)
        metaData.userHandleType.forEach(item => {
            switch (item.value) {
                case '1':
                    item.label += $t('（在游戏时修改状态，需退出游戏才可冻结）')
                    break
                case '3':
                    item.label += $t('（不支持踢出厂家：BBGT、DB、MG、EVO、PG）')
                    break
                case '4':
                    item.label += $t('（无法进游戏，其他操作不影响）')
                    break
                case '6':
                    item.label += $t('（无法发起提现，其他操作不影响）')
                    break
                case '8':
                    item.label += $t('（无法领取活动、任务、vip奖励，代理佣金）')
                    break
            }
        })
    }
})

getMemberTagItems({ merchantId: props.merchantId }).then(res => {
    metaData.memberTag = res.data || []
})

getLevelConfig({ type: 1, merchantId: props.merchantId }).then(res => {
    res.data.forEach((item) => {
        item.id = JSON.stringify({ id: item.id, type: 1 })
        item.name += $t('（固定层级）')
    })
    metaData.fixedLevel = res.data || []
})

getLevelConfig({ type: 0, merchantId: props.merchantId }).then(res => {
    res.data.forEach((item) => {
        item.id = JSON.stringify({ id: item.id, type: 0 })
        item.name += $t('（自动层级）')
    })
    metaData.autoLevel = res.data || []
})

getUserGradeData({ merchantId: props.merchantId }).then(({ data }) => {
    if (data) {
        for (let key in data) {
            metaData.userLevel.push({
                label: data[key],
                value: key,
            })
        }
    }
})

// 展示弹窗
const showDialog = (val) => {
    let { key, data = {} } = val
    state[key] = true
    state.itemData = data
    state.itemData.merchantId = props.merchantId
}

// 刷新弹窗数据
const fetchData = (key) => {
    let obj = {
        withdrawalRef: withdrawalRef.value,
        memberInfoRef: memberInfoRef.value,
    }
    obj[key].fetchData()
}

const cancel = () => {
    commonData.memberDetailShow = false
    emits('close')
    emits('resetData')
}

provide('provideData', {
    'memberId': commonData.memberId,
    'merchantId': props.merchantId,
    'showLoading': () => dialog.value.showLoading(),
    'hideLoading': () => dialog.value.closeLoading(),
    'close': cancel,
    'isSame': !props.merchantId || props.merchantId === commonData.currentMerchantSite.id
})
</script>

<style lang="scss">
.member-detail {
}
</style>
