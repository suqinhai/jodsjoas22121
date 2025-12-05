<template>
    <!-- 经销商列表 -->
    <div class="container dealer-list">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item :label="$t('创建时间:')">
                <el-date-picker v-model="state.formData.interval" type="datetimerange" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
                    :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts"
                    :default-time="[ new Date(2000, 0, 0, 0, 0, 0), new Date(2000, 0, 0, 23, 59, 59) ]" />
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
            <el-form-item v-if="userData.isHasPermiss('merchant.dealer.apply')">
                <el-button v-throttle type="primary" @click="handleConfig({},'showDeployDialog')">{{$t('添加经销商')}}</el-button>
            </el-form-item>
        </el-form>
        <div class="tips-box">{{$t('注：列表为商户增加一级经销商')}}</div>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column prop="localTime_" :label="$t('创建时间')" min-width="160" align="center" />
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
            <el-table-column prop="dealerModeName" :label="$t('经销商模式名称')" min-width="160" align="center" />
            <el-table-column :label="$t('三级模式')" min-width="140" align="center">
                <template #default="{ row }">
                    {{row.rateType === 1 ? $t('首充') : $t('累充')}}
                </template>
            </el-table-column>
            <el-table-column prop="rate" :label="$t('返佣比例%')" min-width="140" align="center" />
            <el-table-column prop="rebateCommission" :label="$t('返佣奖励')" min-width="140" align="center" />
            <el-table-column prop="otherCommission" :label="$t('其他奖励')" min-width="140" align="center" />
            <el-table-column prop="totalCommission" :label="$t('总奖励')" min-width="140" align="center" />
            <el-table-column prop="cashAccount" :label="$t('已提现')" min-width="140" align="center" />
            <!-- <el-table-column prop="remark" :label="$t('备注')" min-width="140" align="center" /> -->
            <el-table-column prop="empAccount" :label="$t('经销商后台账号')" min-width="140" align="center" />
            <el-table-column prop="updateTime" :label="$t('操作时间')" min-width="160" align="center">
                <template #default="{ row }">
                    {{row.updateTime && dateFormat(row.updateTime) || ''}}
                </template>
            </el-table-column>
            <el-table-column prop="emp.name" :label="$t('操作人')" min-width="140" align="center" />
            <el-table-column fixed="right" align="center" :label="$t('操作')" :width="$locale == 'zh' ? 140 : 240"
                v-if="userData.isHasPermiss('merchant.dealer.bindEdit')">
                <template #default="{ row }">
                    <el-button v-throttle type="primary" text @click="handleConfig(row,'showEditDialog')">{{$t('修改返佣比例')}}
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>

        <DealerModeConfig v-if="state.showDeployDialog" :operateType="3" :itemData="state.itemData" @close="state.showDeployDialog = false"
            @fetchData="fetchData">
        </DealerModeConfig>
        <EditDialog v-if="state.showEditDialog" :itemData="state.itemData" @close="state.showEditDialog = false" @fetchData="fetchData">
        </EditDialog>
    </div>
</template>

<script setup name='dealerList'>
import { reactive, onMounted, defineAsyncComponent, computed } from 'vue'
import userStore from '@/store/user'
import { getDealerList, getDealerApplyData } from '@/api/dealer'
import { dateFormat, disabledCurrentDateAfter, getShortcuts, deepClone } from '@/common/util'
const DealerModeConfig = defineAsyncComponent(() => import('@/components/DealerModeConfig/index.vue'))
const EditDialog = defineAsyncComponent(() => import('./components/EditDialog.vue'))

const shortcuts = getShortcuts()
const state = reactive({
    formData: {},
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    showDeployDialog: false,
    showEditDialog: false,
    itemData: {},
})
const userData = userStore()

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
    let { interval } = state.formData
    if (interval && interval.length) {
        params['interval.begin'] = interval[0]
        params['interval.end'] = interval[1] + '.999'
    }
    delete params.interval
    globalVBus.$emit('globalLoading', true)
    getDealerList(params).then(res => {
        let { total, list } = res.data
        state.tableData = list || []
        state.total = total || 0
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

// 查看/编辑
const handleConfig = ({ user = {} }, key) => {
    if (key === 'showDeployDialog') {
        state.itemData = {}
        state[key] = true
        return
    }
    globalVBus.$emit('globalLoading', true)
    getDealerApplyData({ userId: user.id }).then(res => {
        state.itemData = res.data || {}
        state[key] = true
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        globalVBus.$emit('globalLoading', false)
    })
}

// 查看会员详情
const showMemberDetail = (id) => {
    globalVBus.$emit('memberDetailDialog', id)
}
</script>

<style lang="scss">
</style>
