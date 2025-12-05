<template>
    <!-- 商户信息-站未出账单-游戏分成明细 -->
    <Dialog width="900" :title="`${$t('站点ID：')}${item.id} ${userData.siteInfo.commissionMode === 2 ? $t('打码模式') : $t('损益模式')}`" top="5vh"
        :isShowSubmit="false" @cancel="cancel">
        <el-table :data="tableData" border>
            <el-table-column prop="name" :label="$t('游戏平台')" min-width="100" align="center" />
            <el-table-column prop="typeLabel" :label="$t('游戏类型')" min-width="100" align="center" />
            <el-table-column prop="maRate" :label="$t('你的费率%')" min-width="100" align="center">
                <template #default="{ row }">
                    <template v-if="isBetMode(row.alias)">
                        <div>rtp&#62;100：{{row.rtpUpRate}}</div>
                        <div>rtp&#60;100：{{row.rtpDnRate}}</div>
                    </template>
                    <div v-else>{{row.maRate}}</div>
                </template>
            </el-table-column>
            <el-table-column prop="rtpUpValidCoin" :label="$t('投注')" min-width="100" align="center" v-if="userData.siteInfo.commissionMode === 2">
                <template #default="{ row }">
                    <div v-if="isBetMode(row.alias)">rtp&#62;100：{{row.rtpUpValidCoin}}</div>
                    <div v-if="isBetMode(row.alias)">rtp&#60;100：{{row.rtpDnValidCoin}}</div>
                </template>
            </el-table-column>
            <el-table-column prop="winLoseCoin" :label="$t('输赢')" min-width="100" align="center" />
            <el-table-column prop="totalCoin" :label="$t('贡献')" min-width="100" align="center">
                <template #default="{ row }">
                    <template v-if="isBetMode(row.alias)">
                        <div>rtp&#62;100：{{row.rtpUpTotalCoin}}</div>
                        <div>rtp&#60;100：{{row.rtpDnTotalCoin}}</div>
                    </template>
                    <div v-else>{{row.totalCoin}}</div>
                </template>
            </el-table-column>
        </el-table>
    </Dialog>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { getUnPendingShareData } from '@/api/merchant_center'
import userStore from '@/store/user'

const emits = defineEmits(['close'])
const props = defineProps(['item'])
const userData = userStore()
const tableData = ref([])

onMounted(() => {
    getList()
})

const isBetMode = (alias) => {
    return userData.siteInfo.commissionMode === 2 && ['PGC', 'NJL', 'NPP'].includes(alias)
}

const getList = () => {
    getUnPendingShareData({ id: props.item.id }).then(res => {
        if (res.code === 0) {
            tableData.value = res.data
        }
    })
}

const cancel = () => {
    emits('close')
}
</script>

<style lang='scss'>
</style>