<template>
    <!-- 代理中心-三级代理总览 -->
    <div class="container threeAgentOverview">
        <el-descriptions :title="$t('总计')"  :column="3" border style="width: 1050px;margin-bottom: 20px;">
            <template #title>
                <div class="title">{{ $t('总计') }}</div>
                <div class="des">{{ $t('注：统计为站点三级代理数据总计；') }}</div>
            </template>
            <el-descriptions-item :label="$t('总充值（含自己）')" width="350">{{state.ext.rechargeAmount}}</el-descriptions-item>
            <el-descriptions-item :label="$t('总提现（含自己）')" width="350">{{state.ext.cashAmount}}</el-descriptions-item>
            <el-descriptions-item :label="$t('充提差（含自己）')" width="350">{{state.ext.rechargeCashDiff}}</el-descriptions-item>
        </el-descriptions>
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
            <el-form-item :label="$t('上级代理ID:')">
                <el-input v-model="state.searchData.inviteUserId" :placeholder="$t('请输入上级代理ID')" />
            </el-form-item>
            <el-form-item :label="$t('上级代理账号:')">
                <el-input v-model="state.searchData.inviteUsername" :placeholder="$t('请输入上级代理账号')" />
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{ $t('搜 索') }}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{ $t('重 置') }}</el-button>
            </el-form-item>
            <el-form-item>
                <el-icon class="pointer" :size="24" @click="state.showExplain = true">
                    <QuestionFilled />
                </el-icon>
            </el-form-item>
        </el-form>
        <el-table class="table-box" :data="state.tableList" border @sort-change="sortChange">
            <el-table-column :label="$t('代理ID')" align="center" min-width="110" fixed="left">
                <template #default="{ row }">
                    <div class="tag-box" v-if="row.isBlogger">
                        <span class="tag-box-name" :style="{'backgroundColor': 'rgba(128, 255, 255, 1)'}">{{ $t('网红') }}</span>
                    </div>
                    <span class="special pointer" @click="showMemberDetail(row.userId)">
                        {{ row.userId }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('代理账号')" align="center" min-width="110" fixed="left">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.userId)">
                        {{ row.username }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('上级代理ID')" align="center" min-width="110" fixed="left">
                <template #default="{ row }">
                    <span v-if="row.inviteUserId" class="special pointer" @click="showMemberDetail(row.inviteUserId)">
                        {{ row.inviteUserId }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('上级代理账号')" align="center" min-width="110" fixed="left">
                <template #default="{ row }">
                    <span v-if="row.inviteUserId" class="special pointer" @click="showMemberDetail(row.inviteUserId)">
                        {{ row.inviteUsername }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('邀请奖励')" align="center" min-width="120" fixed="left">
                <template #default="{ row }">
                    {{ $t('存款分润(含复充)') }}
                </template>
            </el-table-column>
            <el-table-column :label="$t('代理层级')" align="center" min-width="80" fixed="left">
                <template #default="{ row }">
                    <div class="item">{{$t('自己')}}</div>
                    <div class="item">{{$t('总计')}}</div>
                    <div class="item">{{$t('一级')}}</div>
                    <div class="item">{{$t('二级')}}</div>
                    <div class="item noborer">{{$t('三级')}}</div>
                </template>
            </el-table-column>
            <el-table-column :label="$t('三级分润比例')" align="center" min-width="120">
                <template #default="{ row }">
                    <div class="item"></div>
                    <div class="item"></div>
                    <div class="item"><span v-if="row.rewardRates">{{row.rewardRates[0]}}</span></div>
                    <div class="item"><span v-if="row.rewardRates">{{row.rewardRates[1]}}</span></div>
                    <div class="item noborer"><span v-if="row.rewardRates">{{row.rewardRates[2]}}</span></div>
                </template>
            </el-table-column>
            <el-table-column :label="$t('充值')" sortable="custom" type="1" align="center" min-width="120">
                <template #default="{ row }">
                    <div class="item">{{row.rechargeAmount}}</div>
                    <div class="item">{{row.all?.rechargeAmount}}</div>
                    <div class="item">{{row.one?.rechargeAmount}}</div>
                    <div class="item">{{row.two?.rechargeAmount}}</div>
                    <div class="item noborer">{{row.three?.rechargeAmount}}</div>
                </template>
            </el-table-column>
            <el-table-column :label="$t('提现')" sortable="custom" type="2" align="center" min-width="120">
                <template #default="{ row }">
                    <div class="item">{{row.cashAmount}}</div>
                    <div class="item">{{row.all?.cashAmount}}</div>
                    <div class="item">{{row.one?.cashAmount}}</div>
                    <div class="item">{{row.two?.cashAmount}}</div>
                    <div class="item noborer">{{row.three?.cashAmount}}</div>
                </template>
            </el-table-column>
            <el-table-column :label="$t('充提差')" sortable="custom" type="3" align="center" min-width="120">
                <template #default="{ row }">
                    <div class="item">{{row.rechargeCashDiff}}</div>
                    <div class="item">{{row.all?.rechargeCashDiff}}</div>
                    <div class="item">{{row.one?.rechargeCashDiff}}</div>
                    <div class="item">{{row.two?.rechargeCashDiff}}</div>
                    <div class="item noborer">{{row.three?.rechargeCashDiff}}</div>
                </template>
            </el-table-column>
            <el-table-column :label="$t('游戏输赢')" align="center" min-width="120">
                <template #default="{ row }">
                    <div class="item">{{row.winLoseCoin}}</div>
                    <div class="item">{{row.all?.winLoseCoin}}</div>
                    <div class="item">{{row.one?.winLoseCoin}}</div>
                    <div class="item">{{row.two?.winLoseCoin}}</div>
                    <div class="item noborer">{{row.three?.winLoseCoin}}</div>
                </template>
            </el-table-column>
            <el-table-column :label="$t('注册人数')" align="center" min-width="120">
                <template #default="{ row }">
                    <div class="item">{{row.userCount}}</div>
                    <div class="item">{{row.all?.userCount}}</div>
                    <div class="item">{{row.one?.userCount}}</div>
                    <div class="item">{{row.two?.userCount}}</div>
                    <div class="item noborer">{{row.three?.userCount}}</div>
                </template>
            </el-table-column>
            <el-table-column :label="$t('充值人数')" align="center" min-width="120">
                <template #default="{ row }">
                    <div class="item">{{row.rechargeCount}}</div>
                    <div class="item">{{row.all?.rechargeCount}}</div>
                    <div class="item">{{row.one?.rechargeCount}}</div>
                    <div class="item">{{row.two?.rechargeCount}}</div>
                    <div class="item noborer">{{row.three?.rechargeCount}}</div>
                </template>
            </el-table-column>
            <el-table-column :label="$t('首充人数')" align="center" min-width="120">
                <template #default="{ row }">
                    <div class="item">{{row.firstRechargeCount}}</div>
                    <div class="item">{{row.all?.firstRechargeCount}}</div>
                    <div class="item">{{row.one?.firstRechargeCount}}</div>
                    <div class="item">{{row.two?.firstRechargeCount}}</div>
                    <div class="item noborer">{{row.three?.firstRechargeCount}}</div>
                </template>
            </el-table-column>
            <el-table-column :label="$t('首充金额')" align="center" min-width="120">
                <template #default="{ row }">
                    <div class="item">{{row.firstRechargeAmount}}</div>
                    <div class="item">{{row.all?.firstRechargeAmount}}</div>
                    <div class="item">{{row.one?.firstRechargeAmount}}</div>
                    <div class="item">{{row.two?.firstRechargeAmount}}</div>
                    <div class="item noborer">{{row.three?.firstRechargeAmount}}</div>
                </template>
            </el-table-column>
            <el-table-column :label="$t('复充人数')" align="center" min-width="120">
                <template #default="{ row }">
                    <div class="item">{{row.repurchaseCount}}</div>
                    <div class="item">{{row.all?.repurchaseCount}}</div>
                    <div class="item">{{row.one?.repurchaseCount}}</div>
                    <div class="item">{{row.two?.repurchaseCount}}</div>
                    <div class="item noborer">{{row.three?.repurchaseCount}}</div>
                </template>
            </el-table-column>
            <el-table-column :label="$t('复充金额')" align="center" min-width="120">
                <template #default="{ row }">
                    <div class="item">{{row.repurchaseAmount}}</div>
                    <div class="item">{{row.all?.repurchaseAmount}}</div>
                    <div class="item">{{row.one?.repurchaseAmount}}</div>
                    <div class="item">{{row.two?.repurchaseAmount}}</div>
                    <div class="item noborer">{{row.three?.repurchaseAmount}}</div>
                </template>
            </el-table-column>
            <el-table-column :label="$t('操作')" min-width="100" align="center">
                <template #default="{ row }">
                    <el-button v-throttle type="primary" text
                        @click="handleEdit('showDailyDetailDialog', row)">{{ $t('每日明细') }}</el-button>
                    <el-button v-permiss="'merchant.third-level-agent.editAgentConfig'" v-throttle type="primary" text
                        @click="handleEdit('showInviteAwardSettingDialog',row)">{{ $t('邀请奖金设置') }}</el-button>
                    <el-button v-throttle type="primary" text
                        @click="handleEdit('showLookLevelDialog',row)">{{ $t('查看下级') }}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:page="pageConfig._page"
            v-model:limit="pageConfig._size" @pagination="fetchData">
        </Pagination>
        <InviteAwardSettingDialog v-if="state.showInviteAwardSettingDialog" @close="state.showInviteAwardSettingDialog = false" @fetchData="fetchData" :itemData="state.itemData" />
        <LookLevelDialog v-if="state.showLookLevelDialog" @close="state.showLookLevelDialog = false" :itemData="state.itemData" />
        <DailyDetailDialog v-if="state.showDailyDetailDialog" @close="state.showDailyDetailDialog = false" :receiveTime="state.searchData.receiveTime" :itemData="state.itemData" />
        <ExplainDialog v-if="state.showExplain" @close="state.showExplain = false"></ExplainDialog>
    </div>
</template>
<script setup name="threeAgentOverview">
import { reactive, onMounted, defineAsyncComponent } from "vue";
import { getShortcuts, disabledCurrentDateAfter, getCurrentWeekTime, deepClone } from "@/common/util/index"
import { getOverview } from "@/api/agent.js";

const DailyDetailDialog = defineAsyncComponent(() => import('./components/DailyDetailDialog.vue'))
const InviteAwardSettingDialog = defineAsyncComponent(() => import('./components/InviteAwardSettingDialog.vue'))
const LookLevelDialog = defineAsyncComponent(() => import('./components/LookLevelDialog.vue'))
const ExplainDialog = defineAsyncComponent(() => import('./components/ExplainDialog.vue'))


const shortcuts = getShortcuts()
const pageConfig = reactive({
    _page: 1,
    _size: 10,
})
const state = reactive({
    searchData: {},
    tableList: [],
    total: 0,
    itemData: {},
    ext: {},
    showInviteAwardSettingDialog: false,
    showLookLevelDialog: false,
    showDailyDetailDialog: false,
    showExplain: false,
})

onMounted(() => {
    state.currentWeek = getCurrentWeekTime()
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
    globalVBus.$emit('globalLoading', true)
    getOverview(params).then(({data,ext}) => {
        let { total, list } = data
        state.tableList = list || []
        state.total = total
        state.ext = ext.total
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        globalVBus.$emit('globalLoading', false)
    })
}

const sortChange = ({ column, order }) => {
    const columnData = deepClone(column) || {}
    switch (columnData.type) {
        case '1':
            if(order === 'ascending') state.searchData.sort = 1
            if(order === 'descending') state.searchData.sort = 2
            if(!order) state.searchData.sort = ''
            break;
        case '2':
            if(order === 'ascending') state.searchData.sort = 3
            if(order === 'descending') state.searchData.sort = 4
            if(!order) state.searchData.sort = ''
            break;
        case '3':
            if(order === 'ascending') state.searchData.sort = 5
            if(order === 'descending') state.searchData.sort = 6
            if(!order) state.searchData.sort = ''
            break;
        default:
            state.searchData.sort = ''
            break;
    }
    fetchData()
}

const handleEdit = (type,row) => {
    state.itemData = row
    state[type] = true
}

</script>

<style lang="scss">
.threeAgentOverview {
    .el-descriptions__cell{
        width: 150px;
    }
    .item{
        border-bottom: var(--el-table-border);
        line-height: 35px;
        height: 35px;
    }
    .des{
        font-size: 12px;
        color: #999;
        margin-top: 5px;
    }
    .item.noborer{
        border: none;
    }
    .el-table tbody .el-table__cell{
        padding: 0;
    }
    .el-table tbody .cell{
        padding: 0;
    }
}
</style>
