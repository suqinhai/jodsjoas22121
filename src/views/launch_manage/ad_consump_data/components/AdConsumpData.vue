<template>
    <!-- 投放管理-广告消耗数据列表 -->
    <div class="tabs-main">
        <el-form class="filter-form" :model="state.formData" inline>
            <el-form-item :label="$t('站点:')">
                <MerchantSiteSelect isShowAll isNeedDefault :clearable="false" style="width: 200px" v-model="state.formData.siteId" />
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="router.push('/launch-manage/purchase-volume-record')">{{$t('录入及修改')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table :data="state.tableData" class="table-box" border :row-class-name="({row,rowIndex}) => (rowIndex === 0 ? 'total-row': '')">
            <el-table-column prop="siteName" :label="$t('站点名称')" align="center" />
            <el-table-column prop="id" :label="$t('站点ID')" align="center" />
            <el-table-column prop="total" :label="$t('消耗金额')" align="center">
                <template #header>
                    <div>{{$t('消耗金额')}}</div>
                    <div>{{$t('（USDT）')}}</div>
                </template>
                <template #default="{ row, $index }">
                    <span v-if="$index == 0">{{row.total}}</span>
                    <span v-else class="special pointer" @click="handleEnter(row)">{{row.total}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="lastAmount" :label="$t('最新录入金额')" align="center" />
            <el-table-column prop="addTime" :label="$t('站点新增日期')" align="center" />
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>
        <EnterAmountDialog ref="enterAmountDialogRef" :itemData="state.itemData" v-if="state.showEnterAmountDialog"
            @close="state.showEnterAmountDialog = false" @handleEdit="handleEdit"></EnterAmountDialog>
    </div>
</template>

<script setup>
import { reactive, onMounted, defineAsyncComponent, ref } from "vue"
import { useRouter } from 'vue-router'
import { getDataList } from '@/api/data_center.js'
import { dateFormat } from '@/common/util'
const EnterAmountDialog = defineAsyncComponent(() => import("./EnterAmountDialog.vue"))


const router = useRouter()
const state = reactive({
    tableData: [],
    formData: {},
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    showEnterAmountDialog: false,
    itemData: {},
    editItemData: {}
})
const enterAmountDialogRef = ref(null)

onMounted(() => {
    fetchData()
})

const handleEnter = (data) => {
    state.itemData = data
    state.showEnterAmountDialog = true
}

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val && val !== 'export') {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {}
        }
    }
    let params = {
        ...state.listQuery,
        ...state.formData
    }
    if (state.formData.siteId === 0) delete params.siteId
    globalVBus.$emit('globalLoading', true)
    getDataList(params).then(({ data = {}, ext = {} }) => {
        state.tableData = data.list || []
        state.tableData = data.list.map(item => {
            item.addTime && (item.addTime = dateFormat(item.addTime))
            return item
        })
        if (state.tableData.length) {
            state.tableData.unshift({
                total: ext.sum || 0,
                siteName: $t('总计'),
            })
        }
        state.total = data.total
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss">
</style>