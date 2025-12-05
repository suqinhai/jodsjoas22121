<template>
    <!-- 黑名单-IP黑名单 -->
    <div class="tabs-main">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item :label="$t('IP地址:')">
                <el-input style="width: 300px" v-model="state.formData.ip" :placeholder="$t('请输入IP地址')" />
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
                <el-button v-throttle type="primary" @click="state.blacklistDialogShow = true">{{$t('新增')}}</el-button>
            </el-form-item>
            <el-form-item v-permiss="'admin.user-blacklist.deleteBatch'">
                <el-button v-throttle type="primary" @click="handleBatchRemove">{{$t('批量移除黑名单')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-tooltip placement="right" popper-class="tooltip-max-width">
                    <template #content>
                        <div>{{ $t('说明：') }}</div>
                        <div>{{ $t('ip黑名单') }}</div>
                        <div>{{ $t('配置黑名单ip地址，可选择限制该ip的注册和登录；') }}</div>
                        <div>{{ $t('注：ip黑名单与用户管理状态无关，只对ip注册和登录判断限制。') }}</div>
                    </template>
                    <el-icon :size="24">
                        <QuestionFilled />
                    </el-icon>
                </el-tooltip>
            </el-form-item>
        </el-form>
        <el-table ref="tableRef" class="table-box" :data="state.tableData" border @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="id" label="ID" min-width="100" align="center" />
            <el-table-column prop="ip" :label="$t('IP地址')" min-width="100" align="center" />
            <el-table-column prop="exportLimitTypes" :label="$t('限制类型')" min-width="160" align="center" />
            <el-table-column prop="remark" :label="$t('备注')" min-width="100" align="center" />
            <el-table-column prop="emp.name" :label="$t('操作人')" min-width="100" align="center" />
            <el-table-column prop="updateTime" :label="$t('操作时间')" min-width="160" align="center" />
            <el-table-column fixed="right" align="center" :label="$t('操作')" width="160">
                <template #default="{ row }">
                    <el-button v-permiss="'admin.user-blacklist.delete'" v-throttle type="danger" text @click="handleSingleRemove(row.id)">{{$t('移除黑名单')}}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            :isShowChecked="!!state.tableListSelection.length && isPermiss" :selectedNum="state.tableListSelection.length" @pagination="fetchData">
        </Pagination>

        <DeployIpBlacklist v-if="state.blacklistDialogShow" @close="state.blacklistDialogShow = false" @fetchData="fetchData">
        </DeployIpBlacklist>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, defineAsyncComponent, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import userStore from '@/store/user'
import { getIpBlacklistList, deleteSingleBlacklistData, deleteBatchBlacklistData } from '@/api/risk_control'
import { dateFormat } from '@/common/util'
const DeployIpBlacklist = defineAsyncComponent(() => import('./DeployIpBlacklist.vue'))

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
})
const tableRef = ref(null)
const userData = userStore()

const isPermiss = computed(() => {
    return userData.isHasPermiss('admin.user-blacklist.deleteBatch')
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
        isPermiss.value && tableRef.value && tableRef.value.clearSelection()
    }
    globalVBus.$emit('globalLoading', true)
    getIpBlacklistList(params).then(res => {
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
const handleBatchRemove = (id) => {
    if (!state.tableListSelection.length) {
        return ElMessage.warning($t('请至少选择一条数据再进行操作！'))
    }
    let ids = state.tableListSelection.reduce((pre, item) => pre + ',' + item.id, '')
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
