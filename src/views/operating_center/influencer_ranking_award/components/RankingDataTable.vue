<template>
    <!-- 运营中心-网红排行榜奖励-网红排行榜数据表格 -->
    <div class="tabs-main">
        <el-form class="filter-form" :model="state.formData" inline>
            <el-form-item>
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')"
                    :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" value-format="YYYY-MM-DD">
                </el-date-picker>
            </el-form-item>
            <el-form-item :label="$t('站点:')" v-if="commonData.merchantSiteList.length > 1">
                <MerchantSiteSelect isNeedDefault :clearable="false" v-model="state.formData.merchantId">
                </MerchantSiteSelect>
            </el-form-item>
            <el-form-item :label="$t('网红账号:')">
                <el-input v-model="state.formData.username" :placeholder="$t('请输入网红账号')" />
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <!-- <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item> -->
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('export')">{{$t('导 出')}}</el-button>
            </el-form-item>
            <el-form-item v-permiss="'merchant.blogger.giveReward'">
                <el-button v-throttle type="primary" @click="handleAwardGift({})">{{$t('批量赠送')}}</el-button>
            </el-form-item>
            <el-form-item v-permiss="'merchant.blogger.filterGiveReward'">
                <el-button v-throttle type="primary" @click="state.showGroupGiftAward = true">{{$t('筛选群体赠送奖励')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table ref="tableRef" :data="state.tableData" class="table-box" border @selection-change="handleSelectionChange" @sort-change="sortChange">
            <el-table-column fixed="left" type="selection" width="55" />
            <el-table-column sortable="custom" prop="rank" :label="$t('排名')" width="100" align="center" />
            <el-table-column prop="user.name" :label="$t('网红账号')" min-width="120" align="center" />
            <el-table-column :label="$t('注册时间')" min-width="160" align="center">
                <template #default="{ row }">
                    {{row.addTime && dateFormat(row.addTime, 'yyyy-MM-DD hh:ii:ss', '', true) }}
                </template>
            </el-table-column>
            <el-table-column v-if="type === 0" prop="firstRechargeUserCount" :label="$t('直属首充人数')" min-width="120" align="center" />
            <el-table-column v-if="type === 1" prop="bloggerAmount" :label="$t('直属佣金')" min-width="120" align="center" />
            <el-table-column prop="rewardAmount" :label="$t('已发奖励金额')" min-width="120" align="center" />
            <el-table-column fixed="right" :label="$t('操作')" width="200" align="center" v-if="userData.isHasPermiss('merchant.blogger.giveReward')">
                <template #default="{ row }">
                    <el-button v-throttle type="primary" text @click="handleAwardGift(row)">{{$t('配置赠送')}}
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            :isShowChecked="!!state.tableListSelection.length" :selectedNum="state.tableListSelection.length" @pagination="fetchData"></Pagination>

        <AwardGiftDialog v-if="state.showAwardGift" :itemData="state.itemData" :type="type" @close="state.showAwardGift = false"
            @fetchData="fetchData">
        </AwardGiftDialog>
        <GroupGiftAwardDeploy v-if="state.showGroupGiftAward" :type="type" @close="state.showGroupGiftAward = false">
        </GroupGiftAwardDeploy>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, defineAsyncComponent, defineProps } from "vue"
import userStore from '@/store/user'
import commonStore from '@/store/common'
import { getBloggerRankList } from '@/api/operation'
import { getShortcuts, dateFormat, disabledCurrentDateAfter, getTimeRange } from '@/common/util'
const AwardGiftDialog = defineAsyncComponent(() => import('./AwardGiftDialog.vue'))
const GroupGiftAwardDeploy = defineAsyncComponent(() => import('./GroupGiftAwardDeploy.vue'))

let shortcuts = getShortcuts()
const props = defineProps({
    type: {
        type: Number,
        default: 0
    }
})
const state = reactive({
    formData: {},
    tableData: [],
    tableListSelection: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    itemData: {},
    showAwardGift: false,
    showGroupGiftAward: false,
    currentMerchantId: ''
})
const tableRef = ref(null)
const userData = userStore()
const commonData = commonStore()

onMounted(() => {
    state.formData.receiveTime = getTimeRange(7, 0)
    state.formData.sort = 1
    fetchData()
})

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val && val !== 'export') {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {
                merchantId: commonData.merchantSiteList.length > 1 ? commonData.merchantSiteList[0].id : '',
                receiveTime: getTimeRange(7, 0),
                sort: 1
            }
        }
        tableRef.value.clearSort()
    }
    let params = { ...state.listQuery, ...state.formData }
    let { receiveTime } = state.formData
    if (receiveTime && receiveTime.length) {
        if (new Date(receiveTime[1] + ' 23:23:59').getTime() - new Date(receiveTime[0] + ' 00:00:00').getTime() > 31 * 24 * 60 * 60 * 1000) return ElMessage.warning($t('搜索时间范围不得超过31天！'))
        params['interval.begin'] = receiveTime[0]
        params['interval.end'] = receiveTime[1]
    }
    delete params.receiveTime
    params.tab = props.type
    val !== 'export' && tableRef.value && tableRef.value.clearSelection()
    if (val === 'export') params.isExport = true
    globalVBus.$emit('globalLoading', true)
    getBloggerRankList(params).then(res => {
        if (!params.isExport) {
            let { total, list } = res.data
            state.tableData = list || []
            state.total = total || 0
            state.currentMerchantId = state.formData.merchantId
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

const sortChange = ({ order }) => {
    state.formData.sort = 1
    if (order === 'descending') {
        state.formData.sort = 2
    } else if (order === 'ascending') {
        state.formData.sort = 1
    }
    fetchData()
}

const handleAwardGift = (row) => {
    state.itemData = {
        ...row,
        merchantId: state.currentMerchantId
    }
    if (!row.user) {
        let { tableListSelection } = state
        if (!tableListSelection.length) {
            return ElMessage.warning($t('请至少选择一条数据再进行操作！'))
        }
        state.itemData.userIds = tableListSelection.map(item => item.user.id)
    }
    state.showAwardGift = true
} 
</script>

<style lang="scss">
</style>
