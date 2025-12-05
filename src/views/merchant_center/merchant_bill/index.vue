<template>
    <!-- 商户账单 -->
    <div class="container merchant-bill">
        <el-form class="filter-form" inline :model="state.formData">
            <el-form-item>
                <el-date-picker style="width: 150px" clearable v-model="state.formData.date" type="month" :placeholder="$t('请选择账单月份')"
                    value-format="YYYY-MM" />
            </el-form-item>
            <el-form-item :label="$t('账单状态:')">
                <el-select class="select-box" v-model="state.formData.status" clearable :placeholder="$t('请选择账单状态')">
                    <el-option v-for="(item, index) in statusList" :key="index" :value="item.value" :label="item.label" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('search')">{{$t('搜 索')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle @click="fetchData('reset')">{{$t('重 置')}}</el-button>
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData('export')">{{$t('导出报表')}}</el-button>
            </el-form-item>
        </el-form>
        <el-table class="table-box" :data="state.tableData" border>
            <el-table-column prop="period" :label="$t('月份')" min-width="100" align="center" />
            <el-table-column prop="winCoin" :label="$t('盈亏金额')" min-width="120" align="center" />
            <el-table-column prop="merchant.id" :label="$t('站点ID')" min-width="120" align="center" />
            <el-table-column prop="merchant.name" :label="$t('站点名称')" min-width="140" align="center" />
            <el-table-column prop="totalPay" :label="$t('账单金额(U)')" min-width="120" align="center" />
            <el-table-column prop="freeAmount" :label="$t('优惠金额(U)')" min-width="120" align="center" />
            <el-table-column prop="realPay" :label="$t('实际支付(U)')" min-width="120" align="center">
                <!-- <template #header>
                    <span>{{$t('实际支付(U)')}}</span>
                    <el-tooltip effect="dark" :content="$t('账单金额*（1-推荐折扣）')" placement="top-start">
                        <el-icon>
                            <QuestionFilled />
                        </el-icon>
                    </el-tooltip>
                </template> -->
            </el-table-column>
            <!-- <el-table-column prop="pay" :label="$t('调整后实际支付')" min-width="120" align="center"/> -->
            <el-table-column prop="status_" :label="$t('账单状态')" min-width="120" align="center">
                <template #default="{ row }">
                    <span :class="row.status === 1 || row.status === 5?'status-pending':row.status === 9?'status-success':''">{{row.status_}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="netFeeRemark" :label="$t('备注')" min-width="160" align="center" />
            <el-table-column fixed="right" :label="$t('操作')" width="140" align="center">
                <template #default="{ row }">
                    <el-button v-permiss="'merchant.merchant-bill.confirm'" v-throttle link type="primary" @click="goDetail(row)">{{$t('详情')}}
                    </el-button>
                    <el-button v-throttle link type="primary" @click="pay(row)"
                        v-if="row.status !== 9 && userData.isHasPermiss('merchant.merchant-bill.confirm') && isMerchant">{{$t('付款')}}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:page="state.pageInfo._page" v-model:limit="state.pageInfo._size"
            @pagination="fetchData"></Pagination>

        <PayDialog :item="currentItem" v-if="showPayDialog" @close="showPayDialog = false" @refreshList="fetchData"></PayDialog>
        <DetailDialog :detail="currentItem" :isMerchant="isMerchant" v-if="showDetailDialog" @close="showDetailDialog = false"
            @refreshList="fetchData">
        </DetailDialog>
    </div>
</template>

<script setup name="merchantBill">
import { ref, reactive, onMounted, defineAsyncComponent, computed } from 'vue'
import userStore from '@/store/user'
import commonStore from '@/store/common'
import { getCommonMeta } from '@/api/common.js'
import { getMerchantBillList } from '@/api/merchant_center'
const PayDialog = defineAsyncComponent(() => import('./components/PayDialog.vue'))
const DetailDialog = defineAsyncComponent(() => import('./components/DetailDialog.vue'))

const state = reactive({
    formData: {},
    tableData: [],
    total: 0,
    pageInfo: {
        _size: 10,
        _page: 1,
    },
    merchantBillStatus: []
})
const currentItem = ref()
const showPayDialog = ref(false)
const showDetailDialog = ref(false)
const userData = userStore()
const commonData = commonStore()


const statusList = computed(() => {
    return state.merchantBillStatus.filter(item => item.value != 0)
})
const isMerchant = computed(() => {
    return commonData.currentMerchantSite.id === userData.userInfo.merchantId
})

getCommonMeta({ types: 'merchantBillStatus' }).then(({ data = {} }) => {
    state.merchantBillStatus = data.merchantBillStatus || []
})

onMounted(() => {
    fetchData()
})

const fetchData = (val = '') => {
    if (val && val !== 'export') {
        state.pageInfo._page = 1
        if (val === 'reset') {
            state.formData = {}
        }
    }
    let params = { ...state.pageInfo }
    params.status = state.formData.status
    if (state.formData.date) {
        params['interval.begin'] = state.formData.date
        params['interval.end'] = state.formData.date
    }
    if (val === 'export') params.isExport = true
    params.type = 1  // 固定参数，不可删除
    globalVBus.$emit('globalLoading', true)
    getMerchantBillList(params).then(res => {
        if (!params.isExport) {
            const { data } = res
            state.tableData = data.list || []
            state.total = data.total || 0
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        if (!params.isExport) state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

const pay = (item) => {
    showPayDialog.value = true
    currentItem.value = item
}

const goDetail = (item) => {
    currentItem.value = item
    showDetailDialog.value = true
}
</script>

<style lang='scss'>
.merchant-bill {
}
</style>