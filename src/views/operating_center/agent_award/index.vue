<template>
    <!-- 代理奖励 -->
    <div class="tabs agent-award">
        <el-tabs v-model="tabItem">
            <el-tab-pane :label="$t('代理等级')" :name="1">
                <AgentLevel></AgentLevel>
            </el-tab-pane>
            <el-tab-pane :label="$t('结算设置')" :name="2" v-if="userData.isHasPermiss('admin.meta.itemList-3')">
                <SettlementSet></SettlementSet>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script setup name='agentAward'>
import { defineAsyncComponent, ref } from "vue"
import userStore from '@/store/user'
const AgentLevel = defineAsyncComponent(() => import("./agent_level/index.vue"))
const SettlementSet = defineAsyncComponent(() => import("./settlement_set/index.vue"))

const userData = userStore()
let tabItem = ref(1)

</script>

<style lang="scss">
.agent-award {
    // min-width: 1300px;
}
</style>
