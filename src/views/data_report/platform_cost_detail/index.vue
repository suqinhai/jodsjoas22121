<template>
    <!-- 平台费用详情 -->
    <div class="container">
        <el-form class="filter-form" :model="state.formData" inline>
            <el-form-item>
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')"
                    :shortcuts="shortcuts" :disabled-date="disabledDate" :clearable="false" value-format="YYYY-MM-DD">
                </el-date-picker>
            </el-form-item>
            <el-form-item :label="$t('站点:')" v-if="commonData.merchantSiteList.length > 1">
                <MerchantSiteSelect isShowAll isNeedDefault :clearable="false" v-model="state.formData.id">
                </MerchantSiteSelect>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
        </el-form>
        <div class="tips-box">{{$t('数据更新时间：北京时间每天3点更新')}}</div>
        <el-table :data="state.tableData" class="table-box" border :row-class-name="({row,rowIndex}) => (!rowIndex ? 'total-row': '')">
            <el-table-column prop="period" :label="$t('日期')" width="120" align="center" />
            <el-table-column prop="billFee" min-width="160" align="center">
                <template #header>
                    <div>{{$t('账单费用')}}</div>
                    <div>{{ userData.merchantInfo.country === 'UZ' ? $t('（USDT）') : $t('（本地币）') }}</div>
                </template>
            </el-table-column>
            <el-table-column :label="$t('产生站点')" min-width="100" align="center">
                <template #default="{ row, $index }">
                    <span v-if="!$index">{{ row.siteNum }}</span>
                    <span v-else class="special pointer" @click="showInfo(row.period,'showGenerateSite')">
                        {{ row.siteNum }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column min-width="200" align="center">
                <template #header>
                    <div>{{$t('充值金额/人工')}}</div>
                    <div>{{ userData.merchantInfo.country === 'UZ' ? $t('（USDT）') : $t('（本地币）') }}</div>
                </template>
                <template #default="{ row }">
                    {{row.rechargeAmount || 0}}/{{row.offlineAmount || 0}}
                </template>
            </el-table-column>
            <el-table-column prop="activeAmount" min-width="160" align="center">
                <template #header>
                    <div>{{$t('账户余额')}}</div>
                    <div>{{$t('（USDT）')}}</div>
                </template>
            </el-table-column>
            <el-table-column prop="convertGameFee" min-width="140" align="center">
                <template #header>
                    <div>{{$t('游戏抽成')}}</div>
                    <div>{{ userData.merchantInfo.country === 'UZ' ? $t('（USDT）') : $t('（本地币）') }}</div>
                </template>
            </el-table-column>
            <el-table-column prop="giveAmount" min-width="140" align="center">
                <template #header>
                    <div>{{$t('赠送额度')}}</div>
                    <div>{{$t('（USDT）')}}</div>
                </template>
            </el-table-column>
            <el-table-column min-width="140" align="center">
                <template #header>
                    <div>{{$t('返现金额')}}</div>
                    <div>{{$t('（USDT）')}}</div>
                </template>
                <template #default="{ row, $index }">
                    <span v-if="!$index || !row.rebateAmount">0</span>
                    <span v-else class="special pointer" @click="showInfo(row.period,'showCashbackAmount')">
                        {{ row.rebateAmount }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="cdnFee" min-width="120" align="center">
                <template #header>
                    <div>{{$t('CDN费用')}}</div>
                    <div>{{$t('（USDT）')}}</div>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>

        <GenerateSiteDialog v-if="state.showGenerateSite" :itemData="state.currentItem" @close="state.showGenerateSite = false">
        </GenerateSiteDialog>
        <CashbackAmountDialog v-if="state.showCashbackAmount" :itemData="state.currentItem" @close="state.showCashbackAmount = false">
        </CashbackAmountDialog>
    </div>
</template>

<script setup name="platformCostDetail">
import { reactive, onMounted, defineAsyncComponent, onActivated } from 'vue'
import { useRoute } from 'vue-router'
import commonStore from '@/store/common'
import { getPlatformCostList } from '@/api/dashboard'
import { getShortcuts, getTimeZoneOffset, getTimeRange } from '@/common/util'
const GenerateSiteDialog = defineAsyncComponent(() => import("./components/GenerateSiteDialog.vue"))
const CashbackAmountDialog = defineAsyncComponent(() => import("./components/CashbackAmountDialog.vue"))

const shortcuts = getShortcuts()
const timeZoneOffset = getTimeZoneOffset()
const state = reactive({
    formData: {},
    searchData: {},
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    currentItem: {},
    showGenerateSite: false,
    showCashbackAmount: false,
    searchTime: '',
    merchantId: '',
    isInit: true
})
const route = useRoute()
const commonData = commonStore()
const disabledDate = (time) => {
    return time.getTime() > Date.now() - 8.64e7 + timeZoneOffset
}

onMounted(() => {
    if (commonData.isManual) state.isInit = false
    const { query } = route
    state.merchantId = query.merchantId
    state.searchTime = query.endTime ? [query.startTime, query.endTime] : state.searchTime ? [] : ''
    state.formData = {
        id: state.merchantId ? +state.merchantId : state.formData.id,
        receiveTime: state.searchTime ? state.searchTime : getTimeRange(8, 1),
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
            id: state.merchantId ? +state.merchantId : state.formData.id,
            receiveTime: state.searchTime ? state.searchTime : getTimeRange(8, 1),
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
                receiveTime: state.searchTime ? state.searchTime : getTimeRange(8, 1),
                id: state.merchantId ? +state.merchantId : commonData.merchantSiteList.length > 1 ? 0 : ''
            }
        }
    }
    let params = { ...state.listQuery, ...state.formData }
    let { receiveTime } = state.formData
    if (receiveTime && receiveTime.length) {
        params['interval.begin'] = receiveTime[0]
        params['interval.end'] = receiveTime[1]
    }
    if (!params.id) delete params.id
    delete params.receiveTime
    globalVBus.$emit('globalLoading', true)
    getPlatformCostList(params).then(({ data = {}, ext = {} }) => {
        let { total, list } = data
        state.tableData = []
        state.tableData = list || []
        if (state.tableData.length) {
            state.tableData.unshift({ ...ext, period: $t('汇总') })
        }
        state.total = total
        state.searchData = { ...state.formData }
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

const showInfo = (period, key) => {
    state.currentItem = {
        period,
        id: state.searchData.id || ''
    }
    state[key] = true
}
</script>

<style lang="scss">
</style>
