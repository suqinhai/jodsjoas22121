<template>
    <!-- 会员中心-三级代理总览-查看下级 -->
    <Dialog ref="dialog" :width="1300" :title="$t('查看下级')" buttonCenter top="15vh" :isShowBottomButton="false"
        @cancel="cancel">
        <el-form class="filter-form" :model="state.searchData" inline>
            <el-form-item :label="$t('会员ID:')">
                <el-input v-model="state.searchData.userId" :placeholder="$t('请输入会员ID')" />
            </el-form-item>
            <el-form-item :label="$t('会员账号:')">
                <el-input v-model="state.searchData.username" :placeholder="$t('请输入会员账号')" />
            </el-form-item>
            <el-form-item :label="$t('代理层级:')">
                <el-select v-model="state.searchData.level" clearable>
                    <el-option v-for="item in levelOptionData" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{ $t('搜 索') }}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{ $t('重 置') }}</el-button>
            </el-form-item>
        </el-form>
        <el-table class="table-box" :data="state.tableList" border v-loading="state.loading" @sort-change="sortChange">
            <el-table-column :label="$t('会员ID')" align="center" min-width="110">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.userId)">
                        {{ row.userId }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('会员账号')" align="center" min-width="110">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.userId)">
                        {{ row.username }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('代理层级')" align="center" min-width="120">
                <template #default="{ row }">
                    <div class="item" v-if="row.level == 1">{{$t('一级')}}</div>
                    <div class="item" v-if="row.level == 2">{{$t('二级')}}</div>
                    <div class="item" v-if="row.level == 3">{{$t('三级')}}</div>
                    <div class="item" v-if="![1,2,3].includes(row.level)">{{$t('其他')}}</div>
                </template>
            </el-table-column>
            <el-table-column prop="activeAmount" :label="$t('余额')" align="center" min-width="120"/>
            <el-table-column prop="rechargeAmount" sortable="custom" type="1" :label="$t('充值')" align="center" min-width="120"/>
            <el-table-column prop="cashAmount" sortable="custom" type="2" :label="$t('提现')" align="center" min-width="120"/>
            <el-table-column prop="winLoseCoin" :label="$t('盈亏')" align="center" min-width="120"/>
            <el-table-column prop="validCoin" :label="$t('投注')" align="center" min-width="120"/>
            <el-table-column prop="todayRechargeAmount" sortable="custom" type="3" :label="$t('今日充值')" align="center" min-width="120"/>
            <el-table-column prop="todayCashAmount" sortable="custom"  type="4" :label="$t('今日提现')" align="center" min-width="120"/>
            <el-table-column prop="todayValidCoin" :label="$t('今日投注')" align="center" min-width="120"/>
            <el-table-column prop="firstRechargeAmount" :label="$t('首充金额')" align="center" min-width="120"/>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:page="pageConfig._page"
            v-model:limit="pageConfig._size" @pagination="fetchData">
        </Pagination>
    </Dialog>
</template>

<script setup>
import { reactive, onMounted, ref } from "vue";
import { getChildDetail } from "@/api/agent.js";
import { deepClone } from '@/common/util'

const emits = defineEmits(['fetchData', 'close'])
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
    searchData: {},
    tableList: [],
    total: 0,
    itemData: {},
    loading: false,
})
const levelOptionData = ref([{
    value: 1,
    label: $t('一级'),
},{
    value: 2,
    label: $t('二级'),
},{
    value: 3,
    label: $t('三级'),
},{
    value: 0,
    label: $t('其他'),
}])

onMounted(() => {
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
        }
    }
    let params = {
        inviteUserId: props.itemData.userId,
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
    getChildDetail(params).then(({data}) => {
        let { total, list } = data
        state.tableList = list
        state.total = total
        state.loading = false
    }).catch(err => {
        state.tableList = []
        state.total = 0
        state.loading = false
    })
}

const sortChange = ({ column, order }) => {
    const columnData = deepClone(column) || {}
    switch (columnData.type) {
        case '1':
            if(order === 'ascending') state.searchData.sort = 1
            if(order === 'descending') state.searchData.sort = 2
            if(!order) state.searchData.sort = ''
            break;
        case '2':
            if(order === 'ascending') state.searchData.sort = 3
            if(order === 'descending') state.searchData.sort = 4
            if(!order) state.searchData.sort = ''
            break;
        case '3':
            if(order === 'ascending') state.searchData.sort = 5
            if(order === 'descending') state.searchData.sort = 6
            if(!order) state.searchData.sort = ''
            break;
        case '4':
            if(order === 'ascending') state.searchData.sort = 7
            if(order === 'descending') state.searchData.sort = 8
            if(!order) state.searchData.sort = ''
            break;
        default:
            state.searchData.sort = ''
            break;
    }
    fetchData()
}

const cancel = () => {
    emits('close')
}
</script>

<style scoped lang="scss">
</style>
