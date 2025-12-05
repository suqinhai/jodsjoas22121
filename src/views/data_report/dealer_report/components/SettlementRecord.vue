<template>
    <!-- 经销商报表-经销商结算记录 -->
    <div class="tabs-main settlement-record">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item>
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" value-format="YYYY-MM-DD" :start-placeholder="$t('开始时间')"
                    :end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" :clearable="false" />
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
        </el-form>
        <div class="tips-box">{{$t('数据更新时间：隔天')}}</div>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column prop="reportTime_" :label="$t('结算时间')" min-width="120" align="center" />
            <el-table-column prop="totalCommission" :label="$t('发放佣金')" min-width="140" align="center" />
            <template v-if="dealerMode === 3">
                <el-table-column prop="totalFRSum" :label="$t('首充奖励')" min-width="140" align="center" />
                <el-table-column prop="totalFRExtSum" :label="$t('首充额外奖励')" min-width="140" align="center" />
                <el-table-column prop="totalLevelSum" :label="$t('人数阶梯奖励')" min-width="140" align="center" />
                <el-table-column prop="totalVipSum" :label="$t('VIP晋级奖励')" min-width="140" align="center" />
            </template>
            <template v-if="dealerMode === 2">
                <el-table-column prop="rechargeSum" :label="$t('充值奖励')" min-width="140" align="center" />
            </template>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>
    </div>
</template>

<script setup>
import { reactive, onMounted, computed } from 'vue'
import userStore from '@/store/user'
import { getDealerSettlementRecord } from '@/api/statistics'
import { getShortcuts, getCurrentWeekTime, deepClone, disabledCurrentDateAfter } from '@/common/util'

const shortcuts = getShortcuts()
const state = reactive({
    formData: {},
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    currentWeek: []
})
const userData = userStore()

const dealerMode = computed(() => {
    return userData.siteInfo.dealerMode
})

onMounted(() => {
    state.currentWeek = getCurrentWeekTime()
    state.formData.receiveTime = deepClone(state.currentWeek)
    fetchData()
})

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val) {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {
                receiveTime: deepClone(state.currentWeek)
            }
        }
    }
    let params = { ...state.listQuery }
    let { receiveTime } = state.formData
    if (receiveTime && receiveTime.length) {
        params['interval.begin'] = receiveTime[0]
        params['interval.end'] = receiveTime[1]
    }
    globalVBus.$emit('globalLoading', true)
    getDealerSettlementRecord(params).then(res => {
        let { list, total } = res.data
        state.tableData = list
        state.total = total
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []

        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss" scoped>
.settlement-record {
    ::v-deep(.cell) {
        display: flex;
        align-items: center;
        justify-content: center;
    }
}
</style>
