<template>
    <!-- 运营中心-优惠活动列表-推荐奖励 -->
    <div class="container-main discounts-details">
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
            <el-form-item :label="$t('优惠来源:')">
                <el-select class="select-box" v-model="state.formData.tradeType" :placeholder="$t('请选择优惠来源')" clearable>
                    <el-option v-for="item in rewardCategory" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('交易细项:')">
                <el-select class="select-box" v-model="state.formData.sourceType" :placeholder="$t('请选择交易细项')" clearable>
                    <el-option v-for="item in rewardSubType" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('export')">{{$t('导出表格')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table class="table-box" :data="state.tableData" border :row-class-name="({row}) => (row.isTotal ? 'total-row': '')">
            <el-table-column :label="$t('会员ID')" min-width="120" align="center">
                <template #default="{ row }">
                    <span v-if="row.isTotal">{{$t('总计')}}</span>
                    <span v-else class="special pointer" @click="showMemberDetail(row.user.id)">{{row.user?.id || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('会员账号')" min-width="140" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="showMemberDetail(row.user.id)">{{row.user?.name || ''}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="source" :label="$t('优惠来源')" min-width="140" align="center" />
            <el-table-column prop="sourceType" :label="$t('交易细项')" min-width="140" align="center" />
            <el-table-column prop="name" :label="$t('优惠名称')" min-width="160" align="center" />
            <el-table-column prop="dispatchMode" :label="$t('领取方式')" min-width="140" align="center" />
            <el-table-column prop="award" :label="$t('赠送金额')" min-width="120" align="center" />
            <el-table-column prop="addTime" :label="$t('获取时间')" min-width="160" align="center" />
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, onActivated } from 'vue'
import { useRoute } from 'vue-router'
import { getMemberRewardDetail } from "@/api/discounts_center.js"
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
    jumpTime: []
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

onActivated(() => {
    const { query = {} } = route
    if (+query.tab === 3 && (state.createTime !== query.createTime || state.userId !== query.userId || state.username !== query.username || state.tradeType !== query.tradeType ||
        ((state.jumpTime.length && (state.jumpTime[0] !== query.startTime || state.jumpTime[1] !== query.endTime)) || (!state.jumpTime.length && query.startTime)))) {
        getData()
    }
})

const getData = () => {
    if (+route.query.tab === 3) {
        const { query = {} } = route
        state.userId = query.userId
        state.username = query.username
        state.tradeType = query.tradeType
        state.createTime = query.createTime
        state.jumpTime = query.startTime ? [query.startTime, query.endTime] : []
    }
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
    getMemberRewardDetail(params).then(res => {
        if (!params.isExport) {
            let { total, list = [] } = res.data
            state.tableData = list.map(item => {
                item.addTime && (item.addTime = dateFormat(item.addTime))
                return item
            })
            if (res.ext && res.ext.sum) {
                state.tableData.push({
                    isTotal: true,
                    award: res.ext.sum
                })
            }
            state.total = total
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
.discounts-details {
}
</style>
