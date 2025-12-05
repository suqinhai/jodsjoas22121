<template>
    <!-- 会员调控 -->
    <div class="container member-adjust-control pr">
        <el-tabs v-model="state.activeTab">
            <el-tab-pane v-for="(item,index) in showData" :key="index" :label="item.title" :name="item.value">
            </el-tab-pane>
        </el-tabs>
        <div class="pa explain-box">
            <el-icon class="pointer" color="#666" :size="28" @click="state.showExplain = true">
                <QuestionFilled />
            </el-icon>
        </div>

        <!-- <DataListStrategy v-if="isHaveMode &&  state.activeTab === 1" :metaData="metaData" :initData="state.formData1" @setSearchData="setSearchData"
            @showMemberDetail="showMemberDetail" @getBalanceLimit="getBalanceLimit">
        </DataListStrategy> -->
        <DataListSimple v-if="state.activeTab === 1" :metaData="metaData" :initData="state.formData1" @setSearchData="setSearchData"
            @showMemberDetail="showMemberDetail" @getBalanceLimit="getBalanceLimit">
        </DataListSimple>
        <DataLogStrategy v-if="state.activeTab === 2" @showMemberDetail="showMemberDetail"></DataLogStrategy>
        <ControlRulePreinstall v-if="state.activeTab === 3" :metaData="metaData" :initData="state.formData2" @setSearchData="setSearchData"
            @showMemberDetail="showMemberDetail">
        </ControlRulePreinstall>
        <ExplainDialog v-if="state.showExplain" @close="state.showExplain = false"></ExplainDialog>
        <VipBalanceLimitExplain v-if="state.showBalanceLimit" :balanceLimitData="state.balanceLimitData" @close="state.showBalanceLimit = false">
        </VipBalanceLimitExplain>
    </div>
</template>

<script setup name='memberAdjustControl'>
import { defineAsyncComponent, reactive, onMounted, computed, onActivated } from "vue"
import { useRoute } from 'vue-router'
import userStore from '@/store/user'
import commonStore from '@/store/common'
import { getMemberRiskControlLimit } from '@/api/risk_control'
import { getCommonMeta, getLevelConfig, getUserGradeData } from '@/api/common'
const DataListStrategy = defineAsyncComponent(() => import("./strategy_mode/data-list.vue"))
const DataLogStrategy = defineAsyncComponent(() => import("./strategy_mode/data-log.vue"))
const DataListSimple = defineAsyncComponent(() => import("./simple_mode/data-list.vue"))
const ControlRulePreinstall = defineAsyncComponent(() => import("./components/ControlRulePreinstall.vue"))
const ExplainDialog = defineAsyncComponent(() => import('./components/ExplainDialog.vue'))
const VipBalanceLimitExplain = defineAsyncComponent(() => import('./components/VipBalanceLimitExplain.vue'))

const tabData = [
    // { title: $t('数据列表'), value: 1 },
    { title: $t('数据列表'), value: 1 },
    { title: $t('控制历史'), value: 2 },
    { title: $t('返奖率预设列表'), value: 3 },
]
const state = reactive({
    activeTab: 1,
    showExplain: false,
    showBalanceLimit: false,
    balanceLimitData: [],
    formData1: {},
    formData2: {},
    isInit: true
})
let metaData = reactive({
    fixedLevel: [],
    autoLevel: [],
    userLevel: [],
    // controlStatus: [],
    profitLayer: [],
    ctrlPools: [],
    ctrlLoseType: [],
    controlTypeList: [],
    simpleCtrlType: [],
    userType: [
        { label: $t('会员'), value: 0 },
        { label: $t('代理'), value: 1 },
        { label: $t('推广'), value: 2 },
    ],
})
const route = useRoute()
const userData = userStore()
const commonData = commonStore()

const showData = computed(() => {
    return userData.isHasPermiss('merchant.user-simple-ctrl.ruleList') ? tabData : tabData.filter(item => item.value !== 3)
    // if (!userData.siteInfo.ctrlMode) {
    //     return userData.isHasPermiss('merchant.user-simple-ctrl.ruleList') ? tabData.filter(item => item.value > 2) : tabData.filter(item => item.value === 3)
    // } else {
    //     return tabData.filter(item => item.value !== 3)
    // }
})

// const isHaveMode = computed(() => {
//     return typeof userData.siteInfo.ctrlMode === 'number'
// })

onMounted(() => {
    if (commonData.isManual) state.isInit = false
    if (route.query.merchantId && +route.query.merchantId !== commonData.currentMerchantSite.id && !commonData.isManual) {
        commonData.setCurrentMerchantSite(+route.query.merchantId)
        return
    }
    getCommonMeta({ types: 'ctrlPools,simpleCtrlType,ctrlLoseType' }).then(res => {
        metaData = Object.assign(metaData, res.data || {})
        metaData.ctrlLoseType = metaData.ctrlLoseType.filter(item => +item.value <= 10)
        metaData.controlTypeList = userData.siteInfo.commissionMode && userData.siteInfo.commissionMode === 1 && !userData.siteInfo.ctrlWin ? metaData.ctrlLoseType : metaData.ctrlPools
    })
    getLevelConfig({ type: 0 }).then(res => {
        metaData.autoLevel = res.data || []
    })
    getLevelConfig({ type: 1 }).then(res => {
        metaData.fixedLevel = res.data || []
    })
    getUserGradeData().then(({ data }) => {
        if (data) {
            for (let key in data) {
                metaData.userLevel.push({
                    label: data[key],
                    value: key,
                })
            }
        }
    })
    // if (!userData.siteInfo.ctrlMode) state.activeTab = 3
})

onActivated(() => {
    if (state.isInit) return state.isInit = false
    if (route.query.merchantId && +route.query.merchantId !== commonData.currentMerchantSite.id && !commonData.isManual) {
        commonData.setCurrentMerchantSite(+route.query.merchantId)
    }
})

const showMemberDetail = (id) => {
    globalVBus.$emit('memberDetailDialog', id)
}

const setSearchData = ({ key, data }) => {
    state[key] = { ...data }
}

const getBalanceLimit = () => {
    globalVBus.$emit('globalLoading', true)
    getMemberRiskControlLimit({
        merchantId: userData.userInfo.siteMid || userData.userInfo.merchantId,
    }).then((res) => {
        state.balanceLimitData = res.data || []
        state.showBalanceLimit = true
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss">
.member-adjust-control {
    .explain-box {
        top: 20px;
        right: 50px;
    }
}
</style>
