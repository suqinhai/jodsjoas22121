<template>
    <!-- 投注记录-投注统计 -->
    <div class="bet-statistics">
        <el-form class="filter-form" :model="state.searchForm" inline>
            <el-form-item :label="$t('会员ID:')">
                <el-input @input="(val) => state.searchForm.userId = val.replace(/\D/g,'')" v-model="state.searchForm.userId"
                    :placeholder="$t('请输入会员ID')" />
            </el-form-item>
            <!-- <el-form-item>
                <el-input v-model="state.searchForm.username" :placeholder="$t('请输入会员账号')"/>
            </el-form-item> -->
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData()">{{$t('搜 索')}}</el-button>
            </el-form-item>
        </el-form>
         <div class="tips">{{$t('数据更新时间：隔天')}}{{$t('；请输入会员ID搜索，不显示全部数据')}}</div>
        <el-table class="statistics-table" :data="state.gamePlayLogStatList" border>
            <el-table-column prop="vendorGameType" :label="$t('类型')" min-width="120" align="center" />
            <el-table-column prop="count" :label="$t('总注单量')" min-width="120" align="center" />
            <el-table-column prop="inCoinTotal" :label="$t('总投注金额')" min-width="140" align="center" />
            <el-table-column prop="validCoinTotal" :label="$t('总有效投注')" min-width="140" align="center" />
            <el-table-column :label="$t('会员输赢')" min-width="140" align="center">
                <template #default="{ row }">
                    <span :style="{ color: row.winLoseCoinTotal * 1 > 0 ? 'rgb(133,225,132)' : 'red' }">{{ row.winLoseCoinTotal }}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('占单量')" min-width="120" align="center">
                <template #default="{ row }">
                    {{row.accountRatio || 0}}%
                </template>
            </el-table-column>
            <el-table-column :label="$t('获利比')" min-width="120" align="center">
                <template #default="{ row }">
                    {{row.profitRatio || 0}}%
                </template>
            </el-table-column>
        </el-table>

        <el-table v-for="(item,index) in Object.keys(state.gamePlayLogStatByGame)" :key="item" class="statistics-table" border
            :data="state.gamePlayLogStatByGame[item]" :class="`tableItem${index+1}`">
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
            <el-table-column :label="item" min-width="120" align="center">
                <template #default="{ row }">
                    <el-button v-throttle type="primary" link @click="handleDetail(row)">{{row.gameName}}</el-button>
                </template>
            </el-table-column>
            <el-table-column prop="count" :label="$t('总注单量')" min-width="120" align="center" />
            <el-table-column prop="inCoinTotal" :label="$t('总投注金额')" min-width="140" align="center" />
            <el-table-column prop="validCoinTotal" :label="$t('总有效投注')" min-width="140" align="center" />
            <el-table-column :label="$t('会员输赢')" min-width="140" align="center">
                <template #default="{ row }">
                    <span :style="{ color: row.winLoseCoinTotal * 1 > 0 ? 'rgb(133,225,132)' : 'red' }">{{ row.winLoseCoinTotal }}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('占单量')" min-width="120" align="center">
                <template #default="{ row }">
                    {{row.accountRatio || 0}}%
                </template>
            </el-table-column>
            <el-table-column :label="$t('获利比')" min-width="120" align="center">
                <template #default="{ row }">
                    {{row.profitRatio || 0}}%
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script setup>
import { reactive, onMounted, onActivated } from "vue"
import { ElMessage } from 'element-plus'
import { gamePlayLogStatApi, } from "@/api/statistics.js"
import { useRouter, useRoute } from "vue-router"

const router = useRouter();
const route = useRoute();
const state = reactive({
    searchForm: {},
    gamePlayLogStatList: [],
    gamePlayLogStatByGame: {},
    userId: '',
})

onMounted(() => {
    state.userId = +route.query.tab === 2 ? route.query.userId : ''
    state.searchForm.userId = state.userId
    state.searchForm.userId && fetchData()
})

onActivated(() => {
    if (state.userId !== route.query.userId && +route.query.tab === 2) {
        state.userId = route.query.userId
        state.searchForm = {
            userId: state.userId
        }
        fetchData()
    }
})

const fetchData = () => {
    if (!state.searchForm.userId) return ElMessage.warning($t('请输入会员ID再进行搜索！'))
    globalVBus.$emit('globalLoading', true)
    gamePlayLogStatApi(state.searchForm).then(({ code, data }) => {
        if (code == 0) {
            state.gamePlayLogStatList = data.stat || []
            state.gamePlayLogStatByGame = data.statByGame || {}
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.gamePlayLogStatList = []
        state.gamePlayLogStatByGame = {}
        globalVBus.$emit('globalLoading', false)
    })
}

// 查看会员详情
const showMemberDetail = (id) => {
    globalVBus.$emit('memberDetailDialog', id)
}

const handleDetail = (value) => {
    router.push({
        path: '/game-center/bet-log/statistics',
        query: {
            gameId: value.gameId,
            userId: value.user ? value.user.id : '',
        }
    })

}
</script>

<style lang="scss">
.bet-statistics {
    padding-bottom: 20px;
    .tips {
        margin: -10px 0 10px;
    }
    .statistics-table {
        // flex-shrink: 0;
        margin-bottom: 20px;
    }
}
</style>
