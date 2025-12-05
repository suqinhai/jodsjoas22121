<template>
    <!-- 首页-首充留存统计 -->
    <div class="dashboard-box" v-loading="state.loading">
        <div class="dashboard-box-title">{{$t('首充留存统计')}}</div>
        <div class="dashboard-box-main">
            <el-form class="filter-form" :model="state.formData" inline>
                <el-form-item>
                    <el-date-picker v-model="state.formData.receiveTime" type="daterange" :start-placeholder="$t('开始时间')"
                        :end-placeholder="$t('结束时间')" :shortcuts="shortcuts" :disabled-date="disabledCurrentDateAfter" :clearable="false"
                        value-format="YYYY-MM-DD">
                    </el-date-picker>
                </el-form-item>
                <el-form-item :label="$t('站点:')" v-if="commonData.merchantSiteList.length > 1">
                    <MerchantSiteSelect isShowAll isNeedDefault :clearable="false" v-model="state.formData.merchantId">
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
            <el-table :data="state.tableData">
                <el-table-column prop="reportTime_" :label="$t('日期')" width="120" align="center" />
                <el-table-column prop="firstCount" :label="$t('首充人数')" min-width="120" align="center" />
                <el-table-column prop="day2RechargeRate_" :label="$t('次日留存')" min-width="120" align="center" />
                <el-table-column prop="day3RechargeRate_" :label="$t('3日留存')" min-width="120" align="center" />
                <el-table-column prop="day5RechargeRate_" :label="$t('5日留存')" min-width="120" align="center" />
                <el-table-column prop="day7RechargeRate_" :label="$t('7日留存')" min-width="120" align="center" />
                <el-table-column prop="day15RechargeRate_" :label="$t('15日留存')" min-width="120" align="center" />
                <el-table-column prop="day30RechargeRate_" :label="$t('30日留存')" min-width="120" align="center" />
            </el-table>
            <div class="divider-line-special"></div>
            <div class="foot">
                <span>{{$t('最多显示10条')}}</span>
                <span v-if="userData.isHasMenuPermiss('merchant.report.rechargeRetentionList')" class="view-more"
                    @click="handleLookMore">{{$t('查看更多')}}
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
import { getHomeStatData } from '@/api/dashboard'
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
    let { receiveTime, merchantId } = state.formData
    let params = {
        _page: 1,
        _size: 10,
        merchantId,
        tab: 3
    }
    if (receiveTime && receiveTime.length) {
        if (new Date(receiveTime[1] + ' 23:23:59').getTime() - new Date(receiveTime[0] + ' 00:00:00').getTime() > 31 * 24 * 60 * 60 * 1000) return ElMessage.warning($t('搜索时间范围不得超过31天！'))
        params['interval.begin'] = receiveTime[0]
        params['interval.end'] = receiveTime[1]
    }
    state.loading = true
    getHomeStatData(params).then(({ data = {} }) => {
        state.tableData = data.list || []
        state.searchData = { ...state.formData }
        state.loading = false
    }).catch(err => {
        state.tableData = []
        state.loading = false
    })
}

const handleLookMore = () => {
    let { receiveTime, merchantId } = state.searchData
    let params = `?startTime=${receiveTime && receiveTime.length ? receiveTime[0] : ''}&endTime=${receiveTime && receiveTime.length ? receiveTime[1] : ''}&merchantId=${merchantId}`
    router.push(`/data-report/retention-summary` + params)
}
</script>

<style lang="scss">
</style>
