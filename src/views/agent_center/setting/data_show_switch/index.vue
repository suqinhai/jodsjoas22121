<template>
    <!-- 代理设置-敏感数据展示开关 -->
    <el-table :data="state.tableData" border style="width: 300px">
        <el-table-column prop="title" :label="$t('模块名称')" min-width="120" align="center" />
        <el-table-column :label="$t('开关')" min-width="100" align="center">
            <template #default="{ row,$index }">
                <el-switch v-model="row.status" @change="switchChange($index)" />
            </template>
        </el-table-column>
    </el-table>
</template>

<script setup>
import { reactive, watch, nextTick, defineExpose } from 'vue'

const keyData = {
    adTip: $t('月入百万广告'),
    login: $t('直属数据'),
    recharge: $t('直属财务'),
    award: $t('直属领取'),
    bet: $t('直属投注'),
}
const emits = defineEmits(['submit'])
const props = defineProps({
    deployData: {
        type: Object,
        default: () => {
            return {}
        }
    }
})
const state = reactive({
    tableData: [],
    isPending: false,
    currentIndex: 0
})
watch(
    () => props.deployData,
    (val) => {
        state.isPending = true
        let obj = {}
        if (Object.keys(val).length) {
            obj = JSON.parse(val.value).switches || {}
        }
        state.tableData = []
        for (let key in keyData) {
            state.tableData.push({
                title: keyData[key],
                status: !!obj[key],
            })
        }
        nextTick(() => {
            state.isPending = false
        })
    },
    { immediate: true }
)

const switchChange = (index) => {
    state.currentIndex = index
    if (state.isPending) return
    let params = props.deployData.value ? JSON.parse(props.deployData.value) : {}
    let obj = {}
    Object.keys(keyData).forEach((item, index) => {
        obj[item] = state.tableData[index].status
    })
    params.switches = obj
    params.operateType = 2
    emits('submit', params)
}

defineExpose({
    'fail': () => { state.tableData[state.currentIndex].status = !state.tableData[state.currentIndex].status }
})
</script>

<style lang="scss" scoped>
</style>
