<template>
    <!-- 大R玩家报表-详情 -->
    <Dialog ref="dialog" width="700" :title="titleData[itemData.dialogType]" :isShowSubmit="false" top="6vh" @cancel="emits('close')">
        <el-table :data="state.tableData" border>
            <el-table-column :label="$t('会员账号')" min-width="100" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="handleInfo(row.user.id)">
                        {{ row.user?.name || '' }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="rechargeAmount" :label="$t('当日充值总金额')" min-width="100" align="center" />
            <el-table-column prop="cashAmount" :label="$t('当日提现总金额')" min-width="100" align="center" />
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue"
import { getPlayerReportInfo } from '@/api/statistics'

const emits = defineEmits(['showMemberDetail', 'close'])
const props = defineProps({
    itemData: {
        type: Object,
        default: {}
    },
})
let titleData = {
    1: $t('小R玩家详情'),
    2: $t('中R玩家详情'),
    3: $t('大R玩家详情'),
}
const state = reactive({
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
})
const dialog = ref(null)

onMounted(() => {
    fetchData()
})

// 表格过滤数据处理
const fetchData = () => {
    let params = { ...state.listQuery }
    let { dialogType, reportTime_ } = props.itemData
    if (reportTime_) {
        params['interval.begin'] = reportTime_
        params['interval.end'] = reportTime_
    }
    params.level = dialogType
    dialog.value.showLoading()
    getPlayerReportInfo(params).then(res => {
        let { total, list } = res.data
        state.tableData = list
        state.total = total
        dialog.value.closeLoading()
    }).catch(err => {
        state.tableData = []

        dialog.value.closeLoading()
    })
}

const handleInfo = (id) => {
    emits('showMemberDetail', id)
}
</script>

<style lang="scss">
</style>
