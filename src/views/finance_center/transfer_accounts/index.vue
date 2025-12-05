<template>
    <!-- 财务中心-转账提现列表 -->
    <div class="container transfer-accounts" v-if="state.tableConfigData.checked.length">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item :label="$t('申请时间:')">
                <el-date-picker v-model="state.formData.createTime" type="datetimerange" value-format="YYYY-MM-DD HH:mm:ss"
                    :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" />
            </el-form-item>
            <el-form-item :label="$t('操作时间:')">
                <el-date-picker v-model="state.formData.successTime" type="daterange" value-format="YYYY-MM-DD" :start-placeholder="$t('开始时间')"
                    :end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" />
            </el-form-item>
            <el-form-item :label="$t('会员账号:')">
                <el-input v-model="state.formData.username" :placeholder="$t('请输入会员会员账号')" />
            </el-form-item>
            <el-form-item :label="$t('订单号:')">
                <el-input v-model="state.formData.orderNo" :placeholder="$t('请输入订单号')" clearable style="width: 280px" />
            </el-form-item>
            <el-form-item :label="$t('操作人:')">
                <el-input v-model="state.formData.empUsername" :placeholder="$t('请输入')" clearable />
            </el-form-item>
            <el-form-item :label="$t('收款人账号:')" :label-width="$locale == 'zh' ? '92px' : 'auto'">
                <el-input v-model="state.formData.account" :placeholder="$t('请输入收款人账号')" />
            </el-form-item>
            <el-form-item :label="$t('收款人姓名:')" :label-width="$locale == 'zh' ? '92px' : 'auto'">
                <el-input v-model="state.formData.accountName" :placeholder="$t('请输入收款人姓名')" />
            </el-form-item>
            <el-form-item :label="$t('订单状态:')">
                <el-select class="select-box" clearable v-model="state.formData.status" :placeholder="$t('订单状态')">
                    <el-option v-for="item in metaData.cashStatus" :key="item.value" :label="item.label" :value="Number(item.value)" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('站点:')" v-if="commonData.merchantSiteList.length > 1">
                <MerchantSiteSelect isShowAll isNeedDefault :clearable="false" v-model="state.formData.merchantId">
                </MerchantSiteSelect>
            </el-form-item>
            <el-form-item>
                <el-checkbox v-model="state.formData.atFirst" :label="$t('只查首次提现')" />
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData({key: 'search'})">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData({})">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" v-if="!userData.userInfo.limitExport" @click="fetchData({key:'export'})">{{$t('导出表格')}}
                </el-button>
            </el-form-item>
            <el-form-item v-if="reviewPermiss && !userData.userInfo.batchCashLimit">
                <el-dropdown @command="handleBatch">
                    <el-button v-throttle type="primary">{{$t('批量操作')}}<el-icon class="el-icon--right">
                            <arrow-down />
                        </el-icon>
                    </el-button>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item v-for="(item,index) in batchTypeData" :key="index" :command="index">
                                {{$t('批量') + item.label}}
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </el-form-item>
        </el-form>
        <el-table v-if="!state.isRefresh" ref="tableRef" class="table-box" :data="state.tableData" border cell-class-name="pr"
            @selection-change="handleSelectionChange">
            <el-table-column v-if="reviewPermiss" fixed="left" type="selection" :selectable="(row) => row.canReview" width="55" />
            <el-table-column v-for="(item,index) in state.tableConfigData.checked" :key="index" :prop="item" :label="getLabel(item)"
                :min-width="['orderNo'].includes(item) ? 240 : ['addTime','updateTime'].includes(item) ? 160 : 120" align="center">
                <template #header>
                    <template v-if="item === 'username'">
                        <div>{{$t('会员账号')}}</div>
                        <div>{{$t('(是否首提)')}}</div>
                    </template>
                    <template v-else-if="item === 'diffAmount'">
                        <div>{{$t('充/提次数')}}</div>
                        <div>{{ userData.merchantInfo.country === 'UZ' ? $t('(充提差USDT)') : $t('(充提差本地币)') }}</div>
                        <div>{{$t('重复IP人数')}}</div>
                    </template>
                    <span v-else>
                        {{getLabel(item)}}
                    </span>
                </template>
                <template #default="{ row }">
                    <span v-if="['merchantId','merchantName'].includes(item)">
                        {{ item === 'merchantId' ? row.merchant?.id : row.merchant?.name }}
                    </span>
                    <template v-else-if="item === 'userId'">
                        <span class="special pointer" @click="showMemberDetail(row)">
                            {{ row.user?.id || '' }}
                        </span>
                        <!-- <div class="tag-box" v-if="!row.isTotal">
                            <span class="tag-box-name"
                                style="backgroundColor: aqua;padding: 0 15px">{{ row.cashNum > 2 ? 'n' : row.cashNum || 0 }}</span>
                        </div> -->
                    </template>
                    <template v-else-if="item === 'userName'">
                        <span class="special pointer" @click="showMemberDetail(row)">{{row.user?.name || ''}}</span>
                        <div class="tag-box" v-if="row.isBlogger">
                            <span class="tag-box-name" :style="{'backgroundColor': 'rgba(128, 255, 255, 1)'}">{{ $t('博主') }}</span>
                        </div>
                        <!-- <div v-if="row.atFirst">{{$t('首次提现')}}</div> -->
                    </template>
                    <template v-else-if="item === 'level'">
                        {{row.level_ || ''}}
                    </template>
                    <template v-else-if="item === 'diffAmount'">
                        <div>{{row.rechargeNum || 0}}/{{row.cashNum || 0}}</div>
                        <div>{{row.diffAmount || 0}}</div>
                        <div v-if="row.ipNums">{{row.ipNums}}
                        </div>
                        <div v-else>0</div>
                    </template>
                    <template v-else-if="item === 'offlineStatus'">
                        <div v-if="row.status === 9" style="color: #1a75ff">{{row.offlineStatus_}}</div>
                        <div v-else-if="row.status === -99" style="color: #F94D64">{{row.offlineStatus_}}</div>
                        <div v-else style="color: orange">{{row.offlineStatus_}}</div>
                    </template>
                    <template v-else-if="item === 'bankAccount'">
                        {{row.bankAccount}}
                        <el-button v-if="row.bankAccount" v-throttle link type="primary" @click="copyText(row.bankAccount)">{{$t('复制')}}</el-button>
                    </template>
                    <span v-else-if="item === 'empName'">
                        {{row.emp?.name || ''}}
                    </span>
                    <span v-else>
                        {{ row[item] }}
                    </span>
                </template>
            </el-table-column>
            <!-- <el-table-column prop="orderNo" :label="$t('订单号')" min-width="240" align="center" />
            <el-table-column min-width="140" align="center">
                <template #header>
                    <div>{{$t('会员账号')}}</div>
                    <div>{{$t('(是否首提)')}}</div>
                </template>
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row)">{{row.user?.name || ''}}</span>
                    <div class="tag-box" v-if="row.isBlogger">
                        <span class="tag-box-name" :style="{'backgroundColor': 'rgba(128, 255, 255, 1)'}">{{ $t('博主') }}</span>
                    </div>
                    <div v-if="row.atFirst">{{$t('首次提现')}}</div>
                </template>
            </el-table-column>
            <el-table-column min-width="160" align="center">
                <template #header>
                    <div>{{$t('申请时间')}}</div>
                    <div>{{$t('(操作时间)')}}</div>
                </template>
                <template #default="{ row }">
                    <div>{{row.addTime}}</div>
                    <div>{{row.updateTime}}</div>
                </template>
            </el-table-column>
            <el-table-column prop="localAmount" :label="$t('提现本地币')" min-width="160" align="center" />
            <el-table-column prop="bankCode" :label="$t('提现方式')" min-width="140" align="center" />
            <el-table-column prop="amount" :label="$t('预计到账')" min-width="165" align="center" />
            <el-table-column min-width="160" align="center">
                <template #header>
                    <div>{{$t('充/提次数')}}</div>
                    <div>{{$t('(充提差本地币)')}}</div>
                    <div>{{$t('重复IP人数')}}</div>
                </template>
                <template #default="{ row }">
                    <div>{{row.rechargeNum || 0}}/{{row.cashNum || 0}}</div>
                    <div>{{row.diffAmount || 0}}</div>
                    <div v-if="row.ipNums">{{row.ipNums}}
                    </div>
                    <div v-else>0</div>
                </template>
            </el-table-column>
            <el-table-column prop="realName" :label="$t('收款人姓名')" min-width="165" align="center" />
            <el-table-column min-width="160" align="center">
                <template #header>
                    <div>{{$t('订单状态')}}</div>
                </template>
                <template #default="{ row }">
                    <div v-if="row.status === 9" style="color: #1a75ff">{{row.offlineStatus_}}</div>
                    <div v-else-if="row.status === -99" style="color: #F94D64">{{row.offlineStatus_}}</div>
                    <div v-else style="color: orange">{{row.offlineStatus_}}</div>
                </template>
            </el-table-column>
            <el-table-column prop="reviewRemark" :label="$t('前端备注')" min-width="160" align="center" />
            <el-table-column :label="$t('收款人银行账号')" min-width="240" align="center">
                <template #default="{ row }">
                    {{row.account}}
                    <el-button v-if="row.account" v-throttle link type="primary" @click="copyText(row.account)">{{$t('复制')}}</el-button>
                </template>
            </el-table-column>
            <el-table-column prop="emp.name" :label="$t('操作人')" min-width="200" align="center" /> -->
            <el-table-column fixed="right" align="center" width="170">
                <template #header>
                    {{$t('操作')}}
                    <span class="operate-cell pointer" @click="state.tableHeadConfigShow = true">
                        <el-icon color="#409eff" :size="16">
                            <Setting />
                        </el-icon>
                    </span>
                </template>
                <template #default="{ row }">
                    <el-button v-throttle type="primary" v-if="row.canReview && lockPermiss" text @click="handleLock(row,0)">{{$t('解锁')}}
                    </el-button>
                    <el-button v-throttle type="primary" v-if="row.canLock && lockPermiss" text @click="handleLock(row,1)">{{$t('锁定')}}
                    </el-button>
                    <el-button v-throttle type="primary" v-if="row.canReview && reviewPermiss" text @click="handleAudit(row)">{{$t('审核')}}
                    </el-button>
                    <el-button v-throttle type="primary" text @click="handleDetails(row)">{{$t('订单详情')}}
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData({key:'cut'})"></Pagination>

        <TableHeaderConfig v-if="state.tableHeadConfigShow" :menuId="state.menuId" :type="4" :tableHeaderTitle="metaData.cashTitle"
            :disabledCancelKey="disabledCancelKey" :disabledSortKey="['orderNo']" :tableConfigData="state.tableConfigData"
            @refreshConfig="refreshConfig" @close="state.tableHeadConfigShow = false">
        </TableHeaderConfig>
        <OrderDetail v-if="state.orderDetailShow" :orderData="state.itemData" @close="state.orderDetailShow = false">
        </OrderDetail>
        <RemarkPopup v-if="state.auditPaymentShow" :orderData="state.itemData" :batchTypeData="batchTypeData" @fetchData="fetchData({key:'cut'})"
            @close="state.auditPaymentShow = false">
        </RemarkPopup>
        <MemberDetail v-if="state.memberDetailShow" :merchantId="state.merchantId" @close="state.memberDetailShow = false"></MemberDetail>
    </div>
