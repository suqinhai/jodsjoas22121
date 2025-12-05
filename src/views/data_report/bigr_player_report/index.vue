<template>
    <!-- 大R玩家报表 -->
    <div class="container bigr-player-report">
        <el-form class="filter-form" :model="state.formData" inline>
            <el-form-item>
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" value-format="YYYY-MM-DD" :start-placeholder="$t('开始时间')"
                    :end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" :clearable="false">
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
        <div class="tips-box">{{$t('数据更新时间：北京时间每日0点到3点15分更新')}}</div>
        <el-table :data="state.tableData" class="table-box" border>
            <el-table-column prop="reportTime_" :label="$t('日期')" min-width="100" align="center" />
            <el-table-column :label="$t('小R玩家')" align="center">
                <el-table-column :label="$t('总人数')" min-width="130" align="center">
                    <template #default="{ row }">
                        <span class="special pointer" @click="handleInfo(row,1)">
                            {{ row.stat.userCount }}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column prop="stat.rechargeAmount" :label="$t('当日充值总金额')" min-width="130" align="center" />
                <el-table-column prop="stat.cashAmount" :label="$t('当日提现总金额')" min-width="130" align="center" />
            </el-table-column>
            <el-table-column :label="$t('中R玩家')" align="center">
                <el-table-column :label="$t('总人数')" min-width="130" align="center">
                    <template #default="{ row }">
                        <span class="special pointer" @click="handleInfo(row,2)">
                            {{ row.stat1.userCount }}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column prop="stat1.rechargeAmount" :label="$t('当日充值总金额')" min-width="130" align="center" />
                <el-table-column prop="stat1.cashAmount" :label="$t('当日提现总金额')" min-width="130" align="center" />
            </el-table-column>
            <el-table-column :label="$t('大R玩家')" align="center">
                <el-table-column :label="$t('总人数')" min-width="130" align="center">
                    <template #default="{ row }">
                        <span class="special pointer" @click="handleInfo(row,3)">
                            {{ row.stat2.userCount }}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column prop="stat2.rechargeAmount" :label="$t('当日充值总金额')" min-width="130" align="center" />
                <el-table-column prop="stat2.cashAmount" :label="$t('当日提现总金额')" min-width="130" align="center" />
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>

        <PlayerDetailDialog v-if="state.playerDetailShow" :itemData="state.itemData" @close="state.playerDetailShow = false"
            @showMemberDetail="showMemberDetail">
        </PlayerDetailDialog>
    </div>
</template>

<script setup name='bigRPlayerReport'>
import { reactive, onMounted, defineAsyncComponent, onActivated } from "vue"
import { useRoute } from 'vue-router'
import userStore from '@/store/user'
import commonStore from '@/store/common'
import { getPlayerStatisticsList } from '@/api/statistics'
import { getShortcuts, getCurrentWeekTime, deepClone, disabledCurrentDateAfter } from '@/common/util'
const PlayerDetailDialog = defineAsyncComponent(() => import('./components/PlayerDetailDialog.vue'))

const shortcuts = getShortcuts()
const state = reactive({
    tableData: [],
    formData: {},
    itemData: {},
    playerDetailShow: false,
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    currentWeek: [],
    time: '',
    isInit: true,
})
const route = useRoute()
const userData = userStore()
const commonData = commonStore()

onMounted(() => {
    if (commonData.isManual) state.isInit = false
    const { query = {} } = route
    state.currentWeek = getCurrentWeekTime()
    state.time = query.time
    state.formData.receiveTime = state.time ? [state.time, state.time] : deepClone(state.currentWeek)
    fetchData()
})

onActivated(() => {
    if (state.isInit) return state.isInit = false
    const { query = {} } = route
    if (state.time !== query.time) {
        state.currentWeek = getCurrentWeekTime()
        state.time = query.time
        state.formData = {
            receiveTime: state.time ? [state.time, state.time] : deepClone(state.currentWeek)
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
                receiveTime: state.time ? [state.time, state.time] : deepClone(state.currentWeek)
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
    getPlayerStatisticsList(params).then(res => {
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

const handleInfo = (row, type) => {
    if (!userData.isHasPermiss('merchant.report.userRechargeLevelDetails')) return
    state.itemData = { ...row }
    state.itemData.dialogType = type
    state.playerDetailShow = true
}

// 查看会员详情
const showMemberDetail = (id) => {
    globalVBus.$emit('memberDetailDialog', id)
}
</script>

<style lang="scss" scoped>
.bigr-player-report {
}
</style>
