<template>
    <!-- 站点列表 -->
    <div class="container site-list">
        <div class="labelBox">
            <div class="leftBox">
                <el-button type="primary" v-permiss="'admin.merchant.addSite'" @click="handleOpenAddDialog">{{$t('新增站点')}}</el-button>
            </div>
            <div class="rightBox">
                <el-button type="primary" v-permiss="'admin.merchant.oneKeyEditSiteStatus'" @click="state.showMaintainAllSiteDialog = true">
                    {{$t('一键维护')}}</el-button>
                <el-button type="primary" v-permiss="'admin.merchant.oneKeyEditSiteStatus'" @click="recoverAllSite">{{$t('一键恢复')}}</el-button>
            </div>
        </div>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column prop="id" :label="$t('站点ID')" align="center" />
            <el-table-column prop="name" :label="$t('站点名称')" align="center" />
            <!-- <el-table-column prop="openFee" :label="$t('开站费')" min-width="140" align="center" />
            <el-table-column prop="lineCost" :label="$t('线路费')" min-width="120" align="center" />
            <el-table-column prop="monthMin" :label="$t('月保底费用')" width="185" align="center" /> -->
            <el-table-column prop="dealerMode" :label="$t('经销商模式')" align="center" />
            <!-- <el-table-column prop="ctrlMode_" :label="$t('控制模式')" min-width="120" align="center" /> -->
            <el-table-column prop="name" :label="$t('模版选择')" min-align="center" />
            <el-table-column prop="addTime" :label="$t('创建时间')" min-width="160" align="center">
                <template #default="{ row }">
                    {{ dateFormat(row.addTime) }}
                </template>
            </el-table-column>
            <el-table-column prop="remark" :label="$t('备注')" align="center" />
            <el-table-column prop="siteStatus_" :label="$t('站点状态')" align="center" />
            <el-table-column fixed="right" :label="$t('操作')" width="160" align="center" v-if="userData.isHasPermiss('admin.merchant.editSiteStatus')">
                <template #default="{ row }">
                    <el-button v-if="row.status === -99" text>--</el-button>
                    <el-button v-else-if="row.status !== -99 && row.status === -1 || row.status === -5" type="primary" text @click="recoverSite(row)">
                        {{$t('恢复')}}</el-button>
                    <el-button v-else type="primary" text @click="handleEditStatus(row)">{{$t('修改')}}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>
        <MaintainAllSiteDialog @refresh="fetchData" @close="state.showMaintainAllSiteDialog = false" v-if="state.showMaintainAllSiteDialog">
        </MaintainAllSiteDialog>
        <AddSiteDialog @refresh="fetchData" @close="state.showAddSiteDialog = false" v-if="state.showAddSiteDialog"></AddSiteDialog>
        <EditStatusDialog :currentItem="state.currentItem" @refresh="fetchData" @close="state.showEditDialog = false" v-if="state.showEditDialog">
        </EditStatusDialog>
    </div>
</template>

<script setup name='siteList'>
import { reactive, onMounted, defineAsyncComponent } from 'vue'
import userStore from '@/store/user'
import { dateFormat } from '@/common/util'
import { getMerchantList, postEditSiteStatus, postEditAllSiteStatus } from '@/api/merchant_center.js'
import { ElMessageBox } from 'element-plus'
const EditStatusDialog = defineAsyncComponent(() => import("./components/editStatusDialog.vue"))
const AddSiteDialog = defineAsyncComponent(() => import("./components/addSiteDialog.vue"))
const MaintainAllSiteDialog = defineAsyncComponent(() => import('./components/maintainAllSiteDialog.vue'))

const state = reactive({
    fromData: {},
    tableData: [],
    showEditDialog: false,
    showAddSiteDialog: false,
    showMaintainAllSiteDialog: false,
    currentItem: '',
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
})
const userData = userStore()

onMounted(() => {
    fetchData()
})

const fetchData = (val = '') => {
    if (val === 'reset') state.fromData = {}
    let params = { ...state.fromData, ...state.listQuery }
    globalVBus.$emit('globalLoading', true)
    getMerchantList(params).then((res) => {
        if (res.code === 0) {
            let { total, list } = res.data
            state.tableData = list.map(item => {
                item.isEdit = false
                return item
            })
            state.total = total
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

const handleEditStatus = (item) => {
    state.currentItem = item
    state.showEditDialog = true
}

const recoverSite = (item) => {
    globalVBus.$emit('globalLoading', true)
    postEditSiteStatus({
        id: item.id,
        status: 1
    }).then(() => {
        fetchData()
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}

const recoverAllSite = () => {
    globalVBus.$emit('globalLoading', true)
    postEditAllSiteStatus({
        status: 1
    }).then(() => {
        fetchData()
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}

const handleOpenAddDialog = () => {
    let merchantInfo = JSON.parse(localStorage.getItem('merchant_info'))
    let msg = merchantInfo.riskStatus == 0 ? `${$t('额度已使用比例 >')} ${merchantInfo.riskConfig.v}% ${$t('时，站点状态为预警。')}` : merchantInfo.riskStatus == -1 ? `${$t('额度已使用比例')} > ${merchantInfo.riskConfig.v}% ${$t('时，站点状态为后台限制，将无法导出会员资料和无法提现审核（含暂停自动出款）。')}` : merchantInfo.riskStatus == -2 ? `${$t('额度已使用比例')} > ${merchantInfo.riskConfig.v}% ${$t('时，站点状态为禁止游戏，前台所有会员都无法进入三方游戏。')}` : ''
    if (merchantInfo.riskStatus !== 1) {
        ElMessageBox.confirm(`<span style='color:#${merchantInfo.riskConfig.c}'>${msg}${$t('是否要继续创建站点？')}</span>`, $t('提示'), {
            dangerouslyUseHTMLString: true,
        }).then(() => {
            state.showAddSiteDialog = true
        }).catch(() => {
        })
    } else {
        state.showAddSiteDialog = true
    }
}
</script>

<style lang="scss">
.site-list {
    .labelBox {
        margin-bottom: 10px;
        display: flex;
        justify-content: space-between;
    }
}
</style>