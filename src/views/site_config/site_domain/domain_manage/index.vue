<template>
    <!-- 站点域名-域名管理-前台域名管理/后台域名管理/推广域名 -->
    <div class="container-main domain-manage-table">
        <el-form class="filter-form" inline :model="state.formData">
            <!-- <el-form-item :label="$t('站点:')" v-if="commonData.merchantSiteList.length > 1">
                <MerchantSiteSelect isShowAll isNeedDefault :clearable="false" v-model="state.formData.merchantId">
                </MerchantSiteSelect>
            </el-form-item> -->
            <el-form-item :label="$t('节点类型:')">
                <el-select class="select-box" v-model="state.formData.provider" clearable :placeholder="$t('请选择节点类型')">
                    <el-option v-for="item in metaData.dnsProvider" :key="item.value" :value="item.value" :label="item.label" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('主域名:')">
                <el-input v-model="state.formData.name" :placeholder="$t('请输入主域名')" />
            </el-form-item>
            <!-- <el-form-item :label="$t('操作人ID:')">
                <el-input v-model="state.formData.empId" :placeholder="$t('请输入操作人ID')" />
            </el-form-item> -->
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="state.explainDialogShow = true">{{$t('限额说明')}}</el-button>
            </el-form-item>
            <el-form-item v-permiss="permissList[asBack]">
                <el-button v-throttle type="primary" @click="state.domainDeployShow = true">{{$t('新 增')}}</el-button>
            </el-form-item>
            <!-- <el-form-item>
                <el-select class="select-box" v-model="state.isAutoRefresh" @change="selectChange">
                    <el-option :label="$t('不自动刷新')" :value="0" />
                    <el-option :label="$t('15s刷新')" :value="15000" />
                    <el-option :label="$t('30s刷新')" :value="30000" />
                    <el-option :label="$t('60s刷新')" :value="60000" />
                </el-select>
            </el-form-item> -->
        </el-form>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column prop="provider_" :label="$t('CDN节点名称')" min-width="140" align="center" />
            <!-- <el-table-column prop="merchantName" :label="$t('站点名称')" min-width="140" align="center" /> -->
            <el-table-column :label="$t('主域名')" width="180" align="center">
                <template #default="{ row }">
                    <div class="row-items">
                        <span>{{row.name}}</span>
                        <el-icon v-if="row.name" class="pointer" style="margin-left: 10px;" color="#409eff" :size="18" @click="copyText(row.name)">
                            <DocumentCopy />
                        </el-icon>
                    </div>
                </template>
            </el-table-column>
            <el-table-column :label="$t('DNS服务器')" min-width="300" align="center">
                <template #default="{ row }">
                    <div class="row-items" v-if="row.nameServerList && row.nameServerList.length">
                        <div class="row-items-left">
                            <div v-for="(item,index) in row.nameServerList" :key='index' class="row-items">
                                <span>{{item}}</span>
                                <el-icon v-if="row" class="pointer" style="margin-left: 10px" color="#409eff" :size="18" @click="copyText(item)">
                                    <DocumentCopy />
                                </el-icon>
                            </div>
                        </div>
                        <div class="row-items-right" v-if="userData.isHasPermiss(permissList[asBack])">
                            <el-button v-throttle :type="!row.canActive ? 'success' : 'primary'" text @click="handleVerify(row)">
                                {{!row.canActive ? $t('验证通过'): $t('点击验证')}}</el-button>
                        </div>
                    </div>
                    <el-button v-if="userData.isHasPermiss(permissList[asBack]) &&  (!row.nameServerList || !row.nameServerList.length)" v-throttle
                        type="primary" text @click="handleVerify(row)">{{$t('获取DNS服务器')}}</el-button>
                </template>
            </el-table-column>
            <el-table-column prop="active_" :label="$t('主域名状态')" width="220" align="center" />
            <el-table-column prop="expiredTime" :label="$t('过期时间')" min-width="160" align="center" />
            <el-table-column prop="updateEmpName" :label="$t('操作人')" min-width="140" align="center" />
            <el-table-column prop="updateTime" :label="$t('操作时间')" min-width="160" align="center" />
            <el-table-column fixed="right" align="center" :label="$t('操作')" width="160">
                <template #default="{ row }">
                    <el-button v-if="userData.isHasPermiss(permissList[asBack]) && (typeof row.canToggle === 'boolean') && !row.canToggle" v-throttle
                        type="primary" text @click="handleOperate(row,1)">{{$t('停用')}}</el-button>
                    <el-button v-if="userData.isHasPermiss(permissList[asBack]) && (typeof row.canToggle === 'boolean') && row.canToggle" v-throttle
                        type="primary" text @click="handleOperate(row,2)">{{$t('启用')}}</el-button>
                    <el-button v-if="userData.isHasPermiss(permissList[asBack]) && row.canDelete" v-throttle type="danger" text
                        @click="handleOperate(row,0)">{{$t('删除')}}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>

        <ExplainDialog v-if="state.explainDialogShow" @close="state.explainDialogShow = false">
        </ExplainDialog>
        <DomainDeployDialog v-if="state.domainDeployShow" :asBack="asBack" :metaData="metaData" @close="state.domainDeployShow = false"
            @fetchData="fetchData">
        </DomainDeployDialog>
    </div>
