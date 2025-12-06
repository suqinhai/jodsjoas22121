<template>
    <!-- 调控会员限玩列表-触发参数设置 -->
    <Dialog ref="dialog" width="500" :title="$t('触发参数设置')" top="10vh" buttonCenter @confirm="handleSubmit(deployFormRef)" @cancel="cancel">
        <el-form ref="deployFormRef" :model="state.formData" :label-width="$locale == 'zh' ? '115px' : 'auto'">
            <el-form-item :label="$t('调控开关:')">
                <el-switch v-model="state.formData.status" :active-value="1" :inactive-value="0" />
            </el-form-item>
            <el-form-item :label="$t('调控余额达到:')" prop="minBalance"
                :rules="[{ required: !!state.formData.status, message: $t('请输入调控额度！'), trigger: 'blur' },{ type: 'number', min: 1, message: $t('最小值必须大于等于1！'), trigger: 'change' }]">
                <el-input-number style="width: 100%" v-model="state.formData.minBalance" :controls="false" :precision="0" :placeholder="$t('请输入整数')" />
            </el-form-item>
            <div>{{$t('注：设置额度后，达到的会员将进入列表，只可进入特定游戏（,,）')}}</div>
            
        </el-form>
    </Dialog>
</template>

<script setup>
import { postMemberGameConfig } from '@/api/risk_control'
import { ref, reactive, onMounted } from 'vue'

const emits = defineEmits(['close', 'fetchData'])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        }
    },
})
const state = reactive({
    formData: {},
})
const deployFormRef = ref(null)
const dialog = ref(null)

onMounted(() => {
    state.formData = { ...props.itemData }
})

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            dialog.value.showLoading()
            postMemberGameConfig(state.formData).then(() => {
                cancel()
                emits('fetchData')
            }).catch(() => {
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

<style lang="scss">
.create-order {
}
</style>
