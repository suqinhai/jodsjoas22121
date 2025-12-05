<template>
    <!-- 经销商报表-经销商结算明细 -->
    <div class="tabs-main settlement-detail">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item>
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" value-format="YYYY-MM-DD" :start-placeholder="$t('开始时间')"
                    :end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" :clearable="false" />
            </el-form-item>
            <el-form-item :label="$t('经销商ID:')">
                <el-input v-model="state.formData.userId" :placeholder="$t('请输入经销商ID')" />
            </el-form-item>
            <el-form-item :label="$t('经销商账号:')">
                <el-input v-model="state.formData.username" :placeholder="$t('请输入经销商账号')" />
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
        <div class="tips-box">{{$t('数据更新时间：隔天')}}</div>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column prop="reportTime_" :label="$t('统计时间')" min-width="120" align="center" />
            <el-table-column :label="$t('经销商ID')" min-width="120" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.userId)">{{row.userId || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('经销商账号')" min-width="140" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.userId)">{{row.user?.name || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('上级经销商ID')" min-width="120" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.inviteUser.id)">{{row.inviteUser?.id || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('上级经销商账号')" min-width="140" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.inviteUser.id)">{{row.inviteUser?.name || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="dealerLevel" :label="$t('经销商等级')" min-width="120" align="center" />
            <el-table-column prop="totalUserCount" :label="$t('总人数')" min-width="120" align="center" />
            <el-table-column prop="userCount" :label="$t('经销商人数')" min-width="120" align="center" />
            <el-table-column prop="memberCount" :label="$t('直属人数')" min-width="120" align="center" />
            <el-table-column prop="totalCommission" :label="$t('总佣金')" min-width="120" align="center" />
            <template v-if="dealerMode === 3">
                <el-table-column prop="totalFRSum" :label="$t('首充奖励')" min-width="120" align="center" />
                <el-table-column prop="totalFRExtSum" :label="$t('首充额外奖励')" min-width="140" align="center" />
                <el-table-column prop="totalLevelSum" :label="$t('人数阶梯奖励')" min-width="140" align="center" />
                <el-table-column prop="totalVipSum" :label="$t('VIP奖励')" min-width="120" align="center" />
            </template>
            <template v-if="dealerMode === 2">
                <el-table-column prop="nextTotalCommission" :label="$t('直属佣金')" min-width="120" align="center" />
                <el-table-column prop="rechargeSum" :label="$t('总充值金额')" min-width="120" align="center" />
                <el-table-column prop="nextRechargeSum" :label="$t('直属总充值金额')" min-width="140" align="center" />
            </template>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>
    </div>
</template>

<script setup name="agentReceiveRecord">
import { reactive, onMounted, onActivated, computed } from 'vue'
import { useRoute } from 'vue-router'
import userStore from '@/store/user'
import commonStore from '@/store/common'
import { getDealerSettlementDetail } from '@/api/statistics'
import { getShortcuts, getCurrentWeekTime, deepClone, disabledCurrentDateAfter } from '@/common/util'

const shortcuts = getShortcuts()
const state = reactive({
    formData: {},
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    currentWeek: [],
    username: '',
    isInit: true,
})
const route = useRoute()
const userData = userStore()
const commonData = commonStore()

const dealerMode = computed(() => {
    return userData.siteInfo.dealerMode
})

onMounted(() => {
    if (commonData.isManual) state.isInit = false
    state.currentWeek = getCurrentWeekTime()
    state.username = route.query.username
    state.formData.username = state.username
    state.formData.receiveTime = deepClone(state.currentWeek)
    fetchData()
})

onActivated(() => {
    if (state.isInit) return state.isInit = false
    if (state.username !== route.query.username) {
        state.username = route.query.username
        state.formData = {
            username: state.username,
            receiveTime: deepClone(state.currentWeek)
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
                username: state.username,
                receiveTime: deepClone(state.currentWeek)
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
    getDealerSettlementDetail(params).then(res => {
        if (!params.isExport) {
            let { list, total } = res.data
            state.tableData = list
            state.total = total
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        if (!params.isExport) state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

// 查看会员详情
const showMemberDetail = (id) => {
    globalVBus.$emit('memberDetailDialog', id)
}
</script>

<style lang="scss" scoped>
.settlement-detail {
    ::v-deep(.cell) {
        display: flex;
        align-items: center;
        justify-content: center;
    }
}
</style>
