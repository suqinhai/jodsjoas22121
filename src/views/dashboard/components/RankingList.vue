<template>
    <!-- 首页-排行榜 -->
    <div class="ranking-list dashboard-box" v-loading="state.loading">
        <div class="tab">
            <div v-for="item in tabData" :key="item.id" class="tab-box pointer" :class="{'active':state.switchIndex == item.id}"
                @click="handleTab(item.id)">{{ item.title }}</div>
        </div>
        <el-table :data="state.tableData" border>
            <el-table-column :label="$t('排名')" min-width="100" align="center">
                <template #default="{ row,$index }">
                    {{$index + 1}}
                </template>
            </el-table-column>
            <el-table-column :label="$t('会员账号')" min-width="100" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="emits('showDialog',row.userId)">
                        {{ row.username }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="agentUsername" :label="$t('上级代理')" min-width="100" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="emits('showDialog',row.agentUserId)">
                        {{ row.agentUsername }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="userSource_" :label="$t('注册来源')" min-width="100" align="center" />
            <el-table-column v-if="state.switchIndex !== 3" prop="rechargeAmount" :label="$t('充值金额')" min-width="100" align="center" />
            <el-table-column v-if="state.switchIndex !== 3" prop="cashAmount" :label="$t('提现金额')" min-width="100" align="center" />
            <el-table-column v-if="state.switchIndex !== 3" prop="profitDiffAmount" :label="$t('充提差额')" min-width="100" align="center" />
            <el-table-column v-if="state.switchIndex !== 3" prop="validCoin" :label="$t('有效投注')" min-width="100" align="center" />
            <el-table-column v-if="state.switchIndex !== 3" :label="$t('盈利金额')" min-width="100" align="center">
                <template #default="{ row }">
                    <span :style="{'color': row.winLoseCoin < 0 ? 'green' : 'red'}">
                        {{ row.winLoseCoin }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column v-if="state.switchIndex === 3" prop="totalCoin" :label="$t('总业绩')" min-width="100" align="center" />
            <el-table-column v-if="state.switchIndex === 3" prop="nextTotalCoin" :label="$t('直属业绩')" min-width="100" align="center" />
            <el-table-column v-if="state.switchIndex === 3" prop="otherTotalCoin" :label="$t('其他业绩')" min-width="100" align="center" />
            <el-table-column v-if="state.switchIndex === 3" prop="calcCommission" :label="$t('结算佣金')" min-width="100" align="center" />
        </el-table>
    </div>
</template>

<script setup>
import { reactive, onMounted, defineEmits } from 'vue'
import { useRouter } from 'vue-router'
import { getRankingListData } from '@/api/dashboard'

const emits = defineEmits(['showDialog'])
const tabData = [
    { id: 0, title: $t('充值排行') },
    { id: 1, title: $t('投注排行') },
    { id: 2, title: $t('盈利排行') },
    { id: 3, title: $t('佣金排行') },
]
const state = reactive({
    switchIndex: 0,
    tableData: [],
    loading: false
})
const router = useRouter()

onMounted(() => {
    getData()
})

const getData = () => {
    state.loading = true
    getRankingListData({ tab: state.switchIndex }).then(({ code, data }) => {
        if (code === 0 && data) {
            state.tableData = data || []
        }
        state.loading = false
    }).catch(() => {
        state.tableData = []
        state.loading = false
    })
}

const handleTab = (id) => {
    if (state.switchIndex === id) return
    state.switchIndex = id
    getData()
}
</script>

<style lang="scss" scoped>
.ranking-list {
    .tab {
        width: fit-content;
        height: 36px;
        border: 1px solid #409eff;
        border-radius: 2px;
        display: flex;
        margin-bottom: 10px;
        margin-left: 20px;

        &-box {
            flex-shrink: 0;
            padding: 0 15px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 12px;
            color: #409eff;
        }

        .tab-box + .tab-box {
            border-left: 1px solid #409eff;
        }

        .active {
            color: #fff;
            background-color: #409eff;
        }
    }
}
</style>
