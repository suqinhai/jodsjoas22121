<template>
    <!-- 经销商数据 -->
    <div class="container dealer-data">
        <el-form class="filter-form" :model="state.formData" inline>
            <el-form-item>
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')"
                    :shortcuts="shortcuts" :disabled-date="disabledCurrentDateAfter" :clearable="false" value-format="YYYY-MM-DD">
                </el-date-picker>
            </el-form-item>
            <el-form-item :label="$t('站点:')" v-if="commonData.merchantSiteList.length > 1">
                <MerchantSiteSelect isShowAll isNeedDefault :clearable="false" v-model="state.formData.siteId">
                </MerchantSiteSelect>
            </el-form-item>
            <el-form-item :label="$t('数据类型:')">
                <el-select v-model="state.formData.type" :placeholder="$t('请选择数据类型')" :clearable="false">
                    <el-option :label="$t('经销商整条链路')" :value="0" />
                    <el-option :label="$t('经销商成员数据')" :value="1" />
                    <el-option :label="$t('经销商三级数据')" :value="3" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('经销商账号:')">
                <el-input v-model="state.formData.username" :placeholder="$t('请输入经销商账号')" />
            </el-form-item>
            <el-form-item :label="$t('经销商ID:')">
                <el-input @input="(val) => state.formData.dealerId = val.replace(/\D/g,'')" v-model="state.formData.dealerId"
                    :placeholder="$t('请输入经销商ID')" />
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
        <div class="tips-box">{{$t('数据更新时间：每3分钟')}}</div>
        <el-table :data="state.tableData" class="table-box" border :row-class-name="({row,rowIndex}) => (!rowIndex ? 'total-row': '')">
            <el-table-column fixed="left" prop="reportTime" :label="$t('日期')" width="120" align="center" />
            <el-table-column prop="username" :label="$t('经销商账号')" min-width="140" align="center" />
            <el-table-column prop="dealerId" :label="$t('经销商ID')" min-width="120" align="center" />
            <el-table-column prop="modeName" :label="$t('经销商模式名称')" min-width="140" align="center" />
            <el-table-column prop="rebateModel" :label="$t('模式')" min-width="120" align="center" />
            <el-table-column prop="rechargeAmount" :label="$t('充值金额')" min-width="140" align="center" />
            <el-table-column prop="cashAmount" :label="$t('提现金额')" min-width="140" align="center" />
            <el-table-column prop="discountAmount" :label="$t('优惠金额')" min-width="140" align="center" />
            <el-table-column prop="rechargeCashDiff" :label="$t('充提差')" min-width="140" align="center" />
            <el-table-column prop="grossProfit" :label="$t('毛利润')" min-width="140" align="center" />
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>
    </div>
</template>

<script setup name="dealerData">
import { reactive, onMounted } from "vue"
import { ElMessage } from 'element-plus'
import commonStore from '@/store/common'
import { getDealerDataList } from '@/api/statistics'
import { disabledCurrentDateAfter, getShortcuts, getTimeRange } from '@/common/util'

const shortcuts = getShortcuts()
const state = reactive({
    formData: {
        type: 0
    },
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
})
const commonData = commonStore()

onMounted(() => {
    state.formData.receiveTime = getTimeRange()
    fetchData()
})

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val) {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {
                type: 0,
                receiveTime: getTimeRange(),
                siteId: commonData.merchantSiteList.length > 1 ? 0 : ''
            }
        }
    }
    let params = { ...state.listQuery, ...state.formData }
    let { receiveTime } = state.formData
    if (receiveTime && receiveTime.length) {
        if (new Date(receiveTime[1] + ' 23:23:59').getTime() - new Date(receiveTime[0] + ' 00:00:00').getTime() > 90 * 24 * 60 * 60 * 1000) return ElMessage.warning('搜索时间范围不得超过90天！')
        params['interval.begin'] = receiveTime[0]
        params['interval.end'] = receiveTime[1]
    }
    if (!params.siteId) delete params.siteId
    if (!params.type) delete params.type
    delete params.receiveTime
    if (val === 'export') params.isExport = true
    globalVBus.$emit('globalLoading', true)
    getDealerDataList(params).then(({ data = {} }) => {
        if (!params.isExport) {
            let { total, list } = data
            state.tableData = list || []
            state.total = total || 0
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        if (!params.isExport) state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss">
.dealer-data {
}
</style>
