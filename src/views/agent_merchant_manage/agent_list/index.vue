<template>
    <!-- 代理商列表 -->
    <div class="container agentList">
        <el-form class="filter-form" :model="state.searchData" inline>
            <el-form-item>
                <el-date-picker style="width: 120px" value-format="YYYY-MM-DD" v-model="state.searchData.receiveTime" type="month"
                    :placeholder="$t('请选择')" />
            </el-form-item>
            <el-form-item>
                <el-select style="width: 100px" v-model="state.searchData.queryType" @change="state.searchData.queryVal = ''">
                    <el-option v-for="item in metaData.inputTypeList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <div v-if="state.searchData.queryType !== 3">
                    <el-input v-model="state.searchData.queryVal" @input="(val) => state.searchData.queryVal = val.replace(/\D/g,'')"
                        :placeholder="placeholderLabel" />
                </div>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="state.showAddConfigDialog = true" v-permiss="'merchant.agent-manage.add'">{{$t('新 增')}}
                </el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('export')">{{$t('导出报表')}}</el-button>
            </el-form-item>
        </el-form>
        <div class="tips-box">{{$t('说明：数据每隔1小时刷新一次')}}</div>
        <el-table class="table-box" :data="state.tableList" border>
            <el-table-column prop="addTime" :label="$t('创建日期')" align="center" min-width="160" />
            <el-table-column prop="user.id" :label="$t('ID（代理）')" align="center" min-width="120">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.user.id)">
                        {{ row.user.id }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="user.name" :label="$t('账号（代理）')" align="center" min-width="140">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.user.id)">
                        {{ row.user.name }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="empUsername" :label="$t('后台登录账号')" align="center" min-width="140" />
            <el-table-column prop="roleName" :label="$t('会员角色')" align="center" min-width="120" />
            <el-table-column prop="domain" :label="$t('域名')" align="center" min-width="160" />
            <el-table-column prop="activeAmount" :label="$t('出款额度')" align="center" min-width="120" />
            <el-table-column prop="totalRecharge" :label="$t('总充值')" align="center" min-width="120" />
            <el-table-column prop="totalCash" :label="$t('总提款')" align="center" min-width="120" />
            <el-table-column prop="difference" :label="$t('充提差')" align="center" min-width="120" />
            <el-table-column prop="payRate" :label="$t('充值支付通道费率%')" align="center" min-width="120" />
            <el-table-column prop="payFee" :label="$t('支付通道费用')" align="center" min-width="120" />
            <el-table-column prop="totalWinCoin" :label="$t('游戏输赢')" align="center" min-width="120" />
            <el-table-column prop="playRate" :label="$t('游戏抽成%')" align="center" min-width="120" />
            <el-table-column prop="winCoinFee" :label="$t('厂商费用')" align="center" min-width="120" />
            <el-table-column prop="shareRate" :label="$t('分成比例%')" align="center" min-width="120" />
            <el-table-column prop="agentCommission" :label="$t('代理分红')" align="center" min-width="120" />
            <el-table-column prop="pgcValidCoin" :label="$t('RTP投注')" align="center" min-width="200" v-if="isBetMode">
                <template #default="{ row }">
                    <div class="pre-wrap" v-html="row.pgcValidCoin"></div>
                </template>
            </el-table-column>
            <el-table-column prop="pgcRate" :label="$t('RTP抽成%')" align="center" min-width="200" v-if="isBetMode">
                <template #default="{ row }">
                    <div class="pre-wrap" v-html="row.pgcRate"></div>
                </template>
            </el-table-column>
            <el-table-column prop="pgcTotalFee" :label="$t('RTP厂商费用')" align="center" min-width="120" v-if="isBetMode" />
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:page="pageConfig._page" v-model:limit="pageConfig._size"
            @pagination="fetchData">
        </Pagination>

        <AddConfigDialog v-if="state.showAddConfigDialog" @close="state.showAddConfigDialog = false" @refresh="fetchData('reset')"></AddConfigDialog>
    </div>
</template>

<script setup name="agentList">
import { computed, reactive, onMounted, defineAsyncComponent } from "vue";
import { getAgentManageListData } from "@/api/agent_system.js";
import userStore from '@/store/user'
import { disabledCurrentDateAfter, dateFormat, getCurrentMonthTime } from "@/common/util/index"
const AddConfigDialog = defineAsyncComponent(() => import('./components/AddConfigDialog.vue'))

const pageConfig = reactive({
    _page: 1,
    _size: 10,
})
const state = reactive({
    searchData: {
        queryType: 2,
        receiveTime: '',
    },
    tableList: [],
    total: 0,
    showAddConfigDialog: false,
})
const userData = userStore()
const metaData = reactive({
    inputTypeList: [
        // { label: $t('代理账号'), value: 1, placeholder: $t('请输入代理账号') },
        { label: $t('代理ID'), value: 2, placeholder: $t('请输入代理ID') },
    ]
})

const isBetMode = computed(() => {
    return userData.siteInfo.commissionMode && userData.siteInfo.commissionMode === 2
})
const placeholderLabel = computed(() => {
    return metaData.inputTypeList.find(item => item.value === state.searchData.queryType)?.placeholder || ''
});

onMounted(() => {
    state.searchData.receiveTime = getCurrentMonthTime()[0]
    fetchData()
})

const fetchData = (val = '') => {
    if (val && val !== 'export') {
        pageConfig._page = 1
        if (val === 'reset') {
            state.searchData = {
                queryType: 2,
                receiveTime: getCurrentMonthTime()[0],
            }
        }
    }
    let params = {
        ...state.searchData,
        ...pageConfig,
    }
    if (val === 'export') params.isExport = true
    if (state.searchData.queryType === 1) params['username'] = state.searchData.queryVal
    if (state.searchData.queryType === 2) params['userId'] = state.searchData.queryVal
    let { receiveTime } = state.searchData
    if (receiveTime) {
        params['period'] = receiveTime
    }

    delete params.receiveTime
    delete params.queryType
    delete params.queryVal
    globalVBus.$emit('globalLoading', true)
    getAgentManageListData(params).then(res => {
        if (!params.isExport) {
            state.tableList = []
            let { total, list } = res.data
            state.tableList = list || []
            state.total = total
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        if (!params.isExport) state.tableList = []
        globalVBus.$emit('globalLoading', false)
    })
}

// 查看会员详情
const showMemberDetail = (id) => {
    globalVBus.$emit('memberDetailDialog', id)
}
</script>

<style lang="scss">
.agentList {
    .el-table .total-row > .el-table__cell {
        background-color: #f1ca8c;
    }
}
.pre-wrap {
    white-space: pre-wrap;
}
</style>
