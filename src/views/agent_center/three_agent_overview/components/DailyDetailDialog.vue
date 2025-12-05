<template>
    <!-- 会员中心-三级代理总览-每日明细 -->
    <Dialog ref="dialog" :width="1300" :title="$t('每日明细')" buttonCenter top="15vh" :isShowBottomButton="false"
        @cancel="cancel">
        <el-form class="filter-form" :model="state.searchData" inline>
            <el-form-item>
                <el-date-picker v-model="state.searchData.receiveTime" type="daterange" value-format="YYYY-MM-DD" :start-placeholder="$t('开始时间')"
                    :end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" />
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{ $t('搜 索') }}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{ $t('重 置') }}</el-button>
            </el-form-item>
        </el-form>
        <el-table class="table-box" :data="state.tableList" border v-loading="state.loading">
            <el-table-column prop="reportTime_" :label="$t('日期')" align="center" min-width="120" />
            <el-table-column prop="agentLevel" :label="$t('代理层级')" align="center" min-width="120">
                <template #default="{ row }">
                    <div class="item">{{$t('自己')}}</div>
                    <div class="item">{{$t('总计')}}</div>
                    <div class="item">{{$t('一级')}}</div>
                    <div class="item">{{$t('二级')}}</div>
                    <div class="item noborer">{{$t('三级')}}</div>
                </template>
            </el-table-column>
            <!-- <el-table-column :label="$t('三级分润比例')" align="center" min-width="120">
                <template #default="{ row }">
                    <div class="item"></div>
                    <div class="item"></div>
                    <div class="item"><span v-if="row.rewardRates">{{row.rewardRates[0]}}</span></div>
                    <div class="item"><span v-if="row.rewardRates">{{row.rewardRates[1]}}</span></div>
                    <div class="item noborer"><span v-if="row.rewardRates">{{row.rewardRates[2]}}</span></div>
                </template>
            </el-table-column> -->
            <el-table-column :label="$t('充值')" align="center" min-width="120">
                <template #default="{ row }">
                    <div class="item">{{row.rechargeAmount}}</div>
                    <div class="item">{{row.all?.rechargeAmount}}</div>
                    <div class="item">{{row.one?.rechargeAmount}}</div>
                    <div class="item">{{row.two?.rechargeAmount}}</div>
                    <div class="item noborer">{{row.three?.rechargeAmount}}</div>
                </template>
            </el-table-column>
            <el-table-column :label="$t('提现')" align="center" min-width="120">
                <template #default="{ row }">
                    <div class="item">{{row.cashAmount}}</div>
                    <div class="item">{{row.all?.cashAmount}}</div>
                    <div class="item">{{row.one?.cashAmount}}</div>
                    <div class="item">{{row.two?.cashAmount}}</div>
                    <div class="item noborer">{{row.three?.cashAmount}}</div>
                </template>
            </el-table-column>
            <el-table-column :label="$t('充提差')" align="center" min-width="120">
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
        </el-table>
        <!-- <Pagination v-show="state.total > 0" :total="state.total" v-model:page="pageConfig._page"
            v-model:limit="pageConfig._size" @pagination="fetchData">
        </Pagination> -->
    </Dialog>
</template>

<script setup>
import { reactive, onMounted } from "vue";
import { getOverviewDetail } from "@/api/agent.js";
import { getShortcuts, disabledCurrentDateAfter, getCurrentWeekTime, dateFormat, deepClone } from "@/common/util/index"

const emits = defineEmits(['fetchData', 'close'])
const shortcuts = getShortcuts()
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        }
    },
    receiveTime: {
        type: Array,
        default: () => {
            return []
        }
    }
})
const pageConfig = reactive({
    _page: 1,
    _size: -1,
})
const state = reactive({
    searchData: {},
    tableList: [],
    total: 0,
    itemData: {},
    ext: {},
    loading: false,
    currentWeek: '',
})

onMounted(() => {
    state.searchData.receiveTime = props.receiveTime
    fetchData()
})

const fetchData = (val = '') => {
    if (val === 'reset') {
        pageConfig._page = 1
        state.searchData = {
            receiveTime: props.receiveTime
        }
    }
    let params = {
        userId: props.itemData.userId,
        ...state.searchData,
        ...pageConfig,
    }
    let { receiveTime } = state.searchData
    if (receiveTime && receiveTime.length) {
        params['interval.begin'] = receiveTime[0]
        params["interval.end"] = receiveTime[1]
    }
    delete params.receiveTime
    state.loading = true
    getOverviewDetail(params).then(({data}) => {
        let { total, list } = data
        state.tableList = list
        state.total = total
        state.loading = false
    }).catch(err => {
        state.tableList = []
        state.total = 0
        state.loading = false
    })
}

const cancel = () => {
    emits('close')
}
</script>

<style scoped lang="scss">
.noborer{
    border: none;
}
</style>
