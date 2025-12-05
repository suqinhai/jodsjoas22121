<template>
    <!-- 会员调控-控制历史（专业模式） -->
    <div class="container-main">
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column prop="addTime" :label="$t('创建时间')" min-width="160" align="center" />
            <el-table-column :label="$t('会员ID')" min-width="120" align="center">
                <template #default="{ row }">
                    <div v-for="(item,index) in row.userIds" :key="index" class="special pointer" @click="emits('showMemberDetail',item)">
                        {{item || ''}}</div>
                </template>
            </el-table-column>
            <el-table-column prop="layerName" :label="$t('会员层级')" min-width="100" align="center" />
            <!-- <el-table-column prop="fixTag_" :label="$t('固定层级')" min-width="120" align="center" /> -->
            <el-table-column prop="type_" :label="$t('控制类型')" min-width="140" align="center" />
            <el-table-column prop="status_" :label="$t('控制状态')" min-width="120" align="center" />
            <el-table-column prop="total" :label="$t('控制人数')" min-width="120" align="center" />
            <el-table-column prop="count" :label="$t('控制次数')" min-width="120" align="center" />
            <el-table-column prop="amount" :label="$t('控制额度')" min-width="120" align="center" />
            <el-table-column prop="controlType_" :label="$t('分配池子')" min-width="120" align="center" />
            <!-- <el-table-column fixed="right" align="center" :label="$t('操作')" width="100">
                <template #default="{ row }">
                    <el-button v-permiss="'admin.user-game-control.addOrEdit'" v-if="row.status === 0 && row.taskId > 0"
                        v-throttle type="primary" text @click="handleCancelControl(row.id)">{{$t('结束控制')}}</el-button>
                </template>
            </el-table-column> -->
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>
    </div>
</template>

<script setup >
import { reactive, onMounted, defineEmits } from 'vue'
import { dateFormat } from '@/common/util'
import { getLevelControlHistory } from '@/api/risk_control'

const emits = defineEmits(['showMemberDetail'])
const state = reactive({
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
})

onMounted(() => {
    fetchData()
})

// 表格数据
const fetchData = () => {
    globalVBus.$emit('globalLoading', true)
    getLevelControlHistory({ ...state.listQuery }).then(res => {
        let { total, list } = res.data
        state.tableData = list.map(item => {
            item.addTime && (item.addTime = dateFormat(item.addTime))
            return item
        })
        state.total = total
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss">
</style>
