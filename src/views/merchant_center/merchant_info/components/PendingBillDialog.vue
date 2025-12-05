<template>
    <!-- 商户信息-未出账单明细 -->
    <Dialog width="700" :title="$t('未出账单明细')" top="5vh" :isShowSubmit="false" @cancel="cancel">
        <el-table :data="tableData" border>
            <el-table-column prop="id" :label="$t('站点ID')" min-width="100" align="center" />
            <el-table-column prop="name" :label="$t('站点名称')" min-width="100" align="center" />
            <el-table-column prop="pendingBill" :label="$t('未出账单')" min-width="100" align="center">
                <template #default="{ row }">
                    <span class="special pointer" @click="clickPendingBill(row)">
                        {{ row.pendingBill }}
                    </span>
                </template>
            </el-table-column>
			<el-table-column prop="cdnFee" :label="$t('cdn费用')" min-width="100" align="center">
				<template #default="{ row }">
			        {{ row.cdnFee || 0}}
			    </template>
			</el-table-column>
        </el-table>
    </Dialog>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { getUnPendingBillsData } from '@/api/merchant_center'

const emits = defineEmits(['close', 'showUnPendingDialog'])
const tableData = ref([])

onMounted(() => {
    getList()
})

const getList = () => {
    getUnPendingBillsData().then(res => {
        if (res.code === 0) {
            tableData.value = res.data
        }
    })
}

const clickPendingBill = (row) => {
    emits('showUnPendingDialog', row)
}

const cancel = () => {
    emits('close')
}
</script>

<style lang='scss'>
</style>