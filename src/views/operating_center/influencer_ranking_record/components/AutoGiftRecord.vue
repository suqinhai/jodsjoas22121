<template>
    <!-- 运营中心-网红排行榜记录-每日自动赠送记录 -->
    <div class="tabs-main">
        <el-form class="filter-form" :model="state.formData" inline>
            <el-form-item :label="$t('站点:')" v-if="commonData.merchantSiteList.length > 1">
                <MerchantSiteSelect isNeedDefault :clearable="false" v-model="state.formData.merchantId">
                </MerchantSiteSelect>
            </el-form-item>
            <el-form-item :label="$t('排行榜类型:')">
                <el-select v-model="state.formData.rankType" :placeholder="$t('请选择排行榜类型')">
                    <el-option :label="$t('全部类型')" :value="-1" />
                    <el-option v-for="item in metaData.bloggerRankType" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
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
        </el-form>
        <el-table :data="state.tableData" class="table-box" border>
            <el-table-column prop="rankType_" :label="$t('排行榜类型')" min-width="100" align="center" />
            <el-table-column prop="rankRange" :label="$t('排名范围')" min-width="120" align="center" />
            <el-table-column prop="numRange" :label="$t('人数范围')" min-width="120" align="center" />
            <el-table-column prop="commissionRange" :label="$t('佣金范围')" min-width="120" align="center" />
            <el-table-column prop="reward" :label="$t('奖励金额')" min-width="100" align="center" />
            <el-table-column prop="dateRange" :label="$t('日期范围')" min-width="160" align="center" />
            <!-- <template #default="{ row }">
                    <div>{{row.startTime}}</div>
                    <div>{{row.endTime}}</div>
                </template>
            </el-table-column> -->
            <el-table-column fixed="right" :label="$t('操作')" width="100" align="center" v-if="userData.isHasPermiss('merchant.blogger.giveReward')">
                <template #default="{ row }">
                    <el-button v-if="row.canEdit" v-throttle type="primary" text @click="handleConfig(row)">{{$t('修改')}}
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>

        <GroupGiftAwardDeploy v-if="state.showGroupGiftAward" :itemData="state.itemData" @close="state.showGroupGiftAward = false">
        </GroupGiftAwardDeploy>
    </div>
</template>

<script setup>
import { reactive, onMounted, defineAsyncComponent } from "vue"
import userStore from '@/store/user'
import commonStore from '@/store/common'
import { getBloggerRewardConfig } from '@/api/operation'
import { dateFormat } from '@/common/util'
const GroupGiftAwardDeploy = defineAsyncComponent(() => import('./GroupGiftAwardDeploy.vue'))

const props = defineProps({
    metaData: {
        type: Object,
        default: () => {
            return {}
        }
    },
})
const state = reactive({
    formData: {
        rankType: -1
    },
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    itemData: {},
    showGroupGiftAward: false,
    currentMerchantId: ''
})
const userData = userStore()
const commonData = commonStore()

onMounted(() => {
    fetchData()
})

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val && val !== 'export') {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {
                rankType: -1,
                merchantId: commonData.merchantSiteList.length > 1 ? commonData.merchantSiteList[0].id : ''
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
    if (params.rankType === -1) delete params.rankType
    if (val === 'export') params.isExport = true
    globalVBus.$emit('globalLoading', true)
    getBloggerRewardConfig(params).then(res => {
        if (!params.isExport) {
            let { total, list } = res.data
            state.tableData = list.map(item => {
                item.startTime && (item.startTime = dateFormat(item.startTime))
                item.endTime && (item.endTime = dateFormat(item.endTime))
                return item
            })
            state.total = total || 0
            state.currentMerchantId = state.formData.merchantId
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        if (!params.isExport) state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

const handleConfig = (row) => {
    state.itemData = {
        ...row,
        merchantId: state.currentMerchantId
    }
    state.showGroupGiftAward = true
}
</script>

<style lang="scss">
</style>
