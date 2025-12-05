<template>
    <!-- 游戏内容详情 -->
    <div class="container">
        <el-table class="table-box" :data="state.tableListData" border>
            <el-table-column prop="id" :label="$t('注单编号')" align="center" min-width="100" />
            <el-table-column prop="playNo" :label="$t('棋牌编号')" align="center" min-width="180" />
            <el-table-column :label="$t('会员ID')" align="center" min-width="120">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.user.id)">{{row.user?.id || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('会员账号')" align="center" min-width="140">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.user.id)">{{row.user?.name || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="gameType_" :label="$t('游戏类型')" align="center" min-width="120" />
            <el-table-column prop="vendor_" :label="$t('游戏平台')" align="center" min-width="120" />
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
            <el-table-column prop="validCoin" :label="$t('有效投注')" align="center" min-width="120" />
            <el-table-column prop="winLoseCoin" :label="$t('会员输赢')" align="center" min-width="120">
                <template #default="{ row }">
                    <span :style="{ color: row.winLoseCoin * 1 > 0 ? 'rgb(133,225,132)' : 'red' }">{{ row.winLoseCoin }}</span>
                </template>
            </el-table-column>
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
                    <el-button v-throttle type="primary" @click="handleDetail(row.id)" text>{{$t('详情')}}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>

        <DetailsDialog @close="state.showDetailsDialog = false" v-if="state.showDetailsDialog" :detailsForm="state.detailsForm">
        </DetailsDialog>
    </div>
</template>

<script setup name="betLogStatisticsDetail">
import { ref, reactive, defineAsyncComponent, onMounted, onActivated } from "vue"
import { useRoute } from "vue-router"
import commonStore from '@/store/common'
import { gamePlayLogListApi, gamePlayLogDetailApi } from "@/api/statistics.js"
import { dateFormat } from "@/common/util/index.js"
const DetailsDialog = defineAsyncComponent(() => import("../components/DetailsDialog.vue"))

const showDetailsDialog = ref(false)
const state = reactive({
    formData: {},
    tableListData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    detailsForm: {},
    showDetailsDialog: false,
    gameId: '',
    userId: '',
    isInit: true,
})
const route = useRoute()
const commonData = commonStore()

onMounted(() => {
    if (commonData.isManual) state.isInit = false
    getData()
})

onActivated(() => {
    if (state.isInit) return state.isInit = false
    const { query } = route
    if ((query.gameId && state.gameId !== query.gameId) || (query.userId && state.userId !== query.userId)) {
        getData()
    }
})

const getData = () => {
    const { query } = route
    state.gameId = query.gameId
    state.userId = query.userId
    state.formData.gameId = state.gameId
    state.formData.userId = state.userId
    state.listQuery._page = 1
    fetchData()
}

const fetchData = () => {
    globalVBus.$emit('globalLoading', true)
    gamePlayLogListApi({ ...state.formData, ...state.listQuery }).then(({ code, data }) => {
        if (code == 0) {
            state.tableListData = data.list || []
            state.total = data.total || 0
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        state.tableListData = []
        globalVBus.$emit('globalLoading', false)
    })
}

// 查看会员详情
const showMemberDetail = (id) => {
    globalVBus.$emit('memberDetailDialog', id)
}

//点击详情
const handleDetail = (id) => {
    globalVBus.$emit('globalLoading', true)
    gamePlayLogDetailApi({ id }).then(({ code, data }) => {
        if (code == 0) {
            state.detailsForm = data;
            state.showDetailsDialog = true;
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
};
</script>

<style lang="scss" scoped></style>
