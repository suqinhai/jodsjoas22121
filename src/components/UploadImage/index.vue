<template>
    <div class="component-upload-image">
        <!-- <el-input style="display: none" :value="modelValue" /> -->
        <el-upload ref="uploadRef" list-type="picture-card" :http-request="upload" :accept="accept" :multiple="multiple"
            :before-upload="handleBeforeUpload" :autoUpload="false" :limit="limit" :disabled="disabled" :on-exceed="handleExceed"
            :before-remove="handleDelete" :show-file-list="true" :file-list="fileList" :on-preview="handlePictureCardPreview" :on-change="fileChange"
            :class="{ hide: fileList.length >= limit }">
            <el-icon class="avatar-uploader-icon">
                <plus />
            </el-icon>
        </el-upload>
        <!-- 上传提示 -->
        <div class="el-upload__tip" v-if="tip">
            {{ tip }}
        </div>

        <div v-if="dialogVisible && dialogImageUrl" class="preview" @click="dialogVisible = false">
            <div class="preview-box">
                <img class="preview-img" :src="dialogImageUrl" alt="">
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, defineExpose, computed } from 'vue'
import commonStore from '@/store/common'
import { ElMessage } from 'element-plus'
import { getUploadUrl } from '@/api/common'
import { toolPoint, add, sub } from '@/common/util'
import axios from 'axios'

const props = defineProps({
    modelValue: {
        type: [String, Array],
        default: '',
    },

    // 图片数量限制
    limit: {
        type: Number,
        default: 1,
    },

    // 是否支持多选文件
    multiple: {
        type: Boolean,
        default: false,
    },

    // 大小限制(KB)
    size: {
        type: Number,
        default: 1024,
    },

    // 图片格式
    accept: {
        type: String,
        default: '.png,.jpg,.jpeg,.gif',
    },

    // 提示语
    tip: {
        type: String,
        default: '',
    },

    // 图片宽度
    width: {
        type: Number,
        default: 0,
    },

    // 图片高度
    height: {
        type: Number,
        default: 0,
    },

    // 控制是否可编辑
    disabled: {
        type: Boolean,
        default: false,
    },

    // 回传的参数
    params: {
        default: 0
    },

    // 上传文件的类型
    bizType: {
        type: String,
        default: 'image'
    },

    // 是否自定义预览
    isCustomPreview: {
        type: Boolean,
        default: false,
    },

    // 是否限制尺寸最大值
    isLimitSizeMax: {
        type: Boolean,
        default: false,
    },

    // 游戏参数
    gameParams: {
        default: '',
        require: false
    }
})

const emits = defineEmits(['update:modelValue', 'success', 'previewImage'])
let fileNum = ref(0)
const uploadList = ref([])
const fileList = ref([])
const uploadRef = ref(null)
const dialogImageUrl = ref('')
const dialogVisible = ref(false)
const isManual = ref(false)
const commonData = commonStore()

const systemLimit = computed(() => {
    return commonData.fileType.image || {
        singleFileMax: 5242880,
        fileTypes: []
    }
})

watch(
    () => props.modelValue,
    (val) => {
        if (!val || !val.length) {
            fileList.value = []
            uploadList.value = fileList.value
            fileNum.value = fileList.value.length
            isManual.value = false
            return
        }
        if (fileList.value.length && isManual.value) {
            isManual.value = false
            return
        }
        if (val && !isManual.value) {
            // 首先将值转为数组
            const list = Array.isArray(val) ? val : props.modelValue.split(',')
            // 然后将数组转为对象数组

            fileList.value = list.map((item, index) => {
                if (typeof item === 'string') {
                    item = { name: item, url: item }
                }
                return item
            })
            uploadList.value = fileList.value
            fileNum.value = fileList.value.length
        }
    },
    { deep: true, immediate: true },
)

const handleBeforeUpload = (rawFile) => {
    fileNum.value++
    let file = fileList.value.filter(item => item.uid === rawFile.uid)[0]
    if (props.accept || systemLimit.value.fileTypes) {
        const typeList = props.accept.split(',')
        const typeData = typeList.map((item) => item.substring(1))
        const fileType = rawFile.type.split('/')[1]
        if (systemLimit.value.fileTypes.every((item) => fileType !== item)) {
            ElMessage.error(`${$t('请上传')}${systemLimit.value.fileTypes.join('/')}${$t('格式图片')}`)
            file.status = 'fail'
            return false
        }
        if (typeData.every((item) => fileType !== item)) {
            ElMessage.error(`${$t('请上传')}${typeData.join('/')}${$t('格式图片')}`)
            file.status = 'fail'
            return false
        }
    }
    if (systemLimit.value.singleFileMax && systemLimit.value.singleFileMax < rawFile.size) {
        ElMessage.error(`${$t('图片大小不能超过')}${parseInt(systemLimit.value.singleFileMax / 1024)}kb`)
        file.status = 'fail'
        return false
    }
    if (rawFile.size / 1024 > props.size) {
        ElMessage.error(`${$t('图片大小不能超过')}${props.size}kb`)
        file.status = 'fail'
        return false
    }
    if (props.width && props.height) {
        return new Promise((resolve, reject) => {
            const _URL = window.URL || window.webkitURL
            const img = new Image()
            img.src = _URL.createObjectURL(rawFile)
            img.onload = () => {
                if (props.isLimitSizeMax && (props.width < img.width || props.height < img.height)) {
                    let msg = `${$t('请上传宽度小于')}${props.width}${$t('，高度小于')}${props.height}${$t('且等比例的图片')}`
                    ElMessage.error(msg)
                    file.status = 'fail'
                    reject()
                    return
                }
                let valid
                let currentRatio = toolPoint(img.width / img.height, 2)
                let propRatio = toolPoint(props.width / props.height, 2)
                let arrowMaxRation = add(propRatio, 0.1)
                let arrowMinRation = sub(propRatio, 0.1)
                valid = currentRatio >= arrowMinRation && currentRatio <= arrowMaxRation
                if (valid) {
                    return resolve(file)
                } else {
                    let msg = `${$t('请上传尺寸为')}${props.width}*${props.height}${$t('或宽高比为')}${arrowMaxRation} - ${arrowMinRation}${$t('的图片')}`
                    ElMessage.error(msg)
                    file.status = 'fail'
                    reject()
                }
            }
        })
    }
}

