<template>
    <!-- 首页-运营统计图表 -->
    <div class="operation-chart dashboard-box pr" v-loading="state.loading">
        <div class="dashboard-box-title">{{$t('运营总览')}}</div>
        <div class="head">
            <div>
                <el-date-picker v-model="state.registerTime" type="daterange" value-format="YYYY-MM-DD" :start-placeholder="$t('开始时间')"
                    :shortcuts="shortcuts" :end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter" :clearable="false"
                    @change="timeChange" :default-time="defaultTime" />
            </div>
            <div class="tab">
                <div v-for="item in Object.values(tabData)" :key="item.key" class="tab-box pointer" :class="{'active':state.currentType == item.key}"
                    @click="handleTab('currentType',item.key)">{{ item.title }}
                </div>
            </div>
        </div>
        <div ref="echartsBox" style="width:100%;height:300px"></div>

        <div class="tab pa game-box" style="width: 180px" v-if="keyData2.includes(state.currentType)">
            <div v-for="item in gameData" :key="item.key" class="tab-box pointer" :class="{'active':state.switchIndex == item.key}"
                @click="handleTab('switchIndex',item.key)">{{ item.title }}
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, onMounted, shallowRef } from 'vue'
import { ElMessage } from 'element-plus'
import { getHomeOperateData } from '@/api/dashboard'
import { getShortcuts, getDefaultTime, getCurrentWeekTime, disabledCurrentDateAfter } from '@/common/util'
import * as echarts from 'echarts/core'
import { TitleComponent, ToolboxComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'
import { LineChart } from 'echarts/charts'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
echarts.use([
    TitleComponent,
    ToolboxComponent,
    TooltipComponent,
    GridComponent,
    LegendComponent,
    LineChart,
    CanvasRenderer,
    UniversalTransition
]);

const gameData = [
    { key: 0, title: $t('游戏类型') },
    { key: 1, title: $t('游戏平台') },
]
const tabData = [
    { key: 'agentUserCount', title: $t('新增代理') },
    { key: 'userCount', title: $t('新增会员') },
    { key: 'rechargeTimes', title: $t('充值次数') },
    { key: 'cashTimes', title: $t('提现次数') },
    { key: 'cashAmount', title: $t('提现金额') },
    { key: 'discountAmount', title: $t('每日优惠') },
    { key: 'validCoin', title: $t('有效投注') },
    { key: 'coinUserCount', title: $t('投注人数') },
    { key: 'winLoseCoin', title: $t('损益') },
]
const keyData1 = ['agentUserCount', 'userCount', 'rechargeTimes', 'cashTimes', 'cashAmount', 'discountAmount']
const keyData2 = ['validCoin', 'coinUserCount', 'winLoseCoin']
const shortcuts = getShortcuts()
let defaultTime = getDefaultTime()
const state = reactive({
    loading: false,
    currentType: 'agentUserCount',
    switchIndex: 0,
    registerTime: [],
    chartData: {
        agentUserCount: [],
        userCount: [],
        rechargeTimes: [],
        cashTimes: [],
        cashAmount: [],
        discountAmount: [],
        validCoin: [],
        coinUserCount: [],
        winLoseCoin: [],
    },
    params: {},
    options: {
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            show: false,
            padding: [0, 0, 0, 400],
        },
        grid: {
            left: 20,
            right: 50,
            bottom: 0,
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: []
        },
        yAxis: {
            type: 'value'
        },
        series: {
            name: $t('新增代理'),
            type: 'line',
            data: []
        }
    }
})
const echartsBox = shallowRef(null)
const myChart = shallowRef(null)

onMounted(() => {
    myChart.value = echarts.init(echartsBox.value)
    state.registerTime = getCurrentWeekTime()
    state.options.xAxis.data = []
    if (new Date(state.registerTime[0]).getMonth() === new Date(state.registerTime[1]).getMonth()) {
        let startDate = state.registerTime[0].substr(8) * 1
        let endDate = state.registerTime[1].substr(8) * 1
        let leftPart = state.registerTime[0].substr(0, 8)
        for (let index = startDate; index <= endDate; index++) {
            state.options.xAxis.data.push(leftPart + (index > 9 ? index : '0' + index))
        }
    } else {
        dateDispose(state.registerTime[0], 0)
        dateDispose(state.registerTime[1], 1)
    }
    init()
})

