<template>
    <!-- 网红数据报表-新增下级网红数 -->
    <Dialog ref="dialog" width="1150" :title="$t('新增下级网红数')" :isShowSubmit="false" top="2vh" @cancel="emits('close')">
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
        <el-table :data="state.tableData" border>
            <el-table-column prop="username" :label="$t('网红账号')" min-width="140" align="center" />
            <el-table-column prop="agentUser.name" :label="$t('所属上级')" min-width="140" align="center" />
            <el-table-column :label="$t('下级代理')" min-width="120" align="center">
                <template #default="{ row }">
                    <span v-if="!row.agentUserCount">{{row.agentUserCount || 0}}</span>
                    <span v-else class="special pointer" @click="handleInfo(row.userId,'showLowerLevelAgent')">
                        {{ row.agentUserCount }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('下级会员')" min-width="120" align="center">
                <template #default="{ row }">
                    <span v-if="!row.otherUserCount">{{row.otherUserCount || 0}}</span>
                    <span v-else class="special pointer" @click="handleInfo(row.userId,'showLowerLevelMember')">
                        {{ row.otherUserCount }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="firstRechargeUserCount" :label="$t('首充人数')" min-width="120" align="center" />
            <el-table-column prop="firstRechargeAmount" :label="$t('首充金额')" min-width="120" align="center" />
            <el-table-column prop="rechargeAmount" :label="$t('充值金额')" min-width="120" align="center" />
            <el-table-column prop="cashAmount" :label="$t('提现金额')" min-width="120" align="center" />
            <el-table-column prop="profitDiffAmount" :label="$t('充提差')" min-width="120" align="center" />
            <el-table-column prop="bloggerAmount" :label="$t('佣金')" min-width="120" align="center" />
            <el-table-column prop="discountAmount" :label="$t('优惠金额')" min-width="120" align="center" />
            <el-table-column prop="coinUserCount" :label="$t('投注人数')" min-width="120" align="center" />
            <el-table-column min-width="120" align="center">
                <template #header>{{$t('账户余额')}}<el-tooltip effect="dark" :content="$t('隔天刷新数据，汇总此博主所有会员的可提现余额')" placement="top">
                        <el-icon class="pointer" :size="15">
                            <QuestionFilled />
                        </el-icon>
                    </el-tooltip>
                </template>
                <template #default="{ row }">
                    {{ row.accountAmount }}
                </template>
            </el-table-column>
            <el-table-column prop="userCount" :label="$t('注册人数')" min-width="120" align="center" />
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue"
import commonStore from '@/store/common'
import { getInfluencerReportDetail } from '@/api/statistics'
import { disabledCurrentDateAfter, getShortcuts } from '@/common/util'

const shortcuts = getShortcuts()
const emits = defineEmits(['showDialog', 'close'])
const props = defineProps({
    itemData: {
        type: Object,
        default: {}
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
    searchData: {}
})
const dialog = ref(null)
const commonData = commonStore()

onMounted(() => {
    state.formData = { ...props.itemData }
    fetchData()
})

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val && val !== 'export') {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = { ...props.itemData }
        }
    }
    let params = { ...state.listQuery, ...state.formData }
    let { receiveTime, merchantId } = state.formData
    if (receiveTime && receiveTime.length) {
        if (new Date(receiveTime[1] + ' 23:23:59').getTime() - new Date(receiveTime[0] + ' 00:00:00').getTime() > 31 * 24 * 60 * 60 * 1000) return ElMessage.warning($t('搜索时间范围不得超过31天！'))
        params['interval.begin'] = receiveTime[0]
        params['interval.end'] = receiveTime[1]
    }
    delete params.receiveTime
    if (val === 'export') params.isExport = true
    dialog.value.showLoading()
    getInfluencerReportDetail(params).then(({ data = {} }) => {
        if (!params.isExport) {
            let { total, list } = data
            state.tableData = list || []
            state.total = total
            state.searchData = {
                receiveTime: receiveTime || [],
                merchantId
            }
        }
        dialog.value.closeLoading()
    }).catch(err => {
        if (!params.isExport) state.tableData = []
        dialog.value.closeLoading()
    })
}

// 站点切换
const selectChange = (merchantId) => {
    if (!merchantId) {
        state.formData.agentUserId = ''
        state.formData.agentUsername = ''
    }
}

const handleInfo = (agentUserId, dialogKey) => {
    emits('showDialog', {
        dialogKey,
        dataKey: dialogKey === 'showLowerLevelAgent' ? 'bloggerData' : 'lowerLevelData',
        data: {
            agentUserId,
            receiveTime: state.searchData.receiveTime,
            tab: 2,
            merchantId: state.searchData.merchantId
        }
    })
}
</script>

<style lang="scss">
</style>
