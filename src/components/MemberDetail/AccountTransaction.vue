<template>
    <!-- 会员详情弹窗-账户交易 -->
    <div class="container-main">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item :label="$t('类型:')">
                <el-select class="select-box" v-model="state.formData.tradeType" clearable :placeholder="$t('请选择类型')">
                    <el-option v-for="item in metaData.coinTradeType" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('单号:')">
                <el-input v-model="state.formData.id" :placeholder="$t('请输入单号')" />
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column prop="id" :label="$t('单号')" min-width="160" align="center" />
            <el-table-column prop="addTime" :label="$t('交易时间')" min-width="120" align="center" />
            <el-table-column prop="oldActiveAmount" :label="$t('变动前余额')" align="center" min-width="120" />
            <el-table-column :label="$t('变动金额')" align="center" :min-width="120">
                <template #default="{ row }">
                    <span :style="{'color': row.tradeAmount < 0 ? 'red' : 'green'}">{{row.tradeAmount}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="activeAmount" :label="$t('变动后余额')" align="center" min-width="120" />
            <el-table-column prop="tradeType_" :label="$t('类型')" min-width="120" align="center" />
            <el-table-column prop="remark" :label="$t('类型细项')" min-width="160" align="center" />
            <!-- <el-table-column prop="tier" :label="$t('操作人')" min-width="100" align="center" /> -->
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>
    </div>
</template>

<script setup>
import { reactive, onMounted, inject } from 'vue'
import { getAccountTransaction } from '@/api/member'
import { dateFormat } from '@/common/util'

const provideData = inject('provideData')
const props = defineProps({
    metaData: {
        type: Object,
        default: () => {
            return {}
        }
    }
})
const state = reactive({
    formData: {},
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
})

onMounted(() => {
    fetchData()
})

// 表格过滤数据处理
const fetchData = (type = '') => {
    if (type) {
        state.listQuery._page = 1
        if (type === 'reset') {
            state.formData = {}
        }
    }
    let params = Object.assign({}, state.formData, state.listQuery)
    params.userId = provideData.memberId
    params.merchantId = provideData.merchantId
    provideData.showLoading()
    getAccountTransaction(params).then(res => {
        let { total, list } = res.data
        state.tableData = list.map(item => {
            item.addTime && (item.addTime = dateFormat(item.addTime))
            return item
        })
        state.total = total
        provideData.hideLoading()
    }).catch(err => {
        state.tableData = []

        provideData.hideLoading()
    })
}
</script>

<style lang="scss">
</style>
