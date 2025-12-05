<template>
    <!-- 游戏中心-中奖排行管理 -->
    <div class="container user-winning-rank">
        <el-tabs v-model="activeTab">
            <el-tab-pane v-for="(item,index) in tabData" :key="index" :label="item.title" :name="item.value">
            </el-tab-pane>
        </el-tabs>
        <RankingList v-if="activeTab === 1"></RankingList>
        <ManuallyAddedRecords v-if="activeTab === 2"></ManuallyAddedRecords>
    </div>
</template>

<script setup name="userWinningRank">
import { defineAsyncComponent, ref } from 'vue'
const RankingList = defineAsyncComponent(() => import("./ranking_list/index.vue"))
const ManuallyAddedRecords = defineAsyncComponent(() => import("./manually_added_records/index.vue"))

const tabData = ref([
    { title: $t('排行榜'), value: 1 },
    { title: $t('手动添加记录'), value: 2 },
])
const activeTab = ref(1)
</script>

<style lang="scss">
.user-winning-rank {
}
</style>
