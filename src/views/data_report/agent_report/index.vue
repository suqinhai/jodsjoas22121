<template>
    <!-- 代理报表-代理结算记录 -->
    <div class="container settlement-record">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item>
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" value-format="YYYY-MM-DD"
                    :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter"
                    :shortcuts="shortcuts" :clearable="false" />
            </el-form-item>
			<el-form-item :label="$t('站点:')">
			    <MerchantSiteSelect isShowAll isNeedDefault :clearable="false" style="width: 200px" v-model="state.formData.merchantId" />
			</el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
        </el-form>
        <div class="tips-box">{{$t('数据更新时间：北京时间2点到4点30分更新')}}</div>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column prop="reportTime_" :label="$t('结算时间')" min-width="160" align="center" />
			<el-table-column prop="merchant.name" :label="$t('站点名称')" min-width="160" align="center" />
            <el-table-column prop="period" :label="$t('结算周期')" min-width="160" align="center" />
			<el-table-column prop="calcCommission" :label="$t('当日发放佣金')" min-width="140" align="center" />
            <el-table-column :label="$t('当日代理业绩')" min-width="140" align="center">
                <template #default="{ row }">
                    <el-dropdown placement="top">
                        <span class="special pointer" v-if="!isSettleList" @click.stop="clickSettlementDetail(row)">{{row.calcValidCoin}}</span>
						<span class="special pointer" v-else>{{row.calcValidCoin}}</span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item v-for="(item,index) in row.gameTypeList" :key="index">
                                    {{item.gameType}}：{{item.calcValidCoin}}</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size"
            v-model:page="state.listQuery._page" @pagination="fetchData"></Pagination>
		<SettlementDetailDialog :itemData="state.itemData" v-if="state.settlementDetailDialogShow" @close="state.settlementDetailDialogShow = false"></SettlementDetailDialog>
    </div>
</template>

<script setup>
import { reactive, onMounted, computed, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import userStore from '@/store/user'
import { getAgentSettlementRecord } from '@/api/statistics'
import { getShortcuts, getCurrentWeekTime, deepClone, disabledCurrentDateAfter } from '@/common/util'
const SettlementDetailDialog = defineAsyncComponent(() => import('./components/SettlementDetailDialog.vue'))

const userData = userStore()
const router = useRouter()
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
	itemData: {},
	settlementDetailDialogShow: false,
})

onMounted(() => {
    state.currentWeek = getCurrentWeekTime()
    state.formData.receiveTime = deepClone(state.currentWeek)
    fetchData()
})

const isSettleList = computed(() => {
    return userData.isHasMenuPermiss('merchant.agent.settleList')
})

const clickSettlementDetail = (row)=>{
	state.itemData = row
	state.settlementDetailDialogShow = true
}

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val) {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {
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
    globalVBus.$emit('globalLoading', true)
    getAgentSettlementRecord(params).then(res => {
        let { list, total } = res.data
        state.tableData = list
        state.total = total
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []

        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss" scoped>
.settlement-record {
    ::v-deep(.cell) {
        display: flex;
        align-items: center;
        justify-content: center;
    }
}
</style>
