<template>
    <!-- 新厂家申请 -->
    <div class="container new-vender-apply">
        <div class="title">{{$t('可接入厂家列表')}}</div>
        <el-table class="table-box" :data="state.tableData" border style="width: 800px">
            <el-table-column prop="alias_" :label="$t('厂家名称')" min-width="120" align="center" />
            <el-table-column prop="type_" :label="$t('游戏类型')" min-width="120" align="center" />
            <el-table-column :label="$t('品牌LOGO')" min-width="120" align="center">
                <template #default="{ row }">
                    <el-image v-if="!!row.image" class="imgs" :src="row.image" :crossorigin="null" :preview-src-list="[row.image]" preview-teleported
                        fit="contain" />
                </template>
            </el-table-column>
            <!-- <el-table-column prop="status_" :label="$t('申请状态')" min-width="120" align="center" /> -->
            <el-table-column prop="updateTime" :label="$t('更新时间')" min-width="160" align="center" />
            <el-table-column :label="$t('操作')" width="150" align="center">
                <template #default="{ row }">
                    <el-button v-throttle type="primary"
                        v-if="(row.status === 0 || row.status === 3)  && userData.isHasPermiss('merchant.merchant-vendor.apply')" text
                        @click="handleApply(row)">{{$t('申请接入')}}</el-button>
                </template>
            </el-table-column>
        </el-table>

        <Pagination style="width: 800px" v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size"
            v-model:page="state.listQuery._page" @pagination="fetchData"></Pagination>

        <ApplyDialog v-if="state.showApplyDialog" @close="state.showApplyDialog = false" :itemData="state.itemData" @fetchData="fetchData">
        </ApplyDialog>
    </div>
</template>

<script setup name="newVenderApply">
import { reactive, onMounted, defineAsyncComponent } from "vue"
import userStore from '@/store/user'
import { getMerchantApplyVendorList } from '@/api/merchant_center.js'
import { dateFormat } from '@/common/util'
const ApplyDialog = defineAsyncComponent(() => import('./components/ApplyDialog.vue'))

const state = reactive({
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    showApplyDialog: false,
    itemData: {}
})
const userData = userStore()

onMounted(() => {
    fetchData()
})

// 表格数据处理
const fetchData = () => {
    globalVBus.$emit('globalLoading', true)
    getMerchantApplyVendorList(state.listQuery).then(res => {
        let { list, total } = res.data
        state.tableData = list.map(item => {
            item.updateTime && (item.updateTime = dateFormat(item.updateTime))
            return item
        })
        state.total = total || 0
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

// 申请接入
const handleApply = (row) => {
    state.itemData = { ...row }
    state.showApplyDialog = true
}
</script>

<style lang="scss" scoped>
.new-vender-apply {
    .title {
        color: #666;
        font-size: 16px;
        margin-bottom: 10px;
    }
}
</style>
