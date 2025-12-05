<template>
    <!-- 商户信息 -->
    <div class="container merchant-info">
        <div v-if="tableData.length" class="head" style="margin-top: 0">{{$t('商户额度：')}}</div>
        <div>
            <el-table v-if="tableData.length" :data="tableData" border>
                <el-table-column prop="id" :label="$t('商户ID')" min-width="80" align="center" />
                <el-table-column prop="name" :label="$t('商户名称')" min-width="140" align="center" />
                <el-table-column prop="totalAmount" :label="$t('可用额度(U)')" min-width="140" align="center" />
                <el-table-column prop="activeAmount" :label="$t('商户余额(U)')" min-width="140" align="center" />
                <el-table-column prop="overdraftAmount" :label="$t('授信额度(U)')" min-width="140" align="center" />
                <el-table-column prop="unpaidBill" :label="$t('未结账单(U)')" min-width="140" align="center" />
                <el-table-column prop="pendingBill" :label="$t('未出账单')" min-width="140" align="center">
                    <template #header>{{$t('未出账单')}}
                        <el-icon class="pointer" :size="15" @click="showExplainDialog = true">
                            <QuestionFilled />
                        </el-icon>
                    </template>
                    <template #default="{ row }">
                        <span class="special pointer" @click="clickPendingBill(row)">
                            {{row.pendingBill}}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column prop="status_" :label="$t('站点状态')" min-width="100" align="center" />
                <el-table-column fixed="right" :label="$t('操作')" width="140" align="center">
                    <template #default>
                        <!-- <el-button v-permiss="'admin.merchant.editSiteStatus'" v-throttle type="primary" text
                        @click="handleEdit(row)">{{$t('修改状态')}}</el-button> -->
                        <el-button v-if="isShowRc" v-throttle type="primary" text @click="router.push('/merchant-center/merchant-recharge')">
                            {{$t('充币')}}</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="head">{{$t('商户信息：')}}</div>
        <MerchantInfo></MerchantInfo>
        <div v-permiss="'admin.merchant.gameShare'" class="head">{{$t('游戏分成：')}}</div>
        <GameDivision v-if="userData.isHasPermiss('admin.merchant.gameShare')"></GameDivision>

        <EditSiteDialog v-if="showEditDialog" :item="currentItem" @close="showEditDialog = false" @refresh="getList">
        </EditSiteDialog>
        <PendingBillDialog v-if="showPendingBillDialog" @close="showPendingBillDialog = false" @showUnPendingDialog="showUnPending">
        </PendingBillDialog>
        <UnPendingDialog v-if="showUnPendingDialog" :item="currentItem" @close="showUnPendingDialog = false"></UnPendingDialog>
        <ExplainDialog v-if="showExplainDialog" @close="showExplainDialog = false"></ExplainDialog>
    </div>
</template>

<script setup name="merchantInfo">
import { ref, reactive, onMounted, defineAsyncComponent, computed } from 'vue'
import { useRouter } from 'vue-router'
import userStore from '@/store/user'
const MerchantInfo = defineAsyncComponent(() => import('./components/MerchantInfo.vue'))
const GameDivision = defineAsyncComponent(() => import('./components/GameDivision.vue'))
const EditSiteDialog = defineAsyncComponent(() => import('./components/EditSiteDialog.vue'))
const PendingBillDialog = defineAsyncComponent(() => import('./components/PendingBillDialog.vue'))
const UnPendingDialog = defineAsyncComponent(() => import('./components/UnPendingDialog.vue'))
const ExplainDialog = defineAsyncComponent(() => import('./components/ExplainDialog.vue'))

const router = useRouter()
const tableData = reactive([])
const showEditDialog = ref(false)
const showPendingBillDialog = ref(false)
const showExplainDialog = ref(false)
const showUnPendingDialog = ref(false)
const currentItem = ref({})
const userData = userStore()

const isShowRc = computed(() => {
    return userData.isHasMenuPermiss('merchant.merchant-recharge.products')
})

onMounted(() => {
    getList()
})
const handleEdit = (item) => {
    showEditDialog.value = true
    currentItem.value = item
}

const clickPendingBill = (item) => {
    showPendingBillDialog.value = true
    currentItem.value = item
}

const getList = () => {
    tableData.length = 0
    userData.getMerchantDetail().then(() => {
        tableData.push(userData.merchantInfo)
    })
}

const showUnPending = (item) => {
    showUnPendingDialog.value = true
    currentItem.value = item
}
</script>

<style lang='scss'>
.merchant-info {
    .head {
        font-size: 16px;
        color: #666;
        line-height: 30px;
        margin-top: 20px;
    }
}
</style>