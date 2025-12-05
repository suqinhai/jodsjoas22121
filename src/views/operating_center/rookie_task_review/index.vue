<template>
    <!-- 运营中心-任务派奖审核 -->
    <div class="container">
        <el-tabs v-model="state.formData.hasReview" @tab-change="fetchData">
            <el-tab-pane v-for="item in tabData" :key="item.key" :label="item.title" :name="item.key">
            </el-tab-pane>
        </el-tabs>
        <el-form class="filter-form" :model="state.formData" inline>
            <el-form-item>
                <el-select style="width: 100px" v-model="state.formData.timeType">
                    <el-option v-for="item in timeList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')"
                    :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" value-format="YYYY-MM-DD">
                </el-date-picker>
            </el-form-item>
            <el-form-item :label="$t('站点:')" v-if="commonData.merchantSiteList.length > 1">
                <MerchantSiteSelect isShowAll isNeedDefault :clearable="false" v-model="state.formData.siteId">
                </MerchantSiteSelect>
            </el-form-item>
            <el-form-item :label="$t('状态:')" v-if="state.formData.hasReview === 1">
                <el-select class="select-box" v-model="state.formData.status" :placeholder="$t('请选择状态')" filterable>
                    <template v-for="item in state.metaData.rewardStatus">
                        <el-option :key="item.value" :label="item.label" :value="item.value" v-if="item.value != 3" />
                    </template>
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('会员账号:')">
                <el-input v-model="state.formData.username" :placeholder="$t('请输入会员账号')" />
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('export')">{{$t('导出表格')}}</el-button>
            </el-form-item>
            <el-form-item v-if="state.formData.hasReview === 1">
                <el-button v-throttle type="primary" @click="audit(1)">{{$t('批量审核')}}</el-button>
            </el-form-item>
        </el-form>
        <div class="tips-box" v-if="state.formData.hasReview === 1">{{$t('注：任务中心注册账号任务开启人工审核后，将在此进行审核派奖。')}}</div>
        <el-table :data="state.tableData" class="table-box" border @selection-change="handleSelectionChange">
            <el-table-column fixed="left" type="selection" width="55" v-if="state.formData.hasReview === 1" />
            <el-table-column prop="merchant.id" :label="$t('站点ID')" min-width="120" align="center" />
            <el-table-column prop="merchant.name" :label="$t('站点名称')" min-width="120" align="center" />
            <el-table-column prop="user.name" :label="$t('会员账号')" min-width="120" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.user.id)">
                        {{ row.user.name }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="addTime" :label="$t('申请时间')" min-width="160" align="center">
                <template #default="{ row }">
                    {{dateFormat(row.addTime)}}
                </template>
            </el-table-column>
            <el-table-column prop="amount" :label="$t('奖励金额')" min-width="120" align="center" v-if="state.formData.hasReview === 2" />
            <el-table-column prop="status_" :label="$t('审核状态')" min-width="120" align="center" />
            <el-table-column prop="status_" :label="$t('领取状态')" min-width="120" align="center" v-if="state.formData.hasReview === 2" />
            <el-table-column prop="emp.name" :label="$t('审核人')" min-width="120" align="center" />
            <el-table-column prop="reviewTime_" :label="$t('审核时间')" min-width="160" align="center">
                <template #default="{ row }">
                    {{dateFormat(row.reviewTime)}}
                </template>
            </el-table-column>
            <el-table-column prop="remark" :label="$t('前端备注')" min-width="160" align="center" v-if="state.formData.hasReview === 1" />
            <el-table-column fixed="right" :label="$t('操作')" width="120" align="center" v-if="state.formData.hasReview === 1">
                <template #default="{ row }">
                    <el-button v-if="row.status === 2" v-throttle type="primary" text @click="audit(0,row)">{{$t('审核')}}</el-button>
                </template>
            </el-table-column>
        </el-table>

        <Pagination v-show="state.total > 0 && state.isShow" :total="state.total" v-model:limit="state.listQuery._size"
            v-model:page="state.listQuery._page" @pagination="fetchData"></Pagination>
    </div>
</template>

<script setup name="rookieTaskReview">
import { reactive, onMounted } from "vue"
import commonStore from '@/store/common'
import { postReviewList, postReview } from '@/api/operation.js'
import { getCommonMeta } from '@/api/common'
import { getShortcuts, disabledCurrentDateAfter, deepClone, dateFormat } from '@/common/util'
import { ElMessageBox } from 'element-plus'

let shortcuts = getShortcuts()
const tabData = [
    { key: 1, title: $t('申请审核') },
    { key: 2, title: $t('已通过申请') }
]
const timeList = [
    { value: 0, label: $t('申请时间') },
    { value: 1, label: $t('审核时间') }
]
const state = reactive({
    tableData: [],
    formData: {
        hasReview: 1,
        status: '2',
    },
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    metaData: {
        rewardStatus: []
    },
    tableListSelection: [],
    isShow: false
})
const commonData = commonStore()

onMounted(() => {
    getCommonMeta({ types: 'rewardStatus' }).then(res => {
        state.metaData.rewardStatus = res.data.rewardStatus
    })
    fetchData()
})

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val && val !== 'export') {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {
                hasReview: state.formData.hasReview,
                status: '2',
                siteId: 0
            }
        }
    }
    let params = {
        ...state.listQuery,
        ...deepClone(state.formData)
    }
    let { receiveTime } = state.formData
    if (receiveTime && receiveTime.length) {
        params['interval.begin'] = receiveTime[0]
        params['interval.end'] = receiveTime[1]
    }
    params.hasReview = params.hasReview === 1 ? true : false
    if (!params.siteId) delete params.siteId
    delete params.receiveTime
    if (val === 'export') params.isExport = true
    globalVBus.$emit('globalLoading', true)
    postReviewList(params).then(res => {
        if (!params.isExport) {
            let { total, list } = res.data
            state.tableData = list || []
            state.total = total
            state.isShow = !!params.siteId
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

// 表格勾选切换
const handleSelectionChange = (val) => {
    state.tableListSelection = val
}

const showMemberDetail = (id) => {
    globalVBus.$emit('memberDetailDialog', id)
}

const audit = (type = 0, row = {}) => {
    if (type) {
        let { tableListSelection } = state
        if (!tableListSelection.length) {
            return ElMessage.warning($t('请至少选择一条数据再进行操作！'))
        }
        row.id = tableListSelection.map(item => item.id).join(',')
    }
    ElMessageBox.prompt($t('是否审核通过？'), $t('审核'), {
        confirmButtonText: $t('通过'),
        cancelButtonText: $t('拒绝'),
        distinguishCancelAndClose: true,
        beforeClose: (action, value, done) => {
            if (action !== "close") {
                const data = {
                    ids: row.id,
                    status: action === 'confirm' ? 3 : 4,
                    remark: value.inputValue
                }
                postReview(data).then(() => {
                    fetchData()
                    done()
                })
            } else {
                done()
            }
        }
    })
}
</script>

<style lang="scss" scoped>
</style>