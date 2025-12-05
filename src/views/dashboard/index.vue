<template>
    <!-- 首页 -->
    <div class="dashboard" :class="{'dashboard-en': $locale !== 'zh'}">
        <template v-if="list.length">
            <component :is="list[index].component" :key="list[index].routeCode" v-for="(item,index) in showLength"></component>
        </template>
        <div class="look-more" v-if="list.length > showLength">
            <el-button v-throttle type="primary" @click="showLength = list.length ">{{$t('查看更多')}}</el-button>
        </div>
    </div>
</template>

<script setup name="dashboard">
import { ref, defineAsyncComponent, onMounted, reactive, markRaw } from 'vue'
import userStore from '@/store/user'
import PlatformCost from './platform_cost/index.vue'
import NewlyAddedData from './newly_added_data/index.vue'
import OnlineUserStatistics from './online_user_statistics/index.vue'
const BetPersonnelStatistics = defineAsyncComponent(() => import("./bet_personnel_statistics/index.vue"))
const RechargePersonnelStatistics = defineAsyncComponent(() => import("./recharge_personnel_statistics/index.vue"))
const RechargeRetentionStatistics = defineAsyncComponent(() => import("./recharge_retention_statistics/index.vue"))
const BetAmountStatistics = defineAsyncComponent(() => import("./bet_amount_statistics/index.vue"))
const RechargeLaunchChart = defineAsyncComponent(() => import("./recharge_launch_chart/index.vue"))
const LaunchRoiStatistics = defineAsyncComponent(() => import("./launch_roi_statistics/index.vue"))
const FinancialDataSummary = defineAsyncComponent(() => import("./financial_data_summary/index.vue"))
const StatisticData = defineAsyncComponent(() => import("./statistic_data/index.vue"))

const isShow = ref(false)
const userData = userStore()
const allList = reactive([
    {
        component: markRaw(StatisticData),
        routeCode: 'merchant.report.homeInfo',
    },
    {
        component: markRaw(PlatformCost),
        routeCode: 'merchant.merchant-fee-stat.list'
    }, {
        component: markRaw(NewlyAddedData),
        routeCode: 'merchant.report.addDataStat'
    }, {
        component: markRaw(OnlineUserStatistics),
        routeCode: 'merchant.report.userDayStat'
    }, {
        component: markRaw(BetPersonnelStatistics),
        routeCode: 'merchant.report.userDayStat-1'
    }, {
        component: markRaw(RechargePersonnelStatistics),
        routeCode: 'merchant.report.userDayStat-2'
    }, {
        component: markRaw(RechargeRetentionStatistics),
        routeCode: 'merchant.report.userDayStat-3'
    }, {
        component: markRaw(BetAmountStatistics),
        routeCode: 'merchant.report.userDayStat-4'
    }, {
        component: markRaw(RechargeLaunchChart),
        routeCode: 'merchant.report.rechargeChart'
    }, {
        component: markRaw(LaunchRoiStatistics),
        routeCode: 'merchant.channel.roiDailyStatList'
    }, {
        component: markRaw(FinancialDataSummary),
        routeCode: 'merchant.merchant-other-fee-log.feeStat'
    }
])
const list = reactive([])
const showLength = ref(3)


const showDialog = (id) => {
    globalVBus.$emit('memberDetailDialog', id)
}

onMounted(() => {
    list.push(...allList.filter(item => userData.funPermissList.includes(item.routeCode)))
    if (showLength.value > list.length) showLength.value = list.length
})
</script>

<style lang="scss">
.dashboard {
    background-color: #f5f5f9;
    min-width: 1227px;
    min-height: 100%;

    .look-more {
        margin-top: 16px;
    }

    &-box {
        margin-bottom: 21px;
        &-title {
            height: 18px;
            display: flex;
            align-items: center;
            font-size: 18px;
            font-weight: bolder;
            color: #3d3d3d;
            padding-left: 15px;
            margin-bottom: 9px;
            position: relative;
            &::before {
                content: '';
                width: 4px;
                height: 18px;
                position: absolute;
                top: 0;
                left: 0;
                background: #0067ff;
            }
        }

        &-main {
            background-color: #fff;
            padding: 21px;
            border-radius: 10px;

            .el-form-item {
                margin-bottom: 14px;
            }

            .el-table {
                th {
                    background-color: #fff !important;
                }
                .el-table__cell {
                    padding: 10px 0;
                }

                .el-table__header .cell {
                    font-size: 14px;
                    color: #5b6388;
                }

                td.el-table__cell,
                th.el-table__cell.is-leaf {
                    border-bottom: none !important;
                }

                .el-table__inner-wrapper::before {
                    height: 0;
                }

                .total-row > .el-table__cell {
                    background: #f5f5f9;
                }
            }
            .divider-line {
                height: 1px;
                background: #dfdfdf;
                &-special {
                    height: 1px;
                    background: #dfdfdf;
                    margin-top: 10px;
                }
            }
            .foot {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-top: 17px;
                padding: 0 3px;
                height: 15px;
                color: #8e929c;

                .view-more {
                    width: fit-content;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;

                    img {
                        margin-left: 12px;
                        width: 12px;
                        height: 11px;
                    }
                    &:hover {
                        cursor: pointer;
                    }
                }
            }
            .search-but {
                width: 44px;
                height: 32px;
                img {
                    width: 44px;
                    height: 32px;
                }
                &:hover {
                    cursor: pointer;
                }
            }
            .filter-form .el-form-item {
                margin-right: 26px !important;
            }
        }
    }

    &-en {
        min-width: 1472px;
    }
}
</style>
