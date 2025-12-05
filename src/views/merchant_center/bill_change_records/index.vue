<template>
    <!-- 账变记录 -->
    <div class="container bill-change-records">
        <el-form class="filter-form" inline :model="formData">
            <el-form-item>
                <el-date-picker v-model="formData.date" type="daterange" :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')"
                    value-format="YYYY-MM-DD" :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" />
            </el-form-item>
            <el-form-item :label="$t('账变细项:')">
                <el-select class="select-box" v-model="formData.type" clearable :placeholder="$t('请选择账变细项')">
                    <el-option v-for="item in metaData.merchantTradeType" :key="item.value" :value="item.value" :label="item.label"></el-option>
                </el-select>
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
        <el-table class="table-box" :data="tableData" border>
            <el-table-column prop="addTime" :label="$t('账变时间')" min-width="100" align="center">
                <template #default="{ row }">
                    {{ dateFormat(row.addTime, 'YYYY-MM-DD HH:II:SS') }}
                </template>
            </el-table-column>
            <el-table-column prop="tradeTypeLabel" :label="$t('账变细项')" min-width="100" align="center" />
            <el-table-column prop="beforeAmount" :label="$t('变动前余额')" min-width="120" align="center" />
            <el-table-column prop="tradeAmount" :label="$t('变动金额')" min-width="120" align="center" />
            <el-table-column prop="totalAmount" :label="$t('变动后金额')" min-width="120" align="center" />
            <el-table-column prop="remark" :label="$t('备注')" min-width="160" align="center" />
        </el-table>
        <Pagination v-show="tableData.length > 0" :total="pageInfo.total" v-model:page="pageInfo.pageNum" v-model:limit="pageInfo.pageSize"
            @pagination="fetchData"></Pagination>
    </div>
</template>

<script setup name="billChangeRecords">
import { reactive, onMounted, defineAsyncComponent } from 'vue'
import { getCommonMeta } from '@/api/common.js'
import { dateFormat, getShortcuts, disabledCurrentDateAfter } from '@/common/util';
import { getAccountLogList } from '@/api/merchant_center'
const Pagination = defineAsyncComponent(() => import('@/components/Pagination/index.vue'))

const tableData = reactive([])
const pageInfo = reactive({
    pageSize: 10,
    pageNum: 1,
    total: 0
})
const formData = reactive({
    date: ['', ''],
    type: ''
})
const shortcuts = getShortcuts()
let metaData = reactive({
    merchantTradeType: []
})

getCommonMeta({ types: 'merchantTradeType' }).then(({ data, code }) => {
    if (code === 0 && data) {
        metaData = Object.assign(metaData, data)
    }
})

onMounted(() => {
    fetchData()
})

const fetchData = (val = '') => {
    if (val && val !== 'export') {
        pageInfo.pageNum = 1
        if (val === 'reset') {
            formData.date = ['', '']
            formData.type = ''
        }
    }
    let params = {
        _size: pageInfo.pageSize,
        _page: pageInfo.pageNum,
        'interval.begin': formData.date[0],
        'interval.end': formData.date[1],
        tradeType: formData.type
    }
    if (val === 'export') params.isExport = true
    globalVBus.$emit('globalLoading', true)
    getAccountLogList(params).then(res => {
        if (!params.isExport) {
            let { total, list = [] } = res.data
            tableData.length = 0
            tableData.push(...list)
            pageInfo.total = total || 0
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        if (!params.isExport) tableData.length = 0
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang='scss'>
.bill-change-records {
}
</style>