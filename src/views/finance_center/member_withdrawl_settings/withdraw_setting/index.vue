<template>
    <!-- 财务中心-会员提现配置-提现设置 -->
    <div class="withdraw-setting">
        <div class="tip-row" v-if="['UZ'].includes(userData.merchantInfo.country)">
            <div class="text col" style="padding-left:15px">{{$t('说明：提现手续费根据每笔提现扣除手续费，如：配置2，提现10则实际到账8USDT')}}</div>
        </div>
        <div class="tip-row">
             <div class="text col" style="padding-left:15px">{{$t('注:以下操作可根据站点配置，每次切换只对应一个站点')}}</div>
             <div class="checkbox col">
                <el-form-item label-width="0">
                    <el-checkbox v-model="state.notPastingCard" :true-label="1" :false-label="0"  :label="$t('禁止复制粘贴银行卡号')" @change="handleNotPastingCard"></el-checkbox>
                </el-form-item> 
             </div>
        </div>
       
        <div class="btn-box">
            <el-button v-permiss="'merchant.user-cash-config.editExemptAmount'" v-throttle type="primary" @click="handleExemptReview">{{$t('免审自动出款')}}
            </el-button>
            <el-button v-permiss="'merchant.user-cash-config.detail'" v-throttle type="primary" @click="handleWithdrawalConfig">{{$t('提现参数设置')}}
            </el-button>
            <el-button v-permiss="'merchant.vip-privilege-config.cashConfigList'" v-throttle type="primary" @click="state.withdrawalLimitShow = true">
                {{$t('VIP提现限制设置')}}</el-button>
            <el-button v-permiss="'merchant.user-cash-config.detail'" v-throttle type="primary" @click="handleWithdrawalType">
                {{$t('提现类型设置')}}</el-button>
            <el-button v-throttle type="primary" @click="fetchData(1)">{{$t('导出报表')}}</el-button>
        </div>
        <div class="text" style="padding-left:15px">{{$t('注:支持站点，一个支付通道可以对应多个站点')}}</div>
        <el-table :data="state.tableData" border>
            <el-table-column prop="channel_" :label="$t('提现方式')" min-width="120" align="center" />
            <el-table-column prop="merchantNo" :label="$t('商户号')" min-width="120" align="center" />
            <el-table-column min-width="120" :label="$t('是否开启通道')" align="center">
                <template #default="{ row }">
                    <el-switch disabled v-model="row.status" :active-value="1" :inactive-value="0" />
                </template>
            </el-table-column>
            <el-table-column prop="balance_" :label="$t('当前通道余额')" min-width="110" align="center">
                <template #default="{ row }">
                    {{Array.isArray(row.cashScopes) && row.cashScopes.includes('BANK_OFF')  ? '-' : row.balance_}}
                </template>
            </el-table-column>
            <el-table-column :label="$t('单笔限额')" min-width="100" align="center">
                <template #default="{ row }">
                    {{Array.isArray(row.cashScopes) && row.cashScopes.includes('BANK_OFF')  ? '-' : row.singleLimit}}
                </template>
            </el-table-column>
            <el-table-column prop="fee_" :label="$t('提现手续费')" min-width="100" align="center">
                <template #default="{ row }">
                    {{Array.isArray(row.cashScopes) && row.cashScopes.includes('BANK_OFF')  ? '-' : row.fee_}}
                </template>
            </el-table-column>
            <el-table-column prop="cashScopeLabel" :label="$t('支付方式')" min-width="100" align="center">
                <template #default="{ row }">
                    {{Array.isArray(row.cashScopes) && row.cashScopes.includes('BANK_OFF')  ? '-' : row.cashScopeLabel}}
                </template>
            </el-table-column>
            <el-table-column :label="$t('支持站点')" min-width="100" align="center">
                <template #default="{ row }">
                    {{row.scopes ? row.scopes.length + $t('个') : $t('全部站点')}}
                </template>
            </el-table-column>
            <el-table-column fixed="right" align="center" :label="$t('操作')" width="100">
                <template #default="{ row }">
                    <el-button v-permiss="'merchant.user-cash-config.edit'" v-throttle type="primary" text @click="handleEdit(row)">{{$t('修改')}}
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <ExemptReviewPayment v-if="state.exemptReviewShow" :userLevel="userLevel" :itemData="state.itemData" @close="state.exemptReviewShow = false"
            @fetchData="fetchData">
        </ExemptReviewPayment>
        <WithdrawParameterDeploy v-if="state.deployDialogShow" :allLevelList="allLevelList" :itemData="state.itemData"
            @close="state.deployDialogShow = false">
        </WithdrawParameterDeploy>
        <WithdrawalLimitDeploy v-if="state.withdrawalLimitShow" :userLevel="userLevel" @close="state.withdrawalLimitShow = false">
        </WithdrawalLimitDeploy>
        <WithdrawalTypeDeploy v-if="state.withdrawalTypeShow" :itemData="state.itemData" @close="state.withdrawalTypeShow = false">
        </WithdrawalTypeDeploy>
        <EditDialog v-if="state.editDialogShow" :itemData="state.itemData" :merchantSiteList="state.merchantSiteList" @fetchData="fetchData"
            @close="state.editDialogShow = false"></EditDialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, defineAsyncComponent } from 'vue'
