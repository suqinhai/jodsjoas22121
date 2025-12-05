<template>
    <!-- 会员vip等级调整 -->
    <div class="container memberChangeVip">
        <el-form class="filter-form" :model="state.searchData" inline>
            <el-form-item :label="$t('会员ID:')">
                <el-input v-model="state.searchData.userId" :placeholder="$t('请输入会员ID')" />
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="state.showAddChangeVipDialog = true" v-permiss="'merchant.user-level.edit'">{{$t('新 增')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table class="table-box" :data="state.tableList" border>
            <el-table-column prop="user.id" :label="$t('会员ID')" align="center" min-width="120">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.user.id)">
                        {{ row.user.id }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="user.name" :label="$t('会员账号')" align="center" min-width="140">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.user.id)">
                        {{ row.user.name }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="oldLevel" :label="$t('原vip等级')" align="center" min-width="120" />
            <el-table-column prop="newLevel" :label="$t('vip修改值')" align="center" min-width="120" />
            <el-table-column prop="emp.name" :label="$t('操作人')" align="center" min-width="120" />
            <el-table-column :label="$t('操作时间')" min-width="160" align="center">
                <template #default="{ row }">
                    {{ dateFormat(row.addTime) }}
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:page="pageConfig._page" v-model:limit="pageConfig._size"
            @pagination="fetchData">
        </Pagination>

        <AddChangeVipDialog v-if="state.showAddChangeVipDialog" @close="state.showAddChangeVipDialog = false" @refresh="fetchData('reset')">
        </AddChangeVipDialog>
    </div>
</template>

<script setup name="memberChangeVip">
import { reactive, onMounted, defineAsyncComponent } from "vue";
import { getLevelList } from "@/api/member.js";
import { dateFormat } from '@/common/util'


const AddChangeVipDialog = defineAsyncComponent(() => import('./components/AddChangeVipDialog.vue'))



const pageConfig = reactive({
    _page: 1,
    _size: 10,
})
const state = reactive({
    searchData: {
        userId: ''
    },
    tableList: [],
    total: 0,
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
            userId: ''
        }
    }
    let params = {
        ...state.searchData,
        ...pageConfig,
    }
    globalVBus.$emit('globalLoading', true)
    getLevelList(params).then(res => {
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
</script>

<style lang="scss">
.memberChangeVip {
    .el-table .total-row > .el-table__cell {
        background-color: #f1ca8c;
    }
}
</style>
