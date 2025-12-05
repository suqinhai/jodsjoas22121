<template>
    <!-- 刷子监控-同关联处罚记录 -->
    <div class="tabs-main">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item :label="$t('操作时间:')">
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" value-format="YYYY-MM-DD" :start-placeholder="$t('开始时间')"
                    :end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" />
            </el-form-item>
            <el-form-item :label="$t('会员ID:')">
                <el-input @input="(val) => state.formData.userId = val.replace(/\D/g,'')" v-model="state.formData.userId"
                    :placeholder="$t('请输入会员ID')" />
            </el-form-item>
            <el-form-item :label="$t('会员账号:')">
                <el-input v-model="state.formData.username" :placeholder="$t('请输入会员账号')" />
            </el-form-item>
            <el-form-item :label="$t('关联类型:')">
                <el-select class="select-box" v-model="state.formData.type" :placeholder="$t('请选择关联类型')" clearable>
                    <el-option v-for="item in metaData.botSpyType" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('处罚方式:')">
                <el-select class="select-box" v-model="state.formData.punishType" :placeholder="$t('请选择处罚方式')" clearable>
                    <el-option v-for="item in metaData.botSpyPunish" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column :label="$t('会员ID')" min-width="120" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.user.id)">
                        {{ row.user?.id || '' }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('会员账号')" min-width="140" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.user.id)">
                        {{ row.user?.name || '' }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="layerName" :label="$t('固定层级')" min-width="120" align="center" />
            <el-table-column :label="$t('关联时间')" min-width="160" align="center">
                <template #default="{ row }">
                    {{ dateFormat(row.addTime) }}
                </template>
            </el-table-column>
            <el-table-column prop="type_" :label="$t('关联类型')" min-width="120" align="center" />
            <el-table-column prop="info" :label="$t('具体关联信息')" min-width="240" align="center" />
            <el-table-column prop="punishType_" :label="$t('处罚方式')" min-width="160" align="center" />
            <el-table-column :label="$t('操作时间')" min-width="160" align="center">
                <template #default="{ row }">
                    {{ dateFormat(row.updateTime) }}
                </template>
            </el-table-column>
            <el-table-column prop="emp.name" :label="$t('操作人')" min-width="100" align="center" />
        </el-table>

        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>
    </div>
</template>

<script setup>
import { reactive, onMounted, onActivated } from "vue"
import { useRoute } from 'vue-router'
import commonStore from '@/store/common'
import { gitCrimeSheetList } from "@/api/risk_control.js"
import { getShortcuts, dateFormat, disabledCurrentDateAfter } from "@/common/util/index"

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
    userId: '',
    isInit: true,
})
const route = useRoute()
const commonData = commonStore()

onMounted(() => {
    if (commonData.isManual) state.isInit = false
    state.userId = route.query.userId
    state.formData.userId = state.userId
    fetchData()
})

onActivated(() => {
    if (state.isInit) return state.isInit = false
    if (state.userId !== route.query.userId) {
        state.userId = route.query.userId
        state.formData = {
            userId: state.userId
        }
        fetchData('search')
    }
})

// 表格过滤数据处理
const fetchData = (val = '', type = 1) => {
    if (val) {
        state.listQuery._page = 1
        if (val === 'reset' && type) {
            state.formData = {
                userId: state.userId
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
    gitCrimeSheetList(params).then(res => {
        let { total, list } = res.data
        state.tableData = list
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
</script>

<style lang="scss" scoped>
</style>
