<template>
    <!-- 运营中心-优惠活动列表-新拼多多抽奖人数 -->
    <div class="container-main lottery-number">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item>
                <el-date-picker v-model="state.formData.receiveTime" type="daterange" value-format="YYYY-MM-DD" :start-placeholder="$t('开始时间')"
                    :end-placeholder="$t('结束时间')" :disabled-date="disabledCurrentDateAfter" :shortcuts="shortcuts" />
            </el-form-item>
            <el-form-item :label="$t('会员ID:')">
                <el-input @input="(val) => state.formData.userId = val.replace(/\D/g,'')" v-model="state.formData.userId"
                    :placeholder="$t('请输入会员ID')" />
            </el-form-item>
            <el-form-item :label="$t('会员账号:')">
                <el-input v-model="state.formData.username" :placeholder="$t('请输入会员账号')" />
            </el-form-item>
            <!-- <el-form-item :label="$t('是否抽奖:')">
                <el-select class="select-box" v-model="state.formData.tradeType" clearable>
                    <el-option v-for="item in state.tradeTypeArray" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item> -->
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
        </el-form>
        <div class="total-box">
            <div class="total-item">{{$t('已抽奖总人数：')}}{{state.totalNum === 0 ? 0 : `${state.lotteryNum} / ${state.totalNum}`}}</div>
            <div class="total-item">{{$t('未抽奖总人数：')}}{{state.notLotteryNum_ === 0 ? 0 : `${state.notLotteryNum_} / ${state.totalNum}`}}</div>
            <div class="total-item">{{$t('总奖励额度：')}}{{state.amountCount}}</div>
        </div>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column prop="addTime" :label="$t('注册时间')" min-width="160" align="center">
                <template #default="{ row }">
                    {{ row.addTime ? dateFormat(row.addTime) : '' }}
                </template> 
            </el-table-column>
            <el-table-column :label="$t('会员ID')" min-width="120" align="center">
                <template #default="{ row }">
                    <span v-if="row.isTotal">{{$t('总计')}}</span>
                    <span v-else class="special pointer" @click="showMemberDetail(row.userId)">{{row.userId || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('会员账号')" min-width="140" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.userId)">{{row.username || ''}}</span>
                </template>
            </el-table-column>
            <!-- <el-table-column prop="tradeType" :label="$t('是否抽奖')" min-width="120" align="center" >
                <template #default="{ row }">
                    <span v-if="row.tradeType === 1">{{$t('已抽奖')}}</span>
                    <span v-else>{{$t('未抽奖')}}</span>
                </template>
            </el-table-column> -->
            <el-table-column prop="amount_" :label="$t('总奖励额度')" min-width="120" align="center" />
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, onActivated } from 'vue'
import { useRoute } from 'vue-router'
import { getMemberRewardDetail,getNewChopCount } from "@/api/discounts_center.js"
import { getCommonMeta } from "@/api/common.js"
import { dateFormat, getShortcuts, disabledCurrentDateAfter } from '@/common/util'

const shortcuts = getShortcuts()
const state = reactive({
    formData: {},
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    createTime: '',
    userId: '',
    username: '',
    tradeType: '',
    jumpTime: [],
    tradeTypeArray: [
        { value: '', label: $t('全部状态') },
        { value: 1, label: $t('已抽奖') },
        { value: 2, label: $t('未抽奖') },
    ],
    lotteryNum: 0,
    notLotteryNum_: 0,
    totalNum: 0,
    amountCount: 0
})
const rewardCategory = ref([])
const rewardSubType = ref([])
const route = useRoute()

getCommonMeta({ types: "rewardCategory,rewardSubType" }).then(({ code, data }) => {
    if (code === 0 && data) {
        rewardCategory.value = data.rewardCategory || []
        rewardSubType.value = data.rewardSubType || []
    }
})

onMounted(() => {
    getData()
})


const getData = () => {
    state.formData = {
        userId: state.userId,
        username: state.username,
        tradeType: state.tradeType,
        receiveTime: state.createTime ? [state.createTime, state.createTime] :
            state.jumpTime.length ? [state.jumpTime[0], state.jumpTime[1]] : []
    }
    fetchData('search')
}

const fetchData = (val = '') => {
    if (val && val !== 'export') {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = {
                userId: state.userId,
                username: state.username,
                tradeType: state.tradeType,
                receiveTime: state.createTime ? [state.createTime, state.createTime] :
                    state.jumpTime.length ? [state.jumpTime[0], state.jumpTime[1]] : []
            }
        }
    }
    let params = { ...state.listQuery, ...state.formData }
    let { receiveTime } = state.formData
    if (receiveTime && receiveTime.length) {
        params['interval.begin'] = receiveTime[0]
        params['interval.end'] = receiveTime[1]
    }
    delete params.receiveTime
    if (val === 'export') params.isExport = true
    globalVBus.$emit('globalLoading', true)
    getNewChopCount(params).then(res => {
        if (!params.isExport) {
            let { total, list = [] } = res.data
            state.tableData = list.map(item => {
                item.addTime && (item.addTime = dateFormat(item.addTime))
                return item
            })
            state.total = total
            state.lotteryNum = res.ext.lotteryNum || 0
            state.notLotteryNum_ = res.ext.notLotteryNum_ || 0
            state.totalNum = res.ext.totalNum || 0
            state.amountCount = res.ext.amountCount_ || 0
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        if (!params.isExport) state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

// 查看会员详情
const showMemberDetail = (id) => {
    globalVBus.$emit('memberDetailDialog', id)
}
</script>

<style lang="scss" scoped>
.lottery-number {
    .total-box {
        margin-bottom: 10px;
        .total-item {
            display: inline-block;
            margin-right: 30px;
        }
    }
}
</style>
