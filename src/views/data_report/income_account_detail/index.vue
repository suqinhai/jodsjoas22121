<template>
    <!-- 存钱宝明细 -->
    <div class="container balance-account-details">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item>
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" value-format="YYYY-MM-DD" :start-placeholder="$t('开始时间')"
                    :end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" />
            </el-form-item>
            <el-form-item :label="$t('变动类型:')">
                <el-select class="select-box" v-model="state.formData.tradeType" :placeholder="$t('请选择变动类型')" clearable>
                    <el-option v-for="item in metaData.incomeTransType" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('会员账号:')">
                <el-input v-model="state.formData.username" :placeholder="$t('请输入会员账号')" />
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('export')">{{$t('导出表格')}}</el-button>
            </el-form-item>
        </el-form>
        <div class="tips-box">{{$t('数据更新时间：实时')}}</div>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column prop="id" :label="$t('单号')" min-width="100" align="center" />
            <el-table-column :label="$t('会员ID')" min-width="120" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.user.id)">{{row.user?.id || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('会员账号')" min-width="140" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.user.id)">{{row.user?.name || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="tradeType_" :label="$t('变动类型')" min-width="140" align="center" />
            <el-table-column prop="beforeAmount" :label="$t('变动前存钱宝')" min-width="120" align="center" />
            <el-table-column prop="tradeAmount" :label="$t('变动金额')" min-width="120" align="center" />
            <el-table-column prop="afterAmount" min-width="120" align="center">
                <template #header>
                    <div>{{$t('变动后存钱宝')}}</div>
                    <div>{{$t('(本金+利息)')}}</div>
                </template>
            </el-table-column>
            <el-table-column prop="addTime" :label="$t('交易时间')" min-width="160" align="center" />
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>

        <!-- <DetailDialog v-if="state.showDialog" :itemData="state.itemData" @close="state.showDialog = false"></DetailDialog> -->
    </div>
</template>

<script setup name="balanceAccountDetails">
import { reactive, onMounted, defineAsyncComponent } from 'vue'
import { getIncomeAccountLogs } from "@/api/discounts_center.js"
import { getCommonMeta } from '@/api/common'
import { dateFormat, getShortcuts, disabledCurrentDateAfter } from '@/common/util'
// const DetailDialog = defineAsyncComponent(() => import("./components/DetailDialog.vue"))

const shortcuts = getShortcuts()
const state = reactive({
    formData: {},
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    itemData: {},
    showDialog: false,
})
let metaData = reactive({
    incomeTransType: [],
})

getCommonMeta({ types: 'incomeTransType' }).then(res => {
    metaData = Object.assign(metaData, res.data || {})
})

onMounted(() => {
    fetchData()
})

const fetchData = (val = '') => {
    if (val && val !== 'export') {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {}
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
    getIncomeAccountLogs(params).then(res => {
        if (!params.isExport) {
            let { total, list = [] } = res.data
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

const handleDetail = (row, key) => {
    state.itemData = { ...row }
    state[key] = true
}

// 查看会员详情
const showMemberDetail = (id) => {
    globalVBus.$emit('memberDetailDialog', id)
}
</script>

<style lang="scss" scoped>
.balance-account-details {
}
</style>
