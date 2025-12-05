<template>
    <!-- 财务中心-会员充值配置-充值统计 -->
    <div class="container-main recharge-statistics">
        <div class="head">
            <div>
                <el-date-picker style="margin-right:15px" v-model="state.receiveTime" type="daterange" value-format="YYYY-MM-DD"
                    :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" />
            </div>
            <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            <el-button v-throttle type="primary" style="margin-right:15px" @click="fetchData('export')">{{$t('导出表格')}}</el-button>
        </div>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column prop="date" :label="$t('日期')" min-width="140" align="center" />
            <el-table-column prop="rechargeSum" :label="$t('充值总额')" min-width="180" align="center" />
            <el-table-column prop="successUserNum" :label="$t('成功人数')" min-width="160" align="center" />
            <el-table-column prop="firstUserNum" :label="$t('首充人数/金额')" min-width="220" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="clickDetails('first',row)">{{ row.firstUserNum + '/' +  row.firstAmount}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="threeUserNum" :label="$t('二充人数/金额')" min-width="240" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="clickDetails('two',row)">{{ row.twoUserNum + '/' +  row.twoAmount}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="twoUserNum" :label="$t('三充人数/金额')" min-width="220" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="clickDetails('three',row)">{{ row.threeUserNum + '/' +  row.threeAmount}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="userNum" :label="$t('总充值人数')" min-width="210" align="center" />
            <el-table-column prop="firstUserNum" :label="$t('首充人数')" min-width="180" align="center" />
            <el-table-column prop="firstAmount" :label="$t('首充总额')" min-width="140" align="center" />
            <el-table-column prop="totalNum" :label="$t('充值总订单数')" min-width="250" align="center" />
            <el-table-column prop="successNum" :label="$t('成功充值订单数')" min-width="220" align="center" />
            <el-table-column prop="failNum" :label="$t('失败充值订单数')" min-width="200" align="center" />
            <el-table-column :label="$t('充值成功率')" min-width="180" align="center">
                <template #default="{ row }">
                    <span>{{ row.successRate }}</span>%
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>
        <StatisticalDetailsDialog :type="state.itemData.type" :interval="state.itemData.interval" v-if="state.showDetailDialog"
            @close="state.showDetailDialog = false">
        </StatisticalDetailsDialog>
    </div>
</template>

<script setup>
import { reactive, onMounted, defineAsyncComponent, onActivated } from 'vue'
import { useRoute } from 'vue-router'
import { getRechargeStatisticsList } from '@/api/finance'
import { getShortcuts, disabledCurrentDateAfter } from '@/common/util'
const StatisticalDetailsDialog = defineAsyncComponent(() => import('./components/StatisticalDetailsDialog.vue'))

const shortcuts = getShortcuts()
const state = reactive({
    tableData: [],
    receiveTime: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    itemData: {
        type: '',
        interval: {}
    },
    showDetailDialog: false,
    searchTime: '',
    jumpTime: []
})
const route = useRoute()

onMounted(() => {
    if (+route.query.tab === 3) {
        state.searchTime = route.query.searchTime
        state.jumpTime = route.query.startTime ? [route.query.startTime, route.query.endTime] : []
    }
    state.receiveTime = state.searchTime ? [state.searchTime, state.searchTime] :
        state.jumpTime.length ? [state.jumpTime[0], state.jumpTime[1]] : []
    fetchData()
})

onActivated(() => {
    const { query = {} } = route
    if (+query.tab === 3 && (state.searchTime !== query.searchTime ||
        ((state.jumpTime.length && (state.jumpTime[0] !== query.startTime || state.jumpTime[1] !== query.endTime)) || (!state.jumpTime.length && query.startTime)))) {
        state.searchTime = query.searchTime
        state.jumpTime = query.startTime ? [query.startTime, query.endTime] : []
        state.receiveTime = state.searchTime ? [state.searchTime, state.searchTime] :
            state.jumpTime.length ? [state.jumpTime[0], state.jumpTime[1]] : []
        fetchData('search')
    }
})

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val && val !== 'export') {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.receiveTime = state.searchTime ? [state.searchTime, state.searchTime] :
                state.jumpTime.length ? [state.jumpTime[0], state.jumpTime[1]] : []
        }
    }
    let params = { ...state.listQuery }
    if (state.receiveTime && state.receiveTime.length) {
        params['interval.begin'] = state.receiveTime[0]
        params['interval.end'] = state.receiveTime[1]
    }
    if (val === 'export') params.isExport = true
    globalVBus.$emit('globalLoading', true)
    getRechargeStatisticsList(params).then(res => {
        if (!params.isExport) {
            let { total, list } = res.data
            state.tableData = list
            state.total = total
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        if (!params.isExport) state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

const clickDetails = (type, row) => {
    state.itemData.type = type
    state.itemData.interval.begin = row.date + ' 00:00:00'
    state.itemData.interval.end = row.date + ' 23:59:59.999'
    state.showDetailDialog = true
}

</script>

<style lang="scss" scoped>
.head {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 15px;
}
</style>
