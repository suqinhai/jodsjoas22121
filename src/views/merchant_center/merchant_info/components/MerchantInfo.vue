<template>
    <!-- 商户信息-商户信息 -->
    <div>
        <el-table :data="tableData" border>
            <el-table-column prop="openFee" :label="$t('开站费')" min-width="100" align="center" />
            <el-table-column prop="lineCost" :label="$t('线路费用')" min-width="100" align="center" />
            <el-table-column prop="monthMin" :label="$t('游戏月保底')" min-width="100" align="center" />
            <el-table-column prop="zone" :label="$t('时区')" min-width="130" align="center" />
            <el-table-column prop="languages" :label="$t('客户端语言')" min-width="180" align="center" />
            <el-table-column prop="currency" :label="$t('币种')" min-width="100" align="center" />
            <el-table-column prop="serverVendor" :label="$t('OSS数据中心')" min-width="120" align="center" />
            <el-table-column prop="commissionMode" :label="$t('RTP抽成模式')" min-width="120" align="center" />
        </el-table>
    </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue';
import { getMerchantInfo } from '@/api/merchant_center'
const tableData = reactive([])

onMounted(() => {
    getList()
})

const getList = () => {
    getMerchantInfo().then(res => {
        if (res.code === 0) {
            let data = [res.data]
            tableData.push(...data)
        }
    })
}
</script>

<style lang='scss'>
</style>