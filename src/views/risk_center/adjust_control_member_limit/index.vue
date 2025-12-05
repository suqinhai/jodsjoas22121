<template>
    <!-- 调控会员限玩列表 -->
    <div class="container adjust-control-member-limit">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item :label="$t('触发时间:')">
                <el-date-picker v-model="state.formData.receiveTime" type="datetimerange" :start-placeholder="$t('开始时间')"
                    :end-placeholder="$t('结束时间')" :shortcuts="shortcuts" value-format="YYYY-MM-DD HH:mm:ss"
                    :disabled-date="disabledCurrentDateAfter"
                    :default-time="[ new Date(2000, 0, 0, 0, 0, 0), new Date(2000, 0, 0, 23, 59, 59) ]">
                </el-date-picker>
            </el-form-item>
            <el-form-item :label="$t('会员ID:')">
                <el-input @input="(val) => state.formData.userId = val.replace(/\D/g,'')" v-model="state.formData.userId"
                    :placeholder="$t('请输入会员ID')" />
            </el-form-item>
            <el-form-item :label="$t('会员账号:')">
                <el-input v-model="state.formData.username" :placeholder="$t('请输入会员账号')" />
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item v-permiss="'merchant.game-play-limit.config'">
                <el-button v-throttle type="primary" @click="state.showDeployDialog = true">{{$t('触发参数设置')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column :label="$t('会员ID')" min-width="120" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.userId)">{{row.userId || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('会员账号')" min-width="140" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.userId)">{{row.username || ''}}</span>
                </template>
            </el-table-column>
            <!-- <el-table-column prop="userStatus_" :label="$t('账号状态')" min-width="120" align="center" /> -->
            <el-table-column prop="balance" :label="$t('调控余额')" min-width="120" align="center" />
            <el-table-column prop="localTime" :label="$t('触发时间')" min-width="160" align="center" />
        </el-table>

        <Pagination v-show="state.total > 0" :total="state.total" v-model:page="state.listQuery._page"
            v-model:limit="state.listQuery._size" @pagination="fetchData">
        </Pagination>

        <DeployDialog v-if="state.showDeployDialog" :itemData="state.itemData" @close="state.showDeployDialog = false"
            @fetchData="fetchData">
        </DeployDialog>
    </div>
</template>

<script setup name='adjustControlMemberLimit'>
import { reactive, onMounted, defineAsyncComponent } from 'vue'
import { getMemberGameList } from '@/api/risk_control'
import { dateFormat, getShortcuts, disabledCurrentDateAfter } from '@/common/util'
const DeployDialog = defineAsyncComponent(() => import('./components/DeployDialog.vue'))

const shortcuts = getShortcuts()
const state = reactive({
    formData: {},
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    itemData: {},
    showDeployDialog: false,
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
    const { receiveTime } = state.formData
    if (receiveTime && receiveTime.length) {
        params["interval.begin"] = receiveTime[0]
        params["interval.end"] = receiveTime[1]
    }
    delete params.receiveTime
    globalVBus.$emit('globalLoading', true)
    getMemberGameList(params).then(({ data, ext }) => {
        if (data && data.list) {
            state.tableData = data.list.map(item => {
                item.localTime && (item.localTime = dateFormat(item.localTime, 'YYYY-MM-DD HH:mm:ss', '', true))
                return item
            })
            state.total = data.total || 0
        }
        state.itemData = ext || {}
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
.adjust-control-member-limit {
}
</style>
