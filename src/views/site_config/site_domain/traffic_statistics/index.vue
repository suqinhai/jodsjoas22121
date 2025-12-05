<template>
    <!-- 站点域名-流量统计 -->
    <div class="container-main traffic-statistics">
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column prop="month" :label="$t('日期')" min-width="100" align="center" />
            <el-table-column prop="totalCost" :label="$t('总费用(U)')" min-width="120" align="center" />
            <el-table-column prop="free_" :label="$t('免费流量(GB)')" min-width="120" align="center" />
            <el-table-column :label="$t('已使用(GB)')" min-width="120" align="center">
                <template #default="{ row }">
                    <span v-if="isHavePermiss" class="special pointer" @click="showDetail(row)">
                        {{ row.usedGb_ }}
                    </span>
                    <span v-else>
                        {{ row.usedGb_ }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="exceedGb_" :label="$t('超出用量(GB)')" min-width="120" align="center" />
            <el-table-column prop="exceedPrice" :label="$t('超出单价(U)')" min-width="120" align="center" />
            <el-table-column prop="exceedCost" :label="$t('超出费用(U)')" min-width="120" align="center" />
            <el-table-column prop="domainNum" :label="$t('总域名数')" min-width="100" align="center" />
            <el-table-column prop="exceedDomain" :label="$t('超出域名数')" min-width="110" align="center" />
            <el-table-column prop="exceedDomainPrice" :label="$t('超出域名单价(U)')" min-width="140" align="center" />
            <el-table-column prop="exceedDomainCost" :label="$t('超出域名费用(U)')" min-width="140" align="center" />
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>

        <DetailDialog v-if="state.detailDialogShow" :itemData="state.itemData" :metaData="metaData" @close="state.detailDialogShow = false">
        </DetailDialog>
    </div>
</template>

<script setup>
import { reactive, onMounted, defineAsyncComponent,computed } from 'vue'
import userStore from '@/store/user'
import { getTrafficStatisticsList } from '@/api/app_and_domain_manage'
const DetailDialog = defineAsyncComponent(() => import('./components/DetailDialog.vue'))

const props = defineProps({
    metaData: {
        type: Object,
        default: () => {
            return {}
        }
    },
})
const state = reactive({
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    itemData: {},
    detailDialogShow: false,
})
const userData = userStore()

const isHavePermiss = computed(() => {
    return userData.isHasPermiss('merchant.traffic-stat.detail')
})

onMounted(() => {
    fetchData()
})

// 表格过滤数据处理
const fetchData = () => {
    globalVBus.$emit('globalLoading', true)
    getTrafficStatisticsList({ ...state.listQuery }).then(res => {
        let { total, list } = res.data
        state.tableData = list || []
        state.total = total || 0
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

const showDetail = (val) => {
    state.itemData = { ...val }
    state.detailDialogShow = true
}
</script>

<style lang="scss">
.traffic-statistics {
    height: 100%;
    display: flex;
    flex-direction: column;
    .row-items {
        display: flex;
        align-items: center;
        justify-content: center;
        &-left {
            min-width: 150px;
            margin-right: 10px;
        }
        &-right {
            margin-left: 10px;
        }
    }
}
</style>
