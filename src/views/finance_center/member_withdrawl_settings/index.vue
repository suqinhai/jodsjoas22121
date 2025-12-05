<template>
    <!-- 财务中心-会员提现配置 -->
    <div class="container member-withdrawl-settings">
        <el-tabs v-model="activeTab" v-if="showTabList.length">
            <el-tab-pane v-for="(item,index) in showTabList" :key="index" :label="item.title" :name="item.value">
            </el-tab-pane>
        </el-tabs>
        <WithdrawSetting v-if="activeTab === 1"></WithdrawSetting>
        <!-- <RiskControlAudit v-if="activeTab === 2"></RiskControlAudit> -->
        <DisbursementStatistics v-if="activeTab === 2"></DisbursementStatistics>
        <DisbursementStatistics v-if="activeTab === 3" offline></DisbursementStatistics>
    </div>
</template>

<script setup name="memberWithdrawlSettings">
import { defineAsyncComponent, ref, onActivated, computed, onMounted } from "vue"
import { useRoute } from 'vue-router'
import userStore from '@/store/user'
const WithdrawSetting = defineAsyncComponent(() => import("./withdraw_setting/index.vue"))
// const RiskControlAudit = defineAsyncComponent(() => import("./risk_control_audit/index.vue"))
const DisbursementStatistics = defineAsyncComponent(() => import("./disbursement_statistics/index.vue"))

const tabData = [
    { title: $t('提现设置'), value: 1, permissionCode: '' },
    // { title: $t('风控审核'), value: 2, permissionCode: 'merchant.cash-log.riskVerifyCashList' },
    { title: $t('出款统计-线上'), value: 2, permissionCode: 'merchant.cash-log.stat' },
    { title: $t('出款统计-线下转账'), value: 3, permissionCode: 'merchant.cash-log.stat' },
]
const activeTab = ref('')
const tab = ref('')
const route = useRoute()
const userData = userStore()

const showTabList = computed(() => {
    return tabData.filter(item => item.value === 1 || userData.isHasPermiss(item.permissionCode))
})

onMounted(() => {
    if (route.query.tab && !tab.value) {
        tab.value = +route.query.tab
        activeTab.value = showTabList.value.some(its => its.value === tab.value) ? tab.value : showTabList.value[0] ? showTabList.value[0].value : ''
    } else if (!route.query.tab && !tab.value) {
        activeTab.value = showTabList.value[0] ? showTabList.value[0].value : ''
    }
})

onActivated(() => {
    if ((route.query.tab && tab.value !== +route.query.tab)) {
        tab.value = +route.query.tab
        activeTab.value = showTabList.value.some(its => its.value === tab.value) ? tab.value : showTabList.value[0] ? showTabList.value[0].value : ''
    }
})
</script>

<style lang="scss">
</style>
