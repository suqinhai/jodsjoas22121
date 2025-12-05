<template>
    <!-- 日运营报表 -->
    <div class="container daily-operation-report">
        <el-form class="filter-form" :model="state.formData" inline>
            <el-form-item>
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')"
                    :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" :clearable="false" value-format="YYYY-MM-DD">
                </el-date-picker>
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
        <div class="tips-box">{{$t('数据更新时间：北京时间每日0点到3点10分更新')}}</div>
        <el-table :data="state.tableData" class="table-box" border>
            <el-table-column prop="reportTime_" :label="$t('日期')" min-width="120" align="center" />
            <el-table-column :label="$t('存量')" min-width="120" align="center">
                <el-table-column prop="activeAmount" :label="$t('账号余额')" min-width="120" align="center" />
                <el-table-column prop="incomeActiveAmount" :label="$t('存钱宝')" min-width="120" align="center" />
            </el-table-column>
            <el-table-column prop="revisionAmount" :label="$t('人工修正')" min-width="120" align="center">
                <template #default="{ row }">
                    {{ row.revisionAmount || 0}} / {{row.revisionOutAmount || 0}}
                </template>
            </el-table-column>
            <el-table-column prop="incomeFlowAmount" :label="$t('存钱宝转出/入')" min-width="140" align="center">
                <template #default="{ row }">
                    {{ row.incomeOutAmount || 0}} / {{row.incomeInAmount || 0}}
                </template>
            </el-table-column>
            <el-table-column prop="agentUserCount" :label="$t('新增代理')" min-width="120" align="center" />
            <el-table-column :label="$t('会员')" align="center">
                <el-table-column :label="$t('注册')" min-width="120" align="center">
                    <template #default="{ row }">
                        <span class="special pointer" @click="handleJump('/user-manage/all-member?registerTime=' + row.reportTime_)">
                            {{ row.userCount }}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('首充')" min-width="120" align="center">
                    <template #default="{ row }">
                        <span class="special pointer" @click="handleJump('/user-manage/all-member?firstRcTime=' + row.reportTime_)">
                            {{ row.firstRechargeUserCount }}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column prop="firstCashUserCount" :label="$t('首提')" min-width="120" align="center" />
            </el-table-column>
            <el-table-column :label="$t('充提')" align="center">
                <el-table-column :label="$t('充值人数')" min-width="120" align="center">
                    <template #default="{ row }">
                        <span class="special pointer" @click="handleJump('/finance-center/recharge-order-list?successTime=' + row.reportTime_)">
                            {{ row.rechargeUserCount }}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('首充金额')" min-width="120" align="center">
                    <template #default="{ row }">
                        <span class="special pointer" @click="handleJump('/finance-center/recharge-order-list?successTime=' + row.reportTime_)">
                            {{ row.firstRechargeAmount }}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column prop="firstCashAmount" :label="$t('首提金额')" min-width="120" align="center" />
                <el-table-column :label="$t('提现人数')" min-width="120" align="center">
                    <template #default="{ row }">
                        <span class="special pointer" @click="handleJump('/finance-center/withdrawl-order-list?createTime=' + row.reportTime_)">
                            {{ row.cashUserCount }}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('大R玩家')" min-width="120" align="center">
                    <template #default="{ row }">
                        <span class="special pointer" @click="handleJump('/data-report/bigr-player-report?time=' + row.reportTime_)">
                            {{ row.bigUserCount }}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('充值总额')" min-width="120" align="center">
                    <template #default="{ row }">
                        <span class="special pointer" @click="handleJump('/finance-center/recharge-order-list?successTime=' + row.reportTime_)">
                            {{ row.rechargeAmount }}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column prop="onlineRechargeAmount" :label="$t('在线充值')" min-width="120" align="center" />
                <el-table-column prop="supplyRechargeAmount" :label="$t('人工充值')" min-width="120" align="center" />
                <el-table-column prop="cashAmount" :label="$t('提现总额')" min-width="120" align="center">
                    <template #default="{ row }">
                        <span class="special pointer" @click="handleJump('/finance-center/withdrawl-order-list?createTime=' + row.reportTime_)">
                            {{ row.cashAmount }}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column prop="profitDiffAmount" :label="$t('充提差额')" min-width="120" align="center" />
            </el-table-column>
            <el-table-column :label="$t('游戏')" align="center">
                <el-table-column prop="coinUserCount" :label="$t('投注人数')" min-width="120" align="center" />
                <el-table-column prop="validCoin" :label="$t('有效投注')" min-width="120" align="center" />
                <el-table-column :label="$t('杀率')" min-width="120" align="center">
                    <template #default="{ row }">
                        {{ row.coinBetRate || 0}}%
                    </template>
                </el-table-column>
                <el-table-column :label="$t('游戏盈亏')" min-width="120" align="center">
                    <template #default="{ row }">
                        <span style="color: green" v-if="row.winLoseCoin <= 0">{{ row.winLoseCoin }}</span>
                        <span style="color: red" v-if="row.winLoseCoin > 0">{{ row.winLoseCoin }}</span>
                    </template>
                </el-table-column>
            </el-table-column>
            <el-table-column :label="$t('优惠活动')" align="center">
                <el-table-column prop="discountAmount" :label="$t('优惠金额')" min-width="120" align="center" />
                <el-table-column prop="commission" :label="$t('代理佣金')" min-width="120" align="center" />
                <el-table-column prop="dealerAmount" :label="$t('经销商佣金')" min-width="120" align="center" />
                <el-table-column prop="rechargeReward" :label="$t('充值优惠')" min-width="120" align="center" />
                <el-table-column prop="ticketAmount" :label="$t('票券')" min-width="120" align="center" />
                <el-table-column prop="activityAmount" :label="$t('活动')" min-width="120" align="center" />
                <el-table-column prop="taskAmount" :label="$t('任务')" min-width="120" align="center" />
                <el-table-column prop="rebateAmount" :label="$t('返水')" min-width="120" align="center" />
                <el-table-column prop="vipRewardAmount" :label="$t('VIP奖励')" min-width="120" align="center" />
                <!-- <el-table-column prop="rechargeDiscountAmount" :label="$t('充值优惠')" min-width="120" align="center" /> -->
                <el-table-column prop="incomeInterestAmount" :label="$t('存钱宝利息')" min-width="120" align="center" />
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>
    </div>
