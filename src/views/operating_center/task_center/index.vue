<template>
    <!-- 任务中心 -->
    <div class="container task-center pr">
        <el-tabs v-model="state.tabItem" v-if="metaData.taskType.length" @tab-change="getData(2)">
            <el-tab-pane v-for="item in metaData.taskType" :key="item.value" :label="item.label" :name="item.value*1">
            </el-tab-pane>
        </el-tabs>
        <div class="pa explain-box" v-if="state.tabItem === 0 && metaData.taskType.length">
            <el-icon class="pointer" color="#666" :size="28" @click="state.showExplain = true">
                <QuestionFilled />
            </el-icon>
        </div>
        <NewBoyWelfare ref="taskDeployRef" v-if="state.tabItem === 0  && metaData.taskType.length" @showRuleDialog="showRuleDialog" @getData="getData"
            :metaData="metaData"></NewBoyWelfare>
        <EverydayWeeklyTask ref="taskDeployRef" v-if="(state.tabItem === 1 || state.tabItem === 2)" :taskType="state.tabItem"
            @showRuleDialog="showRuleDialog" @handleSubmit="handleSubmit" :metaData="metaData">
        </EverydayWeeklyTask>
        <!-- <MysteriousTask v-if="item.value * 1 === 1" :metaData="metaData"></MysteriousTask> -->
        <LivenessSetting ref="taskDeployRef" v-if="state.tabItem === 3" :metaData="metaData" @getData="getData" @showRuleDialog="showRuleDialog">
        </LivenessSetting>

        <TaskRuleDialog v-if="state.showTaskRule" :type="state.tabItem" :dialogTitle="dialogTitle" :metaData="metaData" :basicsData="state.basicsData"
            @refreshData="getData(0)" @close="state.showTaskRule = false">
        </TaskRuleDialog>
        <ExplainDialog v-if="state.showExplain" @close="state.showExplain = false"></ExplainDialog>
    </div>
</template>

<script setup name='taskCenter'>
import { ref, reactive, defineAsyncComponent, onMounted, computed, provide, onActivated } from "vue"
import { useRoute } from 'vue-router'
import commonStore from '@/store/common'
import { QuestionFilled } from "@element-plus/icons-vue"
import { getTaskConfig, postTaskRuleConfig } from "@/api/discounts_center.js"
import { getCommonMeta, getLevelConfig, getTicketList } from '@/api/common'
// import NewBoyWelfare from './new_boy_welfare/index.vue'
// import EverydayWeeklyTask from './components/EverydayWeeklyTask.vue'
// // import MysteriousTask from './mysterious_task/index.vue'
// import LivenessSetting from './liveness_setting/index.vue'
const NewBoyWelfare = defineAsyncComponent(() => import('./new_boy_welfare/index.vue'))
const LivenessSetting = defineAsyncComponent(() => import('./liveness_setting/index.vue'))
const EverydayWeeklyTask = defineAsyncComponent(() => import('./components/EverydayWeeklyTask.vue'))
const TaskRuleDialog = defineAsyncComponent(() => import('./components/TaskRuleDialog.vue'))
const ExplainDialog = defineAsyncComponent(() => import('./components/ExplainDialog.vue'))

const taskDeployRef = ref(null)
const state = reactive({
    tabItem: 0,
    showTaskRule: false,
    showExplain: false,
    configData: {},
    basicsData: {},
    ticketList: []
})
let metaData = reactive({
    client: [],
    taskType: [],
    newcomerTaskType: [],
    dayTaskType: [],
    weekTaskType: [],
    taskRewardLimit: [],
    taskCycleMode: [],
    memberLevel: [],
    ticketType: [],
})
const route = useRoute()
const commonData = commonStore()

const dialogTitle = computed(() => {
    return (metaData.taskType.filter(item => +item.value === state.tabItem)[0]?.label || '') + $t('规则设置')
})

getLevelConfig().then(res => {
    metaData.memberLevel = res.data || []
})

onMounted(async () => {
    if (commonData.isManual) state.isInit = false
    if (route.query.merchantId && +route.query.merchantId !== commonData.currentMerchantSite.id && !commonData.isManual) {
        commonData.setCurrentMerchantSite(+route.query.merchantId)
        return
    }
    let res = await getCommonMeta({ types: 'taskType,client,newcomerTaskType,dayTaskType,weekTaskType,taskRewardLimit,taskCycleMode,ticketType' })
    metaData = Object.assign(metaData, res.data || {})
    getData()
    getTicketData()
})

onActivated(() => {
    if (state.isInit) return state.isInit = false
    if (route.query.merchantId && +route.query.merchantId !== commonData.currentMerchantSite.id && !commonData.isManual) {
        commonData.setCurrentMerchantSite(+route.query.merchantId)
    }
})

const getData = (value = 1) => {
    state.configData = {}
    globalVBus.$emit('globalLoading', true)
    getTaskConfig({ type: state.tabItem }).then(({ code, data = '' }) => {
        if (code === 0) {
            state.configData = data || {}
            let timer = setInterval(() => {
                if (taskDeployRef.value) {
                    taskDeployRef.value.setData(data, value)
                    globalVBus.$emit('globalLoading', false)
                    clearInterval(timer)
                }
            }, 100)
        } else {
            globalVBus.$emit('globalLoading', false)
        }
    }).catch(err => {
        globalVBus.$emit('globalLoading', false)
    })
}

const showRuleDialog = () => {
    let { id, status, base = {} } = state.configData
    state.basicsData = { ...base, id, status }
    state.showTaskRule = true
}

const handleSubmit = (params) => {
    globalVBus.$emit('globalLoading', true)
    postTaskRuleConfig({
        id: state.configData.id,
        rule: JSON.stringify(params)
    }).then(() => {
        getData()
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}

// 获取票券数据
const getTicketData = () => {
    getTicketList({
        status: 1,
        _size: 999,
        _page: 1,
    }).then(({ data }) => {
        state.ticketList = data?.list || []
    })
}

// 获取指定类型的票券数据
const getOptionData = ({ ticketType, ticketName, ticketId }) => {
    let arr = state.ticketList.filter(item => item.type == ticketType)
    if (ticketId && arr.every(item => item.id !== ticketId)) arr.unshift({
        id: ticketId,
        type: ticketType,
        name: ticketName + $t('（已停用）'),
        isDisabled: true
    })
    return arr
}

provide('provideData', {
    'getOptionData': (val) => getOptionData(val),
})
</script>

<style lang="scss">
.task-center {
    width: 100%;
    display: flex;
    .explain-box {
        top: 20px;
        right: 50px;
    }
    // min-width: 1300px;
}
</style>
