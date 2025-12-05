<template>
    <!-- 站点配置-支付通道配置 -->
    <div class="channel-config-table">
        <div class="head">
            <div style="white-space: nowrap;">
                <template v-if="type === 1">
                    <span class="select-label">{{$t('支付通道:')}}</span>
                    <el-select v-model="state.selectChannel" clearable :placeholder="$t('请选择支付通道')">
                        <el-option v-for="item in state.payChannel" :key="item.value" :label="item.label" :value="+item.value" />
                    </el-select>
                </template>
                <template v-else>
                    <span class="select-label">{{$t('支付方式:')}}</span>
                    <el-select v-model="state.selectChannel" clearable :placeholder="$t('请选择支付方式')">
                        <el-option v-for="item in state.payScopeList" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                </template>
                <el-button style="margin-left: 15px" v-throttle type="primary" @click="fetchData">{{$t('搜 索')}}
                </el-button>
            </div>
            <div class="operation-box">
                <el-button v-permiss="'admin.merchant-pay-config.edit'" v-throttle type="primary" @click="handleDispose('')">{{$t('新增支付平台')}}
                </el-button>
                <el-button v-permiss="'admin.merchant-pay-config.bankOfflineWallet'" v-if="type === 0" v-throttle type="primary"
                    @click="state.payScopeShow = true">
                    {{$t('支付方式配置')}}
                </el-button>
                <!-- <el-button v-permiss="'merchant.audit-config.list'" v-throttle type="primary" @click="state.auditDialogShow = true">{{$t('稽核设置')}}
                </el-button> -->
            </div>
        </div>
        <el-table ref="tableRef" :data="state.tableData" border>
            <el-table-column prop="channel_" :label="$t('通道名称')" min-width="120" align="center" />
            <el-table-column prop="payScopeLabel" :label="$t('支付方式')" min-width="120" align="center" />
            <el-table-column prop="successRate" :label="$t('成功率%')" min-width="120" align="center" />
            <el-table-column prop="rechargeAmount" :label="$t('已收金额')" min-width="120" align="center" />
            <el-table-column :label="$t('创建时间')" min-width="160" align="center">
                <template #default="{ row }">
                    {{row.addTime && dateFormat(row.addTime) }}
                </template>
            </el-table-column>
            <el-table-column :label="$t('状态')" min-width="100" align="center">
                <template #default="{ row }">
                    {{row.enabled ? $t('启用') : $t('停用')}}
                </template>
            </el-table-column>
            <el-table-column :label="$t('商户号')" min-width="140" align="center">
                <template #default="{ row }">
                    {{row.asUsdt ? row.config?.usdtAddr : row.config?.merchantId}}
                </template>
            </el-table-column>
            <el-table-column :label="$t('使用站点')" min-width="120" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="handleUse(row)">{{row.scopes ? row.scopes.length + $t('个') : $t('全部站点')}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="desc" :label="$t('备注')" min-width="120" align="center" />
            <el-table-column fixed="right" align="center" :label="$t('操作')" width="140">
                <template #default="{ row }">
                    <el-button v-permiss="'admin.merchant-pay-config.edit'" v-throttle type="primary" text @click="handleDispose(row)">{{$t('修改')}}
                    </el-button>
                    <el-button v-permiss="'admin.merchant-pay-config.edit'" v-throttle type="primary" text @click="handleDelete(row)">{{$t('删除')}}
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <DeployDialog v-if="state.deployDialogShow" :itemData="state.itemData" :type="type" :merchantSiteList="state.merchantSiteList"
            :payScopeList="state.payScopeList" @fetchData="fetchData" @close="state.deployDialogShow = false">
        </DeployDialog>
        <!-- <AuditDialog v-if="state.auditDialogShow" @close="state.auditDialogShow = false"></AuditDialog> -->
        <UseSiteDialog v-if="state.useDialogShow" :itemData="state.itemData" :merchantSiteList="state.merchantSiteList"
            @close="state.useDialogShow = false"></UseSiteDialog>
        <PayScopeDeploy v-if="state.payScopeShow" :itemData="state.payScopeData" @close="state.payScopeShow = false" @getData="getPayScopeData(true)">
        </PayScopeDeploy>
    </div>
</template>

<script setup name='payChannelConfig'>
import { reactive, onMounted, defineAsyncComponent, watch } from 'vue'
import { ElMessageBox } from 'element-plus'
import { getMerchantPayConfigList, getMerchantPayConfigInfo, deletePayChannelConfig, getPayChannelList, getBankOfflineWallet } from '@/api/finance'
import { getPayChannelStat } from '@/api/website'
import { getMerchantSiteList } from '@/api/common'
import { dateFormat } from '@/common/util'
const DeployDialog = defineAsyncComponent(() => import('./DeployDialog.vue'))
// const AuditDialog = defineAsyncComponent(() => import('./AuditDialog.vue'))
const UseSiteDialog = defineAsyncComponent(() => import('./UseSiteDialog.vue'))
const PayScopeDeploy = defineAsyncComponent(() => import('./PayScopeDeploy.vue'))

const props = defineProps({
    type: {
        default: 1,
    }
})
const state = reactive({
    selectChannel: '',
    tableData: [],
    deployDialogShow: false,
    auditDialogShow: false,
    useDialogShow: false,
    payScopeShow: false,
    itemData: {},
    merchantSiteList: [],
    payChannel: [],
    payScopeList: [],
    payScopeData: {},
})

watch(
    () => props.type,
    () => {
        state.selectChannel = ''
        state.tableData = []
        state.payChannel = []
        state.payScopeData = {}
        state.payScopeList = []
        getInitData()
    }
)

onMounted(() => {
    getMerchantSiteList({ type: 1 }).then(res => {
        state.merchantSiteList = res.data || []
    })
    getInitData()
})

const getInitData = () => {
    if (props.type) {
        getPayChannelList().then(res => {
            if (res.data && res.data.length) {
                state.payChannel = res.data.filter(item => +item.value)
            }
        })
    } else {
        getPayScopeData()
    }
    fetchData()
}

// 获取列表数据
const fetchData = () => {
    globalVBus.$emit('globalLoading', true)
    getMerchantPayConfigList({ tab: props.type }).then(res => {
        state.tableData = res.data
        if (props.type) {
            state.tableData = state.selectChannel ? res.data.filter(item => item.channel === state.selectChannel) : res.data
        } else {
            state.tableData = state.selectChannel ? res.data.filter(item => item.payScopeLabel === state.selectChannel) : res.data
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

// 获取充值渠道数据
const handleUse = (row) => {
    globalVBus.$emit('globalLoading', true)
    getPayChannelStat({ channel: row.channel, alias: row.alias }).then(res => {
        state.itemData = {
            ...row,
            dataList: res.data || []
        }
        globalVBus.$emit('globalLoading', false)
        state.useDialogShow = true
    }).catch(err => {
        globalVBus.$emit('globalLoading', false)
    })
}

// 按钮操作
const handleDispose = ({ channel, alias }) => {
    if (!channel) {
        state.itemData = {}
        state.deployDialogShow = true
        return
    }
    globalVBus.$emit('globalLoading', true)
    getMerchantPayConfigInfo({ channel, alias }).then(res => {
        globalVBus.$emit('globalLoading', false)
        state.itemData = { ...res.data, edit: true }
        state.deployDialogShow = true
    }).catch(err => {
        globalVBus.$emit('globalLoading', false)
    })
}

const handleDelete = ({ channel, alias }) => {
    ElMessageBox.confirm($t('删除后支付推荐金额设置和提现设置会同步删除，代收代付都将不能使用，建议先关闭代收代付通道一段时间后再删除，避免正在处理中的订单报错！'), $t('提示'), {
        confirmButtonText: $t('确认'),
        cancelButtonText: $t('取消'),
        type: "warning",
    }).then(() => {
        globalVBus.$emit('globalLoading', true)
        deletePayChannelConfig({ channel, alias }).then(() => {
            fetchData()
        }).catch(() => {
            globalVBus.$emit('globalLoading', false)
        })
    }).catch(() => { })
}

// 获取支付方式配置
const getPayScopeData = (isRefresh = false) => {
    isRefresh && globalVBus.$emit('globalLoading', true)
    getBankOfflineWallet().then(res => {
        isRefresh && globalVBus.$emit('globalLoading', false)
        state.payScopeData = res.data || {}
        if (state.payScopeData.value) {
            state.payScopeList = JSON.parse(state.payScopeData.value).map((item)=>{ return {label: item.label, value: item.value}})
        }
    }).catch(err => {
        state.payScopeData = []
        isRefresh && globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss">
.channel-config-table {
    padding-bottom: 40px;
    .head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        .select-label {
            font-weight: 700;
            margin-right: 12px;
            color: #606266;
        }
    }
}
</style>
