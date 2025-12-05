<template>
    <!-- 首页-充值人数统计 -->
    <div class="dashboard-box" v-loading="state.loading">
        <div class="dashboard-box-title">{{$t('充值人数统计')}}</div>
        <div class="dashboard-box-main">
            <el-form class="filter-form" :model="state.formData" inline>
                <el-form-item>
                    <el-date-picker style="width: 120px" v-model="state.formData.time" type="month" :start-placeholder="$t('选择月份')"
                        :disabled-date="disabledCurrentDateAfter" :clearable="false" value-format="YYYY-MM">
                    </el-date-picker>
                </el-form-item>
                <el-form-item :label="$t('站点:')" v-if="commonData.merchantSiteList.length > 1">
                    <MerchantSiteSelect isShowAll isNeedDefault :clearable="false" v-model="state.formData.merchantId">
                    </MerchantSiteSelect>
                </el-form-item>
                <el-form-item>
                    <div class="search-but" v-throttle @click="handleSearch">
                        <img src="@/assets/img/common/search.png" alt="">
                    </div>
                    <!-- <el-button v-throttle type="primary" @click="handleSearch">{{$t('搜 索')}}</el-button> -->
                </el-form-item>
            </el-form>
            <div ref="echartsBox" style="width:100%;height:300px"></div>
        </div>
    </div>
</template>

<script setup>
import { reactive, shallowRef, onMounted } from 'vue'
import commonStore from '@/store/common'
import { getHomeStatData } from '@/api/dashboard'
import { disabledCurrentDateAfter, dateFormat } from '@/common/util'

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
])

const state = reactive({
    loading: false,
    formData: {},
    options: {
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            show: true,
        },
        grid: {
            left: '30px',
            right: '30px',
            bottom: '0',
            top: '30px',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: []
        },
        yAxis: {
            type: 'value',
            splitLine: {
                show: true,
                lineStyle: {
                    type: 'dashed', // 设置为虚线
                }
            }
        },
        series: {
            type: 'line',
            color: '#00E2D9',
            symbol: 'circle',
            symbolSize: 11,
            itemStyle: {
                normal: {
                    borderColor: '#fff', // 标记点的边框颜色
                    borderWidth: 1, // 标记点的边框宽度
                }
            },
            lineStyle: {
                width: 3,
            },
            data: [],
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {
                        offset: 0,
                        color: 'rgba(0, 226, 217, 1)'
                    },
                    {
                        offset: 1,
                        color: 'rgba(216, 216, 216, 0)'
                    }
                ])
            },
        }
    }
})
const commonData = commonStore()
const echartsBox = shallowRef(null)
const myChart = shallowRef(null)

onMounted(() => {
    state.formData.time = dateFormat(Date.now(), 'YYYY-MM')
    myChart.value = echarts.init(echartsBox.value)
    let month = state.formData.time.split('-')[1]
    let year = state.formData.time.split('-')[0]
    const lastDay = new Date(year, month, 0).getDate()
    for (let index = 1; index <= lastDay; index++) {
        state.options.xAxis.data.push(month + '-' + (index > 9 ? index : '0' + index))
    }
    handleSearch()
})

const handleSearch = async () => {
    try {
        state.loading = true
        let month = state.formData.time.split('-')[1]
        let year = state.formData.time.split('-')[0]
        const lastDay = new Date(year, month, 0).getDate()
        let { time, merchantId } = state.formData
        let params = {
            merchantId,
            'interval.begin': time + '-01',
            'interval.end': time + '-' + lastDay,
            tab: 2
        }
        let { code, data = {} } = await getHomeStatData(params)
        state.options.xAxis.data = []
        for (let index = 1; index <= lastDay; index++) {
            state.options.xAxis.data.push(month + '-' + (index > 9 ? index : '0' + index))
        }
        if (code === 0 && data) {
            state.options.series.data = state.options.xAxis.data.map(its => data[its] || 0)
        } else {
            state.options.series.data = []
        }
        myChart.value.setOption(state.options)
        state.loading = false
    } catch (error) {
        state.options.series.data = []
        myChart.value.setOption(state.options)
        state.loading = false
    }
}
</script>

<style lang="scss">
</style>
