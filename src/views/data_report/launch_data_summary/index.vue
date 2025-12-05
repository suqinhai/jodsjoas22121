<template>
    <!-- 投放数据报表 -->
    <div class="container launch-data-summary">
        <el-form class="filter-form" :model="state.formData" inline>
            <el-form-item>
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')"
                    :shortcuts="shortcuts" :disabled-date="disabledCurrentDateAfter" :clearable="false" value-format="YYYY-MM-DD">
                </el-date-picker>
            </el-form-item>
            <el-form-item :label="$t('站点:')" v-if="commonData.merchantSiteList.length > 1">
                <MerchantSiteSelect isShowAll isNeedDefault :clearable="false" v-model="state.formData.merchantId" @change="siteChange">
                </MerchantSiteSelect>
            </el-form-item>
            <el-form-item :label="$t('渠道:')" v-if="state.formData.merchantId || commonData.merchantSiteList.length < 2">
                <el-select v-model="state.formData.channelId" :placeholder="$t('请选择渠道')" clearable style="min-width: 120px;">
                    <el-option v-for="item in state.channelList" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
        </el-form>
        <div class="tips-box">{{$t('数据更新时间：实时；总计数据为下面查询数据总和，不做去重；ROI计算方式：(累计充值金额-累计提现金额)/消耗金额（注：可存在负数）')}}</div>
        <el-table :data="state.tableData" class="table-box" border :row-class-name="({row,rowIndex}) => (!rowIndex ? 'total-row': '')">
            <el-table-column fixed="left" prop="reportTime_" :label="$t('日期')" width="120" align="center" />
            <el-table-column min-width="180" align="center">
                <template #header>
                    <div>
                        {{$t('消耗金额')}}
                        <el-tooltip effect="dark" :content="userData.merchantInfo.country === 'UZ' ? $t('根据录入的买量成本usdt') : $t('根据录入的买量成本usdt，将换算成本地币计算')" placement="top">
                            <el-icon class="pointer" :size="15">
                                <QuestionFilled />
                            </el-icon>
                        </el-tooltip>
                    </div>
                    <div>{{ userData.merchantInfo.country === 'UZ' ? $t('（USDT）') : $t('（本地币）') }}</div>
                </template>
                <template #default="{ row }">
                    {{ row.channelCost_ }}
                </template>
            </el-table-column>
            <el-table-column prop="userCount" :label="$t('注册人数')" min-width="120" align="center" />
            <el-table-column min-width="200" align="center">
                <template #header>{{$t('当日注册充值人数')}}<el-tooltip effect="dark" :content="$t('当日注册人数且进行充值操作')" placement="top">
                        <el-icon class="pointer" :size="15">
                            <QuestionFilled />
                        </el-icon>
                    </el-tooltip>
                </template>
                <template #default="{ row }">
                    {{ row.rechargeUserCount }}
                </template>
            </el-table-column>
            <el-table-column min-width="200" align="center">
                <template #header>{{$t('新增充值人数')}}<el-tooltip effect="dark" :content="$t('首充人数，非当日注册（比如A用户是昨天注册的，但是没充值，然后今天才充值的，今天就会算一个）')"
                        placement="top">
                        <el-icon class="pointer" :size="15">
                            <QuestionFilled />
                        </el-icon>
                    </el-tooltip>
                </template>
                <template #default="{ row }">
                    {{ row.newRechargeNum }}
                </template>
            </el-table-column>
            <el-table-column min-width="160" align="center">
                <template #header>{{$t('注册成本')}}<el-tooltip effect="dark" :content="$t('消耗金额/当日注册人数（截止到当前时间首充人数）')" placement="top">
                        <el-icon class="pointer" :size="15">
                            <QuestionFilled />
                        </el-icon>
                    </el-tooltip>
                </template>
                <template #default="{ row }">
                    {{ row.regCost }}
                </template>
            </el-table-column>
            <el-table-column min-width="140" align="center">
                <template #header>{{$t('充值成本')}}<el-tooltip effect="dark" :content="$t('消耗金额/充值人数')" placement="top">
                        <el-icon class="pointer" :size="15">
                            <QuestionFilled />
                        </el-icon>
                    </el-tooltip>
                </template>
                <template #default="{ row }">
                    {{ row.rechargeCost }}
                </template>
            </el-table-column>
            <el-table-column prop="totalRechargeAmount_" :label="$t('累计充值金额')" min-width="220" align="center" />
            <el-table-column prop="totalCashAmount_" :label="$t('累计提现金额')" min-width="230" align="center" />
            <el-table-column :label="$t('当日ROI')" min-width="120" align="center">
                <template #default="{ row }">
                    {{ row.reportTime_ === $t('总计') ? '' : row.rechargeRoi }}
                </template>
            </el-table-column>
            <el-table-column :label="$t('3日ROI')" min-width="120" align="center">
                <template #default="{ row }">
                    {{ row.reportTime_ === $t('总计') ? '' : row.recharge3Roi }}
                </template>
            </el-table-column>
            <el-table-column :label="$t('7日ROI')" min-width="120" align="center">
                <template #default="{ row }">
                    {{ row.reportTime_ === $t('总计') ? '' : row.recharge7Roi }}
                </template>
            </el-table-column>
            <el-table-column :label="$t('15日ROI')" min-width="120" align="center">
                <template #default="{ row }">
                    {{ row.reportTime_ === $t('总计') ? '' : row.recharge15Roi }}
                </template>
            </el-table-column>
            <el-table-column :label="$t('30日ROI')" min-width="120" align="center">
                <template #default="{ row }">
                    {{ row.reportTime_ === $t('总计') ? '' : row.recharge30Roi }}
                </template>
            </el-table-column>
            <el-table-column :label="$t('60日ROI')" min-width="120" align="center">
                <template #default="{ row }">
                    {{ row.reportTime_ === $t('总计') ? '' : row.recharge60Roi }}
                </template>
            </el-table-column>
            <el-table-column :label="$t('90日ROI')" min-width="120" align="center">
                <template #default="{ row }">
                    {{ row.reportTime_ === $t('总计') ? '' : row.recharge90Roi }}
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>
    </div>
