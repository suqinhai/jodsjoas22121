<template>
    <!-- 代理报表-代理结算明细 -->
	<Dialog ref="dialog" width="1200" :title="$t('代理结算明细')" top="6vh" @cancel="emits('close')" :isShowSubmit="false">
		<div class="tabs-main settlement-detail">
			<el-form class="filter-form" inline :model="state.formData">
				<el-form-item>
					<el-date-picker v-model="state.formData.receiveTime" type="daterange" value-format="YYYY-MM-DD" :start-placeholder="$t('开始时间')"
						:end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" :clearable="false" />
				</el-form-item>
				<el-form-item :label="$t('站点:')">
					<MerchantSiteSelect isShowAll isNeedDefault :clearable="false" style="width: 200px" v-model="state.formData.merchantId" />
				</el-form-item>
				<el-form-item :label="$t('代理账号:')" v-if="state.formData.merchantId || commonData.merchantSiteList.length < 2">
					<el-input v-model="state.formData.username" :placeholder="$t('请输入代理账号')" />
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
			<div class="tips-box">{{$t('数据更新时间：北京时间2点到4点30分更新')}}</div>
			<el-table class="table-box" :data="state.tableData" border>
				<el-table-column prop="userId" :label="$t('代理ID')" min-width="100" align="center" />
				<el-table-column prop="username" :label="$t('代理账号')" min-width="140" align="center" />
				<el-table-column prop="agentUsername" :label="$t('上级代理')" min-width="140" align="center" />
				<el-table-column prop="agentLevel" :label="$t('代理等级')" min-width="100" align="center" />
				<el-table-column prop="userSource_" :label="$t('注册来源')" min-width="100" align="center" />
				<el-table-column prop="allMemberUserCount" :label="$t('总人数')" min-width="120" align="center" />
				<el-table-column prop="nextUserCount" :label="$t('直属人数')" min-width="120" align="center" />
				<el-table-column prop="otherUserCount" :label="$t('其他人数')" min-width="120" align="center" />
				<el-table-column prop="allTotalCoin" :label="$t('总业绩')" min-width="120" align="center" />
				<el-table-column :label="$t('业绩')" min-width="120" align="center">
					<template #default="{ row }">
						<el-dropdown placement="top">
							<span class="special pointer">{{row.totalCoin}}</span>
							<template #dropdown>
								<el-dropdown-menu>
									<el-dropdown-item v-for="(item,index) in row.gameTypeList" :key="index">
										{{item.gameType}}：{{item.totalCoin}}</el-dropdown-item>
								</el-dropdown-menu>
							</template>
						</el-dropdown>
					</template>
				</el-table-column>
				<el-table-column prop="nextTotalCoin" :label="$t('直属业绩')" min-width="120" align="center" />
				<el-table-column prop="otherTotalCoin" :label="$t('其他业绩')" min-width="120" align="center" />
				<el-table-column prop="calcCommission" :label="$t('结算佣金')" min-width="120" align="center" />
				<el-table-column prop="nextTotalCommission" :label="$t('直属佣金')" min-width="120" align="center" />
				<el-table-column prop="otherTotalCommission" :label="$t('其他佣金')" min-width="120" align="center" />
				<el-table-column prop="receivedCommission" :label="$t('累计领取')" min-width="120" align="center" />
			</el-table>
			<Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
				@pagination="fetchData"></Pagination>
		</div>
	</Dialog>
</template>

<script setup name="agentReceiveRecord">
import { reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import commonStore from '@/store/common'
import { getAgentSettlementDetail } from '@/api/statistics'

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
})
const route = useRoute()
const emits = defineEmits(['close'])
const commonData = commonStore()

const props = defineProps({
    itemData: {
        type: Object,
        default: {}
    },
})

onMounted(() => {
	state.formData.receiveTime = [props.itemData.reportTime_,props.itemData.reportTime_]
	state.formData.merchantId = props.itemData.merchant.id
    fetchData()
})

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val && val !== 'export') {
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
    if (val === 'export') params.isExport = true
    globalVBus.$emit('globalLoading', true)
    getAgentSettlementDetail(params).then(res => {
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
