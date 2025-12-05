<template>
    <!-- 站点配置-APP管理配置 -->
    <div class="container app-manage">
        <el-tabs v-model="activeTab" v-if="showTabList.length">
            <el-tab-pane v-for="(item,index) in showTabList" :key="index" :label="item.title" :name="item.value">
            </el-tab-pane>
        </el-tabs>
        <AppConfig v-if="activeTab === 1"></AppConfig>
        <DownloadBar v-if="activeTab === 2 && userData.getTemplateType() !== 4"></DownloadBar>
        <AppDownload v-if="activeTab === 2  && userData.getTemplateType() === 4"></AppDownload>
    </div>
</template>

<script setup name="appManage">
import { defineAsyncComponent, ref, computed, onMounted } from 'vue'
import userStore from '@/store/user'
import { useRoute } from 'vue-router'
const AppConfig = defineAsyncComponent(() => import("./app_config/index.vue"))
const DownloadBar = defineAsyncComponent(() => import("./download_bar/index.vue"))
const AppDownload = defineAsyncComponent(() => import("./app_download/index.vue"))

const tabData = ref([
    { title: $t('APP配置'), value: 1 },
    // { title: $t('顶部下载条设置'), value: 2, permissionCode: 'merchant.download-bar-config.list' },
])
const activeTab = ref('')
const tab = ref('')
const route = useRoute()
const userData = userStore()

const showTabList = computed(() => {
    return tabData.value.filter(item => item.value === 1 || userData.isHasPermiss(item.permissionCode))
})

onMounted(() => {
    userData.getTemplateType() === 4 ? tabData.value.push({ title: $t('APP下载设置'), value: 2, permissionCode: 'merchant.download-bar-config.list' }) : tabData.value.push({ title: $t('顶部下载条设置'), value: 2, permissionCode: 'merchant.download-bar-config.list' })
    if (route.query.tab && !tab.value) {
        tab.value = +route.query.tab
        activeTab.value = showTabList.value.some(its => its.value === tab.value) ? tab.value : showTabList.value[0] ? showTabList.value[0].value : ''
    } else if (!route.query.tab && !tab.value) {
        activeTab.value = showTabList.value[0] ? showTabList.value[0].value : ''
    }
})
</script>

<style lang="scss">
.app-manage {
}
</style>
