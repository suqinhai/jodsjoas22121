<template>
    <!-- 运营中心-网红排行榜记录-奖励发放记录 -->
    <div class="tabs-main">
        <el-form class="filter-form" :model="state.formData" inline>
            <!-- <el-form-item>
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')"
                    :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" value-format="YYYY-MM-DD">
                </el-date-picker>
            </el-form-item> -->
            <el-form-item :label="$t('站点:')" v-if="commonData.merchantSiteList.length > 1">
                <MerchantSiteSelect isNeedDefault :clearable="false" v-model="state.formData.merchantId">
                </MerchantSiteSelect>
            </el-form-item>
            <el-form-item :label="$t('网红ID:')">
                <el-input @input="(val) => state.formData.userId = val.replace(/\D/g,'')" v-model="state.formData.userId"
                    :placeholder="$t('请输入网红ID')" />
            </el-form-item>
            <el-form-item :label="$t('网红账号:')">
                <el-input v-model="state.formData.username" :placeholder="$t('请输入网红账号')" />
            </el-form-item>
            <el-form-item :label="$t('发放方式:')">
                <el-select v-model="state.formData.rewardType" clearable :placeholder="$t('请选择发放方式')">
                    <el-option v-for="item in metaData.bloggerRewardType" :key="item.value" :label="item.label" :value="item.value" />
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
            <el-table-column prop="username" :label="$t('网红账号')" min-width="100" align="center" />
            <el-table-column prop="userId" :label="$t('网红ID')" min-width="100" align="center" />
            <el-table-column prop="reward" :label="$t('奖励金额')" min-width="100" align="center" />
            <el-table-column prop="rewardType_" :label="$t('发放方式')" min-width="100" align="center" />
            <el-table-column :label="$t('发放时间')" min-width="160" align="center">
                <template #default="{ row }">
                    {{row.rewardTime && dateFormat(row.rewardTime) }}
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>
    </div>
</template>

<script setup>
import { reactive, onMounted } from "vue"
import commonStore from '@/store/common'
import { getBloggerRankRecord } from '@/api/operation'
import { getShortcuts, dateFormat, disabledCurrentDateAfter } from '@/common/util'

let shortcuts = getShortcuts()
const props = defineProps({
    metaData: {
        type: Object,
        default: () => {
            return {}
        }
    },
})
const state = reactive({
    formData: {},
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
})
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
    if (val === 'export') params.isExport = true
    globalVBus.$emit('globalLoading', true)
    getBloggerRankRecord(params).then(res => {
        if (!params.isExport) {
            let { total, list } = res.data
            state.tableData = list || []
            state.total = total || 0
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        if (!params.isExport) state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss">
</style>
