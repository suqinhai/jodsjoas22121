<template>
    <!-- 商户信息-游戏分成 -->
    <div style="padding-bottom: 40px;">
        <el-table :data="tableData" border>
            <el-table-column prop="name" :label="$t('游戏平台1')" min-width="150" align="center" />
            <el-table-column prop="typeLabel" :label="$t('游戏类型')" min-width="150" align="center" />
            <el-table-column prop="maRate" :label="$t('你的费率%')" min-width="100" align="center">
                <template #default="{ row }">
                    <template v-if="isBetMode(row.alias)">
                        <div>rtp&#62;100：{{row.rtpUpRate}}</div>
                        <div>rtp&#60;100：{{row.rtpDnRate}}</div>
                    </template>
                    <div v-else>{{row.maRate}}</div>
                </template>
            </el-table-column>
            <el-table-column prop="totalCoin" :label="$t('累计贡献')" min-width="120" align="center">
                <template #default="{ row }">
                    <template v-if="isBetMode(row.alias)">
                        <div>rtp&#62;100：{{row.rtpUpTotalCoin}}</div>
                        <div>rtp&#60;100：{{row.rtpDnTotalCoin}}</div>
                    </template>
                    <div v-else>{{row.totalCoin}}</div>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="tableData.length > 0" :total="pageInfo.total" v-model:page="pageInfo.pageNum" v-model:limit="pageInfo.pageSize"
            @pagination="getList"></Pagination>
    </div>
</template>

<script setup>
import { reactive, defineAsyncComponent, onMounted } from 'vue';
import { getGameDiv } from '@/api/merchant_center'
import userStore from '@/store/user'
const Pagination = defineAsyncComponent(() => import('@/components/Pagination/index.vue'))
const tableData = reactive([])
const userData = userStore()
const pageInfo = reactive({
    pageSize: 10,
    pageNum: 1,
    total: 0
})

const isBetMode = (alias) => {
    return userData.siteInfo.commissionMode === 2 && (alias == 'PGC' || alias == 'NJL' ||  alias == 'NPP')
}

const getList = () => {
    tableData.length = 0
    getGameDiv({
        _page: pageInfo.pageNum,
        _size: pageInfo.pageSize
    }).then(res => {
        const { data, code } = res
        if (code === 0) {
            tableData.push(...data.list)
            pageInfo.total = data.total
        }
    })
}

onMounted(() => {
    getList()
})
</script>

<style lang='scss'>
.game-division-tab {
}
</style>