<template>
    <!-- VIP等级-稽核设置 -->
    <Dialog width="500" :title="$t('稽核设置')" top="10vh" buttonCenter @confirm="handleSubmit" @cancel="cancel"
        :operateActions="[$t('取消'), state.isEdit?$t('保存'):$t('修改')]">
        <el-form ref="auditForm" class="deploy-form" :model="state.formData" :label-width="$locale == 'zh' ? '75px' : 'auto'">
            <el-form-item :label="$t('稽核倍数:')" style="margin-bottom: 0">
                <div v-if="!state.isEdit">{{ state.formData.multiple }}</div>
                <el-input-number v-else style="width: 100%" v-model="state.formData.multiple" :min="0" :controls="false" :precision="2" />
            </el-form-item>
            <div class="mt20">{{ $t('注：该稽核倍数为，vip奖励（包括晋级，日周月）所需打码倍数') }}</div>
        </el-form>
    </Dialog>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { getAuditMultiplierList, editAuditMultiplier } from '@/api/finance'

const emits = defineEmits(['close'])
const state = reactive({
    isEdit: false,
    formData: {
        multiple: 0
    },
})

onMounted(() => {
    getAuditMultiplierList({ type: 2 }).then(res => {
        if (res.code === 0) {
            state.formData.multiple = res.data[0].multiple
        }
    })
})

const handleSubmit = () => {
    if (state.isEdit) {
        editAuditMultiplier({
            type: 2,
            multiple: state.formData.multiple
        }).then(res => {
            if (res.code === 0) {
                state.isEdit = false
            }
        })
    } else {
        state.isEdit = true
    }

}

const cancel = () => {
    emits('close')
}

</script>

<style lang="scss">
</style>