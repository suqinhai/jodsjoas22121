<template>
    <!-- 代理中心-三级代理奖励 -->
    <div class="container threeAgentAward">
        <el-form class="filter-form" :model="state.searchData" inline>
            <el-form-item :label="$t('代理ID:')">
                <el-input v-model="state.searchData.userId" :placeholder="$t('请输入代理ID')" />
            </el-form-item>
            <el-form-item :label="$t('代理账号:')">
                <el-input v-model="state.searchData.username" :placeholder="$t('请输入代理账号')" />
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{ $t('搜 索') }}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{ $t('重 置') }}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('export')">{{$t('导出报表')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table class="table-box" :data="state.tableList" border @sort-change="sortChange">
            <el-table-column :label="$t('代理ID')" align="center" min-width="120">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.userId)">
                        {{ row.userId }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('代理账号')" align="center" min-width="140">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.userId)">
                        {{ row.username }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column sortable="custom" type="1" prop="totalCommission" :label="$t('邀请总奖励')" align="center" min-width="120"/>
            <el-table-column sortable="custom" type="2" prop="receiveCommission" :label="$t('已领取邀请奖励')" align="center" min-width="120"/>
            <el-table-column sortable="custom" type="3" prop="todayCommission" :label="$t('今日邀请奖励')" align="center" min-width="120" />
            <el-table-column :label="$t('操作')" min-width="100" align="center">
                <template #default="{ row }">
                    <el-button v-throttle type="primary" v-if="row.level !== 1" text
                        @click="handleEdit(row)">{{ $t('明细') }}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:page="pageConfig._page"
            v-model:limit="pageConfig._size" @pagination="fetchData">
        </Pagination>
        <AgentAwardDetailDialog v-if="state.showAgentAwardDetailDialog" @close="state.showAgentAwardDetailDialog = false" :itemData="state.itemData" />
    </div>
</template>
<script setup name="threeAgentAward">
import { reactive, onMounted, defineAsyncComponent } from "vue";
import { getThirdReward } from "@/api/agent.js";
import { deepClone } from '@/common/util'

const AgentAwardDetailDialog = defineAsyncComponent(() => import('./components/AgentAwardDetailDialog.vue'))

const pageConfig = reactive({
    _page: 1,
    _size: 10,
})
const state = reactive({
    searchData: {},
    tableList: [],
    total: 0,
    itemData: {},
    showAgentAwardDetailDialog: false,
})

onMounted(() => {
    fetchData()
})

// 查看会员详情
const showMemberDetail = (id) => {
    globalVBus.$emit('memberDetailDialog', id)
}

const fetchData = (val = '') => {
    if (val && val !== 'export') {
        pageConfig._page = 1
        if (val === 'reset') {
            state.searchData = {}
        }
    }
    let params = {
        ...state.searchData,
        ...pageConfig,
    }
    globalVBus.$emit('globalLoading', true)
    if (val === 'export') params.isExport = true
    getThirdReward(params).then(({data}) => {
        if (!params.export) {
            let { total, list } = data
            state.tableList = list || []
            state.total = total
            globalVBus.$emit('globalLoading', false)
        }
    }).catch(err => {
        if (!params.export) state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

const handleEdit = (row) => {
    state.itemData = row
    state.showAgentAwardDetailDialog = true
}

const sortChange = ({ column, order }) => {
    const columnData = deepClone(column) || {}
    switch (columnData.type) {
        case '1':
            if(order === 'ascending') state.searchData.sort = 1
            if(order === 'descending') state.searchData.sort = 2
            if(!order) state.searchData.sort = ''
            break;
        case '2':
            if(order === 'ascending') state.searchData.sort = 3
            if(order === 'descending') state.searchData.sort = 4
            if(!order) state.searchData.sort = ''
            break;
        case '3':
            if(order === 'ascending') state.searchData.sort = 5
            if(order === 'descending') state.searchData.sort = 6
            if(!order) state.searchData.sort = ''
            break;
        default:
            state.searchData.sort = ''
            break;
    }
    fetchData()
}
</script>

<style lang="scss">
.threeAgentAward {
    .des{
        font-size: 12px;
        color: #999;
        margin-top: 5px;
    }
    .filter-form{
        // margin-top: 30px;
    }
}
</style>
