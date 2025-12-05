<template>
    <!-- 首页-运营统计表格 -->
    <div class="operation-table dashboard-box" v-loading="state.loading">
        <div class="operation-table-tips">{{$t('Tips：下方表格蓝色字点击跳转对应的页面，显示对应的数据点击查看更多，跳转报表统计运用统计一日运营报表，显示近7日数据；数据每隔15分钟更新。')}}</div>
        <el-table :data="state.tableData" border>
            <el-table-column prop="title" :label="$t('日期')" min-width="100" align="center" />
            <el-table-column prop="agentUserCount" :label="$t('新增代理')" min-width="120" align="center" />
            <!-- <template #default="{ row }">
                    <span class="special pointer" @click="handleInfo(row.id)">
                        {{ row.agentUserCount }}
                    </span>
                </template>
            </el-table-column> -->
            <el-table-column :label="$t('会员（人）')" align="center">
                <el-table-column prop="userCount" :label="$t('注册')" min-width="100" align="center" />
                <!-- <template #default="{ row }">
                        <span class="special pointer" @click="handleInfo(row.id)">
                            {{ row.userCount }}
                        </span>
                    </template>
                </el-table-column> -->
                <el-table-column prop="rechargeUserCount" :label="$t('充值')" min-width="100" align="center" />
                <!-- <template #default="{ row }">
                        <span class="special pointer" @click="handleInfo(row.id)">
                            {{ row.rechargeUserCount }}
                        </span>
                    </template>
                </el-table-column> -->
                <el-table-column prop="firstRechargeUserCount" :label="$t('首充')" min-width="100" align="center" />
                <!-- <template #default="{ row }">
                        <span class="special pointer" @click="handleInfo(row.id)">
                            {{ row.firstRechargeUserCount }}
                        </span>
                    </template>
                </el-table-column> -->
                <el-table-column prop="rechargeTimes" :label="$t('充值次数')" min-width="100" align="center" />
                <!-- <template #default="{ row }">
                        <span class="special pointer" @click="handleInfo(row.id)">
                            {{ row.rechargeTimes }}
                        </span>
                    </template>
                </el-table-column> -->
                <el-table-column prop="cashTimes" :label="$t('提现次数')" min-width="100" align="center" />
                <!-- <template #default="{ row }">
                        <span class="special pointer" @click="handleInfo(row.id)">
                            {{ row.cashTimes }}
                        </span>
                    </template>
                </el-table-column> -->
                <el-table-column min-width="100" align="center">
                    <template #header>{{$t('大R玩家')}}
                        <el-tooltip effect="dark" :content="$t('在日期范围内，达到大R玩家指标的会员')" placement="top-start">
                            <el-icon class="pointer" :size="15">
                                <QuestionFilled />
                            </el-icon>
                        </el-tooltip>
                    </template>
                    <template #default="{ row }">
                        {{ row.bigUserCount }}
                        <!-- <span class="special pointer" @click="handleInfo(row.id)">
                        </span> -->
                    </template>
                </el-table-column>
            </el-table-column>
            <el-table-column :label="$t('充提')" align="center">
                <el-table-column prop="rechargeAmount" :label="$t('充值总额')" min-width="140" align="center" />
                <!-- <template #default="{ row }">
                        <span class="special pointer" @click="handleInfo(row.id)">
                            {{ row.rechargeAmount }}
                        </span>
                    </template>
                </el-table-column> -->
                <el-table-column prop="cashAmount" :label="$t('提现总额')" min-width="140" align="center" />
                <!-- <template #default="{ row }">
                        <span class="special pointer" @click="handleInfo(row.id)">
                            {{ row.cashAmount }}
                        </span>
                    </template>
                </el-table-column> -->
                <el-table-column prop="profitDiffAmount" :label="$t('充提差额')" min-width="140" align="center" />
            </el-table-column>
            <el-table-column :label="$t('游戏')" align="center">
                <el-table-column prop="coinUserCount" :label="$t('投注人数')" min-width="100" align="center" />
                <el-table-column prop="validCoin" :label="$t('有效投注')" min-width="160" align="center" />
                <el-table-column :label="$t('杀率')" min-width="100" align="center">
                    <template #default="{ row }">
                        {{ row.coinBetRate }}%
                    </template>
                </el-table-column>
                <el-table-column :label="$t('游戏盈亏')" min-width="160" align="center">
                    <template #default="{ row }">
                        <!-- <span style="color: #58bc58">
                            {{ row.winLoseCoin }}
                        </span> -->
                        <span style="color: green" v-if="row.winLoseCoin <= 0">{{ row.winLoseCoin }}</span>
                        <span style="color: red" v-if="row.winLoseCoin > 0">{{ row.winLoseCoin }}</span>
                    </template>
                </el-table-column>
            </el-table-column>
        </el-table>
        <div class="operation-box">{{$t('点击查看更多-日运营报表')}}<el-button v-throttle type="primary" style="height:36px;margin-left: 45px"
                @click="router.push('/data-report/daily-operation-report')">{{$t('查看更多')}}</el-button>
        </div>
    </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { getHomeOperateData } from '@/api/dashboard'
import { useRouter } from 'vue-router'
import { } from '@/api/dashboard'

const keyData = [
    { key: 'today', title: $t('今日') },
    { key: 'yesterday', title: $t('昨日') },
    { key: 'week', title: $t('本周') },
    { key: 'lastWeek', title: $t('上周') },
    { key: 'month', title: $t('本月') },
    { key: 'lastMonth', title: $t('上月') }
]
const state = reactive({
    loading: false,
    tableData: []
})
const router = useRouter()

onMounted(() => {
    fetchData()
})

// 获取表格数据
const fetchData = () => {
    state.loading = true
    getHomeOperateData({ tab: 3 }).then(({ code, data }) => {
        state.tableData = []
        if (code === 0 && data) {
            keyData.forEach(item => {
                if (data.userDetail[item.key]) {
                    data.userDetail[item.key].title = item.title
                    state.tableData.push(data.userDetail[item.key])
                }
            })
        }
        state.loading = false
    }).catch(err => {
        state.tableData = []
        state.loading = false
    })
}
</script>

<style lang="scss" scoped>
.operation-table {
    &-tips {
        font-size: 18px;
        line-height: 20px;
        color: #9c9ea2;
        margin-bottom: 20px;
    }
    .operation-box {
        width: 100%;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        padding-right: 20px;
        margin-top: 10px;
        font-size: 18px;
        color: #9c9ea2;
    }
}
</style>
