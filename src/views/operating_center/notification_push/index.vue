<template>
    <!-- 运营中心-消息推送 -->
    <div class="container notification-push">
        <el-tabs v-model="activeTab" v-if="userData.getTemplateType() === 4">
            <el-tab-pane v-for="(item,index) in tabData" :key="index" :label="item.title" :name="item.value">
            </el-tab-pane>
        </el-tabs>
        <NotificationList v-if="activeTab === 1"></NotificationList>
        <SystemMessage v-if="activeTab === 2 && userData.getTemplateType() === 4"></SystemMessage>
    </div>
</template>

<script setup name="notificationPush">
import { defineAsyncComponent, ref } from 'vue'
import userStore from '@/store/user'
const NotificationList = defineAsyncComponent(() => import("./notification_list/index.vue"))
const SystemMessage = defineAsyncComponent(() => import("./system_message/index.vue"))

const tabData = ref([
    { title: $t('消息列表'), value: 1 },
    { title: $t('C版系统推送'), value: 2 },
])
const activeTab = ref(1)
const userData = userStore()
</script>

<style lang="scss">
.notification-push {
}
</style>
