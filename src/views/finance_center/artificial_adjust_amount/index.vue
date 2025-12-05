<template>
    <!-- 财务中心-人工加扣款 -->
    <div class="container artificial-adjust-amount">
        <el-tabs v-model="activeTab">
            <el-tab-pane v-for="(item,index) in tabData" :key="index" :label="item.title" :name="item.value">
            </el-tab-pane>
        </el-tabs>
        <DataList v-if="activeTab === 1" @lookInfo="lookInfo"></DataList>
        <Record v-else></Record>
    </div>
</template>

<script setup  name="artificialAdjustAmount">
import { defineAsyncComponent, ref, onMounted, onActivated } from "vue"
import { useRoute } from 'vue-router'
const DataList = defineAsyncComponent(() => import("./data_list/index.vue"))
const Record = defineAsyncComponent(() => import("./record/index.vue"))

const tabData = [
    { title: $t('人工加扣款列表'), value: 1 },
    { title: $t('批量上传记录'), value: 2 },
]
const activeTab = ref(1)
const tab = ref(0)
const route = useRoute()

const lookInfo = () => {
    activeTab.value = 2
}

onMounted(() => {
    if (route.query.tab && !tab.value) {
        tab.value = +route.query.tab
        activeTab.value = tab.value
    } else if (!route.query.tab && !tab.value) {
        activeTab.value = 1
    }
})

onActivated(() => {
    if ((route.query.tab && tab.value !== +route.query.tab)) {
        tab.value = +route.query.tab
        activeTab.value = tab.value
    }
})
</script>

<style lang="scss">
.artificial-adjust-amount {
}
</style>
