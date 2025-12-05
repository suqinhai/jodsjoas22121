<template>
    <!-- 财务中心-人工加扣款-批量上传记录 -->
    <div class="container-main">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item>
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" value-format="YYYY-MM-DD" :start-placeholder="$t('开始时间')"
                    :end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" />
            </el-form-item>
            <el-form-item :label="$t('站点:')" v-if="commonData.merchantSiteList.length > 1">
                <MerchantSiteSelect isShowAll isNeedDefault :clearable="false" v-model="state.formData.merchantId">
                </MerchantSiteSelect>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column prop="merchant.id" :label="$t('站点ID')" min-width="100" align="center" />
            <el-table-column prop="merchant.name" :label="$t('站点名称')" min-width="100" align="center" />
            <el-table-column prop="addTime" :label="$t('批量操作时间')" min-width="160" align="center" />
            <el-table-column prop="emp.name" :label="$t('操作人')" min-width="100" align="center" />
            <el-table-column prop="successNum" :label="$t('成功数')" min-width="100" align="center" />
            <el-table-column prop="failNum" :label="$t('失败数')" min-width="100" align="center" />
            <el-table-column :label="$t('操作')" width="100" align="center">
                <template #default="{ row }">
                    <el-button v-throttle type="primary" text @click="showDetail(row)">{{$t('查看')}}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>

        <DetailDialog v-if="state.detailDialogShow" :itemData="state.itemData" @close="state.detailDialogShow = false">
        </DetailDialog>
    </div>
</template>

<script setup>
import { reactive, onMounted, defineAsyncComponent } from 'vue'
import commonStore from '@/store/common'
import { getBalanceRevisionLog } from '@/api/finance'
import { dateFormat, getShortcuts, disabledCurrentDateAfter } from '@/common/util'
const DetailDialog = defineAsyncComponent(() => import('./components/DetailDialog.vue'))

const shortcuts = getShortcuts()
const state = reactive({
    formData: {},
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    itemData: {},
    detailDialogShow: false,
})
const commonData = commonStore()

onMounted(() => {
    fetchData()
})

// 表格过滤数据处理
const fetchData = (val) => {
    if (val) {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {
                merchantId: commonData.merchantSiteList.length > 1 ? 0 : ''
            }
        }
    }
    let params = { ...state.listQuery, ...state.formData }
    let { receiveTime } = state.formData
    if (receiveTime && receiveTime.length) {
        params['interval.begin'] = receiveTime[0]
        params['interval.end'] = receiveTime[1]
    }
    delete params.receiveTime
    globalVBus.$emit('globalLoading', true)
    getBalanceRevisionLog(params).then(res => {
        let { total, list } = res.data
        state.tableData = list.map(item => {
            item.addTime && (item.addTime = dateFormat(item.addTime))
            return item
        })
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
