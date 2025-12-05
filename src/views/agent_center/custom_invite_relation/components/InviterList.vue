<template>
    <!-- 代理中心-邀请人列表 -->
    <div class="container InviterList">
        <el-form class="filter-form" :model="state.searchData" inline>
            <el-form-item>
                <el-date-picker v-model="state.searchData.receiveTime" type="daterange" value-format="YYYY-MM-DD" :start-placeholder="$t('开始时间')"
                    :end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" />
            </el-form-item>
            <el-form-item :label="$t('代理ID:')">
                <el-input v-model="state.searchData.userId" :placeholder="$t('请输入代理ID')" />
            </el-form-item>
            <el-form-item :label="$t('代理账号:')">
                <el-input v-model="state.searchData.username" :placeholder="$t('请输入代理账号')" />
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('export')">{{$t('导出')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table class="table-box" :data="state.tableList" border>
            <el-table-column :label="$t('代理账号')" align="center" min-width="120">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.userId)">
                        {{ row.username }}
                    </span>
                </template>
            </el-table-column>

            <el-table-column :label="$t('代理ID')" align="center" min-width="140">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.userId)">
                        {{ row.userId }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="inviteCode" :label="$t('邀请码')" align="center" min-width="120">
                <template #default="{ row }">
                    {{ row.userId + '_' }}
                </template>
            </el-table-column>
            <el-table-column prop="nextUserCount" :label="$t('直接邀请人数')" align="center" min-width="120" />
            <el-table-column prop="validNextCount" :label="$t('合格人数')" align="center" min-width="120" />
            <el-table-column prop="inviteReward" :label="$t('邀请奖励金额')" align="center" min-width="120" />
            <el-table-column prop="meritReward" :label="$t('成就奖励金额')" align="center" min-width="120" />
            <el-table-column prop="rechargeReward" :label="$t('总充值返佣')" align="center" min-width="120" />
            <el-table-column prop="playReward" :label="$t('总投注返佣')" align="center" min-width="120" />
            <el-table-column prop="totalReward" :label="$t('邀请人总收入')" align="center" min-width="120" />
            <el-table-column prop="firstRechargeCount" :label="$t('直属首充人数')" align="center" min-width="120" />
            <el-table-column prop="firstRechargeAmount" :label="$t('直属首充金额')" align="center" min-width="120" />
            <el-table-column prop="rechargeCount" :label="$t('直属充值人数')" align="center" min-width="120" />
            <el-table-column prop="rechargeAmount" :label="$t('直属总充值')" align="center" min-width="120" />
            <el-table-column prop="cashCount" :label="$t('直属提现人数')" align="center" min-width="120" />
            <el-table-column prop="cashAmount" :label="$t('直属总提现')" align="center" min-width="120" />
            <el-table-column prop="validCoin" :label="$t('直属总投注')" align="center" min-width="120" />
            <el-table-column align="center" min-width="120">
                <template #header>{{$t('直属总奖励')}}
                    <el-tooltip effect="dark" :content="$t('统计直属领取的相关优惠奖励，包括：相关充值、签到、兑换码、救援金，返佣等系统奖励')" placement="top-start">
                        <el-icon class="pointer" :size="15">
                            <QuestionFilled />
                        </el-icon>
                    </el-tooltip>
                </template>
                <template #default="{ row }">
                    {{ row.discountAmount }}
                </template>
            </el-table-column>

            <el-table-column prop="winLoseCoin" :label="$t('直属总盈亏')" align="center" min-width="120" />
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:page="pageConfig._page" v-model:limit="pageConfig._size"
            @pagination="fetchData">
        </Pagination>

    </div>
</template>

<script setup>
import { reactive, onMounted } from "vue";
import { getInviteList } from "@/api/agent.js";
import { getShortcuts, disabledCurrentDateAfter, getCurrentWeekTime, getYesterdayTime, deepClone } from "@/common/util/index"


const shortcuts = getShortcuts()
const pageConfig = reactive({
    _page: 1,
    _size: 10,
})
const state = reactive({
    searchData: {
        userId: '',
        username: ''
    },
    tableList: [],
    total: 0,
    showAddChangeAgentDialog: false,
    currentWeek: '',
})

onMounted(() => {
    state.currentWeek = getYesterdayTime()
    state.searchData.receiveTime = deepClone(state.currentWeek)
    fetchData()
})

// 查看会员详情
const showMemberDetail = (id) => {
    globalVBus.$emit('memberDetailDialog', id)
}

const fetchData = (val = '') => {
    if (val === 'reset') {
        pageConfig._page = 1
        state.searchData = {
            receiveTime: deepClone(state.currentWeek)
        }
    }
    let params = {
        ...state.searchData,
        ...pageConfig,
    }
    let { receiveTime } = state.searchData
    if (receiveTime && receiveTime.length) {
        params['interval.begin'] = receiveTime[0]
        params["interval.end"] = receiveTime[1]
    }
    delete params.receiveTime
    if (val === 'export') params.isExport = true
    globalVBus.$emit('globalLoading', true)
    getInviteList(params).then(res => {
        if (!params.isExport) {
            state.tableList = []
            let { total, list } = res.data
            state.tableList = list || []
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
.InviterList {
    .el-table .total-row > .el-table__cell {
        background-color: #f1ca8c;
    }
}
</style>
