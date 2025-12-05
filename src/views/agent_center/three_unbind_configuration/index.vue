<template>
    <!-- 代理中心-三级掉绑配置 -->
    <div class="container memberChangeVip">
        <el-form class="filter-form" :model="state.searchData" inline>
            <el-form-item :label="$t('代理ID:')">
                <el-input v-model="state.searchData.agentUserId" :placeholder="$t('请输入代理ID')" />
            </el-form-item>
            <el-form-item :label="$t('代理账号:')">
                <el-input v-model="state.searchData.agentUsername" :placeholder="$t('请输入代理账号')" />
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{ $t('搜 索') }}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{ $t('重 置') }}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="state.itemData = {}; state.showAddChangeVipDialog = true"
                    v-permiss="'merchant.third-level-agent.editAgentConfig-1'">{{ $t('新 增') }}
                </el-button>
            </el-form-item>
            <el-form-item>
                <el-icon class="pointer" :size="24" @click="state.showExplain = true">
                    <QuestionFilled />
                </el-icon>
            </el-form-item>
        </el-form>
        <el-table class="table-box" :data="state.tableList" border>
            <el-table-column prop="user.id" :label="$t('代理ID')" align="center" min-width="120">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.user.id)">
                        {{ row.user.id }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="user.name" :label="$t('代理账号')" align="center" min-width="140">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.user.id)">
                        {{ row.user.name }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="beginNum" :label="$t('邀请几人后开始掉绑')" align="center" min-width="120" />
            <el-table-column prop="mbMode_" :label="$t('掉绑类型')" align="center" min-width="120" />
            <el-table-column prop="mbValue" :label="$t('掉绑参数')" align="center" min-width="120" />
            <el-table-column prop="cond" :label="$t('触发条件')" align="center" min-width="120" />
            <el-table-column :label="$t('操作')" min-width="100" align="center">
                <template #default="{ row }">
                    <el-button v-permiss="'merchant.third-level-agent.editAgentConfig-1'" v-throttle type="primary" v-if="row.level !== 1" text
                        @click="handleEdit(row)">{{ $t('修改') }}</el-button>
                    <el-button v-permiss="'merchant.third-level-agent.deleteMissBindConfig'" v-throttle type="primary" v-if="row.level !== 1" text
                        @click="handleDelete(row.agentUserId)">{{ $t('删除') }}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:page="pageConfig._page"
            v-model:limit="pageConfig._size" @pagination="fetchData">
        </Pagination>

        <AddChangeConfigDialog :itemData="state.itemData" v-if="state.showAddChangeVipDialog"
            @close="state.showAddChangeVipDialog = false" @refresh="fetchData('reset')">
        </AddChangeConfigDialog>
        <ExplainDialog v-if="state.showExplain" @close="state.showExplain = false">
        </ExplainDialog>
    </div>
</template>

<script setup name="memberChangeVip">
import { reactive, onMounted, defineAsyncComponent } from "vue";
import { getMissBindConfigList, postDeleteMissBindConfig } from "@/api/agent.js";
import { dateFormat } from '@/common/util'
const ExplainDialog = defineAsyncComponent(() => import("./components/ExplainDialog.vue"))
const AddChangeConfigDialog = defineAsyncComponent(() => import('./components/AddChangeConfigDialog.vue'))

const pageConfig = reactive({
    _page: 1,
    _size: 10,
})
const state = reactive({
    searchData: {
        agentUserId: ''
    },
    tableList: [],
    total: 0,
    itemData: {},
    showAddChangeVipDialog: false,
})

onMounted(() => {
    fetchData()
})

// 查看会员详情
const showMemberDetail = (id) => {
    globalVBus.$emit('memberDetailDialog', id)
}

const fetchData = (val = '') => {
    if (val === 'reset') {
        pageConfig._page = 1
        state.searchData = {
            agentUserId: ''
        }
    }
    let params = {
        ...state.searchData,
        ...pageConfig,
    }
    globalVBus.$emit('globalLoading', true)
    getMissBindConfigList(params).then(res => {
        state.tableList = []
        let { total, list } = res.data
        state.tableList = list || []
        state.total = total
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableList = []
        globalVBus.$emit('globalLoading', false)
    })
}

const handleEdit = (row) => {
    state.itemData = row
    state.showAddChangeVipDialog = true
}

const handleDelete = (agentUserId) => {
    ElMessageBox.confirm($t('确认要删除吗？'), $t('删除'), {
        confirmButtonText: $t('确认'),
        cancelButtonText: $t('取消'),
        type: "warning",
    }).then(() => {
        globalVBus.$emit('globalLoading', true)
        postDeleteMissBindConfig({ agentUserId }).then(() => {
            fetchData();
        }).catch(() => {
            globalVBus.$emit('globalLoading', false)
        })
    }).catch(() => { })
}
</script>

<style lang="scss">
.memberChangeVip {
    .el-table .total-row>.el-table__cell {
        background-color: #f1ca8c;
    }
}
</style>