</template>

<script setup name="launchDataSummary">
import { reactive, onMounted, onActivated } from "vue"
import { useRoute } from "vue-router"
import { ElMessage } from 'element-plus'
import commonStore from '@/store/common'
import { getLaunchDataSummary } from '@/api/statistics'
import { getChannelData } from '@/api/common'
import { disabledCurrentDateAfter, getShortcuts, getTimeRange } from '@/common/util'
import userStore from '@/store/user'

const userData = userStore()
const shortcuts = getShortcuts()
const state = reactive({
    formData: {},
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    channelList: [],
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
        receiveTime: state.searchTime ? state.searchTime : getTimeRange(),
    }
    if (commonData.merchantSiteList.length < 2) {
        siteChange(commonData.currentMerchantSite.id)
    } else if (+state.merchantId) {
        siteChange(state.merchantId)
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
            receiveTime: state.searchTime ? state.searchTime : getTimeRange(),
        }
        if (+state.merchantId) siteChange(state.merchantId)
        fetchData()
    }
})

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val) {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {
                receiveTime: state.searchTime ? state.searchTime : getTimeRange(),
                merchantId: state.merchantId ? +state.merchantId : commonData.merchantSiteList.length > 1 ? 0 : ''
            }
            if (+state.merchantId) siteChange(state.merchantId)
        }
    }
    let params = { ...state.listQuery, ...state.formData }
    let { receiveTime } = state.formData
    if (receiveTime && receiveTime.length) {
        if (new Date(receiveTime[1] + ' 23:23:59').getTime() - new Date(receiveTime[0] + ' 00:00:00').getTime() > 90 * 24 * 60 * 60 * 1000) return ElMessage.warning('搜索时间范围不得超过90天！')
        params['interval.begin'] = receiveTime[0]
        params['interval.end'] = receiveTime[1]
    }
    delete params.receiveTime
    globalVBus.$emit('globalLoading', true)
    getLaunchDataSummary(params).then(({ data = {}, ext = {} }) => {
        let { total, list } = data
        state.tableData = []
        state.tableData = list || []
        if (state.tableData.length) {
            state.tableData.unshift({ ...ext, reportTime_: $t('总计') })
        }
        state.total = total
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

const siteChange = (merchantId) => {
    state.formData.channelId = ''
    state.channelList = []
    if (merchantId) {
        getChannelData({
            merchantId
        }).then(res => {
            state.channelList = res.data || []
        }).catch(err => {
            state.channelList = []
        })
    }
}
</script>

<style lang="scss">
.launch-data-summary {
}
</style>
