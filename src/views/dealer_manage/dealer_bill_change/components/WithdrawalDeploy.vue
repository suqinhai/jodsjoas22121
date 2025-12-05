<template>
    <!-- 经销商提现-提现设置 -->
    <Dialog ref="dialogRef" width="500" :title="$t('提现设置')" buttonCenter top="8vh" @confirm="handleSubmit(deployForm)" @cancel="cancel">
        <el-form ref="deployForm" :rules="state.rules" :model="state.formData" :label-width="$locale == 'zh' ? '130px' : 'auto'">
            <el-form-item :label="$t('手续费:')" prop="fee">
                <el-input-number style="width: 95%;margin-right: 5px" v-model="state.formData.fee" :controls="false" :precision="2" :min="0"
                    :placeholder="$t('请输入手续费')" />%
            </el-form-item>
            <el-form-item :label="$t('单笔额度最小值:')" prop="min">
                <el-input-number style="width: 100%" v-model="state.formData.min" :controls="false" :precision="2" :min="0"
                    :placeholder="$t('请输入单笔额度最小值')" />
            </el-form-item>
            <el-form-item :label="$t('单笔额度最大值:')" prop="max">
                <el-input-number style="width: 100%" v-model="state.formData.max" :controls="false" :precision="2" :min="0"
                    :placeholder="$t('请输入单笔额度最大值')" />
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { postBalanceRevisionData } from '@/api/finance'

const emits = defineEmits(['fetchData', 'close'])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        }
    },
})
const dialogRef = ref(null)
const deployForm = ref(null)
const state = reactive({
    formData: {},
    rules: {
        fee: [{ required: true, message: $t('请输入手续费！'), trigger: 'blur' }],
        min: [{ required: true, message: $t('请输入单笔额度最小值！'), trigger: 'blur' }],
        max: [{ required: true, message: $t('请输入单笔额度最大值！'), trigger: 'blur' }],
    }
})

onMounted(() => {
    state.formData = { ...props.itemData }
})

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            dialogRef.value.showLoading()
            postBalanceRevisionData(state.formData).then(res => {
                cancel()
            }).catch(err => {
                dialogRef.value.closeLoading()
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

<style lang="scss">
</style>