// 图片个数超出
const handleExceed = () => {
    ElMessage.error(`${$t('上传图片数量不能超过')} ${props.limit} ${$t('个')}!`)
}

const fileChange = (file, list) => {
    fileList.value = list
    if (file.status !== 'ready') return
    uploadRef.value.submit()
}

const upload = (param) => {
    let params = {
        fileName: param.file.name.replace(/[\[\]]/g, ''),
        fileSize: param.file.size,
        bizType: props.bizType
    }
    if (props.gameParams) {
        params = {
            ...params,
            ...props.gameParams
        }
    }
    getUploadUrl(params).then(({ data }) => {
        if (data) {
            axios.put(data.upload, param.file, {
                headers: {
                    "Content-Type": param.file.type
                }
            }).then(() => {
                uploadList.value.push({ name: param.file.name, url: data.url })
                uploadedSuccessfully()
            }).catch(() => {
                ElMessage.error($t('图片上传失败'))
                handleDelete(param.file)
            })
        }
    }).catch(() => {
        ElMessage.error($t('图片上传失败'))
        handleDelete(param.file)
    })

}

// 删除图片
const handleDelete = (file) => {
    if (file.status === 'ready') {
        ElMessage.warning($t('上传中的图片无法执行删除操作'))
        return false
    }
    const findex = fileList.value.map((f) => f.name).indexOf(file.name)
    if (findex > -1) {
        fileNum.value--
        fileList.value.splice(findex, 1)
        uploadList.value.splice(findex, 1)
        isManual.value = true
        emits('update:modelValue', listFormatChange(uploadList.value))
        return false
    }
}

// 上传结束处理
const uploadedSuccessfully = () => {
    if (fileNum.value > 0 && uploadList.value.length === fileNum.value) {
        fileList.value.forEach(item => {
            item.status = 'success'
            item.name = item.url
        })
        isManual.value = true
        emits('update:modelValue', listFormatChange(uploadList.value))
        emits('success', props.params)
        ElMessage.success($t('上传图片成功'))
    }
}

// 自带预览
const handlePictureCardPreview = (file) => {
    if (!props.isCustomPreview) {
        dialogImageUrl.value = file.url
        dialogVisible.value = true
    } else {
        emits('previewImage', file.url)
    }
}

// 外部调用预览
const picturepPreview = (index = 0) => {
    if (!fileList.value[index] || !fileList.value[index].url) {
        return ElMessage.warning($t('文件不存在！'))
    }
    dialogImageUrl.value = fileList.value[index].url
    dialogVisible.value = true
}

// 图片数据转化成初始数据格式
const listFormatChange = (list, separator) => {
    let fileData = ''
    separator = separator || ','
    if (Array.isArray(props.modelValue)) {
        fileData = []
        list.forEach(item => {
            if (undefined !== item.url && item.url.indexOf('blob:') !== 0) {
                fileData.push(item.url)
            }
        })
    } else {
        for (let i in list) {
            if (undefined !== list[i].url && list[i].url.indexOf('blob:') !== 0) {
                fileData += list[i].url + separator
            }
        }
        fileData = fileData !== '' ? fileData.substring(0, fileData.length - 1) : ''
    }
    return fileData
}

defineExpose({ picturepPreview })
</script>

<style scoped lang="scss">
// .el-upload--picture-card 控制加号部分
:deep(.hide .el-upload--picture-card) {
    display: none;
}
:deep .el-upload {
    margin-bottom: 8px;
}
:deep .el-upload__tip {
    line-height: 18px;
}

.component-upload-image {
    ::v-deep .el-upload-list {
        &__item {
            &.is-ready {
                &::after {
                    content: 'uploading';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.6);
                    font-size: 16px;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            }
        }
    }
}
.preview {
    position: fixed;
    width: 100vw;
    height: 100vh;
    left: 0;
    top: 0;
    background-color: rgba(0, 0, 0, 0.6);
    z-index: 9999;
    overflow-y: auto;

    &-box {
        flex-shrink: 1;
        min-height: 100vh;
        width: 700px;
        // background-color: rgba(255, 255, 255, .6);
        // box-sizing: border-box;
        display: flex;
        align-items: center;
        padding: 10px 50px 20px;
        border-radius: 4px;
        margin: 0 auto;
    }

    &-img {
        width: 100%;
        height: 100%;
    }
}
</style>
