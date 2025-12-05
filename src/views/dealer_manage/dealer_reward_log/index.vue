<template>
    <!-- 经销商领奖记录 -->
    <div class="container dealer-reward-log">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item>
                <el-date-picker v-model="state.formData.receiveTime" type="datetimerange" :start-placeholder="$t('开始时间')" :end-placeholder="$t('结束时间')"
                    :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" :default-time="defaultTime" value-format="YYYY-MM-DD HH:mm:ss">
                </el-date-picker>
            </el-form-item>
            <el-form-item :label="$t('经销商ID:')">
                <el-input v-model="state.formData.userId" :placeholder="$t('请输入经销商ID')" />
            </el-form-item>
            <el-form-item :label="$t('经销商账号:')">
                <el-input v-model="state.formData.username" :placeholder="$t('请输入经销商账号')" />
            </el-form-item>
            <el-form-item :label="$t('来源用户ID:')">
                <el-input v-model="state.formData.bizUserId" :placeholder="$t('请输入来源用户ID')" />
            </el-form-item>
            <el-form-item :label="$t('领取状态:')">
                <el-select class="select-box" v-model="state.formData.status" :placeholder="$t('请选择领取状态')">
                    <el-option :label="$t('待领取')" :value="0" />
                    <el-option :label="$t('已发放')" :value="1" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column prop="localTime_" :label="$t('发放时间')" min-width="160" align="center" />
            <el-table-column :label="$t('经销商ID')" min-width="120" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.user.id)">{{row.user?.id || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('经销商账号')" min-width="140" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.user.id)">{{row.user?.name || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('来源用户ID')" min-width="120" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.bizUser.id)">{{row.bizUser?.id || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('来源用户账号')" min-width="140" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.bizUser.id)">{{row.bizUser?.name || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('来源经销商ID')" min-width="120" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.bizDealer.id)">{{row.bizDealer?.id || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('来源经销商账号')" min-width="140" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.bizDealer.id)">{{row.bizDealer?.name || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="type_" :label="$t('奖励类型')" min-width="120" align="center" />
            <el-table-column prop="commission" :label="$t('佣金')" min-width="120" align="center" />
            <el-table-column prop="status_" :label="$t('领取状态')" min-width="140" align="center" />
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>
    </div>
</template>

<script setup name="dealerRewardLog">
import { reactive, onMounted } from 'vue'
import { getDealerRewardLogList } from "@/api/dealer.js"
import { dateFormat, getShortcuts, getDefaultTime, disabledCurrentDateAfter } from '@/common/util'

const shortcuts = getShortcuts()
const defaultTime = getDefaultTime()
const state = reactive({
    formData: {},
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
})

onMounted(() => {
    fetchData()
})

const fetchData = (val = '') => {
    if (val && val !== 'export') {
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
    getDealerRewardLogList(params).then(res => {
        state.tableData = []
        let { total, list = [] } = res.data
        state.tableData = list.map(item => {
            item.addTime && (item.addTime = dateFormat(item.addTime))
            return item
        })
        state.total = total
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

// 查看会员详情
const showMemberDetail = (id) => {
    globalVBus.$emit('memberDetailDialog', id)
}
</script>

<style lang="scss">
.dealer-reward-log {
}
</style>
