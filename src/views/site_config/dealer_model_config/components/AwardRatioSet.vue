<template>
    <!-- 经销商模式配置-奖励比例设置 -->
    <div class="tabs-main dealer-award-ratio">
        <div class="head" v-permiss="'admin.customer-service-config.otherEdit'">
            <el-button v-throttle type="primary" @click="handleConfig('')">{{$t('新 增')}}</el-button>
        </div>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column prop="id" :label="$t('经销商模式ID')" min-width="140" align="center" />
            <el-table-column prop="name" :label="$t('经销商模式名称')" min-width="140" align="center" />
            <el-table-column prop="siteId" :label="$t('已使用站点')" min-width="160" align="center" />
            <el-table-column prop="updateTime_" :label="$t('更新时间')" min-width="160" align="center" />
            <el-table-column prop="operator.name" :label="$t('操作人')" min-width="140" align="center" />
            <el-table-column fixed="right" align="center" :label="$t('操作')" width="140">
                <template #default="{ row }">
                    <el-button v-permiss="'admin.customer-service-config.otherEdit'" v-throttle type="primary" text @click="handleConfig(row.id)">
                        {{$t('修改')}}</el-button>
                    <el-button v-permiss="'admin.customer-service-config.otherDelete'" v-throttle type="danger" text @click="handleConfig(row.id,-2)">
                        {{$t('查看')}}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>

        <DealerModeConfig v-if="state.showDeployDialog" :operateType="state.type" :itemData="state.itemData" @close="state.showDeployDialog = false"
            @fetchData="fetchData">
        </DealerModeConfig>
    </div>
</template>

<script setup>
import { reactive, onMounted, defineAsyncComponent } from 'vue'
import userStore from '@/store/user'
import { getDealerModelList, getDealerModelData } from '@/api/dealer'
import { dateFormat } from '@/common/util'
const DealerModeConfig = defineAsyncComponent(() => import('@/components/DealerModeConfig/index.vue'))

const state = reactive({
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    tableData: [],
    itemData: {},
    showDeployDialog: false,
    imType: [],
    type: 1
})
const userData = userStore()

onMounted(() => {
    fetchData()
})

// 获取表格数据
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

// 新增/修改
const handleConfig = (id, type = 1) => {
    state.type = type
    if (!id) {
        state.itemData = {}
        state.showDeployDialog = true
        return
    }
    globalVBus.$emit('globalLoading', true)
    getDealerModelData({ id }).then(res => {
        state.itemData = res.data || {}
        state.type = type
        state.showDeployDialog = true
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss">
.dealer-award-ratio {
    .head {
        width: 100%;
        padding-right: 20px;
        display: flex;
        justify-content: flex-end;
        margin-bottom: 10px;
    }
}
</style>
