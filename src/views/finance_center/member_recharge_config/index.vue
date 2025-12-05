<template>
    <!-- 财务中心-会员充值配置 -->
    <div class="container member-recharge-config">
        <el-tabs v-model="activeTab" v-if="showTabList.length">
            <el-tab-pane v-for="(item,index) in showTabList" :key="index" :label="item.title" :name="item.value">
            </el-tab-pane>
        </el-tabs>
        <OnlineRechargeConfig v-if="activeTab === 1"></OnlineRechargeConfig>
        <TransferRechargeConfig v-if="activeTab === 2"></TransferRechargeConfig>
        <RechargeStatistics v-if="activeTab === 3"></RechargeStatistics>
    </div>
</template>

<script setup  name="memberRechargeConfig">
import { defineAsyncComponent, ref, onActivated, computed, onMounted } from "vue"
import userStore from '@/store/user'
import { useRoute } from 'vue-router'
const OnlineRechargeConfig = defineAsyncComponent(() => import("./online_recharge_config/index.vue"))
const TransferRechargeConfig = defineAsyncComponent(() => import("./transfer_recharge_config/index.vue"))
const RechargeStatistics = defineAsyncComponent(() => import("./recharge_statistics/index.vue"))

const tabData = [
    { title: $t('在线充值配置'), value: 1, permissionCode: '' },
    { title: $t('转账充值配置'), value: 2, permissionCode: '' },
    { title: $t('充值统计'), value: 3, permissionCode: 'merchant.recharge-log.dailyStat' },
]
const activeTab = ref('')
const tab = ref('')
const route = useRoute()
const userData = userStore()

const showTabList = computed(() => {
    return tabData.filter(item => item.value !== 3 || userData.isHasPermiss(item.permissionCode))
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
