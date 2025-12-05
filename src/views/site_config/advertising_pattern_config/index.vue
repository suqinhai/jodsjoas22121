<template>
    <!-- 站点配置-广告埋点配置 -->
    <div class="container advertising-pattern-config">
        <el-tabs v-model="state.activeTab" @tab-click="tabClick">
            <el-tab-pane v-for="(item,index) in filterTabData()" :key="index" :label="item.title" :name="item.value">
            </el-tab-pane>
        </el-tabs>
        <PatternStatistics v-if="state.activeTab === 1" :channelPattern="state.channelPattern" @lookChannelData="lookChannelData"></PatternStatistics>
        <PatternConfig v-if="state.activeTab === 2" :channelPattern="state.channelPattern" :currentItem="state.currentItem"></PatternConfig>
        <AdjustConfig v-if="state.activeTab === 3" :channelPattern="state.channelPattern" :currentItem="state.currentItem"></AdjustConfig>

    </div>
</template>

<script setup name="advertisingPatternConfig">
import { reactive, defineAsyncComponent } from 'vue'
import userStore from '@/store/user'
import { getCommonMeta } from '@/api/common'
const PatternStatistics = defineAsyncComponent(() => import("./components/PatternStatistics.vue"))
const PatternConfig = defineAsyncComponent(() => import("./components/PatternConfig.vue"))
const AdjustConfig = defineAsyncComponent(() => import("./components/AdjustConfig.vue"))

const tabData = [
    { title: $t('埋点统计'), value: 1 },
    { title: $t('埋点配置'), value: 2 },
    { title: $t('Adjust配置'), value: 3 },
]
const filterTabData = () => {
  const baseTabData = [
    { title: $t('埋点统计'), value: 1 },
    { title: $t('埋点配置'), value: 2 },
  ]
  if (userData.isHasPermiss('merchant.channel.apiList')) {
    baseTabData.push({ title: $t('Adjust配置'), value: 3 })
  }
  return baseTabData
}
const state = reactive({
    activeTab: 1,
    currentItem: {},
    channelPattern: []
})
const userData = userStore()

getCommonMeta({ types: 'channelPattern' }).then(res => {
    state.channelPattern = res.data?.channelPattern || []
})

const lookChannelData = (val) => {
    state.currentItem = { ...val }
    state.activeTab = 2
}

const tabClick = (val) => {
    state.currentItem = {}
}
</script>

<style lang="scss">
.advertising-pattern-config {
}
</style>
