<template>
    <!-- 渠道报表 -->
    <div class="container channel-report">
        <el-form class="filter-form" :model="state.formData" inline>
            <el-form-item>
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')"
                    :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" :clearable="false" value-format="YYYY-MM-DD">
                </el-date-picker>
            </el-form-item>
            <el-form-item :label="$t('渠道ID:')">
                <el-input v-model="state.formData.channelId" :placeholder="$t('请输入渠道ID')" />
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('export')">{{$t('导出报表')}}</el-button>
            </el-form-item>
        </el-form>
        <div class="tips-box">{{$t('数据更新时间：实时')}}</div>
        <el-table :data="state.tableData" class="table-box" border :row-class-name="({row}) => (row.isTotal ? 'total-row' : '')">
            <el-table-column prop="reportTime_" :label="$t('统计日期')" min-width="120" align="center" />
            <el-table-column prop="channelId" :label="$t('渠道ID')" min-width="100" align="center" />
            <el-table-column prop="channelName" :label="$t('渠道名称')" min-width="140" align="center" />
            <el-table-column prop="agentUser.name" :label="$t('代理账号')" min-width="140" align="center" />
            <el-table-column prop="userCount" :label="$t('新增会员')" min-width="100" align="center" />
            <el-table-column prop="firstUserCount" :label="$t('首充会员')" min-width="100" align="center" />
            <el-table-column prop="registerRechargeNum" :label="$t('当天注册且充值的人数')" min-width="170" align="center" />
            <el-table-column prop="agentUserCount" :label="$t('新增代理')" min-width="100" align="center" />
            <el-table-column prop="totalUserCount" :label="$t('累计会员')" min-width="100" align="center" />
            <el-table-column prop="rechargeUserCount" :label="$t('充值人数')" min-width="100" align="center" />
            <el-table-column prop="firstRechargeAmount" :label="$t('首充总额')" min-width="120" align="center" />
            <el-table-column prop="rechargeAmount" :label="$t('充值金额')" min-width="120" align="center" />
            <el-table-column prop="cashAmount" :label="$t('提现金额')" min-width="120" align="center" />
            <el-table-column prop="cashUserCount" :label="$t('提现人数')" min-width="100" align="center" />
            <el-table-column prop="validCoin" :label="$t('有效投注')" min-width="120" align="center" />

            <!-- <el-table-column prop="cashAmount" :label="$t('注册设备')" min-width="120" align="center">
                    <template #default="{ row }">
                        <div style="color: red" v-for="(item,index) in row.a" :key="index">{{item.lable}}：{{item.value}}</div>
                    </template>
                </el-table-column> -->
            <el-table-column prop="downloadRate" :label="$t('下载率')" min-width="100" align="center" />
            <el-table-column prop="downloadTimes" :label="$t('下载量')" min-width="100" align="center" />
            <!-- <el-table-column prop="cashAmount" :label="$t('下载量')" min-width="120" align="center">
                    <template #default="{ row }">
                        <div style="color: red" v-for="(item,index) in row.a" :key="index">{{item.lable}}：{{item.value}}</div>
                    </template>
                </el-table-column> -->
            <!--            <el-table-column prop="appOpenTimes" :label="$t('启动量')" min-width="100" align="center" /> -->
            <el-table-column prop="hitTimes" :label="$t('渠道访问量')" min-width="120" align="center" />
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>
    </div>
</template>

<script setup name="channelReport">
import { reactive, onMounted, onActivated } from "vue"
import { useRoute } from 'vue-router'
import commonStore from '@/store/common'
import { getChannelStatisticsData } from '@/api/data_center.js'
import { getShortcuts, getCurrentWeekTime, deepClone, disabledCurrentDateAfter } from '@/common/util'

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
    isInit: true,
})
const route = useRoute()
const commonData = commonStore()

onMounted(() => {
    if (commonData.isManual) state.isInit = false
    const { query = {} } = route
    state.currentTime = query.nowTime ? [query.nowTime, query.nowTime] : getCurrentWeekTime()
    state.formData.receiveTime = deepClone(state.currentTime)
    fetchData()
})

onActivated(() => {
    if (state.isInit) return state.isInit = false
    const { query = {} } = route
    if ((!state.currentTime.length || (state.currentTime.length && state.currentTime[0] !== query.nowTime))) {
        state.currentTime = query.nowTime ? [query.nowTime, query.nowTime] : getCurrentWeekTime()
        state.formData.receiveTime = deepClone(state.currentTime)
        fetchData()
    }
})

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val && val !== 'export') {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {
                receiveTime: deepClone(state.currentTime)
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
    if (val === 'export') params.isExport = true
    globalVBus.$emit('globalLoading', true)
    getChannelStatisticsData(params).then(({ data = {}, ext = {} }) => {
        if (!params.isExport) {
            let { total, list } = data
            state.tableData = []
            state.tableData = list || []
            if (state.tableData.length) {
                state.tableData.unshift({ ...ext, reportTime_: $t('合计'), isTotal: true })
            }
            state.total = total
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        if (!params.isExport) state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss">
.channel-report {
}
</style>
