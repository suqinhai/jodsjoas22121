<template>
    <!-- 站点配置-APP管理配置-APP下载设置-修改 -->
    <Dialog ref="dialog" width="500" :title="$t('修改')" top="10vh" buttonCenter @confirm="handleSubmit(operateForm)" @cancel="cancel">
        <el-form ref="operateForm" :model="state.formData" label-width="auto">
            <template v-if="operateType === 1">
                <el-form-item :label="$t('下载描述文字') + ':'" prop="desc">
                    <el-input style="width: 100%" type="textarea" :rows="4" :placeholder="$t('请输入备注')" v-model="state.formData.desc" show-word-limit
                        maxlength="100" />
                </el-form-item>
                <el-form-item :label="$t('描述文字颜色') + ':'" prop="textColor">
                    <el-color-picker v-model="state.formData.textColor" show-alpha />
                </el-form-item>
                <el-form-item :label="$t('背景颜色') + ':'" prop="bgColor">
                    <el-color-picker v-model="state.formData.bgColor" show-alpha />
                </el-form-item>
            </template>
            <template v-if="operateType === 2">
                <el-form-item :label="$t('下载描述文字') + ':'" prop="desc">
                    <el-input style="width: 100%" type="textarea" :rows="4" :placeholder="$t('请输入备注')" v-model="state.formData.desc" show-word-limit
                        maxlength="100" />
                </el-form-item>
                <el-form-item :label="$t('描述文字颜色') + ':'" prop="textColor">
                    <el-color-picker v-model="state.formData.textColor" show-alpha />
                </el-form-item>
                <el-form-item :label="$t('下载风格') + ':'" prop="bgColor">
                    <el-radio-group v-model="state.formData.bgColor">
                        <el-radio :label="0">{{$t('浅色')}}</el-radio>
                        <el-radio :label="1">{{$t('暗色')}}</el-radio>
                    </el-radio-group>
                </el-form-item>
            </template>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { ref, reactive, onMounted } from 'vue'
import { postDownloadBarConfig } from '@/api/website'
import { deepClone } from '@/common/util'

const emits = defineEmits(['getData', 'close'])
const props = defineProps({
    initData: {
        type: Array,
        default: () => []
    },
    operateType: {
        type: Number,
        default: 1
    },
})
const dialog = ref(null)
const operateForm = ref(null)
const state = reactive({
    formData: {},
    rules: {
        desc: { required: true, message: $t('请输入下载描述文字！'), trigger: 'change' },
        textColor: { required: true, message: $t('请设置背景颜色！'), trigger: 'change' },
        bgColor: { required: true, message: $t('必选项不能为空！'), trigger: 'change' },
    },
    typeArr: []
})

onMounted(() => {
    state.typeArr = props.operateType === 1 ? [5, 6, 7] : [8, 9, 10]
    props.initData.filter(item => state.typeArr.includes(+item.type)).forEach(item => {
        if ([6, 8].includes(item.type)) {
            state.formData.desc = item.desc
        } else if ([7, 9].includes(item.type)) {
            state.formData.textColor = item.color
        } else {
            state.formData.bgColor = +item.type === 5 ? item.color : item.style
        }
    })
})

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            let params = deepClone(props.initData)
            params.forEach(item => {
                if (state.typeArr.includes(+item.type)) {
                    if ([6, 8].includes(item.type)) {
                        item.desc = state.formData.desc
                    } else if ([7, 9].includes(item.type)) {
                        item.color = state.formData.textColor
                    } else {
                        item[+item.type === 5 ? 'color' : 'style'] = state.formData.bgColor
                    }
                }
            })
            dialog.value.showLoading()
            postDownloadBarConfig({ configs: JSON.stringify(params) }).then(() => {
                emits('close')
                emits('getData')
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

<style scoped lang="scss">
</style>
