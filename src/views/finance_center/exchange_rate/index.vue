<template>
    <!-- 汇率和银行管理 -->
    <div class="container exchange-rate">
        <el-tabs v-model="type">
            <el-tab-pane :label="$t('汇率配置')" :name="1">
                <ExchangeRateDeploy></ExchangeRateDeploy>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script setup name="exchangeRate">
import { ref } from 'vue'
import ExchangeRateDeploy from './components/ExchangeRateDeploy.vue'

const type = ref(1)
</script>

<style lang="scss">
.exchange-rate {
}
</style>