</template>

<script setup name="transferAccounts">
import { ref, reactive, onMounted, defineAsyncComponent, computed, onActivated, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import userStore from '@/store/user'
import commonStore from '@/store/common'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOfflineList, postCashLogLockData } from '@/api/finance'
import { getCommonMeta, getLevelConfig, getUserGradeData, getTableHeaderConfig } from '@/api/common'
import { dateFormat, getShortcuts, disabledCurrentDateAfter, copyText } from '@/common/util'
const OrderDetail = defineAsyncComponent(() => import('./components/OrderDetail.vue'))
const RemarkPopup = defineAsyncComponent(() => import("./components/RemarkPopup.vue"))

let batchTypeData = [{ value: 1, label: $t('确认出款') }, { value: -1, label: $t('取消出款') }, { value: 0, label: $t('拒绝（不退回余额）') }]
const filterKey = ['activeAmount', 'currency', 'exchangeRate', 'realFee', 'realAmount', 'rechargeNum', 'cashNum', 'ipNums', 'rechargeSum', 'account', 'subtype', 'cpf', 'remark', 'channel', 'tradeNo', 'status', 'backRemark', 'frontRemark']
const disabledCancelKey = ['merchantId', 'userId', 'merchantName', 'offlineStatus', 'userName', 'addTime']
const shortcuts = getShortcuts()
const state = reactive({
    formData: {},
    searchData: {},
    tableData: [],
    tableListSelection: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    auditPaymentShow: false,
    orderDetailShow: false,
    showRelevanceDetail: false,
    memberDetailShow: false,
    isInit: false,
    merchantId: '',
    itemData: {},
    isFirst: '',
    userId: '',
    username: '',
    jumpTime: [],
    menuId: '',
    isRefresh: false,
    tableConfigData: {
        all: [],
        checked: [],
    },
    tableHeadConfigShow: false,
})
const route = useRoute()
const userData = userStore()
const commonData = commonStore()
let metaData = reactive({
    // userLevel: [],
    // autoLevel: [],
    payChannel: [],
    cashStatus: [{ value: 0, label: $t('待出款') }, { value: 1, label: $t('已出款') }, { value: 2, label: $t('取消出款') }, { value: 3, label: $t('拒绝') }],
    cashTitle: [],
})
const tableRef = ref(null)

