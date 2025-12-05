<template>
    <!-- 商户账单-核对详情 -->
    <Dialog ref="checkDialog" width="1200" :title="$t('核对详情')" top="10vh" :isShowSubmit="false" :closeClickModal="false" :operateActions="[$t('退出')]"
        @cancel="cancel" className="merchant-bill-check-dialog">
        <el-form :label-width="$locale == 'zh' ? '120px' : 'auto'">
            <el-form-item :label="$t('站点名称:')">
                <span>{{ merchantDetail.merchant.name }}</span>
            </el-form-item>
            <el-form-item :label="$t('账单月份:')">
                <span>{{ merchantDetail.period }}</span>
            </el-form-item>
            <el-form-item :label="$t('经营地(含时区):')">
                <span>（UTC {{ userData.merchantInfo.timeZone }}）</span>
            </el-form-item>
            <el-button v-throttle class="exportBtn" type="primary" @click="getList('export')">{{$t('导出报表')}}</el-button>
        </el-form>
        <el-table :data="state.tableData" v-if="state.tableData.length" show-summary :summary-method="getSummaries" border>
            <el-table-column prop="vendor_" :label="$t('游戏平台')" min-width="80" align="center" />
            <el-table-column prop="gameType_" :label="$t('游戏类型')" min-width="80" align="center" />
            <el-table-column prop="timesOrCoinIn" :label="$t('有效投注(本地货币)')" min-width="120" align="center">
                <template #default="{row}">
                    <div v-if="!isJune()" v-html="row.timesOrCoinIn"></div>
                    <div v-else v-html="row.userCoinIn"></div>
                </template>
            </el-table-column>
            <el-table-column prop="winCoin" :label="$t('游戏输赢(本地货币)')" min-width="120" align="center" />
            <el-table-column prop="realShareRate" :label="$t('收取费率(%)')" align="center" width="140">
                <template #default="{row}">
                    <div v-if="!isJune()" v-html="row.realShareRate"></div>
                    <div v-else v-html="row.shareRate"></div>
                </template>
            </el-table-column>
            <el-table-column prop="summaryRealFee" :label="$t('费用(本地货币)')" min-width="120" align="center">
                <template #default="{row}">
                    <div v-if="!isJune()" v-html="row.summaryRealFee"></div>
                    <div v-else v-html="row.localFee"></div>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="getList"></Pagination>
        <div class="sum">
            <div>
                <label>{{$t('折算汇率：')}}</label>
                <span>{{props.totalDetail.exchangeRate}}</span>
            </div>
            <div>
                <label>{{$t('折算金额(U)：')}}</label>
                <span>{{props.totalDetail.gameFee}}</span>
            </div>
        </div>
        <el-dialog v-model="state.showRemarkDialog" :title="$t('查看备注')" center>
            <div class="remarkContent">{{$t('备注内容')}}</div>
        </el-dialog>
    </Dialog>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import userStore from '@/store/user'
import { getMerchantChildrenBillList } from '@/api/merchant_center'
import { add } from '@/common/util'

const emits = defineEmits(['close'])
const props = defineProps(['merchantDetail', 'totalDetail', 'zoneTime'])
const state = reactive({
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    showRemarkDialog: false
})
const checkDialog = ref(null)
const userData = userStore()

onMounted(() => {
    getList()
})



// 是否2024-6月份账单之前账单（包含6月份）
const isJune = (value = props.merchantDetail.period) => {
    if (new Date(value).getTime() >= new Date('2024/07/01').getTime()) {
        return false
    } else {
        return true
    }
}

const getList = (val = '') => {
    let params = {
        merchantId: props.merchantDetail.merchant.id,
        period: props.totalDetail.period,
        ...state.listQuery
    }
    if (val === 'export') params.isExport = true
    params.type = 1  // 固定参数，不可删除
    checkDialog.value.showLoading()
    getMerchantChildrenBillList(params).then(res => {
        if (!params.isExport) {
            const { code, data } = res
            if (code === 0) {
                state.tableData = data.list || []
                state.total = data.total
            }
        }
        checkDialog.value.closeLoading()
    }).catch(err => {
        if (!params.isExport) state.tableData = []
        checkDialog.value.closeLoading()
    })
}

const getSummaries = (param) => {
    const { columns, data } = param
    const sums = []

    columns.forEach((column, index) => {
        if (index === 0) {
            sums[index] = $t('合计')
        } else if (index === 4) {
            sums[index] = ''
        } else {
            if (index === 2) { column.property = 'userCoinIn' }
            if (index === 5) { column.property = 'realLocalFee' }
            const values = data.map((item) => Number(item[column.property]))
            if (!values.every((value) => isNaN(value))) {
                sums[index] = `${values.reduce((prev, curr) => {
                    const value = Number(curr)
                    if (!isNaN(value)) {
                        return add(prev, curr)
                    } else {
                        return prev
                    }
                }, 0)}`
            } else {
                sums[index] = ''
            }
        }

    })

    return sums
}

const cancel = () => {
    emits('close')
}

const checkRemark = () => {
    state.showRemarkDialog = true
}
</script>

<style lang='scss'>
.merchant-bill-check-dialog {
    .el-form {
        position: relative;
        &-item {
            margin-bottom: 0;
        }
        .exportBtn {
            position: absolute;
            right: 0;
            top: 0;
        }
    }
    // .el-table {
    //     flex: none;
    //     height: 400px;
    // }
    .sum {
        height: 36px;
        display: flex;
        align-items: center;
        > div {
            display: flex;
            align-items: center;
            margin-right: 20px;
        }
    }
    .remarkContent {
        padding: 20px;
        min-height: 200px;
        max-height: 400px;
    }
}
</style>