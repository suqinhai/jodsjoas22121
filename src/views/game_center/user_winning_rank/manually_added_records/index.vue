<template>
    <!-- 游戏中心-中奖排行管理-手动添加记录 -->
    <div class="tabs-main">
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column prop="username" :label="$t('会员账号')" min-width="120" align="center" />
            <el-table-column prop="gameType_" :label="$t('游戏类型')" min-width="100" align="center" />
            <el-table-column prop="name" :label="$t('游戏名称')" min-width="120" align="center" />
            <el-table-column prop="winCoin" :label="$t('中奖金额')" min-width="100" align="center" />
            <el-table-column prop="siteStatus_" :label="$t('投注时间')" min-width="160" align="center">
                <template #default="{ row }">
                    {{row.beginTime && dateFormat(row.beginTime) || ''}}
                </template>
            </el-table-column>
            <el-table-column prop="siteStatus_" :label="$t('结算时间')" min-width="160" align="center">
                <template #default="{ row }">
                    {{row.endTime && dateFormat(row.endTime) || ''}}
                </template>
            </el-table-column>
            <el-table-column prop="source_" :label="$t('数据类型')" min-width="100" align="center" />
            <el-table-column fixed="right" :label="$t('操作')" width="90" align="center"
                v-if="userData.isHasPermiss('merchant.user-winning-rank.delete')">
                <template #default="{ row }">
                    <el-button v-throttle type="primary" text @click="handleDelete(row.id)">{{$t('删除')}}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>
    </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { ElMessageBox } from 'element-plus'
import userStore from '@/store/user'
import { getRankingManualList, deleteWinningRankingData } from "@/api/merchant_center"
import { dateFormat } from '@/common/util'

const state = reactive({
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
})
const userData = userStore()

onMounted(() => {
    fetchData()
})

// 表格过滤数据处理
const fetchData = () => {
    globalVBus.$emit('globalLoading', true)
    getRankingManualList({ ...state.listQuery }).then(res => {
        let { total, list } = res.data
        state.tableData = list || []
        state.total = total
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

// 删除
const handleDelete = (id) => {
    ElMessageBox.confirm($t('确定要删除此手工添加的排行榜数据吗？'), $t('提示'), {
        confirmButtonText: $t('确 定'),
        cancelButtonText: $t('取消'),
        type: 'warning',
    }).then(() => {
        globalVBus.$emit('globalLoading', true)
        deleteWinningRankingData({ id }).then(res => {
            fetchData()
        }).catch(err => {
            globalVBus.$emit('globalLoading', false)
        })
    }).catch(() => { })
}
</script>

<style lang="scss">
</style>
