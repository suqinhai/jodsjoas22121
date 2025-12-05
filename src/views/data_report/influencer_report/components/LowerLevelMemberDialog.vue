<template>
    <!-- 网红数据报表-下级会员 -->
    <Dialog ref="dialog" width="1150" :title="$t('下级会员')" :isShowSubmit="false" top="2vh" @cancel="emits('close')">
        <el-form class="filter-form" :model="state.formData" inline>
            <el-form-item :label="$t('站点:')" v-if="commonData.merchantSiteList.length > 1">
                <MerchantSiteSelect isShowAll :clearable="false" v-model="state.formData.merchantId"></MerchantSiteSelect>
            </el-form-item>
            <el-form-item :label="$t('会员ID:')" v-if="state.formData.merchantId || commonData.merchantSiteList.length < 2">
                <el-input @input="(val) => state.formData.userId = val.replace(/\D/g,'')" v-model="state.formData.userId"
                    :placeholder="$t('请输入会员ID')" />
            </el-form-item>
            <el-form-item :label="$t('会员账号:')" v-if="state.formData.merchantId || commonData.merchantSiteList.length < 2">
                <el-input v-model="state.formData.username" :placeholder="$t('请输入代理账号')" />
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
        <el-table ref="tableRef" :data="state.tableData" border @sort-change="sortChange">
            <el-table-column prop="user.name" :label="$t('会员账号')" min-width="140" align="center" />
            <el-table-column prop="agentUser.name" :label="$t('上级代理')" min-width="140" align="center" />
            <el-table-column sortable="custom" prop="firstRechargeAmount" :label="$t('首充金额')" min-width="120" align="center" />
            <el-table-column sortable="custom" prop="rechargeAmount" :label="$t('总充值金额')" min-width="120" align="center" />
            <el-table-column sortable="custom" prop="cashAmount" :label="$t('总提现金额')" min-width="120" align="center" />
            <el-table-column prop="discountTimes" :label="$t('领取优惠次数')" min-width="120" align="center" />
            <el-table-column sortable="custom" prop="discountAmount" :label="$t('领取优惠金额')" min-width="140" align="center" />
            <el-table-column sortable="custom" prop="validCoin" :label="$t('投注金额')" min-width="120" align="center" />
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue"
import commonStore from '@/store/common'
import { getSubordinateData } from '@/api/statistics'
import { disabledCurrentDateAfter, getShortcuts } from '@/common/util'

const keyData = {
    'firstRechargeAmount': 2,
    'rechargeAmount': 4,
    'cashAmount': 6,
    'discountAmount': 8,
    'validCoin': 10,
}
const shortcuts = getShortcuts()
const emits = defineEmits(['close'])
const props = defineProps({
    itemData: {
        type: Object,
        default: {}
    },
})
const state = reactive({
    formData: {},
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
})
const dialog = ref(null)
const tableRef = ref(null)
const commonData = commonStore()

onMounted(() => {
    state.formData = { ...props.itemData }
    fetchData()
})

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val && val !== 'export') {
        state.listQuery._page = 1
        if (val === 'reset') {
            state.formData = { ...props.itemData }
        }
        tableRef.value.clearSort()
    }
    let params = { ...state.listQuery, ...state.formData }
    let { receiveTime } = state.formData
    if (receiveTime && receiveTime.length) {
        params['interval.begin'] = receiveTime[0]
        params['interval.end'] = receiveTime[1]
    }
    delete params.receiveTime
    params.tab = props.itemData.tab
    if (val === 'export') params.isExport = true
    dialog.value.showLoading()
    getSubordinateData(params).then(({ data = {} }) => {
        if (!params.isExport) {
            let { total, list } = data
            state.tableData = list || []
            state.total = total
        }
        dialog.value.closeLoading()
    }).catch(err => {
        if (!params.isExport) state.tableData = []
        dialog.value.closeLoading()
    })
}

const sortChange = ({ order, prop }) => {
    delete state.formData.sort
    if (order === 'descending') {
        state.formData.sort = keyData[prop]
    } else if (order === 'ascending') {
        state.formData.sort = keyData[prop] - 1
    }
    fetchData()
}

// 站点切换
const selectChange = (merchantId) => {
    if (!merchantId) {
        state.formData.userId = ''
        state.formData.username = ''
    }
}
</script>

<style lang="scss">
</style>
