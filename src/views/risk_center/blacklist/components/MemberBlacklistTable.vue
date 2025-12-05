<template>
    <!-- 黑名单-会员黑名单 -->
    <div class="tabs-main">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item :label="$t('会员ID:')">
                <el-input @input="(val) => state.formData.userId = val.replace(/\D/g,'')" v-model="state.formData.userId" :placeholder="$t('请输入会员ID')" />
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('export')">{{$t('导出表格')}}</el-button>
            </el-form-item>
            <el-form-item v-permiss="'admin.user-blacklist.addOrEdit'">
                <el-button v-throttle type="primary" @click="handleConfig({},'blacklistDialogShow')">{{$t('新增')}}</el-button>
            </el-form-item>
            <el-form-item v-if="isDeletePermiss">
                <el-button v-throttle type="primary" @click="handleBatchRemove">{{$t('批量移除黑名单')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table ref="tableRef" class="table-box" :data="state.tableData" border @selection-change="handleSelectionChange">
            <el-table-column v-if="isDeletePermiss" type="selection" width="55" />
            <el-table-column :label="$t('会员ID')" min-width="120" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.user.id)">
                        {{ row.user?.id || '' }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('会员账号')" min-width="140" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.user.id)">
                        {{ row.user?.name || '' }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="realName" :label="$t('真实姓名')" min-width="100" align="center" />
            <el-table-column prop="id" :label="$t('充/提次数')" min-width="100" align="center">
                <template #default="{ row }">
                    {{ row.rechargeNum || 0 }}/{{ row.cashNum || 0 }}
                </template>
            </el-table-column>
            <el-table-column :label="$t('充提差额')" min-width="100" align="center">
                <template #default="{ row }">
                    {{ (row.rechargeSum - row.cashSum) }}
                </template>
            </el-table-column>
            <el-table-column prop="balance" :label="$t('总余额')" min-width="100" align="center" />
            <el-table-column prop="exportLimitTypes" :label="$t('限制类型')" min-width="160" align="center" />
            <el-table-column prop="lastLoginIp" :label="$t('最后登录IP')" min-width="160" align="center" />
            <el-table-column prop="emp.name" :label="$t('操作人')" min-width="100" align="center" />
            <el-table-column prop="updateTime" :label="$t('操作时间')" min-width="160" align="center" />
            <el-table-column fixed="right" align="center" :label="$t('操作')" width="160">
                <template #default="{ row }">
                    <el-button v-permiss="'admin.user-blacklist.addOrEdit'" v-throttle type="primary" text
                        @click="handleConfig(row,'blacklistDialogShow')">{{$t('修改')}}</el-button>
                    <el-button v-permiss="'admin.user-blacklist.delete'" v-throttle type="danger" text @click="handleSingleRemove(row.id)">{{$t('移除黑名单')}}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            :isShowChecked="!!state.tableListSelection.length && isDeletePermiss" :selectedNum="state.tableListSelection.length"
            @pagination="fetchData"></Pagination>

        <DeployMemberBlacklist v-if="state.blacklistDialogShow" :metaData="metaData" :itemData="state.itemData"
            @close="state.blacklistDialogShow = false" @fetchData="fetchData">
        </DeployMemberBlacklist>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, defineAsyncComponent, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import userStore from '@/store/user'
import { getMemberBlacklistList, deleteSingleBlacklistData, deleteBatchBlacklistData } from '@/api/risk_control'
import { getCommonMeta } from '@/api/common'
import { dateFormat } from '@/common/util'
const DeployMemberBlacklist = defineAsyncComponent(() => import('./DeployMemberBlacklist.vue'))

const state = reactive({
    formData: {},
    tableData: [],
    tableListSelection: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    blacklistDialogShow: false,
    itemData: {},
})
const userData = userStore()
const tableRef = ref(null)
let metaData = reactive({
    limitType: [],
})

const isDeletePermiss = computed(() => {
    return userData.isHasPermiss('admin.user-blacklist.deleteBatch')
})

getCommonMeta({ types: 'limitType' }).then(({ data }) => {
    metaData.limitType = data.limitType.filter(item => item.value !== '0' && item.value !== '2')
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
    let params = { ...state.listQuery, ...state.formData }
    if (val === 'export') {
        params.isExport = true
    } else {
        isDeletePermiss.value && tableRef.value && tableRef.value.clearSelection()
    }
    globalVBus.$emit('globalLoading', true)
    getMemberBlacklistList(params).then(res => {
        if (!params.isExport) {
            let { total, list } = res.data
            state.tableData = list.map(item => {
                item.updateTime && (item.updateTime = dateFormat(item.updateTime))
                item.exportLimitTypes && (item.exportLimitTypes = JSON.parse(item.exportLimitTypes).join('，'))
                return item
            })
            state.total = total
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        if (!params.isExport) state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

// 表格勾选切换
const handleSelectionChange = (val) => {
    state.tableListSelection = val
}

// 查看会员详情
const showMemberDetail = (id) => {
    globalVBus.$emit('memberDetailDialog', id)
}

// 按钮操作
const handleConfig = (row, key) => {
    state.itemData = { ...row }
    state[key] = true
}

// 移除黑名单
const handleSingleRemove = (id) => {
    ElMessageBox.confirm($t('确定要将此用户移出黑名单吗？'), $t('提示'), {
        type: 'warning'
    }).then(() => {
        globalVBus.$emit('globalLoading', true)
        deleteSingleBlacklistData({ id }).then(res => {
            // ElMessage.success($t('操作成功！'))
            fetchData()
        }).catch(err => {
            globalVBus.$emit('globalLoading', false)
        })
    }).catch(() => { })
}

// 批量移除黑名单
const handleBatchRemove = () => {
    if (!state.tableListSelection.length) {
        return ElMessage.warning($t('请至少选择一条数据再进行操作！'))
    }
    let ids = state.tableListSelection.map(item => item.id).join(',')
    ElMessageBox.confirm($t('确定要将选择的用户移出黑名单吗？？'), $t('提示'), {
        type: 'warning'
    }).then(() => {
        globalVBus.$emit('globalLoading', true)
        deleteBatchBlacklistData({ ids }).then(res => {
            // ElMessage.success($t('操作成功！'))
            fetchData()
        }).catch(err => {
            globalVBus.$emit('globalLoading', false)
        })
    }).catch(() => { })
}
</script>

<style lang="scss">
</style>
