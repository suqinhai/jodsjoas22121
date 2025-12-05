<template>
    <!-- 回收数据 -->
    <div class="container">
        <el-form class="filter-form" :model="state.formData" inline>
            <el-form-item>
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')"
                    :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" value-format="YYYY-MM-DD">
                </el-date-picker>
            </el-form-item>
            <el-form-item :label="$t('渠道:')">
                <el-select class="select-box" v-model="state.formData.channelId" :placeholder="$t('请选择渠道')" filterable>
                    <el-option v-for="item in channelData" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item v-permiss="'merchant.channel.editCostDaily'">
                <el-button v-throttle type="primary" @click="state.showDeployDialog = true">{{$t('买量配置')}}</el-button>
            </el-form-item>
        </el-form>
        <div class="tips-box">{{$t('数据更新时间：隔天')}}</div>
        <el-table :data="state.tableData" class="table-box" border>
            <el-table-column prop="reportTime_" :label="$t('统计日期')" min-width="120" align="center" />
            <el-table-column prop="channelCost_" :label="$t('买量成本')" min-width="120" align="center" />
            <el-table-column prop="userCount" :label="$t('当日注册人数')" min-width="140" align="center" />
            <el-table-column prop="downloadTemplate_" :label="$t('当日ROI')" min-width="120" align="center">
                <template #default="{ row }">
                    {{row.rechargeRoi || 0}}%
                </template>
            </el-table-column>
            <el-table-column prop="rechargeUserCount" :label="$t('当日充值人数')" min-width="140" align="center" />
            <el-table-column prop="rechargeAmount" :label="$t('当日充值金额')" min-width="140" align="center" />
            <el-table-column prop="downloadTemplate_" :label="$t('次日ROI')" min-width="120" align="center">
                <template #default="{ row }">
                    {{row.recharge2Roi || 0}}%
                </template>
            </el-table-column>
            <el-table-column prop="recharge2dUserCount" :label="$t('次日充值人数')" min-width="140" align="center" />
            <el-table-column prop="recharge2dAmount_" :label="$t('次日充值金额')" min-width="140" align="center" />
            <el-table-column prop="downloadTemplate_" :label="$t('3日ROI')" min-width="120" align="center">
                <template #default="{ row }">
                    {{row.recharge3Roi || 0}}%
                </template>
            </el-table-column>
            <el-table-column prop="recharge3dUserCount" :label="$t('3日充值人数')" min-width="140" align="center" />
            <el-table-column prop="recharge3dAmount_" :label="$t('3日充值金额')" min-width="140" align="center" />
            <el-table-column prop="downloadTemplate_" :label="$t('5日ROI')" min-width="120" align="center">
                <template #default="{ row }">
                    {{row.recharge5Roi || 0}}%
                </template>
            </el-table-column>
            <el-table-column prop="recharge5dUserCount" :label="$t('5日充值人数')" min-width="140" align="center" />
            <el-table-column prop="recharge5dAmount_" :label="$t('5日充值金额')" min-width="140" align="center" />
            <el-table-column prop="downloadTemplate_" :label="$t('7日ROI')" min-width="120" align="center">
                <template #default="{ row }">
                    {{row.recharge7Roi || 0}}%
                </template>
            </el-table-column>
            <el-table-column prop="recharge7dUserCount" :label="$t('7日充值人数')" min-width="140" align="center" />
            <el-table-column prop="recharge7dAmount_" :label="$t('7日充值金额')" min-width="140" align="center" />
            <el-table-column prop="downloadTemplate_" :label="$t('15日ROI')" min-width="120" align="center">
                <template #default="{ row }">
                    {{row.recharge15Roi || 0}}%
                </template>
            </el-table-column>
            <el-table-column prop="recharge15dUserCount" :label="$t('15日充值人数')" min-width="140" align="center" />
            <el-table-column prop="recharge15dAmount_" :label="$t('15日充值金额')" min-width="140" align="center" />
            <el-table-column prop="downloadTemplate_" :label="$t('30日ROI')" min-width="120" align="center">
                <template #default="{ row }">
                    {{row.recharge30Roi || 0}}%
                </template>
            </el-table-column>
            <el-table-column prop="recharge30dUserCount" :label="$t('30日充值人数')" min-width="140" align="center" />
            <el-table-column prop="recharge30dAmount_" :label="$t('30日充值金额')" min-width="140" align="center" />
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>

        <DeployDialog v-if="state.showDeployDialog" :channelData="channelData" @close="state.showDeployDialog = false" @fetchData="fetchData">
        </DeployDialog>
    </div>
</template>

<script setup name="recoverData">
import { ref, reactive, onMounted, defineAsyncComponent } from "vue"
import userStore from '@/store/user'
import { getLaunchDataSummary } from '@/api/statistics.js'
import { getChannelData } from '@/api/common'
import { getShortcuts, disabledCurrentDateAfter } from '@/common/util'
const DeployDialog = defineAsyncComponent(() => import('./components/DeployDialog.vue'))

let shortcuts = getShortcuts()
const state = reactive({
    tableData: [],
    formData: {},
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    showDeployDialog: false,
})
const channelData = ref([])
const userData = userStore()

onMounted(() => {
    globalVBus.$emit('globalLoading', true)
    getChannelData().then(res => {
        channelData.value = res.data || []
        if (channelData.value.length) {
            state.formData.channelId = channelData.value[0].id
            fetchData()
        } else {
            globalVBus.$emit('globalLoading', false)
        }
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
})

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val) {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {
                channelId: channelData.value.length ? channelData.value[0].id : ''
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
    getLaunchDataSummary(params).then(res => {
        let { total, list } = res.data
        state.tableData = list || []
        state.total = total
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss" scoped>
</style>
