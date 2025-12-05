<template>
    <!-- 站点域名-流量统计-详情 -->
    <Dialog ref="dialog" width="1000" :title="$t('详情')" top="5vh" :isShowSubmit="false" @cancel="cancel">
        <div class="traffic-statistics-info">
            <el-form class="filter-form" inline :model="state.formData">
                <el-form-item>
                    <el-date-picker v-model="state.formData.receiveTime" type="daterange" :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter"
                        :shortcuts="shortcuts" :clearable="false" value-format="YYYY-MM-DD">
                    </el-date-picker>
                </el-form-item>
                <el-form-item :label="$t('节点类型:')">
                    <el-select class="select-box" v-model="state.formData.type" clearable :placeholder="$t('请选择节点类型')">
                        <el-option v-for="item in metaData.dnsProvider" :key="item.value" :value="item.value" :label="item.label" />
                    </el-select>
                </el-form-item>
                <el-form-item :label="$t('主域名:')">
                    <el-input v-model="state.formData.domain" :placeholder="$t('请输入主域名')" />
                </el-form-item>
                <el-form-item :label="$t('流量去向:')">
                    <el-select class="select-box" v-model="state.formData.position" clearable :placeholder="$t('请选择流量去向')">
                        <el-option v-for="item in metaData.dnsPosition" :key="item.value" :value="item.value" :label="item.label" />
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button v-throttle type="primary" @click="fetchData('')">{{$t('搜 索')}}</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
                </el-form-item>
            </el-form>
            <div ref="echartsBox" style="width:100%;height:300px;margin-bottom: 20px"></div>
            <el-table class="table-box" :data="state.tableData" border>
                <el-table-column prop="type_" :label="$t('CDN节点名称')" min-width="100" align="center" />
                <el-table-column prop="usedGb_" :label="$t('流量(GB)')" min-width="120" align="center" />
                <el-table-column prop="domain" :label="$t('主域名')" min-width="140" align="center" />
                <el-table-column prop="domainNum" :label="$t('子域名数')" min-width="100" align="center" />
                <el-table-column prop="position_" :label="$t('流量去向')" min-width="120" align="center" />
            </el-table>
        </div>
    </Dialog>
</template>

<script setup>
import { ref, shallowRef, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus';
import { getTrafficStatisticsInfo } from '@/api/app_and_domain_manage'
import { getShortcuts, disabledCurrentDateAfter, deepClone } from '@/common/util'

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
const emits = defineEmits(['close'])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        }
    },
    metaData: {
        type: Object,
        default: () => {
            return {}
        }
    },
})
let shortcuts = getShortcuts()
const state = reactive({
    isShow: false,
    formData: {},
    tableData: [],
    initTime: [],
    options: {
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: []
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
        series: []
    }
})
const dialog = ref(null)
const echartsBox = shallowRef(null)
const myChart = shallowRef(null)

onMounted(() => {
    nextTick(() => {
        let { month } = props.itemData
        let year = month.substr(0, 4) * 1
        let mon = month.substr(5) * 1
        const lastDay = new Date(year, mon, 0).getDate()
        for (let index = 1; index <= lastDay; index++) {
            state.options.xAxis.data.push(year + '-' + (mon > 9 ? mon : '0' + mon) + '-' + (index > 9 ? index : '0' + index))
        }
        myChart.value = echarts.init(echartsBox.value)
        state.initTime = [month + '-01', month + '-' + lastDay]
        state.formData.receiveTime = deepClone(state.initTime)
        fetchData()
    })
})

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val === 'reset') {
        state.formData = {
            receiveTime: deepClone(state.initTime)
        }
    }
    let params = { ...state.formData }
    let { receiveTime } = state.formData
    if (receiveTime && receiveTime.length &&
        (new Date(receiveTime[1] + ' 23:59:59').getTime() - new Date(receiveTime[0] + ' 00:00:00').getTime()) > 31 * 24 * 60 * 60 * 1000
    ) return ElMessage.warning($t('搜索范围不得超过31天！'))
    if (receiveTime && receiveTime.length) {
        params['interval.begin'] = receiveTime[0]
        params['interval.end'] = receiveTime[1]
    }
    delete params.receiveTime
    dialog.value.showLoading()
    getTrafficStatisticsInfo(params).then(({ data, ext }) => {
        if (data && Object.keys(data).length) {
            echartSet(data)
        } else {
            state.options.legend.data = []
            state.options.xAxis.data = []
            state.options.series = []
            myChart.value.setOption(state.options)
        }
        state.tableData = ext || []
        dialog.value.closeLoading()
    }).catch(err => {
        state.tableData = []
        dialog.value.closeLoading()
    })
}


const echartSet = (data) => {
    let dataList = Object.values(data)
    let keyList = Object.keys(data)
    let nameList = Object.keys(dataList[0])
    state.options.xAxis.data = keyList
    state.options.series = nameList.map(item => {
        return {
            name: item,
            type: 'line',
            data: []
        }
    })
    dataList.forEach(item => {
        state.options.series.forEach(its => {
            its.data.push(item[its.name].usedGb)
        })
    })
    state.options.legend.data = nameList
    state.options.tooltip.formatter = function (params) {
        var relVal = params[0].name
        for (var i = 0, l = params.length; i < l; i++) {
            //         relVal += '<br/>' + params[i].marker + params[i].seriesName + '：' + params[i].value + 'GB'
            relVal += `<div style="display: flex;justify-content: space-between;"><div>${params[i].marker + params[i].seriesName}</div><div style="margin-left: 20px;">${params[i].value + 'GB'}</div></div>`
        }
        return relVal
    }
    myChart.value.setOption(state.options)
}

const cancel = () => {
    emits('close')
}
</script>

<style lang="scss">
.domain-deploy {
    .title {
        color: #666;
    }
    .text {
        padding-left: 10px;
        color: #999;
    }
}
</style>
