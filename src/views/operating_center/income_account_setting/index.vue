<template>
    <!-- 存钱宝设置 -->
    <div class="container income-account-setting">
        <div class="head">{{$t('余额宝开关：')}}
            <el-switch :disabled="!userData.isHasPermiss('merchant.income.toggle')" v-model="state.status" :active-value="1" :inactive-value="0"
                @change="switchChange" />
        </div>
        <el-table :data="state.tableData" border>
            <el-table-column prop="yearRate" :label="$t('年利率（%）')" min-width="200" align="center" />
            <el-table-column prop="hourRate" :label="$t('每小时利率(%)')" min-width="200" align="center" />
            <el-table-column prop="period" :label="$t('结算周期(小时)')" min-width="200" align="center" />
            <el-table-column prop="minDeposit" :label="$t('最低存入金额')" min-width="200" align="center" />
            <el-table-column prop="auditTimes" :label="$t('利息稽核倍数')" min-width="200" align="center" />
            <el-table-column fixed="right" width="100" :label="$t('操作')" align="center">
                <template #default="{ row }">
                    <el-button v-permiss="'merchant.income.editRule'" v-throttle type="primary" text @click="handleConfig(row)">{{$t('修改')}}
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <DeployDialog v-if="state.showDialog" :itemData="state.itemData" @close="state.showDialog = false" @fetchData="fetchData">
        </DeployDialog>
    </div>
</template>

<script setup name="incomeAccountSetting">
import { reactive, onMounted, defineAsyncComponent } from 'vue'
import userStore from '@/store/user'
import { getIncomeAccountRule, postIncomeAccountStatus } from "@/api/discounts_center.js"
const DeployDialog = defineAsyncComponent(() => import("./components/DeployDialog.vue"))

const state = reactive({
    tableData: [],
    itemData: {},
    showDialog: false,
    status: 0,
})
const userData = userStore()

onMounted(() => {
    fetchData()
})

const fetchData = () => {
    globalVBus.$emit('globalLoading', true)
    getIncomeAccountRule().then(({ data }) => {
        if (data) {
            state.tableData = []
            state.tableData.push(data)
            state.status = data.status
        } else {
            state.tableData = [{
                yearRate: 0,
                hourRate: 0,
                period: 0,
                minDeposit: 0,
                auditTimes: 1,
            }]
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

const switchChange = (status) => {
    globalVBus.$emit('globalLoading', true)
    postIncomeAccountStatus({ status }).then(res => {
        fetchData()
    }).catch(err => {
        state.status = status ? 0 : 1
        globalVBus.$emit('globalLoading', false)
    })
}

const handleConfig = (row) => {
    state.itemData = { ...row }
    state.showDialog = true
}
</script>

<style lang="scss" scoped>
.income-account-setting {
    .head {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        margin-bottom: 10px;
        padding-right: 20px;
    }
}
</style>
