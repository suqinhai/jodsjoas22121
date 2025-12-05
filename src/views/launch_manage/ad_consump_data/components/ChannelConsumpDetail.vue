<template>
    <!-- 渠道消耗明细 -->
    <div class="tabs-main">
        <el-form class="filter-form" :model="state.formData" inline>
            <el-form-item>
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')"
                    :shortcuts="shortcuts" :disabled-date="disabledCurrentDateAfter" value-format="YYYY-MM-DD">
                </el-date-picker>
            </el-form-item>
            <el-form-item :label="$t('站点:')">
                <MerchantSiteSelect isShowAll multiple @change="getChannelDataList" isNeedDefault :clearable="false" style="width: 200px"
                    v-model="state.formData.merchantIds" />
            </el-form-item>
            <el-form-item :label="$t('渠道:')">
                <el-select v-model="state.formData.channelIds" :placeholder="$t('请选择渠道')" multiple>
                    <el-option v-for="item in state.channelList" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table :data="state.tableData" class="table-box" border :row-class-name="({row,rowIndex}) => (rowIndex === 0 ? 'total-row': '')">
            <el-table-column prop="reportTime_" :label="$t('消耗日期')" min-width="120" align="center" />
            <el-table-column prop="siteName" :label="$t('站点名称')" align="center" />
            <el-table-column prop="merchantId" :label="$t('站点ID')" align="center" />
            <el-table-column prop="channelName" :label="$t('渠道名称')" min-width="120" align="center" />
            <el-table-column prop="cost" :label="$t('消耗金额')" min-width="120" align="center" />
            <el-table-column prop="addTime" :label="$t('录入时间')" align="center" />
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>
    </div>
</template>

<script setup>
import { reactive, onMounted } from "vue"
import { getPurchaseVolumeRrecord, postFeeReview } from '@/api/data_center'
import { getChannelData, getCommonMeta } from '@/api/common'
import commonStore from '@/store/common'
import { disabledCurrentDateAfter, getShortcuts, dateFormat, deepClone } from '@/common/util'



const shortcuts = getShortcuts()
const commonData = commonStore()
const state = reactive({
    formData: {},
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    metaData: {},
    channelList: [],
    merchantIds: commonData.merchantSiteList.map((item) => { return item.id })
})


getCommonMeta({ types: 'rewardStatus' }).then(res => {
    res.data.rewardStatus = res.data.rewardStatus.filter((item) => { return Number(item.value) > 1 })
    state.metaData.rewardStatus = res.data.rewardStatus
})

onMounted(() => {
    getChannelDataList([0])
    fetchData()
})

const getChannelDataList = (merchantId) => {
    const merchantIds = (merchantId[0] == 0 ? state.merchantIds.join(',') : merchantId.join(','))
    getChannelData({ merchantIds, merchantId: 0 }).then(res => {
        state.channelList = res.data || []
        state.formData.channelIds = []
    })
}

const auditConfig = (row = {}) => {
    ElMessageBox.prompt($t('是否审核通过？'), $t('审核'), {
        confirmButtonText: $t('通过'),
        cancelButtonText: $t('拒绝'),
        distinguishCancelAndClose: true,
        beforeClose: (action, value, done) => {
            if (action !== "close") {
                const data = {
                    id: row.id,
                    status: action === 'confirm' ? 3 : 4,
                    remark: value.inputValue
                }
                postFeeReview(data).then(() => {
                    fetchData()
                    done()
                })
            } else {
                done()
            }
        }
    })
}

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val) {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {}
            state.formData.merchantIds = [0]
            getChannelDataList(state.formData.merchantIds)
        }
    }
    let params = { ...state.listQuery, ...state.formData }
    let { receiveTime } = state.formData
    if (receiveTime && receiveTime.length) {
        params['interval.begin'] = receiveTime[0]
        params['interval.end'] = receiveTime[1]
    }

    if (state.formData.merchantIds) {
        if (state.formData.merchantIds[0] === 0) {
            params['merchantIds'] = state.merchantIds.join(',')
        } else {
            params['merchantIds'] = state.formData.merchantIds.join(',')
        }
    }
    if (state.formData.channelIds) params['channelIds'] = state.formData.channelIds.join(',')
    params['merchantId'] = 0
    delete params.receiveTime
    globalVBus.$emit('globalLoading', true)
    getPurchaseVolumeRrecord(params).then(({ data = {}, ext = {} }) => {
        let { total, list } = data
        state.tableData = list || []
        state.tableData = list.map(item => {
            item.addTime && (item.addTime = dateFormat(item.addTime))
            item.updateTime && (item.updateTime = dateFormat(item.updateTime))
            return item
        })
        if (state.tableData.length) {
            state.tableData.unshift({
                cost: ext.sum || 0,
                reportTime_: $t('总计'),
            })
        }
        state.total = total
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss">
</style>
