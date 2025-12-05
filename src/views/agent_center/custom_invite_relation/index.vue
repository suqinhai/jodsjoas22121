<template>
    <div class="container custom-invite-relation">
        <el-tabs v-model="state.type">
            <el-tab-pane v-for="(item,index) in showTabList" :key="index" :label="item.title" :name="item.value">
            </el-tab-pane>
        </el-tabs>
        <InviterList v-if="state.type == 1" />
        <InvitationalQuery v-if="state.type == 2"/>
    </div>
</template>

<script setup>
import { reactive, defineAsyncComponent } from 'vue'
const InviterList = defineAsyncComponent(() => import('./components/InviterList.vue'))
const InvitationalQuery = defineAsyncComponent(() => import('./components/InvitationalQuery.vue'))
const state = reactive({
    type: 1
})
const showTabList = reactive([
    { title: $t('邀请人列表'), value: 1 },
    { title: $t('邀请关系查询'), value: 2 },
])

</script>

<style scoped></style>