<template>
    <!-- 所有会员 -->
    <div class="container all-member" v-if="state.tableConfigData.checked.length">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item>
                <el-select style="width: 130px" v-model="state.selectType" @change="state.inputValue = ''">
                    <el-option v-for="item in optionData" :key="item.type" :label="item.title" :value="item.type" />
                </el-select>
                <div>
                    <el-input @input="valueInput" v-model="state.inputValue" :placeholder="optionData[state.selectType -1].placeholder" />
                </div>
            </el-form-item>
            <el-form-item :label="$t('账号状态:')">
                <el-select clearable multiple collapse-tags v-model="state.formData.flagTab" :placeholder="$t('请选择账号状态')">
                    <el-option :label="$t('冻结')" :value="1" />
                    <el-option :label="$t('正常')" :value="2" />
                    <el-option :label="$t('禁止进入游戏')" :value="4" />
                    <el-option :label="$t('禁止提现')" :value="6" />
                    <el-option :label="$t('禁止优惠')" :value="8" />
                    <el-option :label="$t('大厅在线')" :value="90" />
                    <el-option :label="$t('游戏在线')" :value="91" />
                    <el-option :label="$t('踢下线并禁止进入游戏')" :value="12" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('站点:')" v-if="commonData.merchantSiteList.length > 1">
                <MerchantSiteSelect isShowAll isNeedDefault :clearable="false" v-model="state.formData.merchantId">
                </MerchantSiteSelect>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData({key: 'search'})">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <!-- <el-form-item>
                <el-button v-throttle @click="fetchData({})">{{$t('重 置')}}</el-button>
            </el-form-item> -->
            <el-form-item>
                <el-button v-throttle @click="() => {
                    const creditSwitch = state.formData.creditSwitch;
                    fetchData({});
                    state.formData.creditSwitch = creditSwitch;
                }">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="handleOperate({}, 'advancedSearchShow')">{{$t('高级搜索')}}</el-button>
            </el-form-item>
            <el-form-item v-permiss="'admin.user.add'">
                <el-button v-throttle type="primary" @click="handleOperate({}, 'addMemberShow')">{{$t('新增会员')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" v-if="!userData.userInfo.limitExport" @click="fetchData({key: 'export'})">{{$t('导出报表')}}
                </el-button>
            </el-form-item>
            <el-form-item v-if="isPermiss && (state.currentMerchantId || commonData.merchantSiteList.length < 2)">
                <el-dropdown @command="handleBatch">
                    <el-button v-throttle type="primary">{{$t('批量操作')}}<el-icon class="el-icon--right">
                            <arrow-down />
                        </el-icon>
                    </el-button>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item v-for="item in metaData.userHandleType" :key="item.value" :command="+item.value">
                                {{$t('批量')}}{{item.label}}
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </el-form-item>
        </el-form>
        <el-table v-if="!state.isRefresh" ref="tableRef" class="table-box" :data="state.tableData" border cell-class-name="pr"
            @selection-change="handleSelectionChange" @sort-change="sortChange">
            <el-table-column v-if="showSelection" fixed="left" type="selection"
                width="55" />
            <el-table-column v-for="(item,index) in state.tableConfigData.checked" :key="item" :prop="item" min-width="100"
                :sortable="sortKey.includes(item) && (state.currentMerchantId || commonData.merchantSiteList.length < 2) ? 'custom' : false"
                align="center">
                <template #header>
                    <el-tooltip v-if="item === 'activeAmount'" effect="dark" placement="top"
                        :content="$t('会员余额带进游戏后显示为0，不展示游戏中的余额，展示的余额包含冻结中的；如果在游戏中，增加金额（如后台增加）则显示增加额度。')">
                        <el-icon class="pointer" :size="15">
                            <QuestionFilled />
                        </el-icon>
                    </el-tooltip>
                    <el-tooltip  v-if="item === 'status_'" placement="right" popper-class="tooltip-max-width">
                        <template #content>
                            <div>{{ $t('状态说明：会员操作、层级操作、刷子监控操作、会员黑名单操作，用户账号状态为统一，不分开。') }}</div>
                            <div>{{ $t('1.会员可同时存在多个状态（会员操作、层级操作、会员黑名单、刷子监控的状态合并到一起显示）；') }}</div>
                            <div>{{ $t('2.操作恢复状态为正常，将恢复所有状态均为正常，且会员不受层级，刷子等影响，不可自动变更状态；') }}</div>
                            <div>{{ $t('3.操作冻结状态时，其他禁止状态均被移除，只保留冻结状态。') }}</div>
                            <div>{{ $t('4.踢下线并禁止进入游戏操作，只针对控制厂家（//）') }}</div>
                        </template>
                        <el-icon :size="15">
                            <QuestionFilled />
                        </el-icon>
                    </el-tooltip>
                    {{getLabel(item)}}
                </template>
                <template #default="{ row }">
                    <span v-if="['agentUserId','agentUsername'].includes(item)" class="special pointer"
                        @click="showMemberDetail(row.agentUserId,row.merchantId)">
                        {{ row[item] }}
                    </span>
                    <span v-else-if="item === 'id'" class="special pointer" @click="showMemberDetail(row.id,row.merchantId)">
                        {{ row.id }}
                    </span>
                    <template v-else-if="item === 'username'">
                        <span class="special pointer" @click="showMemberDetail(row.id,row.merchantId)">
                            {{ row.username }}
                        </span>
                        <div class="tag-box" v-if="row.userTag && row.userTag.length">
                            <span class="tag-box-name" v-if="row.userTag.length === 1"
                                :style="{'backgroundColor': row.userTag[0].color}">{{ row.userTag[0].name }}</span>
                            <el-dropdown placement="top" trigger="click" popper-class="tips-dropdown" v-if="row.userTag.length > 1">
                                <div class="pointer">
                                    <span class="tag-box-name"
                                        :style="{'backgroundColor': row.userTag[0].color}">{{ row.userTag[0].name.slice(0,8) + (row.userTag[0].name.length > 8 ? '...' : '')  }}</span>
                                    <span class="tag-box-name tag-box-num" v-if="row.userTag.length > 1">{{ row.userTag.length }}</span>
                                </div>
                                <template #dropdown>
                                    <div class="tag-box-main">
                                        <span class="small-box" v-for="item in row.userTag" :key="item.name"
                                            :style="{'backgroundColor': item.color}">{{ item.name }}</span>
                                    </div>
                                </template>
                            </el-dropdown>
                        </div>
                    </template>
                    <span v-else>
                        {{ row[item] }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column fixed="right" align="center" width="120">
                <template #header>
                    {{$t('操作')}}
                    <span class="operate-cell pointer" @click="state.tableHeadConfigShow = true">
                        <el-icon color="#409eff" :size="16">
                            <Setting />
                        </el-icon>
                    </span>
                </template>
                <template #default="{ row }">
                    <el-button v-throttle type="primary" text @click="showMemberDetail(row.id,row.merchantId)">{{$t('详情')}}</el-button>
                    <el-button v-permiss="'admin.user.batchHandle'" v-throttle type="primary" text @click="handleOperate(row, 'operateMemberShow')">
                        {{$t('操作')}}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            :isShowChecked="!!state.tableListSelection.length && isPermiss  && (state.currentMerchantId || commonData.merchantSiteList.length < 2)"
            :selectedNum="state.tableListSelection.length" @pagination="fetchData({key:'cut'})"></Pagination>

        <TableHeaderConfig v-if="state.tableHeadConfigShow" :menuId="state.menuId" :metaData="metaData" :tableConfigData="state.tableConfigData"
            @refreshConfig="refreshConfig" @close="state.tableHeadConfigShow = false">
        </TableHeaderConfig>
        <AdvancedSearch v-if="state.advancedSearchShow" :metaData="metaData" v-model:initData="state.advancedSearchData" @fetchData="fetchData"
            @close="state.advancedSearchShow = false">
        </AdvancedSearch>
        <AddMember v-if="state.addMemberShow" @close="state.addMemberShow = false" @fetchData="fetchData({key:'cut'})"></AddMember>
        <OperateMember v-if="state.operateMemberShow" :metaData="metaData" :itemData="state.itemData" @fetchData="fetchData({key:'cut'})"
            @close="state.operateMemberShow = false"></OperateMember>
        <EditMemberLevelDialog v-if="state.levelSetShow" @close="state.levelSetShow = false" @resetData="fetchData({key:'cut'})" :metaData="metaData"
            :tableListSelection="state.tableListSelection" :merchantId="state.currentMerchantId">
        </EditMemberLevelDialog>
        <BatchEditTagDialog v-if="state.editTagShow" :metaData="metaData" :itemData="state.itemData" @fetchData="fetchData({key:'cut'})"
            @close="state.editTagShow = false"></BatchEditTagDialog>
        <MemberDetail v-if="state.memberDetailShow" :merchantId="state.merchantId" @close="state.memberDetailShow = false"
            @resetData="fetchData({key:'cut'})"></MemberDetail>
    </div>
</template>

<script setup name="allMember">
import { ref, reactive, onMounted, defineAsyncComponent, onActivated, computed, nextTick, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import userStore from '@/store/user'
import commonStore from '@/store/common'
import { getMemberList, operateMemberConfig, getTableHeaderConfig } from '@/api/member'
import { getCommonMeta, getLevelConfig, getMemberTagItems, getUserGradeData } from '@/api/common'
import { dateFormat, getTimezone } from '@/common/util'
import { getHomeDeploy, postHomeDeploy } from '@/api/website'
const AddMember = defineAsyncComponent(() => import('./components/AddMember.vue'))
const AdvancedSearch = defineAsyncComponent(() => import('./components/AdvancedSearch.vue'))
const OperateMember = defineAsyncComponent(() => import('./components/OperateMember.vue'))
const EditMemberLevelDialog = defineAsyncComponent(() => import('./components/EditMemberLevelDialog.vue'))
const BatchEditTagDialog = defineAsyncComponent(() => import('./components/BatchEditTagDialog.vue'))
const TableHeaderConfig = defineAsyncComponent(() => import('./components/TableHeaderConfig.vue'))

const optionData = [
    { title: $t('会员账号'), type: 1, placeholder: $t('请输入会员账号'), key: 'accounts' },
    { title: $t('会员ID'), type: 2, placeholder: $t('请输入会员ID'), key: 'accounts' },
    { title: $t('电话号码'), type: 3, placeholder: $t('请输入电话号码'), key: 'accounts' },
    { title: $t('提现账号'), type: 4, placeholder: $t('请输入提现账号'), key: 'cashAccount' },
    { title: $t('上级代理账号'), type: 5, placeholder: $t('请输入上级代理账号'), key: 'agentUsername' },
    { title: $t('上级代理ID'), type: 6, placeholder: $t('请输入上级代理ID'), key: 'agentUserId' },
]
const keyData = {
    'activeAmount': 'real_balance',
    'level_': 'level',
    'rechargeSum': 'recharge_sum',
    'rechargeNum': 'recharge_num',
    'cashSum': 'cash_sum',
    'cashNum': 'cash_num',
    'rechargeCashMinus': 'diff_amount',
}
const sortKey = ['level_', 'activeAmount', 'rechargeSum', 'cashSum', 'rechargeNum', 'cashNum', 'rechargeCashMinus']
const state = reactive({
    selectType: 1,
    inputValue: '',
    currentMerchantId: '',
    merchantId: '',
    formData: {},
    searchData: {},
    tableData: [],
    tableListSelection: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    advancedSearchShow: false,
    addMemberShow: false,
    operateMemberShow: false,
    editTagShow: false,
    itemData: {},
    tableConfigData: {
        all: [],
        checked: [],
    },
    advancedSearchData: {},
    registerTime: '',
    firstRcTime: '',
    flagTab: '',
    jumpTime: [],
    levelSetShow: false,
    isInit: true,
    tableHeadConfigShow: false,
    menuId: '',
    isRefresh: false
})
const userData = userStore()
const commonData = commonStore()
const tableRef = ref(null)
const route = useRoute()
let metaData = reactive({
    fixedLevel: [],
    autoLevel: [],
    userLevel: [],
    client: [],
    userSource: [],
    userHandleType: [],
    memberTag: [],
    userTitle: [],
})

const showSelection = computed(() => isPermiss.value && (state.currentMerchantId || commonData.merchantSiteList.length < 2))
const isPermiss = computed(() => {
    return userData.isHasPermiss('admin.user.batchHandle')
})

getLevelConfig({ type: 0 }).then(res => {
    if (res.data) {
        res.data.forEach(item => item.type = 0)
        metaData.autoLevel = res.data
    }
})

getLevelConfig({ type: 1 }).then(res => {
    if (res.data) {
        res.data.forEach(item => item.type = 1)
        metaData.fixedLevel = res.data
    }
})

getMemberTagItems().then(res => {
    metaData.memberTag = res.data || []
})

getUserGradeData().then(({ data }) => {
    if (data) {
        for (let key in data) {
            metaData.userLevel.push({
                label: data[key],
                value: key,
            })
        }
    }
})

onMounted(async () => {
    try {
        userData.getUserInfoDetail()
        if (commonData.isManual) state.isInit = false
        globalVBus.$emit('globalLoading', true)
        let res = await getCommonMeta({ types: 'client,userSource,userHandleType,userTitle' })
        metaData = Object.assign(metaData, res.data || {})
        if (metaData.userHandleType.length) {
            metaData.userHandleType.forEach(item => {
                switch (item.value) {
                    case '1':
                        item.label += $t('（在游戏时修改状态，需退出游戏才可冻结）')
                        break
                    case '3':
                        item.label += $t('（不支持踢出厂家：BBGT、DB、MG、EVO、PG）')
                        break
                    case '4':
                        item.label += $t('（无法进游戏，其他操作不影响）')
                        break
                    case '6':
                        item.label += $t('（无法发起提现，其他操作不影响）')
                        break
                    case '8':
                        item.label += $t('（无法领取活动、任务、vip奖励，代理佣金）')
                        break
                }
            })
        }
        userData.menuList.forEach(item => {
            if (item.children && item.children.length) {
                item.children.forEach(its => {
                    if (its.path === route.path) state.menuId = its.id
                })
            }
        })
        let { data } = await getTableHeaderConfig({ menuId: state.menuId })
        if (data) state.tableConfigData = Object.assign(state.tableConfigData, JSON.parse(data))
        state.tableConfigData['all'] = metaData.userTitle.map((item)=> { return item.value })
        nextTick(() => { getData() })
    } catch (error) {
        globalVBus.$emit('globalLoading', false)
    }
})

onActivated(() => {
    userData.getUserInfoDetail()
    if (state.isInit) return state.isInit = false
    let { query = {} } = route
    if ((state.registerTime != query.registerTime) || (state.firstRcTime != query.firstRcTime) || (state.flagTab != query.flagTab) ||
        ((state.jumpTime.length && (state.jumpTime[0] !== query.startTime || state.jumpTime[1] !== query.endTime)) || (!state.jumpTime.length && query.startTime))) {
        tableRef.value && tableRef.value.clearSort()
        getData()
    }
})

const refreshConfig = async () => {
    try {
        globalVBus.$emit('globalLoading', true)
        let { data } = await getTableHeaderConfig({ menuId: state.menuId })
        state.isRefresh = true
        if (data) state.tableConfigData = Object.assign(state.tableConfigData, JSON.parse(data))
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

const getData = () => {
    let { query = {} } = route
    let obj = {}
    state.registerTime = query.registerTime
    state.firstRcTime = query.firstRcTime
    state.jumpTime = query.startTime ? [query.startTime, query.endTime] : []
    obj.key = 'advancedSearch'
    state.flagTab = query.flagTab
    if (query.flagTab) {
        obj.key = 'search'
        state.formData.flagTab = state.flagTab ? [+state.flagTab] : []
    } else {
        obj['addTime.begin'] = state.registerTime ? state.registerTime + ' 00:00:00' : state.jumpTime.length ? state.jumpTime[0] : ''
        obj['addTime.end'] = state.registerTime ? state.registerTime + ' 23:59:59' : state.jumpTime.length ? state.jumpTime[1] : ''
        obj['firstRechargeTime.begin'] = state.firstRcTime ? state.firstRcTime + ' 00:00:00' : state.jumpTime.length ? state.jumpTime[0] : ''
        obj['firstRechargeTime.end'] = state.firstRcTime ? state.firstRcTime + ' 23:59:59' : state.jumpTime.length ? state.jumpTime[1] : ''
        state.advancedSearchData = {
            registerTime: state.registerTime ? [state.registerTime + ' 00:00:00', state.registerTime + ' 23:59:59']
                : state.jumpTime.length ? [state.jumpTime[0], state.jumpTime[1]] : [],
            firstRechargeTime: state.firstRcTime ? [state.firstRcTime, state.firstRcTime] : [],
        }
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
            if (state.inputValue) {
                formData = {
                    merchantId: formData.merchantId,
                    flagTab: formData.flagTab
                }
                formData[optionData[state.selectType - 1].key] = state.inputValue
                if (state.selectType < 4) {
                    formData.type = state.selectType
                }
            }
            params = { ...formData, ...listQuery }
            if (params.flagTab) params.flagTab = params.flagTab.join(',')
            break;
        case 'advancedSearch':
            listQuery._page = 1
            params = { ...data, ...listQuery, merchantId: state.formData.merchantId }
            break;
        case 'cut':
            params = { ...searchData, ...listQuery }
            break;
        case 'export':
            params = { ...searchData, ...listQuery }
            params.export = getTimezone()
            break;
        default:
            listQuery._page = 1
            listQuery._size = 10
            state.formData = {
                merchantId: commonData.merchantSiteList.length > 1 ? 0 : ''
            }
            params = { ...listQuery, ...state.formData }
            state.inputValue = ''
            tableRef.value.clearSort()
            break;
    }
    if (key !== 'export') delete params.export
    delete params.key
    state.searchData = { ...params }
    getTableData(params)
}

// 获取表格数据
const getTableData = (params) => {
    if (!params.export) {
        isPermiss.value && tableRef.value && tableRef.value.clearSelection()
    }
    // if (!params.merchantId) delete params.merchantId
    globalVBus.$emit('globalLoading', true)
    getMemberList(params).then(res => {
        if (!params.export) {
            let { total, list } = res.data
            state.tableData = list.map(item => {
                item.addTime && (item.addTime = dateFormat(item.addTime))
                item.lastLoginTime && (item.lastLoginTime = dateFormat(item.lastLoginTime))
                item.userTag = item.userTag || []
                return item
            })
            state.total = total
            state.currentMerchantId = params.merchantId
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        if (!params.export) state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

// 表格勾选切换
const handleSelectionChange = (val) => {
    // state.tableListSelection = val
     if (state && typeof state === 'object') {
        nextTick(() => {
            state.tableListSelection = val || []
        })
    }
}


const sortChange = ({ order, prop }) => {
    delete state.formData.sort
    delete state.searchData.sort
    delete state.searchData.export
    if (order) {
        state.formData.sortField = keyData[prop]
        state.searchData.sortField = keyData[prop]
    }
    if (order === 'descending') {
        state.formData.sort = false
        state.searchData.sort = false
    } else if (order === 'ascending') {
        state.formData.sort = true
        state.searchData.sort = true
    }
    getTableData(state.searchData)
}

const valueInput = (val) => {
    if (state.selectType === 2) {
        state.inputValue = val.replace(/\D/g, '')
    }
}

onBeforeUnmount(() => {
    if (tableRef.value) {
        tableRef.value = null
    }
})

const getLabel = (key) => {
    return metaData.userTitle.find(item => item.value === key)?.label || ''
}

// 查看会员详情
const showMemberDetail = (userId, merchantId) => {
    commonData.memberId = userId
    state.merchantId = merchantId
    state.memberDetailShow = true
}

// 按钮操作
const handleOperate = (row, key) => {
    state.itemData = { ...row }
    state[key] = true
}

// 批量操作
const handleBatch = (type) => {
    let { tableListSelection } = state
    if (!tableListSelection.length) {
        return ElMessage.warning($t('请至少选择一条数据再进行操作！'))
    }
    if (type === 10) {
        state.levelSetShow = true
    } else {
        let obj = {
            type,
            ids: tableListSelection.map(item => item.id),
            merchantId: state.currentMerchantId
        }
        if (type === 11) {
            state.itemData = { ...obj }
            state.itemData.memberNum = tableListSelection.length
            state.editTagShow = true
            return
        }
        globalVBus.$emit('globalLoading', true)
        operateMemberConfig(obj).then(res => {
            fetchData({ key: 'cut' })
        }).catch(err => {
            globalVBus.$emit('globalLoading', false)
        })
    }
}
</script>

<style lang="scss">
.all-member {
    .operate-cell {
        margin-left: 6px;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        transform: translateY(3px);
    }
}
</style>
