<template>
    <!-- 经销商审核 -->
    <div class="container dealer-audit pr">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item :label="$t('申请时间:')">
                <el-date-picker v-model="state.formData.interval" type="daterange" value-format="YYYY-MM-DD" :start-placeholder="$t('开始时间')"
                    :end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" />
            </el-form-item>
            <el-form-item :label="$t('会员ID:')">
                <el-input @input="(val) => state.formData.userId = val.replace(/\D/g,'')" v-model="state.formData.userId"
                    :placeholder="$t('请输入会员ID')" />
            </el-form-item>
            <el-form-item :label="$t('站点:')" v-if="commonData.merchantSiteList.length > 1">
                <MerchantSiteSelect isNeedDefault :clearable="false" v-model="state.formData.merchantId">
                </MerchantSiteSelect>
            </el-form-item>
            <el-form-item :label="$t('审核状态:')">
                <el-select class="select-box" v-model="state.formData.status" clearable :placeholder="$t('请选择审核状态')">
                    <el-option :label="$t('审核中')" :value="0" />
                    <el-option :label="$t('已通过')" :value="1" />
                    <el-option :label="$t('已驳回')" :value="-1" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
        </el-form>
        <!-- <div class="pa explain-box" v-if="typeof dealerMode === 'number'">
            <el-icon class="pointer" color="#666" :size="28" @click="state.showExplain = true">
                <QuestionFilled />
            </el-icon>
        </div> -->
        <div class="tips-box">{{$t('注：列表审核为一级经销商')}}</div>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column :label="$t('申请时间')" min-width="160" align="center">
                <template #default="{ row }">
                    {{row.addTime && dateFormat(row.addTime) || ''}}
                </template>
            </el-table-column>
            <el-table-column prop="merchant.name" :label="$t('站点名称')" min-width="140" align="center" />
            <el-table-column prop="merchant.id" :label="$t('站点ID')" min-width="120" align="center" />
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
            <el-table-column prop="contact" :label="$t('联系方式')" min-width="140" align="center" />
            <el-table-column prop="contactNum" :label="$t('联系信息')" min-width="140" align="center" />
            <el-table-column prop="content" :label="$t('申请备注')" min-width="160" align="center" />
            <el-table-column prop="verifyFrontRemark" :label="$t('审核备注')" min-width="160" align="center" />
            <el-table-column prop="emp.name" :label="$t('审核人')" min-width="140" align="center" />
            <el-table-column :label="$t('审核时间')" min-width="160" align="center">
                <template #default="{ row }">
                    {{row.updateTime && dateFormat(row.updateTime) || ''}}
                </template>
            </el-table-column>
            <el-table-column :label="$t('状态')" min-width="100" align="center">
                <template #default="{ row }">
                    <span v-if="row.status === 0">{{row.status_}}</span>
                    <span v-else :style="{'color': row.status === 1 ? 'green': 'red'}">{{row.status_}}</span>
                </template>
            </el-table-column>
            <el-table-column fixed="right" align="center" :label="$t('操作')" width="100" v-if="isPermiss">
                <template #default="{ row }">
                    <el-button v-throttle v-if="row.status === 0" type="primary" text @click="handleAudit(row)">{{$t('审核')}}
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>

        <DealerModeConfig v-if="state.showAuditDialog" :operateType="2" :applyData="state.itemData" @close="state.showAuditDialog = false"
            @fetchData="fetchData">
        </DealerModeConfig>
        <MemberDetail v-if="state.memberDetailShow" :merchantId="state.merchantId" @close="state.memberDetailShow = false"></MemberDetail>
    </div>
</template>

<script setup name='dealerAudit'>
import { reactive, onMounted, defineAsyncComponent, computed } from 'vue'
import userStore from '@/store/user'
import commonStore from '@/store/common'
import { getDealerAuditList } from '@/api/dealer'
import { dateFormat, disabledCurrentDateAfter, getShortcuts, getTimeRange } from '@/common/util'
const DealerModeConfig = defineAsyncComponent(() => import('@/components/DealerModeConfig/index.vue'))
const MemberDetail = defineAsyncComponent(() => import('@/components/MemberDetail/index.vue'))

const shortcuts = getShortcuts()
const state = reactive({
    formData: {},
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    itemData: {},
    showAuditDialog: false,
    memberDetailShow: false,
    merchantId: '',
})
const userData = userStore()
const commonData = commonStore()

const isPermiss = computed(() => {
    return userData.isHasPermiss('merchant.user-coin-log.unblockAudit')
})

onMounted(() => {
    state.formData.interval = getTimeRange()
    fetchData()
})

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val) {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {
                interval: getTimeRange(),
                merchantId: state.formData.merchantId,
            }
        }
    }
    let params = { ...state.listQuery, ...state.formData }
    let { interval } = state.formData
    if (interval && interval.length) {
        params['interval.begin'] = interval[0]
        params['interval.end'] = interval[1]
    }
    delete params.interval
    globalVBus.$emit('globalLoading', true)
    getDealerAuditList(params).then(res => {
        let { total, list } = res.data
        state.tableData = list || []
        state.total = total || 0
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

// 查看会员详情
const showMemberDetail = ({ user, merchant }) => {
    commonData.memberId = user.id
    state.merchantId = merchant.id
    state.memberDetailShow = true
}

// 审核
const handleAudit = (row) => {
    state.itemData = { ...row }
    state.showAuditDialog = true
}
</script>

<style lang="scss">
.dealer-audit {
}
</style>
