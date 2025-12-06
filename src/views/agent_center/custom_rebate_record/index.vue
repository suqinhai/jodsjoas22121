<template>
    <!-- 代理中心-C版返佣记录 -->
    <div class="container">
        <el-tabs v-model="tabItem">
            <el-tab-pane v-for="item in typeList" :key="item.value" :label="item.label" :name="item.value">
            </el-tab-pane>
        </el-tabs>
        <InvitationAwardRecord v-if="tabItem === 1"></InvitationAwardRecord>
        <AchievementRewardRecord v-if="tabItem === 2"></AchievementRewardRecord>
        <RechargeRebateRecord v-if="tabItem === 3"></RechargeRebateRecord>
        <BetRebateRecord v-if="tabItem === 4"></BetRebateRecord>
    </div>
</template>

<script setup name="customRebateRecord">
import { ref, defineAsyncComponent } from "vue"
const InvitationAwardRecord = defineAsyncComponent(() => import("./invitation_award_record/index.vue"))
const AchievementRewardRecord = defineAsyncComponent(() => import("./achievement_reward_record/index.vue"))
const RechargeRebateRecord = defineAsyncComponent(() => import("./recharge_rebate_record/index.vue"))
const BetRebateRecord = defineAsyncComponent(() => import("./bet_rebate_record/index.vue"))

const typeList = [
    { value: 1, label: $t('邀请奖励记录') },
    { value: 2, label: $t('成就奖励记录') },
    { value: 3, label: $t('充值返佣记录') },
    { value: 4, label: $t('投注返佣记录') },
]
const tabItem = ref(1)
</script>

<style lang="scss">
</style>