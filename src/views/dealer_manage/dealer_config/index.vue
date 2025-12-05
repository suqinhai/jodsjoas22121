<template>
    <!-- 经销商配置 -->
    <div class="container dealer-config">
        <el-tabs v-model="tabItem">
            <el-tab-pane :label="$t('经销商配置')" name="1">
                <BasicsConfig :metaData="metaData" v-if="typeof dealerMode === 'number'"></BasicsConfig>
            </el-tab-pane>
            <template v-if="dealerMode === 3">
                <el-tab-pane :label="$t('比例自动配置')" name="2">
                    <AwardConfig></AwardConfig>
                </el-tab-pane>
                <el-tab-pane :label="$t('VIP晋级奖励配置')" name="3">
                    <VipUpgradeAward></VipUpgradeAward>
                </el-tab-pane>
            </template>
            <template v-if="dealerMode === 2">
                <el-tab-pane :label="$t('结算配置')" name="2">
                    <SettlementConfig></SettlementConfig>
                </el-tab-pane>
            </template>
        </el-tabs>
    </div>
</template>

<script setup name="dealerConfig">
import { ref, reactive, defineAsyncComponent, computed } from 'vue'
import userStore from '@/store/user'
import { getCommonMeta } from '@/api/common'
const BasicsConfig = defineAsyncComponent(() => import("./components/BasicsConfig.vue"))
const AwardConfig = defineAsyncComponent(() => import("./components/AwardConfig.vue"))
const VipUpgradeAward = defineAsyncComponent(() => import("./components/VipUpgradeAward.vue"))
const SettlementConfig = defineAsyncComponent(() => import("./components/SettlementConfig.vue"))

let tabItem = ref('1')
let metaData = reactive({
    imType: [],
})
const userData = userStore()

const dealerMode = computed(() => {
    return userData.siteInfo.dealerMode
})

getCommonMeta({ types: 'imType' }).then(res => {
    metaData = Object.assign(metaData, res.data || {})
})
</script>

<style lang="scss">
.dealer-config {
    min-width: 1000px;
    .foot {
        margin-top: 40px;
        width: 600px;
        display: flex;
        justify-content: flex-end;
        padding-bottom: 40px;
    }
}
</style>