<template>
    <!-- 财务中心-提现风控审核 -->
    <div class="container risk-control-audit">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item :label="$t('申请时间:')">
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" value-format="YYYY-MM-DD" :start-placeholder="$t('开始时间')"
                    :end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" />
            </el-form-item>
            <el-form-item :label="$t('会员ID:')">
                <el-input @input="(val) => state.formData.userId = val.replace(/\D/g,'')" v-model="state.formData.userId"
                    :placeholder="$t('请输入会员ID')" />
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column :label="$t('会员ID')" min-width="120" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.user.id)">{{row.user?.id || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('会员账号')" min-width="140" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.user.id)">{{row.user?.name || ''}}</span>
                </template>
            </el-table-column>
            <!-- <el-table-column prop="addTime" :label="$t('所属站点')" min-width="120" align="center" /> -->
            <el-table-column prop="amount" :label="$t('提现金额')" min-width="120" align="center" />
            <el-table-column prop="addTime" :label="$t('提现申请时间')" min-width="160" align="center" />
            <el-table-column prop="layerName" :label="$t('会员层级')" min-width="140" align="center" />
            <el-table-column prop="accountRiskNum" :label="$t('账号风控触发次数')" width="160" align="center" />
            <el-table-column prop="gameRiskNum" :label="$t('游戏风控触发次数')" width="160" align="center" />
            <el-table-column prop="verifyRemark" :label="$t('备注')" min-width="160" align="center" />
            <el-table-column prop="status_" :label="$t('状态')" min-width="140" align="center" />
            <el-table-column prop="emp.name" :label="$t('操作人')" min-width="140" align="center" />
            <el-table-column prop="verifyTime" :label="$t('操作时间')" min-width="160" align="center" />
            <el-table-column fixed="right" align="center" :label="$t('操作')" width="100">
                <template #default="{ row }">
                    <el-button v-throttle type="primary" text v-if="row.status === 0  && userData.isHasPermiss('merchant.cash-log.firstVerify')"
                        @click="handleAudit(row)">{{$t('审核')}}</el-button>
                    <!-- <el-button v-throttle type="primary" text v-if="userData.isHasPermiss('merchant.cash-log.firstVerify')" @click="state.itemData = row;state.showRemarkPopup = true">{{$t('备注')}}</el-button> -->
                </template>
            </el-table-column>
        </el-table>

        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>

        <AuditDialog v-if="state.showAuditDialog" :itemData="state.itemData" @close="state.showAuditDialog = false" @fetchData="fetchData">
        </AuditDialog>
        <RemarkPopup v-if="state.showRemarkPopup" :orderData="state.itemData" @fetchData="fetchData" @close="state.showRemarkPopup = false">
        </RemarkPopup>
        <!-- <MemberDetail v-if="state.memberDetailShow" :merchantId="state.merchantId" @close="state.memberDetailShow = false"></MemberDetail> -->
    </div>
</template>

<script setup>
import { reactive, onMounted, defineAsyncComponent } from 'vue'
import userStore from '@/store/user'
import commonStore from '@/store/common'
import { getRiskControlAuditList } from '@/api/finance'
import { getShortcuts, dateFormat, disabledCurrentDateAfter } from '@/common/util'
const AuditDialog = defineAsyncComponent(() => import('./components/AuditDialog.vue'))
const RemarkPopup = defineAsyncComponent(() => import(".//components/RemarkPopup.vue"))

const shortcuts = getShortcuts()
const state = reactive({
    formData: {},
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    showRemarkPopup: false,
    showAuditDialog: false,
    itemData: {},
    merchantId: '',
    memberDetailShow: false,
})
const userData = userStore()
const commonData = commonStore()

onMounted(() => {
    fetchData()
})

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val) {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {}
        }
    }
    let params = { ...state.listQuery, ...state.formData }
    let { receiveTime } = state.formData
    if (receiveTime && receiveTime.length) {
        params['interval.begin'] = receiveTime[0]
        params['interval.end'] = receiveTime[1]
    }
    delete params.receiveTime
    globalVBus.$emit('globalLoading', true)
    getRiskControlAuditList(params).then(res => {
        let { list, total } = res.data
        state.tableData = list.map(item => {
            item.addTime && (item.addTime = dateFormat(item.addTime))
            item.verifyTime && (item.verifyTime = dateFormat(item.verifyTime))
            return item
        })
        state.total = total
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []

        globalVBus.$emit('globalLoading', false)
    })
}

const handleAudit = (row) => {
    state.itemData = { ...row }
    state.showAuditDialog = true
}

// 查看会员详情
// const showMemberDetail = (userId, merchantId) => {
//     commonData.memberId = userId
//     state.merchantId = merchantId
//     state.memberDetailShow = true
// }
const showMemberDetail = (id) => {
    globalVBus.$emit('memberDetailDialog', id)
}
</script>

<style lang="scss">
.risk-control-audit {
}
</style>
