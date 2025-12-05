<template>
    <!-- 运营中心-网红排行榜记录 -->
    <div class="tabs influencer-ranking-record">
        <el-tabs v-model="activeTab">
            <el-tab-pane :label="$t('奖励发放记录')" :name="1">
                <AwardGiftRecord :metaData="metaData"></AwardGiftRecord>
            </el-tab-pane>
            <el-tab-pane :label="$t('每日自动赠送记录')" :name="2">
                <AutoGiftRecord :metaData="metaData"></AutoGiftRecord>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script setup name="influencerRankingRecord">
import { ref, reactive, onMounted, defineAsyncComponent } from 'vue'
import { getCommonMeta } from '@/api/common'
const AwardGiftRecord = defineAsyncComponent(() => import("./components/AwardGiftRecord.vue"))
const AutoGiftRecord = defineAsyncComponent(() => import("./components/AutoGiftRecord.vue"))

// const tabData = [
//     { title: $t('奖励发放记录'), value: 0 },
//     { title: $t('每日自动赠送记录'), value: 1 },
// ]
const activeTab = ref(1)
let metaData = reactive({
    bloggerRewardType: [],
    bloggerRankType: [],
})

onMounted(() => {
    getCommonMeta({ types: 'bloggerRewardType,bloggerRankType' }).then(res => {
        metaData = Object.assign(metaData, res.data || {})
    })
})
</script>

<style lang="scss">
.influencer-ranking-record {
}
</style>