const reviewPermiss = computed(() => {
    return userData.isHasPermiss('merchant.cash-log.reviewOffline')
})
const lockPermiss = computed(() => {
    return userData.isHasPermiss('merchant.cash-log.lock')
})

onMounted(async () => {
    userData.menuList.forEach(item => {
        if (item.children && item.children.length) {
            item.children.forEach(its => {
                if (its.path === route.path) state.menuId = its.id
            })
        }
    })
    await getCommonMeta({ types: 'payChannel,cashTitle' }).then(res => {
        metaData = Object.assign(metaData, res.data || {})
        metaData.cashTitle = metaData.cashTitle.filter(item => !filterKey.includes(item.value))
    })
    let { data } = await getTableHeaderConfig({ menuId: state.menuId, type: 4 })
    if (data) state.tableConfigData = Object.assign(state.tableConfigData, JSON.parse(data))
    state.tableConfigData.checked = state.tableConfigData.checked.filter(item => metaData.cashTitle.some(its => its.value === item))
    state.tableConfigData.all = state.tableConfigData.all.filter(item => metaData.cashTitle.some(its => its.value === item))
    nextTick(() => {
        getData()
        // if (commonData.merchantSiteList.length < 2) getMemberConfigData()
    })
    userData.postRemindingRead(4)
})

