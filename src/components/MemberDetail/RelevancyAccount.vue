<template>
    <!-- 会员详情弹窗-关联账号 -->
    <div class="relevancy-account">
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
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table :data="state.tableData" border>
            <el-table-column :label="$t('关联时间')" min-width="160" align="center">
                <template #default="{ row }">
                    {{ dateFormat(row.addTime) }}
                </template>
            </el-table-column>
            <el-table-column :label="$t('关联类型')" min-width="120" align="center">
                <template #default="{ row }">
                    {{ metaData.botSpyType.find(item => +item.value === row.type)?.label || '' }}
                </template>
            </el-table-column>
            <el-table-column prop="info" :label="$t('具体关联信息')" min-width="240" align="center"></el-table-column>
            <el-table-column :label="$t('同关联人数')" min-width="120" align="center">
                <template #default="{ row }">
                    <span v-if="isLookPermiss" class="special pointer" @click="handleGo">{{row.peopleNum}}</span>
                    <span v-else class="special">{{row.peopleNum}}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('处罚方式')" min-width="120" align="center">
                <template #default="{ row }">
                    {{ metaData.botSpyPunish.find(item => +item.value === row.punishType)?.label || '' }}
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData">
        </Pagination>
    </div>
</template>

<script setup>
import { reactive, onMounted, inject, computed } from 'vue'
import { useRouter } from 'vue-router'
import userStore from '@/store/user'
import { getShortcuts, dateFormat, disabledCurrentDateAfter } from "@/common/util/index"
import { getMemberRelevancyInfo } from '@/api/member'
import { gitRelevanceMonitoringList } from "@/api/risk_control.js"

let shortcuts = getShortcuts()
const provideData = inject('provideData')
const props = defineProps({
    metaData: {
        type: Object,
        default: {}
    },
})
const state = reactive({
    formData: {},
    tableData: [],
    relevancyAccountData: '',
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
})
const router = useRouter()
const userData = userStore()

const isLookPermiss = computed(() => {
    return userData.isHasMenuPermiss('admin.user-bot-spy.list') && provideData.isSame
})

onMounted(() => {
    provideData.showLoading()
    getMemberRelevancyInfo({ userId: provideData.memberId, merchantId: provideData.merchantId }).then(res => {
        if (Object.values(res.data).length) {
            state.relevancyAccountData = Object.values(res.data).join(',')
            fetchData()
        } else {
            provideData.hideLoading()
        }
    }).catch(err => {
        provideData.hideLoading()
    })
})

// 表格过滤数据处理
const fetchData = (type = '') => {
    if (!state.relevancyAccountData) return
    if (type) {
        state.listQuery._page = 1
        if (type === 'reset') {
            state.formData = {}
        }
    }
    let params = { ...state.listQuery, ...state.formData, merchantId: provideData.merchantId }
    let { receiveTime } = state.formData
    if (receiveTime && receiveTime.length) {
        params['interval.begin'] = receiveTime[0]
        params['interval.end'] = receiveTime[1]
    }
    delete params.receiveTime
    params.inputs = state.relevancyAccountData
    provideData.showLoading()
    gitRelevanceMonitoringList(params).then(res => {
        let { list, total } = res.data
        state.tableData = list.map(item => {
            item.addTime && (item.addTime = dateFormat(item.addTime))
            return item
        })
        state.total = total
        provideData.hideLoading()
    }).catch(err => {
        state.tableData = []
        provideData.hideLoading()
    })
}

// 表格过滤数据处理
const getRelevancyAccountData = async () => {
    try {
        provideData.showLoading()
        let res = getMemberRelevancyAccount({ userId: provideData.memberId })
        state.relevancyAccountData = res.data
    } catch (err) {

        provideData.hideLoading()
    }
}

// 新增
const handleGo = () => {
    provideData.close()
    router.push(`/risk-center/brush-monitoring?userId=${provideData.memberId}`)
}
</script>

<style lang="scss">
</style>
