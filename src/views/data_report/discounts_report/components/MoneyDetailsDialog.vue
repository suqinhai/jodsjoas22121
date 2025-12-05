<template>
    <!-- 数据报表-优惠数据报表-活动-赠送金额数据详情 -->
    <Dialog ref="dialog" width="800" :title="itemData.moneyDetailsTitle + '-' + $t('赠送金额数据详情')" :isShowSubmit="false" top="6vh"
        @cancel="emits('close')">
        <el-table :data="state.tableData" border :row-class-name="({row,rowIndex}) => (rowIndex === 0 ? 'total-row': '')">
            <el-table-column prop="username" :label="$t('会员账号')" min-width="100" align="center">
                <template #default="{ row, $index }">
                    <span v-if="$index === 0">{{row.username}}</span>
                    <span v-else class="special pointer"
                        @click="showMemberDetail({userId:row.userId,merchant:{id:row.merchantId}})">{{row.username}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="amount" :label="$t('领取金额')" min-width="100" align="center" />
            <el-table-column prop="playAmount" :label="$t('投注金额')" min-width="100" align="center" />
            <el-table-column prop="rechargeAmount" :label="$t('充值金额')" min-width="100" align="center" />
            <el-table-column prop="cashAmount" :label="$t('提现金额')" min-width="100" align="center" />
            <el-table-column prop="diff" :label="$t('充提差')" min-width="100" align="center" />
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>
        <MemberDetail v-if="state.memberDetailShow" :merchantId="state.merchantId" @close="state.memberDetailShow = false"></MemberDetail>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue"
import { getPromotionReportDetail } from '@/api/statistics.js'
import commonStore from '@/store/common'
const emits = defineEmits(['close'])
const commonData = commonStore()
const props = defineProps({
    itemData: {
        type: Object,
        default: {}
    },

})
const state = reactive({
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    memberDetailShow: false,
    merchantId: '',
})
const dialog = ref(null)

onMounted(() => {
    fetchData()
})

const fetchData = () => {
    const data = {
        period: props.itemData.period_,
        type: props.itemData.type,
        merchantId: (props.itemData.merchantId === 0 ? 0 : props.itemData.merchantId),
        ...state.listQuery
    }
    dialog.value.showLoading()
    getPromotionReportDetail(data).then(({ data = {}, ext = {} }) => {
        let { total, list } = data
        state.tableData = list || []
        if (state.tableData.length) {
            state.tableData.unshift({
                ...ext,
                username: $t('总计'),
            })
        }
        state.total = total
        dialog.value.closeLoading()
    }).catch(() => {
        state.tableData = []
        dialog.value.closeLoading()
    })
}

// 查看会员详情
const showMemberDetail = ({ userId, merchant }) => {
    commonData.memberId = userId
    state.merchantId = merchant.id
    state.memberDetailShow = true
}
</script>

<style lang="scss">
</style>
