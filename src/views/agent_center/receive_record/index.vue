<template>
    <!-- 代理领取记录 -->
    <div class="container agent-receive-record">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item>
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" value-format="YYYY-MM-DD" :start-placeholder="$t('开始时间')"
                    :end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" />
            </el-form-item>
            <el-form-item :label="$t('代理账号:')">
                <el-input v-model="state.formData.username" :placeholder="$t('请输入代理账号')" />
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
        <div class="tips-box">{{$t('数据更新时间：隔天')}}</div>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column prop="orderNo" :label="$t('订单号')" min-width="200" align="center" />
            <el-table-column prop="addTime" :label="$t('领取时间')" min-width="160" align="center" />
            <el-table-column prop="userId" :label="$t('代理ID')" min-width="140" align="center" />
            <el-table-column prop="username" :label="$t('代理账号')" min-width="140" align="center" />
            <el-table-column prop="commission" :label="$t('领取金额')" min-width="120" align="center" />
        </el-table>

        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>
    </div>
</template>

<script setup name="agentReceiveRecord">
import { reactive, onMounted, onActivated } from 'vue'
import { useRoute } from 'vue-router'
import commonStore from '@/store/common'
import { getCommissionLogList } from '@/api/agent'
import { getShortcuts, dateFormat, disabledCurrentDateAfter } from '@/common/util'

const shortcuts = getShortcuts()
const state = reactive({
    formData: {},
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    username: '',
    jumpTime: [],
    isInit: true,
})
const route = useRoute()
const commonData = commonStore()

onMounted(() => {
    if (commonData.isManual) state.isInit = false
    getData()
})

onActivated(() => {
    if (state.isInit) return state.isInit = false
    const { query = {} } = route
    if (state.username !== query.username || ((state.jumpTime.length && (state.jumpTime[0] !== query.startTime || state.jumpTime[1] !== query.endTime)) || (!state.jumpTime.length && query.startTime))
    ) {
        getData()
    }
})

const getData = () => {
    const { query = {} } = route
    state.jumpTime = query.startTime ? [query.startTime, query.endTime] : []
    state.formData = {
        username: state.username,
        receiveTime: state.jumpTime.length ? [state.jumpTime[0], state.jumpTime[1]] : []
    }
    fetchData('search')
}

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val && val !== 'export') {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {
                username: state.username,
                receiveTime: state.jumpTime.length ? [state.jumpTime[0], state.jumpTime[1]] : []
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
    getCommissionLogList(params).then(res => {
        if (!params.isExport) {
            let { list, total } = res.data
            state.tableData = list.map(item => {
                item.addTime && (item.addTime = dateFormat(item.addTime))
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
</script>

<style lang="scss">
.agent-receive-record {
    .items-row {
        margin-right: 0 !important;
    }
    .agent-level {
        line-height: 30px;
        font-size: 16px;
        color: #000;
        font-weight: 700;
        &-main {
            font-size: 14px;
            font-weight: 400;
        }
    }
}
</style>
