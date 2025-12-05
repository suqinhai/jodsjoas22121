<template>
    <!-- 大R提醒设置 -->
    <div class="container bigr-remind-setting">
        <el-table :data="state.tableData" border style="width: 600px">
            <el-table-column prop="level_" :label="$t('类型')" min-width="120" align="center" />
            <el-table-column prop="amount" :label="$t('累计充值')" min-width="120" align="center" />
            <el-table-column :label="$t('开关')" min-width="120" align="center">
                <template #default="{ row }">
                    <el-switch disabled v-model="row.popup" />
                </template>
            </el-table-column>
            <el-table-column :label="$t('操作')" min-width="100" align="center">
                <template #default="{ row, $index }">
                    <el-button v-throttle type="primary" text @click="handleConfig($index)">{{$t('修改')}}</el-button>
                </template>
            </el-table-column>
        </el-table>

        <EditDialog v-if="state.showEditDialog" :deployData="state.deployData" :currentIndex="state.currentIndex"
            @close="state.showEditDialog = false" @fetchData="fetchData">
        </EditDialog>
    </div>
</template>

<script setup name="bigRRemindSetting">
import { defineAsyncComponent, reactive, onMounted } from "vue"
import { getMetaData } from "@/api/common.js"
const EditDialog = defineAsyncComponent(() => import("./components/EditDialog.vue"))

const state = reactive({
    deployData: {},
    tableData: [],
    currentIndex: '',
    showEditDialog: false,
})

onMounted(() => {
    fetchData()
})

// 表格过滤数据处理
const fetchData = () => {
    globalVBus.$emit('globalLoading', true)
    getMetaData({ type: 10 }).then(res => {
        if (res.data) {
            let arr = Object.values(res.data)
            if (arr[0] && arr[0].id) {
                state.deployData = arr[0]
                state.tableData = state.deployData.config
            }
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        globalVBus.$emit('globalLoading', false)
    })
}

// 编辑
const handleConfig = (level) => {
    state.currentIndex = level
    state.showEditDialog = true
}
</script>

<style lang="scss" scoped>
.bigr-remind-setting {
}
</style>
