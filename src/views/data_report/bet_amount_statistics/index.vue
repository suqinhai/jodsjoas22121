<template>
    <!-- 游戏投注数据 -->
    <div class="container">
        <el-form class="filter-form" :model="state.formData" inline>
            <el-form-item>
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')"
                    :shortcuts="shortcuts" :disabled-date="disabledCurrentDateAfter" :clearable="false" value-format="YYYY-MM-DD">
                </el-date-picker>
            </el-form-item>
            <el-form-item :label="$t('站点:')" v-if="commonData.merchantSiteList.length > 1">
                <MerchantSiteSelect isShowAll isNeedDefault :clearable="false" v-model="state.formData.merchantId">
                </MerchantSiteSelect>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
        </el-form>
        <div class="tips-box">{{$t('数据更新时间：每分钟')}}</div>
        <el-table :data="state.tableData" class="table-box" border>
            <el-table-column prop="reportTime_" :label="$t('日期')" width="120" align="center" />
            <el-table-column v-for="(item,index) in state.gameVendorList" :key="index" :label="item.label" min-width="140" align="center">
                <template #default="{ row }">
                    {{ row['validCoin' + (state.keyData[item.value] || '')] || 0}}
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>
    </div>
</template>

<script setup name="betAmountStatistics">
import { reactive, onMounted, onActivated } from 'vue'
import { useRoute } from "vue-router"
import { ElMessage } from 'element-plus'
import commonStore from '@/store/common'
import { getBetAmountList } from '@/api/statistics'
import { getCommonMeta } from "@/api/common"
import { getShortcuts, disabledCurrentDateAfter, getTimeRange } from '@/common/util'

const shortcuts = getShortcuts()
const state = reactive({
    formData: {},
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    gameVendorList: [],
    keyData: {},
    searchTime: '',
    merchantId: '',
    isInit: true
})
const route = useRoute()
const commonData = commonStore()

onMounted(async () => {
    try {
        if (commonData.isManual) state.isInit = false
        globalVBus.$emit('globalLoading', true)
        let { code, data } = await getCommonMeta({ types: 'gameVendor' })
        if (code == 0) {
            state.gameVendorList = data.gameVendor || []
        }
        const { query } = route
        state.merchantId = query.merchantId
        state.searchTime = query.endTime ? [query.startTime, query.endTime] : state.searchTime ? [] : ''
        state.formData = {
            merchantId: state.merchantId ? +state.merchantId : state.formData.merchantId,
            receiveTime: state.searchTime ? state.searchTime : getTimeRange(7, 0),
        }
        fetchData()
    } catch (error) {
        globalVBus.$emit('globalLoading', false)
    }

})

onActivated(() => {
    if (state.isInit) return state.isInit = false
    const { query } = route
    if (state.merchantId !== query.merchantId || ((state.searchTime.length && (state.searchTime[0] !== query.startTime || state.searchTime[1] !== query.endTime)) || (!state.searchTime.length && query.endTime))
    ) {
        state.merchantId = query.merchantId
        state.searchTime = query.endTime ? [query.startTime, query.endTime] : state.searchTime ? [] : ''
        state.formData = {
            merchantId: state.merchantId ? +state.merchantId : state.formData.merchantId,
            receiveTime: state.searchTime ? state.searchTime : getTimeRange(7, 0),
        }
        fetchData()
    }
})

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val) {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {
                receiveTime: state.searchTime ? state.searchTime : getTimeRange(7, 0),
                merchantId: state.merchantId ? +state.merchantId : commonData.merchantSiteList.length > 1 ? 0 : ''
            }
        }
    }
    let params = { ...state.listQuery, ...state.formData, tab: 1 }
    let { receiveTime } = state.formData
    if (receiveTime && receiveTime.length) {
        if (new Date(receiveTime[1] + ' 23:23:59').getTime() - new Date(receiveTime[0] + ' 00:00:00').getTime() > 31 * 24 * 60 * 60 * 1000) return ElMessage.warning('搜索时间范围不得超过31天！')
        params['interval.begin'] = receiveTime[0]
        params['interval.end'] = receiveTime[1]
    }
    delete params.receiveTime
    globalVBus.$emit('globalLoading', true)
    getBetAmountList(params).then(({ data = {}, ext = {} }) => {
        let { total, list } = data
        state.tableData = list || []
        state.keyData = ext.key || {}
        state.total = total
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss">
</style>
