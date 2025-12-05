<template>
    <!-- 新厂家申请-申请接入 -->
    <Dialog ref="dialog" width="500" :title="$t('申请接入')" top="15vh" buttonCenter @confirm="handleSubmit" @cancel="emits('close')">
        <el-form :model="state.formData" :label-width="$locale == 'zh' ? '85px' : 'auto'">
            <el-form-item :label="$t('厂家名称:')">
                {{itemData.alias_}}
            </el-form-item>
            <el-form-item :label="$t('游戏类型:')">
                {{itemData.type_}}
            </el-form-item>
            <el-form-item :label="$t('申请备注:')">
                <el-input style="width: 100%" type="textarea" :rows="4" :placeholder="$t('请输入申请备注')" v-model="state.formData.applyRemark" show-word-limit
                    maxlength="100" />
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, defineProps } from 'vue'
import { postMerchantApplyVendor } from '@/api/merchant_center.js'

const emits = defineEmits(['close', 'fetchData'])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        }
    }
})
const state = reactive({
    formData: {},
})
const dialog = ref(null)

const handleSubmit = () => {
    let { alias, type, vendorId } = props.itemData
    dialog.value.showLoading()
    postMerchantApplyVendor({
        alias,
        vendorId,
        type,
        applyRemark: state.formData.applyRemark
    }).then(() => {
        emits('close')
        emits('fetchData')
    }).catch(() => {
        dialog.value.closeLoading()
    })
}
</script>

<style lang="scss">
</style>
