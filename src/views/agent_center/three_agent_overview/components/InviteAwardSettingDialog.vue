<template>
    <!-- 代理中心-三级掉绑查询-邀请奖金设置 -->
    <Dialog ref="dialog" width="700" :title="$t('邀请奖金设置')" top="10vh" :operateActions="[$t('取消'), $t('提交')]" @confirm="confirmEdit(addFrom)"
        @cancel="cancel">
        <el-form ref="addFrom" :model="state.formData" :label-width="$locale == 'zh' ? '170px' : 'auto'" :rules="state.rules">
            <el-form-item :label="$t('一级分润%:')" prop="one">
                <el-input-number v-model="state.formData.one" style="width: 200px;" :placeholder="$t('请输入一级分润%')" :min="0" :controls="false" :precision="0" :max="100"/>
            </el-form-item>
            <el-form-item :label="$t('二级分润%:')" prop="two">
                <el-input-number v-model="state.formData.two" style="width: 200px;" :placeholder="$t('请输入二级分润%')" :min="0" :controls="false" :precision="0" :max="100"/>
            </el-form-item>
            <el-form-item :label="$t('三级分润%:')" prop="three">
                <el-input-number v-model="state.formData.three" style="width: 200px;" :placeholder="$t('请输入三级分润%')" :min="0" :controls="false" :precision="0" :max="100"/>
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { postEditAgentConfig } from '@/api/agent.js'

const addFrom = ref(null)
const dialog = ref(null)
const emits = defineEmits(['close', 'fetchData'])
const state = reactive({
    formData: {},
    rules: {
        one: [{ required: true, message: $t('请输入一级分润%'), trigger: 'blur' }],
        two: [{ required: true, message: $t('请输入二级分润%'), trigger: 'blur' }],
        three: [{ required: true, message: $t('请输入三级分润%'), trigger: 'blur' }],
    }
})

const props = defineProps({
    itemData: {
        type: Object,
        default: () => {}
    }
})

onMounted(() => {
    if(props.itemData.rewardRates && props.itemData.rewardRates.length){
        state.formData.one = props.itemData.rewardRates[0] || ''
        state.formData.two = props.itemData.rewardRates[1] || ''
        state.formData.three = props.itemData.rewardRates[2] || ''
    }
})


const confirmEdit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            const num = state.formData.one + state.formData.two + state.formData.three
            if( num > 100) {
                return ElMessage.warning($t('概率总和小于或等于100'))
            }
            const params = {
                agentUserId: props.itemData.userId,
                type: 1,
                rewardShare: [state.formData.one,state.formData.two,state.formData.three].join(',')
            }
            dialog.value.showLoading()
            postEditAgentConfig(params).then((res) => {
                emits('close')
                emits('fetchData')
                dialog.value.closeLoading()
            }).catch((data) => {
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

<style lang='scss' scoped>
.tips{
    line-height: 20px;
    margin-top: 10px;
}
</style>