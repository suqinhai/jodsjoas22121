<template>
    <!-- 新增数据报表 -->
    <div class="container">
        <el-form class="filter-form" :model="state.formData" inline>
            <el-form-item>
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')"
                    :shortcuts="shortcuts" :disabled-date="disabledCurrentDateAfter" :clearable="false" value-format="YYYY-MM-DD">
                </el-date-picker>
            </el-form-item>
            <el-form-item :label="$t('站点:')" v-if="commonData.merchantSiteList.length > 1">
                <MerchantSiteSelect isShowAll isNeedDefault :clearable="false" v-model="state.formData.siteId">
                </MerchantSiteSelect>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
        </el-form>
        <div class="tips-box">{{$t('数据更新时间：北京时间每日0点到3点更新')}}</div>
        <el-table :data="state.tableData" class="table-box" border :row-class-name="({row,rowIndex}) => (!rowIndex ? 'total-row': '')">
            <el-table-column prop="period_" :label="$t('日期')" width="120" align="center" />
            <el-table-column prop="registerNum" :label="$t('新增注册')" min-width="120" align="center" />
            <el-table-column prop="firstRechargeNum" :label="$t('首充会员')" min-width="120" align="center" />
            <el-table-column prop="playUserCount" :label="$t('投注人数')" min-width="120" align="center" />
            <el-table-column prop="rechargeAmount" :label="$t('充值金额')" min-width="120" align="center" />
            <el-table-column prop="firstRechargeAmount" :label="$t('首充金额')" min-width="120" align="center" />
            <el-table-column prop="advertCost" min-width="120" align="center">
                <template #header>
                    <div>{{$t('广告投入')}}</div>
                    <div>{{$t('（USDT）')}}</div>
                </template>
            </el-table-column>
            <el-table-column prop="diff" :label="$t('充提差')" min-width="120" align="center" />
            <el-table-column prop="cashAmount" :label="$t('提现金额')" min-width="120" align="center" />
            <el-table-column prop="profit" min-width="120" align="center">
                <template #header>
                    <div>{{$t('毛利营收')}}</div>
                    <div>{{$t('（USDT）')}}</div>
                </template>
            </el-table-column>
            <el-table-column prop="commission" :label="$t('佣金派送')" min-width="120" align="center" />
            <el-table-column prop="siteNum" :label="$t('站点新增')" min-width="120" align="center" />
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>
    </div>
</template>

<script setup name="newlyAddedDataReport">
import { reactive, onMounted, onActivated } from 'vue'
import { useRoute } from "vue-router"
import commonStore from '@/store/common'
import { getAddDataStatList } from '@/api/dashboard'
import { getShortcuts, disabledCurrentDateAfter, getTimeRange } from '@/common/util'

const shortcuts = getShortcuts()
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
        siteId: state.merchantId ? +state.merchantId : state.formData.siteId,
        receiveTime: state.searchTime ? state.searchTime : getTimeRange(7, 0),
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
            siteId: state.merchantId ? +state.merchantId : state.formData.siteId,
            receiveTime: state.searchTime ? state.searchTime : getTimeRange(7, 0),
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
                receiveTime: state.searchTime ? state.searchTime : getTimeRange(7, 0),
                siteId: state.merchantId ? +state.merchantId : commonData.merchantSiteList.length > 1 ? state.formData.siteId : ''
            }
        }
    }
    let params = { ...state.listQuery, ...state.formData }
    let { receiveTime } = state.formData
    if (receiveTime && receiveTime.length) {
        params['interval.begin'] = receiveTime[0]
        params['interval.end'] = receiveTime[1]
    }
    if (!params.siteId) delete params.siteId
    delete params.receiveTime
    globalVBus.$emit('globalLoading', true)
    getAddDataStatList(params).then(({ data = {}, ext = {} }) => {
        let { total, list } = data
        state.tableData = []
        state.tableData = list || []
        if (state.tableData.length) {
            state.tableData.unshift({ ...ext, period_: $t('汇总') })
        }
        state.total = total
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss">
</style>
