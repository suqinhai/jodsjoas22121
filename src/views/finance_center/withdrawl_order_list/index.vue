<template>
    <!-- 财务中心-在线提现列表 -->
    <div class="container withdrawl-order-list" v-if="state.tableConfigData.checked.length">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item :label="$t('仅查询') + ':'">
                <template v-if="!state.isAutoRefresh">
                    <el-select style="width: 150px" v-model="state.recent" :placeholder="$t('时间类型')">
                        <el-option :label="$t('最近7天')" :value="1" />
                        <el-option :label="$t('自定义时间')" :value="0" />
                    </el-select>
                    <el-date-picker v-if="!state.recent" v-model="state.formData.createTime" type="datetimerange" value-format="YYYY-MM-DD HH:mm:ss"
                        :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter"
                        :shortcuts="shortcuts" />
                </template>
                <span v-else style="color: red">{{$t('自动刷新时，仅查询最近7天的数据')}}</span>
            </el-form-item>
            <el-form-item :label="$t('会员ID:')">
                <el-input @input="(val) => state.formData.userId = val.replace(/\D/g,'')" v-model="state.formData.userId"
                    :placeholder="$t('请输入会员ID')" />
            </el-form-item>
            <el-form-item :label="$t('会员账号')">
                <el-input v-model="state.formData.username" :placeholder="$t('请输入会员会员账号')" />
            </el-form-item>
            <el-form-item :label="$t('订单号:')">
                <el-input v-model="state.formData.orderNo" :placeholder="$t('请输入订单号')" clearable style="width: 280px" />
            </el-form-item>
            <el-form-item :label="$t('操作人:')">
                <el-input v-model="state.formData.empUsername" :placeholder="$t('请输入')" clearable />
            </el-form-item>
            <el-form-item :label="$t('收款人姓名:')" :label-width="$locale == 'zh' ? '92px' : 'auto'">
                <el-input v-model="state.formData.realName" :placeholder="$t('请输入收款人姓名')" />
            </el-form-item>
            <el-form-item :label="$t('支付通道:')">
                <el-select filterable clearable v-model="state.formData.channel" :placeholder="$t('支付通道')">
                    <!-- <el-option v-for="item in metaData.payChannel" :key="item.value" :label="item.label" :value="Number(item.value)" /> -->
                    <el-option v-for="item in userData.merchantPayConfig" :key="item.value" :label="item.label" :value="Number(item.value)" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('订单状态:')">
                <el-select clearable v-model="state.formData.status" :placeholder="$t('订单状态')">
                    <el-option v-for="item in metaData.cashStatus" :key="item.value" :label="item.label" :value="Number(item.value)" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('到账币种:')">
                <el-select clearable v-model="state.formData.currency" :placeholder="$t('到账币种')">
                    <el-option label="BRL" value="BRL" />
                    <el-option label="USD" value="USD" />
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
                <el-button v-throttle type="primary" @click="handleConfig({}, 'advancedSearchShow')">{{$t('高级搜索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-select style="width: 120px" v-model="state.isAutoRefresh" @change="typeChange">
                    <el-option :label="$t('不自动刷新')" :value="0" />
                    <el-option :label="$t('15s刷新')" :value="15000" />
                    <el-option :label="$t('30s刷新')" :value="30000" />
                    <el-option :label="$t('60s刷新')" :value="60000" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" v-if="!userData.userInfo.limitExport" @click="fetchData({key:'export'})">{{$t('导出表格')}}
                </el-button>
            </el-form-item>
            <el-form-item v-if="reviewPermiss && !userData.userInfo.batchCashLimit">
                <el-dropdown v-model="selectedBatchOperation" @command="handleBatch">
                    <el-button v-throttle type="primary">{{$t('批量操作')}}<el-icon class="el-icon--right">
                            <arrow-down />
                        </el-icon>
                    </el-button>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item v-for="(item,index) in batchTypeData" :key="index" :command="index">
                                {{item}}
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </el-form-item>
        </el-form>
        <el-table v-if="!state.isRefresh" ref="tableRef" class="table-box" :data="state.tableData" border cell-class-name="pr"
            @selection-change="handleSelectionChange" row-key="id" default-expand-all>
            <el-table-column fixed="left" type="selection" width="55" />
            <!-- <el-table-column v-if="reviewPermiss" fixed="left" type="selection" :selectable="(row) => row.canReview" width="55" /> -->
            <el-table-column v-for="(item,index) in state.tableConfigData.checked" :key="index" :prop="item"
                :min-width="['orderNo','tradeNo'].includes(item) ? 240 : ['addTime','updateTime','localAmount'].includes(item) ? 160 : item === 'realName' ? 180 : 120"
                align="center">
                <template #header>
                    <template v-if="item === 'currency'">
                        <div>{{$t('到账币种')}}</div>
                        <div>{{$t('（汇率）')}}</div>
                    </template>
                    <template v-else-if="item === 'amount'">
                        <div>{{$t('预计到账')}}</div>
                        <div>{{$t('（手续费）')}}</div>
                        <div>{{$t('（实际到账）')}}</div>
                    </template>
                    <template v-else-if="item === 'diffAmount'">
                        <div>{{$t('充/提次数')}}</div>
                        <div>{{$t('充提差额')}}</div>
                        <div>{{$t('重复IP人数')}}</div>
                    </template>
                    <span v-else>
                        {{getLabel(item)}}
                    </span>
                </template>
                <template #default="{ row }">
                    <template v-if="!row.isTotal && item === 'orderNo'">
                        <div class="tag-box tag-box-rgdd" v-if="row.backApply">
                            {{$t('人工订单')}}
                        </div>
                        {{row.orderNo}}
                    </template>
                    <span v-else-if="['merchantId','merchantName'].includes(item)">
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
                        <span class="special pointer" @click="showMemberDetail(row)">
                            {{ row.user?.name || '' }}
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
                    <template v-else-if="item === 'level'">
                        {{row.level_ || ''}}
                    </template>
                    <template v-else-if="item === 'currency'">
                        <div>{{row.currency}}</div>
                        <div v-if="row.exchangeRate">1:{{row.exchangeRate}}</div>
                    </template>
                    <template v-else-if="item === 'amount' && !row.isTotal">
                        <div>{{row.amount || 0}}</div>
                        <div>{{row.realFee || 0}}</div>
                        <div>{{row.realAmount || 0}}</div>
                    </template>
                    <template v-else-if="item === 'diffAmount' && !row.isTotal">
                        <div>{{row.rechargeNum || 0}}/{{row.cashNum || 0}}</div>
                        <div>{{row.diffAmount || 0}}</div>
                        <div class="special pointer" v-if="row.ipNums" @click="state.showRelevanceDetail = true,state.itemData = {...row}">
                            {{row.ipNums}}
                        </div>
                        <div v-else>0</div>
                    </template>
                    <div class="account-info" v-else-if="item === 'realName' && !row.isTotal">
                        <div>{{$t('姓名：')}}{{row.realName}}</div>
                        <div v-if="row.subtype">{{$t('类型：')}}{{row.subtype_ ? row.subtype_ : row.subtype}}</div>
                        <div v-if="row.account">{{$t('账号：')}}{{row.account}}</div>
                        <div v-if="row.cpf">CPF：{{row.cpf}}</div>
                        <div v-if="row.bankCode">IFSC：{{row.bankCode}}</div>
                    </div>
                    <template v-else-if="item === 'status' && !row.isTotal">
                        <div v-if="row.status === 9" style="color: #1a75ff">{{row.status_}}</div>
                        <div v-else-if="row.status === -99" style="color: #F94D64">{{row.status_}}</div>
                        <div v-else style="color: orange">{{row.status_}}</div>
                    </template>
                    <span v-else-if="item === 'empName'">
                        {{row.emp?.name || ''}}
                    </span>
                    <span v-else>
                        {{ row[item] }}
                    </span>
                </template>
            </el-table-column>
            <!-- <el-table-column prop="orderNo" :label="$t('订单号')" min-width="290" align="center" />
            <el-table-column prop="merchant.id" :label="$t('站点ID')" min-width="120" align="center" />
            <el-table-column prop="merchant.name" :label="$t('站点名称')" min-width="140" align="center" />
            <el-table-column :label="$t('会员ID')" min-width="120" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row)">{{row.user?.id || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('会员账号')" min-width="140" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row)">{{row.user?.name || ''}}</span>
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
            </el-table-column>
            <el-table-column prop="level_" :label="$t('会员等级')" min-width="160" align="center" />
            <el-table-column prop="userSource_" :label="$t('注册来源')" min-width="160" align="center" />
            <el-table-column min-width="160" align="center">
                <template #header>
                    <div>{{$t('申请时间')}}</div>
                    <div>{{$t('操作时间')}}</div>
                </template>
                <template #default="{ row }">
                    <div>{{row.addTime}}</div>
                    <div>{{row.updateTime}}</div>
                </template>
            </el-table-column>
            <el-table-column prop="activeAmount" :label="$t('当前余额')" min-width="140" align="center" />
            <el-table-column prop="rechargeSum" :label="$t('累计充值金额')" min-width="165" align="center" /> -->
            <!--            <el-table-column prop="activityAmount" :label="$t('活动金额')" min-width="140" align="center" /> -->
            <!-- <el-table-column prop="localAmount" :label="$t('提现本地币')" min-width="120" align="center" />
            <el-table-column min-width="160" align="center">
                <template #header>
                    <div>{{$t('到账币种')}}</div>
                    <div>{{$t('（汇率）')}}</div>
                </template>
                <template #default="{ row }">
                    <div>{{row.currency}}</div>
                    <div v-if="row.exchangeRate">1:{{row.exchangeRate}}</div>
                </template>
            </el-table-column>
            <el-table-column min-width="140" align="center">
                <template #header>
                    <div>{{$t('预计到账')}}</div>
                    <div>{{$t('（手续费）')}}</div>
                    <div>{{$t('（实际到账）')}}</div>
                </template>
                <template #default="{ row }">
                    <div>{{row.amount || 0}}</div>
                    <div>{{row.realFee || 0}}</div>
                    <div>{{row.realAmount || 0}}</div>
                </template>
            </el-table-column>
            <el-table-column min-width="260" align="center">
                <template #header>
                    <div>{{$t('充/提次数')}}</div>
                    <div>{{$t('充提差额')}}</div>
                    <div>{{$t('重复IP人数')}}</div>
                </template>
                <template #default="{ row }">
                    <div>{{row.rechargeNum || 0}}/{{row.cashNum || 0}}</div>
                    <div>{{row.diffAmount || 0}}</div>
                    <div class="special pointer" v-if="row.ipNums" @click="state.showRelevanceDetail = true,state.itemData = {...row}">{{row.ipNums}}
                    </div>
                    <div v-else>0</div>
                </template>
            </el-table-column>
            <el-table-column :label="$t('收款人')" min-width="180" align="center">
                <template #default="{ row }">
                    <div class="account-info">
                        <div>{{$t('姓名：')}}{{row.realName}}</div>
                        <div v-if="row.subtype">{{$t('类型：')}}{{row.subtype}}</div>
                        <div v-if="row.account">{{$t('账号：')}}{{row.account}}</div>
                        <div v-if="row.cpf">CPF：{{row.cpf}}</div>
                    </div>
                </template>
            </el-table-column>
            <el-table-column prop="status_" :label="$t('订单状态')" min-width="140" align="center">
                <template #default="{ row }">
                    <div v-if="row.status === 9" style="color: #409eff">{{row.status_}}</div>
                    <div v-else-if="row.status === -99" style="color: red">{{row.status_}}</div>
                    <div v-else style="color: orange">{{row.status_}}</div>
                </template>
            </el-table-column>
            <el-table-column prop="emp.name" :label="$t('操作人')" min-width="140" align="center" />
            <el-table-column prop="remark" :label="$t('备注')" min-width="160" align="center" />
            <el-table-column prop="reviewRemark" :label="$t('复审备注')" min-width="160" align="center" />
            <el-table-column prop="channel_" :label="$t('支付通道')" min-width="150" align="center" />
            <el-table-column prop="tradeNo" :label="$t('流水号')" min-width="200" align="center" /> -->
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
                    <template v-if="!row.children">
                        <template v-if="reviewPermiss">
                            <el-button v-throttle type="primary" v-if="row.canCancelLock" text @click="handleLock(row,0)">{{$t('解锁')}}
                            </el-button>
                            <el-button v-throttle type="primary" v-if="row.canLock" text @click="handleLock(row,1)">{{$t('锁定')}}
                            </el-button>
                            <el-button v-throttle type="primary" v-if="row.forceApply" text @click="postAgainOperate(row)">{{$t('重新出款')}}
                            </el-button>
                            <el-button v-throttle type="primary" v-if="row.forceApply" text @click="handleAudit(row,-1)">{{$t('强制出款')}}
                            </el-button>
                            <el-button v-throttle type="primary" v-if="row.canReview " text @click="handleAudit(row,0)">{{$t('复审')}}
                            </el-button>
                            <el-button v-throttle type="primary" text v-if="row.canReview " @click="handleAudit(row,1)">{{$t('拒绝')}}
                            </el-button>
                            <el-button v-throttle type="primary" text v-if="row.canClose" @click="handleAudit(row,2)">{{$t('强制关闭')}}
                            </el-button>
                            <el-button v-throttle type="primary" text v-if="row.canQueryOrder" @click="refreshOrderStatus(row)">
                                {{$t('三方状态查询')}}</el-button>
                            <el-button v-throttle type="primary" text v-if="row.canEditRemark"
                                @click="state.itemData = row;state.showRemarkPopup = true">
                                {{$t('备注')}}</el-button>
                        </template>
                        <el-button v-throttle type="primary" text @click="handleConfig(row,'orderDetailShow')">{{$t('详情')}}</el-button>
                    </template>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            :isShowChecked="!!state.tableListSelection.length && reviewPermiss" :selectedNum="state.tableListSelection.length"
            @pagination="fetchData({key:'cut'})"></Pagination>

        <AdvancedSearch v-if="state.advancedSearchShow" :merchantId="state.formData.merchantId" :metaData="metaData"
            v-model:initData="state.advancedSearchData" @fetchData="fetchData" @close="state.advancedSearchShow = false">
        </AdvancedSearch>
        <AuditPayment v-if="state.auditPaymentShow" :itemData="state.itemData" @close="state.auditPaymentShow = false"
            @fetchData="fetchData({key:'cut'})">
        </AuditPayment>
        <OrderDetail v-if="state.orderDetailShow" :orderData="state.itemData" @close="state.orderDetailShow = false">
        </OrderDetail>
        <RelevanceDetailDialog v-if="state.showRelevanceDetail" :loginIp="state.itemData.spyIds || []" :metaData="metaData"
            @close="state.showRelevanceDetail = false">
        </RelevanceDetailDialog>
        <TableHeaderConfig v-if="state.tableHeadConfigShow" :menuId="state.menuId" :type="3" :tableHeaderTitle="metaData.cashTitle"
            :disabledCancelKey="disabledCancelKey" :disabledSortKey="['orderNo']" :tableConfigData="state.tableConfigData"
            @refreshConfig="refreshConfig" @close="state.tableHeadConfigShow = false">
        </TableHeaderConfig>
        <MemberDetail v-if="state.memberDetailShow" :merchantId="state.merchantId" @close="state.memberDetailShow = false"></MemberDetail>
        <RemarkPopup v-if="state.showRemarkPopup" :orderData="state.itemData" @fetchData="fetchData" @close="state.showRemarkPopup = false">
        </RemarkPopup>
    </div>
</template>

<script setup name="withdrawlOrderList">
import { ref, reactive, onMounted, defineAsyncComponent, onActivated, onDeactivated, computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import userStore from '@/store/user'
import commonStore from '@/store/common'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCashLogList, getThirdpartyOrderStatus, postForceApply, postCashLogLockData } from '@/api/finance'
import { getCommonMeta, getUserGradeData, getTableHeaderConfig } from '@/api/common'
import { dateFormat, getShortcuts, getDefaultTime, disabledCurrentDateAfter } from '@/common/util'
const AdvancedSearch = defineAsyncComponent(() => import('./components/AdvancedSearch.vue'))
const AuditPayment = defineAsyncComponent(() => import('./components/AuditPayment.vue'))
const OrderDetail = defineAsyncComponent(() => import('./components/OrderDetail.vue'))
const RelevanceDetailDialog = defineAsyncComponent(() => import("./components/RelevanceDetailDialog.vue"))
const RemarkPopup = defineAsyncComponent(() => import("./components/RemarkPopup.vue"))

let batchTypeData = [$t('批量复审'), $t('批量拒绝'), $t('批量锁定'), $t('批量解锁')]
const filterKey = ['exchangeRate', 'realFee', 'realAmount', 'rechargeNum', 'cashNum', 'ipNums', 'subtype', 'account', 'cpf', 'bankAccount', 'frontRemark', 'backRemark', 'bankCode', 'offlineStatus']
const disabledCancelKey = ['merchantId', 'userId', 'status', 'userName', 'merchantName', 'addTime']
const shortcuts = getShortcuts()
const defaultTime = getDefaultTime()
const selectedBatchOperation = ref('')
const state = reactive({
    recent: 1,
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
    auditPaymentShow: false,
    orderDetailShow: false,
    showRelevanceDetail: false,
    memberDetailShow: false,
    showRemarkPopup: false,
    merchantId: '',
    itemData: {},
    advancedSearchData: {},
    timer: null,
    isAutoRefresh: 0,
    selfLocking: 0,
    isFirst: '',
    userId: '',
    username: '',
    createTime: '',
    jumpTime: [],
    pageVisibleListener: null,
    isInit: true,
    menuId: '',
    isRefresh: false,
    tableConfigData: {
        all: [],
        checked: [],
    },
    tableHeadConfigShow: false,
    isAdvancedSearch: false,
})
const route = useRoute()
const userData = userStore()
const commonData = commonStore()
let metaData = reactive({
    userLevel: [],
    // autoLevel: [],
    payChannel: [],
    cashStatus: [],
    botSpyPunish: [],
    botSpyType: [],
    cashTitle: [],
})
const tableRef = ref(null)

const reviewPermiss = computed(() => {
    return userData.isHasPermiss('merchant.cash-log.review')
})

onMounted(async () => {
    state.timer && clearInterval(state.timer)
    userData.menuList.forEach(item => {
        if (item.children && item.children.length) {
            item.children.forEach(its => {
                if (its.path === route.path) state.menuId = its.id
            })
        }
    })
    await getCommonMeta({ types: 'payChannel,cashStatus,botSpyPunish,botSpyType,cashTitle' }).then(res => {
        metaData = Object.assign(metaData, res.data || {})
        metaData.cashTitle = metaData.cashTitle.filter(item => !filterKey.includes(item.value))
    })
    let { data } = await getTableHeaderConfig({ menuId: state.menuId, type: 3 })
    if (data) state.tableConfigData = Object.assign(state.tableConfigData, JSON.parse(data))

    state.tableConfigData.checked = state.tableConfigData.checked.filter(item => metaData.cashTitle.some(its => its.value === item))
    state.tableConfigData.all = state.tableConfigData.all.filter(item => metaData.cashTitle.some(its => its.value === item))
    nextTick(() => {
        getData()
        // if (commonData.merchantSiteList.length < 2) getMemberConfigData()
        getMemberConfigData()
    })
    userData.postRemindingRead(2)
    userData.getUserInfoDetail()
    state.pageVisibleListener = document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible' && state.isAutoRefresh) {
            state.timer && clearInterval(state.timer)
            state.timer = setInterval(() => {
                fetchData({ key: 'cut' }, true)
            }, state.isAutoRefresh)
        } else if (document.visibilityState === 'hidden') {
            state.timer && clearInterval(state.timer)
            delete state.searchData.refresh
        }
    })
})

