<template>
    <!-- 用户管理-层级设置 -->
    <Dialog ref="dialog" width="1200" :title="$t('新增/编辑')" :isShowSubmit="false" top="5vh" @cancel="cancel">
        <el-tabs class="levle-config-tab" v-model="currentTab">
            <el-tab-pane :label="$t('自动层级')" :name="0">
                <LevelDeployComponent :userHandleType="userHandleType" :levelType="0"></LevelDeployComponent>
            </el-tab-pane>
            <el-tab-pane :label="$t('固定层级')" :name="1">
                <LevelDeployComponent :userHandleType="userHandleType" :levelType="1"></LevelDeployComponent>
            </el-tab-pane>
        </el-tabs>
    </Dialog>
</template>

<script setup>
import { ref, defineAsyncComponent, provide } from 'vue'
const LevelDeployComponent = defineAsyncComponent(() => import('./LevelDeployComponent.vue'))

const emits = defineEmits(['close', 'fetchData'])
const props = defineProps({
    userHandleType: {
        type: Array,
        default: () => []
    },
    merchantId: {
        default: ''
    }
})
let currentTab = ref(0)
const dialog = ref(null)

const cancel = () => {
    emits('close')
    emits('fetchData')
}

provide('provideData', {
    merchantId: props.merchantId,
    userHandleType: props.userHandleType,
    'showLoading': () => dialog.value.showLoading(),
    'closeLoading': () => dialog.value.closeLoading(),
})
</script>

<style lang="scss">
.levle-config-tab {
    margin-top: -20px;
}
</style>
