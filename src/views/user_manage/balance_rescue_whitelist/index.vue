<template>
    <!-- 余额救援金白名单 -->
    <div class="container balance-rescue-whitelist">
        <el-tabs v-model="activeTab">
            <el-tab-pane v-for="item in showTabList" :key="item.value" :label="item.title" :name="item.value">
            </el-tab-pane>
        </el-tabs>
        <MemberWhitelist v-if="activeTab === 1"></MemberWhitelist>
        <LevelWhitelist v-if="activeTab === 2"></LevelWhitelist>
    </div>
</template>

<script setup name="balanceRescueWhitelist">
import { defineAsyncComponent, ref, computed } from "vue"
import userStore from '@/store/user'
const MemberWhitelist = defineAsyncComponent(() => import("./member_whitelist/index.vue"))
const LevelWhitelist = defineAsyncComponent(() => import("./level_whitelist/index.vue"))

const tabData = [
    { title: $t('会员白名单'), value: 1 },
    { title: $t('层级白名单'), value: 2, permissionCode: 'merchant.promotion-whitelist.reliefBalanceLayerList' },
]
const activeTab = ref(1)
const userData = userStore()

const showTabList = computed(() => {
    return tabData.filter(item => item.value === 1 || userData.isHasPermiss(item.permissionCode))
})
</script>

<style lang="scss">
</style>
