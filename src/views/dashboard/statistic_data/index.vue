<template>
    <!-- 首页-数据总览 -->
    <div class="dashboard-statistic-data" :class="{'dashboard-statistic-data-en': $locale !== 'zh'}">
        <div class="site-data">
            <div class="small-box">
                <div class="small-box-head">
                    <img src="../../../assets/img/home/site.png" alt="">
                    {{$t('站点数据')}}
                </div>
                <div class="small-box-main">
                    <div class="main-left">
                        <div class="text total">{{$t('历史站点数')}}</div>
                        <div class="text total">{{$t('本月新开站点数')}}</div>
                        <div class="text title">{{$t('站点余额')}}</div>
                        <div class="text title">{{$t('授信额度')}}</div>
                        <div class="text title" v-if="!userData.userInfo.limitMerAccount">{{$t('可用余额')}}</div>
                        <div class="text title">{{$t('未结账单')}}</div>
                        <div class="text title">{{$t('用户余额')}}
                            <el-tooltip class="box-item" effect="dark" :content="$t('用户余额：数据刷新存在5分钟左右的延迟')" placement="top-start">
                                <span class="pointer">
                                    <el-icon :size="16">
                                        <QuestionFilled />
                                    </el-icon>
                                </span>
                            </el-tooltip>
                        </div>
                    </div>
                    <div class="main-right">
                        <div class="text value" @click="handleGo('/merchant-center/merchant-info')">{{ state.merchantData.historySiteNum || 0  }}
                        </div>
                        <div class="text value" @click="handleGo('/merchant-center/merchant-info')">{{ state.merchantData.todaySiteNum || 0  }}
                        </div>
                        <div class="text value" @click="handleGo('/merchant-center/merchant-info')">
                            {{ state.merchantData.activeAmount ? Math.floor(state.merchantData.activeAmount * 100) / 100 : 0  }}</div>
                        <div class="text value" @click="handleGo('/merchant-center/merchant-info')">{{ state.merchantData.initOverdraft || 0  }}
                        </div>
                        <div class="text value" @click="handleGo('/merchant-center/merchant-info')" v-if="!userData.userInfo.limitMerAccount">
                            {{ state.merchantData.totalAmount ? Math.floor(state.merchantData.totalAmount * 100) / 100 : 0}}</div>
                        <div class="text value" @click="handleGo('/merchant-center/merchant-info')">{{ state.merchantData.unpaidBill || 0  }}
                        </div>
                        <div class="text value" @click="handleGo('/user-manage/all-member')">{{ state.merchantData.userActiveAmount || 0  }}</div>
                    </div>
                </div>
            </div>
            <div class="small-box">
                <div class="small-box-head">
                    <img src="../../../assets/img/home/bet.png" alt="">
                    {{$t('投注数据')}}
                </div>
                <div class="small-box-main">
                    <div class="main-left">
                        <div class="text total">{{$t('有效投注')}}</div>
                        <div class="text total">{{$t('投注人数')}}</div>
                        <div class="text total">{{$t('游戏输赢')}}</div>
                    </div>
                    <div class="main-right">
                        <div class="text value" @click="handleGo('/game-center/bet-log?tab=1',2)">{{ state.merchantData.validCoinTotal || 0  }}
                        </div>
                        <div class="text value" @click="handleGo('/game-center/game-statistics',1)">
                            {{ state.merchantData.userCountTotalHistory || 0  }}
                        </div>
                        <div class="text value" :class="{'text-special': state.merchantData.winLoseCoinTotal < 0}"
                            @click="handleGo('/game-center/bet-log?tab=1',2)">
                            {{ state.merchantData.winLoseCoinTotal || 0  }}</div>
                        <div class="text value" @click="handleGo('/game-center/bet-log?tab=1&orientType=2',2)">
                            {{ state.merchantData.pgcValidCoinTotal || 0  }}</div>
                        <div class="text value" @click="handleGo('/game-center/bet-log?tab=1&orientType=2',2)">
                            {{ state.merchantData.pgcUserCountTotalHistory || 0  }}</div>
                        <div class="text value" :class="{'text-special': state.merchantData.pgcWinLoseCoinTotal < 0}"
                            @click="handleGo('/game-center/bet-log?tab=1&orientType=2',2)">
                            {{ state.merchantData.pgcWinLoseCoinTotal || 0  }}</div>
                        <div class="text value" @click="handleGo('/game-center/bet-log?tab=1&orientType=3',2)">
                            {{ state.merchantData.njlValidCoinTotal || 0  }}</div>
                        <div class="text value" @click="handleGo('/game-center/bet-log?tab=1&orientType=3',2)">
                            {{ state.merchantData.njlUserCountTotalHistory || 0  }}</div>
                        <div class="text value" :class="{'text-special': state.merchantData.njlWinLoseCoinTotal < 0}"
                            @click="handleGo('/game-center/bet-log?tab=1&orientType=3',2)">
                            {{ state.merchantData.njlWinLoseCoinTotal || 0  }}</div>
                        <div class="text value" @click="handleGo('/game-center/bet-log?tab=1&orientType=4',2)">
                            {{ state.merchantData.nppValidCoinTotal || 0  }}</div>
                        <div class="text value" @click="handleGo('/game-center/bet-log?tab=1&orientType=4',2)">
                            {{ state.merchantData.nppUserCountTotalHistory || 0  }}</div>
                        <div class="text value" :class="{'text-special': state.merchantData.nppWinLoseCoinTotal < 0}"
                            @click="handleGo('/game-center/bet-log?tab=1&orientType=4',2)">
                            {{ state.merchantData.nppWinLoseCoinTotal || 0  }}</div>
                    </div>
                </div>
            </div>
            <div class="small-box small-box-special">
                <div class="small-box-head">
                    <img src="../../../assets/img/home/finance.png" alt="">
                    {{$t('充值 / 提现数据')}}
                </div>
                <div class="small-box-main small-box-main-special">
                    <div class="main-left">
                        <div class="text total">{{$t('在线充值')}}</div>
                        <div class="text total">{{$t('转账充值')}}</div>
                        <div class="text total">{{$t('人工加款(可提现)')}}</div>
                        <div class="text total">{{$t('人工加款(不可提现)')}}</div>
                        <div class="text title">{{$t('首次在线充值')}}</div>
                        <div class="text title">{{$t('首次转账充值')}}</div>
                        <div class="text title">{{$t('在线提现')}}</div>
                        <div class="text title">{{$t('转账提现')}}</div>
                        <div class="text title">{{$t('首次在线提现')}}</div>
                        <div class="text title">{{$t('首次转账提现')}}</div>
                    </div>
                    <div class="main-right main-right-special">
                        <div class="special-box">
                            <div class="text value" @click="handleGo('/finance-center/recharge-order-list?',3)">
                                {{state.merchantData.rechargeAmount || 0}}</div>
                            <div class="text value" @click="handleGo('/finance-center/transfer-accounts-audit?',3)">
                                {{state.merchantData.rechargeAmountOffline || 0}}</div>
                            <div class="text value" @click="handleGo('/finance-center/artificial-adjust-amount?tab=1&tradeType=20',1)">
                                {{ state.merchantData.adjustCashAmount || 0  }}</div>
                            <div class="text value" @click="handleGo('/finance-center/artificial-adjust-amount?tab=1&tradeType=20',1)">
                                {{ state.merchantData.adjustCashLimitAmount || 0  }}</div>
                            <!-- <div class="text" @click="handleGo('/finance-center/recharge-order-list?',4)"> -->
                            <div class="text value-special">{{state.merchantData.firstRechargeAmount || 0}}</div>
                            <!-- <div class="text" @click="handleGo('/finance-center/transfer-accounts-audit?',4)"> -->
                            <div class="text value-special">{{state.merchantData.firstRechargeAmountOffline || 0}}</div>
                            <div class="text value text-special" @click="handleGo('/finance-center/withdrawl-order-list',3)">
                                {{ state.merchantData.cashAmount || 0  }}</div>
                            <div class="text value text-special" @click="handleGo('/finance-center/transfer-accounts',3)">
                                {{ state.merchantData.cashAmountOffline || 0  }}</div>
                            <div class="text value text-special" @click="handleGo('/finance-center/withdrawl-order-list',4)">
                                {{ state.merchantData.firstCashAmount || 0  }}</div>
                            <div class="text value text-special" @click="handleGo('/finance-center/transfer-accounts',4)">
                                {{ state.merchantData.firstCashAmountOffline || 0  }}</div>
                        </div>
                        <div class="special-box special-box-right">
                            <div class="text total quantity" @click="handleGo('/finance-center/recharge-order-list?',3)">
                                {{ state.merchantData.rechargeCount || 0  }} {{$t('人')}}</div>
                            <div class="text total quantity" @click="handleGo('/finance-center/transfer-accounts-audit?',3)">
                                {{ state.merchantData.rechargeCountOffline || 0  }} {{$t('人')}}</div>
                            <div class="text total quantity" @click="handleGo('/finance-center/artificial-adjust-amount?tab=1&tradeType=20',1)">
                                {{ state.merchantData.adjustCashCount || 0  }} {{$t('人')}}</div>
                            <div class="text total quantity" @click="handleGo('/finance-center/artificial-adjust-amount?tab=1&tradeType=20',1)">
                                {{ state.merchantData.adjustCashLimitCount || 0  }} {{$t('人')}}</div>
                            <!-- <div class="text total quantity" @click="handleGo('/finance-center/recharge-order-list?',4)"> -->
                            <div class="text total">{{ state.merchantData.firstRechargeCount || 0  }} {{$t('人')}}</div>
                            <!-- <div class="text total quantity" @click="handleGo('/finance-center/transfer-accounts-audit?',4)"> -->
                            <div class="text total">{{ state.merchantData.firstRechargeCountOffline || 0  }} {{$t('人')}}</div>
                            <div class="text total quantity" @click="handleGo('/finance-center/withdrawl-order-list',3)">
                                {{ state.merchantData.cashCount || 0  }} {{$t('人')}}</div>
                            <div class="text total quantity" @click="handleGo('/finance-center/transfer-accounts',3)">
                                {{ state.merchantData.cashCountOffline || 0  }} {{$t('人')}}</div>
                            <div class="text total quantity" @click="handleGo('/finance-center/withdrawl-order-list',4)">
                                {{ state.merchantData.firstCashCount || 0  }} {{$t('人')}}</div>
                            <div class="text total quantity" @click="handleGo('/finance-center/transfer-accounts',4)">
                                {{ state.merchantData.firstCashCountOffline || 0  }} {{$t('人')}}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, onMounted, defineEmits } from 'vue'
