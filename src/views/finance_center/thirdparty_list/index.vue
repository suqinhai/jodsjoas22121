<template>
    <!-- 财务中心-支付通道数据 -->
    <div class="container thirdparty-list">
        <el-tabs v-model="activeTab">
            <el-tab-pane v-for="(item,index) in tabData" :key="index" :label="item.title" :name="item.value">
            </el-tab-pane>
        </el-tabs>
        <TableComponent :tab="1" v-if="activeTab === 1"></TableComponent>
        <TableComponent :tab="2" v-if="activeTab === 2" mockTransfer></TableComponent>
    </div>
</template>

<script setup name="thirdpartyList">
import { defineAsyncComponent, ref } from "vue"
const TableComponent = defineAsyncComponent(() => import("./components/TableComponent.vue"))

const tabData = [
    { title: $t('在线支付通道'), value: 1 },
    { title: $t('转账支付通道'), value: 2 },
]
const activeTab = ref(1)
</script>

<style lang="scss" scoped>
.thirdparty-list {
}
</style>
