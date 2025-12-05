<template>
    <!-- 财务中心-人工加扣款 -->
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
            <el-form-item :label="$t('会员ID:')">
                <el-input @input="(val) => state.formData.userId = val.replace(/\D/g,'')" v-model="state.formData.userId"
                    :placeholder="$t('请输入会员ID')" />
            </el-form-item>
            <el-form-item :label="$t('会员账号:')">
                <el-input v-model="state.formData.username" :placeholder="$t('请输入会员账号')" />
            </el-form-item>
            <el-form-item :label="$t('操作类型:')">
                <el-select class="select-box" v-model="state.formData.tradeType" :placeholder="$t('请选择操作类型')" clearable>
                    <el-option v-for="item in balanceAdjustType" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
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
            <el-form-item v-permiss="'merchant.account.adjust'">
                <el-button v-throttle type="primary" @click="state.balanceAmendShow = true">{{$t('新 增')}}</el-button>
            </el-form-item>
            <el-form-item v-permiss="'merchant.account.batchAdjust'">
                <el-button v-throttle type="primary" @click="state.batchAmendShow = true">{{$t('批量修正')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column prop="merchant.id" :label="$t('站点ID')" min-width="120" align="center" />
            <el-table-column prop="merchant.name" :label="$t('站点名称')" min-width="120" align="center" />
            <el-table-column :label="$t('会员ID')" min-width="120" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row)">{{row.user?.id || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('会员账号')" min-width="140" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row)">{{row.user?.name || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="tradeType_" :label="$t('变动类型')" min-width="120" align="center" />
            <el-table-column prop="tradeAmount" :label="$t('修正金额')" min-width="120" align="center" />
            <el-table-column prop="totalAmount" :label="$t('修正前余额')" min-width="120" align="center" />
            <el-table-column prop="afterAmount" :label="$t('修正后余额')" min-width="120" align="center" />
            <el-table-column prop="ticketType_" :label="$t('票券类型')" min-width="120" align="center" />
            <el-table-column prop="ticketName" :label="$t('派送票券名称')" min-width="120" align="center" />
            <el-table-column prop="auditFactor" :label="$t('稽核倍数')" min-width="120" align="center" />
            <el-table-column prop="remark" :label="$t('后端备注')" min-width="120" align="center" />
            <!-- <el-table-column prop="pcRemark" :label="$t('前端备注')" min-width="120" align="center" /> -->
            <el-table-column prop="emp.name" :label="$t('操作人')" min-width="120" align="center" />
            <el-table-column prop="updateTime" :label="$t('操作时间')" min-width="160" align="center" />
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>

        <AddBalanceAmend v-if="state.balanceAmendShow" :balanceAdjustType="balanceAdjustType" :ticketTypes="ticketType"
            @close="state.balanceAmendShow = false" @fetchData="fetchData">
        </AddBalanceAmend>
        <BatchAmendDialog v-if="state.batchAmendShow" @close="state.batchAmendShow = false" @lookInfo="emits('lookInfo')" @fetchData="fetchData">
        </BatchAmendDialog>
        <MemberDetail v-if="state.memberDetailShow" :merchantId="state.merchantId" @close="state.memberDetailShow = false"></MemberDetail>
    </div>
</template>

<script setup name="artificialAdjustAmount">
import { ref, reactive, onMounted, onActivated, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import commonStore from '@/store/common'
import { getBalanceRevisionList } from "@/api/finance.js"
import { getCommonMeta } from '@/api/common'
import { dateFormat, getShortcuts, disabledCurrentDateAfter } from '@/common/util'
const AddBalanceAmend = defineAsyncComponent(() => import('./components/AddBalanceAmend.vue'))
const BatchAmendDialog = defineAsyncComponent(() => import('./components/BatchAmendDialog.vue'))

const emits = defineEmits(['lookInfo'])
const shortcuts = getShortcuts()
const state = reactive({
    formData: {},
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    balanceAmendShow: false,
    batchAmendShow: false,
    tradeType: '',
    userId: '',
    username: '',
    jumpTime: [],
    merchantId: '',
    memberDetailShow: false,
})
let balanceAdjustType = ref([])
let ticketType = ref([])
const route = useRoute()
const commonData = commonStore()

getCommonMeta({ types: 'balanceAdjustType,ticketType' }).then(res => {
    balanceAdjustType.value = res.data.balanceAdjustType || {}
    ticketType.value = res.data.ticketType || {}
})

onMounted(() => {
    getData()
})

onActivated(() => {
    const { query = {} } = route
    if (state.username !== query.username || state.userId !== query.userId || state.tradeType !== query.tradeType ||
        ((state.jumpTime.length && (state.jumpTime[0] !== query.startTime || state.jumpTime[1] !== query.endTime)) || (!state.jumpTime.length && query.startTime))
    ) {
        getData(false)
    }
})

const getData = (isFirst = true) => {
    const { query = {} } = route
    state.tradeType = query.tradeType
    state.userId = query.userId
    state.username = query.username
    state.jumpTime = query.startTime ? [query.startTime, query.endTime] : []
    state.formData = {
        tradeType: state.tradeType || '',
        userId: state.userId || '',
        username: state.username || '',
        receiveTime: state.jumpTime.length ? [state.jumpTime[0], state.jumpTime[1]] : [],
        merchantId: isFirst ? (commonData.merchantSiteList.length > 1 ? 0 : '') : state.formData.merchantId
    }
    fetchData('search')
}

const fetchData = (val = '') => {
    if (val && val !== 'export') {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {
                tradeType: state.tradeType || '',
                userId: state.userId || '',
                username: state.username || '',
                receiveTime: state.jumpTime.length ? [state.jumpTime[0], state.jumpTime[1]] : [],
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
    if (val === 'export') params.isExport = true
    globalVBus.$emit('globalLoading', true)
    getBalanceRevisionList(params).then(res => {
        if (!params.isExport) {
            let { total, list = [] } = res.data
            state.tableData = list.map(item => {
                item.updateTime && (item.updateTime = dateFormat(item.updateTime))
                return item
            })
            state.total = total
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        if (!params.isExport) state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

// 查看会员详情
const showMemberDetail = ({ user, merchant }) => {
    commonData.memberId = user.id
    state.merchantId = merchant.id
    state.memberDetailShow = true
}
</script>

<style lang="scss" scoped>
.artificial-adjust-amount {
}
</style>