</template>

<script setup name="dailyOperationReport">
import { reactive, onMounted, onActivated } from "vue"
import { useRouter, useRoute } from 'vue-router'
import commonStore from '@/store/common'
import { getOperateStatisticsList } from '@/api/statistics'
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
    currentWeek: [],
    createTime: '',
    isInit: true,
})
const router = useRouter()
const route = useRoute()
const commonData = commonStore()

onMounted(() => {
    if (commonData.isManual) state.isInit = false
    state.currentWeek = getCurrentWeekTime()
    state.createTime = route.query.createTime
    state.formData = {
        receiveTime: state.createTime ? [state.createTime, state.createTime] : deepClone(state.currentWeek),
    }
    fetchData()
})

onActivated(() => {
    if (state.isInit) return state.isInit = false
    if (state.createTime !== route.query.createTime) {
        state.createTime = route.query.createTime
        state.formData = {
            receiveTime: state.createTime ? [state.createTime, state.createTime] : deepClone(state.currentWeek),
        }
        fetchData('search')
    }
})

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val && val !== 'export') {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {
                receiveTime: state.createTime ? [state.createTime, state.createTime] : deepClone(state.currentWeek),
            }
        }
    }
    let params = { ...state.listQuery }
    let { receiveTime } = state.formData
    if (receiveTime && receiveTime.length) {
        params['interval.begin'] = receiveTime[0]
        params['interval.end'] = receiveTime[1]
    }
    if (val === 'export') params.isExport = true
    globalVBus.$emit('globalLoading', true)
    getOperateStatisticsList(params).then(res => {
        if (!params.isExport) {
            let { total, list } = res.data
            state.tableData = list
            state.total = total
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        if (!params.isExport) state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

const handleJump = (url) => {
    router.push(url)
} 
</script>

<style lang="scss" scoped>
.daily-operation-report {
}
</style>
