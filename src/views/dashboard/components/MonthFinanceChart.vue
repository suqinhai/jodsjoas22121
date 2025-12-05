<template>
    <!-- 首页-月财务图表 -->
    <div class="dashboard-box">
        <div class="dashboard-box-title">{{$t('游戏数据')}}</div>
        <div ref="echartsBox" style="width:100%;height:300px"></div>
    </div>
</template>

<script setup name="memberDetail">
import { reactive, onMounted, shallowRef } from 'vue'
import { getMerchantFinanceData } from '@/api/dashboard'
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

const state = reactive({
    options: {
        title: {
            text: '',
            left: 10,
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: [$t('充值'), $t('提现'), $t('盈利')]
        },
        grid: {
            left: '20px',
            right: '50px',
            bottom: '0px',
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
        series: [
            {
                id: 'recharge',
                name: $t('充值'),
                type: 'line',
                data: []
            },
            {
                id: 'cash',
                name: $t('提现'),
                type: 'line',
                data: []
            },
            {
                id: 'game',
                name: $t('盈利'),
                type: 'line',
                data: []
            },
        ]
    }
})
const echartsBox = shallowRef(null)

onMounted(() => {
    init()
})

const init = () => {
    var myChart = echarts.init(echartsBox.value)
    let date = new Date()
    let month = date.getMonth() + 1
    let year = date.getFullYear()
    const lastDay = new Date(year, month, 0).getDate()
    for (let index = 1; index <= lastDay; index++) {
        state.options.xAxis.data.push(year + '-' + (month > 9 ? month : '0' + month) + '-' + (index > 9 ? index : '0' + index))
    }
    state.options.title.text = month + $t('月数据')
    getMerchantFinanceData().then(({ code, data }) => {
        if (code === 0 && data) {
            state.options.series.forEach(item => {
                item.data = []
                state.options.xAxis.data.forEach(its => {
                    item.data.push(data[item.id][its] || 0)
                })

            })
        }
        myChart.setOption(state.options)
    })
}

</script>

<style lang="scss" >
</style>
