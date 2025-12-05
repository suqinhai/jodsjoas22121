<template>
    <!-- 优惠数据 -->
    <div class="container discounts-statistics">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item>
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" value-format="YYYY-MM-DD" :start-placeholder="$t('开始时间')"
                    :end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" />
            </el-form-item>
            <el-form-item :label="$t('活动ID:')">
                <el-input v-model="state.formData.id" :placeholder="$t('请输入活动ID')" />
            </el-form-item>
            <el-form-item :label="$t('活动名称:')">
                <el-input v-model="state.formData.name" :placeholder="$t('请输入活动名称')" />
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
        <div class="tips-box">{{$t('注：优惠统计为实时统计（每分钟统计一次），统计数据不包括任务奖励。')}}</div>
        <el-table class="table-box" :data="state.tableData" border :row-class-name="({row,rowIndex}) => (!rowIndex ? 'total-row': '')">
            <el-table-column prop="promotionId" label="ID" min-width="60" align="center" />
            <el-table-column prop="name" :label="$t('活动名称')" min-width="200" align="center" />
            <el-table-column :label="$t('活动时间')" min-width="160" align="center">
                <template #default="{ row }">
                    <div>{{ row.beginTime }}</div>
                    <div>{{ row.endTime }}</div>
                </template>
            </el-table-column>
            <el-table-column prop="type_" :label="$t('活动类型')" min-width="100" align="center" />
            <el-table-column prop="status_" :label="$t('状态')" min-width="100" align="center" />
            <el-table-column min-width="120" align="center">
                <template #header>{{$t('已领取人数')}}
                    <el-tooltip effect="dark" :content="$t('已领取/派发到账总人数')" placement="top-start">
                        <el-icon class="pointer" :size="15">
                            <QuestionFilled />
                        </el-icon>
                    </el-tooltip>
                </template>
                <template #default="{ row }">
                    <span style="color: blue">{{ row.collectNum || 0 }}</span>
                </template>
            </el-table-column>
            <el-table-column min-width="120" align="center">
                <template #header>{{$t('已领取金额')}}
                    <el-tooltip effect="dark" :content="$t('已领取/派发到账总金额')" placement="top-start">
                        <el-icon class="pointer" :size="15">
                            <QuestionFilled />
                        </el-icon>
                    </el-tooltip>
                </template>
                <template #default="{ row }">
                    <span style="color: red">{{ row.collectAmount || 0 }}</span>
                </template>
            </el-table-column>
            <el-table-column min-width="120" align="center">
                <template #header>{{$t('活动金额')}}
                    <el-tooltip effect="dark" :content="$t('活动设置总金额')" placement="top-start">
                        <el-icon class="pointer" :size="15">
                            <QuestionFilled />
                        </el-icon>
                    </el-tooltip>
                </template>
                <template #default="{ row }">
                    {{ row.promotionAmount || 0 }}
                </template>
            </el-table-column>
        </el-table>

        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>
    </div>
</template>

<script setup name="discountsStatistics">
import { reactive, onMounted } from 'vue'
import { getDiscountsStatisticsList } from "@/api/discounts_center.js"
import { dateFormat, getShortcuts, disabledCurrentDateAfter } from '@/common/util'

const shortcuts = getShortcuts()
const state = reactive({
    formData: {},
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
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
    getDiscountsStatisticsList(params).then(res => {
        if (!params.isExport) {
            let { total, list = [] } = res.data
            state.tableData = list.map(item => {
                item.beginTime && (item.beginTime = dateFormat(item.beginTime))
                item.endTime && (item.endTime = dateFormat(item.endTime))
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
.discounts-statistics {
}
</style>