const init = () => {
    state.params = {
        tab: keyData1.includes(state.currentType) ? 5 : 4,
        bizType: keyData1.includes(state.currentType) ? '' : state.switchIndex,
        'interval.begin': state.registerTime[0],
        'interval.end': state.registerTime[1],
    }
    state.loading = true
    getHomeOperateData(state.params).then(({ code, data }) => {
        if (code === 0 && data) {
            let currentKey = keyData1.includes(state.currentType) ? keyData1 : keyData2
            let key = keyData1.includes(state.currentType) ? 'userDetailGraph' : 'gameCoin'
            let nameList = []
            let dataList = []
            currentKey.forEach(item => {
                if (keyData1.includes(state.currentType)) {
                    state.chartData[item] = state.options.xAxis.data.map(its => {
                        let obj = data[key].find(ins => ins.reportTime_ === its)
                        if (obj) {
                            return (obj[item] || 0)
                        } else {
                            return 0
                        }
                    })
                } else {
                    dataList = Object.values(data[key])
                    nameList = Object.keys(data[key])
                    state.chartData[item] = dataList.map(((im, index) => {
                        let obj = {
                            name: nameList[index],
                            type: 'line',
                        }
                        obj.data = state.options.xAxis.data.map(its => {
                            let activeObj = im.find(ins => ins.reportTime_ === its)
                            if (activeObj) {
                                return (activeObj[item] || 0)
                            } else {
                                return 0
                            }
                        })
                        return obj
                    }))
                }
            })
            if (keyData1.includes(state.currentType)) {
                state.options.series = {
                    name: tabData.find(item => item.key === state.currentType).title,
                    type: 'line',
                    data: state.chartData[state.currentType]
                }
                state.options.legend.show = false
                state.options.legend.data = []
            } else {
                state.options.series = state.chartData[state.currentType]
                state.options.legend.data = nameList
                state.options.legend.show = true
            }
            myChart.value.setOption(state.options, true)
        }
        state.loading = false
    }).catch(() => {
        state.chartData[state.currentType] = []
        state.options.series = {
            name: tabData.find(item => item.key === state.currentType).title,
            type: 'line',
            data: []
        }
        myChart.value.setOption(state.options, true)
        state.loading = false
    })
}

const dateDispose = (data, type = 0) => {
    let initDay = !type ? data.substr(8) * 1 : 1
    let year = data.substr(0, 4) * 1
    let month = data.substr(5, 2) * 1
    let lastDay = !type ? new Date(year, month, 0).getDate() : data.substr(8) * 1
    let leftPart = data.substr(0, 8)
    for (let index = initDay; index <= lastDay; index++) {
        state.options.xAxis.data.push(leftPart + (index > 9 ? index : '0' + index))
    }
}

const handleTab = (type, key) => {
    if (state[type] === key) return
    if (type === 'currentType' && ((keyData1.includes(state.currentType) && keyData1.includes(key)) ||
        keyData2.includes(state.currentType) && keyData2.includes(key))) {
        state.currentType = key
        if (keyData1.includes(key)) {
            state.options.series = {
                name: tabData.find(item => item.key === state.currentType).title,
                type: 'line',
                data: state.chartData[state.currentType]
            }
        } else {
            state.options.series = state.chartData[state.currentType]
        }
        myChart.value.setOption(state.options, true)
    } else {
        state[type] = key
        init()
    }

}

const timeChange = (value) => {
    if (value[0] && state.params['interval.begin'] && value[0] === state.params['interval.begin'] &&
        value[1] && state.params['interval.end'] && value[1] === state.params['interval.end']) return
    if ((new Date(value[1] + ' 23:59:59').getTime() - new Date(value[0] + ' 00:00:00').getTime()) > 31 * 24 * 60 * 60 * 1000) {
        return ElMessage.warning($t('日期范围最大跨度为31天！'))
    }
    state.options.xAxis.data = []
    if (new Date(state.registerTime[0] + ' 00:00:00').getMonth() === new Date(state.registerTime[1] + ' 23:59:59').getMonth()) {
        let startDate = state.registerTime[0].substr(8) * 1
        let endDate = state.registerTime[1].substr(8) * 1
        let leftPart = state.registerTime[0].substr(0, 8)
        for (let index = startDate; index <= endDate; index++) {
            state.options.xAxis.data.push(leftPart + (index > 9 ? index : '0' + index))
        }
    } else {
        dateDispose(state.registerTime[0], 0)
        dateDispose(state.registerTime[1], 1)
    }
    init()
}
</script>

<style lang="scss">
.operation-chart {
    .tab {
        width: 850px;
        height: 36px;
        border: 1px solid #409eff;
        border-radius: 2px;
        display: flex;
        margin-left: 20px;

        &-box {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            text-align: center;
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
    .head {
        display: flex;
        align-items: center;
        padding-left: 20px;
        margin-bottom: 10px;
    }

    .game-box {
        left: 30px;
        top: 115px;
    }
}
</style>
