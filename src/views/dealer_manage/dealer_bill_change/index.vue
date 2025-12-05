<template>
    <!-- 经销商账变 -->
    <div class="container dealer-bill-change">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item>
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" value-format="YYYY-MM-DD" :start-placeholder="$t('开始时间')"
                    :end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" />
            </el-form-item>
            <el-form-item>
                <el-select style="width: 100px" v-model="state.formData.queryType" @change="state.formData.queryVal = ''">
                    <el-option v-for="item in metaData.inputTypeList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <div v-if="state.formData.queryType !== 3" class="wh150">
                    <el-input v-model="state.formData.queryVal" :placeholder="placeholderLabel" />
                </div>
				<div v-if="state.formData.queryType === 3" class="wh150">
					<el-select v-model="state.formData.queryVal" :placeholder="$t('请选择注册来源')">
						<el-option v-for="item in metaData.userSource" :key="item.value" :label="item.label" :value="item.value" />
					</el-select>
				</div>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <!-- <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('export')">{{$t('导出表格')}}</el-button>
            </el-form-item> -->
            <!-- <el-form-item v-permiss="'admin.merchant-account-adjust-log.overdraft'">
                <el-button v-throttle type="primary" @click="handleSet">{{$t('提现设置')}}</el-button>
            </el-form-item> -->
        </el-form>
        <el-table class="table-box" :data="state.tableData" border>
            <!-- :row-class-name="({row,rowIndex}) => (rowIndex + 2 >= state.tableData.length && state.isStatistics  ? 'total-row': '')"> -->
            <el-table-column prop="id" :label="$t('单号')" min-width="100" align="center" />
            <el-table-column prop="addTime" :label="$t('交易时间')" min-width="160" align="center" />
            <el-table-column :label="$t('会员ID')" min-width="120" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.userId)">{{row.userId || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('会员账号')" min-width="140" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.userId)">{{row.user?.name || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="source_" :label="$t('注册来源')" min-width="120" align="center" />
            <el-table-column prop="tradeType_" :label="$t('类型细项')" min-width="120" align="center" />
            <el-table-column prop="oldActiveAmount" :label="$t('变动前余额')" min-width="140" align="center" />
            <el-table-column :label="$t('变动金额')" min-width="140" align="center">
                <template #default="{ row }">
                    <span :style="{'color': row.tradeAmount >= 0 ? 'green' : 'red'}">{{row.tradeAmount || 0}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="activeAmount" :label="$t('变动后余额')" min-width="140" align="center" />
            <el-table-column prop="remark" :label="$t('备注')" min-width="160" align="center" />
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>

        <WithdrawalDeploy v-if="state.showWithdrawalSet" :itemData="state.itemData" @close="state.showWithdrawalSet = false">
        </WithdrawalDeploy>
    </div>
</template>

<script setup name="dealerBillChange">
import { reactive, onMounted, defineAsyncComponent, computed } from 'vue'
import { getDealerBilChangelList } from "@/api/dealer.js"
import { dateFormat, getShortcuts, disabledCurrentDateAfter } from '@/common/util'
import { getCommonMeta } from '@/api/common'
const WithdrawalDeploy = defineAsyncComponent(() => import('./components/WithdrawalDeploy.vue'))

const shortcuts = getShortcuts()
const state = reactive({
    formData: {
        queryType: 1
    },
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    itemData: {},
    showWithdrawalSet: false,
    isStatistics: false,
})
let metaData = reactive({
    inputTypeList: [
        { label: $t('会员账号'), value: 1, placeholder: $t('请输入会员账号') },
        { label: $t('单号'), value: 2, placeholder: $t('请输入单号') },
        { label: $t('注册来源'), value: 3, placeholder: $t('请输入注册来源') },
    ],
    coinTradeType: [],
    userSource: [],
})

let placeholderLabel = computed(() => {
    return metaData.inputTypeList.find(item => item.value === state.formData.queryType)?.placeholder || ''
});

getCommonMeta({ types: 'coinTradeType,userSource' }).then(res => {
    metaData = Object.assign(metaData, res.data || {})
})

onMounted(() => {
    fetchData()
})

const fetchData = (val = '') => {
    if (val && val !== 'export') {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {
                queryType: 1
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
    globalVBus.$emit('globalLoading', true)
    getDealerBilChangelList(params).then(res => {
        state.tableData = []
        let { total, list = [] } = res.data
        state.tableData = list.map(item => {
            item.addTime && (item.addTime = dateFormat(item.addTime))
            return item
        })
        // state.isStatistics = !!res.ext
        // if (res.ext && state.tableData.length) {
        //     state.tableData.push({
        //         id: $t('小计'),
        //         tradeAmount: res.ext ? res.ext.subtotal : ''
        //     })
        //     state.tableData.push({
        //         id: $t('总计'),
        //         tradeAmount: res.ext ? res.ext.total : ''
        //     })
        // }
        state.total = total
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

// 查看会员详情
const showMemberDetail = (id) => {
    globalVBus.$emit('memberDetailDialog', id)
}

const handleSet = () => {
    // globalVBus.$emit('globalLoading', true)
    // getMerchantAmendList(params).then(res => {
    //     state.itemData = res.data || {}
    //     state.showWithdrawalSet = true
    //     globalVBus.$emit('globalLoading', false)
    // }).catch(err => {
    //     globalVBus.$emit('globalLoading', false)
    // })
}

</script>

<style lang="scss">
.dealer-bill-change {
    .el-table .total-row > .el-table__cell {
        background-color: #f1ca8c;
    }
}
.wh150{
	width: 150px;
}
</style>
