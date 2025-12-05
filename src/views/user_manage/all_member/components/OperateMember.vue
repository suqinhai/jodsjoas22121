<!--
 * @Author: yilaisai
 * @Date: 2025-01-16 11:30:47
 * @LastEditors: yilaisai
 * @LastEditTime: 2025-01-16 11:54:12
-->
<template>
    <!-- 所有会员-操作会员 -->
    <Dialog ref="dialog" width="550" :title="$t('操作')" top="15vh" @confirm="handleSubmit(operateForm)" @cancel="cancel">
        <el-form ref="operateForm" :rules="state.rules" :model="state.formData" :label-width="$locale == 'zh' ? '90px' : 'auto'">
            <el-form-item :label="$t('操作类型:')" prop="type" v-if="!itemData.operateType">
                <el-select v-model="state.formData.type" style="width: 100%" :placeholder="$t('请选择操作类型')">
                    <el-option :label="$t('解除兑换密码限制')" :value="0" />
                    <el-option v-for="item in showData" :key="item.value" :label="item.label" :value="Number(item.value)" />
                </el-select>
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { ref, reactive, computed } from 'vue'
import { operateMemberConfig } from '@/api/member'

const emits = defineEmits(['fetchData', 'close'])
const props = defineProps({
    itemData: {
        type: Object,
        default: {}
    },
    metaData: {
        type: Object,
        default: {}
    },
})
const dialog = ref(null)
const operateForm = ref(null)
const state = reactive({
    formData: {},
    rules: {
        type: [{ required: true, message: $t('请选择操作类型！'), trigger: 'change' }],
        memberLevel: [{ required: true, message: $t('请选择会员层级！'), trigger: 'change' }],
        memberTag: [{ required: true, message: $t('请选择会员标签！'), trigger: 'change' }],
        superiorAgent: [{ required: true, message: $t('请输入账号或ID！'), trigger: 'blur' }],
    }
})

const showData = computed(() => {
    return props.metaData.userHandleType.filter(item => +item.value < 10)
})

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            state.formData.ids = [props.itemData.id]
            state.formData.merchantId = props.itemData.merchantId
            dialog.value.showLoading()
            operateMemberConfig(state.formData).then(res => {
                cancel()
                emits('fetchData', { key: 'cut' })
            }).catch(err => {
                dialog.value.closeLoading()
            })

        } else {
            ElMessage.warning($t('请完善表单内容再进行提交！'))
        }
    })
}

const cancel = () => {
    emits('close')
}
</script>

<style scoped lang="scss">
</style>
