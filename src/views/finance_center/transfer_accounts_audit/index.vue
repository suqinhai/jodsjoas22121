<template>
    <!-- 财务中心-转账订单列表 -->
    <div class="container transfer-accounts-audit" v-if="state.tableConfigData.checked.length">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item :label="$t('创建时间:')">
                <el-date-picker v-model="state.formData.createTime" type="datetimerange" value-format="YYYY-MM-DD HH:mm:ss"
                    :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter"
                    :default-time="defaultTime" :shortcuts="shortcuts" />
            </el-form-item>
            <el-form-item :label="$t('成功时间:')">
                <el-date-picker v-model="state.formData.successTime" type="datetimerange" value-format="YYYY-MM-DD HH:mm:ss"
                    :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter"
                    :default-time="defaultTime" :shortcuts="shortcuts" />
            </el-form-item>
            <el-form-item :label="$t('会员ID:')">
                <el-input @input="(val) => state.formData.userId = val.replace(/\D/g,'')" v-model="state.formData.userId"
                    :placeholder="$t('请输入会员ID')" />
            </el-form-item>
            <el-form-item :label="$t('会员账号:')">
                <el-input v-model="state.formData.username" :placeholder="$t('请输入会员账号')" />
            </el-form-item>
            <el-form-item :label="$t('订单号:')">
                <el-input v-model="state.formData.orderNo" style="width: 280px" :placeholder="$t('请输入订单号')" />
            </el-form-item>
            <el-form-item :label="$t('操作人:')">
                <el-input v-model="state.formData.empUsername" :placeholder="$t('请输入')" clearable />
            </el-form-item>
            <el-form-item :label="$t('收款账号:')">
                <el-input v-model="state.formData.toAccount" :placeholder="$t('请输入收款账号')" />
            </el-form-item>
            <el-form-item :label="$t('订单状态:')">
                <el-select class="select-box" v-model="state.formData.status" clearable :placeholder="$t('订单状态')">
                    <el-option v-for="item in rechargeStatus" :key="item.value" :label="item.label" :value="+item.value" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('支付方式:')">
                <el-select v-model="state.formData.payCode" clearable :placeholder="$t('请选择支付方式')">
                    <el-option v-for="item in state.payScopeList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('站点:')" v-if="commonData.merchantSiteList.length > 1">
                <MerchantSiteSelect isShowAll isNeedDefault :clearable="false" v-model="state.formData.merchantId">
                </MerchantSiteSelect>
            </el-form-item>
            <el-form-item>
                <el-checkbox v-model="state.formData.atFirst" :label="$t('只查首次存款')" />
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData({key: 'search'})">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData({})">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData({key: 'export'})">{{$t('导出表格')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table v-if="!state.isRefresh" class="table-box" :data="state.tableData" border>
            <el-table-column v-for="(item,index) in state.tableConfigData.checked" :key="index" :prop="item"
                :min-width="['orderNo'].includes(item) ? 240 : ['addTime','updateTime','channelSuccessRate','fromAccount','toAccount','backRemark','frontRemark','agentUsername'].includes(item) ? 160 : 100"
                align="center">
                <template #header v-if="['fromAccount', 'toAccount'].includes(item)">
                    <span>{{ getLabel(item) }}</span>
                    <el-tooltip 
                        effect="dark" 
                        :content="item === 'fromAccount' ? $t('商户设置') : $t('用户设置')" 
                        placement="top"
                    >
                        <el-icon class="pointer" :size="15" style="top: 2px;">
                            <QuestionFilled />
                        </el-icon>
                    </el-tooltip>
                </template>
                <template #header v-else>
                    {{ getLabel(item) }}
                </template>
                <template #default="{ row }">
                    <span v-if="['merchantId','merchantName'].includes(item)">
                        {{ item === 'merchantId' ? row.merchant?.id : row.merchant?.name }}
                    </span>
                    <span v-else-if="['agentUserId','agentUsername'].includes(item)" class="special pointer"
                        @click="showMemberDetail({userId: row.agentUser.id, merchant: row.merchant})">
                        {{ item === 'agentUserId' ? row.agentUser?.id || '' : row.agentUser?.name || '' }}
                    </span>
                    <template v-else-if="item === 'userId'">
                        <span class="special pointer" @click="showMemberDetail({userId: row.userId, merchant: row.merchant})">
                            {{ row.userId || '' }}
                        </span>
                        <!-- <div class="tag-box" v-if="!row.isTotal">
                            <span class="tag-box-name"
                                style="backgroundColor: aqua;padding: 0 15px">{{ row.rechargeNum > 2 ? 'n' : row.rechargeNum || 0 }}</span>
                        </div> -->
                    </template>
                    <span v-else-if="item === 'username'" class="special pointer"
                        @click="showMemberDetail({userId: row.userId, merchant: row.merchant})">
                        {{ row.username || '' }}
                    </span>
                    <template v-else-if="item === 'fromAccount'">
                        <div style="text-align: left;white-space: nowrap" v-if="row.profileInfo && row.profileInfo.toName">
                            {{$t('姓名:')}}{{row.profileInfo.toName}}</div>
                        <div style="text-align: left;white-space: nowrap" v-if="row.profileInfo && row.profileInfo.toAccount">
                            {{$t('账户:')}}{{row.profileInfo.toAccount}}</div>
                        <div style="text-align: left;" v-if="row.profileInfo && row.profileInfo.toRemark">
                            {{$t('其他:')}}{{row.profileInfo.toRemark}}</div>
                    </template>
                    <template v-else-if="item === 'toAccount'">
                        <div style="text-align: left;white-space: nowrap" v-if="row.profileInfo && row.profileInfo.bankName">
                            {{$t('银行名称:')}}{{row.profileInfo.bankName}}</div>
                        <div style="text-align: left;white-space: nowrap" v-if="row.profileInfo && row.profileInfo.payName">
                            {{$t('姓名:')}}{{row.profileInfo.payName}}</div>
                        <div style="text-align: left;white-space: nowrap" v-if="row.profileInfo && row.profileInfo.payAccount">
                            {{$t('账户:')}}{{row.profileInfo.payAccount}}</div>
                    </template>
                    <el-image v-else-if="row.profileInfo?.profile && item === 'transferVoucher'" class="imgs" :src="row.profileInfo.profile"
                        :crossorigin="null" :preview-src-list="[row.profileInfo.profile]" preview-teleported fit="contain" />
                    <span v-else-if="item === 'empName'">
                        {{ row.emp?.name || '' }}
                    </span>
                    <span v-else-if="item === 'status'">
                        {{ row.status_ || '' }}
                    </span>
                    <span v-else-if="item === 'level'">
                        {{row.level_ || ''}}
                    </span>
                    <span v-else-if="item === 'channel'">
                        {{row.channel_ || ''}}
                    </span>
                    <span v-else-if="['frontRemark','backRemark'].includes(item)">
                        {{ item === 'frontRemark' ? row.profileInfo?.frontRemark : row.profileInfo?.backRemark }}
                    </span>
                    <span v-else>
                        {{ row[item] }}
                    </span>
                </template>
            </el-table-column>
            <!-- <el-table-column prop="orderNo" :label="$t('订单号')" min-width="240" align="center" />
            <el-table-column prop="merchant.id" :label="$t('站点ID')" min-width="120" align="center" />
            <el-table-column prop="merchant.name" :label="$t('站点名称')" min-width="140" align="center" />
            <el-table-column :label="$t('会员ID')" min-width="120" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail({userId: row.userId, merchant: row.merchant})">{{row.userId || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('会员账号')" min-width="140" align="center">
                <template #default="{ row }">
                    <span class="special pointer"
                        @click="showMemberDetail({userId: row.userId, merchant: row.merchant})">{{row.username || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="userId" :label="$t('上级代理ID')" min-width="160" align="center">
                <template #default="{ row }">
                    <span class="special pointer"
                        @click="showMemberDetail({userId: row.agentUser?.id, merchant: row.merchant})">{{row.agentUser?.id || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="addTime" :label="$t('创建时间')" min-width="160" align="center" />
            <el-table-column prop="updateTime" :label="$t('完成时间')" min-width="160" align="center" />
            <el-table-column :label="$t('会员等级')" min-width="100" align="center">
                <template #default="{ row }">
                    {{row.id ? 'VIP' + row.level : ''}}
                </template>
            </el-table-column>
            <el-table-column prop="layerName" :label="$t('会员层级')" min-width="120" align="center" />
            <el-table-column prop="amount" :label="$t('订单金额')" min-width="145" align="center" />
            <el-table-column prop="giftAmount" :label="$t('赠送金额')" min-width="120" align="center" />
            <el-table-column prop="totalAmount" :label="$t('总上分金额')" min-width="120" align="center" />
            <el-table-column prop="payCode" :label="$t('支付方式')" min-width="120" align="center" />
            <el-table-column prop="channel_" :label="$t('支付通道')" min-width="120" align="center" />
            <el-table-column :label="$t('收款账户')" min-width="220" align="center">
                <template #default="{ row }">
                    <div style="text-align: left;white-space: nowrap" v-if="row.profileInfo && row.profileInfo.toName">
                        {{$t('姓名:')}}{{row.profileInfo.toName}}</div>
                    <div style="text-align: left;white-space: nowrap" v-if="row.profileInfo && row.profileInfo.toAccount">
                        {{$t('账户:')}}{{row.profileInfo.toAccount}}</div>
                    <div style="text-align: left;" v-if="row.profileInfo && row.profileInfo.toRemark">
                        {{$t('其他:')}}{{row.profileInfo.toRemark}}</div>
                </template>
            </el-table-column>
            <el-table-column :label="$t('付款账户')" min-width="220" align="center">
                <template #default="{ row }">
                    <div style="text-align: left;white-space: nowrap" v-if="row.profileInfo && row.profileInfo.bankName">
                        {{$t('银行名称:')}}{{row.profileInfo.bankName}}</div>
                    <div style="text-align: left;white-space: nowrap" v-if="row.profileInfo && row.profileInfo.payName">
                        {{$t('姓名:')}}{{row.profileInfo.payName}}</div>
                    <div style="text-align: left;white-space: nowrap" v-if="row.profileInfo && row.profileInfo.payAccount">
                        {{$t('账户:')}}{{row.profileInfo.payAccount}}</div>
                </template>
            </el-table-column>
            <el-table-column prop="profile" :label="$t('转账凭证')" min-width="220" align="center">
                <template #default="{ row }">
                    <el-image v-if="row.profileInfo && row.profileInfo.profile" class="imgs" :src="row.profileInfo.profile" :crossorigin="null"
                        :preview-src-list="[row.profileInfo.profile]" preview-teleported fit="contain" />
                </template>
            </el-table-column>
            <el-table-column prop="profileInfo.frontRemark" :label="$t('转账备注')" min-width="220" align="center" />
            <el-table-column prop="profileInfo.backRemark" :label="$t('前端拒绝备注')" min-width="220" align="center" />
            <el-table-column prop="emp.name" :label="$t('操作人')" min-width="100" align="center" />
            <el-table-column prop="status_" :label="$t('订单状态')" min-width="120" align="center" /> -->
            <el-table-column fixed="right" align="center" width="160">
                <template #header>
                    {{$t('操作')}}
                    <span class="operate-cell pointer" @click="state.tableHeadConfigShow = true">
                        <el-icon color="#409eff" :size="16">
                            <Setting />
                        </el-icon>
                    </span>
                </template>
                <template #default="{ row }">
                    <el-button v-throttle type="primary" text v-if="row.status === 0 && row.lock && row.canOperate && transferReviewPermiss"
                        @click="handleOperateOrder(row,0)">{{$t('解锁')}}</el-button>
                    <el-button v-throttle type="primary" text v-if="row.status === 0 && !row.lock && transferReviewPermiss"
                        @click="handleOperateOrder(row,3)">
                        {{$t('锁定')}}</el-button>
                    <el-button v-throttle type="primary" text v-if="row.status === 0 && row.lock && row.canOperate && transferReviewPermiss"
                        @click="handleOperateOrder(row,9)">{{$t('确认')}}</el-button>
                    <el-button v-throttle type="primary" text v-if="row.status === 0 && row.lock && row.canOperate && transferReviewPermiss"
                        @click="handleOperateOrder(row,-9)">
                        {{$t('拒绝')}}</el-button>
                    <el-button v-throttle type="primary" text v-if="row.status === -9 && transferReviewPermiss" @click="handleOperateOrder(row,3)">
                        {{$t('恢复')}}</el-button>
                    <el-button v-throttle type="primary" text @click="handleDetails(row)">{{$t('订单详情')}}
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData({key:'cut'})"></Pagination>

        <TableHeaderConfig v-if="state.tableHeadConfigShow" :menuId="state.menuId" :type="2" :tableHeaderTitle="metaData.rechargeTitle"
            :disabledCancelKey="disabledCancelKey" :disabledSortKey="['orderNo']" :tableConfigData="state.tableConfigData"
            @refreshConfig="refreshConfig" @close="state.tableHeadConfigShow = false">
        </TableHeaderConfig>
        <OrderDetail v-if="state.orderDetailShow" :orderData="state.itemData" @close="state.orderDetailShow = false">
        </OrderDetail>
        <RemarkPopup v-if="state.remarkPopupShow" :orderData="state.itemData" @close="state.remarkPopupShow = false"
            @fetchData="fetchData({key:'cut'})"></RemarkPopup>
        <MemberDetail v-if="state.memberDetailShow" :merchantId="state.merchantId" @close="state.memberDetailShow = false"></MemberDetail>
    </div>
</template>

<script setup name="transferAccountsAudit">
import { reactive, onMounted, onActivated, computed, defineAsyncComponent, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import userStore from '@/store/user'
import commonStore from '@/store/common'
import { getReviewListData, postTransferReviewData, getBankOfflineWallet } from '@/api/finance'
import { getCommonMeta, getLevelConfig, getUserGradeData, getTableHeaderConfig } from '@/api/common'
import { dateFormat, getShortcuts, getDefaultTime, disabledCurrentDateAfter } from '@/common/util'
const OrderDetail = defineAsyncComponent(() => import('./components/OrderDetail.vue'))
const RemarkPopup = defineAsyncComponent(() => import('./components/RemarkPopup.vue'))

const rechargeStatus = [
    { value: 0, label: $t('待付款') },
    { value: 9, label: $t('充值成功') },
    { value: -9, label: $t('已关闭') }
]
const disabledCancelKey = ['merchantId', 'userId', 'totalAmount', 'status', 'username', 'merchantName', 'localAmount', 'addTime']
const shortcuts = getShortcuts()
const defaultTime = getDefaultTime()
const state = reactive({
    formData: {},
    searchData: {},
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    memberDetailShow: false,
    remarkPopupShow: false,
    merchantId: '',
    itemData: {},
    payScopeList: [],
    payScopeData: {},
    isFirst: '',
    userId: '',
    username: '',
    jumpTime: [],
    isInit: true,
    menuId: '',
    isRefresh: false,
    tableConfigData: {
        all: [],
        checked: [],
    },
    tableHeadConfigShow: false,
})
let metaData = reactive({
    // userLevel: [],
    // autoLevel: [],
    rechargeTitle: [],
})
const route = useRoute()
const commonData = commonStore()
const userData = userStore()

const transferReviewPermiss = computed(() => {
    return userData.isHasPermiss('merchant.recharge-log.transferReview')
})

onMounted(async () => {
    userData.menuList.forEach(item => {
        if (item.children && item.children.length) {
            item.children.forEach(its => {
                if (its.path === route.path) state.menuId = its.id
            })
        }
    })
    await getCommonMeta({ types: 'rechargeTitle' }).then(res => {
        metaData.rechargeTitle = res.data.rechargeTitle.filter(item => !['tradeNo', 'bankName', 'fromName', 'toName', 'rate', 'currency', 'localAmount', 'remark'].includes(item.value))
    })
    let { data } = await getTableHeaderConfig({ menuId: state.menuId, type: 2 })
    if (data) state.tableConfigData = Object.assign(state.tableConfigData, JSON.parse(data))
    state.tableConfigData.checked = state.tableConfigData.checked.filter(item => metaData.rechargeTitle.some(its => its.value === item))
    state.tableConfigData.all = state.tableConfigData.all.filter(item => metaData.rechargeTitle.some(its => its.value === item))
    nextTick(() => {
        getData()
        // if (commonData.merchantSiteList.length < 2) getMemberConfigData()
    })
    userData.postRemindingRead(5)
    getPayScopeData()
})

onActivated(() => {
    if (state.isInit) return state.isInit = false
    const { query = {} } = route
    if (state.userId !== query.userId || state.username !== query.username || state.isFirst !== query.isFirst ||
        ((state.jumpTime.length && (state.jumpTime[0] !== query.startTime || state.jumpTime[1] !== query.endTime)) || (!state.jumpTime.length && query.startTime))) {
        getData()
    }
    userData.postRemindingRead(5)
})

const getData = () => {
    const { query = {} } = route
    state.userId = query.userId
    state.username = query.username
    state.isFirst = query.isFirst
    state.jumpTime = query.startTime ? [query.startTime, query.endTime] : []
    let obj = {}
    obj.key = 'search'
    state.formData = {
        merchantId: commonData.merchantSiteList.length > 1 ? !query || !Object.keys(query).length ? 0 : commonData.currentMerchantSite.id : '',
        userId: state.userId,
        username: state.username,
        successTime: state.jumpTime.length ? [state.jumpTime[0], state.jumpTime[1]] : [],
        atFirst: !!state.isFirst,
        status: state.isFirst ? 9 : ''
    }
    fetchData(obj)
}

// 表格过滤数据处理
const fetchData = (data = {}) => {
    let { key = '' } = data
    let params = {}
    let { formData, listQuery, searchData } = state
    switch (key) {
        case 'search':
            listQuery._page = 1
            params = { ...formData, ...listQuery }
            if (params.createTime && params.createTime.length) {
                params['interval.begin'] = params.createTime[0]
                params['interval.end'] = params.createTime[1] + '.999'
            }
            if (params.successTime && params.successTime.length) {
                params['accountBeginTime'] = params.successTime[0]
                params['accountEndTime'] = params.successTime[1] + '.999'
            }
            params.atFirst = params.atFirst ? 1 : ''
            delete params.createTime
            delete params.successTime
            break;
        case 'cut':
            params = { ...searchData, ...listQuery }
            break
        case 'export':
            params = { ...searchData, ...listQuery }
            params.isExport = true
            break;
        default:
            state.formData = {
                merchantId: commonData.merchantSiteList.length > 1 ? !route.query || !Object.keys(route.query).length ? 0 : commonData.currentMerchantSite.id : '',
                userId: state.userId,
                username: state.username,
                successTime: state.jumpTime.length ? [state.jumpTime[0], state.jumpTime[1]] : [],
                atFirst: !!state.isFirst,
                status: state.isFirst ? 9 : ''
            }
            params = { ...listQuery, ...state.formData }
            params.atFirst = params.atFirst ? 1 : ''
            if (params.successTime && params.successTime.length) {
                params['accountBeginTime'] = params.successTime[0]
                params['accountEndTime'] = params.successTime[1] + '.999'
            }
            delete params.successTime
            break;
    }
    if (key !== 'export') delete params.isExport
    delete params.key
    state.searchData = { ...params }
    getTableData(params)
}

// 获取表格数据
const getTableData = (params) => {
    globalVBus.$emit('globalLoading', true)
    getReviewListData(params).then(res => {
        if (!params.isExport) {
            state.tableData = []
            let { total, list } = res.data
            state.tableData = list.map(item => {
                item.addTime && (item.addTime = dateFormat(item.addTime))
                item.updateTime && (item.updateTime = dateFormat(item.updateTime))
                item.atFirst = item.atFirst ? $t('是') : $t('否')
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

const refreshConfig = async () => {
    try {
        globalVBus.$emit('globalLoading', true)
        let { data } = await getTableHeaderConfig({ menuId: state.menuId, type: 2 })
        state.isRefresh = true
        if (data) state.tableConfigData = Object.assign(state.tableConfigData, JSON.parse(data))
        state.tableConfigData.checked = state.tableConfigData.checked.filter(item => metaData.rechargeTitle.some(its => its.value === item))
        state.tableConfigData.all = state.tableConfigData.all.filter(item => metaData.rechargeTitle.some(its => its.value === item))
        setTimeout(() => {
            state.isRefresh = false
            nextTick(() => {
                fetchData({ key: 'search' })
            })
        })
    } catch (error) {
        globalVBus.$emit('globalLoading', false)
    }
}

const getLabel = (key) => {
    return metaData.rechargeTitle.find(item => item.value === key)?.label || ''
}


const siteChange = (val) => {
    delete state.searchData.vip
    delete state.formData.vip
    delete state.searchData.autoLayerIds
    delete state.searchData.fixedLayerIds
    state.layerValue = []
    if (val) {
        metaData.userLevel = []
        metaData.autoLevel = []
        getMemberConfigData(val)
    }
}

const getMemberConfigData = (merchantId) => {
    getUserGradeData({ merchantId }).then(({ data }) => {
        if (data) {
            for (let key in data) {
                metaData.userLevel.push({
                    label: data[key],
                    value: key,
                })
            }
        }
    })
    getLevelConfig({ merchantId }).then(({ data }) => {
        if (data) {
            metaData.autoLevel = data
        }
    })
}

// 查看会员详情
const showMemberDetail = ({ userId, merchant }) => {
    commonData.memberId = userId
    state.merchantId = merchant.id
    state.memberDetailShow = true
}

const handleOperateOrder = (row, type) => {
    let confirmText = ''
    if (row.status == 0 && type === 0) {
        confirmText = $t('是否解锁？')
    } else if (row.status == 0 && type === 3) {
        confirmText = $t('是否锁定？')
    } else if (type === 9) {
        confirmText = $t('是否已经确认收到款项，点击确认后给用户上分？')
    } else if (type === -9) {
        state.itemData = { ...row }
        state.remarkPopupShow = true
        return
    } else if (row.status == -9 && type === 3) {
        confirmText = $t('是否恢复？')
    }
    ElMessageBox.confirm(confirmText, $t('提示'), {
        type: 'warning'
    }).then(() => {
        globalVBus.$emit('globalLoading', true)
        postTransferReviewData({
            id: row.id,
            status: type,
            merchantId: row.merchant.id
        }).then(() => {
            fetchData({ key: 'cut' })
        }).catch(err => {
            globalVBus.$emit('globalLoading', false)
        })
    }).catch(() => { });
}

const handleDetails = (row) => {
    state.itemData = { ...row }
    state.orderDetailShow = true
}


// 获取支付方式配置
const getPayScopeData = () => {
    globalVBus.$emit('globalLoading', true)
    getBankOfflineWallet().then(res => {
        globalVBus.$emit('globalLoading', false)
        state.payScopeData = res.data || {}
        if (state.payScopeData.value) {
            state.payScopeList = JSON.parse(state.payScopeData.value)
        }
    }).catch(err => {
        state.payScopeData = []
        globalVBus.$emit('globalLoading', false)
    })
}

</script>

<style lang="scss">
.transfer-accounts-audit {
}
</style>
