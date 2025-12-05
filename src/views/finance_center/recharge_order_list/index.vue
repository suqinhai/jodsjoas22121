<template>
    <!-- 财务中心-充值订单列表 -->
    <div class="container recharge-order-list" v-if="state.tableConfigData.checked.length">
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
                <el-input v-model="state.formData.empUsername" :placeholder="$t('请输入')" clearable/>
            </el-form-item>
            <el-form-item :label="$t('收款账号:')">
                <el-input v-model="state.formData.toAccount" :placeholder="$t('请输入收款账号')" />
            </el-form-item>
            <el-form-item :label="$t('订单状态:')">
                <el-select class="select-box" v-model="state.formData.status" clearable :placeholder="$t('订单状态')">
                    <el-option v-for="item in metaData.rechargeStatus" :key="item.value" :label="item.label" :value="+item.value" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('支付通道:')">
                <el-select class="select-box" v-model="state.formData.channel" clearable filterable :placeholder="$t('支付通道')">
                    <el-option v-for="item in userData.merchantPayConfig" :key="item.value" :label="item.label" :value="item.value" />
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
            <el-form-item v-permiss="'merchant.user-recharge.create'">
                <el-button v-throttle type="primary" @click="state.createOrderShow = true">{{$t('创建在线订单')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData({key: 'export'})">{{$t('导出表格')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table v-if="!state.isRefresh" class="table-box" ref="tableRef" :data="state.tableData" border cell-class-name="pr"
            :row-class-name="({row}) => (row.isTotal ? 'total-row' : '')" @sort-change="sortChange">
            <el-table-column v-for="(item,index) in state.tableConfigData.checked" :key="index" :prop="item" :label="getLabel(item)"
                :min-width="['orderNo','tradeNo'].includes(item) ? 240 : ['addTime','updateTime','channelSuccessRate','fromAccount','toAccount','agentUsername'].includes(item) ? 160 : 120"
                :sortable="sortKey.includes(item) ? 'custom' : false" align="center">
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
                    <span v-else-if="item === 'rate'">
                        {{row.rate ? `1:${row.rate}` : ''}}
                    </span>
                    <span v-else-if="item === 'status'">
                        {{row.status_ || ''}}
                    </span>
                    <span v-else-if="item === 'level'">
                        {{row.level_ || ''}}
                    </span>
                    <span v-else-if="item === 'channel'">
                        {{row.channel_ || ''}}
                    </span>
                    <span v-else-if="item === 'empName'">
                        {{row.emp?.name || ''}}
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
            <el-table-column prop="username" :label="$t('上级代理账号')" min-width="160" align="center">
                <template #default="{ row }">
                    <span class="special pointer"
                        @click="showMemberDetail({userId: row.agentUser?.id, merchant: row.merchant})">{{row.agentUser?.name || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="addTime" :label="$t('创建时间')" min-width="160" align="center" />
            <el-table-column prop="updateTime" :label="$t('成功时间')" min-width="160" align="center" />
            <el-table-column :label="$t('VIP等级')" min-width="100" align="center">
                <template #default="{ row }">
                    {{row.id ? 'VIP' + row.level : ''}}
                </template>
            </el-table-column>
            <el-table-column prop="layerName" :label="$t('会员层级')" min-width="120" align="center" />
            <el-table-column prop="payCode" :label="$t('支付方式')" min-width="145" align="center" />
            <el-table-column prop="channel_" :label="$t('支付通道')" min-width="145" align="center" />
            <el-table-column prop="currency" :label="$t('充值币种')" min-width="120" align="center" />
            <el-table-column prop="rate" :label="$t('汇率')" min-width="120" align="center">
                <template #default="{ row }">
                    {{row.rate ? `1:${row.rate}` : ''}}
                </template>
            </el-table-column>
            <el-table-column sortable="custom" prop="localAmount" :label="$t('充值本地币')" min-width="120" align="center" />
            <el-table-column prop="channelSuccessRate" :label="$t('通道目前成功率') + '(%)'" min-width="145" align="center" />
            <el-table-column prop="amount" :label="$t('订单金额')" min-width="145" align="center" />
            <el-table-column prop="giftAmount" :label="$t('赠送金额')" min-width="120" align="center" />
            <el-table-column prop="totalAmount" :label="$t('总金额')" min-width="120" align="center" />
            <el-table-column prop="remark" :label="$t('备注')" min-width="120" align="center" />
            <el-table-column prop="toAccount" :label="$t('收款钱包地址')" min-width="220" align="center" />
            <el-table-column prop="fromAccount" :label="$t('打款钱包地址')" min-width="220" align="center" />
            <el-table-column prop="tradeNo" :label="$t('流水号')" min-width="220" align="center" />
            <el-table-column prop="statusStr" :label="$t('订单状态')" min-width="120" align="center" />
            <el-table-column prop="emp.name" :label="$t('操作人')" min-width="100" align="center" /> -->
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
                    <el-button v-throttle type="primary" text v-if="row.canSupply && userData.isHasPermiss('merchant.recharge-log.sync')"
                        @click="handleOperateOrder(row,0)">{{$t('补单')}}</el-button>
                    <el-button v-throttle type="primary" text v-if="row.canForce && userData.isHasPermiss('merchant.recharge-log.sync')"
                        @click="handleOperateOrder(row,1)">{{$t('强制入款')}}</el-button>
                    <el-button v-permiss="'merchant.recharge-log.view'" v-if="row.id" v-throttle type="primary" text @click="handleDetail(row)">
                        {{$t('详情')}}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData({key:'cut'})"></Pagination>

        <AdvancedSearch v-if="state.advancedSearchShow" v-model:initData="state.advancedSearchData" :metaData="state.metaData" @fetchData="fetchData"
            @close="state.advancedSearchShow = false">
        </AdvancedSearch>
        <OrderDetail v-if="state.orderDetailShow" :orderData="state.itemData" @close="state.orderDetailShow = false">
        </OrderDetail>
        <CreateOrder v-if="state.createOrderShow" @close="state.createOrderShow = false" @fetchData="fetchData">
        </CreateOrder>
        <RepairSingle :orderData="state.itemData" v-if="state.repairSingleShow" @close="state.repairSingleShow = false" @fetchData="fetchData">
        </RepairSingle>
        <TableHeaderConfig v-if="state.tableHeadConfigShow" :menuId="state.menuId" :type="1" :tableHeaderTitle="metaData.rechargeTitle"
            :disabledCancelKey="disabledCancelKey" :disabledSortKey="['orderNo']" :tableConfigData="state.tableConfigData"
            @refreshConfig="refreshConfig" @close="state.tableHeadConfigShow = false">
        </TableHeaderConfig>
        <MemberDetail v-if="state.memberDetailShow" :merchantId="state.merchantId" @close="state.memberDetailShow = false"></MemberDetail>
    </div>
</template>

<script setup name="rechargeOrderList">
import { ref, reactive, onMounted, defineAsyncComponent, onActivated, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import userStore from '@/store/user'
import commonStore from '@/store/common'
import { getRechargeLogList, getRechargeLogData, postOperateOrder } from '@/api/finance'
import { dateFormat, getShortcuts, getDefaultTime, disabledCurrentDateAfter } from '@/common/util'
import { getCommonMeta, getLevelConfig, getUserGradeData, getTableHeaderConfig } from '@/api/common'
const OrderDetail = defineAsyncComponent(() => import('./components/OrderDetail.vue'))
const AdvancedSearch = defineAsyncComponent(() => import('./components/AdvancedSearch.vue'))
const CreateOrder = defineAsyncComponent(() => import('./components/CreateOrder.vue'))
const RepairSingle = defineAsyncComponent(() => import('./components/RepairSingle.vue'))

const disabledCancelKey = ['merchantId', 'userId', 'totalAmount', 'status', 'username', 'merchantName', 'localAmount', 'addTime']
const sortKey = ['localAmount']
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
    advancedSearchShow: false,
    orderDetailShow: false,
    createOrderShow: false,
    repairSingleShow: false,
    memberDetailShow: false,
    merchantId: '',
    itemData: {},
    advancedSearchData: {},
    isFirst: '',
    userId: '',
    username: '',
    successTime: '',
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
    rechargeStatus: [],
    // userLevel: [],
    // autoLevel: [],
    payChannel: [],
    rechargeTitle: [],
})
const tableRef = ref(null)
const route = useRoute()
const userData = userStore()
const commonData = commonStore()

onMounted(async () => {
    userData.menuList.forEach(item => {
        if (item.children && item.children.length) {
            item.children.forEach(its => {
                if (its.path === route.path) state.menuId = its.id
            })
        }
    })
    await getCommonMeta({ types: 'rechargeStatus,payChannel,rechargeTitle' }).then(res => {
        metaData = Object.assign(metaData, res.data || {})
        metaData.rechargeTitle = metaData.rechargeTitle.filter(item => !['bankName', 'fromName', 'toName', 'frontRemark', 'backRemark', 'transferVoucher'].includes(item.value))
    })
    let { data } = await getTableHeaderConfig({ menuId: state.menuId, type: 1 })
    if (data) state.tableConfigData = Object.assign(state.tableConfigData, JSON.parse(data))
    state.tableConfigData.checked = state.tableConfigData.checked.filter(item => metaData.rechargeTitle.some(its => its.value === item))
    state.tableConfigData.all = state.tableConfigData.all.filter(item => metaData.rechargeTitle.some(its => its.value === item))
    nextTick(() => {
        getData()
        // if (commonData.merchantSiteList.length < 2) getMemberConfigData()
    })
})

onActivated(() => {
    if (state.isInit) return state.isInit = false
    const { query = {} } = route
    if (state.userId !== query.userId || state.username !== query.username || state.successTime !== query.successTime || state.isFirst !== query.isFirst ||
        ((state.jumpTime.length && (state.jumpTime[0] !== query.startTime || state.jumpTime[1] !== query.endTime)) || (!state.jumpTime.length && query.startTime))) {
        tableRef.value && tableRef.value.clearSort()
        getData()
    }
})

const getData = () => {
    const { query = {} } = route
    state.userId = query.userId
    state.username = query.username
    state.isFirst = query.isFirst
    state.successTime = query.successTime
    state.jumpTime = query.startTime ? [query.startTime, query.endTime] : []
    let obj = {}
    obj.key = 'search'
    state.formData = {
        merchantId: commonData.merchantSiteList.length > 1 ? !query || !Object.keys(query).length ? 0 : commonData.currentMerchantSite.id : '',
        userId: state.userId,
        username: state.username,
        successTime: state.successTime ? [state.successTime + ' 00:00:00', state.successTime + ' 23:59:59'] :
            state.jumpTime.length ? [state.jumpTime[0], state.jumpTime[1]] : [],
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
        case 'advancedSearch':
            listQuery._page = 1
            delete data.key
            params = { ...data, ...listQuery }
            break;
        case 'cut':
            params = { ...searchData, ...listQuery }
            break;
        case 'export':
            params = { ...searchData, ...listQuery }
            params.isExport = true
            break;
        default:
            listQuery._page = 1
            listQuery._size = 10
            state.formData = {
                merchantId: commonData.merchantSiteList.length > 1 ? !route.query || !Object.keys(route.query).length ? 0 : commonData.currentMerchantSite.id : '',
                userId: state.userId,
                username: state.username,
                successTime: state.successTime ? [state.successTime + ' 00:00:00', state.successTime + ' 23:59:59'] :
                    state.jumpTime.length ? [state.jumpTime[0], state.jumpTime[1]] : [],
                atFirst: !!state.isFirst,
                status: state.isFirst ? 9 : ''
            }
            params = { ...listQuery, ...state.formData }
            params.atFirst = params.atFirst ? 1 : ''
            if (params.successTime && params.successTime.length) {
                params['accountBeginTime'] = params.successTime[0]
                params['accountEndTime'] = params.successTime[1]
            }
            delete params.successTime
            tableRef.value.clearSort()
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
    getRechargeLogList(params).then(res => {
        if (!params.isExport) {
            state.tableData = []
            let { total, list } = res.data
            state.tableData = list.map(item => {
                item.addTime && (item.addTime = dateFormat(item.addTime))
                item.updateTime && (item.updateTime = dateFormat(item.updateTime))
                item.statusStr = metaData.rechargeStatus.filter(its => its.value == item.status)[0]?.label || ''
                // item.level = metaData.userLevel.filter(its => its.value == item.level)[0].label || ''
                return item
            })
            if (res.ext && res.ext.totalAmount && state.tableData.length) {
                state.tableData.unshift({ localAmount: res.ext.totalAmount, orderNo: $t('当前条件下总计'), isTotal: true })
            }
            state.total = total
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        if (!params.isExport) state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

const sortChange = ({ order }) => {
    delete state.searchData.isExport
    delete state.searchData.querySort
    delete state.formData.querySort
    if (order === 'descending') {
        state.searchData.querySort = 0
        state.formData.querySort = 0
    } else if (order === 'ascending') {
        state.searchData.querySort = 1
        state.formData.querySort = 1
    }
    getTableData(state.searchData)
}

const refreshConfig = async () => {
    try {
        globalVBus.$emit('globalLoading', true)
        let { data } = await getTableHeaderConfig({ menuId: state.menuId, type: 1 })
        state.isRefresh = true
        if (data) state.tableConfigData = Object.assign(state.tableConfigData, JSON.parse(data))
        state.tableConfigData.checked = state.tableConfigData.checked.filter(item => metaData.rechargeTitle.some(its => its.value === item))
        state.tableConfigData.all = state.tableConfigData.all.filter(item => metaData.rechargeTitle.some(its => its.value === item))
        setTimeout(() => {
            state.isRefresh = false
            nextTick(() => {
                tableRef.value.clearSort()
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
    // delete state.searchData.autoLayerIds
    // delete state.searchData.fixedLayerIds
    // state.layerValue = []
    if (val) {
        metaData.userLevel = []
        // metaData.autoLevel = []
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
    // getLevelConfig({ merchantId }).then(({ data }) => {
    //     if (data) {
    //         metaData.autoLevel = data
    //     }
    // })
}

// 查看会员详情
const showMemberDetail = ({ userId, merchant }) => {
    commonData.memberId = userId
    state.merchantId = merchant.id
    state.memberDetailShow = true
}

// 补单
const handleOperateOrder = (row, type) => {
    if (!type && row.channel === 1) {
        state.itemData = { ...row }
        state.repairSingleShow = true
    } else {
        ElMessageBox.confirm(`${$t('确定对此订单操作')}${!type ? $t('补单') : $t('强制入款')}${$t('吗！')}`, $t('提示'), {
            type: 'warning'
        }).then(() => {
            globalVBus.$emit('globalLoading', true)
            postOperateOrder({
                id: row.id,
                force: !!type,
                merchantId: row.merchant.id
            }).then(() => {
                fetchData({ key: 'cut' })
            }).catch(err => {
                globalVBus.$emit('globalLoading', false)
            })
        }).catch(() => { })
    }
}

// 详情
const handleDetail = ({ id, merchant }) => {
    globalVBus.$emit('globalLoading', true)
    getRechargeLogData({ id, merchantId: merchant.id }).then(res => {
        state.itemData = res.data
        state.itemData.addTime && (state.itemData.addTime = dateFormat(state.itemData.addTime))
        state.itemData.updateTime && (state.itemData.updateTime = dateFormat(state.itemData.updateTime))
        globalVBus.$emit('globalLoading', false)
        state.orderDetailShow = true
    }).catch(err => {
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss">
.recharge-order-list {
}
</style>
