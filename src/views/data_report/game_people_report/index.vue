<template>
    <!-- 游戏人数报表 -->
    <div class="container">
        <el-form class="filter-form" :model="state.formData" inline>

            <el-form-item>
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')"
                    :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" :clearable="false" value-format="YYYY-MM-DD">
                </el-date-picker>
            </el-form-item>
            <el-form-item :label="$t('站点:')">
                <MerchantSiteSelect isShowAll isNeedDefault :clearable="false" style="width: 200px" v-model="state.formData.id" />
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
        <div class="tips-box">{{ $t('数据更新时间：每小时') }}</div>
        <el-table :data="state.tableData" class="table-box" border :row-class-name="({row,rowIndex}) => (rowIndex === 0 ? 'total-row': '')">
            <el-table-column prop="period" :label="$t('日期')" width="120" align="center" />
            <el-table-column prop="playerCount" :label="$t('游戏人数总计')" min-width="120" align="center" />
            <el-table-column 
              v-for="provider in gameProviders"
              :key="provider.name"
              :prop="'vendorPlayers.' + provider.name"
              :label="$t(provider.label)"
              min-width="100"
              align="center"
            />
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>

    </div>
</template>

<script setup name="gamePeopleReport">
import { reactive, onMounted, computed } from "vue"
import { useRoute } from 'vue-router'
import { getPlayerCount } from '@/api/statistics.js'
import { getShortcuts, getTimeRange, deepClone, disabledCurrentDateAfter } from '@/common/util'

let shortcuts = getShortcuts()
const state = reactive({
    tableData: [],
    formData: {},
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    currentTime: [],
    merchantInfo: {}
})
const route = useRoute()

onMounted(() => {
    const { query = {} } = route
    state.currentTime = query.nowTime ? [query.nowTime, query.nowTime] : getTimeRange()
    state.formData.receiveTime = deepClone(state.currentTime)
    state.merchantInfo = JSON.parse(localStorage.getItem('merchant_info'))
    fetchData()
})

const isGameField = (val) => {
  return state.tableData.some(item => item.vendorPlayers?.[val] !== undefined)
}
const gameProviders = computed(() => {
  if (!state.tableData.length) return [];
  
  const vendors = state.tableData[0].vendorPlayers || {};
  return Object.entries(vendors)
    .filter(([key]) => isGameField(key))
    .map(([key]) => ({
      name: key,
      label: key
    }));
})

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val && val !== 'export') {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {
                id: 0,
                receiveTime: deepClone(state.currentTime)
            }
        }
    }
    let params = {
        ...state.listQuery,
        ...state.formData
    }
    let { receiveTime } = state.formData
    if (receiveTime && receiveTime.length) {
        params['interval.begin'] = receiveTime[0]
        params['interval.end'] = receiveTime[1]
    }
    if (params.id === 0) { delete params.id }
    delete params.receiveTime
    if (val === 'export') params.isExport = true
    globalVBus.$emit('globalLoading', true)
    getPlayerCount(params).then(({ data = {}, ext = {} }) => {
        if (!params.isExport) {
            state.tableData = data || []
            if (state.tableData.length) {
                state.tableData.unshift({
                    ...ext,
                    period: $t('总计')
                })
            }
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss">
</style>