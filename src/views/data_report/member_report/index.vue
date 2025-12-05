<template>
    <!-- 会员报表 -->
    <div class="container member-report">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item>
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')"
                    :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" :clearable="false" value-format="YYYY-MM-DD">
                </el-date-picker>
            </el-form-item>
            <el-form-item :label="$t('会员ID:')">
                <el-input @input="(val) => state.formData.userId = val.replace(/\D/g,'')" v-model="state.formData.userId" :placeholder="$t('请输入会员ID')" />
            </el-form-item>
            <el-form-item :label="$t('会员账号:')">
                <el-input v-model="state.formData.username" :placeholder="$t('请输入会员账号')" />
            </el-form-item>
            <el-form-item :label="$t('上级代理账号:')">
                <el-input v-model="state.formData.agentUsername" :placeholder="$t('请输入上级代理账号')" />
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('')">{{$t('刷 新')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('export')">{{$t('导出报表')}}</el-button>
            </el-form-item>
        </el-form>
        <div class="tips-box">{{$t('数据更新时间：每3分钟')}}</div>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column :label="$t('会员ID')" min-width="120" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.userId)">
                        {{ row.userId }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('会员账号')" min-width="140" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.userId)">
                        {{ row.username }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('上级代理账号')" min-width="140" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.agentUserId)">
                        {{ row.agentUsername }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="userSource_" :label="$t('注册来源')" min-width="100" align="center" />
            <el-table-column prop="rechargeTimes" :label="$t('充值次数')" min-width="100" align="center" />
            <el-table-column prop="rechargeAmount" :label="$t('充值金额')" min-width="100" align="center" />
            <el-table-column prop="cashTimes" :label="$t('提现次数')" min-width="100" align="center" />
            <el-table-column prop="cashAmount" :label="$t('提现金额')" min-width="100" align="center" />
            <el-table-column prop="profitDiffAmount" :label="$t('充提差额')" min-width="100" align="center" />
            <el-table-column prop="coinTimes" :label="$t('投注次数')" min-width="120" align="center" />
            <el-table-column prop="validCoin" :label="$t('有效投注')" min-width="100" align="center" />
            <el-table-column prop="winLoseCoin" :label="$t('会员输赢')" min-width="100" align="center" />
            <el-table-column prop="commission" :label="$t('佣金')" min-width="100" align="center" />
            <el-table-column prop="discountAmount" :label="$t('优惠金额')" min-width="100" align="center" />
            <el-table-column prop="activityAmount" :label="$t('活动')" min-width="100" align="center" />
            <el-table-column prop="taskAmount" :label="$t('任务')" min-width="100" align="center" />
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>
    </div>
</template>

<script setup name='memberReport'>
import { reactive, onMounted } from 'vue'
import { getMemberStatisticsList } from '@/api/statistics'
import { dateFormat, getCurrentWeekTime, getShortcuts, deepClone, disabledCurrentDateAfter } from '@/common/util'

let shortcuts = getShortcuts()
const state = reactive({
    formData: {},
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    currentWeek: []
})

onMounted(() => {
    state.currentWeek = getCurrentWeekTime()
    state.formData.receiveTime = deepClone(state.currentWeek)
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
    getMemberStatisticsList(params).then(res => {
        if (!params.isExport) {
            let { total, list } = res.data
            state.tableData = list.map(item => {
                item.reportTime && (item.reportTime = dateFormat(item.reportTime, 'yyyy-MM-DD'))
                return item
            })
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

<style lang="scss">
.member-report {
}
</style>
