
<template>
    <!-- 线下代理分红记录 -->
    <div class="container agent-dividend-record-page">
        <el-form class="filter-form" :model="state.formData" inline>
            <el-form-item>
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')"
                    :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" :clearable="false" value-format="YYYY-MM-DD">
                </el-date-picker>
            </el-form-item>
            <el-form-item>
                <el-select style="width: 130px" v-model="state.selectType" @change="state.inputValue = ''">
                    <el-option v-for="item in optionData" :key="item.type" :label="item.title" :value="item.type" />
                </el-select>
                <div>
                    <el-input @input="valueInput" v-model="state.inputValue" :placeholder="optionData[state.selectType -1].placeholder" />
                </div>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="handleAdd">{{$t('新 增')}}</el-button>
            </el-form-item>
        </el-form>
        <div class="tips">{{$t('注：对代理进行线下分红出款后，操作人需要在此新增分红出款记录')}}</div>
        <el-table :data="state.tableData" class="table-box" border>
            <el-table-column prop="localTime_" :label="$t('操作日期')" min-width="100" align="center" />
            <el-table-column :label="$t('ID（代理）')" min-width="100" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.userId)">
                        {{ row.userId }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('账号（代理）')" min-width="140" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.userId)">
                        {{ row.user.name }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="oldActiveAmount" :label="$t('可提现（变更前）')" min-width="160" align="center" />
            <el-table-column prop="activeAmount" :label="$t('已提现（变更后）')" min-width="160" align="center" />
            <el-table-column prop="tradeAmount" :label="$t('变更值')" min-width="100" align="center">
                <template #default="{ row }">
                    <span :style="{'color': row.tradeAmount < 0 ? 'red' : 'green'}">{{row.tradeAmount}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="remark" :label="$t('备注')" min-width="100" align="center" />
            <el-table-column prop="emp.name" :label="$t('操作人')" min-width="100" align="center" />
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>
        <AddDividendDialog v-if="state.showAddDialog" @close="state.showAddDialog = false" @fetchData="fetchData"></AddDividendDialog>
    </div>
</template>

<script setup name='agentDividendRecord'>
import { reactive, onMounted, defineAsyncComponent } from 'vue'
import { getAgentCommissionChanges } from '@/api/agent_system'
import { getShortcuts, getCurrentWeekTime, deepClone, disabledCurrentDateAfter } from '@/common/util'
const AddDividendDialog = defineAsyncComponent(() => import('./components/AddDividendDialog.vue'))

const shortcuts = getShortcuts()
const state = reactive({
    tableData: [],
    formData: {},
    selectType: 1,
    inputValue: '',
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    currentWeek: [],
    showAddDialog: false,
    currentItem: ''
})
const optionData = [
    { title: $t('代理账号'), type: 1, placeholder: $t('请输入代理账号'), key: 'accounts' },
    { title: $t('代理ID'), type: 2, placeholder: $t('请输入代理ID'), key: 'accounts' },
]

const valueInput = (val) => {
    if (state.selectType === 2) {
        state.inputValue = val.replace(/\D/g, '')
    }
}
onMounted(() => {
    state.currentWeek = getCurrentWeekTime()
    state.formData.receiveTime = deepClone(state.currentWeek)
    fetchData()
})

const fetchData = (val = '') => {
    if (val) {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {}
            state.inputValue = ''
            state.formData.receiveTime = deepClone(getCurrentWeekTime())
        }
    }
    const { formData, selectType, inputValue } = state
    let params = {
        ...state.listQuery
    }
    if (formData.receiveTime) {
        params['interval.begin'] = formData.receiveTime[0]
        params['interval.end'] = formData.receiveTime[1]
    }

    if (selectType === 1 && inputValue) params.username = inputValue
    if (selectType === 2 && inputValue) params.userId = inputValue
    globalVBus.$emit('globalLoading', true)
    getAgentCommissionChanges(params).then(res => {
        let { total, list } = res.data
        state.tableData = list.map(item => {
            item.addTime && (item.addTime = dateFormat(item.addTime))
            item.updateTime && (item.updateTime = dateFormat(item.updateTime))
            return item
        })
        state.total = total || 0
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

const handleAdd = () => {
    state.showAddDialog = true
}

// 查看会员详情
const showMemberDetail = (id) => {
    globalVBus.$emit('memberDetailDialog', id)
}
</script>

<style lang="scss">
.agent-dividend-record-page {
    .tips {
        background: #e9f6fe;
        border: 1px solid #49a4ea;
        padding: 10px 20px;
        margin-bottom: 10px;
    }
}
</style>