</template>

<script setup>
import { reactive, onMounted, defineAsyncComponent, onActivated } from 'vue'
import { useRoute } from 'vue-router'
import userStore from '@/store/user'
import commonStore from '@/store/common'
import { ElMessageBox } from 'element-plus'
import { getDomainList, postVerifyDomain, postDomainStatus, deleteDomainData } from '@/api/app_and_domain_manage'
import { dateFormat, copyText } from '@/common/util'
const ExplainDialog = defineAsyncComponent(() => import('./components/ExplainDialog.vue'))
const DomainDeployDialog = defineAsyncComponent(() => import('./components/DomainDeployDialog.vue'))

let permissList = ['admin.domain.edit', 'admin.domain.edit-1', 'admin.domain.edit-2']
const props = defineProps({
    metaData: {
        type: Object,
        default: () => {
            return {}
        }
    },
    asBack: {
        type: Number,
        default: 0
    },
})
const state = reactive({
    formData: {},
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    itemData: {},
    explainDialogShow: false,
    domainDeployShow: false,
    merchantId: '',
})
const route = useRoute()
const userData = userStore()
const commonData = commonStore()

onMounted(() => {
    +route.query.tab === 2 && +props.asBack === 2 && (state.merchantId = route.query.merchantId)
    state.formData.merchantId = state.merchantId ? +state.merchantId : commonData.merchantSiteList.length > 1 ? 0 : ''
    fetchData()
})

onActivated(() => {
    if (+route.query.tab === 2 && +props.asBack === 2 && state.merchantId !== route.query.merchantId) {
        state.merchantId = route.query.merchantId
        state.formData.merchantId = state.merchantId ? +state.merchantId : commonData.merchantSiteList.length > 1 ? 0 : ''
        fetchData('search')
    }
})

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val) {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {
                merchantId: state.merchantId ? +state.merchantId : commonData.merchantSiteList.length > 1 ? 0 : ''
            }
        }
    }
    let params = { ...state.listQuery, ...state.formData }
    params.forBack = props.asBack
    globalVBus.$emit('globalLoading', true)
    getDomainList(params).then(res => {
        let { total, list } = res.data
        state.tableData = list.map(item => {
            item.updateTime && (item.updateTime = dateFormat(item.updateTime))
            item.expiredTime && (item.expiredTime = dateFormat(item.expiredTime))
            return item
        })
        state.total = total
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

// const handleConfig = (val) => {
//     state.itemData = { ...val }
//     state.domainDeployShow = true
// }

// 停用/启用/删除
const handleOperate = ({ id, merchantId }, type) => {
    let title = $t('删除')
    let api = deleteDomainData
    let obj = { id, merchantId, asBack: props.asBack }
    if (type) {
        api = postDomainStatus
        title = type === 2 ? $t('启用') : $t('停用')
        obj.status = type - 1
    }
    ElMessageBox.confirm(`${$t('确定要')}${title}${$t('此域名吗？')}`, $t('提示'), {
        type: 'warning'
    }).then(() => {
        globalVBus.$emit('globalLoading', true)
        api(obj).then(res => {
            fetchData()
        }).catch(err => {
            globalVBus.$emit('globalLoading', false)
        })
    }).catch(() => { })
}

// 域名验证/获取DNS服务器
const handleVerify = ({ id, merchantId, canActive }) => {
    if (!canActive) return
    globalVBus.$emit('globalLoading', true)
    postVerifyDomain({
        id,
        merchantId,
        asBack: props.asBack
    }).then(res => {
        fetchData()
    }).catch(err => {
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss">
.domain-manage-table {
    height: 100%;
    display: flex;
    flex-direction: column;
    .row-items {
        display: flex;
        align-items: center;
        justify-content: center;
        &-left {
            min-width: 150px;
            margin-right: 10px;
        }
        &-right {
            margin-left: 10px;
        }
    }
}
</style>
