<template>
    <!-- 代理中心-C版返佣记录-投注返佣记录 -->
    <div class="tabs-main">
        <el-form class="filter-form" inline>
            <el-form-item>
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')"
                    :shortcuts="shortcuts" :disabled-date="disabledCurrentDateAfter" value-format="YYYY-MM-DD">
                </el-date-picker>
            </el-form-item>
            <el-form-item :label="$t('投注人账号') + ':'">
                <el-input v-model="state.formData.sourceUsername" :placeholder="$t('请输入投注人账号')" />
            </el-form-item>
            <el-form-item :label="$t('受益人账号') + ':'">
                <el-input v-model="state.formData.username" :placeholder="$t('请输入受益人账号')" />
            </el-form-item>
            <el-form-item :label="$t('游戏类型:')">
                <el-select class="select-box" v-model="state.formData.gameType" :placeholder="$t('请选择游戏类型')" clearable>
                    <el-option v-for="item in state.gameTypeList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('export')">{{$t('导 出')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table :data="state.tableData" class="table-box" border :row-class-name="({row}) => (row.isTotal ? 'total-row': '')">
            <el-table-column prop="settleDate" :label="$t('结算日期')" width="120" align="center" />
            <el-table-column prop="gameType" :label="$t('游戏类型')" min-width="100" align="center" />
            <el-table-column :label="$t('投注人账号')" min-width="120" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.source.id)">
                        {{ row.source?.name || ''  }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="bizVal" :label="$t('有效投注')" min-width="100" align="center" />
            <el-table-column :label="$t('受益人账号')" min-width="120" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.user.id)">
                        {{ row.user?.name || ''  }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="level" :label="$t('所属返佣层级')" min-width="120" align="center" />
            <el-table-column prop="bizRate" :label="$t('投注返佣比例%')" min-width="130" align="center" />
            <el-table-column prop="commission" :label="$t('投注返佣金额')" min-width="120" align="center" />
            <el-table-column prop="addTime" :label="$t('发放时间')" min-width="160" align="center" />
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>
    </div>
</template>

<script setup>
import { reactive, onMounted } from "vue"
import { getAgentBetRebateLog } from '@/api/agent'
import { getCommonMeta } from '@/api/common'
import { getShortcuts, dateFormat, disabledCurrentDateAfter } from '@/common/util'

const shortcuts = getShortcuts()
const state = reactive({
    formData: {},
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    gameTypeList: []
})

getCommonMeta({ types: 'gameType' }).then(({ data, status }) => {
    if (status === 'OK' && data) {
        state.gameTypeList = data.gameType
    }
})

onMounted(() => {
    fetchData()
})

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val && val !== 'export') {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {}
        }
    }
    let params = { ...state.listQuery, ...state.formData }
    let { receiveTime } = state.formData
    if (receiveTime && receiveTime.length) {
        params['interval.begin'] = receiveTime[0]
        params['interval.end'] = receiveTime[1]
    }
    delete params.receiveTime
    if (val === 'export') params.isExport = true
    globalVBus.$emit('globalLoading', true)
    getAgentBetRebateLog(params).then(({ data = {}, ext = {} }) => {
        if (!params.isExport) {
            let { total, list } = data
            state.tableData = list || []
            state.tableData = list.map(item => {
                item.addTime && (item.addTime = dateFormat(item.addTime))
                return item
            })
            if (state.tableData.length && ext.total) {
                state.tableData.unshift({
                    ...ext.total,
                    settleDate: $t('总计'),
                    isTotal: true,
                })
            }
            state.total = total
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        if (!params.isExport) state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

// 查看会员详情
const showMemberDetail = (id) => {
    globalVBus.$emit('memberDetailDialog', id)
}
</script>

<style lang="scss">
</style>
