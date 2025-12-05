<template>
    <!-- 代理中心-三级掉绑查询 -->
    <div class="container threeLevelQuery">
        <el-descriptions :title="$t('三级代理总计')" :column="2" border style="width: 800px;">
            <template #title>
                <div class="title">{{ $t('三级代理总计') }}</div>
                <div class="des">{{ $t('注：统计为站点三级代理数据') }}</div>
            </template>
            <el-descriptions-item :label="$t('注册人数（不含掉绑）')" width="300">{{state.ext.bindNum}}</el-descriptions-item>
            <el-descriptions-item :label="$t('掉绑')" label-width="100" width="300">{{state.ext.unBindNum}}</el-descriptions-item>
            <el-descriptions-item :label="$t('充值人数（不含掉绑）')" width="300">{{state.ext.bindRechargeNum}}</el-descriptions-item>
            <el-descriptions-item :label="$t('掉绑')" label-width="100" width="300">{{state.ext.unBindRechargeNum}}</el-descriptions-item>
            <el-descriptions-item :label="$t('充值金额（不含掉绑）')" width="300">{{state.ext.bindRechargeAmount}}</el-descriptions-item>
            <el-descriptions-item :label="$t('掉绑')" label-width="100" width="300">{{state.ext.unBindRechargeAmount}}</el-descriptions-item>
        </el-descriptions>
        <el-form class="filter-form" :model="state.searchData" inline>
            <el-form-item :label="$t('代理ID:')">
                <el-input v-model="state.searchData.agentUserId" :placeholder="$t('请输入会员ID')" />
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
        </el-form>
        <el-table class="table-box" :data="state.tableList" border>
            <el-table-column :label="$t('代理ID')" align="center" min-width="120">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.agentUser.id)">
                        {{ row.agentUser.id }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('代理账号')" align="center" min-width="140">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.agentUser.id)">
                        {{ row.agentUser.name }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('上级代理ID')" align="center" min-width="120">
                <template #default="{ row }">
                    <span v-if="row.inviteAgentUser" class="special pointer" @click="showMemberDetail(row.inviteAgentUser.id)">
                        {{ row.inviteAgentUser.id }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('上级代理账号')" align="center" min-width="120">
                <template #default="{ row }">
                    <span v-if="row.inviteAgentUser" class="special pointer" @click="showMemberDetail(row.inviteAgentUser.id)">
                        {{ row.inviteAgentUser.name }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('注册人数（不含掉绑）/掉绑')" align="center" min-width="120">
                <template #default="{ row }">
                    {{  row.bindNum + '/' + row.unBindNum}}
                </template>
            </el-table-column>
            <el-table-column :label="$t('充值人数（不含掉绑）/掉绑')" align="center" min-width="120">
                <template #default="{ row }">
                    {{  row.bindRechargeNum + '/' + row.unBindRechargeNum}}
                </template>
            </el-table-column>
            <el-table-column :label="$t('充值金额（不含掉绑）/掉绑')" align="center" min-width="120">
                <template #default="{ row }">
                    {{  row.bindRechargeAmount + '/' + row.unBindRechargeAmount}}
                </template>
            </el-table-column>
            <el-table-column :label="$t('操作')" min-width="100" align="center">
                <template #default="{ row }">
                    <el-button v-throttle type="primary" text
                        @click="handleEdit(row)">{{ $t('掉绑明细') }}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:page="pageConfig._page"
            v-model:limit="pageConfig._size" @pagination="fetchData">
        </Pagination>
        <UnbindDetailDialog v-if="state.showUnbindDetailDialog" @close="state.showUnbindDetailDialog = false" :itemData="state.itemData" />
    </div>
</template>
<script setup name="threeLevelQuery">
import { reactive, onMounted, defineAsyncComponent } from "vue";
import { getMissBindList, postDeleteMissBindConfig } from "@/api/agent.js";
import { dateFormat } from '@/common/util'

const UnbindDetailDialog = defineAsyncComponent(() => import('./components/UnbindDetailDialog.vue'))

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
    ext: {},
    showUnbindDetailDialog: false,
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
    getMissBindList(params).then(({data, ext}) => {
        let { total, list } = data
        state.tableList = list || []
        state.total = total
        state.ext = ext
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        globalVBus.$emit('globalLoading', false)
    })
}

const handleEdit = (row) => {
    state.itemData = row
    state.showUnbindDetailDialog = true
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
.threeLevelQuery {
    .el-descriptions__cell{
        width: 100px;
    }
    .des{
        font-size: 12px;
        color: #999;
        margin-top: 5px;
    }
    .filter-form{
        margin-top: 30px;
    }
}
</style>
