<template>
    <!-- 有奖反馈 -->
    <div class="container rewarded-feedback">
        <el-tabs v-model="type">
            <el-tab-pane v-for="(item,index) in tabData" :key="index" :label="item.title" :name="item.id">
            </el-tab-pane>
        </el-tabs>
        <TableComponent :type="type"></TableComponent>
    </div>
</template>

<script setup name="rewardedFeedback">
import { ref } from 'vue'
import TableComponent from './components/TableComponent.vue'

const tabData = [
    { id: 0, title: $t('待处理') },
    { id: 1, title: $t('已采纳') },
    { id: 2, title: $t('已忽略') },
    { id: '', title: $t('全部反馈') },
]
const type = ref(0)
</script>

<style lang="scss">
</style>
