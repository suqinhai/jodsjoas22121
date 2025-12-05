<template>
    <!-- 代理上级更改溯源 -->
    <div class="container allocationLoanLimit">
        <el-form class="filter-form" :model="state.searchData" inline>
            <el-form-item>
                <el-date-picker v-model="state.searchData.receiveTime" type="daterange" value-format="YYYY-MM-DD" :start-placeholder="$t('开始时间')"
                    :end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" />
            </el-form-item>
            <el-form-item :label="$t('代理ID:')">
                <el-input v-model="state.searchData.userId" :placeholder="$t('请输入代理ID')" />
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="state.showAddChangeAgentDialog = true" v-permiss="'merchant.agent-op.changeEdit'">{{$t('新 增')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table class="table-box" :data="state.tableList" border>
            <el-table-column prop="user.id" :label="$t('会员ID')" align="center" min-width="120">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.user.id)">
                        {{ row.user.id }}
                    </span>
                </template>
            </el-table-column>

            <el-table-column prop="user.name" :label="$t('账号')" align="center" min-width="140">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.user.id)">
                        {{ row.user.name }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="oldInviteUser.id" :label="$t('原上级代理ID')" align="center" min-width="120" />
            <el-table-column prop="inviteUser.id" :label="$t('新绑定上级代理ID')" align="center" min-width="120" />
            <el-table-column :label="$t('操作时间')" min-width="160" align="center">
                <template #default="{ row }">
                    {{ dateFormat(row.addTime) }}
                </template>
            </el-table-column>
            <el-table-column prop="empUsername" :label="$t('操作人')" align="center" min-width="120" />
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:page="pageConfig._page" v-model:limit="pageConfig._size"
            @pagination="fetchData">
        </Pagination>

        <AddChangeAgentDialog v-if="state.showAddChangeAgentDialog" @close="state.showAddChangeAgentDialog = false" @refresh="fetchData('reset')">
        </AddChangeAgentDialog>
    </div>
</template>

<script setup name="allocationLoanLimit">
import { reactive, onMounted, defineAsyncComponent } from "vue";
import { getChangeList } from "@/api/agent.js";
import { getShortcuts, disabledCurrentDateAfter, getCurrentWeekTime, deepClone, dateFormat } from "@/common/util/index"

const AddChangeAgentDialog = defineAsyncComponent(() => import('./components/AddChangeAgentDialog.vue'))


const shortcuts = getShortcuts()
const pageConfig = reactive({
    _page: 1,
    _size: 10,
})
const state = reactive({
    searchData: {
        userId: ''
    },
    tableList: [],
    total: 0,
    showAddChangeAgentDialog: false,
    currentWeek: '',
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
    getChangeList(params).then(res => {
        state.tableList = []
        let { total, list } = res.data
        state.tableList = list || []
        state.total = total
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableList = []
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss">
.allocationLoanLimit {
    .el-table .total-row > .el-table__cell {
        background-color: #f1ca8c;
    }
}
</style>
