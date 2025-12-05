<template>
    <!-- 站点配置-虚拟彩金池 -->
    <div class="tabs virtual-handsel-pool">
        <el-tabs v-model="activeTab">
            <el-tab-pane v-for="(item,index) in tabData" :key="index" :label="item.title" :name="item.value">
				<VirtualHandselConfig v-if="index === 0 && activeTab === 0" :metaData="metaData"></VirtualHandselConfig>
				<VirtualHandselTemplate v-if="index === 1 && activeTab === 1" :metaData="metaData"></VirtualHandselTemplate>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script setup name="virtualHandselPool">
import { ref, reactive, defineAsyncComponent } from 'vue'
import style1 from '@/assets/img/handsel_pool/style1.png'
import style2 from '@/assets/img/handsel_pool/style2.png'
import style3 from '@/assets/img/handsel_pool/style3.gif'
import style4 from '@/assets/img/handsel_pool/style4.gif'
import userStore from '@/store/user'
const userData = userStore()
const VirtualHandselConfig = defineAsyncComponent(() => import("./virtual_handsel_config/index.vue"))
const VirtualHandselTemplate = defineAsyncComponent(() => import("./virtual_handsel_template/index.vue"))


const getImageUrl = (icon) => {
    return new URL(icon, import.meta.url).href
}
const tabData = [
    { title: $t('虚拟彩金池配置'), value: 0 },
    ...(userData.getTemplateType() !== 5 ? [{ title: $t('虚拟彩金池模板管理'), value: 1 }] : []),
]
const metaData = reactive({
	styleList: [
	    { value: 1, label: $t('样式1'), styleImage: getImageUrl(style1)  },
	    { value: 2, label: $t('样式2'), styleImage: getImageUrl(style2) },
	    { value: 3, label: $t('样式3'), styleImage: getImageUrl(style3) },
	    { value: 4, label: $t('样式4'), styleImage: getImageUrl(style4) },
	],
})
const activeTab = ref(0)

</script>

<style lang="scss">
.influencer-ranking-award {
}
</style>
