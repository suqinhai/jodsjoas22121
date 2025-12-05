<template>
    <!-- 会员中心-三级掉绑查询-掉绑明细 -->
    <Dialog ref="dialog" :width="1100" :title="$t('明细界面')" buttonCenter top="15vh" :isShowBottomButton="false"
        @cancel="cancel">
        <el-table class="table-box" :data="state.tableList" border v-loading="state.loading">
            <el-table-column prop="addTime" :label="$t('时间')" align="center" min-width="120" />
            <el-table-column prop="user.id" :label="$t('奖励贡献者ID')" align="center" min-width="120"/>
            <el-table-column prop="user.id" :label="$t('奖励贡献者账号')" align="center" min-width="120"/>
            <el-table-column prop="unBindRechargeNum" :label="$t('奖励贡献者代理层级')" align="center" min-width="120" />
            <el-table-column prop="unBindRechargeAmount" :label="$t('奖励金额')" align="center" min-width="120" />
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
            item.addTime = dateFormat(item.addTime)
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
