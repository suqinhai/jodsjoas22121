<template>
    <!-- 财务中心-会员提现配置-出款统计 -->
    <div class="disbursement-statistics">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item>
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" value-format="YYYY-MM-DD" :start-placeholder="$t('开始时间')"
                    :end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" />
            </el-form-item>
            <el-form-item :label="$t('三方支付:')" v-if="!offline">
                <el-select class="select-box" v-model="state.formData.channel" clearable :placeholder="$t('请选择三方支付类型')">
                    <el-option v-for="item in metaData.payChannel" :key="item.value" :label="item.label" :value="item.value" />
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
        <el-table :data="state.tableData" border>
            <el-table-column v-if="!offline" prop="channel_" :label="$t('三方代付')" min-width="120" align="center" />
            <el-table-column v-if="offline" prop="channel_" :label="$t('通道名称')" min-width="120" align="center" />
            <el-table-column prop="numberPeople" :label="$t('提现人数')" min-width="120" align="center" />
            <el-table-column prop="count" :label="$t('总订单量')" min-width="120" align="center" />
            <el-table-column prop="successCount" :label="$t('成功订单量')" min-width="120" align="center" />
            <el-table-column prop="amount" :label="$t('成功总金额')" min-width="120" align="center" />
        </el-table>
    </div>
</template>

<script setup>
import { reactive, onMounted, defineProps } from 'vue'
import { getPaymentStatisticsList } from '@/api/finance'
import { getCommonMeta } from '@/api/common'
import { getShortcuts, disabledCurrentDateAfter } from '@/common/util'

const shortcuts = getShortcuts()
const props = defineProps({
    offline: {
        type: Boolean,
        default: false
    }
})
const state = reactive({
    formData: {},
    tableData: [],
})
let metaData = reactive({
    payChannel: []
})

getCommonMeta({ types: 'payChannel' }).then(res => {
    metaData = Object.assign(metaData, res.data || {})
})

onMounted(() => {
    fetchData()
})

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val === 'reset') state.formData = {}
    let params = {}
    let { receiveTime, channel = '' } = state.formData
    if (receiveTime && receiveTime.length) {
        params['interval.begin'] = receiveTime[0]
        params['interval.end'] = receiveTime[1]
    }
    params.channel = channel
    params.offline = props.offline
    if (val === 'export') params.isExport = true
    globalVBus.$emit('globalLoading', true)
    getPaymentStatisticsList(params).then(res => {
        if (!params.isExport) {
            state.tableData = res.data || []
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        if (!params.isExport) state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss">
.disbursement-statistics {
    padding-bottom: 40px;
}
</style>
