<template>
    <!-- 经销商模式列表 -->
    <div class="container dealer-model-list">
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column prop="id" :label="$t('经销商模式ID')" min-width="100" align="center" />
            <el-table-column prop="name" :label="$t('经销商模式名称')" min-width="160" align="center" />
            <el-table-column :label="$t('生效条件')" min-width="120" align="center">
                <template #default="{ row }">
                    <el-button type="primary" text @click="handleInfo(row.id)">{{$t('查看')}}</el-button>
                </template>
            </el-table-column>
            <el-table-column prop="usedSiteNum" :label="$t('已使用站点')" min-width="140" align="center" />
            <el-table-column prop="unusedSiteNum" :label="$t('未使用站点')" min-width="140" align="center" />
            <el-table-column fixed="right" align="center" :label="$t('操作')" min-width="100">
                <template #default="{ row }">
                    <el-button type="primary" text @click="handleEdit(row)">{{$t('修改')}}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>

        <DealerModeConfig v-if="state.showModeInfo" :operateType="0" :itemData="state.itemData" @close="state.showModeInfo = false">
        </DealerModeConfig>
        <EditSiteDialog v-if="state.showSiteEdit" :itemData="state.itemData" @close="state.showSiteEdit = false" @fetchData="fetchData">
        </EditSiteDialog>
    </div>
</template>

<script setup name='dealerModelList'>
import { reactive, onMounted, defineAsyncComponent } from 'vue'
import userStore from '@/store/user'
import { getDealerModelList, getDealerModelData } from '@/api/dealer'
const EditSiteDialog = defineAsyncComponent(() => import('./components/EditSiteDialog.vue'))
const DealerModeConfig = defineAsyncComponent(() => import('@/components/DealerModeConfig/index.vue'))

const state = reactive({
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    itemData: {},
    showModeInfo: false,
    showSiteEdit: false,
})
const userData = userStore()

onMounted(() => {
    fetchData()
})

// 表格过滤数据处理
const fetchData = () => {
    globalVBus.$emit('globalLoading', true)
    getDealerModelList(state.listQuery).then(res => {
        let { total, list } = res.data
        state.tableData = list || []
        state.total = total || 0
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

// 生效条件查看
const handleInfo = (id) => {
    globalVBus.$emit('globalLoading', true)
    getDealerModelData({ id }).then(res => {
        state.itemData = res.data || {}
        state.showModeInfo = true
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        globalVBus.$emit('globalLoading', false)
    })
}

// 修改使用站点
const handleEdit = ({ siteId, id, name }) => {
    state.itemData = {
        name,
        id,
        siteId: siteId.split(',').map(item => +item)
    }
    state.showSiteEdit = true
}
</script>

<style lang="scss">
.dealer-model-list {
}
</style>
