<template>
    <!-- 人事列表 -->
    <div class="container staff-list">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item>
                <el-select style="width: 150px" v-model="state.formData.queryType" @change="state.formData.queryVal = ''">
			        <el-option v-for="item in state.metaData.accountTypeList" :key="item.value" :label="item.label" :value="item.value" />
			    </el-select>
                <div>
                    <el-input v-model="state.formData.queryVal" :placeholder="$t('请输入登录账号')" />
                </div>
                
            </el-form-item>
            <el-form-item :label="$t('账号类型:')">
                <el-select v-model="state.formData.queryAgent" :placeholder="$t('请选择账号类型')">
                    <el-option :label="$t('商户')" :value="0" />
                    <el-option :label="$t('代理商')" :value="1" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('站点:')" v-if="commonData.merchantSiteList.length > 1 && state.formData.queryAgent === 1">
                <MerchantSiteSelect isShowAll isNeedDefault :clearable="false" v-model="state.formData.merchantId">
                </MerchantSiteSelect>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-if="userData.isHasPermiss('admin.emp.add')" v-throttle type="primary" @click="handleConfig({})">{{$t('创建账号')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column prop="nickname" :label="$t('人员名称')" min-width="140" align="center" />
            <el-table-column prop="username" :label="$t('人员账号')" min-width="140" align="center" />
            <el-table-column prop="id" :label="$t('人员ID')" min-width="140" align="center" />
            <el-table-column :label="$t('可操作站点数')" min-width="120" align="center">
                <template #default="{ row }" >
                    <div @click="showSiteList(row)" style="color: #409eff;cursor: pointer;">{{row.sites ? row.sites.includes(0) ? $t('全部站点') : `${row.sites.length}${$t('个')}` : ''}}</div>
                </template>
            </el-table-column>
            <el-table-column :label="$t('账号状态')" min-width="100" align="center">
                <template #default="{ row }">
                    <div style="color: red" v-if="!row.status">{{$t('冻结')}}</div>
                    <div style="color: #409eff" v-if="row.status">{{$t('正常')}}</div>
                </template>
            </el-table-column>
            <el-table-column prop="roleName" :label="$t('角色')" width="200" align="center" />
            <el-table-column prop="salary" :label="$t('当前工资')" width="200" align="center" />
            <el-table-column prop="rewardStatus" :label="$t('绩效状态')" width="200" align="center">
                <template #default="{row}">
                    {{ !row.reward || row.reward === 0?'-':row.reward>0?$t('积极进取'):$t('警告')}}
                </template>
            </el-table-column>
            <el-table-column v-if="state.queryType" prop="merchantId" :label="$t('站点ID')" min-width="120" align="center" />
            <el-table-column v-if="state.queryType" prop="merchantName" :label="$t('站点名称')" min-width="140" align="center" />
            <el-table-column :label="$t('敏感信息隐藏')" min-width="220" align="center">
                <template #default="{ row }">
                    <!-- <el-switch :disabled="!userData.isHasPermiss('admin.emp.edit')" v-model="row.anonymous" :active-value="1"
                        :inactive-value="0" @change="switchChange(row)" /> -->
                        <div>
                            <el-checkbox :label="$t('不可查看')" v-model="row.needAnonymous" disabled style="margin-right:5px;" />
                            <el-checkbox :label="$t('不可导出')" v-model="row.limitExport" disabled style="margin-right:5px;" />
                            <el-checkbox :label="$t('不可编辑')" v-model="row.limitEditSecret" disabled />
                        </div>
                    <!-- <el-switch disabled v-model="row.anonymous" :active-value="1" :inactive-value="0" /> -->
                </template>
            </el-table-column>
            <el-table-column :label="$t('限制批量出款')" min-width="120" align="center">
                <template #default="{ row }">
                    <el-switch disabled v-model="row.batchCashLimit" :active-value="1" :inactive-value="0" />
                </template>
            </el-table-column>
            <el-table-column prop="rechargeAmountMax" :label="$t('人工单笔加款限额')" min-width="140" align="center" />
            <el-table-column prop="cashAmountMax" :label="$t('人工单笔出款限额')" min-width="140" align="center" />
            <el-table-column prop="walletAddr" :label="$t('工资接收账号')" min-width="140" align="center" />
            <el-table-column prop="addr" :label="$t('来自哪里')" min-width="140" align="center" />
            <el-table-column prop="addTime" :label="$t('入职时间')" min-width="160" align="center" />
            <el-table-column prop="lastLoginTime" :label="$t('最后登录时间')" min-width="160" align="center" />
            <el-table-column prop="lastLoginIp" :label="$t('最后登录IP')" min-width="140" align="center" />
            <el-table-column fixed="right" align="center" :label="$t('操作')" width="160">
                <template #default="{ row }">
                    <div v-if="userData.userInfo.id != row.id">
                        <el-button v-throttle type="primary" v-if="row.googleAuth && userData.isHasPermiss('admin.emp.resetGoogleValidator')" text
                            @click="handleResetBinding(row )">{{$t('重置google验证器')}}</el-button>
                        <el-button v-throttle type="primary" v-if="userData.isHasPermiss('admin.emp.toggle')" text
                            @click="handleStatus( row.status, row )">
                            {{ row.status ? $t('冻结') : $t('解冻') }}
                        </el-button>
                        <el-button v-throttle type="primary" v-if="userData.isHasPermiss('admin.emp.edit')" text @click="handleConfig(row)">{{$t('修改')}}</el-button>
                        <el-button v-throttle type="danger" v-if="userData.isHasPermiss('admin.emp.delete') && row.canDelete" text @click="handleStatus( 2, row )">{{$t('删除')}}
                        </el-button>
                    </div>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:page="state.listQuery._page" v-model:limit="state.listQuery._size"
            @pagination="fetchData" />
        <SiteList v-if="state.siteListShow" :siteList="state.currentSites" @close="state.siteListShow = false"></SiteList>
        <AccountDeploy v-if="state.accountDeployShow" :roleList="state.roleList" :itemData="state.itemData" @fetchData="fetchData"
            @close="state.accountDeployShow = false"></AccountDeploy>
    </div>
</template>

<script setup name='staffList'>
import { reactive, onMounted, defineAsyncComponent, nextTick, computed } from 'vue'
import userStore from '@/store/user'
import commonStore from '@/store/common'
import { ElMessageBox } from 'element-plus'
import { getAccountList, getAccountData, deleteAccountData, operateAccountData, editAccountData, postResetGoogleValidator } from '@/api/manage_config'
import { getMerchantRoleList } from '@/api/common'
import { dateFormat } from '@/common/util'
const AccountDeploy = defineAsyncComponent(() => import('./components/AccountDeploy.vue'))
const SiteList = defineAsyncComponent(()=> import('./components/SiteList.vue'))

const state = reactive({
    tableData: [],
    formData: {
        queryType:1,
        queryAgent: 0
    },
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    accountDeployShow: false,
    siteListShow:false,
    itemData: {},
    roleList: [],
    isInit: true,
    queryType: 0,
    metaData:{
        accountTypeList:[]
    },
    currentSites:[]
})
const userData = userStore()
const commonData = commonStore()


const isPremiss = computed(() => {
    return userData.userInfo.asSuper
})

onMounted(() => {
    state.metaData.accountTypeList = [{
        label:$t('人员账号'),
        value:1
    },{
        label:$t('人员名称'),
        value:2
    }]
    fetchData()
    getRoleData()
})

const showSiteList = (row)=> {
    state.currentSites = row.sites
    state.siteListShow = true
}

const fetchData = (val = '') => {
    if (val) {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData.username = ''
        }
    }
    let params = { ...state.listQuery, ...state.formData }
    if (!params.queryAgent) {
        delete params.queryAgent
        params.merchantId = userData.userInfo.merchantId
    }
    if (params.queryType === 1) {
        params.username = params.queryVal
    } else if (params.queryType === 2) {
        params.nickname = params.queryVal
    }
    delete params.queryType
    delete params.queryVal
    state.queryType = params.queryAgent || 0
    state.isInit = true
    globalVBus.$emit('globalLoading', true)
    getAccountList(params).then(res => {
        let { total, list } = res.data
        state.total = total || 0
        state.tableData = list.map(item => {
            item.lastLoginTime && (item.lastLoginTime = dateFormat(item.lastLoginTime, 'yyyy-MM-DD hh:ii:ss', '', true))
            item.anonymous = item.needAnonymous ? 1 : 0
            item.batchCashLimit = item.batchCashLimit ? 1 : 0
            return item
        })
        nextTick(() => {
            state.isInit = false
        })
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        state.tableData = []
        state.isInit = false
        globalVBus.$emit('globalLoading', false)
    })
}

const getRoleData = async () => {
    let res = await getMerchantRoleList({ _size: 999 })
    state.roleList = res.data || []
}

const handleConfig = (val = {}) => {
    if (!val.id) {
        state.itemData = {}
        state.accountDeployShow = true
        return
    }
    globalVBus.$emit('globalLoading', true)
    getAccountData({ id: val.id, merchantId: val.merchantId }).then(res => {
        state.itemData = res.data || {}
        state.accountDeployShow = true
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        globalVBus.$emit('globalLoading', false)
    })
}

const handleStatus = (type, { id, merchantId }) => {
    let titleArr = [{ title: $t('确定要解冻此账号吗？'), status: 1, api: operateAccountData }, { title: $t('冻结后账号不可登录，确认冻结吗？'), status: 0, api: operateAccountData }, { title: $t('删除后不可恢复，确认删除吗？'), status: '2', api: deleteAccountData }]
    ElMessageBox.confirm(titleArr[type].title, $t('提示'), {
        confirmButtonText: $t('确 定'),
        cancelButtonText: $t('取消'),
        type: 'warning',
    }).then(() => {
        globalVBus.$emit('globalLoading', true)
        titleArr[type].api({ id, merchantId, status: titleArr[type].status }).then(res => {
            fetchData()
        }).catch(err => {
            globalVBus.$emit('globalLoading', false)
        })
    }).catch(() => { })
}

const handleResetBinding = ({ id, merchantId }) => {
    ElMessageBox.confirm($t('确定要重置此账号绑定的google验证器吗？重置后将需要重新绑定谷歌验证器登录后台！'), $t('提示'), {
        confirmButtonText: $t('确 定'),
        cancelButtonText: $t('取消'),
        type: 'warning',
    }).then(() => {
        globalVBus.$emit('globalLoading', true)
        postResetGoogleValidator({ id, merchantId }).then(res => {
            fetchData()
        }).catch(err => {
            globalVBus.$emit('globalLoading', false)
        })
    }).catch(() => { })
}

const switchChange = (row) => {
    if (state.isInit) return
    globalVBus.$emit('globalLoading', true)
    editAccountData(row).then(() => {
        fetchData()
    }).catch(() => {
        row.anonymous = row.anonymous ? 0 : 1
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss">
.staff-list {
    // min-width: 500px;
    .operate-box {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        margin-right: 20px;
        .small-box {
            display: flex;
            align-items: center;
            .label {
                flex-shrink: 0;
                line-height: 32px;
                font-weight: 600;
                margin-right: 10px;
            }
        }
    }
}
</style>
