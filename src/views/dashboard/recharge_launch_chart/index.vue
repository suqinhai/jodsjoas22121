<template>
    <!-- 首页-充值投放图表 -->
    <div class="dashboard-box" v-loading="state.loading">
        <div class="dashboard-box-title">{{$t('充值投放图表')}}</div>
        <div class="dashboard-box-main">
            <el-form class="filter-form" :model="state.formData" inline>
                <el-form-item>
                    <el-date-picker v-model="state.formData.receiveTime" type="daterange" :start-placeholder="$t('开始时间')"
                        :end-placeholder="$t('结束时间')" :shortcuts="shortcuts" :disabled-date="disabledCurrentDateAfter" :clearable="false"
                        value-format="YYYY-MM-DD">
                    </el-date-picker>
                </el-form-item>
                <el-form-item :label="$t('站点:')" v-if="commonData.merchantSiteList.length > 1">
                    <MerchantSiteSelect isNeedDefault :clearable="false" v-model="state.formData.merchantId">
                    </MerchantSiteSelect>
                </el-form-item>
                <el-form-item>
                    <div class="search-but" v-throttle @click="handleSearch">
                        <img src="@/assets/img/common/search.png" alt="">
                    </div>
                    <!-- <el-button v-throttle type="primary" @click="handleSearch">{{$t('搜 索')}}</el-button> -->
                </el-form-item>
            </el-form>
            <div class="echarts-box">
                <div class="echarts-box-small echarts-box-small-special" ref="payChannelBox"></div>
                <div class="echarts-box-small" ref="registerBox"></div>
                <div class="echarts-box-small echarts-box-small-special" ref="rechargeNumberBox"></div>
                <div class="echarts-box-small" ref="rechargeFrequencyBox"></div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, shallowRef, onMounted } from 'vue'
import commonStore from '@/store/common'
import { getRechargeLaunchChart } from '@/api/dashboard'
import { getShortcuts, disabledCurrentDateAfter, dateFormat, getTimeRange } from '@/common/util'

