<template>
    <!-- 下载落地页配置-修改 -->
    <Dialog ref="dialog" width="750" :title="$t('修改')" top="5vh" @confirm="handleSubmit(operateForm)" @cancel="cancel">
        <el-form ref="operateForm" :model="state.formData" :label-width="$locale == 'zh' ? '120px' : 'auto'">
            <div v-for="(item,index) in state.formData.list" :key="index">
                <el-form-item :label="`${typeData[item.type]}${$t('图片')}:`" :prop="'list.' + index +'.icon'"
                    :rules="[{ required: true, message: `${$t('请上传')}${typeData[item.type]}${$t('图片！')}`, trigger: 'change' }]"
                    v-if="item.type === 1 || item.type === 2">
                    <UploadImage v-model="item.icon" :params="'list.' + index +'.icon'" :width="60" :height="60" :size="50"
                        :tip="$t('请上传60*60或等比例，PNG/JPG/GIF格式小于30KB的图片')">
                    </UploadImage>
                </el-form-item>
                <el-form-item :label="$t('宣传图文图片:')" :prop="'list.' + index +'.icon'"
                    :rules="[{ required: true, message: $t('请上传宣传图文图片！'), trigger: 'change' }]" v-if="item.type === 3">
                    <UploadImage :params="'list.' + index +'.icon'" v-model="item.icon" :width="380" :height="52" :size="100"
                        :tip="$t('请上传380*52或等比例，PNG/JPG/GIF格式小于100KB的图片')">
                    </UploadImage>
                </el-form-item>
                <el-form-item :label="$t('下载按键图片:')" :prop="'list.' + index +'.icon'"
                    :rules="[{ required: true, message: $t('请上传下载按键图片！'), trigger: 'change' }]" v-if="item.type === 4">
                    <UploadImage :params="'list.' + index +'.icon'" v-model="item.icon" :width="166" :height="55" :size="50"
                        :tip="$t('请上传166*55或等比例，PNG/JPG/GIF格式小于50KB的图片')">
                    </UploadImage>
                </el-form-item>
                <el-form-item :label="$t('背景颜色:')" v-if="item.type === 5" :prop="'list.' + index +'.color'"
                    :rules="[{ required: true, message: $t('请设置背景颜色！'), trigger: 'change' }]">
                    <el-color-picker v-model="item.color" show-alpha />
                </el-form-item>
                <!-- <el-form-item :label="$t('下载按键跳转:')" v-if="item.type === 4" :prop="'list.' + index +'.url'"
                    :rules="[{ required: true, message: $t('请输入跳转地址！'), trigger: 'blur' }]">
                    <el-input style="width: 100%" :placeholder="$t('请输入跳转地址')" v-model.trim="item.url" />
                </el-form-item> -->
            </div>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { ref, reactive, onMounted } from 'vue'
import { postDownloadBarConfig } from '@/api/website'
import { deepClone } from '@/common/util'

const emits = defineEmits(['fetchData', 'close'])
const props = defineProps({
    tableData: {
        type: Array,
        default: () => []
    },
})
const dialog = ref(null)
const operateForm = ref(null)
const state = reactive({
    formData: {
        list: []
    },
})
const typeData = {
    1: $t('关闭按键'),
    2: $t('游戏icon'),
}

onMounted(() => {
    state.formData.list = deepClone(props.tableData)
})

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            let arr = deepClone(state.formData.list)
            let params = {
                configs: JSON.stringify(arr.map(item => {
                    if (item.url && item.url.indexOf('http') !== 0) {
                        item.url = 'https://' + item.url
                    }
                    return item
                }))
            }
            dialog.value.showLoading()
            postDownloadBarConfig(params).then(() => {
                // ElMessage.success($t('提交成功！'))
                emits('close')
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

<style scoped lang="scss">
</style>
