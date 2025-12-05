<template>
    <!-- 余额救援金白名单-会员白名单 -->
    <div class="container-main rescue-member-whitelist">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item :label="$t('会员ID:')">
                <el-input @input="(val) => state.formData.userId = val.replace(/\D/g,'')" v-model="state.formData.userId" :placeholder="$t('请输入会员ID')" />
            </el-form-item>
            <!-- <el-form-item :label="$t('会员账号:')">
                <el-input v-model="state.formData.username" :placeholder="$t('请输入会员账号')" />
            </el-form-item> -->
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item class="item-box" v-permiss="'merchant.promotion-whitelist.batchReliefBalance'">
                <el-button v-throttle type="primary" @click="handleConfig(0)">{{$t('导 入')}}</el-button>
            </el-form-item>
            <el-form-item class="item-box" v-permiss="'merchant.promotion-whitelist.addReliefBalance'">
                <el-button v-throttle type="primary" @click="handleConfig(1)">{{$t('添 加')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column :label="$t('会员ID')" min-width="120" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.userId)">{{row.userId || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('会员账号')" min-width="140" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.userId)">{{row.user?.name || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="addTime" :label="$t('添加时间')" min-width="160" align="center" />
            <el-table-column prop="emp.name" :label="$t('添加人')" min-width="140" align="center" />
            <el-table-column prop="remark" :label="$t('备注')" min-width="160" align="center" />
            <el-table-column fixed="right" align="center" :label="$t('操作')" width="120">
                <template #default="{ row }">
                    <el-button v-throttle type="primary" v-permiss="'merchant.promotion-whitelist.delReliefBalance'" text
                        @click="handleDelete(row.id)">{{$t('删除')}}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:page="state.listQuery._page" v-model:limit="state.listQuery._size"
            @pagination="fetchData">
        </Pagination>

        <DeployDialog v-if="state.showDeployDialog" :operateType="state.operateType" @close="state.showDeployDialog = false" @fetchData="fetchData">
        </DeployDialog>
    </div>
</template>

<script setup>
import { reactive, onMounted, defineAsyncComponent } from 'vue'
import { ElMessageBox } from "element-plus";
import { getBalanceRescueWhitelist, deleteMemberWhitelistData } from '@/api/member'
import { dateFormat } from '@/common/util'
const DeployDialog = defineAsyncComponent(() => import('./components/DeployDialog.vue'))

const state = reactive({
    formData: {},
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    operateType: '',
    showDeployDialog: false,
})

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
    getBalanceRescueWhitelist(params).then((res) => {
        if (!params.isExport) {
            let { data } = res
            if (data && data.list) {
                state.tableData = data.list.map(item => {
                    item.addTime && (item.addTime = dateFormat(item.addTime))
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

// 新增/导入
const handleConfig = (type) => {
    state.operateType = type
    state.showDeployDialog = true
}

// 删除
const handleDelete = (id) => {
    ElMessageBox.confirm($t('确定将此账号移出白名单吗？'), $t('提示'), {
        type: 'warning'
    }).then(() => {
        globalVBus.$emit('globalLoading', true)
        deleteMemberWhitelistData({ id }).then(res => {
            fetchData()
        }).catch(err => {
            globalVBus.$emit('globalLoading', false)
        })
    }).catch(err => { })
}
</script>

<style lang="scss">
.rescue-member-whitelist {
    .item-box {
        float: right;
    }
}
</style>
