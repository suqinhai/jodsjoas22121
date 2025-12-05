<template>
    <!-- 数据报表-优惠数据报表 -->
    <div class="container">
        <el-form class="filter-form" :model="state.formData" inline>
            <el-form-item>
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')"
                    :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" :clearable="false" value-format="YYYY-MM-DD">
                </el-date-picker>
            </el-form-item>
            <el-form-item :label="$t('站点:')">
                <MerchantSiteSelect isShowAll isNeedDefault :clearable="false" style="width: 200px" v-model="state.formData.merchantId" />
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="state.showDiscountsDialog = true">{{$t('优惠报表说明')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('export')">{{$t('导出表格')}}</el-button>
            </el-form-item>
        </el-form>
        <div class="tips-box">{{ $t('数据更新时间：北京时间的0点到3点更新') }}</div>
        <el-table :data="state.tableData" class="table-box" border :row-class-name="({row,rowIndex}) => (rowIndex === 0 ? 'total-row': '')">
            <el-table-column prop="period_" :label="$t('日期')" width="120" align="center" />
            <el-table-column prop="giftAmount" :label="$t('赠送金额')" min-width="100" align="center" />
            <el-table-column prop="giftUserCount" :label="$t('赠送人数')" min-width="100" align="center" />
            <el-table-column prop="rechargeUserCount" :label="$t('领取后再充值人数')" min-width="100" align="center" />
            <el-table-column prop="rechargeAmount" :label="$t('领取后再充值金额')" min-width="100" align="center" />
            <el-table-column prop="playUserCount" :label="$t('领取优惠投注人数')" min-width="100" align="center" />
            <el-table-column prop="notPlayUserCount" :label="$t('领取优惠未投注人数')" min-width="100" align="center" />
            <el-table-column prop="promotion" :label="$t('活动')" min-width="100" align="center">
                <template #default="{ row, $index }">
                    <span v-if="$index === 0">{{row.promotion}}</span>
                    <span v-else class="special pointer" @click="clickActivity(row)">{{row.promotion}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="task" :label="$t('任务')" min-width="100" align="center" />
            <el-table-column prop="rebate" :label="$t('返水')" min-width="100" align="center" />
            <el-table-column prop="commission" :label="$t('返佣')" min-width="100" align="center" />
            <el-table-column prop="vipReward" :label="$t('vip奖励')" min-width="100" align="center" />
            <el-table-column prop="rechargeDiscount" :label="$t('充值优惠')" min-width="100" align="center" />
            <el-table-column prop="income" :label="$t('余额宝')" min-width="100" align="center" />
            <el-table-column prop="ticket" :label="$t('票券')" min-width="100" align="center" />
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>

        <ActivityDetailDialog :tableData="[state.itemData]" v-if="state.showActivityDetailDialog" @close="state.showActivityDetailDialog = false">
        </ActivityDetailDialog>
        <ExplainDialog v-if="state.showDiscountsDialog" @close="state.showDiscountsDialog = false"></ExplainDialog>
    </div>
</template>

<script setup name="discountsReport">
import { reactive, onMounted, defineAsyncComponent, computed } from "vue"
import { useRoute } from 'vue-router'
import { getPromotionReport } from '@/api/statistics.js'
import { getShortcuts, getTimeRange, deepClone, disabledCurrentDateAfter } from '@/common/util'
const ActivityDetailDialog = defineAsyncComponent(() => import("./components/ActivityDetailDialog.vue"))
const ExplainDialog = defineAsyncComponent(() => import("./components/ExplainDialog.vue"))

let shortcuts = getShortcuts()
const state = reactive({
    tableData: [],
    formData: {},
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    currentTime: [],
    itemData: {},
    showActivityDetailDialog: false,
    showDiscountsDialog: false
})
const route = useRoute()

onMounted(() => {
    const { query = {} } = route
    state.currentTime = query.nowTime ? [query.nowTime, query.nowTime] : getTimeRange()
    state.formData.receiveTime = deepClone(state.currentTime)
    fetchData()
})

const clickActivity = (data) => {
    state.itemData = data
    state.showActivityDetailDialog = true
}

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val && val !== 'export') {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {
                merchantId: 0,
                receiveTime: deepClone(state.currentTime)
            }
        }
    }
    let params = {
        ...state.listQuery,
        ...state.formData
    }
    let { receiveTime } = state.formData
    if (receiveTime && receiveTime.length) {
        params['interval.begin'] = receiveTime[0]
        params['interval.end'] = receiveTime[1]
    }
    delete params.receiveTime
    if (val === 'export') params.isExport = true
    globalVBus.$emit('globalLoading', true)
    getPromotionReport(params).then(({ data = {}, ext = {} }) => {
        if (!params.isExport) {
            let { total, list } = data
            list.forEach((item) => {
                item.merchantId = state.formData.merchantId
            })
            state.tableData = list || []
            if (state.tableData.length) {
                state.tableData.unshift({
                    ...ext,
                    period_: $t('总计')
                })
            }
            state.total = total
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss">
</style>