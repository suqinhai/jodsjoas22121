<template>
     <!-- 代理中心-邀请关系查询 -->
    <div class="container invitationalQuery">
        <el-form class="filter-form" :model="state.searchData" inline>
            <el-form-item>
                <el-select style="width: 200px" v-model="state.searchData.typeId" :placeholder="$t('请选择')">
                     <el-option v-for="item in typeList" :key="item.value"
                    :label="item.label" :value="+item.value" />
                </el-select>
                <el-date-picker v-if="state.searchData.typeId != 3" v-model="state.searchData.receiveTime" type="daterange" value-format="YYYY-MM-DD" :start-placeholder="$t('开始时间')"
                    :end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" />
            </el-form-item>
            <el-form-item :label="$t('代理ID:')">
                <el-input v-model="state.searchData.userId" :placeholder="$t('请输入代理ID')" />
            </el-form-item>
            <el-form-item :label="$t('代理账号:')">
                <el-input v-model="state.searchData.username" :placeholder="$t('请输入代理账号')" />
            </el-form-item>
            <el-form-item :label="$t('是否合格:')">
                <el-select style="width: 200px" v-model="state.searchData.valid" :placeholder="$t('请选择')">
                     <el-option v-for="item in validList" :key="item.value"
                    :label="item.label" :value="+item.value" />
                </el-select>
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
        <div class="title">{{ $t('邀请人自身') }}</div>
        <el-table class="table-box" :data="state.selfTableList" border :max-height="100">
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
            <el-table-column :label="$t('注册时间')" align="center" min-width="120">
                <template #default="{ row }">
                    {{ dateFormat(row.addTime) }}
                </template>
            </el-table-column>
            <el-table-column :label="$t('是否合格')" align="center" min-width="120">
                <template #default="{ row }">
                    {{ row.isValid ? $t('是') : $t('否') }}
                </template>
            </el-table-column>
            <el-table-column prop="inviteReward" :label="$t('邀请奖励金额')" align="center" min-width="120" />
            <el-table-column prop="meritReward" :label="$t('成就奖励金额')" align="center" min-width="120" />
            <el-table-column prop="rechargeReward" :label="$t('总充值返佣')" align="center" min-width="120" />
            <el-table-column prop="playReward" :label="$t('一层投注返佣')" align="center" min-width="120" />
            <el-table-column :label="$t('总充值金额/次数')" align="center" min-width="120">
                <template #default="{ row }">
                    {{ row.rechargeAmount + '/' + row.rechargeTimes }}
                </template>
            </el-table-column>
            <el-table-column :label="$t('总提现金额/次数')" align="center" min-width="120">
                <template #default="{ row }">
                    {{ row.cashAmount + '/' + row.cashTimes }}
                </template>
            </el-table-column>
            <el-table-column prop="discountAmount" :label="$t('优惠总奖励')" align="center" min-width="120" />
            <el-table-column prop="validCoin" :label="$t('总投注')" align="center" min-width="120" />
            <el-table-column prop="winLoseCoin" :label="$t('总盈亏')" align="center" min-width="120" />
        </el-table>
        <div class="title" style="margin-top: 20px;">{{ $t('直属受邀人') }}</div>
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
            <el-table-column :label="$t('注册时间')" align="center" min-width="120">
                <template #default="{ row }">
                    {{ dateFormat(row.addTime) }}
                </template>
            </el-table-column>
            <el-table-column :label="$t('是否合格')" align="center" min-width="120">
                <template #default="{ row }">
                    {{ row.isValid ? $t('是') : $t('否') }}
                </template>
            </el-table-column>
            <el-table-column :label="$t('合格时间')" align="center" min-width="120">
                <template #default="{ row }">
                    {{ dateFormat(row.validTime) }}
                </template>
            </el-table-column>
            <el-table-column prop="inviteReward" :label="$t('邀请奖励金额')" align="center" min-width="120" />
            <el-table-column prop="rechargeReward" :label="$t('总充值返佣')" align="center" min-width="120" />
            <el-table-column prop="playReward" :label="$t('一层投注返佣')" align="center" min-width="120" />
            <el-table-column :label="$t('总充值金额/次数')" align="center" min-width="120">
                <template #default="{ row }">
                    {{ row.rechargeAmount + '/' + row.rechargeTimes }}
                </template>
            </el-table-column>
            <el-table-column prop="inviteUser" :label="$t('总提现金额/次数')" align="center" min-width="120">
                <template #default="{ row }">
                    {{ row.cashAmount + '/' + row.cashTimes }}
                </template>
            </el-table-column>
            <el-table-column prop="discountAmount" :label="$t('优惠总奖励')" align="center" min-width="120" />
            <el-table-column prop="validCoin" :label="$t('总投注')" align="center" min-width="120" />
            <el-table-column prop="winLoseCoin" :label="$t('总盈亏')" align="center" min-width="120" />
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:page="pageConfig._page" v-model:limit="pageConfig._size"
            @pagination="fetchData">
        </Pagination>

    </div>
</template>

<script setup>
import { reactive, onMounted, defineAsyncComponent } from "vue";
import { getRelationList } from "@/api/agent.js";
import { getShortcuts, disabledCurrentDateAfter, getCurrentWeekTime, deepClone, dateFormat } from "@/common/util/index"


const shortcuts = getShortcuts()
const pageConfig = reactive({
    _page: 1,
    _size: 10,
})
const state = reactive({
    searchData: {
        userId: '',
        username: '',
        typeId: 3
    },
    tableList: [],
    selfTableList: [],
    total: 0,
    showAddChangeAgentDialog: false,
    currentWeek: '',
})

const typeList = reactive([{
    value: 1,
    label: $t('注册时间')
},{
    value: 2,
    label: $t('合格时间')
},{
    value: 3,
    label: $t('无')
}])

const validList = reactive([{
    value: 0,
    label: $t('否')
},{
    value: 1,
    label: $t('是')
}])

onMounted(() => {
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
            typeId: 3
        }
        state.selfTableList = []
    }
    let params = {
        ...state.searchData,
        ...pageConfig,
    }
    let { receiveTime } = state.searchData
    if (receiveTime && receiveTime.length) {
        if(state.searchData.typeId == 1){
            params['interval.begin'] = receiveTime[0]
            params["interval.end"] = receiveTime[1]
        }
        if(state.searchData.typeId == 2){
            params['validInterval.begin'] = receiveTime[0]
            params["validInterval.end"] = receiveTime[1]
        }
    }
    delete params.receiveTime
    delete params.typeId
    if (val === 'export') params.isExport = true
    globalVBus.$emit('globalLoading', true)
    getRelationList(params).then(res => {
        if (!params.isExport) {
            state.tableList = []
            let { total, list } = res.data
            state.tableList = list || []
            state.total = total
            if(res.ext.self)  state.selfTableList = [res.ext.self]
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        if (!params.isExport) state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss">
.invitationalQuery {
    .el-table .total-row > .el-table__cell {
        background-color: #f1ca8c;
    }
    .title{
        margin-bottom: 10px;
        font-size: 18px;
        font-weight: bold;
    }
}
</style>
