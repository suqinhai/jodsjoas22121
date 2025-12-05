<template>
    <!-- 首页-人数统计图表 -->
    <div class="people-counting dashboard-box pr" v-loading="state.loading">
        <el-tabs v-model="state.type" @tab-click="tabClick">
            <el-tab-pane v-for="(item,index) in tabData" :key="index" :label="item.title" :name="index">
            </el-tab-pane>
        </el-tabs>
        <div ref="echartsBox" style="width:100%;height:300px"></div>
        <div class="select-platform pa" v-if="state.type === 2">
            <el-select v-model="state.vendor" clearable @change="handleChange" :placeholder="$t('全部平台')">
                <el-option v-for="item in state.gameVendor" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
        </div>
    </div>
</template>

<script setup name="memberDetail">
import { reactive, onMounted, shallowRef } from 'vue'
import { useRoute } from 'vue-router'
import { getHomeOperateData } from '@/api/dashboard'
import { getCommonMeta } from '@/api/common'

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

const tabData = [{ title: $t('今日注册'), key: 'register' }, { title: $t('当前在线'), key: 'loginOnline' }, { title: $t('游戏人数'), key: 'gamePlay' }]
const state = reactive({
    gameVendor: [],
    type: 0,
    vendor: '',
    loading: false,
    options: {
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            show: false,
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
        series: {
            type: 'line',
        }
    }
})
const route = useRoute()
const echartsBox = shallowRef(null)
const myChart = shallowRef(null)

onMounted(async () => {
    try {
        state.loading = true
        let res = await getCommonMeta({ types: 'gameVendor' })
        state.gameVendor = res.data.gameVendor || []
        myChart.value = echarts.init(echartsBox.value)
        state.options.xAxis.data = []
        for (let index = 0; index < 24; index++) {
            state.options.xAxis.data.push((index > 9 ? index : '0' + index) + ':00')
        }
        init(0)
    } catch (error) {
        state.loading = false
    }

})

const init = (val = 1) => {
    let params = {
        tab: state.type
    }
    if (state.type === 2) {
        params.vendor = state.vendor
    }
    if (!!val) state.loading = true
    getHomeOperateData(params).then(({ code, data }) => {
        if (code === 0 && data) {
            let currentData = data[tabData[state.type].key] || {}
            if (state.type !== 1) {
                state.options.series = {
                    name: tabData[state.type].title,
                    type: 'line',
                    data: state.options.xAxis.data.map(item => currentData[item] || 0)
                }
                state.options.legend.show = false
                state.options.legend.data = []
            } else {
                let dataList = Object.values(currentData)
                let nameList = Object.keys(currentData)
                state.options.series = dataList.map(((item, index) => {
                    let obj = {
                        name: nameList[index],
                        type: 'line',
                    }
                    obj.data = state.options.xAxis.data.map(its => item[its] || 0)
                    return obj
                }))
                state.options.legend.data = nameList
                state.options.legend.show = true
            }
        }
        myChart.value.setOption(state.options, true)
        state.loading = false
    })
}

const tabClick = ({ props }) => {
    state.type = props.name
    init()
}

const handleChange = () => {
    init()
}

</script>

<style lang="scss" scoped>
.people-counting {
    .select-platform {
        width: 150px;
        left: 40px;
        top: 80px;
    }
}
</style>
