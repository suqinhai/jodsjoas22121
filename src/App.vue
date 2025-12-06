<template>
    <el-config-provider :locale="locale">
        <router-view />
    </el-config-provider>
</template>

<script setup>
import { onBeforeMount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
// import commonStore from '@/store/common'
import { getLinkState } from '@/api/common'
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
import vi from 'element-plus/es/locale/lang/vi'
import { ref, watch } from 'vue';
import i18n from '@/i18n'
import { addListener, launch, crashBrowserCurrentTab } from 'devtools-detector';

const locale = ref()
const router = useRouter()
const route = useRoute()
// const commonData = commonStore()

// onBeforeMount(async () => {
//     try {
//         if(commonData.currentMerchantSite.id) await getLinkState()
//         if (route.path === '/ip-restrictions') {
//             router.replace('/')
//         }
//     } catch (error) { }
// })

watch(
    () => i18n.global.locale.value,
    (val) => {
        if(val == 'zh'){
            locale.value = zhCn
        }else if(val == 'en'){
            locale.value = en
        }else if(val == 'vi'){
            locale.value = vi
        }
    },
    { deep: true, immediate: true },
)

if(process.env.VITE_MODE == 'production'){
    addListener((isOpen) => {
        if (isOpen) {
            setTimeout(crashBrowserCurrentTab(), 1000);
        }
    });
    launch();
}

</script>

<style>
</style>