import { useRouter } from 'vue-router'
import userStore from '@/store/user'
import commonStore from '@/store/common'
import { ElMessage } from 'element-plus'
import { getMerchantDataOverview } from '@/api/dashboard'
import { getShortcuts, disabledCurrentDateAfter, getTimeRange } from '@/common/util'

const emits = defineEmits(['showMore'])
const shortcuts = getShortcuts()
const state = reactive({
    merchantData: {},
    isShow: false,
    interval: [],
    searchTime: [],
    searchData: {},
    memberType: 1,
    memberValue: '',
    agentType: 1,
    agentValue: '',
    isDirectly: false,
})
const router = useRouter()
const userData = userStore()
const commonData = commonStore()

onMounted(() => {
    state.interval = getTimeRange()
    handleSearch()
})

const handleSearch = () => {
    if (!state.interval || !state.interval.length) return ElMessage.warning($t('请选择时间再进行搜索！'))
    let params = {}
    state.memberType === 1 ? params.username = state.memberValue : params.userId = state.memberValue
    state.agentType === 1 ? params.agentUsername = state.agentValue : params.agentUserId = state.agentValue
    if (state.agentValue) params.directAgent = state.isDirectly ? 1 : 0
    if (state.interval && state.interval.length) {
        if (new Date(state.interval[1] + ' 23:59:59').getTime() - new Date(state.interval[0] + ' 00:00:00').getTime() > 31 * 24 * 60 * 60 * 1000) {
            return ElMessage.warning($t('查询范围不得超过31天！'))
        }
        params['interval.begin'] = state.interval[0]
        params['interval.end'] = state.interval[1]
    }
    globalVBus.$emit('globalLoading', true)
    getMerchantDataOverview(params).then(({ code, data }) => {
        if (code === 0 && data) {
            state.merchantData = data || {}
            if (userData.merchantInfo.totalAmount !== data.totalAmount) userData.merchantInfo.totalAmount = data.totalAmount || 0
            // if (userData.merchantInfo.totalAmount !== data.totalAmount) {
            //     userData.getMerchantDetail()
            // }
            state.searchData = { ...params }
            state.searchTime = [...state.interval]
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {

        globalVBus.$emit('globalLoading', false)
    })
}

const getImageUrl = (icon) => {
    return new URL(`../../../assets/img/home/${icon}.png`, import.meta.url).href
}

const handleLook = () => {
    state.isShow = true
    emits('showMore')
}

const handleGo = (url, disposeType = '') => {
    if (disposeType) {
        delete state.searchData['interval.begin']
        delete state.searchData['interval.end']
        delete state.searchData.directAgent
        if (url.indexOf('?') === -1) {
            url += '?'
        }
        if (disposeType !== -1) {
            for (let key in state.searchData) {
                state.searchData[key] && (url += '&' + key + '=' + state.searchData[key])
            }
        } else if (state.searchData.agentUsername) {
            url += '&username=' + state.searchData.agentUsername
        }
        if (state.searchTime.length && (disposeType !== 2 || (disposeType === 2 &&
            new Date(state.searchTime[1] + ' 23:59:59').getTime() - new Date(state.searchTime[0] + ' 00:00:00').getTime() <= 7 * 24 * 60 * 60 * 1000))) {
            url += '&startTime=' + state.searchTime[0] + (disposeType > 1 ? ' 00:00:00' : '')
            url += '&endTime=' + state.searchTime[1] + (disposeType > 1 ? ' 23:59:59' : '')
        }
        if (disposeType === 4) {
            url += '&isFirst=true'
        }
    }
    router.push(url)
}
</script>

<style lang="scss">
.dashboard-statistic-data {
    padding-bottom: 21px;
    background-color: #f5f5f9;

    .filter-box {
        .tips {
            color: red;
            font-size: 14px;
            margin-top: 5px;
            margin-left: 5px;
            font-weight: 500;
        }

        .item-box {
            background: #f9fafe;
            border: 1px solid var(--el-border-color);
            padding: 0 16px;
            border-radius: var(--el-border-radius-base);
        }
    }

    .result-box {
        padding-top: 21px;
        display: flex;
        flex-wrap: wrap;

        .small-box {
            width: 20%;
            display: flex;
            align-items: center;
            min-width: 188px;
            margin: 17px 0;

            img {
                width: 32px;
                height: 32px;
                margin-right: 5px;
            }

            &-content {
                margin-left: 4px;
                display: flex;
                flex-direction: column;
                justify-content: center;

                .title {
                    font-size: 14px;
                    font-weight: 500;
                    line-height: 14px;
                    letter-spacing: 0em;
                    font-variation-settings: 'opsz' auto;
                    color: #9c9c9e;
                    margin-bottom: 3px;
                }

                .text {
                    font-size: 16px;
                    font-weight: 500;
                    line-height: 16px;
                    letter-spacing: 0em;
                    font-variation-settings: 'opsz' auto;
                    color: #f6bf68;
                }
            }
        }
    }

    .site-data {
        display: flex;

        .small-box {
            flex: 1;
            display: flex;
            flex-direction: column;
            flex-shrink: 0;
            background: #ffffff;
            border-radius: 10px;

            &-head {
                height: 60px;
                display: flex;
                align-items: center;
                border-bottom: 1px solid #d8d8d8;
                padding-left: 23px;
                font-size: 16px;
                font-weight: bold;
                letter-spacing: 0.05em;
                font-variation-settings: 'opsz' auto;
                color: #3c3c3c;

                img {
                    width: 26px;
                    height: 26px;
                    margin-right: 7px;
                }
            }

            &-main {
                flex-shrink: 0;
                display: flex;
                padding-bottom: 30px;
                padding-left: 20px;

                .main-left {
                    flex-shrink: 0;
                    display: flex;
                    flex-direction: column;
                }

                .main-right {
                    flex-shrink: 0;
                    display: flex;
                    flex-direction: column;
                    margin-left: 40px;

                    &-special {
                        display: flex;
                        flex-direction: initial;

                        .value {
                            text-align: right;
                        }

                        .quantity {
                            text-align: left;
                        }

                        .special-box {
                            display: flex;
                            flex-direction: column;

                            &-right {
                                margin-left: 20px;
                            }
                        }
                    }
                }

                .text {
                    flex-shrink: 0;
                    margin-top: 15px;
                    font-size: 14px;
                    font-weight: 500;
                    line-height: 14px;
                    letter-spacing: 0em;
                    text-align: right;
                    color: #5c91dd;
                    white-space: nowrap;
                }

                .value {
                    text-align: left;

                    &:hover {
                        cursor: pointer;
                    }

                    &-special:hover {
                        cursor: auto;
                    }
                }

                .quantity:hover {
                    cursor: pointer;
                }

                .total {
                    color: #727375;
                }

                .title {
                    color: #3c3c3c;
                }

                .text-special {
                    color: red;
                }
            }
        }

        .small-box + .small-box {
            margin-left: 14px;
        }
    }
}

@media (max-width: 2000px) {
    .dashboard-statistic-data {
        &-en {
            .site-data .small-box-special {
                flex: 1.2;
            }
        }
    }
}

@media (max-width: 1600px) {
    .dashboard-statistic-data {
        &-en {
            .site-data .small-box-special {
                flex: 1.3;
            }
        }
    }
}

@media (max-width: 1350px) {
    .dashboard-statistic-data {
        .site-data {
            .small-box {
                width: fit-content;
                min-width: 321px;

                &-main {
                    display: flex;
                    padding-bottom: 30px;
                    padding-left: 0;

                    .main-left {
                        width: 150px;
                        display: flex;
                        flex-direction: column;
                    }

                    .main-right {
                        flex: 1;
                        margin-left: 72px;
                    }

                    .value {
                        width: 130px;
                        text-align: left;
                    }

                    &-special {
                        display: flex;

                        .main-right {
                            margin-left: 0;
                        }

                        .value {
                            text-align: right;
                        }

                        .quantity {
                            flex: 1;
                            min-width: 100px;
                            text-align: left;
                        }

                        .special-box {
                            display: flex;

                            &-right {
                                margin-left: 20px;
                            }
                        }
                    }
                }
            }
        }

        &-en {
            .site-data {
                .small-box {
                    flex: none;

                    &-main {
                        .main-left {
                            width: 250px;
                        }

                        &-special {
                            .main-left {
                                width: 270px;
                            }

                            .quantity {
                                min-width: 120px;
                            }
                        }
                    }
                }
            }
        }
    }
}
</style>
