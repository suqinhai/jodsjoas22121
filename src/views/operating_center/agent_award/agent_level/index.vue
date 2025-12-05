<template>
    <!-- 代理奖励-代理等级 -->
    <div class="tabs-main">
        <el-table :data="state.tableData" border style="width: 900px">
            <el-table-column prop="id" :label="$t('序号')" min-width="80" align="center" />
            <el-table-column prop="name" :label="$t('等级代理名称')" min-width="120" align="center" />
            <el-table-column prop="" min-width="120" align="center">
                <template #header>
                    <div>{{$t('晋级条件')}}</div>
                    <div>{{$t('(累计业绩)')}}</div>
                </template>
                <template #default="{ row }">
                    {{row.amount}}
                </template>
            </el-table-column>
            <el-table-column prop="info" :label="$t('描述')" min-width="300" align="center" />
            <el-table-column :label="$t('操作')" min-width="100" align="center" v-if="userData.isHasPermiss('merchant.agent.levelEdit')">
                <template #default="{ row }">
                    <el-button v-throttle type="primary" v-if="row.level !== 1" text @click="handleEdit(row)">{{$t('修改')}}</el-button>
                </template>
            </el-table-column>
        </el-table>

        <EditAgentLevel v-if="state.showEditDialog" :itemData="state.itemData" @close="state.showEditDialog = false" @fetchData="fetchData">
        </EditAgentLevel>
    </div>
</template>

<script setup>
import { defineAsyncComponent, reactive, onMounted } from "vue"
import userStore from '@/store/user'
import { getAagentLevelList } from "@/api/agent.js"
const EditAgentLevel = defineAsyncComponent(() => import("./components/EditAgentLevel.vue"))

const state = reactive({
    tableData: [],
    itemData: {},
    showEditDialog: false,
})
const userData = userStore()

onMounted(() => {
    fetchData()
})

// 表格过滤数据处理
const fetchData = () => {
    globalVBus.$emit('globalLoading', true)
    getAagentLevelList({ _size: 999 }).then(res => {
        state.tableData = res.data.list
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

// 编辑
const handleEdit = (row) => {
    state.itemData = { ...row }
    state.showEditDialog = true
}
</script>

<style lang="scss" scoped>
</style>
