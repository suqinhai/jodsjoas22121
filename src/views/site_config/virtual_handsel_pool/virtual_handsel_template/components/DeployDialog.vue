<template>
    <!-- 站点配置-虚拟彩金池-虚拟彩金池模板管理-新增/编辑 -->
    <Dialog ref="dialog" width="650" :title="state.title" buttonCenter top="10vh" @confirm="handleSubmit(operateForm)" @cancel="cancel">
        <el-form class="handsel-pool-deploy" ref="operateForm" :rules="state.rules" :model="state.formData"
            :label-width="$locale == 'zh' ? '115px' : 'auto'">
            <el-form-item :label="$t('样式名字:')" prop="styleName">
                <el-input v-model="state.formData.styleName" :placeholder="$t('请输入样式名字')" maxlength="60" show-word-limit />
            </el-form-item>
            <el-form-item :label="$t('样式素材:')" prop="styleImage">
                <UploadImage v-model="state.formData.styleImage" :width="state.limit.width" :height="state.limit.height" :size="state.limit.size"
                    :tip="$t('请上传1140*270或等比例，PNG/JPG/JPEG/GIF格式图片')" />
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { ref, reactive, onMounted } from 'vue'
import { postHomeDeploy } from '@/api/website.js'

const emits = defineEmits(['getData', 'close'])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        }
    },
})
const dialog = ref(null)
const operateForm = ref(null)
const state = reactive({
    title: $t('新增'),
    formData: {},
    limit: {
        width: 1140,
        height: 270,
        size: 2048
    },
    rules: {
        styleName: [{ required: true, message: $t('请输入样式名字'), trigger: 'blur' }],
        styleImage: [{ required: true, message: $t('请上传样式素材'), trigger: 'blur' }],
    }
})

onMounted(() => {
    if (props.itemData.id) {
        state.formData = { ...props.itemData }
        state.title = $t('修改')
    }
})

const handleSubmit = (el) => {
    el.validate((valid) => {
        if (valid) {
            dialog.value.showLoading()
            postHomeDeploy({
                part: 'awardTemplate',
                alias: 'awardTemplate',
                status: 1,
                awardTemplate: JSON.stringify(state.formData)
            }).then(() => {
                emits('getData')
                emits('close')
                dialog.value.closeLoading()
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
.handsel-pool-deploy {
    .radio-box {
        width: 150px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        img {
            max-width: 150px;
        }
    }
    .radio-box + .radio-box {
        margin-left: 50px;
    }
}
</style>
