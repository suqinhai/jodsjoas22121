<template>
    <!-- 运营中心-网红排行榜奖励 -->
    <div class="tabs influencer-ranking-award">
        <el-tabs v-model="activeTab">
            <el-tab-pane v-for="(item,index) in tabData" :key="index" :label="item.title" :name="item.value">
                <RankingDataTable :type="item.value"></RankingDataTable>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script setup name="influencerRankingAward">
import { ref, defineAsyncComponent } from 'vue'
const RankingDataTable = defineAsyncComponent(() => import("./components/RankingDataTable.vue"))

const tabData = [
    { title: $t('直属首充人数排名'), value: 0 },
    { title: $t('直属佣金排名'), value: 1 },
]
const activeTab = ref(0)

</script>

<style lang="scss">
.influencer-ranking-award {
}
</style>