onActivated(() => {
    if (state.isInit) return state.isInit = false
    const { query = {} } = route
    if (state.userId !== query.userId || state.username !== query.username || state.isFirst !== query.isFirst ||
        ((state.jumpTime.length && (state.jumpTime[0] !== query.startTime || state.jumpTime[1] !== query.endTime)) || (!state.jumpTime.length && query.startTime))) {
        getData()
    }
    userData.postRemindingRead(4)
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
        createTime: state.jumpTime.length ? [state.jumpTime[0], state.jumpTime[1]] : [],
        atFirst: !!state.isFirst,
        status: state.isFirst ? 1 : ''
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
                params['interval.end'] = params.createTime[1]
            }
            if (params.successTime && params.successTime.length) {
                params['operateInterval.begin'] = params.successTime[0]
                params['operateInterval.end'] = params.successTime[1]
            }
            params.atFirst = params.atFirst ? 1 : ''
            delete params.successTime
            delete params.createTime
            break
        case 'cut':
            params = { ...searchData, ...listQuery }
            break
        case 'export':
            params = { ...searchData, ...listQuery }
            params.isExport = true
            break
        default:
            state.formData = {
                merchantId: commonData.merchantSiteList.length > 1 ? !route.query || !Object.keys(route.query).length ? 0 : commonData.currentMerchantSite.id : '',
                userId: state.userId,
                username: state.username,
                createTime: state.jumpTime.length ? [state.jumpTime[0], state.jumpTime[1]] : [],
                atFirst: !!state.isFirst,
                status: state.isFirst ? 1 : ''
            }
            params = { ...listQuery, ...state.formData }
            params.atFirst = params.atFirst ? 1 : ''
            if (params.createTime && params.createTime.length) {
                params['interval.begin'] = params.createTime[0]
                params['interval.end'] = params.createTime[1]
            }
            delete params.createTime
            break
    }
    if (key !== 'export') delete params.isExport
    delete params.key
    state.searchData = { ...params }
    getTableData(params)
}

