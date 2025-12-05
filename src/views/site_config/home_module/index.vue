<template>
    <!-- 站点配置-首页模块 -->
    <div class="container home-module">
        <el-tabs v-model="tabType">
            <el-tab-pane :label="$t('首页设置')" name="decorators">
                <HomeSettings></HomeSettings>
            </el-tab-pane>
            <el-tab-pane v-if="userData.getTemplateType() !== 4 && userData.getTemplateType() !== 5" :label="$t('首页活动设置')" name="sections">
                <HomeActivitySettings :sections="sections"></HomeActivitySettings>
            </el-tab-pane>
            <el-tab-pane v-if="userData.getTemplateType() !== 4 && userData.getTemplateType() !== 5" :label="$t('关于我们和用户协议')" name="agreement">
                <AgreementSettings :sections="sections"></AgreementSettings>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script setup name="homeModule">
import { ref, onMounted, onActivated } from 'vue'
import { useRoute } from 'vue-router'
import userStore from '@/store/user'
import commonStore from '@/store/common'
import { getHomeDeploy } from '@/api/website'
import HomeSettings from './home_settings/index.vue'
import HomeActivitySettings from './home_activity_settings/index.vue'
import AgreementSettings from './agreement_settings/index.vue'

let tabType = ref('decorators')
let queryType = ref('')
let isInit = ref(true)
let sections = ref({})
const route = useRoute()
const userData = userStore()
const commonData = commonStore()

onMounted(() => {
    if (commonData.isManual) isInit.value = false
    if (route.query.merchantId && +route.query.merchantId !== commonData.currentMerchantSite.id && !commonData.isManual) {
        commonData.setCurrentMerchantSite(+route.query.merchantId)
        return
    }
    if (route.query.type && !queryType.value) {
        queryType.value = route.query.type
        tabType.value = queryType.value
    }
    getHomeData()
})

onActivated(() => {
    if (isInit.value) return isInit.value = false
    if (route.query.merchantId && +route.query.merchantId !== commonData.currentMerchantSite.id && !commonData.isManual) {
        commonData.setCurrentMerchantSite(+route.query.merchantId)
        return
    }
    if (route.query.type && queryType.value !== route.query.type) {
        queryType.value = route.query.type
        tabType.value = route.query.type
    }
})

// 获取首页配置数据
const getHomeData = () => {
    globalVBus.$emit('globalLoading', true)
    getHomeDeploy({ part: 'sections', type: 'home' }).then(res => {
        let { data } = res
        sections.value = data
        globalVBus.$emit('globalLoading', false)
    }).catch((err) => {
        globalVBus.$emit('globalLoading', false)
    })
}

</script>

<style lang="scss">
.home-module {
}
</style>
