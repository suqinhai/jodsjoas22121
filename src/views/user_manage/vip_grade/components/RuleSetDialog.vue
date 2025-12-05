<template>
    <!-- VIP等级-前端规则配置 -->
    <Dialog ref="dialog" width="850" :title="$t('前端规则配置')" top="10vh" buttonCenter @confirm="handleSubmit" @cancel="cancel">
        <el-form>
            <el-form-item :label="$t('选择类型:')">
                <el-radio-group v-model="state.configType" @change="changeConfigType">
                    <el-radio :label="0" :value="0">{{$t('系统默认')}}</el-radio>
                    <el-radio :label="1" :value="1">{{$t('自定义')}}</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item :label="$t('前端规则:')">
                <Tinymce v-model="state.ruleContent" width="600px" :disabled="!state.configType"></Tinymce>
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { postVipRuleDesc, getVipRuleDesc } from '@/api/website'

const emits = defineEmits(['close', 'getData'])
const props = defineProps({
    itemData: {
        type: Object,
        default: '',
    },
})
const state = reactive({
    ruleContent: '',
    configType: 0,
})
const dialog = ref(null)

onMounted(() => {
    state.configType = props.itemData.configType
    state.ruleContent = props.itemData.ruleDesc
})

const changeConfigType = () => {
    getVipRuleDesc({ type: state.configType }).then((res) => {
        state.ruleContent = res.data
    })
}

const handleSubmit = () => {
    if (!state.ruleContent && state.configType === 1) return ElMessage.warning($t('请完善表单内容再进行提交！'))
    dialog.value.showLoading()
    const data = {
        type: state.configType
    }
    if (state.configType === 1) {
        data.ruleDesc = state.ruleContent
    }
    postVipRuleDesc(data).then(res => {
        emits('close')
        emits('getData')
    }).catch(err => {
        dialog.value.closeLoading()
    })
}

const cancel = () => {
    emits('close')
}

</script>

<style lang="scss">
</style>