<template>
    <!-- VIP升级统计 -->
    <div class="container vip-recharge-cash-diff">
        <el-form class="filter-form" :model="state.formData" inline>
            <el-form-item>
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')"
                    :shortcuts="shortcuts" :disabled-date="disabledDate" value-format="YYYY-MM-DD">
                </el-date-picker>
            </el-form-item>
			<el-form-item :label="$t('站点:')">
			    <MerchantSiteSelect isNeedDefault :clearable="false" style="width: 200px" v-model="state.formData.merchantId" />
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
            <el-form-item>
                <el-button v-throttle type="primary" @click="handleDetail({})">{{$t('查所有数据')}}</el-button>
            </el-form-item>
        </el-form>
        <div class="tips-box">{{$t('注：不输入时间搜索时，默认为商户时区当天时间，列表展示当天数据时，可点击查看统计数据详情；数据每小时更新。')}}</div>
        <el-table :data="state.tableData" class="table-box" border
            :row-class-name="({row,rowIndex}) => (row.level !== 'number' && !rowIndex ? 'total-row': '')">
            <el-table-column prop="period" :label="$t('日期')" width="120" align="center" />
            <el-table-column :label="$t('VIP等级')" min-width="120" align="center">
                <template #default="{ row }">
                    {{typeof row.level === 'number' ? 'VIP' + row.level : ''}}
                </template>
            </el-table-column>
            <el-table-column :label="$t('VIP人数')" min-width="120" align="center">
                <template #default="{ row,$index }">
                    <span v-if="state.isCurrentDay && $index && row.vipNum" class="special pointer"
                        @click="handleDetail(row,1)">{{row.vipNum }}</span>
                    <span v-else>{{row.vipNum}}</span>
                </template>
            </el-table-column>
            <el-table-column min-width="120" align="center">
                <template #header>{{$t('每日升级人数')}}<el-tooltip effect="dark"
                        :content="$t('每日零点统计当日触发等级变更的人数，包括自然晋级，不包含人工vip等级调整，不包含系统降级，2024-10-18之前的数据不作统计')" placement="top">
                        <el-icon class="pointer" :size="15">
                            <QuestionFilled />
                        </el-icon>
                    </el-tooltip>
                </template>
                <template #default="{ row }">
                    {{ row.vipUpNum }}
                </template>
            </el-table-column>
            <el-table-column :label="$t('充值人数')" min-width="120" align="center">
                <template #default="{ row,$index }">
                    <span v-if="state.isCurrentDay && $index && row.rechargeNum" class="special pointer"
                        @click="handleDetail(row,2)">{{row.rechargeNum }}</span>
                    <span v-else>{{row.rechargeNum}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="rechargeAmount" :label="$t('充值金额')" min-width="120" align="center" />
            <el-table-column :label="$t('提现人数')" min-width="120" align="center">
                <template #default="{ row,$index }">
                    <span v-if="state.isCurrentDay && $index && row.cashNum" class="special pointer"
                        @click="handleDetail(row,3)">{{row.cashNum }}</span>
                    <span v-else>{{row.cashNum}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="cashAmount" :label="$t('提现金额')" min-width="120" align="center" />
            <el-table-column prop="rechargeCashDiff" :label="$t('充提差（充 - 提）')" min-width="160" align="center" />
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>

        <LookDataDialog v-if="state.showLookData" :dataList="state.dataList" :itemData="state.itemData" @showMemberDetail="showMemberDetail"
            @close="state.showLookData = false">
        </LookDataDialog>
    </div>
</template>

<script setup name="vipRechargeCashDiff">
import { reactive, onMounted, defineAsyncComponent } from "vue"
import { getRechargeCashStatHistory, getRechargeCashStatCurrent, getRechargeCashStatAll } from '@/api/statistics'
import { getTimeZoneOffset, getShortcuts } from '@/common/util'
import commonStore from '@/store/common'
const LookDataDialog = defineAsyncComponent(() => import('./components/LookDataDialog.vue'))
const commonData = commonStore()
const shortcuts = getShortcuts()
const timeZoneOffset = getTimeZoneOffset()
const state = reactive({
    tableData: [],
    formData: {},
    isCurrentDay: true,
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    itemData: {},
    dataList: [],
    showLookData: false,
})
const disabledDate = (time) => {
    return time.getTime() > Date.now() + timeZoneOffset - 8.64e7
}

onMounted(() => {
	state.formData.merchantId = commonData.currentMerchantSite.id
    fetchData()
})

// 表格过滤数据处理	
const fetchData = (val = '') => {
    if (val && val !== 'export') {
        state.listQuery._page = 1
        if (val === 'reset') {
			state.formData.merchantId = commonData.currentMerchantSite.id
            state.formData.receiveTime = []
            state.isCurrentDay = true
        }
    }
    let params = {
		...state.formData
	}
    if (val === 'export') params.isExport = true
    let { receiveTime } = state.formData
    if (receiveTime && receiveTime.length) {
        if (!params.isExport) state.isCurrentDay = false
        params = Object.assign(params, state.listQuery)
        params.beginPeriod = receiveTime[0]
        params.endPeriod = receiveTime[1]
    } else if (!params.isExport) {
        state.isCurrentDay = true
    }
	delete params.receiveTime
    globalVBus.$emit('globalLoading', true)
    let api = !params.beginPeriod ? getRechargeCashStatCurrent : getRechargeCashStatHistory
    api(params).then(res => {
        if (!params.isExport) {
            if (state.isCurrentDay) {
                state.total = 0
                state.tableData = res.data && res.data.length > 1 ? res.data : []
            } else {
                let { total, list } = res.data
                state.total = total || 0
                state.tableData = list || []
            }
			state.tableData.forEach((item)=>{
				item.merchantId = state.formData.merchantId
			})
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

const handleDetail = (row, type = 0) => {
    state.itemData = { ...row, type }
    if (type) return state.showLookData = true
    globalVBus.$emit('globalLoading', true)
    getRechargeCashStatAll().then(res => {
        state.dataList = res.data || []
        state.showLookData = true
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.dataList = []
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss">
.vip-recharge-cash-diff {
}
</style>
