<template>
    <!-- 品牌设置 -->
    <div class="brand-setting">
        <el-tabs v-model="activeTab">
            <el-tab-pane v-for="(item,index) in showTabList" :key="index" :label="item.title" :name="item.value">
            </el-tab-pane>
        </el-tabs>
        <LogoConfig v-if="activeTab === 1"></LogoConfig>
        <WebFooterConfig v-if="activeTab === 2" :metaData="metaData"></WebFooterConfig>
        <AboutAs v-if="activeTab === 3"></AboutAs>
        <UserAgreement v-if="activeTab === 4"></UserAgreement>
    </div>
</template>

<script setup name="appManage">
import { reactive, defineAsyncComponent, ref, computed, onMounted } from 'vue'
import userStore from '@/store/user'
import { useRoute } from 'vue-router'
import { getCommonMeta } from '@/api/common'
const LogoConfig = defineAsyncComponent(() => import("./logo_config/index.vue"))
const WebFooterConfig = defineAsyncComponent(() => import("./web_footer_config/index.vue"))
const AboutAs = defineAsyncComponent(() => import("./about_us/index.vue"))
const UserAgreement = defineAsyncComponent(() => import("./user_agreement/index.vue"))

const tabData = [
    { title: $t('LOGO设置'), value: 1 },
    { title: $t('页脚配置'), value: 2, permissionCode: 'merchant.app.layout-webFooter' },
    { title: $t('关于我们'), value: 3, permissionCode: 'admin.site-content.get-aboutUs' },
    { title: $t('用户协议'), value: 4, permissionCode: 'admin.site-content.get' },
]
const activeTab = ref('')
const tab = ref('')
const route = useRoute()
const userData = userStore()
let metaData = reactive({
    imType: [],
})

const showTabList = computed(() => {
    // if (userData.getTemplateType() === 5) {
    //     return tabData.filter(item => item.value === 1 || item.value === 2);
    // }
    return tabData.filter(item => {
        if (item.value === 1) {
            return true;
        }
        const hasPermission = userData.isHasPermiss(item.permissionCode);
        if (item.value === 3) {
            return hasPermission && userData.getTemplateType() !== 4;
        }
        return hasPermission;
    });
})

getCommonMeta({ types: 'imType' }).then(res => {
    metaData = Object.assign(metaData, res.data || {})
})

onMounted(() => {
    if (route.query.tab && !tab.value) {
        tab.value = +route.query.tab
        activeTab.value = showTabList.value.some(its => its.value === tab.value) ? tab.value : showTabList.value[0] ? showTabList.value[0].value : ''
    } else if (!route.query.tab && !tab.value) {
        activeTab.value = showTabList.value[0] ? showTabList.value[0].value : ''
    }
})


</script>

<style lang="scss">
.brand-setting {
    height: 100%;
    padding: 10px 20px;
}
</style>
