<template>
    <!-- TTT会员调控 -->
    <div class="container member-adjust-control-TTT pr">
        <el-tabs v-model="state.activeTab">
            <el-tab-pane v-for="(item,index) in showData" :key="index" :label="item.title" :name="item.value">
            </el-tab-pane>
        </el-tabs>
        <div class="pa explain-box">
            <el-icon class="pointer" color="#666" :size="28" @click="state.showExplain = true">
                <QuestionFilled />
            </el-icon>
        </div>

        <DataListSimple v-if="state.activeTab === 1" :metaData="metaData" :initData="state.formData1" @setSearchData="setSearchData"
            @showMemberDetail="showMemberDetail" @getBalanceLimit="getBalanceLimit">
        </DataListSimple>
        <ControlRulePreinstall v-if="state.activeTab === 2" :metaData="metaData" :initData="state.formData2" @setSearchData="setSearchData"
            @showMemberDetail="showMemberDetail">
        </ControlRulePreinstall>
        <ExplainDialog v-if="state.showExplain" @close="state.showExplain = false"></ExplainDialog>
    </div>
</template>

<script setup name='memberAdjustControlTTT'>
import { defineAsyncComponent, reactive, onMounted, computed } from "vue"
import userStore from '@/store/user'
import { getMemberRiskControlLimit } from '@/api/risk_control'
import { getCommonMeta, getLevelConfig, getUserGradeData } from '@/api/common'
const DataListSimple = defineAsyncComponent(() => import("./simple_mode/data-list.vue"))
const ControlRulePreinstall = defineAsyncComponent(() => import("./components/ControlRulePreinstall.vue"))
const ExplainDialog = defineAsyncComponent(() => import('./components/ExplainDialog.vue'))


const tabData = [
    { title: $t('数据列表'), value: 1 },
    { title: $t('返奖率预设列表'), value: 2 },
]
const state = reactive({
    activeTab: 1,
    showExplain: false,
    showBalanceLimit: false,
    balanceLimitData: [],
    formData1: {},
    formData2: {},
})
let metaData = reactive({
    fixedLevel: [],
    autoLevel: [],
    userLevel: [],
    controlStatus: [],
    profitLayer: [],
    ctrlPools: [],
    ctrlLoseType: [],
    simpleCtrlType: [],
    userType: [
        { label: $t('会员'), value: 0 },
        { label: $t('代理'), value: 1 },
        { label: $t('推广'), value: 2 },
    ],
})
const userData = userStore()

const showData = computed(() => {
    return userData.isHasPermiss('merchant.user-simple-ctrl.ruleList-1') ? tabData : tabData.filter(item => item.value !== 2)
})

onMounted(() => {
    getCommonMeta({ types: 'simpleCtrlType,TTTCtrlPools' }).then(res => {
        metaData = Object.assign(metaData, res.data || {})
        metaData.ctrlPools = metaData.TTTCtrlPools
        metaData.ctrlLoseType = metaData.TTTCtrlPools.filter((item) => { return parseInt(item.label) <= '100' })
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
.member-adjust-control-TTT {
    .explain-box {
        top: 20px;
        right: 50px;
    }
}
</style>
