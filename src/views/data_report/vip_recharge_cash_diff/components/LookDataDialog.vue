
<template>
    <!-- VIP升级统计-所有数据/统计详情 -->
    <Dialog ref="dialog" :title="!itemData.type ? $t('VIP升级统计-所有数据') : $t('统计详情')" :isShowSubmit="false" @cancel="emits('close')" width="1000" top="5vh">
        <div v-if="itemData.type" class="title">
            <div class="small-box">{{$t('日期：')}}{{itemData.period}}</div>
            <div v-if="itemData.type === 1">{{$t('VIP人数：')}}{{itemData.vipNum}}</div>
            <div v-if="itemData.type === 2">{{$t('充值人数：')}}{{itemData.rechargeNum}}</div>
            <div v-if="itemData.type === 3">{{$t('提现人数：')}}{{itemData.cashNum}}</div>
        </div>
        <el-table :data="state.tableData" class="table-box" border
            :row-class-name="({row,rowIndex}) => (!itemData.type && !rowIndex ? 'total-row': '')">
            <el-table-column v-if="itemData.type === 2 || itemData.type === 3" prop="localTime" :label="itemData.type === 3 ? $t('提现时间') : $t('充值时间')"
                min-width="160" align="center" />
            <el-table-column :label="$t('VIP等级')" min-width="120" align="center">
                <template #default="{ row }">
                    {{typeof row.level === 'number' ? 'VIP' + row.level : $t('总计')}}
                </template>
            </el-table-column>
            <template v-if="itemData.type">
                <el-table-column :label="$t('会员ID')" min-width="120" align="center">
                    <template #default="{ row }">
                        <span class="special pointer" @click="showMemberDetail({userId:row.user.id,merchant:{id:props.itemData.merchantId}})">{{row.user?.id || ''}}</span>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('会员账号')" min-width="140" align="center">
                    <template #default="{ row }">
                        <span class="special pointer" @click="showMemberDetail({userId:row.user.id,merchant:{id:props.itemData.merchantId}})">{{row.user?.name || ''}}</span>
                    </template>
                </el-table-column>
                <el-table-column v-if="itemData.type !== 1" prop="localAmount" :label="itemData.type === 3 ? $t('提现金额'):$t('充值金额')" min-width="120"
                    align="center" />
            </template>
            <template v-if="!itemData.type">
                <el-table-column prop="vipNum" :label="$t('VIP人数')" min-width="120" align="center" />
                <el-table-column prop="rechargeNum" :label="$t('充值人数')" min-width="120" align="center" />
                <el-table-column prop="rechargeAmount" :label="$t('充值金额')" min-width="120" align="center" />
                <el-table-column prop="cashNum" :label="$t('提现人数')" min-width="120" align="center" />
                <el-table-column prop="cashAmount" :label="$t('提现金额')" min-width="120" align="center" />
                <el-table-column prop="rechargeCashDiff" :label="$t('充提差（充-提）')" min-width="160" align="center" />
            </template>
        </el-table>
        <Pagination v-show="state.total > 0 && itemData.type" :total="state.total" v-model:limit="state.listQuery._size"
            v-model:page="state.listQuery._page" @pagination="fetchData"></Pagination>
		<MemberDetail v-if="state.memberDetailShow" :merchantId="state.merchantId" @close="state.memberDetailShow = false"></MemberDetail>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue"
import { getRechargeCashStatData } from '@/api/statistics'
import { dateFormat } from '@/common/util'
import commonStore from '@/store/common'
const commonData = commonStore()

const emits = defineEmits(['close', 'showMemberDetail'])
const props = defineProps({
    dataList: {
        type: Array,
        default: () => []
    },
    itemData: {
        type: Object,
        default: () => {
            return {}
        }
    }
})
const state = reactive({
    tableData: [],
    formData: {},
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
	memberDetailShow: false,
	merchantId: '',
})
const deployFormRef = ref(null)
const dialog = ref(null)

onMounted(() => {
    if (props.itemData.type) {
        fetchData()
    } else if (props.dataList.length) {
        state.tableData = [...props.dataList]
    }
})

// 表格过滤数据处理
const fetchData = () => {
    let { type, period, level } = props.itemData
    let params = { ...state.listQuery, type: type - 1, period, level, merchantId:props.itemData.merchantId }
    dialog.value.showLoading()
    getRechargeCashStatData(params).then(res => {
        let { total, list } = res.data
        if (list) {
            state.tableData = list.map(item => {
                item.localTime && (item.localTime = dateFormat(item.localTime))
                return item
            })
            state.total = total || 0
        }
        dialog.value.closeLoading()
    }).catch(err => {
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

<style lang="scss" scoped>
.title {
    display: flex;
    font-size: 16px;

    .small-box {
        margin-right: 40px;
    }
    margin-bottom: 10px;
}
</style>
