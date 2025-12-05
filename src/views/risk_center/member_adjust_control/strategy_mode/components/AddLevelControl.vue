<template>
    <!-- 会员调控-数据列表（专业模式）-层级控制 -->
    <Dialog ref="dialog" width="500" :title="$t('层级控制')" top="10vh" buttonCenter @confirm="handleSubmit(deployFormRef)" @cancel="cancel">
        <el-form ref="deployFormRef" :model="state.formData" :rules="state.rules" :label-width="$locale == 'zh' ? '140px' : 'auto'">
            <el-form-item :label="$t('层级类型:')" prop="genre">
                <el-radio-group v-model="state.formData.genre">
                    <el-radio :label="0">{{$t('自动层级')}}</el-radio>
                    <el-radio :label="1">{{$t('固定层级')}}</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item :label="$t('层级标签:')" prop="autoLayerId" v-if="state.formData.genre===0">
                <el-select v-model="state.formData.autoLayerId" style="width:  100%" :placeholder="$t('层级标签')">
                    <el-option v-for="item in metaData.autoLevel" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('层级标签:')" prop="fixedLayerId" v-if="state.formData.genre===1">
                <el-select v-model="state.formData.fixedLayerId" style="width:  100%" :placeholder="$t('层级标签')">
                    <el-option v-for="item in metaData.fixedLevel" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('当日控制人数比例:')" prop="ratio">
                <el-input-number v-model="state.formData.ratio" style="width: 262px;margin-right: 5px" :controls="false" :precision="2" :min="0"
                    :placeholder="$t('当日控制人数比例')" />%
            </el-form-item>
            <el-form-item :label="$t('控制类型:')" prop="type">
                <el-select v-model="state.formData.type" style="width:  100%" :placeholder="$t('控制类型')">
                    <el-option v-for="item in showData" :key="item.value" :label="item.label" :value="Number(item.value)" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('控制次数:')" prop="count">
                <el-input-number v-model="state.formData.count" style="width:  100%" :controls="false" :precision="0" :min="0" :max="10"
                    :placeholder="$t('控制次数')" />
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { postLevelControlConfig } from '@/api/risk_control'
import { ElMessage } from 'element-plus'

const emits = defineEmits(['close', 'fetchData'])
const props = defineProps({
    metaData: {
        type: Object,
        default: {}
    },
})
const state = reactive({
    formData: {
        genre: 0
    },
    rules: {
        genre: { required: true, message: $t('请选择层级类型！'), trigger: 'change' },
        autoLayerId: { required: true, message: $t('请选择层级标签！'), trigger: 'change' },
        fixedLayerId: { required: true, message: $t('请选择层级标签！'), trigger: 'change' },
        type: { required: true, message: $t('请选择控制类型！'), trigger: 'change' },
        ratio: { required: true, message: $t('请输入当日控制人数比例！'), trigger: 'blur' },
        count: { required: true, message: $t('请输入控制次数！'), trigger: 'blur' },
    },
})
const deployFormRef = ref(null)
const dialog = ref(null)

const showData = computed(() => {
    return props.metaData.controlTypeList.filter(item => +item.value)
})

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            let params = { ...state.formData }
            if (params.genre) {
                delete params.autoLayerId
            } else {
                delete params.fixedLayerId
            }
            delete params.genre
            dialog.value.showLoading()
            postLevelControlConfig(params).then(() => {
                // ElMessage.success($t('提交成功！'))
                cancel()
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
</style>
