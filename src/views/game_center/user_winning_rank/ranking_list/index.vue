<template>
    <!-- 游戏中心-中奖排行管理-排行榜 -->
    <div class="tabs-main ranking-list">
        <div class="head">
            <el-button v-throttle type="primary" v-permiss="'merchant.user-winning-rank.editConfig'" @click="handleConfig">
                {{$t('排行榜设置')}}</el-button>
            <el-button v-throttle type="primary" v-permiss="'merchant.user-winning-rank.add'" @click="state.showAddDialog = true">{{$t('新增')}}
            </el-button>
            <el-button v-throttle type="primary" @click="fetchData">{{$t('刷新数据')}}</el-button>
            <div class="explain-question">
                <el-icon class="pointer" color="#666" :size="28" @click="state.showExplain = true">
                    <QuestionFilled />
                </el-icon>
            </div>
        </div>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column :label="$t('会员ID')" min-width="100" align="center">
                <template #default="{ row }">
                    <span v-if="row.source === 1" class="special pointer" @click="showMemberDetail(row.userId)">{{row.userId}}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('会员账号')" min-width="120" align="center">
                <template #default="{ row }">
                    <span v-if="row.source === 2">{{row.username}}</span>
                    <span v-else class="special pointer" @click="showMemberDetail(row.userId)">{{row.username}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="gameType_" :label="$t('游戏类型')" min-width="100" align="center" />
            <el-table-column prop="name" :label="$t('游戏名称')" min-width="120" align="center" />
            <el-table-column prop="winCoin" :label="$t('中奖金额')" min-width="100" align="center" />
            <el-table-column prop="siteStatus_" :label="$t('投注时间')" min-width="160" align="center">
                <template #default="{ row }">
                    {{row.beginTime && dateFormat(row.beginTime) || ''}}
                </template>
            </el-table-column>
            <el-table-column prop="siteStatus_" :label="$t('结算时间')" min-width="160" align="center">
                <template #default="{ row }">
                    {{row.endTime && dateFormat(row.endTime) || ''}}
                </template>
            </el-table-column>
            <el-table-column prop="source_" :label="$t('数据类型')" min-width="100" align="center" />
            <el-table-column fixed="right" :label="$t('操作')" width="90" align="center"
                v-if="userData.isHasPermiss('merchant.user-winning-rank.delete')">
                <template #default="{ row }">
                    <el-button v-if="row.source === 2" v-throttle type="primary" text @click="handleDelete(row.id)">{{$t('删除')}}</el-button>
                </template>
            </el-table-column>
        </el-table>

        <AddDialog v-if="state.showAddDialog" :metaData="metaData" @close="state.showAddDialog = false" @fetchData="fetchData">
        </AddDialog>
        <RankingConfigDialog v-if="state.showRankingConfig" :rankingType="state.rankingType" @close="state.showRankingConfig = false">
        </RankingConfigDialog>
        <ExplainDialog v-if="state.showExplain" @close="state.showExplain = false"></ExplainDialog>
    </div>
</template>

<script setup>
import { reactive, onMounted, defineAsyncComponent } from 'vue'
import { ElMessageBox } from 'element-plus'
import userStore from '@/store/user'
import { getWinningRankingList, getWinningRankingConfig, deleteWinningRankingData } from "@/api/merchant_center"
import { getCommonMeta, getGameVendorList } from '@/api/common'
import { dateFormat } from '@/common/util'
const AddDialog = defineAsyncComponent(() => import('./components/AddDialog.vue'))
const RankingConfigDialog = defineAsyncComponent(() => import('./components/RankingConfigDialog.vue'))
const ExplainDialog = defineAsyncComponent(() => import("./components/ExplainDialog.vue"))

const state = reactive({
    tableData: [],
    showAddDialog: false,
    showRankingConfig: false,
    showExplain: false,
    rankingType: 1,
})
const metaData = reactive({
    gameType: [],
    gameVendor: [],
})
const userData = userStore()

getCommonMeta({ types: 'gameType' }).then(res => {
    metaData.gameType = res.data?.gameType || []
    getGameVendorList({ types: metaData.gameType.map(item => item.type).join(',') }).then(res => {
        metaData.gameVendor = res.data || []
    })
})


onMounted(() => {
    fetchData()
})

const fetchData = () => {
    globalVBus.$emit('globalLoading', true)
    getWinningRankingList({ type: 3 }).then((res) => {
        state.tableData = res.data || []
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

// 查看会员详情
const showMemberDetail = (id) => {
    globalVBus.$emit('memberDetailDialog', id)
}

// 排行榜设置
const handleConfig = () => {
    globalVBus.$emit('globalLoading', true)
    getWinningRankingConfig().then((res) => {
        state.rankingType = res.data || 1
        state.showRankingConfig = true
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}

// 删除
const handleDelete = (id) => {
    ElMessageBox.confirm($t('确定要删除此手工添加的排行榜数据吗？'), $t('提示'), {
        confirmButtonText: $t('确 定'),
        cancelButtonText: $t('取消'),
        type: 'warning',
    }).then(() => {
        globalVBus.$emit('globalLoading', true)
        deleteWinningRankingData({ id }).then(res => {
            fetchData()
        }).catch(err => {
            globalVBus.$emit('globalLoading', false)
        })
    }).catch(() => { })
}
</script>

<style lang="scss" scoped>
.ranking-list {
    .head {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        .explain-question {
            margin-left: 15px;
            width: 28px;
            height: 28px;
        }
    }
}
</style>