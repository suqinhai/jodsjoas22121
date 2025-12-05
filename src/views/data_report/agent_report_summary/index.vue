<template>
    <!-- 代理数据报表 -->
    <div class="container agent-report-summary">
        <el-form class="filter-form" :model="state.formData" inline>
            <el-form-item>
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')"
                    :shortcuts="shortcuts" :disabled-date="disabledCurrentDateAfter" :clearable="false" value-format="YYYY-MM-DD">
                </el-date-picker>
            </el-form-item>
            <el-form-item :label="$t('站点:')" v-if="commonData.merchantSiteList.length > 1">
                <MerchantSiteSelect isShowAll isNeedDefault :clearable="false" v-model="state.formData.merchantId" @change="selectChange">
                </MerchantSiteSelect>
            </el-form-item>
            <el-form-item :label="$t('代理ID:')" v-if="state.formData.merchantId || commonData.merchantSiteList.length < 2">
                <el-input v-model="state.formData.agentUserId" :placeholder="$t('请输入代理ID')" />
            </el-form-item>
            <el-form-item :label="$t('代理账号:')" v-if="state.formData.merchantId || commonData.merchantSiteList.length < 2">
                <el-input v-model="state.formData.agentUsername" :placeholder="$t('请输入代理账号')" />
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
        <div class="tips-box">{{$t('数据更新时间：5分钟')}}</div>
        <el-table :data="state.tableData" class="table-box" border :row-class-name="({row,rowIndex}) => (!rowIndex ? 'total-row': '')">
            <el-table-column prop="reportTime_" :label="$t('日期')" width="120" align="center" />
            <el-table-column :label="$t('代理ID')" min-width="120" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row)">
                        {{ row.userId || '' }}
                    </span>
                </template>
            </el-table-column>
            <!-- <el-table-column :label="$t('代理账号')" min-width="140" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row)">
                        {{ row.user?.name || '' }}
                    </span>
                </template>
            </el-table-column> -->
            <el-table-column min-width="120" align="center">
                <template #header>
                    {{$t('下级代理')}}<el-tooltip effect="dark" :content="$t('排除未继续发展下级的普通玩家')" placement="top">
                        <el-icon class="pa pointer" :size="15">
                            <QuestionFilled />
                        </el-icon>
                    </el-tooltip>
                </template>
                <template #default="{ row }">
                    {{ row.agentUserCount }}
                </template>
            </el-table-column>
            <el-table-column prop="otherUserCount" :label="$t('下级人数')" min-width="120" align="center" />
            <el-table-column prop="rechargeAmount" :label="$t('总充值')" min-width="120" align="center" />
            <el-table-column prop="cashAmount" :label="$t('总提现')" min-width="120" align="center" />
            <el-table-column prop="rechargeUserCount" :label="$t('总充值人数')" min-width="120" align="center" />
            <el-table-column prop="cashUserCount" :label="$t('总提现人数')" min-width="120" align="center" />
            <el-table-column prop="discountUserCount" :label="$t('申请优惠人数')" min-width="160" align="center" />
            <el-table-column min-width="120" align="center">
                <template #header>{{$t('优惠金额')}}<el-tooltip effect="dark" :content="$t('系统派发奖励的金额')" placement="top">
                        <el-icon class="pointer" :size="15">
                            <QuestionFilled />
                        </el-icon>
                    </el-tooltip>
                </template>
                <template #default="{ row }">
                    {{ row.discountAmount }}
                </template>
            </el-table-column>
            <el-table-column prop="validCoin" :label="$t('投注金额')" min-width="120" align="center" />
            <el-table-column prop="coinUserCount" :label="$t('投注人数')" min-width="120" align="center" />
            <el-table-column prop="userCount" :label="$t('新增人数')" min-width="120" align="center" />
            <el-table-column prop="commission" :label="$t('佣金')" min-width="120" align="center" />
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>

        <MemberDetail v-if="state.memberDetailShow" :merchantId="state.merchantId" @close="state.memberDetailShow = false"></MemberDetail>
    </div>
</template>

<script setup name="agentReportSummary">
import { reactive, onMounted } from "vue"
import commonStore from '@/store/common'
import { getAgentDataSummary } from '@/api/statistics'
import { disabledCurrentDateAfter, getShortcuts, getTimeRange, deepClone } from '@/common/util'

const shortcuts = getShortcuts()
const state = reactive({
    formData: {},
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    currentTime: [],
    memberDetailShow: false,
    merchantId: '',
})
const commonData = commonStore()

onMounted(() => {
    state.currentTime = getTimeRange()
    state.formData.receiveTime = deepClone(state.currentTime)
    fetchData()
})

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val && val !== 'export') {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {
                receiveTime: deepClone(state.currentTime),
                merchantId: 0
            }
        }
    }
    let params = { ...state.listQuery, ...state.formData }
    let { receiveTime } = state.formData
    if (receiveTime && receiveTime.length) {
        if (new Date(receiveTime[1] + ' 23:23:59').getTime() - new Date(receiveTime[0] + ' 00:00:00').getTime() > 31 * 24 * 60 * 60 * 1000) return ElMessage.warning($t('搜索时间范围不得超过31天！'))
        params['interval.begin'] = receiveTime[0]
        params['interval.end'] = receiveTime[1]
    }
    delete params.receiveTime
    if (val === 'export') params.isExport = true
    globalVBus.$emit('globalLoading', true)
    getAgentDataSummary(params).then(({ data = {}, ext = {} }) => {
        if (!params.isExport) {
            let { total, list } = data
            state.tableData = []
            state.tableData = list || []
            if (state.tableData.length) {
                state.tableData.unshift({ ...ext, reportTime_: $t('总计') })
            }
            state.total = total
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        if (!params.isExport) state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

// 查看会员详情
const showMemberDetail = ({ userId, merchantId }) => {
    commonData.memberId = userId
    state.merchantId = merchantId
    state.memberDetailShow = true
}

// 站点切换
const selectChange = (merchantId) => {
    if (!merchantId) {
        state.formData.agentUserId = ''
        state.formData.agentUsername = ''
    }
}
</script>

<style lang="scss">
.agent-report-summary {
}
</style>