onActivated(() => {
    userData.postRemindingRead(2)
    userData.getUserInfoDetail()
    if (state.isInit) return state.isInit = false
    const { query = {} } = route
    if (state.createTime !== query.createTime || state.userId !== query.userId || state.username !== query.username || state.isFirst !== query.isFirst ||
        ((state.jumpTime.length && (state.jumpTime[0] !== query.startTime || state.jumpTime[1] !== query.endTime)) || (!state.jumpTime.length && query.startTime))) {
        getData()
        if (!state.timer && state.isAutoRefresh) {
            state.timer && clearInterval(state.timer)
            state.timer = setInterval(() => {
                fetchData({ key: 'cut' }, true)
            }, state.isAutoRefresh)
        }
    }
})

onDeactivated(() => {
    state.timer && clearInterval(state.timer)
    document.removeEventListener('visibilitychange', state.pageVisibleListener)
})

const getData = () => {
    const { query = {} } = route
    state.userId = query.userId
    state.username = query.username
    state.isFirst = query.isFirst
    state.createTime = query.createTime
    state.jumpTime = query.startTime ? [query.startTime, query.endTime] : []
    let obj = {}
    obj.key = 'search'
    state.formData = {
        merchantId: commonData.merchantSiteList.length > 1 ? !query || !Object.keys(query).length ? 0 : commonData.currentMerchantSite.id : '',
        userId: state.userId,
        username: state.username,
        createTime: state.createTime ? [state.createTime, state.createTime] :
            state.jumpTime.length ? [state.jumpTime[0], state.jumpTime[1]] : [],
        atFirst: !!state.isFirst,
        status: state.isFirst ? 9 : ''
    }
    fetchData(obj)
}

