<template>
    <!-- 经销商模式配置 -->
    <div class="tabs dealer-model-config">
        <el-tabs v-model="activeTab">
            <el-tab-pane :label="$t('常规内容编辑')" name="1">
                <BasicsContentSet></BasicsContentSet>
            </el-tab-pane>
            <el-tab-pane :label="$t('奖励比例设置')" name="2">
                <AwardRatioSet></AwardRatioSet>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script setup name="dealerModelConfig">
import { defineAsyncComponent, ref, onActivated } from "vue"
import { useRoute } from 'vue-router'
const BasicsContentSet = defineAsyncComponent(() => import('./components/BasicsContentSet.vue'))
const AwardRatioSet = defineAsyncComponent(() => import('./components/AwardRatioSet.vue'))

const activeTab = ref('1')
const tab = ref('')
const route = useRoute()

onActivated(() => {
    if ((route.query.tab && tab.value !== route.query.tab)) {
        tab.value = route.query.tab
        activeTab.value = tab.value
    }
})
</script>

<style lang="scss" scoped>
.dealer-model-config {
    min-width: 1150px;
}
</style>
