<template>
    <!-- 账变记录 -->
    <div class="container billChangeLog">
        <el-form class="filter-form" :model="state.searchData" inline>
            <el-form-item>
                <el-date-picker v-model="state.searchData.receiveTime" type="datetimerange" format="YYYY-MM-DD HH:mm:ss"
                    value-format="YYYY-MM-DD HH:mm:ss" :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter"
                    :default-time="defaultTime" :shortcuts="shortcuts" :clearable="false" />
            </el-form-item>
            <el-form-item>
                <el-select style="width: 100px" v-model="state.searchData.queryType" @change="state.searchData.queryVal = ''">
                    <el-option v-for="item in metaData.inputTypeList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <div v-if="state.searchData.queryType !== 3">
                    <el-input v-model="state.searchData.queryVal" :placeholder="placeholderLabel" />
                </div>
                <el-select v-if="state.searchData.queryType === 3" v-model="state.searchData.queryVal" :placeholder="$t('请选择注册来源')">
                    <el-option v-for="item in metaData.userSource" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('会员ID:')">
                <el-input @input="(val) => state.searchData.userId = val.replace(/\D/g,'')" v-model="state.searchData.userId" :placeholder="$t('请输入会员ID')" />
            </el-form-item>
            <el-form-item :label="$t('交易类型:')">
                <el-select class="select-box" v-model="state.searchData.tradeType" clearable :placeholder="$t('请选择交易类型')">
                    <el-option v-for="item in metaData.coinTradeType" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('')">{{$t('刷 新')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('export')">{{$t('导出报表')}}</el-button>
            </el-form-item>
        </el-form>
        <div class="tips-box">{{$t('数据更新时间：隔天')}}</div>
        <el-table class="table-box" :data="state.tableList" border
            :row-class-name="({row,rowIndex}) => (rowIndex + 2 >= state.tableList.length && state.isStatistics  ? 'total-row': '')">
            <el-table-column prop="id" :label="$t('单号')" align="center" min-width="100" />
            <el-table-column :label="$t('交易时间')" align="center" min-width="160">
                <template #default="{ row }">
                    <span>{{row.addTime && dateFormat(row.addTime) }}</span>
                </template>
            </el-table-column>
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
            <el-table-column prop="source_" :label="$t('注册来源')" align="center" min-width="120" />
            <el-table-column prop="tradeType_" :label="$t('类型')" align="center" min-width="120" />
            <el-table-column prop="oldActiveAmount" :label="$t('变动前余额')" align="center" min-width="120" />
            <el-table-column :label="$t('变动金额')" align="center" min-width="120">
                <template #default="{ row }">
                    <span :style="{'color': row.tradeAmount < 0 ? 'red' : 'green'}">{{row.tradeAmount}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="activeAmount" :label="$t('变动后余额')" align="center" min-width="120" />
            <el-table-column prop="remark" :label="$t('备注')" align="center" min-width="160" />
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:page="pageConfig._page" v-model:limit="pageConfig._size"
            @pagination="fetchData">
        </Pagination>
    </div>
</template>

<script setup name="billChangeLog">
import { computed, reactive, onMounted } from "vue";
import { coinChangeLogApi } from "@/api/statistics.js";
import { getCommonMeta } from '@/api/common'
import { dateFormat, getTimeRange, getShortcuts, disabledCurrentDateAfter, getDefaultTime } from "@/common/util/index"

const shortcuts = getShortcuts()
const defaultTime = getDefaultTime()
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
    isStatistics: false,
    ininTime: [],
})
let metaData = reactive({
    inputTypeList: [
        { label: $t('会员账号'), value: 1, placeholder: $t('请输入会员账号') },
        { label: $t('单号'), value: 2, placeholder: $t('请输入单号') },
        { label: $t('注册来源'), value: 3, placeholder: '' },
    ],
    coinTradeType: [],
    userSource: [],
})

let placeholderLabel = computed(() => {
    return metaData.inputTypeList.find(item => item.value === state.searchData.queryType)?.placeholder || ''
});

getCommonMeta({ types: 'coinTradeType,userSource' }).then(res => {
    metaData = Object.assign(metaData, res.data || {})
})

onMounted(() => {
    state.searchData.receiveTime = [getTimeRange(1)[0] + ' 00:00:00', getTimeRange(1)[1] + ' 23:59:59']
    fetchData()
})

const fetchData = (val = '') => {
    if (val && val !== 'export') {
        pageConfig._page = 1
        if (val === 'reset') {
            state.searchData = {
                queryType: 1,
                receiveTime: [getTimeRange(1)[0] + ' 00:00:00', getTimeRange(1)[1] + ' 23:59:59']
            }
        }
    }
    let params = {
        ...state.searchData,
        ...pageConfig,
    }
    let { receiveTime } = state.searchData
    if (receiveTime && receiveTime.length) {
        params['interval.begin'] = receiveTime[0]
        params["interval.end"] = receiveTime[1] + '.999'
    }
    delete params.receiveTime
    if (val === 'export') params.isExport = true
    globalVBus.$emit('globalLoading', true)
    coinChangeLogApi(params).then(res => {
        if (!params.isExport) {
            state.tableList = []
            let { total, list } = res.data
            state.tableList = list || []
            state.total = total
            state.isStatistics = !!res.ext
            if (res.ext && state.tableList.length) {
                state.tableList.push({
                    id: $t('小计'),
                    tradeAmount: res.ext ? res.ext.subtotal : ''
                })
                state.tableList.push({
                    id: $t('总计'),
                    tradeAmount: res.ext ? res.ext.total : ''
                })
            }
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
.billChangeLog {
    .el-table .total-row > .el-table__cell {
        background-color: #f1ca8c;
    }
}
</style>
