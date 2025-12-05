<template>
    <!-- 主播号 -->
    <div class="container promotion-account-setting">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item :label="$t('会员ID:')">
                <el-input @input="(val) => state.formData.userId = val.replace(/\D/g,'')" v-model="state.formData.userId" :placeholder="$t('请输入会员ID')" />
            </el-form-item>
            <el-form-item :label="$t('会员账号:')">
                <el-input v-model="state.formData.username" :placeholder="$t('请输入会员账号')" />
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <!-- <el-form-item v-permiss="'merchant.user-simple-ctrl.teamAdd'">
                <el-button v-throttle type="primary" @click="handleConfig({})">{{$t('新 增')}}</el-button>
            </el-form-item> -->
            <el-form-item v-permiss="'merchant.user-simple-ctrl.teamAdd'">
                <el-button v-throttle type="primary" @click="state.showBatchDialog = true">{{$t('批量注册')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('export')">{{$t('导出会员')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column :label="$t('会员ID')" min-width="120" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.id)">{{row.id || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('会员账号')" min-width="140" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.id)">{{row.username || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="cashLimit_" :label="$t('禁止提现')" min-width="100" align="center" />
            <!-- <el-table-column prop="playLimit_" :label="$t('游戏限制')" min-width="100" align="center" /> -->
            <el-table-column prop="status_" :label="$t('账号状态')" min-width="120" align="center" />
            <el-table-column prop="updateTime" :label="$t('操作时间')" min-width="160" align="center" />
            <el-table-column fixed="right" align="center" :label="$t('操作')" width="120">
                <template #default="{ row }">
                    <el-button v-throttle type="primary" v-permiss="'merchant.user-simple-ctrl.teamAdd'" text @click="handleConfig(row)">{{$t('修改')}}</el-button>
                    <!-- <el-button v-throttle type="primary" v-permiss="'merchant.user-simple-ctrl.teamAdd'" text
                        @click="handleMove(row.id)">{{$t('移除')}}</el-button> -->
                </template>
            </el-table-column>
        </el-table>

        <Pagination v-show="state.total > 0" :total="state.total" v-model:page="state.listQuery._page" v-model:limit="state.listQuery._size"
            @pagination="fetchData">
        </Pagination>

        <DeployDialog v-if="state.showDeployDialog" :itemData="state.itemData" @close="state.showDeployDialog = false" @fetchData="fetchData">
        </DeployDialog>
        <BatchDialog v-if="state.showBatchDialog" @close="state.showBatchDialog = false" @fetchData="fetchData">
        </BatchDialog>
    </div>
</template>

<script setup name='promotionAccountSetting'>
import { reactive, onMounted, defineAsyncComponent } from 'vue'
import userStore from '@/store/user'
import { ElMessageBox } from "element-plus";
import { getPromotionAccountList, deletePromotionAccountData } from '@/api/member'
import { dateFormat } from '@/common/util'
const DeployDialog = defineAsyncComponent(() => import('./components/DeployDialog.vue'))
const BatchDialog = defineAsyncComponent(() => import('./components/BatchDialog.vue'))

const state = reactive({
    formData: {},
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    itemData: {},
    showDeployDialog: false,
    showBatchDialog: false,
})
const userData = userStore()

onMounted(() => {
    fetchData()
})

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val && val !== 'export') {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {}
        }
    }
    let params = { ...state.formData, ...state.listQuery }
    if (val === 'export') params.isExport = true
    globalVBus.$emit('globalLoading', true)
    getPromotionAccountList(params).then((res) => {
        if (!params.isExport) {
            let { data } = res
            if (data && data.list) {
                state.tableData = data.list.map(item => {
                    item.updateTime && (item.updateTime = dateFormat(item.updateTime))
                    return item
                })
                state.total = data.total || 0
            }
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        if (!params.isExport) state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

// 查看会员详情
const showMemberDetail = (id) => {
    globalVBus.$emit('memberDetailDialog', id)
}

// 新增/修改
const handleConfig = (val) => {
    state.itemData = { ...val }
    state.showDeployDialog = true
}

// 移除
const handleMove = (userIds) => {
    ElMessageBox.confirm($t('确定将此账号移出推广账号吗？'), $t('提示'), {
        type: 'warning'
    }).then(() => {
        globalVBus.$emit('globalLoading', true)
        deletePromotionAccountData({ userIds }).then(res => {
            fetchData()
        }).catch(err => {
            globalVBus.$emit('globalLoading', false)
        })
    }).catch(err => { })
}
</script>

<style lang="scss">
.promotion-account-setting {
}
</style>
