<template>
    <!-- 汇率和银行管理-汇率配置 -->
    <el-table :data="state.tableData" border>
        <el-table-column prop="baseCurrency" :label="$t('原币种')" min-width="100" align="center" />
        <el-table-column prop="localCurrency" :label="$t('兑换币种')" min-width="100" align="center" />
        <el-table-column prop="source_" :label="$t('汇率来源')" min-width="100" align="center" />
        <el-table-column :label="$t('市场汇率')" min-width="120" align="center">
            <template #default="{ row }">
                <div v-if="row.baseCurrency !== row.localCurrency">1{{row.baseCurrency}}={{row.rate}}{{row.localCurrency}}
                </div>
            </template>
        </el-table-column>
    </el-table>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { getExchangeRateConfig } from '@/api/finance'

const state = reactive({
    tableData: [],
})

onMounted(() => {
    fetchData()
})

const fetchData = () => {
    globalVBus.$emit('globalLoading', true)
    getExchangeRateConfig().then(res => {
        state.tableData = res.data
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss">
</style>
