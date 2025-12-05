<template>
    <!-- 首页-新增数据详情 -->
    <div class="dashboard-box" v-loading="state.loading">
        <div class="dashboard-box-title">{{$t('新增数据详情')}}</div>
        <div class="dashboard-box-main">
            <el-form class="filter-form" :model="state.formData" inline>
                <el-form-item>
                    <el-date-picker v-model="state.formData.receiveTime" type="daterange" :start-placeholder="$t('开始时间')"
                        :end-placeholder="$t('结束时间')" :shortcuts="shortcuts" :disabled-date="disabledCurrentDateAfter" :clearable="false"
                        value-format="YYYY-MM-DD">
                    </el-date-picker>
                </el-form-item>
                <el-form-item :label="$t('站点:')" v-if="commonData.merchantSiteList.length > 1">
                    <MerchantSiteSelect isShowAll isNeedDefault :clearable="false" v-model="state.formData.siteId">
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
            <div class="divider-line-special"></div>
            <div class="foot">
                <span>{{$t('最多显示10条')}}</span>
                <span v-if="userData.isHasMenuPermiss('merchant.report.addDataStat')" class="view-more" @click="handleLookMore">{{$t('查看更多')}}
                    <img src="@/assets/img/common/arrows_right.png" alt="">
                </span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import commonStore from '@/store/common'
import userStore from '@/store/user'
import { ElMessage } from 'element-plus'
import { getAddDataStatList } from '@/api/dashboard'
import { getShortcuts, disabledCurrentDateAfter, getTimeRange } from '@/common/util'

const shortcuts = getShortcuts()
const state = reactive({
    loading: false,
    formData: {},
    searchData: {},
    tableData: [],
})
const router = useRouter()
const commonData = commonStore()
const userData = userStore()

onMounted(() => {
    state.formData.receiveTime = getTimeRange(7, 0)
    handleSearch()
})

// 表格过滤数据处理
const handleSearch = () => {
    let { receiveTime, siteId } = state.formData
    let params = {
        _page: 1,
        _size: 10,
        siteId
    }
    if (receiveTime && receiveTime.length) {
        if (new Date(receiveTime[1] + ' 23:23:59').getTime() - new Date(receiveTime[0] + ' 00:00:00').getTime() > 31 * 24 * 60 * 60 * 1000) return ElMessage.warning($t('搜索时间范围不得超过31天！'))
        params['interval.begin'] = receiveTime[0]
        params['interval.end'] = receiveTime[1]
    }
    if (!params.siteId) delete params.siteId
    state.loading = true
    getAddDataStatList(params).then(({ data = {}, ext = {} }) => {
        state.tableData = []
        state.tableData = data.list || []
        if (state.tableData.length) {
            state.tableData.unshift({ ...ext, period_: $t('汇总') })
        }
        state.searchData = { ...state.formData }
        state.loading = false
    }).catch(err => {
        state.tableData = []
        state.loading = false
    })
}

const handleLookMore = () => {
    let { receiveTime, siteId } = state.searchData
    let params = `?startTime=${receiveTime && receiveTime.length ? receiveTime[0] : ''}&endTime=${receiveTime && receiveTime.length ? receiveTime[1] : ''}&merchantId=${siteId}`
    router.push(`/data-report/newly-added-data-report` + params)
}
</script>

<style lang="scss">
</style>
