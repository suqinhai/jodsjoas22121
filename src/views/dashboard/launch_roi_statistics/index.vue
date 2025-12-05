<template>
    <!-- 首页-投放ROI统计 -->
    <div class="dashboard-box" v-loading="state.loading">
        <div class="dashboard-box-title">{{$t('投放ROI统计')}}</div>
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
                <el-table-column prop="channelCost_" :label="$t('消耗金额')" min-width="120" align="center">
					<template #header>
						<div>
							{{$t('消耗金额')}}
							<el-tooltip effect="dark" :content="userData.merchantInfo.country === 'UZ' ? 
                            $t('根据录入的买量成本usdt') : $t('根据录入的买量成本usdt，将换算成本地币计算')" placement="top">
							    <el-icon class="pointer" :size="15">
							        <QuestionFilled />
							    </el-icon>
							</el-tooltip>
						</div>
						<div>{{ userData.merchantInfo.country === 'UZ' ? $t('（USDT）') : $t('（本地币）') }}</div>
					</template>
				</el-table-column>
                <el-table-column prop="difference" :label="$t('充提差')" min-width="120" align="center">
					<template #header>
						<div>{{$t('充提差')}}</div>
					</template>
				</el-table-column>
                <el-table-column prop="rechargeRoi" :label="$t('当日ROI')" min-width="120" align="center" />
                <el-table-column prop="recharge3Roi" :label="$t('3日ROI')" min-width="120" align="center" />
                <el-table-column prop="recharge7Roi" :label="$t('7日ROI')" min-width="120" align="center" />
                <el-table-column prop="recharge15Roi" :label="$t('15日ROI')" min-width="120" align="center" />
                <el-table-column prop="recharge30Roi" :label="$t('30日ROI')" min-width="120" align="center" />
                <el-table-column prop="recharge60Roi" :label="$t('60日ROI')" min-width="120" align="center" />
                <el-table-column prop="recharge90Roi" :label="$t('90日ROI')" min-width="120" align="center" />
            </el-table>
            <div class="divider-line-special"></div>
            <div class="foot">
                <span>{{$t('最多显示10条')}}</span>
                <span v-if="userData.isHasMenuPermiss('merchant.channel.roiDailyStatList')" class="view-more" @click="handleLookMore">{{$t('查看更多')}}
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
import { getLaunchDataSummary } from '@/api/statistics'
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
        tab: 1
    }
    if (receiveTime && receiveTime.length) {
        params['interval.begin'] = receiveTime[0]
        params['interval.end'] = receiveTime[1]
    }
    state.loading = true
    getLaunchDataSummary(params).then(({ data = {} }) => {
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
    router.push(`data-report/launch-data-summary` + params)
}
</script>

<style lang="scss">
</style>
