<template>
    <!-- 首充留存报表 -->
    <div class="container retention-summary">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item>
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')"
                    :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" value-format="YYYY-MM-DD">
                </el-date-picker>
            </el-form-item>
            <el-form-item :label="$t('站点:')" v-if="commonData.merchantSiteList.length > 1">
                <MerchantSiteSelect isShowAll isNeedDefault :clearable="false" v-model="state.formData.merchantId">
                </MerchantSiteSelect>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
        </el-form>
        <div class="tips-box">{{$t('数据更新时间：北京时间的0点到3点更新')}}</div>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column prop="reportTime_" :label="$t('统计日期')" min-width="120" align="center" />
            <!-- <el-table-column prop="merchant.name" :label="$t('站点名称')" min-width="120" align="center" /> -->
            <el-table-column prop="firstCount" :label="$t('首充人数')" min-width="120" align="center" />
            <el-table-column prop="firstAmount" :label="$t('首充金额')" min-width="120" align="center" />
            <el-table-column :label="$t('2日')" align="center">
                <el-table-column prop="day2RechargeAmount" :label="$t('充值金额')" min-width="100" align="center" />
                <el-table-column prop="day2RechargeRate_" :label="$t('留存率')" min-width="100" align="center" />
                <el-table-column prop="day2Rate_" :label="$t('潜在率')" min-width="100" align="center" />
            </el-table-column>
            <el-table-column :label="$t('3日')" align="center">
                <el-table-column prop="day3RechargeAmount" :label="$t('充值金额')" min-width="100" align="center" />
                <el-table-column prop="day3RechargeRate_" :label="$t('留存率')" min-width="100" align="center" />
                <el-table-column prop="day3Rate_" :label="$t('潜在率')" min-width="100" align="center" />
            </el-table-column>
            <el-table-column :label="$t('5日')" align="center">
                <el-table-column prop="day5RechargeAmount" :label="$t('充值金额')" min-width="100" align="center" />
                <el-table-column prop="day5RechargeRate_" :label="$t('留存率')" min-width="100" align="center" />
                <el-table-column prop="day5Rate_" :label="$t('潜在率')" min-width="100" align="center" />
            </el-table-column>
            <el-table-column :label="$t('7日')" align="center">
                <el-table-column prop="day7RechargeAmount" :label="$t('充值金额')" min-width="100" align="center" />
                <el-table-column prop="day7RechargeRate_" :label="$t('留存率')" min-width="100" align="center" />
                <el-table-column prop="day7Rate_" :label="$t('潜在率')" min-width="100" align="center" />
            </el-table-column>
            <el-table-column :label="$t('15日')" align="center">
                <el-table-column prop="day15RechargeAmount" :label="$t('充值金额')" min-width="100" align="center" />
                <el-table-column prop="day15RechargeRate_" :label="$t('留存率')" min-width="100" align="center" />
                <el-table-column prop="day15Rate_" :label="$t('潜在率')" min-width="100" align="center" />
            </el-table-column>
            <el-table-column :label="$t('30日')" align="center">
                <el-table-column prop="day30RechargeAmount" :label="$t('充值金额')" min-width="100" align="center" />
                <el-table-column prop="day30RechargeRate_" :label="$t('留存率')" min-width="100" align="center" />
                <el-table-column prop="day30Rate_" :label="$t('潜在率')" min-width="100" align="center" />
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>
    </div>
</template>

<script setup name='retentionSummary'>
import { reactive, onMounted, onActivated } from 'vue'
import { useRoute } from 'vue-router'
import commonStore from '@/store/common'
import { getRetentionStatisticsList } from '@/api/statistics'
import { dateFormat, getShortcuts, disabledCurrentDateAfter } from '@/common/util'

let shortcuts = getShortcuts()
const state = reactive({
    formData: {},
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    searchTime: '',
    merchantId: '',
    isInit: true
})
const route = useRoute()
const commonData = commonStore()

onMounted(() => {
    if (commonData.isManual) state.isInit = false
    const { query } = route
    state.merchantId = query.merchantId
    state.searchTime = query.endTime ? [query.startTime, query.endTime] : state.searchTime ? [] : ''
    state.formData = {
        merchantId: state.merchantId ? +state.merchantId : state.formData.merchantId,
        receiveTime: state.searchTime ? state.searchTime : [],
    }
    fetchData()
})

onActivated(() => {
    if (state.isInit) return state.isInit = false
    const { query } = route
    if (state.merchantId !== query.merchantId || ((state.searchTime.length && (state.searchTime[0] !== query.startTime || state.searchTime[1] !== query.endTime)) || (!state.searchTime.length && query.endTime))
    ) {
        state.merchantId = query.merchantId
        state.searchTime = query.endTime ? [query.startTime, query.endTime] : state.searchTime ? [] : ''
        state.formData = {
            merchantId: state.merchantId ? +state.merchantId : state.formData.merchantId,
            receiveTime: state.searchTime ? state.searchTime : [],
        }
        fetchData()
    }
})

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val) {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {
                receiveTime: state.searchTime ? state.searchTime : [],
                merchantId: state.merchantId ? +state.merchantId : commonData.merchantSiteList.length > 1 ? 0 : ''
            }
        }
    }
    let params = { ...state.listQuery, ...state.formData }
    let { receiveTime } = state.formData
    if (receiveTime && receiveTime.length) {
        params['interval.begin'] = receiveTime[0]
        params['interval.end'] = receiveTime[1]
    }
    delete params.receiveTime
    globalVBus.$emit('globalLoading', true)
    getRetentionStatisticsList(params).then(res => {
        let { total, list } = res.data
        state.tableData = list.map(item => {
            item.reportTime && (item.reportTime = dateFormat(item.reportTime, 'yyyy-MM-DD'))
            return item
        })
        state.total = total
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss">
.retention-summary {
}
</style>
