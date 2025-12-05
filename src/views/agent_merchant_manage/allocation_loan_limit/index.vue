<template>
    <!-- 出款额度配置 -->
    <div class="container allocationLoanLimit">
        <el-form class="filter-form" :model="state.searchData" inline>
            <el-form-item>
                <el-date-picker v-model="state.searchData.receiveTime" type="daterange" value-format="YYYY-MM-DD" :start-placeholder="$t('开始时间')"
                    :end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" />
            </el-form-item>
            <el-form-item>
                <el-select style="width: 100px" v-model="state.searchData.queryType" @change="state.searchData.queryVal = ''">
                    <el-option v-for="item in metaData.inputTypeList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <div v-if="state.searchData.queryType !== 3">
                    <el-input v-model="state.searchData.queryVal" @input="valueInput" :placeholder="placeholderLabel" />
                </div>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="state.showAddConfigDialog = true" v-permiss="'merchant.agent-coin-log.adjust'">{{$t('新 增')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="state.showLimitWarningDialog = true" v-permiss="'admin.meta.itemList-39'">{{$t('额度不足预警')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table class="table-box" :data="state.tableList" border>
            <el-table-column prop="localTime_" :label="$t('操作日期')" align="center" min-width="160" />
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
            <el-table-column prop="oldActiveAmount" :label="$t('变动前')" align="center" min-width="120" />
            <el-table-column prop="tradeAmount" :label="$t('变更值')" align="center" min-width="120" />
            <el-table-column prop="activeAmount" :label="$t('变动后')" align="center" min-width="120" />
            <el-table-column prop="tradeType_" :label="$t('变更类型')" align="center" min-width="120" />
            <el-table-column prop="remark" :label="$t('备注')" align="center" min-width="160" />
            <el-table-column prop="emp.name" :label="$t('操作人')" align="center" min-width="120" />
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:page="pageConfig._page" v-model:limit="pageConfig._size"
            @pagination="fetchData">
        </Pagination>

        <AddConfigDialog v-if="state.showAddConfigDialog" @close="state.showAddConfigDialog = false" @refresh="fetchData('reset')"></AddConfigDialog>
        <LimitWarningDialog v-if="state.showLimitWarningDialog" @close="state.showLimitWarningDialog = false" @refresh="fetchData('reset')">
        </LimitWarningDialog>
    </div>
</template>

<script setup name="allocationLoanLimit">
import { computed, reactive, onMounted, defineAsyncComponent } from "vue";
import { getAdjustListData } from "@/api/agent_system.js";
import { getShortcuts, disabledCurrentDateAfter, getCurrentWeekTime, deepClone } from "@/common/util/index"

const AddConfigDialog = defineAsyncComponent(() => import('./components/AddConfigDialog.vue'))
const LimitWarningDialog = defineAsyncComponent(() => import('./components/LimitWarningDialog.vue'))

const shortcuts = getShortcuts()
const pageConfig = reactive({
    _page: 1,
    _size: 10,
})
const state = reactive({
    searchData: {
        queryType: 1
    },
    tableList: [],
    total: 0,
    showAddConfigDialog: false,
    showLimitWarningDialog: false,
    currentWeek: '',
})
let metaData = reactive({
    inputTypeList: [
        { label: $t('代理账号'), value: 1, placeholder: $t('请输入代理账号') },
        { label: $t('代理ID'), value: 2, placeholder: $t('请输入代理ID') },
    ]
})

let placeholderLabel = computed(() => {
    return metaData.inputTypeList.find(item => item.value === state.searchData.queryType)?.placeholder || ''
});

onMounted(() => {
    state.currentWeek = getCurrentWeekTime()
    state.searchData.receiveTime = deepClone(state.currentWeek)
    fetchData()
})


const valueInput = (val) => {
    if (state.searchData.queryType === 2) {
        state.searchData.queryVal = val.replace(/\D/g, '')
    }
}

// 查看会员详情
const showMemberDetail = (id) => {
    globalVBus.$emit('memberDetailDialog', id)
}

const fetchData = (val = '') => {
    if (val === 'reset') {
        pageConfig._page = 1
        state.searchData = {
            queryType: 1
        }
    }
    let params = {
        ...state.searchData,
        ...pageConfig,
    }
    if (state.searchData.queryType === 1) params['username'] = state.searchData.queryVal
    if (state.searchData.queryType === 2) params['userId'] = state.searchData.queryVal
    let { receiveTime } = state.searchData
    if (receiveTime && receiveTime.length) {
        params['interval.begin'] = receiveTime[0]
        params["interval.end"] = receiveTime[1]
    }
    delete params.receiveTime
    delete params.queryType
    delete params.queryVal
    globalVBus.$emit('globalLoading', true)
    getAdjustListData(params).then(res => {
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
