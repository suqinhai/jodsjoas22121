<template>
    <!-- 会员详情弹窗-投注统计 -->
    <div class="bet-statistics">
        <el-form class="filter-form" :model="state.searchForm" inline>
            <el-form-item :label="$t('操作时间:')">
                <el-date-picker v-model="state.searchForm.receiveTime" type="daterange" value-format="YYYY-MM-DD" :start-placeholder="$t('开始时间')"
                    :end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" />
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table class="statistics-table" :data="state.gamePlayLogStatList" border
            :row-class-name="({row,rowIndex}) => (rowIndex +1 === state.gamePlayLogStatList.length ? 'total-row': '')">
            <el-table-column prop="vendorGameType" :label="$t('类型')" min-width="120" align="center" />
            <el-table-column prop="count" :label="$t('总注单量')" min-width="120" align="center" />
            <el-table-column prop="inCoinTotal" :label="$t('总投注金额')" min-width="140" align="center" />
            <el-table-column prop="validCoinTotal" :label="$t('总有效投注')" min-width="140" align="center" />
            <el-table-column :label="$t('会员输赢')" min-width="140" align="center">
                <template #default="{ row }">
                    <span :style="{ color: row.winLoseCoinTotal * 1 < 0 ? 'rgb(133,225,132)' : 'red' }">{{ row.winLoseCoinTotal }}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('占单量')" min-width="120" align="center">
                <template #default="{ row }">
                    {{row.accountRatio || 0}}%
                </template>
            </el-table-column>
            <el-table-column :label="$t('获利比')" min-width="140" align="center">
                <template #header>
                    <div>{{$t('获利比')}}</div>
                    <div>{{$t('（输赢/有效投注）')}}</div>
                </template>
                <template #default="{ row }">
                    {{row.profitRatio || 0}}%
                </template>
            </el-table-column>
        </el-table>

        <el-table class="statistics-table" border :data="state.gamePlayLogStatByGame">
            <el-table-column prop="vendor_" :label="$t('平台')" min-width="120" align="center" />
            <el-table-column prop="gameType_" :label="$t('类别')" min-width="120" align="center" />
            <el-table-column prop="gameName" :label="$t('游戏名称')" min-width="120" align="center" />
            <el-table-column prop="count" :label="$t('注单数量')" min-width="120" align="center" />
            <el-table-column prop="inCoinTotal" :label="$t('投注金额')" min-width="120" align="center" />
            <el-table-column prop="validCoinTotal" :label="$t('有效投注')" min-width="120" align="center" />
            <el-table-column :label="$t('会员输赢')" min-width="120" align="center">
                <template #default="{ row }">
                    <span :style="{ color: row.winLoseCoinTotal * 1 < 0 ? 'rgb(133,225,132)' : 'red' }">{{ row.winLoseCoinTotal }}</span>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script setup>
import { reactive, onMounted, inject } from 'vue'
import { getMemberBetLog } from '@/api/member'
import { getShortcuts, disabledCurrentDateAfter } from "@/common/util/index"

let shortcuts = getShortcuts()
const provideData = inject('provideData')
const state = reactive({
    gamePlayLogStatList: [],
    gamePlayLogStatByGame: [],
    searchForm: {}
})

onMounted(() => {
    fetchData()
})

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val === 'reset') {
        state.searchForm.receiveTime = []
    }
    let params = {
        userId: provideData.memberId,
		merchantId: provideData.merchantId,
    }
    let { receiveTime } = state.searchForm
    if (receiveTime && receiveTime.length) {
        params['interval.begin'] = receiveTime[0]
        params['interval.end'] = receiveTime[1]
    }
    provideData.showLoading()
    getMemberBetLog(params).then(({ code, data }) => {
        if (code == 0) {
            let { stat = [], gameStat = [], total } = data
            state.gamePlayLogStatList = stat
            state.gamePlayLogStatByGame = gameStat
            if (state.gamePlayLogStatList.length && total) {
                total.vendorGameType = $t('总计')
                state.gamePlayLogStatList.push(total)
            }
        }
        provideData.hideLoading()
    }).catch(err => {
        state.gamePlayLogStatList = []
        state.gamePlayLogStatByGame = {}
        provideData.hideLoading()
    })
}
</script>

<style lang="scss">
.bet-statistics {
    .statistics-table {
        // flex-shrink: 0;
        margin-bottom: 20px;
    }
}
</style>
