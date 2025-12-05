<template>
    <!-- 财务中心-支付通道数据-列表 -->
    <div class="container-main">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item>
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" value-format="YYYY-MM-DD" :start-placeholder="$t('开始时间')"
                    :end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" />
            </el-form-item>
            <el-form-item>
                <el-select v-model="state.formData.cashType">
                    <el-option :label="$t('充值')" :value="1"></el-option>
                    <el-option v-if="tab !== 2" :label="$t('提现')" :value="2"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('支付通道:')" v-if="!mockTransfer">
                <el-select v-model="state.formData.channel" clearable :placeholder="$t('请选择支付通道')">
                    <el-option v-for="item in state.payChannel" :key="item.value" :label="item.label" :value="+item.value" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('支付方式:')" v-if="mockTransfer">
                <el-select v-model="state.formData.payCode" clearable :placeholder="$t('请选择支付方式')">
                    <el-option v-for="item in state.payScopeList" :key="item" :label="item.label" :value="item.value" />
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
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column prop="date" :label="$t('日期')" min-width="140" align="center" />
            <el-table-column v-if="!mockTransfer" prop="channel_" :label="$t('通道名称')" min-width="140" align="center" />
            <el-table-column v-if="mockTransfer" prop="payCode" :label="$t('支付方式')" min-width="140" align="center" />
            <el-table-column prop="userNum" :label="$t('总人数')" min-width="155" align="center" />
            <el-table-column prop="successUserNum" :label="$t('成功人数')" min-width="155" align="center" />
            <!-- <el-table-column prop="userNum" :label="$t('充值人数')" min-width="155" align="center" /> -->
            <el-table-column prop="totalNum" :label="$t('总订单数')" min-width="180" align="center" />
            <el-table-column prop="successNum" :label="$t('成功订单数')" min-width="220" align="center" />
            <el-table-column prop="successSum" :label="$t('成功总金额')" min-width="200" align="center" />
            <el-table-column prop="failSum" :label="$t('失败总金额')" min-width="200" align="center" />
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>
    </div>
</template>

<script setup name="thirdpartyList">
import { reactive, onMounted } from 'vue'
import { getChannelRechargeLogList, getPayChannelList, getBankOfflineWallet, getChannelWithdrawLogList } from '@/api/finance'
import { dateFormat, getShortcuts, disabledCurrentDateAfter } from '@/common/util'

const shortcuts = getShortcuts()
const props = defineProps({
    mockTransfer: {
        type: Boolean,
        default: false
    },
    tab: {
        type: Number,
        default: 1
    },
})
const state = reactive({
    tableData: [],
    formData: {
        cashType: 1
    },
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    payChannel: [],
    payScopeList: [],
})

onMounted(() => {
    if (!props.mockTransfer) {
        getPayChannelList().then(res => {
            if (res.data && res.data.length) {
                state.payChannel = res.data.filter(item => +item.value)
            }
        })
    } else {
        getBankOfflineWallet().then(res => {
            if (res.data && res.data.value) {
                state.payScopeList = JSON.parse(res.data.value)
            }
        })
    }
    fetchData()
})

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val && val !== 'export') {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {
                cashType: 1
            }
        }
    }
    let params = { ...state.listQuery, ...state.formData }
    let { receiveTime } = state.formData
    if (receiveTime && receiveTime.length) {
        params['interval.begin'] = receiveTime[0]
        params['interval.end'] = receiveTime[1]
    }
    params.mockTransfer = props.mockTransfer
    delete params.receiveTime
    if (val === 'export') params.isExport = true
    globalVBus.$emit('globalLoading', true)
    const apiFn = params.cashType === 1 ? getChannelRechargeLogList : getChannelWithdrawLogList
    apiFn(params).then(res => {
        if (!params.isExport) {
            let { total, list } = res.data
            state.tableData = list.map(item => {
                item.addTime && (item.addTime = dateFormat(item.addTime, 'YYYY-MM-DD'))
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
</style>
