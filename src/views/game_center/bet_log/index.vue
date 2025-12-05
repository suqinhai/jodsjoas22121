<template>
    <!-- 投注记录 -->
    <div class="container bet-log">
        <el-tabs v-model="activeTab" v-if="showTabList.length">
            <el-tab-pane v-for="(item,index) in showTabList" :key="index" :label="item.title" :name="item.value">
            </el-tab-pane>
        </el-tabs>
        <BetDetails v-if="activeTab === 1"></BetDetails>
        <BetStatistics v-if="activeTab === 2"></BetStatistics>
    </div>
</template>

<script setup name="betLog">
import { defineAsyncComponent, ref, onActivated, computed, onMounted } from "vue"
import userStore from '@/store/user';
import { useRoute } from 'vue-router'
const BetDetails = defineAsyncComponent(() => import("./components/BetDetails.vue"))
const BetStatistics = defineAsyncComponent(() => import("./components/BetStatistics.vue"))

const tabData = [
    { title: $t('投注明细'), value: 1, permissionCode: 'admin.game-play-log.detail' },
    { title: $t('投注统计'), value: 2, permissionCode: 'admin.game-play-log.stat' },
]
const activeTab = ref('')
const tab = ref('')
const route = useRoute()
const userData = userStore()

const showTabList = computed(() => {
    return tabData.filter(item => userData.isHasPermiss(item.permissionCode))
})

onMounted(() => {
    if (route.query.tab && !tab.value) {
        tab.value = +route.query.tab
        activeTab.value = showTabList.value.some(its => its.value === tab.value) ? tab.value : showTabList.value[0] ? showTabList.value[0].value : ''
    } else if (!route.query.tab && !tab.value) {
        activeTab.value = showTabList.value[0] ? showTabList.value[0].value : ''
    }
})

onActivated(() => {
    if ((route.query.tab && tab.value !== +route.query.tab)) {
        tab.value = +route.query.tab
        activeTab.value = showTabList.value.some(its => its.value === tab.value) ? tab.value : showTabList.value[0] ? showTabList.value[0].value : ''
    }

})
</script>

<style lang="scss">
</style>
