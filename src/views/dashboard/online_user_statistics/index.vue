<template>
    <!-- 首页-在线用户统计 -->
    <div class="dashboard-box" v-loading="state.loading">
        <div class="dashboard-box-title">{{$t('在线用户统计')}}</div>
        <div class="dashboard-box-main">
            <el-form class="filter-form" :model="state.formData" inline>
                <el-form-item>
                    <el-date-picker style="width: 150px" v-model="state.formData.time" type="date" :start-placeholder="$t('选择日期')"
                        :disabled-date="disabledCurrentDateAfter" :clearable="false" value-format="YYYY-MM-DD">
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

const keyData = ['大厅', '游戏']
const commonObj = {
    type: 'line',
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
    }
}
const state = reactive({
    loading: false,
    formData: {},
    options: {
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            show: true,
            data: [$t('大厅'), $t('游戏')]
        },
        grid: {
            left: '30px',
            right: '30px',
            bottom: '0',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: [],
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
        series: []
    }
})
const commonData = commonStore()
const echartsBox = shallowRef(null)
const myChart = shallowRef(null)

onMounted(() => {
    state.formData.time = dateFormat(Date.now(), 'YYYY-MM-DD')
    myChart.value = echarts.init(echartsBox.value)
    for (let index = 0; index < 24; index++) {
        state.options.xAxis.data.push((index > 9 ? index : '0' + index) + ':00')
    }
    handleSearch()
})

const handleSearch = () => {
    state.loading = true
    let { time, merchantId } = state.formData
    let params = {
        merchantId,
        'interval.begin': time,
        'interval.end': time,
        tab:0
    }
    getHomeStatData(params).then(({ code, data = {} }) => {
        if (code === 0 && data && Object.keys(data).length) {
            state.options.series = keyData.map((name, index) => {
                let obj = {
                    ...commonObj,
                    name: $t(name),
                    color: !index ? '#006CFF' : '#FFB656'
                }
                obj.data = state.options.xAxis.data.map(its => data[name][its] || 0)
                return obj
            })
        } else {
            state.options.series = []
        }
        myChart.value.setOption(state.options, true)
        state.loading = false
    }).catch(err => {
        state.options.series = []
        myChart.value.setOption(state.options, true)
        state.loading = false
    })
}
</script>

<style lang="scss">
</style>
