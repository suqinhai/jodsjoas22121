<template>
    <!-- 数据报表-网红数据报表 -->
    <div class="container influencer-report">
        <el-form class="filter-form" :model="state.formData" inline>
            <el-form-item>
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')"
                    :shortcuts="shortcuts" :disabled-date="disabledCurrentDateAfter" :clearable="false" value-format="YYYY-MM-DD">
                </el-date-picker>
            </el-form-item>
            <el-form-item :label="$t('站点:')" v-if="commonData.merchantSiteList.length > 1">
                <MerchantSiteSelect isShowAll isNeedDefault :clearable="false" v-model="state.formData.merchantId" @change="selectChange">
                </MerchantSiteSelect>
            </el-form-item>
            <el-form-item :label="$t('代理ID:')" v-if="state.formData.merchantId || commonData.merchantSiteList.length < 2">
                <el-input @input="(val) => state.formData.agentUserId = val.replace(/\D/g,'')" v-model="state.formData.agentUserId"
                    :placeholder="$t('请输入代理ID')" />
            </el-form-item>
            <el-form-item :label="$t('代理账号:')" v-if="state.formData.merchantId || commonData.merchantSiteList.length < 2">
                <el-input v-model="state.formData.agentUsername" :placeholder="$t('请输入代理账号')" />
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('export')">{{$t('导出报表')}}</el-button>
            </el-form-item>
        </el-form>
        <div class="tips-box">{{$t('数据更新时间：北京时间2点到4点30分更新')}}</div>
        <el-table :data="state.tableData" class="table-box" border :row-class-name="({row,rowIndex}) => (!rowIndex ? 'total-row': '')">
            <el-table-column prop="reportTime_" :label="$t('日期')" width="120" align="center" />
			<!-- <el-table-column prop="merchant.name" :label="$t('站点名称')" width="120" align="center" /> -->
			<el-table-column prop="todayBlogger" :label="$t('当日网红数')" width="120" align="center" />
            <el-table-column :label="$t('新增下级网红数')" min-width="140" align="center">
                <template #default="{ row,$index }">
                    <span v-if="!$index || !row.newBlogger">{{row.newBlogger || 0}}</span>
                    <span v-else class="special pointer" @click="showInfo(row.reportTime_,0)">
                        {{ row.newBlogger }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('首充会员')" min-width="120" align="center">
                <template #default="{ row,$index }">
                    <span v-if="!$index || !row.firstRechargeUserCount">{{row.firstRechargeUserCount || 0}}</span>
                    <span v-else class="special pointer" @click="showInfo(row.reportTime_,1)">
                        {{ row.firstRechargeUserCount }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="firstRechargeAmount" :label="$t('首充金额')" min-width="120" align="center" />
            <el-table-column prop="rechargeAmount" :label="$t('充值金额')" min-width="120" align="center" />
            <el-table-column prop="cashAmount" :label="$t('提现金额')" min-width="120" align="center" />
            <el-table-column prop="profitDiffAmount" :label="$t('充提差')" min-width="120" align="center" />
            <el-table-column prop="bloggerAmount" :label="$t('网红佣金')" min-width="120" align="center" />
            <el-table-column prop="validCoin" :label="$t('投注金额')" min-width="120" align="center" />
            <el-table-column prop="coinUserCount" :label="$t('投注人数')" min-width="120" align="center" />
            <el-table-column prop="discountAmount" :label="$t('优惠金额')" min-width="120" align="center" />
            <el-table-column prop="discountUserCount" :label="$t('优惠人数')" min-width="120" align="center" />
            <el-table-column prop="userCount" :label="$t('注册人数')" min-width="120" align="center" />
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>

        <BloggerDataDialog v-if="state.showBloggerData" :itemData="state.itemData" @close="state.showBloggerData = false" @showDialog="showDialog">
        </BloggerDataDialog>
        <LowerLevelAgentDialog v-if="state.showLowerLevelAgent" :itemData="state.bloggerData" @close="state.showLowerLevelAgent = false"
            @showDialog="showDialog"></LowerLevelAgentDialog>
        <LowerLevelMemberDialog v-if="state.showLowerLevelMember" :itemData="state.lowerLevelData" @close="state.showLowerLevelMember = false">
        </LowerLevelMemberDialog>
    </div>
</template>

<script setup name="influencerReport">
import { reactive, onMounted, defineAsyncComponent } from "vue"
import { ElMessage } from 'element-plus'
import commonStore from '@/store/common'
import { getInfluencerReport } from '@/api/statistics'
import { disabledCurrentDateAfter, getShortcuts, getTimeRange } from '@/common/util'
const BloggerDataDialog = defineAsyncComponent(() => import('./components/BloggerDataDialog.vue'))
const LowerLevelAgentDialog = defineAsyncComponent(() => import('./components/LowerLevelAgentDialog.vue'))
const LowerLevelMemberDialog = defineAsyncComponent(() => import('./components/LowerLevelMemberDialog.vue'))

const shortcuts = getShortcuts()
const state = reactive({
    searchData: {},
    formData: {},
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    itemData: {},
    bloggerData: {},
    lowerLevelData: {},
    showBloggerData: false,
    showLowerLevelAgent: false,
    showLowerLevelMember: false,
})
const commonData = commonStore()

onMounted(() => {
    state.formData.receiveTime = getTimeRange()
    fetchData()
})

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val && val !== 'export') {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {
                receiveTime: getTimeRange(),
                merchantId: 0
            }
        }
    }
    let params = { ...state.listQuery, ...state.formData }
    let { receiveTime } = state.formData
    if (receiveTime && receiveTime.length) {
        if (new Date(receiveTime[1] + ' 23:23:59').getTime() - new Date(receiveTime[0] + ' 00:00:00').getTime() > 31 * 24 * 60 * 60 * 1000) return ElMessage.warning($t('搜索时间范围不得超过31天！'))
        params['interval.begin'] = receiveTime[0]
        params['interval.end'] = receiveTime[1]
    }
    delete params.receiveTime
    if (val === 'export') params.isExport = true
    globalVBus.$emit('globalLoading', true)
    getInfluencerReport(params).then(({ data = {}, ext = {} }) => {
        if (!params.isExport) {
            let { agentUserId = '', agentUsername = '', merchantId = '' } = state.formData
            state.searchData = { agentUserId, agentUsername, merchantId }
            let { total, list } = data
            state.tableData = []
            state.tableData = list || []
            if (state.tableData.length) {
                state.tableData.unshift({ ...ext, reportTime_: $t('总计') })
            }
            state.total = total
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        if (!params.isExport) state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

// 展示详情
const showInfo = (reportTime, type) => {
    state[type ? 'lowerLevelData' : 'itemData'] = {
        receiveTime: [reportTime, reportTime],
        tab: 1,
        ...state.searchData
    }
    state[type ? 'showLowerLevelMember' : 'showBloggerData'] = true
}

// 展示弹窗
const showDialog = ({ dialogKey, dataKey, data }) => {
    state[dataKey] = { ...data }
    state[dialogKey] = true
}

// 站点切换
const selectChange = (merchantId) => {
    if (!merchantId) {
        state.formData.agentUserId = ''
        state.formData.agentUsername = ''
    }
}
</script>

<style lang="scss">
.influencer-report {
}
</style>
