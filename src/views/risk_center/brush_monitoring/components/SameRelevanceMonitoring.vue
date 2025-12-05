<template>
    <!-- 刷子监控-同关联监控 -->
    <div class="tabs-main">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item :label="$t('操作时间:')">
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" value-format="YYYY-MM-DD" :start-placeholder="$t('开始时间')"
                    :end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" />
            </el-form-item>
            <el-form-item :label="$t('关联类型:')">
                <el-select class="select-box" v-model="state.formData.type" :placeholder="$t('请选择关联类型')" clearable>
                    <el-option v-for="item in metaData.botSpyType" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('具体关联信息:')">
                <el-input v-model="state.formData.input" :placeholder="$t('请输入具体关联信息')" />
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item v-permiss="'admin.user-bot-spy.addOrEdit'">
                <el-button v-throttle type="primary" @click="handleRule">{{$t('默认自动规则')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column :label="$t('统计时间')" min-width="120" align="center">
                <template #default="{ row }">
                    {{ dateFormat(row.addTime,'yyyy-MM-DD') }}
                </template>
            </el-table-column>
            <el-table-column :label="$t('关联类型')" min-width="120" align="center">
                <template #default="{ row }">
                    {{ metaData.botSpyType.find(item => +item.value === row.type)?.label || '' }}
                </template>
            </el-table-column>
            <el-table-column prop="info" :label="$t('具体关联信息')" min-width="200" align="center" />
            <el-table-column :label="$t('同关联人数')" min-width="120" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="state.itemId = row.id,state.showRelevanceDetail = true">
                        {{ row.peopleNum }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="punishType_" :label="$t('处罚方式')" min-width="160" align="center" />
            <!-- <el-table-column :label="$t('处罚方式')" min-width="120" align="center">
                <template #default="{ row }">
                    {{ metaData.botSpyPunish.find(item => +item.value === row.punishType)?.label || '' }}
                </template>
            </el-table-column> -->
        </el-table>

        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>

        <MonitoringRuleDeploy v-if="state.showMonitoringRule" :itemData="state.itemData" :metaData="metaData"
            @close="state.showMonitoringRule = false" @fetchData="fetchData">
        </MonitoringRuleDeploy>

        <RelevanceDetailDialog v-if="state.showRelevanceDetail" :itemId="state.itemId" :metaData="metaData"
            @close="state.showRelevanceDetail = false">
        </RelevanceDetailDialog>
    </div>
</template>

<script setup>
import { defineAsyncComponent, reactive, onMounted } from "vue"
import { gitRelevanceMonitoringList, gitMonitoringRule } from "@/api/risk_control.js"
import { getShortcuts, dateFormat, disabledCurrentDateAfter } from "@/common/util/index"
const MonitoringRuleDeploy = defineAsyncComponent(() => import("./MonitoringRuleDeploy.vue"))
const RelevanceDetailDialog = defineAsyncComponent(() => import("./RelevanceDetailDialog.vue"))

let shortcuts = getShortcuts()
const props = defineProps({
    metaData: {
        type: Object,
        default: () => {
            return {}
        }
    }
})
const state = reactive({
    tableData: [],
    formData: {},
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    itemData: {},
    showMonitoringRule: false,
    showRelevanceDetail: false,
})

onMounted(() => {
    fetchData()
})

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val) {
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
    globalVBus.$emit('globalLoading', true)
    gitRelevanceMonitoringList(params).then(res => {
        let { total, list } = res.data
        state.tableData = list
        state.total = total
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []

        globalVBus.$emit('globalLoading', false)
    })
}

// 设置规则
const handleRule = () => {
    globalVBus.$emit('globalLoading', true)
    gitMonitoringRule().then((res) => {
        if (res.data && res.data.length) {
            state.itemData = res.data
        } else {
            state.itemData = []
            props.metaData.botSpyType.forEach(item => {
                state.itemData.push({
                    punishType: 0,
                    range: 0,
                    type: +item.value,
                    value: undefined,
                })
            })
        }
        globalVBus.$emit('globalLoading', false)
        state.showMonitoringRule = true
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss" scoped>
</style>
