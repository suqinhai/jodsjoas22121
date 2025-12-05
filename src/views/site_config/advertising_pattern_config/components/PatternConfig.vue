<template>
    <!-- 站点配置-广告埋点配置-埋点配置 -->
    <div class="tabs-main pattern-config">
        <el-form class="filter-form" :model="state.formData" inline>
            <el-form-item :label="$t('站点:')" v-if="commonData.merchantSiteList.length > 1">
                <MerchantSiteSelect isShowAll isNeedDefault :clearable="false" v-model="state.formData.merchantId">
                </MerchantSiteSelect>
            </el-form-item>
            <el-form-item>
                <el-select style="width: 100px" v-model="state.timeType" :placeholder="$t('时间类型')">
                    <el-option :label="$t('创建时间')" :value="0" />
                    <el-option :label="$t('操作时间')" :value="1" />
                </el-select>
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')"
                    :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" value-format="YYYY-MM-DD">
                </el-date-picker>
            </el-form-item>
            <el-form-item :label="$t('渠道ID:')">
                <el-input v-model="state.formData.id" :placeholder="$t('请输入渠道ID')" />
            </el-form-item>
            <el-form-item :label="$t('投放方式:')">
                <el-select v-model="state.formData.pattern" :placeholder="$t('请选择投放方式')">
                    <el-option v-for="item in channelPattern" :key="item.value" :label="item.label" :value="+item.value" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item v-permiss="'merchant.channel.edit'">
                <el-button v-throttle type="primary" @click="handleConfig({})">{{$t('新 增')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table :data="state.tableData" class="table-box" border>
            <el-table-column prop="merchant.id" :label="$t('站点ID')" min-width="100" align="center" />
            <el-table-column prop="merchant.name" :label="$t('站点名称')" min-width="120" align="center" />
            <el-table-column prop="id" :label="$t('渠道ID')" min-width="100" align="center" />
            <el-table-column prop="name" :label="$t('渠道名称')" min-width="120" align="center" />
            <el-table-column prop="agentUsername" :label="$t('代理账号')" min-width="120" align="center" />
            <el-table-column :label="$t('渠道链接')" min-width="300" align="center">
                <template #default="{ row }">
                    <div class="row-items">
                        <span>{{row.domain_}}</span>
                        <el-icon v-if="row.domain_" class="pointer" style="margin-left: 10px;" color="#409eff" :size="18"
                            @click="copyText(row.domain_)">
                            <DocumentCopy />
                        </el-icon>
                    </div>
                </template>
            </el-table-column>
            <el-table-column prop="pattern_" :label="$t('投放渠道')" min-width="120" align="center" />
            <el-table-column prop="accessToken" :label="$t('投放渠道token')" min-width="200" align="center">
                <template #default="{ row }">
                    <el-tooltip class="box-item" effect="dark" :content="row.accessToken" placement="top-start">
                        <div class="tokenText">{{ row.accessToken }}</div>
                    </el-tooltip>
                </template>
            </el-table-column>
            <el-table-column prop="apiStatus_" :label="$t('状态')" min-width="100" align="center" />
            <el-table-column prop="updateUsername" :label="$t('操作人')" min-width="120" align="center" />
            <el-table-column prop="updateTime" :label="$t('操作时间')" min-width="160" align="center" />
            <el-table-column prop="addTime" :label="$t('创建时间')" min-width="160" align="center" />
            <el-table-column fixed="right" :label="$t('操作')" width="140" align="center">
                <template #default="{ row }">
                    <el-button v-throttle type="primary" text v-if="row.status !== -1 && userData.isHasPermiss('merchant.channel.edit')"
                        @click="handleDelete(row)">{{$t('删除')}}</el-button>
                    <el-button v-permiss="'merchant.channel.edit'" v-throttle type="primary" text @click="handleConfig(row)">{{$t('修改')}}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>
        <DeployDialog v-if="state.showDeployDialog" :itemData="state.itemData" :channelPattern="channelPattern"  @fetchData="fetchData" @close="state.showDeployDialog = false"></DeployDialog>
    </div>
</template>

<script setup>
import { reactive, onMounted, defineAsyncComponent } from "vue"
import { ElMessageBox } from 'element-plus'
import userStore from '@/store/user'
import commonStore from '@/store/common'
import { getChannelList, deleteChannelData, getAdjustList } from '@/api/data_center'
import { getShortcuts, dateFormat, copyText, disabledCurrentDateAfter } from '@/common/util'
const DeployDialog = defineAsyncComponent(() => import('./DeployDialog.vue'))

let shortcuts = getShortcuts()
const props = defineProps({
    channelPattern: {
        type: Array,
        default: () => []
    },
    currentItem: {
        type: Object,
        default: () => {
            return {}
        }
    },
})
const state = reactive({
    tableData: [],
    formData: {},
    timeType: 0,
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    launchQuery: {
        _page: 1,
        _size: 1000,
    },
    itemData: {},
    showDeployDialog: false
})
const userData = userStore()
const commonData = commonStore()

onMounted(() => {
    let { merchantId, pattern } = props.currentItem
    if (merchantId) {
        state.formData.pattern = pattern
        state.formData.merchantId = merchantId
    }
    fetchData()
})

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val) {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {
                merchantId: commonData.merchantSiteList.length > 1 ? 0 : ''
            }
        }
    }
    let params = { ...state.listQuery, ...state.formData }
    let { receiveTime } = state.formData
    if (receiveTime && receiveTime.length) {
        let type = 'addTimeInterval'
        if (state.timeType) {
            type = 'interval'
        }
        params[type + '.begin'] = receiveTime[0]
        params[type + '.end'] = receiveTime[1]
    }
    delete params.receiveTime
    globalVBus.$emit('globalLoading', true)
    getChannelList(params).then(res => {
        let { total, list } = res.data
        state.tableData = list.map(item => {
            item.addTime && (item.addTime = dateFormat(item.addTime))
            item.updateTime && (item.updateTime = dateFormat(item.updateTime))
            return item
        })
        state.total = total || 0
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

const handleDelete = ({ id, merchant }) => {
    ElMessageBox.confirm($t('确定要删除此渠道配置吗？'), $t('提示'), {
        confirmButtonText: $t('确 定'),
        cancelButtonText: $t('取消'),
        type: 'warning',
    }).then(() => {
        globalVBus.$emit('globalLoading', true)
        deleteChannelData({ id, merchantId: merchant.id }).then(res => {
            fetchData()
        }).catch(err => {
            globalVBus.$emit('globalLoading', false)
        })
    }).catch(() => { })
}

const handleConfig = (row) => {
    state.itemData = { ...row }
    state.showDeployDialog = true
} 
</script>

<style lang="scss">
.pattern-config {
}
</style>
