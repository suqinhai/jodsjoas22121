<template>
    <!-- 会员中心-三级掉绑查询-掉绑明细 -->
    <Dialog ref="dialog" :width="1100" :title="$t('掉绑明细')" buttonCenter top="15vh" :isShowBottomButton="false"
        @cancel="cancel">
        <el-form class="filter-form" :model="state.searchData" inline>
            <el-form-item>
                <el-date-picker v-model="state.searchData.receiveTime" type="daterange" value-format="YYYY-MM-DD" :start-placeholder="$t('开始时间')"
                    :end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" />
            </el-form-item>
            <el-form-item :label="$t('会员ID:')">
                <el-input v-model="state.searchData.userId" :placeholder="$t('请输入会员ID')" />
            </el-form-item>
            <el-form-item :label="$t('会员账号:')">
                <el-input v-model="state.searchData.username" :placeholder="$t('请输入会员账号')" />
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{ $t('搜 索') }}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{ $t('重 置') }}</el-button>
            </el-form-item>
        </el-form>
        <el-table class="table-box" :data="state.tableList" border v-loading="state.loading">
            <el-table-column prop="addTime" :label="$t('注册时间')" align="center" min-width="120" />
            <el-table-column prop="user.id" :label="$t('会员ID')" align="center" min-width="120">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.user.id)">
                        {{ row.user.id }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="user.name" :label="$t('会员账号')" align="center" min-width="140">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.user.id)">
                        {{ row.user.name }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="unBindRechargeNum" :label="$t('充值次数')" align="center" min-width="120" />
            <el-table-column prop="unBindRechargeAmount" :label="$t('充值金额')" align="center" min-width="120" />
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:page="pageConfig._page"
            v-model:limit="pageConfig._size" @pagination="fetchData">
        </Pagination>
    </Dialog>
</template>

<script setup>
import { reactive, onMounted } from "vue";
import { getMissBindUserList } from "@/api/agent.js";
import { getShortcuts, disabledCurrentDateAfter, getCurrentWeekTime, dateFormat, deepClone } from "@/common/util/index"


const emits = defineEmits(['fetchData', 'close'])
const shortcuts = getShortcuts()
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        }
    },
})
const pageConfig = reactive({
    _page: 1,
    _size: 10,
})
const state = reactive({
    searchData: {
        agentUserId: props.itemData.agentUserId
    },
    tableList: [],
    total: 0,
    itemData: {},
    ext: {},
    loading: false,
    currentWeek: '',
})

onMounted(() => {
    state.currentWeek = getCurrentWeekTime()
    state.searchData.receiveTime = deepClone(state.currentWeek)
    fetchData()
})

// 查看会员详情
const showMemberDetail = (id) => {
    globalVBus.$emit('memberDetailDialog', id)
}

const fetchData = (val = '') => {
    if (val === 'reset') {
        pageConfig._page = 1
        state.searchData = {
            agentUserId: props.itemData.agentUserId,
            receiveTime: deepClone(state.currentWeek)
        }
    }
    let params = {
        ...state.searchData,
        ...pageConfig,
    }
    let { receiveTime } = state.searchData
    if (receiveTime && receiveTime.length) {
        params['interval.begin'] = receiveTime[0]
        params["interval.end"] = receiveTime[1]
    }
    delete params.receiveTime
    state.loading = true
    getMissBindUserList(params).then(({data}) => {
        let { total, list } = data
        state.tableList = list.map(item => {
            item.addTime = dateFormat(item.addTime, 'yyyy-MM-DD hh:ii:ss', '', true)
            return item
        }) || []
        state.total = total
        state.loading = false
    }).catch(err => {
        state.tableList = []
        state.total = 0
        state.loading = false
    })
}

const cancel = () => {
    emits('close')
}
</script>

<style scoped lang="scss">
</style>
