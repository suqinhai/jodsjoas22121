<template>
    <!-- 游戏调控 -->
    <div class="container game-adjust-control">
        <el-form class="filter-form" :model="state.searchFrom" inline>
            <el-form-item :label="$t('游戏ID:')">
                <el-input v-model="state.searchFrom.gameId" :placeholder="$t('请输入游戏ID')" />
            </el-form-item>
            <el-form-item :label="$t('游戏名称:')">
                <el-input v-model="state.searchFrom.gameName" :placeholder="$t('请输入游戏名称')" />
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table class="table-box" border :data="state.tableData">
            <el-table-column prop="gameId" :label="$t('游戏ID')" align="center" min-width="100px" />
            <el-table-column prop="gameName" :label="$t('游戏名称')" align="center" min-width="200px" />
            <el-table-column :label="$t('开关')" align="center" min-width="100px">
                <template #default="{ row }">
                    <el-switch v-model="row.ctrl" :active-value="true" :inactive-value="false" @change="switchChange(row)">
                    </el-switch>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:page="state.pageConfig._page" v-model:limit="state.pageConfig._size"
            @pagination="fetchData">
        </Pagination>
    </div>
</template>

<script setup name="gameAdjustControl">
import { reactive, onMounted } from "vue"
import { userControlStatToggleApi, userControlStatGameStatApi } from "@/api/risk_control"

const state = reactive({
    pageConfig: {
        _page: 1,
        _size: 10,
    },
    total: 0,
    searchFrom: {},
    tableData: [],
})

onMounted(() => {
    fetchData()
})

const fetchData = (type) => {
    if (type) {
        state.pageConfig._page = 1
        if (type === 'reset') {
            state.searchFrom = {}
        }
    }
    let params = { ...state.searchFrom, ...state.pageConfig }
    globalVBus.$emit('globalLoading', true)
    userControlStatGameStatApi(params).then(({ code, data }) => {
        if (code == 0) {
            state.tableData = data.list || []
            state.total = data.total
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

const switchChange = (row) => {
    let { gameId, ctrl } = row
    let params = { gameId, ctrl }
    globalVBus.$emit('globalLoading', true)
    userControlStatToggleApi(params).then(() => {
        fetchData()
    }).catch(() => {
        row.ctrl = !row.ctrl
        globalVBus.$emit('globalLoading', false)
    })
};
</script>

<style lang="scss" scoped>
</style>
