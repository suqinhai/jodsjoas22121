<template>
    <!-- 推广域名管理 -->
    <div class="container promoted-domain-manage">
        <div class="head" v-permiss="'merchant.marketing-domain.edit'">
            <el-button v-throttle type="primary" @click="handleConfig({})">{{$t('新 增')}}</el-button>
        </div>
        <div class="tips-box">{{$t('功能说明：因代理链接或渠道链接太长，方便商户用一个短的域名去发短信，且可以绑定到对应的代理下面。')}}</div>
        <el-table :data="state.tableData" class="table-box" border>
            <!-- <el-table-column prop="type_" :label="$t('域类型')" min-width="120" align="center" /> -->
            <el-table-column prop="domain" :label="$t('推广域名')" min-width="160" align="center" />
            <el-table-column prop="agentId" :label="$t('使用者')" min-width="140" align="center" />
            <!-- <el-table-column prop="targetUrl" :label="$t('指向')" min-width="200" align="center"/> -->
            <el-table-column prop="visit" :label="$t('总访问')" min-width="120" align="center" />
            <el-table-column :label="$t('状态')" min-width="120" align="center">
                <template #default="{ row }">
                    <el-switch :disabled="!userData.isHasPermiss('merchant.marketing-domain.toggle')" v-model="row.status" :active-value="1"
                        :inactive-value="0" @change="handleSwitch(row)" />
                </template>
            </el-table-column>
            <el-table-column prop="remark" :label="$t('备注')" min-width="160" align="center" />
            <el-table-column fixed="right" :label="$t('操作')" width="140" align="center">
                <template #default="{ row }">
                    <el-button v-throttle type="primary" text v-permiss="'merchant.marketing-domain.delete'" @click="handleDelete(row.id)">
                        {{$t('删除')}}</el-button>
                    <el-button v-permiss="'merchant.marketing-domain.edit'" v-throttle type="primary" text @click="handleConfig(row)">{{$t('修改')}}
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>

        <DeployDialog v-if="state.showDeployDialog" :itemData="state.itemData" :metaData="metaData" @fetchData="fetchData"
            @close="state.showDeployDialog = false"></DeployDialog>
    </div>
</template>

<script setup name="promotedDomainManage">
import { reactive, onMounted, defineAsyncComponent, nextTick } from "vue"
import userStore from '@/store/user'
import commonStore from '@/store/common'
import { ElMessageBox } from 'element-plus'
import { getMarketingDomainList, postMarketingDomainStatus, deleteMarketingDomainData } from '@/api/data_center.js'
import { getDomainList } from '@/api/app_and_domain_manage'
import { getCommonMeta } from '@/api/common.js'
const DeployDialog = defineAsyncComponent(() => import('./components/DeployDialog.vue'))

const state = reactive({
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    itemData: {},
    showDeployDialog: false,
    isBegin: false,
})
const metaData = reactive({
    marketingDomainType: [],
    channelLinkList: [],
})
const userData = userStore()
const commonData = commonStore()

getCommonMeta({ types: 'marketingDomainType' }).then(res => {
    metaData.marketingDomainType = res.data?.marketingDomainType || []
})

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
    state.isBegin = true
    globalVBus.$emit('globalLoading', true)
    getMarketingDomainList(params).then(res => {
        let { total, list } = res.data
        state.tableData = list || []
        state.total = total || 0
        nextTick(() => {
            state.isBegin = false
        })
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

const handleSwitch = (row) => {
    if (state.isBegin) return
    globalVBus.$emit('globalLoading', true)
    postMarketingDomainStatus({ id: row.id, status: row.status }).then(res => {
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        row.status = row.status ? 0 : 1
        globalVBus.$emit('globalLoading', false)
    })
}

const handleDelete = (id) => {
    ElMessageBox.confirm($t('确定要删除此推广域名配置吗？'), $t('提示'), {
        confirmButtonText: $t('确 定'),
        cancelButtonText: $t('取消'),
        type: 'warning',
    }).then(() => {
        globalVBus.$emit('globalLoading', true)
        deleteMarketingDomainData({ id }).then(res => {
            fetchData()
        }).catch(err => {
            globalVBus.$emit('globalLoading', false)
        })
    }).catch(() => { })
}

const handleConfig = (row) => {
    globalVBus.$emit('globalLoading', true)
    getDomainList({
        _page: 1,
        _size: 999,
        forBack: 2,
        merchantId: commonData.currentMerchantSite.id,
    }).then(res => {
        metaData.promotedDomainList = res.data && res.data.list ? res.data.list.filter(item => item.active === 1 && item.status === 1) : []
        state.itemData = { ...row, merchantId: commonData.currentMerchantSite.id }
        state.showDeployDialog = true
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        globalVBus.$emit('globalLoading', false)
    })
} 
</script>

<style lang="scss">
.promoted-domain-manage {
    .head {
        display: flex;
        justify-content: flex-end;
        padding-right: 20px;
        margin-bottom: 10px;
    }
}
</style>
