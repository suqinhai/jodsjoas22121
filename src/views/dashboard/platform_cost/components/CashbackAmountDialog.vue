<template>
    <!-- 首页-平台费用详情-返现金额 -->
    <Dialog ref="dialog" width="600" :title="$t('返现金额') + `（${itemData.period}）`" :isShowSubmit="false" top="5vh" @cancel="emits('close')">
        <div class="cashback-amount-table">
            <el-table :data="state.tableData" border>
                <el-table-column prop="merchantId" :label="$t('受邀商户ID')" min-width="120" align="center" />
                <el-table-column prop="inviteRegion" :label="$t('运营地区')" min-width="120" align="center" />
                <el-table-column prop="billRebate" :label="$t('返现金额')" min-width="160" align="center" />
            </el-table>
        </div>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue"
import { getPlatformRebateList } from '@/api/dashboard'

const emits = defineEmits(['close'])
const props = defineProps({
    itemData: {
        type: Object,
        default: {}
    },
})
const state = reactive({
    tableData: [],
})
const dialog = ref(null)

onMounted(() => {
    fetchData()
})

const fetchData = () => {
    dialog.value.showLoading()
    getPlatformRebateList(props.itemData).then(({ data }) => {
        state.tableData = data || []
        dialog.value.closeLoading()
    }).catch(err => {
        state.tableData = []
        dialog.value.closeLoading()
    })
}
</script>

<style lang="scss">
.cashback-amount-table {
    overflow-y: auto;
    max-height: 75vh;
}
</style>