import * as echarts from 'echarts/core'
import { TitleComponent, ToolboxComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'
import { PieChart } from 'echarts/charts'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
echarts.use([
    TitleComponent,
    ToolboxComponent,
    TooltipComponent,
    GridComponent,
    LegendComponent,
    PieChart,
    CanvasRenderer,
    UniversalTransition
])

const shortcuts = getShortcuts()
const state = reactive({
    loading: false,
    formData: {},
    payChannelOptions: {
        title: {
            text: $t('支付通道成功笔数'),
            left: 'center',
            top: 'bottom',
            textStyle: {
                fontWeight: 'normal',
                fontSize: 14,
                width: 310,
                overflow: 'breakAll'
            }
        },
        tooltip: {
            trigger: 'item',
            formatter: function (params) {
                return `${params.data.name} <br/>${$t('成功率:')} ${params.data.successRate || 0}% <br/>${$t('失败率:')} ${params.data.failRate || 0}%`
            },
        },
        // legend: {
        //     type: 'scroll',
        //     orient: 'vertical',
        //     left: 0,
        //     top: 0,
        //     bottom: 40,
        //     height: 180,
        // },
        series: {
            type: 'pie',
            radius: ['27%', '50%'],
            center: ['50%', '40%'],
            label: {
                // formatter: '{c}',
                formatter: function (params) {
                    return params.name + '：' + params.value
                },
                fontSize: 10,
                alignTo: 'edge',
                minMargin: 5,
                edgeDistance: 10,
                showAbove: true,
                // position: 'inside',
                // offset: [-10, -10],
                // rotate: 30,
                // minAngle: 15,
                // startAngle: 275,
            },
            labelLine: {
                // smooth: 0.5, // 使线条平滑，0.5表示中等程度平滑
                length: 5,
                length2: 5,
                minTurnAngle: 0
            },
            data: [],
            itemStyle: {
                normal: {
                    shadowBlur: 30, // 阴影的模糊级别
                    shadowColor: 'rgba(0, 0, 0, 0.3)', // 阴影的颜色
                    shadowOffsetX: 0, // 阴影水平方向的偏移量
                    shadowOffsetY: [10, 10], // 阴影垂直方向的偏移量
                },
            },
        }
    },
    registerOptions: {
        title: {
            text: $t('投放渠道注册人数数据'),
            left: 'center',
            top: 'bottom',
            textStyle: {
                fontWeight: 'normal',
                fontSize: 14,
                width: 190,
                overflow: 'breakAll'
            }
        },
        tooltip: {
            trigger: 'item'
        },
        series: {
            type: 'pie',
            radius: ['27%', '50%'],
            // radius: '50%',
            center: ['50%', '40%'],
            label: {
                // formatter: '{c}',
                formatter: `{name|{b}}\n{time|{c}}`,
                fontSize: 10,
                alignTo: 'edge',
                minMargin: 5,
                edgeDistance: 10,
                showAbove: true,
                lineHeight: 15,
                rich: {
                    time: {
                        fontSize: 10,
                        color: '#999'
                    }
                }
            },
            labelLine: {
                // smooth: 0.5, // 使线条平滑，0.5表示中等程度平滑
                length: 5,
                length2: 5,
                minTurnAngle: 0
            },
            labelLayout: function (params) {
                const isLeft = params.labelRect.x < 135
                const points = params.labelLinePoints
                points[2][0] = isLeft
                    ? params.labelRect.x
                    : params.labelRect.x + params.labelRect.width
                return {
                    labelLinePoints: points
                }
            },
            data: [],
            itemStyle: {
                normal: {
                    shadowBlur: 30, // 阴影的模糊级别
                    shadowColor: 'rgba(0, 0, 0, 0.3)', // 阴影的颜色
                    shadowOffsetX: 0, // 阴影水平方向的偏移量
                    shadowOffsetY: [10, 10], // 阴影垂直方向的偏移量
                },
            },
        }
    },
    rechargeNumberOptions: {
        title: {
            text: $t('充值范围人数占比'),
            left: 'center',
            top: 'bottom',
            textStyle: {
                fontWeight: 'normal',
                fontSize: 14,
                width: 190,
                overflow: 'breakAll'
            }
        },
        tooltip: {
            trigger: 'item'
        },
        series: {
            type: 'pie',
            // radius: '70%',
            // center: ['70%', '40%'],
            // label: {
            //     formatter: '{c}',
            //     position: 'inside'
            // },
            radius: ['27%', '50%'],
            // radius: '50%',
            center: ['50%', '40%'],
            label: {
                formatter: `{name|{b}}\n{time|{c}${$t('人')}}`,
                fontSize: 10,
                alignTo: 'edge',
                minMargin: 5,
                edgeDistance: 10,
                showAbove: true,
                lineHeight: 15,
                rich: {
                    time: {
                        fontSize: 10,
                        color: '#999'
                    }
                }
            },
            labelLine: {
                length: 5,
                length2: 5,
                minTurnAngle: 0
            },
            labelLayout: function (params) {
                const isLeft = params.labelRect.x < 150
                const points = params.labelLinePoints
                points[2][0] = isLeft
                    ? params.labelRect.x
                    : params.labelRect.x + params.labelRect.width
                return {
                    labelLinePoints: points
                }
            },
            data: [],
            itemStyle: {
                normal: {
                    shadowBlur: 30, // 阴影的模糊级别
                    shadowColor: 'rgba(0, 0, 0, 0.3)', // 阴影的颜色
                    shadowOffsetX: 0, // 阴影水平方向的偏移量
                    shadowOffsetY: [10, 10], // 阴影垂直方向的偏移量
                },
            },
        }
    },
    rechargeFrequencyOptions: {
        title: {
            text: $t('充值次数范围人数占比'),
            left: 'center',
            top: 'bottom',
            textStyle: {
                fontWeight: 'normal',
                fontSize: 14,
                width: 270,
                overflow: 'breakAll'
            }
        },
        tooltip: {
            trigger: 'item'
        },
        series: {
            type: 'pie',
            radius: ['27%', '50%'],
            // radius: '50%',
            center: ['50%', '40%'],
            label: {
                formatter: `{name|{b}${$t('次')}}\n{time|{c}${$t('人')}}`,
                fontSize: 10,
                alignTo: 'edge',
                minMargin: 5,
                edgeDistance: 10,
                showAbove: true,
                lineHeight: 15,
                rich: {
                    time: {
                        fontSize: 10,
                        color: '#999'
                    }
                }
            },
            labelLine: {
                length: 5,
                length2: 5,
                minTurnAngle: 0
            },
            labelLayout: function (params) {
                const isLeft = params.labelRect.x < 135
                const points = params.labelLinePoints
                points[2][0] = isLeft
                    ? params.labelRect.x
                    : params.labelRect.x + params.labelRect.width
                return {
                    labelLinePoints: points
                }
            },
            data: [],
            itemStyle: {
                normal: {
                    shadowBlur: 30, // 阴影的模糊级别
                    shadowColor: 'rgba(0, 0, 0, 0.3)', // 阴影的颜色
                    shadowOffsetX: 0, // 阴影水平方向的偏移量
                    shadowOffsetY: [10, 10], // 阴影垂直方向的偏移量
                },
            },
        }
    },
})
const commonData = commonStore()
const payChannelBox = shallowRef(null)
const payChannelChart = shallowRef(null)
const registerBox = shallowRef(null)
const registerChart = shallowRef(null)
const rechargeNumberBox = shallowRef(null)
const rechargeNumberChart = shallowRef(null)
const rechargeFrequencyBox = shallowRef(null)
const rechargeFrequencyChart = shallowRef(null)

onMounted(() => {
    state.formData.receiveTime = getTimeRange(7, 0)
    payChannelChart.value = echarts.init(payChannelBox.value)
    payChannelChart.value.setOption(state.payChannelOptions)
    registerChart.value = echarts.init(registerBox.value)
    registerChart.value.setOption(state.registerOptions)
    rechargeNumberChart.value = echarts.init(rechargeNumberBox.value)
    rechargeNumberChart.value.setOption(state.rechargeNumberOptions)
    rechargeFrequencyChart.value = echarts.init(rechargeFrequencyBox.value)
    rechargeFrequencyChart.value.setOption(state.rechargeFrequencyOptions)
    handleSearch()
})

const handleSearch = () => {
    state.loading = true
    let { receiveTime, merchantId } = state.formData
    let params = { merchantId }
    if (receiveTime && receiveTime.length) {
        params['interval.begin'] = receiveTime[0]
        params['interval.end'] = receiveTime[1]
    }
    getRechargeLaunchChart(params).then(({ code, data }) => {
        if (code === 0 && data) {
            let { rechargeChannel = [], registerChannel = [], amountRange = [], countRange = [] } = data
            setChartData(rechargeChannel, 'payChannel', 1)
            setChartData(registerChannel, 'register', 2)
            setChartData(amountRange, 'rechargeNumber', 3)
            setChartData(countRange, 'rechargeFrequency', 4)
        } else {
            initData()
        }
        state.loading = false
    }).catch(err => {
        initData()
        state.loading = false
    })
}

const initData = () => {
    state.payChannelOptions.series.data = []
    payChannelChart.value.setOption(state.payChannelOptions)
    state.registerOptions.series.data = []
    registerChart.value.setOption(state.registerOptions)
    state.rechargeNumberOptions.series.data = []
    rechargeNumberChart.value.setOption(state.rechargeNumberOptions)
    state.rechargeFrequencyOptions.series.data = []
    rechargeFrequencyChart.value.setOption(state.rechargeFrequencyOptions)
}

const setChartData = (data, key, type) => {
    state[key + 'Options'].series.data = data.map((item => {
        let obj = {
            value: item.count,
            name: item.name
        }
        if (type === 1) {
            obj.failRate = item.failRate
            obj.successRate = item.successRate
        }
        return obj
    }))
    switch (type) {
        case 1:
            payChannelChart.value.setOption(state[key + 'Options'])
            break
        case 2:
            registerChart.value.setOption(state[key + 'Options'])
            break
        case 3:
            rechargeNumberChart.value.setOption(state[key + 'Options'])
            break
        case 4:
            rechargeFrequencyChart.value.setOption(state[key + 'Options'])
            break
    }
}
</script>

<style lang="scss">
.echarts-box {
    display: flex;
    justify-content: space-around;
    &-small {
        // width: 280px;
        // height: 220px;
        width: 270px;
        height: 250px;
        flex-shrink: 0;
        // margin-right: 20px;
        &-special {
            width: 300px;
        }
    }
    // .echarts-box-small + .echarts-box-small {
    //     margin-left: 8px;
    // }
}
</style>
