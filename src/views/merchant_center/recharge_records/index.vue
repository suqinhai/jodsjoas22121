<template>
    <!-- 充值记录 -->
    <div class="container recharge-records">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item :label="$t('充币日期:')">
                <el-date-picker v-model="state.formData.date" type="daterange" :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')"
                    value-format="YYYY-MM-DD" :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" />
            </el-form-item>
            <el-form-item :label="$t('订单号:')">
                <el-input v-model="state.formData.orderNo" />
            </el-form-item>
            <el-form-item :label="$t('状态:')">
                <el-select class="select-box" v-model="state.formData.status" clearable :placeholder="$t('请选择状态')">
                    <el-option v-for="(item, index) in metaData.rechargeStatus" :key="index" :value="item.value" :label="item.label"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('类型:')">
                <el-select class="select-box" v-model="state.formData.payType" clearable :placeholder="$t('请选择类型')">
                    <el-option v-for="(item, index) in metaData.payType" :key="index" :value="item.value" :label="item.label" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
        </el-form>

        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column prop="orderNo" :label="$t('订单号')" min-width="140" align="center" />
            <el-table-column prop="payType_" :label="$t('订单类型')" min-width="120" align="center" />
            <el-table-column prop="addTime" :label="$t('充币时间')" min-width="160" align="center">
                <template #default="{ row }">
                    {{ dateFormat(row.addTime, 'YYYY-MM-DD HH:II:SS') }}
                </template>
            </el-table-column>
            <el-table-column prop="amount" :label="$t('充币订单金额')" min-width="140" align="center" />
            <el-table-column prop="totalAmount" :label="$t('实际到账金额(U)')" min-width="140" align="center" />
            <el-table-column prop="giftAmount" :label="$t('赠送金额(U)')" min-width="120" align="center" />
            <el-table-column prop="emp.name" :label="$t('申请人')" min-width="100" align="center" />
            <el-table-column prop="txId" :label="$t('区块链id')" min-width="200" align="center" />
            <el-table-column prop="toAddr" :label="$t('充币地址')" min-width="200" align="center" />
            <el-table-column prop="addTime" :label="$t('下单时间')" min-width="160" align="center">
                <template #default="{ row }">
                    {{ dateFormat(row.addTime) }}
                </template>
            </el-table-column>
            <el-table-column prop="updateTime" :label="$t('到账时间')" min-width="160" align="center">
                <template #default="{ row }">
                    {{ dateFormat(row.updateTime) }}
                </template>
            </el-table-column>
            <el-table-column prop="status_" :label="$t('状态')" min-width="100" align="center">
                <template #default="{ row }">
                    <span :style="`color:${row.status === 9?'green':row.status === -9?'red':'blue'}`">{{ row.status_}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="emp.name" :label="$t('审核人')" min-width="100" align="center" />
            <!-- <el-table-column prop="" :label="$t('审核时间')" min-width="100" align="center"/>
            <el-table-column prop="" :label="$t('备注')" min-width="120" align="center"/> -->
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:page="state.listQuery._page" v-model:limit="state.listQuery._size"
            @pagination="fetchData" />
    </div>
</template>

<script setup name="rechargeRecords">
import { reactive, onMounted } from 'vue'
import { merchantRechargeList } from '@/api/merchant_center'
import { getCommonMeta } from '@/api/common.js'
import { dateFormat, getShortcuts, disabledCurrentDateAfter } from '@/common/util';

const shortcuts = getShortcuts()
const state = reactive({
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    formData: {},
})
let metaData = reactive({
    rechargeStatus: [],
    payType: [],
})

getCommonMeta({ types: 'rechargeStatus,payType' }).then(({ data, code }) => {
    if (code === 0 && data) {
        metaData = Object.assign(metaData, data)
    }
})

onMounted(() => {
    fetchData()
})

const fetchData = (val = '') => {
    if (val) {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {}
        }
    }
    let params = { ...state.listQuery, ...state.formData }
    let { date } = state.formData
    if (date && date.length) {
        params['interval.begin'] = date[0]
        params['interval.end'] = date[1]
    }
    delete params.date
    globalVBus.$emit('globalLoading', true)
    merchantRechargeList(params).then(res => {
        if (res.code === 0) {
            let { total, list } = res.data
            state.tableData = list || []
            state.total = total || 0
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang='scss'>
.recharge-records {
}
</style>