import { getHomeDeploy, postHomeDeploy } from '@/api/website'
import { getMerchantCashConfigList, getMerchantCashConfigChannel, getWithdrawalTypeConfig, getAuditExemptionConfigData } from '@/api/finance'
import { getLevelConfig, getMerchantSiteList, getUserGradeData } from '@/api/common'
import userStore from '@/store/user'

const ExemptReviewPayment = defineAsyncComponent(() => import('./components/ExemptReviewPayment.vue'))
const WithdrawParameterDeploy = defineAsyncComponent(() => import('./components/WithdrawParameterDeploy.vue'))
const WithdrawalLimitDeploy = defineAsyncComponent(() => import('./components/WithdrawalLimitDeploy.vue'))
const WithdrawalTypeDeploy = defineAsyncComponent(() => import('./components/WithdrawalTypeDeploy.vue'))
const EditDialog = defineAsyncComponent(() => import('./components/EditDialog.vue'))

const state = reactive({
    notPastingCard: 0,
    tableData: [],
    exemptReviewShow: false,
    deployDialogShow: false,
    editDialogShow: false,
    withdrawalLimitShow: false,
    withdrawalTypeShow: false,
    itemData: {},
    merchantSiteList: []
})
let allLevelList = ref([])
let userLevel = ref([])
let userData = userStore()

getLevelConfig().then(res => {
    allLevelList.value = res.data || []
})

getMerchantSiteList({ type: 1 }).then(res => {
    state.merchantSiteList = res.data || []
})

getUserGradeData().then(({ data }) => {
    if (data) {
        for (let key in data) {
            userLevel.value.push({
                label: data[key],
                value: key,
            })
        }
    }
})
const getHomeData = () => {
    getHomeDeploy({ part: 'scatter', type: 5, alias: 'notPastingCard',status: state.notPastingCard }).then(res => {
        let { data = {} } = res
        state.notPastingCard = data.notPastingCard === 0 ? 0 : 1
    })
}
const handleNotPastingCard = (val) => {
    postHomeDeploy({ part: 'scatter', type: 5, alias: 'notPastingCard',status: state.notPastingCard }).then(res => {})
}
onMounted(() => {
    fetchData()
    getHomeData()
})

const fetchData = (type = '') => {
    let params = {}
    if (type) params.isExport = true
    globalVBus.$emit('globalLoading', true)
    getMerchantCashConfigList(params).then(res => {
        if (!type) state.tableData = res.data || []
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        !type && (state.tableData = [])
        globalVBus.$emit('globalLoading', false)
    })
}

// 免审自动出款
const handleExemptReview = () => {
    globalVBus.$emit('globalLoading', true)
    getAuditExemptionConfigData().then(res => {
        state.itemData = res.data || {}
        state.exemptReviewShow = true
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        globalVBus.$emit('globalLoading', false)
    })
}

// 提现参数设置
const handleWithdrawalConfig = () => {
    globalVBus.$emit('globalLoading', true)
    getMerchantCashConfigChannel().then(res => {
        state.itemData = res.data
        globalVBus.$emit('globalLoading', false)
        state.deployDialogShow = true
    }).catch(err => {
        globalVBus.$emit('globalLoading', false)
    })
}

// 提现类型设置
const handleWithdrawalType = () => {
    globalVBus.$emit('globalLoading', true)
    getWithdrawalTypeConfig().then(res => {
        state.itemData = res.data
        globalVBus.$emit('globalLoading', false)
        state.withdrawalTypeShow = true
    }).catch(err => {
        globalVBus.$emit('globalLoading', false)
    })
}

// 修改
const handleEdit = (row) => {
    state.itemData = { ...row }
    state.editDialogShow = true
}
</script>

<style lang="scss">
.withdraw-setting {
    padding-bottom: 40px;
    .btn-box {
        padding: 0 0 10px 15px;
        .el-button {
            min-width: 105px;
        }
    }
    .text {
        line-height: 30px;
        color: var(--el-text-color-regular);
        font-size: var(--el-dialog-content-font-size);
    }
    .tip-row {
        padding: 10px 0;
    }
    .col {
        display: inline-block;
        vertical-align: top;
    }
    .col:first-child {
        margin-right: 60px;
    }
    .checkbox *{
        line-height: 30px;
        color: red;
        .el-checkbox__input.is-checked+.el-checkbox__label {
            color: red;
        }
    }
}
</style>
