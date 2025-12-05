<template>
    <!-- 首页-平台费用详情 -->
    <div class="dashboard-box" v-loading="state.loading">
        <div class="dashboard-box-title">{{$t('平台费用详情')}}</div>
        <div class="dashboard-box-main">
            <el-form class="filter-form" :model="state.formData" inline>
                <el-form-item>
                    <el-date-picker v-model="state.formData.receiveTime" type="daterange" :start-placeholder="$t('开始时间')"
                        :end-placeholder="$t('结束时间')" :shortcuts="shortcuts" :disabled-date="disabledDate" :clearable="false"
                        value-format="YYYY-MM-DD">
                    </el-date-picker>
                </el-form-item>
                <el-form-item :label="$t('站点:')" v-if="commonData.merchantSiteList.length > 1">
                    <MerchantSiteSelect isShowAll isNeedDefault :clearable="false" v-model="state.formData.id">
                    </MerchantSiteSelect>
                </el-form-item>
                <el-form-item>
                    <div class="search-but" v-throttle @click="handleSearch">
                        <img src="@/assets/img/common/search.png" alt="">
                    </div>
                    <!-- <el-button v-throttle type="primary" @click="handleSearch">{{$t('搜 索')}}</el-button> -->
                </el-form-item>
            </el-form>
            <div class="divider-line"></div>
            <el-table :data="state.tableData" :row-class-name="({row,rowIndex}) => (!rowIndex ? 'total-row': '')">
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
            <div class="divider-line-special"></div>
            <div class="foot">
                <span>{{$t('最多显示10条')}}</span>
                <span v-if="userData.isHasMenuPermiss('merchant.merchant-fee-stat.list')" class="view-more" @click="handleLookMore">{{$t('查看更多')}}
                    <img src="@/assets/img/common/arrows_right.png" alt="">
                </span>
            </div>
        </div>

        <GenerateSiteDialog v-if="state.showGenerateSite" :itemData="state.currentItem" @close="state.showGenerateSite = false">
        </GenerateSiteDialog>
        <CashbackAmountDialog v-if="state.showCashbackAmount" :itemData="state.currentItem" @close="state.showCashbackAmount = false">
        </CashbackAmountDialog>
    </div>
</template>

<script setup>
import { reactive, onMounted, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import commonStore from '@/store/common'
import userStore from '@/store/user'
import { ElMessage } from 'element-plus'
import { getPlatformCostList } from '@/api/dashboard'
import { getShortcuts, getTimeRange, getTimeZoneOffset } from '@/common/util'
const GenerateSiteDialog = defineAsyncComponent(() => import("./components/GenerateSiteDialog.vue"))
const CashbackAmountDialog = defineAsyncComponent(() => import("./components/CashbackAmountDialog.vue"))

const shortcuts = getShortcuts()
const timeZoneOffset = getTimeZoneOffset()
const state = reactive({
    loading: false,
    formData: {},
    searchData: {},
    tableData: [],
    currentItem: {},
    showGenerateSite: false,
    showCashbackAmount: false,
})
const router = useRouter()
const commonData = commonStore()
const userData = userStore()
const disabledDate = (time) => {
    return time.getTime() > Date.now() - 8.64e7 + timeZoneOffset
}

onMounted(() => {
    state.formData.receiveTime = getTimeRange(8, 1)
    handleSearch()
})

// 表格过滤数据处理
const handleSearch = () => {
    let { receiveTime, id } = state.formData
    let params = {
        _page: 1,
        _size: 10,
        id
    }
    if (receiveTime && receiveTime.length) {
        if (new Date(receiveTime[1] + ' 23:23:59').getTime() - new Date(receiveTime[0] + ' 00:00:00').getTime() > 31 * 24 * 60 * 60 * 1000) return ElMessage.warning($t('搜索时间范围不得超过31天！'))
        params['interval.begin'] = receiveTime[0]
        params['interval.end'] = receiveTime[1]
    }
    if (!params.id) delete params.id
    state.loading = true
    getPlatformCostList(params).then(({ data = {}, ext = {} }) => {
        state.tableData = []
        state.tableData = data.list || []
        if (state.tableData.length) {
            state.tableData.unshift({ ...ext, period: $t('汇总') })
        }
        state.searchData = { ...state.formData }
        state.loading = false
    }).catch(err => {
        state.tableData = []
        state.loading = false
    })
}

const handleLookMore = () => {
    let { receiveTime, id } = state.searchData
    let params = `?startTime=${receiveTime && receiveTime.length ? receiveTime[0] : ''}&endTime=${receiveTime && receiveTime.length ? receiveTime[1] : ''}&merchantId=${id}`
    router.push(`/data-report/platform-cost-detail` + params)
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
