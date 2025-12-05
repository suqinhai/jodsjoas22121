<template>
    <!-- IP白名单 -->
    <div class="container ip-whitelist">
        <el-form class="filter-form" :model="state.searchForm" inline>
            <el-form-item label="IP:">
                <el-input v-model="state.searchForm.ip" :placeholder="$t('请输入IP')" />
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item v-permiss="'admin.merchant-whitelist-config.edit'">
                <el-button v-throttle type="primary" @click="handleConfig({})">{{$t('新 增')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table :data="state.tableData" border class="table-box">
            <el-table-column prop="ips" label="IP" min-width="160" align="center">
                <template #default="{ row }">
                    <div v-for="(item,index) in row.ips.split(',')" :key="index">{{item}}</div>
                </template>
            </el-table-column>
            <el-table-column prop="type_" :label="$t('来源')" min-width="160" align="center" />
            <el-table-column prop="addTime" :label="$t('添加时间')" min-width="160" align="center">
                <template #default="{ row }">
                    <span>{{ dateFormat(row.addTime) }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="emp.name" :label="$t('添加人')" min-width="160" align="center" />
            <el-table-column prop="remark" :label="$t('备注')" min-width="160" align="center" />
            <el-table-column fixed="right" :label="$t('操作')" width="160" align="center">
                <template #default="{ row }">
                    <el-button v-throttle v-if="userData.isHasPermiss('admin.merchant-whitelist-config.edit') && row.type" type="primary" text
                        @click="handleConfig(row)">{{$t('修改')}}</el-button>
                    <el-button v-throttle v-if="userData.isHasPermiss('admin.merchant-whitelist-config.delete') && row.type" type="primary" text
                        @click="handleDelete(row)">{{$t('删除')}}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <!-- <Pagination v-show="!!state.total" v-model:page="state.pageConfig._page" v-model:size="state.pageConfig._size"
            :total="state.total" @pagination="fetchData"></Pagination> -->

        <DeployDialog :itemData="state.itemData" @close="state.showDeployDialog = false" v-if="state.showDeployDialog" @fetchData="fetchData">
        </DeployDialog>
    </div>
</template>

<script setup name="ipWhitelist">
import { reactive, onMounted, defineAsyncComponent } from 'vue'
import { ElMessageBox } from 'element-plus'
import userStore from '@/store/user'
import { getMerchantWhitelistList, deleteMerchantWhitelistConfig } from '@/api/manage_config.js'
import { dateFormat } from "@/common/util/index.js"
const DeployDialog = defineAsyncComponent(() => import("./components/DeployDialog.vue"))

const state = reactive({
    searchForm: {},
    tableData: [],
    total: 0,
    pageConfig: {
        _page: 1,
        _size: 10,
    },
    showDeployDialog: false,
    itemData: {},
    merchantId: '',
})
const userData = userStore()

onMounted(() => {
    fetchData()
})

const fetchData = (val = '') => {
    if (val) {
        state.pageConfig._page = 1
        if (val === 'reset') {
            state.searchForm = {}
        }
    }
    let params = { ...state.pageConfig, ...state.searchForm }
    globalVBus.$emit('globalLoading', true)
    getMerchantWhitelistList(params).then(res => {
        let { total, list = [] } = res.data
        state.tableData = list
        state.total = total
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

const handleDelete = ({ group, id }) => {
    ElMessageBox.confirm($t('确定要删除此IP白名单配置吗？'), $t('提示'), {
        confirmButtonText: $t('确 定'),
        cancelButtonText: $t('取消'),
        type: 'warning',
    }).then(() => {
        globalVBus.$emit('globalLoading', true)
        deleteMerchantWhitelistConfig({ id, merchantId: group.id, type: 1 }).then(res => {
            fetchData()
        }).catch(err => {
            globalVBus.$emit('globalLoading', false)
        })
    }).catch(() => { })
}

const handleConfig = (row) => {
    state.itemData = { ...row }
    state.showDeployDialog = true
}
</script>

<style lang="scss" scoped>
</style>
