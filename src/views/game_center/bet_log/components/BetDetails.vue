<template>
    <!-- 投注记录-投注明细 -->
    <div class="container-main bet-details">
        <el-form class="filter-form" :model="state.searchForm" inline>
            <el-form-item :label="$t('结算时间:')">
                <el-date-picker v-model="state.searchForm.interval" type="datetimerange" format="YYYY-MM-DD HH:mm:ss"
                    value-format="YYYY-MM-DD HH:mm:ss" :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')"
                    :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts"
                    :default-time="[ new Date(2000, 0, 0, 0, 0, 0), new Date(2000, 0, 0, 23, 59, 59) ]" />
            </el-form-item>
            <el-form-item :label="$t('游戏类型:')">
                <el-select class="select-box" v-model="state.searchForm.gameType" :placeholder="$t('请选择游戏类型')" clearable>
                    <el-option v-for="item in state.gameTypeList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('游戏厂商:')">
                <el-select class="select-box" v-model="state.searchForm.vendor" :placeholder="$t('请选择游戏厂商')" clearable @change="vendorChange">
                    <el-option v-for="item in state.gameVendorList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('游戏服务供应商:')">
                <el-select class="select-box" v-model="state.searchForm.provider" :placeholder="$t('请选择游戏服务供应商')" clearable @change="vendorChange">
                    <el-option v-for="item in state.providerList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('rtp状态:')" v-if="isBetMode">
                <el-select class="select-box" v-model="state.searchForm.rtpStatus" :placeholder="$t('请选择rtp状态')" clearable @change="selectRtrChange">
                    <el-option label="rtp>100" :value="0" />
                    <el-option label="rtp<100" :value="1" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('定向过滤:')">
                <el-select class="select-box" v-model="state.searchForm.isPgc" :placeholder="$t('请选择定向过滤条件')"
                    :clearable="![0,1].includes(state.searchForm.rtpStatus)" @change="selectChange">
                    <el-option :label="$t('非、、')" :value="0" :disabled="[0,1].includes(state.searchForm.rtpStatus)" />
                    <el-option label="" :value="1" />
                    <el-option label="" :value="2" />
                    <el-option label="" :value="3" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('子游戏名称:')">
                <el-input v-model="state.searchForm.gameName" :placeholder="$t('请输入子游戏名称')" />
            </el-form-item>
            <el-form-item>
                <el-select style="width: 100px" v-model="state.searchForm.idType" :placeholder="$t('请选择')">
                    <el-option :label="$t('注单编号')" :value="1" />
                    <el-option :label="$t('会员ID')" :value="2" />
                    <el-option :label="$t('牌局编号')" :value="3" />
                </el-select>
                <div>
                    <el-input v-model="state.searchForm.idNoSearch" :placeholder="placeholderLabel" />
                </div>
            </el-form-item>
            <el-form-item :label="$t('会员账号:')">
                <el-input v-model="state.searchForm.username" :placeholder="$t('请输入会员账号')" />
            </el-form-item>
            <el-form-item :label="$t('结算状态:')">
                <el-select class="select-box" v-model="state.searchForm.status" :placeholder="$t('请选择结算状态')" clearable>
                    <el-option :label="$t('已撤单')" :value="-1" />
                    <el-option :label="$t('未结算')" :value="0" />
                    <el-option :label="$t('已结算')" :value="1" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-select v-model="state.searchForm.amountQueryType" :placeholder="$t('请选择')" style="width: 100px">
                    <el-option :label="$t('投注金额')" :value="1" />
                    <el-option :label="$t('有效投注')" :value="2" />
                    <el-option :label="$t('会员输赢')" :value="3" />
                </el-select>
                <el-input-number style="width: 120px" v-model="state.searchForm.amountRangeMin" :placeholder="$t('最小值')" :min="0" :controls="false"
                    @blur="handleBlur" />
                <span class="line">~</span>
                <el-input-number :placeholder="$t('最大值')" style="width: 120px" v-model="state.searchForm.amountRangeMax" :min="0.01" :controls="false"
                    @blur="handleBlur" />
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('')">{{$t('刷 新')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('export')">{{$t('导出报表')}}</el-button>
            </el-form-item>
        </el-form>
        <div class="tips-box">
            <div>{{$t('数据更新时间：实时')}}</div>
            <div>{{$t('注意：会员若为主播号，仍会记录有效投注，方便查询投注结果，但该投注数据不会进入汇总统计')}}</div>
        </div>
        <el-table ref="tableRef" class="table-box" :data="state.tableData" border @sort-change="sortChange">
            <el-table-column prop="id" :label="$t('注单编号')" align="center" width="140" />
            <!-- <el-table-column prop="playNo" :label="$t('牌局编号')" align="center" min-width="180" /> -->
            <el-table-column :label="$t('会员ID')" min-width="120" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.user.id)">{{row.user?.id || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('会员账号')" min-width="140" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.user.id)">{{row.user?.name || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="gameType_" :label="$t('游戏类型')" align="center" min-width="100" />
            <el-table-column prop="vendor_" :label="$t('游戏厂商')" align="center" min-width="100" />
            <el-table-column prop="provider_" :label="$t('游戏服务供应商')" align="center" min-width="130" />
            <el-table-column prop="gameName" :label="$t('子游戏名称')" align="center" min-width="160" />
            <el-table-column prop="" :label="$t('投注时间')" align="center" min-width="160">
                <template #default="{ row }">
                    <span>{{ dateFormat(row.beginTime) }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="" :label="$t('结算时间')" align="center" min-width="160">
                <template #default="{ row }">
                    <span>{{ dateFormat(row.endTime) }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="inCoin" :label="$t('投注金额')" align="center" min-width="120" />
            <el-table-column :sortable="isSameDay ? 'custom' : false" prop="validCoin" :label="$t('有效投注')" align="center" min-width="120" />
            <el-table-column :sortable="isSameDay ? 'custom' : false" prop="winLoseCoin" :label="$t('会员输赢')" align="center" min-width="120">
                <template #default="{ row }">
                    <span :style="{ color: row.winLoseCoin * 1 > 0 ? 'rgb(133,225,132)' : 'red' }">{{ row.winLoseCoin }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="rtp" label="rtp" align="center" min-width="120" v-if="userData.siteInfo.commissionMode === 2" />
            <el-table-column :label="$t('状态')" align="center" min-width="120">
                <template #default="{ row }">
                    <span :style="{
              color:
                row.status * 1 < 0
                  ? 'gray'
                  : row.status * 1 == 0
                  ? 'red'
                  : 'rgb(133,225,132)',
            }">{{ row.status_ }}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('操作')" fixed="right" align="center" width="100">
                <template #default="{ row }">
                    <el-button v-throttle type="primary" @click="handleDetail(row.id)" link>{{$t('详情')}}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="!!state.total" v-model:page="state.listQuery._page" v-model:limit="state.listQuery._size" :total="state.total"
            @pagination="fetchData"></Pagination>

        <DetailsDialog @close="state.showDetailsDialog = false" v-if="state.showDetailsDialog" :detailsForm="state.detailsForm">
        </DetailsDialog>
    </div>
</template>

<script setup>
import { ref, defineAsyncComponent, reactive, onMounted, computed, onActivated } from "vue"
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { gamePlayLogListApi, gamePlayLogDetailApi } from "@/api/statistics.js"
import { getCommonMeta } from "@/api/common"
import { deepClone, dateFormat, getShortcuts, getTimezone, disabledCurrentDateAfter } from "@/common/util/index.js"
import userStore from '@/store/user'
const DetailsDialog = defineAsyncComponent(() => import("./DetailsDialog.vue"))

let keyObj = {
    'winLoseCoin': 1,
    'validCoin': 3,
}
const shortcuts = getShortcuts()
const route = useRoute()
const userData = userStore()
const state = reactive({
    orientType: '',
    userId: '',
    username: '',
    jumpTime: [],
    createTime: '',
    rtpStatus: '',
    tableData: [],
    searchForm: {
        idType: 1,
        amountQueryType: 1,
    },
    listQuery: {
        _page: 1,
        _size: 10,
    },
    total: 0,
    showDetailsDialog: false,
    detailsForm: {},
    gameTypeList: [],
    gameVendorList: [],
    providerList: [],
    nowDate: [],
    searchTime: [],
})
const tableRef = ref(null)

const placeholderLabel = computed(() => {
    switch (state.searchForm.idType) {
        case 1:
            return $t('请输入注单编号');
            break;
        case 2:
            return $t('请输入会员ID');
            break;
        case 3:
            return $t('请输入牌局编号');
            break;
        default:
            return $t('请输入');
    }
})
const isBetMode = computed(() => {
    return (userData.siteInfo.commissionMode === 2 || (userData.siteInfo.commissionMode === 1 && userData.siteInfo.ctrlWin))
})
const isSameDay = computed(() => {
    return state.searchTime.length && state.searchTime[0] === state.searchTime[1]
})

onMounted(() => {
    getCommonMeta({ types: 'gameType,gameVendor,gameProvider' }).then(({ code, data }) => {
        if (code == 0) {
            state.gameTypeList = data.gameType
            state.gameVendorList = data.gameVendor
            state.providerList = data.gameProvider
        }
    })
    let time = dateFormat(Date.now(), 'YYYY-MM-DD')
    state.nowDate = [time + ' 00:00:00', time + ' 23:59:59']
    state.createTime = deepClone(state.nowDate)
    init()
})

onActivated(() => {
    const { query = {} } = route
    if (+query.tab === 1 && ((state.userId !== query.userId) || (state.username !== query.username)
        || (state.orientType !== query.orientType) || (state.rtpStatus !== query.rtpStatus) || (state.createTime !== query.createTime) ||
        ((state.jumpTime.length && (state.jumpTime[0] !== query.startTime || state.jumpTime[1] !== query.endTime)) || (!state.jumpTime.length && query.startTime)))) {
        tableRef.value && tableRef.value.clearSort()
        init()
    }
})

const init = () => {
    if (+route.query.tab === 1) {
        const { query = {} } = route
        state.username = query.username
        state.userId = query.userId
        state.orientType = query.orientType
        state.rtpStatus = query.rtpStatus
        state.createTime = query.createTime ? [query.createTime + ' 00:00:00', query.createTime + ' 23:59:59'] : deepClone(state.nowDate)
        state.jumpTime = query.startTime ? [query.startTime, query.endTime] : []
    }
    state.searchForm = {
        isPgc: state.orientType ? state.orientType - 1 : '',
        rtpStatus: state.rtpStatus ? state.rtpStatus - 1 : '',
        interval: state.jumpTime.length ? [...state.jumpTime] : [...state.createTime],
        idType: state.userId ? 2 : 1,
        idNoSearch: state.userId,
        username: state.username,
        amountQueryType: 1,
    }
    fetchData('search')
}

const fetchData = (val = '') => {
    if (val && val !== 'export') {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.searchForm = {
                interval: state.jumpTime.length ? [...state.jumpTime] : [...state.createTime],
                idType: state.userId ? 2 : 1,
                idNoSearch: state.userId,
                username: state.username,
                isPgc: state.orientType ? state.orientType - 1 : '',
                rtpStatus: state.rtpStatus ? state.rtpStatus - 1 : '',
                amountQueryType: 1,
            }
            tableRef.value.clearSort()
        }
    }
    let params = { ...state.listQuery, ...state.searchForm }
    let { interval } = state.searchForm
    state.searchTime = []
    if (interval && interval.length) {
        if (new Date(interval[1]).getTime() - new Date(interval[0]).getTime() > 7 * 24 * 60 * 60 * 1000) return ElMessage.warning($t('搜索时间范围不得超过7天！'))
        params['interval.begin'] = interval[0]
        params['interval.end'] = interval[1] + '.999'
        state.searchTime = [interval[0].slice(0, 10), interval[1].slice(0, 10)]
    }
    delete params.interval
    if (!isSameDay.value) {
        delete params.sort
        tableRef.value && tableRef.value.clearSort()
    }
    if (val === 'export') params.export = getTimezone()
    globalVBus.$emit('globalLoading', true)
    gamePlayLogListApi(params).then(res => {
        if (!params.export) {
            let { total, list = [] } = res.data
            state.tableData = list
            state.total = total
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        if (!params.export) state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

// 查看会员详情
const showMemberDetail = (id) => {
    globalVBus.$emit('memberDetailDialog', id)
}

const vendorChange = (val) => {
    if (!!val) state.searchForm.isPgc = ''
}

const selectChange = (val) => {
    if (typeof val === 'number') {
        state.searchForm.provider = ''
        state.searchForm.vendor = ''
    }
}

const selectRtrChange = (val) => {
    if (val === 0 || val === 1) {
        state.searchForm.isPgc = 1
    } else {
        state.searchForm.isPgc = ''
    }
}

const sortChange = ({ order, prop }) => {
    delete state.searchForm.sort
    if (order === 'descending') {
        state.searchForm.sort = keyObj[prop] + 1
    } else if (order === 'ascending') {
        state.searchForm.sort = keyObj[prop]
    }
    fetchData()
}

const handleBlur = () => {
    let { amountRangeMin, amountRangeMax } = state.searchForm
    if (!amountRangeMin) {
        state.searchForm.amountRangeMin = 0
    }
    if (amountRangeMax && state.searchForm.amountRangeMin > amountRangeMax) {
        var temp = state.searchForm.amountRangeMin
        state.searchForm.amountRangeMin = amountRangeMax
        state.searchForm.amountRangeMax = temp
    }
}

const handleDetail = (id) => {
    globalVBus.$emit('globalLoading', true)
    gamePlayLogDetailApi({ id }).then(({ code, data }) => {
        if (code == 0) {
            state.detailsForm = data
            state.showDetailsDialog = true
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        globalVBus.$emit('globalLoading', false)
    })
};
</script>

<style lang="scss">
.bet-details {
}
</style>