// 获取表格数据
const getTableData = (params) => {
    if (!params.isExport) {
        reviewPermiss.value && tableRef.value && tableRef.value.clearSelection()
    }
    params.merchantId = state.formData.merchantId
    globalVBus.$emit('globalLoading', true)
    getOfflineList(params).then(res => {
        if (!params.isExport) {
            let { total, list } = res.data
            state.tableData = list.map(item => {
                item.addTime && (item.addTime = dateFormat(item.addTime))
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

const refreshConfig = async () => {
    try {
        globalVBus.$emit('globalLoading', true)
        let { data } = await getTableHeaderConfig({ menuId: state.menuId, type: 4 })
        state.isRefresh = true
        if (data) state.tableConfigData = Object.assign(state.tableConfigData, JSON.parse(data))
        state.tableConfigData.checked = state.tableConfigData.checked.filter(item => metaData.cashTitle.some(its => its.value === item))
        state.tableConfigData.all = state.tableConfigData.all.filter(item => metaData.cashTitle.some(its => its.value === item))
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
    return metaData.cashTitle.find(item => item.value === key)?.label || ''
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
// 表格勾选切换
const handleSelectionChange = (val) => {
    state.tableListSelection = val
}

// 查看会员详情
const showMemberDetail = ({ user, merchant }) => {
    commonData.memberId = user.id
    state.merchantId = merchant.id
    state.memberDetailShow = true
}

const handleBatch = (type) => {
    let { tableListSelection } = state
    if (!tableListSelection.length) {
        return ElMessage.warning($t('请至少选择一条数据再进行操作！'))
    }
    handleAudit({
        ids: tableListSelection.map(item => item.id).join(',')
    }, type)
}

const handleLock = (row, flag) => {
    ElMessageBox.confirm(`${!flag ? $t('是否解锁') : $t('是否锁定')}?`).then(() => {
        postCashLogLockData({ ids: row.id, flag }).then((res) => {
            fetchData({ key: 'cut' })
            done()
        })
    })
}

const handleAudit = (row, type) => {
    state.itemData = { ...row, type }
    state.auditPaymentShow = true
}

const handleDetails = (row) => {
    state.itemData = { ...row }
    state.orderDetailShow = true
}

</script>

<style lang="scss">
.transfer-accounts {
    .account-info {
        > div {
            text-align: left;
        }
    }
}
</style>
