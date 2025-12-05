<template>
    <!-- 财务中心-会员充值配置-转账充值配置 -->
    <div class="container-main transfer-recharge-config">
        <el-form class="filter-form" :model="state.formData" inline>
            <el-form-item :label="$t('支付方式:')">
                <el-select v-model="state.payType" clearable :placeholder="$t('请选择支付方式')">
                    <el-option v-for="item in state.payMentList" :key="item" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                {{$t('同时转账充值数量')}}
                <el-input-number v-model="state.formData.concurrentNumber" :disabled="!state.isEditConcurrentNumber" :max="9999" :min="0" :controls="false" style="width: 100px;margin: 0 10px;" :precision="0"/>
                <el-button v-throttle v-if="state.isEditConcurrentNumber" @click="getData">{{$t('取 消')}}</el-button>
                <el-button v-throttle type="primary" @click="saveConfig" v-if="state.isEditConcurrentNumber">{{$t('保 存')}}</el-button>
                <el-button v-throttle type="primary" v-if="!state.isEditConcurrentNumber" @click="state.isEditConcurrentNumber = true">{{$t('修 改')}}</el-button>&nbsp;
                {{$t('填0为不限制，填1则审核后才可继续提交充值')}}
            </el-form-item>
            <el-form-item class="head-right" v-permiss="'admin.merchant-pay-config.bankOfflineWallet'">
                <el-button v-throttle type="primary" @click="getPayScopeData">{{$t('前台充值类型排序')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column prop="sort" :label="$t('排序')" min-width="120" align="center" />
            <el-table-column prop="channelType_" :label="$t('类型')" min-width="120" align="center" />
            <el-table-column prop="type" :label="$t('支付方式')" min-width="145" align="center" />
            <el-table-column prop="channel_" :label="$t('通道名称')" min-width="130" align="center" />
            <el-table-column prop="name" :label="$t('前台通道名称')" min-width="160" align="center" />
            <el-table-column prop="productsStr" :label="$t('通道推荐金额')" min-width="180" align="center" />
            <el-table-column prop="minAmount" :label="$t('最小限额')" min-width="140" align="center" />
            <el-table-column prop="maxAmount" :label="$t('最大限额')" min-width="140" align="center" />
            <el-table-column :label="$t('会员层级')" min-width="200" align="center">
                <template #default="{ row }">
                    {{row.fixLayers ? getLevelName(row.fixLayers) : $t('全部层级')}}
                </template>
            </el-table-column>
            <el-table-column prop="desc" :label="$t('备注')" min-width="140" align="center" />
            <el-table-column prop="tips" :label="$t('前台提示')" min-width="170" align="center" />
            <el-table-column prop="status" :label="$t('是否启用')" min-width="140" align="center">
                <template #default="{ row }">
                    <div class="statusBox" :class="(row.status === 0 || !row.products)?'error':'success'">
                        {{ row.status === 0 || !row.products ? $t('已关闭') : $t('已开启') }} </div>
                </template>
            </el-table-column>
            <el-table-column fixed="right" align="center" :label="$t('操作')" width="100">
                <template #default="{ row }">
                    <el-button v-permiss="'admin.user-recharge-config.detail'" v-throttle type="primary" text @click="handleConfig(row)">{{$t('修改')}}
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <DeployDialog v-if="state.deployDialogShow" :memberLevel="state.memberLevel" :itemData="state.itemData" @fetchData="fetchData"
            @close="state.deployDialogShow = false">
        </DeployDialog>

        <SortDialog v-if="state.sortDialogShow" :itemData="state.payScopeData" @close="state.sortDialogShow = false">
        </SortDialog>
    </div>
</template>

<script setup>
import { reactive, onMounted, defineAsyncComponent } from "vue"
import userStore from '@/store/user'
import { getRecommendedAmountList, getRecommendedAmountConfig, getBankOfflineWallet } from '@/api/finance'
import { getLevelConfig } from '@/api/common'
import { getMetaData, postMetaData } from "@/api/common.js"
const DeployDialog = defineAsyncComponent(() => import('./components/DeployDialog.vue'))
const SortDialog = defineAsyncComponent(() => import('./components/SortDialog.vue'))

const state = reactive({
    payType: '',
    tableData: [],
    payMentList: [],
    memberLevel: [],
    deployDialogShow: false,
    sortDialogShow: false,
    itemData: {},
    payScopeData: {},
    formData: {},
    concurrentNumber: 0,
    isEditConcurrentNumber: false
})
const userData = userStore()

getBankOfflineWallet().then(res => {
    if (res.data && res.data.value) state.payMentList = JSON.parse(res.data.value)
})

getLevelConfig().then(res => {
    state.memberLevel = res.data || []
})

onMounted(() => {
    fetchData()
    getData()
})

const getData = () => {
    globalVBus.$emit('globalLoading', true)
    getMetaData({ type: 60 }).then((res) => {
        if(res.data['转账充值配置']){
            state.formData.concurrentNumber = res.data['转账充值配置'].config.concurrentNumber
            state.id = res.data['转账充值配置'].id
        }
        state.isEditConcurrentNumber = false
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}

const saveConfig = (el) => {
    const obj = {
        concurrentNumber: state.formData.concurrentNumber || 0,
    }
    let params = {
        config: JSON.stringify(obj),
        type: 60,
        name: 'transfer_recharge',
        id: state.id || '',
    }
    globalVBus.$emit('globalLoading', true)
    postMetaData(params).then(() => {
        globalVBus.$emit('globalLoading', false)
        getData()
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}

const fetchData = () => {
    globalVBus.$emit('globalLoading', true)
    getRecommendedAmountList({ tab: 0 }).then(res => {
        state.tableData = res.data || []
        state.tableData.forEach(item => {
            if (item.products) {
                let arr = item.products.map(item => item.rechargeAmount)
                item.productsStr = arr.join('，')
            }
        })
        state.tableData = state.payType ? state.tableData.filter(item => item.type === state.payType) : state.tableData
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}


// 层级层级ID映射name
const getLevelName = (val) => {
    let arr = []
    let obj = ''
    val.split(',').forEach(item => {
        obj = state.memberLevel.find(its => its.id === +item)
        if (obj) arr.push(obj.name)
    })
    return arr.join('，')
}

// 修改
const handleConfig = ({ channel, alias = '', type = '' }) => {
    globalVBus.$emit('globalLoading', true)
    getRecommendedAmountConfig({ channel, alias, type }).then(res => {
        globalVBus.$emit('globalLoading', false)
        state.itemData = res.data
        state.deployDialogShow = true
    }).catch(err => {
        globalVBus.$emit('globalLoading', false)
    })
}


const getPayScopeData = (isRefresh = false) => {
    globalVBus.$emit('globalLoading', true)
    getBankOfflineWallet().then(res => {
        globalVBus.$emit('globalLoading', false)
        state.payScopeData = res.data || {}
        state.sortDialogShow = true
    }).catch(err => {
        globalVBus.$emit('globalLoading', false)
    })
}

</script>

<style lang="scss">
.transfer-recharge-config {
    .head-right {
        float: right;
    }
    .concurrentNumber{
        width: 100px;
        margin: 0 10px;
    }
}
</style>
