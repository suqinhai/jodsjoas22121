<template>
    <!-- 首页-财务数据汇总 -->
    <div class="dashboard-box" v-loading="state.loading">
        <div class="dashboard-box-title">{{$t('财务数据汇总')}}</div>
        <div class="dashboard-box-main">
            <div class="divider-line"></div>
            <el-table :data="state.tableData" style="width: 1000px">
                <el-table-column v-for="(item,index) in Object.keys(keyData)" :key="index" :prop="item" :label="keyData[item]" width="200"
                    align="center">
					<template #header>
						<div>{{keyData[item]}}</div>
						<div>{{$t('（USDT）')}}</div>
					</template>
				</el-table-column>
            </el-table>
            <div class="divider-line-special"></div>
        </div>
    </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { getFeeStat } from '@/api/operation'

const keyData = {
    'adFee': $t('广告消耗'),
    'manpowerFee': $t('人力成本'),
    'platformFee': $t('平台费用'),
    'otherFee': $t('其他费用'),
    'netProfit': $t('净利润'),
}
const state = reactive({
    loading: false,
    tableData: [],
})

onMounted(() => {
    handleSearch()
})

// 表格过滤数据处理
const handleSearch = () => {
    state.loading = true
    getFeeStat().then(({ data }) => {
        if (data) {
            let obj = {}
            Object.keys(keyData).forEach(item => {
                obj[item] = data[item] || 0
            })
            state.tableData.push(obj)
        } else {
            state.tableData = []
        }
        state.loading = false
    }).catch(err => {
        state.tableData = []
        state.loading = false
    })
}
</script>

<style lang="scss">
</style>
