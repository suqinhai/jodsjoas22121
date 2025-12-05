<template>
    <!-- 数据报表-综合数据报表 -->
    <div class="container">
        <el-form class="filter-form" :model="state.formData" inline>
            <el-form-item>
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')"
                    :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" :clearable="false" value-format="YYYY-MM-DD">
                </el-date-picker>
            </el-form-item>
            <el-form-item :label="$t('站点:')">
                <MerchantSiteSelect isShowAll isNeedDefault :clearable="false" style="width: 200px" v-model="state.formData.siteId" />
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('export')">{{$t('导出表格')}}</el-button>
            </el-form-item>
        </el-form>
        <div class="tips-box">{{$t('数据更新时间：实时')}}</div>
        <el-table :data="state.tableData" class="table-box" border :row-class-name="({row,rowIndex}) => (rowIndex === 0 ? 'total-row': '')">
            <el-table-column prop="period_" :label="$t('日期')" width="120" align="center" />
            <el-table-column prop="rechargeAmount" :label="$t('充值金额')" min-width="160" align="center" />
            <el-table-column prop="rechargeUserCount" :label="$t('充值人数')" min-width="100" align="center" />
            <el-table-column prop="cashAmount" :label="$t('提现金额')" min-width="100" align="center" />
            <el-table-column prop="cashUserCount" :label="$t('提现人数')" min-width="100" align="center" />
            <el-table-column prop="newRechargeUserCount" :label="$t('新增首充人数')" min-width="120" align="center" />
            <el-table-column prop="newRechargeAmount" :label="$t('新增首充金额')" min-width="120" align="center" />
            <el-table-column prop="playUserCount" :label="$t('投注人数')" min-width="100" align="center" />
            <el-table-column prop="playAmount" :label="$t('投注金额')" min-width="100" align="center" />
            <el-table-column prop="diff" :label="$t('充提差')" min-width="100" align="center" />
            <el-table-column prop="platformFee" :label="$t('平台费用')" min-width="100" align="center" />
            <el-table-column prop="oldRechargeUserCount" :label="$t('老用户充值人数')" min-width="140" align="center" />
            <el-table-column prop="oldRechargeAmount" :label="$t('老用户充值金额')" min-width="140" align="center" />
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>
    </div>
</template>

<script setup name="synthesisReport">
import { reactive, onMounted } from "vue"
import { useRoute } from 'vue-router'
import { getComprehensive } from '@/api/statistics.js'
import { getShortcuts, getTimeRange, deepClone, disabledCurrentDateAfter } from '@/common/util'

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
})
const route = useRoute()

onMounted(() => {
    const { query = {} } = route
    state.currentTime = query.nowTime ? [query.nowTime, query.nowTime] : getTimeRange()
    state.formData.receiveTime = deepClone(state.currentTime)
    fetchData()
})

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val && val !== 'export') {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {
                siteId: 0,
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
    if (state.formData.siteId === 0) {
        delete params.siteId
    }
    delete params.receiveTime
    if (val === 'export') params.isExport = true
    globalVBus.$emit('globalLoading', true)
    getComprehensive(params).then(({ data = {}, ext = {} }) => {
        if (!params.isExport) {
            let { total, list } = data
            state.tableData = list || []
            if (state.tableData.length) {
                state.tableData.unshift({
                    ...ext,
                    period_: $t('总计'),
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