<template>
    <!-- 游戏统计 -->
    <div class="container game-statistics">
        <el-form class="filter-form" :model="state.formData" inline>
            <el-form-item>
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')"
                    :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" :clearable="false" value-format="YYYY-MM-DD">
                </el-date-picker>
            </el-form-item>
            <el-form-item :label="$t('统计方式:')">
                <el-select class="select-box" v-model="state.formData.type" :placeholder="$t('请选择统计方式')">
                    <!-- <el-option :label="$t('游戏类型统计')" :value="1" /> -->
                    <el-option :label="$t('子游戏统计')" :value="1" />
                    <el-option :label="$t('游戏平台统计')" :value="2" />
                </el-select>
            </el-form-item>
            <el-form-item v-if="state.formData.type == 2">
                <el-select style="width: 100px" v-model="state.formData.userQueryType" @change="state.formData.userQueryVal = ''">
                    <el-option v-for="item in metaData.userInputTypeList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <div v-if="state.formData.userQueryType !== 3">
                    <el-input v-if="state.formData.userQueryType == 1" v-model="state.formData.userQueryVal" :placeholder="userPlaceholderLabel" />
                    <el-input v-if="state.formData.userQueryType == 2" v-model="state.formData.userQueryVal" :placeholder="userPlaceholderLabel"
                        @input="(val) => state.formData.userQueryVal = val.replace(/\D/g,'')" />
                </div>
            </el-form-item>
            <el-form-item v-if="state.formData.type == 2">
                <el-select style="width: 100px" v-model="state.formData.agentQueryType" @change="state.formData.agentQueryVal = ''">
                    <el-option v-for="item in metaData.agentInputTypeList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <div v-if="state.formData.agentQueryType !== 3">
                    <el-input v-if="state.formData.agentQueryType == 1" v-model="state.formData.agentQueryVal" :placeholder="agentPlaceholderLabel" />
                    <el-input v-if="state.formData.agentQueryType == 2" v-model="state.formData.agentQueryVal" :placeholder="agentPlaceholderLabel"
                        @input="(val) => state.formData.agentQueryVal = val.replace(/\D/g,'')" />
                </div>
            </el-form-item>
            <el-form-item v-if="state.formData.type == 2">
                <el-checkbox-group v-model="state.formData.directAgent">
                    <el-checkbox :label="1" :value="1">{{$t('直属会员')}}</el-checkbox>
                </el-checkbox-group>
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
        <div class="tips-box">{{$t('损益说明：正数-代表会员赢，商户输，负数-代表会员输，商户赢。')}}</div>
        <el-table :data="state.tableData" class="table-box" border :row-class-name="({row,rowIndex}) => (rowIndex === 0 ? 'total-row': '')">
            <el-table-column prop="vendor_" :label="$t('游戏平台')" min-width="120" align="center" />
            <el-table-column prop="gameType_" :label="$t('游戏类型')" min-width="120" align="center" />
            <el-table-column v-if="state.currentType === 1" prop="gameName" :label="$t('游戏名称')" min-width="120" align="center" />
            <el-table-column v-if="state.currentType === 1" prop="gameId" :label="$t('游戏ID')" min-width="120" align="center" />
            <el-table-column prop="userCount" :label="$t('投注人数')" min-width="120" align="center">
                <template #default="{ row, $index }">
                    <span v-if="state.formData.type === 1 || $index === 0 ">{{ row.userCount }}</span>
                    <span v-else class="special pointer" @click="clickUserCount(row)">
                        {{ row.userCount }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="playTimes" :label="$t('投注数')" min-width="120" align="center" />
            <el-table-column :label="$t('有效投注')" align="center" min-width="120">
                <template #default="{ row }">
                    <div style="color: green">{{ row.validCoinIn }}</div>
                </template>
            </el-table-column>
            <el-table-column :label="$t('损益')" align="center" min-width="120">
                <template #default="{ row }">
                    <div style="color: red" v-if="row.merWinCoin >= 0">{{ row.merWinCoin }}</div>
                    <div style="color: green" v-if="row.merWinCoin < 0">{{ row.merWinCoin }}</div>
                </template>
            </el-table-column>
            <el-table-column v-if="userData.siteInfo.commissionMode === 2" :label="$t('rtp>100投注')" min-width="130" align="center">
                <template #default="{ row, $index }">
                    {{ ['PGC','NJL','JL', 'NPP'].includes(row.vendor) || $index === 0 ? row.winCoinIn  : ''}}
                </template>
            </el-table-column>
            <el-table-column v-if="userData.siteInfo.commissionMode === 2" :label="$t('rtp<100投注')" min-width="130" align="center">
                <template #default="{ row, $index }">
                    {{ ['PGC','NJL','JL', 'NPP'].includes(row.vendor) || $index === 0 ? row.loseCoinIn : ''}}
                </template>
            </el-table-column>
            <el-table-column v-if="state.currentType === 2" prop="coinBetRate" :label="$t('杀率')" min-width="120" align="center" />
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>

        <PlayerNumDialog :item="state.itemData" :stateItem="state.stateItem" v-if="state.showPlayerNumDialog"
            @close="state.showPlayerNumDialog = false"></PlayerNumDialog>
    </div>
</template>

<script setup name="gameStatistics">
import { reactive, onMounted, onActivated, computed, defineAsyncComponent } from "vue"
import { useRoute } from 'vue-router'
import userStore from '@/store/user'
import commonStore from '@/store/common'
import { getGameStatisticsList } from '@/api/statistics'
import { getShortcuts, getCurrentWeekTime, deepClone, disabledCurrentDateAfter } from '@/common/util'
const PlayerNumDialog = defineAsyncComponent(() => import("./components/PlayerNumDialog.vue"))

let shortcuts = getShortcuts()
const state = reactive({
    tableData: [],
    formData: {
        type: 1,
        agentQueryType: 1,
        userQueryType: 1,
    },
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    currentWeek: [],
    currentType: 1,
    isInit: true,
    jumpTime: [],
    showPlayerNumDialog: false,
    itemData: {},
    stateItem: {}
})
const route = useRoute()
const userData = userStore()
const commonData = commonStore()

onMounted(() => {
    if (commonData.isManual) state.isInit = false
    state.currentWeek = getCurrentWeekTime()
    getData()
})

onActivated(() => {
    if (state.isInit) return state.isInit = false
    const { query = {} } = route
    if ((state.jumpTime.length && (state.jumpTime[0] !== query.startTime || state.jumpTime[1] !== query.endTime)) || (!state.jumpTime.length && query.startTime)
    ) {
        getData()
    }
})


const metaData = reactive({
    agentInputTypeList: [
        { label: $t('代理账号'), value: 1, placeholder: $t('请输入代理账号') },
        { label: $t('代理ID'), value: 2, placeholder: $t('请输入代理ID') },
    ],
    userInputTypeList: [
        { label: $t('会员账号'), value: 1, placeholder: $t('请输入会员账号') },
        { label: $t('会员ID'), value: 2, placeholder: $t('请输入会员ID') },
    ]
})

const agentPlaceholderLabel = computed(() => {
    return metaData.agentInputTypeList.find(item => item.value === state.formData.agentQueryType)?.placeholder || ''
});

const userPlaceholderLabel = computed(() => {
    return metaData.userInputTypeList.find(item => item.value === state.formData.userQueryType)?.placeholder || ''
});

const clickUserCount = (item) => {
    state.itemData = item
    state.showPlayerNumDialog = true
}

const getData = () => {
    const { query = {} } = route
    state.jumpTime = query.startTime ? [query.startTime, query.endTime] : []
    state.formData.receiveTime = state.jumpTime.length ? [state.jumpTime[0], state.jumpTime[1]] : deepClone(state.currentWeek)
    fetchData('search')
}

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val && val !== 'export') {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = { type: 1, agentQueryType: 1, userQueryType: 1 }
            state.formData.receiveTime = state.jumpTime.length ? [state.jumpTime[0], state.jumpTime[1]] : deepClone(state.currentWeek)
        }
    }
    let params = { ...state.listQuery, ...state.formData }
    let { receiveTime } = state.formData
    if (receiveTime && receiveTime.length) {
        params['interval.begin'] = receiveTime[0]
        params['interval.end'] = receiveTime[1]
    }
    if (state.formData.agentQueryType === 1) params['agentUsername'] = state.formData.agentQueryVal
    if (state.formData.agentQueryType === 2) params['agentUserId'] = state.formData.agentQueryVal
    if (state.formData.userQueryType === 1) params['username'] = state.formData.userQueryVal
    if (state.formData.userQueryType === 2) params['userId'] = state.formData.userQueryVal
    state.formData.directAgent?.length ? params.directAgent = 1 : params.directAgent = 0
    delete params.receiveTime
    delete params.agentQueryType
    delete params.agentQueryVal
    delete params.userQueryType
    delete params.userQueryVal

    state.currentType = state.formData.type
    state.stateItem = params
    // state.stateItem['interval.begin'] = receiveTime[0]
    // state.stateItem['interval.end'] = receiveTime[1]
    if (val === 'export') params.isExport = true
    globalVBus.$emit('globalLoading', true)
    getGameStatisticsList(params).then(res => {
        if (!params.isExport) {
            let { total, list } = res.data
            state.tableData = list
            state.total = total
            state.tableData.unshift({
                ...res.ext
            })
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        if (!params.isExport) state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss" scoped>
.game-statistics {
}
</style>
