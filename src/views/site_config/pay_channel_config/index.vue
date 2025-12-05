<template>
    <!-- 站点配置-支付通道配置 -->
    <div class="container pay-channel-config">
        <el-tabs v-model="activeTab">
            <el-tab-pane v-for="(item,index) in showTabList" :key="index" :label="item.title" :name="item.value">
            </el-tab-pane>
        </el-tabs>
        <BasisSetting v-if="activeTab === 2"></BasisSetting>
        <TableComponent v-else :type="activeTab"></TableComponent>
    </div>
</template>

<script setup name="payChannelConfig">
import { defineAsyncComponent, ref, computed } from "vue"
import userStore from '@/store/user'
const TableComponent = defineAsyncComponent(() => import("./components/TableComponent.vue"))
const BasisSetting = defineAsyncComponent(() => import("./components/BasisSetting.vue"))

const tabData = [
    { title: $t('在线支付类型配置'), value: 1 },
    { title: $t('转账支付类型配置'), value: 0 },
    { title: $t('基础设置'), value: 2, permissionCode: 'merchant.cash-log.stat' },
]
const activeTab = ref(1)
const userData = userStore()

const showTabList = computed(() => {
    return tabData.filter(item => item.value !== 2 || userData.isHasPermiss(item.permissionCode))
})
</script>

<style lang="scss">
.pay-channel-config {
    min-width: 1050px;
}
</style>
