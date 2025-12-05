<template>
    <!-- 顶部-站点切换 -->
    <Dialog ref="dialog" width="400" :title="$t('切换站点')" top="15vh" :operateActions="[$t('关闭'), $t('确定')]" buttonCenter @confirm="handleSubmit"
        @cancel="cancel">
        <el-form :model="formData" :label-width="$locale == 'zh' ? '80px' : 'auto'">
            <el-form-item :label="$t('选择站点:')">
                <MerchantSiteSelect style="width: 100%" v-model="formData.merchantId" isShowId />
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import commonStore from '@/store/common'

const emits = defineEmits(['close', 'handleSite'])
const commonData = commonStore()
const formData = reactive({})

onMounted(() => {
    formData.merchantId = commonData.currentMerchantSite.id
})

const handleSubmit = () => {
    if (!formData.merchantId) return
    cancel()
    if (commonData.currentMerchantSite.id === formData.merchantId) return
    commonData.isManual = true
    emits('handleSite', formData.merchantId)
}

const cancel = () => {
    emits('close')
}

</script>

<style  lang="scss">
.edit-password {
}
</style>
