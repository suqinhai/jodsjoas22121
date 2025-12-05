<template>
    <!-- 运营中心-活动风险配置-->
    <div class="container notification-push">
        <el-tabs v-model="activeTab">
            <el-tab-pane v-for="(item,index) in tabData" :key="index" :label="item.title" :name="item.value">
            </el-tab-pane>
        </el-tabs>
        <FailureRecordDistribution v-if="activeTab === 2"></FailureRecordDistribution>
        <OperationRiskSet v-if="activeTab === 1"></OperationRiskSet>
    </div>
</template>

<script setup name="operationRiskSet">
import { defineAsyncComponent, ref } from 'vue'
import userStore from '@/store/user'
const FailureRecordDistribution = defineAsyncComponent(() => import("./failure_record_distribution.vue"))
const OperationRiskSet = defineAsyncComponent(() => import("./operation_risk_set.vue"))

const tabData = ref([
    { title: $t('运营风险设置'), value: 1 },
    { title: $t('发放失败记录'), value: 2 },
])
const activeTab = ref(1)
const userData = userStore()
</script>

<style lang="scss">
.notification-push {
}
</style>