// 表格过滤数据处理
const fetchData = (data = {}, isAuto = false) => {
    let { key = '' } = data
    let params = {}
    let { formData, listQuery, searchData } = state
    switch (key) {
        case 'search':
            listQuery._page = 1
            params = { ...formData, ...listQuery, recent: state.recent }
            if (params.createTime && params.createTime.length && state.recent !== 1) {
                params['interval.begin'] = params.createTime[0]
                params['interval.end'] = params.createTime[1]
            }
            params.atFirst = params.atFirst ? 1 : ''
            delete params.createTime
            break;
        case 'advancedSearch':
            listQuery._page = 1
            delete data.key
            params = { ...data, ...listQuery }
            delete params.recent
            delete params.refresh
            state.isAdvancedSearch = true
            break;
        case 'cut':
            params = { ...searchData, ...listQuery, recent: state.recent }
            if (state.isAutoRefresh) {
                params.refresh = 1
                params.recent = isAuto && state.isAdvancedSearch ? 0 : 1
            }
            if (state.isAdvancedSearch && !isAuto) params.isAdvancedSearch = false
            break
        case 'export':
            params = { ...searchData, ...listQuery }
            delete params.recent
            delete params.refresh
            params.isExport = true
            break;
        default:
            listQuery._page = 1
            listQuery._size = 10
            state.formData = {
                merchantId: commonData.merchantSiteList.length > 1 ? !route.query || !Object.keys(route.query).length ? 0 : commonData.currentMerchantSite.id : '',
                userId: state.userId,
                username: state.username,
                createTime: state.createTime ? [state.createTime, state.createTime] :
                    state.jumpTime.length ? [state.jumpTime[0], state.jumpTime[1]] : [],
                atFirst: !!state.isFirst,
                status: state.isFirst ? 9 : ''
            }
            params = { ...listQuery, ...state.formData }
            params.atFirst = params.atFirst ? 1 : ''
            state.recent = state.createTime || state.jumpTime.length ? 0 : 1
            params.recent = state.recent
            if (params.createTime && params.createTime.length && state.recent !== 1) {
                params['interval.begin'] = params.createTime[0]
                params['interval.end'] = params.createTime[1]
            }
            delete params.createTime
            break;
    }
    if (key !== 'export') delete params.isExport
    if (!['advancedSearch', 'cut']) params.isAdvancedSearch = false
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
    getCashLogList(params).then(res => {
        if (!params.isExport) {
            let { total, list } = res.data
            state.tableData = list.map(item => {
                item.addTime && (item.addTime = dateFormat(item.addTime))
                item.updateTime && (item.updateTime = dateFormat(item.updateTime))
                return item
            })
            state.tableData.forEach(item => {
                item.children && item.children.forEach(v => {
                    v.addTime = dateFormat(v.addTime)
                    v.updateTime = dateFormat(v.updateTime)
                })
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
        let { data } = await getTableHeaderConfig({ menuId: state.menuId, type: 3 })
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
    // delete state.searchData.autoLayerIds
    // delete state.searchData.fixedLayerIds
    state.layerValue = []
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

// 按钮操作
const handleConfig = (row, key) => {
    state.itemData = { ...row }
    state[key] = true
}

// 审核/拒绝/强制关闭/强制出款
const handleAudit = (row, type) => {
    // type: -1:强制出款, 0:复审, 1:拒绝, 2:强制关闭
    state.itemData = { ...row }
    state.itemData.popupType = type
    state.auditPaymentShow = true
}

const handleBatch = (type) => {
    selectedBatchOperation.value = type
    // type: 0:批量复审, 1:批量拒绝 2:批量锁定 3:批量解锁
    let { tableListSelection } = state
    if (!tableListSelection.length) {
        return ElMessage.warning($t('请至少选择一条数据再进行操作！'))
    }
    if (!type && tableListSelection.length > 1) {
        let arr = tableListSelection.map(item => item.merchantId)
        if (Array.from(new Set(arr)).length > 1) return ElMessage.warning($t('批量操作只能操作相同站点下的订单！'))
    }
   
    if (!type && tableListSelection.some(item => {
        const firstChannelType = tableListSelection[0].channelType;
        if (firstChannelType === 1 || firstChannelType === 2) {
            return ![1, 2].includes(item.channelType) || !item.channelType;
        } else if (firstChannelType === 0) {
            return item.channelType !== 0 || !item.channelType;
        }
        return false;
    })) {
        return ElMessage.warning(`${$t('请选择相同且非USDT相关支付通道的订单进行操作！')}`);
    }
    // if (!type && tableListSelection.some(item => item.channelType !== tableListSelection[0].channelType || !item.channelType)) {
    //     return ElMessage.warning(`${$t('请选择相同且非USDT相关支付通道的订单进行操作！')}`)
    // }


    const filterPermissData = filterPermiss(tableListSelection)
    const filterDataArry = filterData(filterPermissData,selectedBatchOperation.value)
    if(!filterDataArry.length) {
        return ElMessage.warning($t('暂无符合操作的数据！'))    
    }
    const filterDataStr = filterDataArry.map(item => item.id).join(',')
    if(selectedBatchOperation.value === 2 || selectedBatchOperation.value ===3) {
        if(selectedBatchOperation.value === 2){
            handleBatchLock({id:filterDataStr},1)
        }
        if(selectedBatchOperation.value === 3){
            handleBatchLock({id:filterDataStr},0)
        }
        
    }else {
        const channelType = tableListSelection[0].channelType === 2 ? 1 : tableListSelection[0].channelType
        handleAudit({
            channelType: channelType,
            ids: filterDataStr,
            merchantId: tableListSelection[0].merchantId
        }, type)
    }

    
}
// 操作权限过滤
const filterPermiss = (data) => {
    const newData = data.filter(item => item.emp?.id === userData.userInfo.id || !item.emp)
    if(!newData.length) {
        ElMessage.warning($t('暂无符合操作的数据！'))
    }
    return newData;
}
// 锁定/解锁
const handleBatchLock = ({ id, emp }, flag) => {
    let text = flag ? $t('确定要锁定此订单吗？') : $t('确定要解锁此订单吗？')
    // if (!flag) text = emp.id === userData.userInfo.id ? $t('确定要解锁此订单吗？') : $t('当前账号与锁定订单账号不符，请联系管理员解锁订单后操作。')
    ElMessageBox.confirm(text, $t('提示'), {
        type: 'warning'
    }).then(() => {
        // if (!flag && emp.id !== userData.userInfo.id) return
        globalVBus.$emit('globalLoading', true)
        postCashLogLockData({ ids:id, flag, tab: 1 }).then(() => {
            fetchData({ key: 'cut' })
        }).catch(err => { })
    }).catch(err => { })
}

const filterData = (data, type) => {
    const filterConditions = {
        0: item => item.canReview,
        1: item => item.canReview,
        2: item => item.canLock,
        3: item => item.canCancelLock
    };
    if (filterConditions[type]) {
        return data.filter(filterConditions[type]);
    }

    return [];
}
// 锁定/解锁
const handleLock = ({ id, emp }, flag) => {
    let text = flag ? $t('确定要锁定此订单吗？') : $t('确定要解锁此订单吗？')
    // if (!flag) text = emp.id === userData.userInfo.id ? $t('确定要解锁此订单吗？') : $t('当前账号与锁定订单账号不符，请联系管理员解锁订单后操作。')
    ElMessageBox.confirm(text, $t('提示'), {
        type: 'warning'
    }).then(() => {
        // if (!flag && emp.id !== userData.userInfo.id) return
        globalVBus.$emit('globalLoading', true)
        postCashLogLockData({ ids:id, flag, tab: 1 }).then(() => {
            fetchData({ key: 'cut' })
        }).catch(err => { })
    }).catch(err => { })
}


// 重新出款
const postAgainOperate = ({ id, merchant }) => {
    ElMessageBox.confirm(`<div>${$t('确定要对此订单操作重新出款吗？')}</div>
    <div style='color: red;line-height: 16px'>${$t('风险提醒：可能有部分已代付成功，但系统还未回调或错报失败，请仔细核对三方支付后台数据再操作，以免重复出款，造成损失。')}</div>`, $t('重新出款'), {
        dangerouslyUseHTMLString: true,
        confirmButtonText: $t('确认'),
        cancelButtonText: $t('取消'),
        // type: "warning",
    }).then(() => {
        globalVBus.$emit('globalLoading', true)
        postForceApply({ id, merchantId: merchant.id }).then(res => {
            fetchData({ key: 'cut' })
        }).catch(err => {
            globalVBus.$emit('globalLoading', false)
        })
    }).catch(() => { })
}

// 三方订单状态刷新
const refreshOrderStatus = ({ id, merchant }) => {
    globalVBus.$emit('globalLoading', true)
    getThirdpartyOrderStatus({ logId: id, merchantId: merchant.id }).then(res => {
        fetchData({ key: 'cut' })
    }).catch(err => {
        globalVBus.$emit('globalLoading', false)
    })
}

// 自动刷新切换
const typeChange = (val) => {
    if (val !== 0) {
        state.timer && clearInterval(state.timer)
        state.timer = setInterval(() => {
            fetchData({ key: 'cut' })
        }, val)
    } else {
        state.timer && clearInterval(state.timer)
        delete state.searchData.refresh
    }
}
</script>

<style lang="scss">
.withdrawl-order-list {
    .account-info {
        > div {
            text-align: left;
        }
    }
}
</style>
