<template>
    <!-- 品牌设置-页脚配置 -->
    <div class="web-footer-config">
        <el-tabs v-model="tabItem">
            <el-tab-pane :label="$t('通用配置')" :name="1"></el-tab-pane>
            <el-tab-pane :label="$t('总台技术支持')" :name="2" v-if="userData.isHasPermiss('merchant.app.layout-techSupport')"></el-tab-pane>
        </el-tabs>
        <template v-if="tabItem === 1">
            <CommonConfig :metaData="metaData" v-if="userData.getTemplateType() !== 4"></CommonConfig>
            <CustomConfig :metaData="metaData" v-else></CustomConfig>
        </template>
        <TechnicalSupport v-if="tabItem === 2" :metaData="metaData"></TechnicalSupport>
    </div>
</template>

<script setup>
import { ref, defineAsyncComponent } from 'vue'
import userStore from '@/store/user'
const CommonConfig = defineAsyncComponent(() => import("./components/CommonConfig.vue"))
const CustomConfig = defineAsyncComponent(() => import("./components/CustomConfig.vue"))
const TechnicalSupport = defineAsyncComponent(() => import("./components/TechnicalSupport.vue"))

const props = defineProps({
    metaData: {
        type: Object,
        default: () => {
            return {}
        }
    }
})
let tabItem = ref(1)
const userData = userStore()

</script>

<style lang="scss">
.web-footer-config {
    height: calc(100% - 55px);
    margin-top: -10px;
}
</style>