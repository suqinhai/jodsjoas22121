<template>
    <!-- 经销商报表 -->
    <div class="tabs agent-report">
        <el-tabs v-model="tabItem">
            <el-tab-pane :label="$t('经销商结算记录')" name="1">
                <SettlementRecord></SettlementRecord>
            </el-tab-pane>
            <el-tab-pane v-if="userData.isHasPermiss('merchant.dealer.settleList')" :label="$t('经销商结算明细')" name="2">
                <SettlementDetail></SettlementDetail>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script setup name='dealerReport'>
import { defineAsyncComponent, ref, onMounted, onActivated } from 'vue'
import { useRoute } from 'vue-router'
import userStore from '@/store/user'
const SettlementRecord = defineAsyncComponent(() => import("./components/SettlementRecord.vue"))
const SettlementDetail = defineAsyncComponent(() => import("./components/SettlementDetail.vue"))

let tabItem = ref('1')
let username = ref('')
const route = useRoute()
const userData = userStore()

onMounted(() => {
    if (route.query.username && !username.value) {
        username.value = route.query.username
        tabItem.value = userData.isHasPermiss('merchant.dealer.settleList') ? '2' : '1'
    }
})

onActivated(() => {
    if (route.query.username && username.value !== route.query.username) {
        username.value = route.query.username
        tabItem.value = userData.isHasPermiss('merchant.dealer.settleList') ? '2' : '1'
    }
})
</script>

<style lang="scss">
.agent-report {
}
</style>
