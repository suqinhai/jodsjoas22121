<template>
    <div>
        <el-input style="display: none" v-model="modelValue" />
        <el-upload ref="uploadRef" class="files-upload" :multiple="isMultiple" :drag="drag" :autoUpload="false" :accept="accept"
            :before-upload="handleBeforeUpload" :show-file-list="isShowList" :limit="limit" :http-request="upload" :on-exceed="exceed"
            :on-remove="handleDelete" :on-change="fileChange" :file-list="fileList" :disabled="disabled || loading">
            <slot :tabLoading="loading" />
            <div v-if="tip" slot="tip" class="el-upload__tip">{{ tip }}</div>
        </el-upload>
    </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { ref, watch, computed } from 'vue'
import { getUploadUrl } from '@/api/common'
import { toolPoint, add, sub } from '@/common/util'
import axios from 'axios'
import commonStore from '@/store/common'

const props = defineProps({
    modelValue: {
        type: [String, Array],
        default: '',
    },

    // 上传文件的格式
    accept: {
        type: String,
        default: '.jpg,.png,.jpeg',
    },

    // 是否支持多文件上传
    isMultiple: {
        type: Boolean,
        default: false,
    },

    // 是否展示已上传文件
    isShowList: {
        type: Boolean,
        default: false,
    },

    // 上传文件数量限制
    limit: {
        type: Number,
        default: 5,
    },

    // 大小限制(KB)
    size: {
        type: Number,
        default: 1024,
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

    //  是否禁用
    disabled: {
        type: Boolean,
        default: false,
    },

    //  是否拖拽上传
    drag: {
        type: Boolean,
        default: false,
    },

    // 上传文件的类型
    bizType: {
        type: String,
        default: 'image'
    },

    // 回传的参数
    params: {
        default: 0
    },

    // 是否替换当前图片
    isReplace: {
        type: Boolean,
        default: true,
    },

    // 是否获取文件信息
    isBackFileInfo: {
        type: Boolean,
        default: false,
    },

    // 多次上传 覆盖当前数据，保留最新数据
    isDeletePrevData: {
        type: Boolean,
        default: false,
    }
})

const emits = defineEmits(['update:modelValue', 'success', 'getFileInfo'])
const uploadList = ref([])
const fileList = ref([])
const loading = ref(false)
const number = ref(0)
const uploadRef = ref(null)
const baseUrl = import.meta.env.VITE_APP_BASE_API
const commonData = commonStore()

const systemLimit = computed(() => {
    return commonData.fileType[props.bizType] || {
        singleFileMax: 5242880,
        fileTypes: []
    }
})

watch(
    () => props.modelValue,
    (val) => {
        if (fileList.value.length || uploadList.value.length) return
        if (val) {
            // 首先将值转为数组
            const list = Array.isArray(val) ? val : props.modelValue.split(',')
            // 然后将数组转为对象数组
            fileList.value = list.map((item) => {
                if (typeof item === 'string') {
                    if (item.indexOf(baseUrl) === -1) {
                        item = { name: baseUrl + item, url: baseUrl + item }
                    } else {
                        item = { name: item, url: item }
                    }
                }
                return item
            })
        }
    },
    { deep: true, immediate: true },
)

const handleBeforeUpload = (rawFile) => {
    let file = fileList.value.filter(item => item.uid === rawFile.uid)[0]
    if (props.accept || systemLimit.value.fileTypes) {
        const typeList = props.accept.split(',')
        const typeData = typeList.map((item) => item.substring(1))
        const dataList = rawFile.name.split('.')
        const fileType = dataList[dataList.length - 1]
        if (systemLimit.value.fileTypes && !systemLimit.value.fileTypes.some(item => fileType === item)) {
            ElMessage.error(`${$t('请上传')}${typeData.join('/')}${$t('格式文件')}`)
            file.status = 'fail'
            return false
        }
        if (props.accept && !typeData.some((item) => fileType === item)) {
            ElMessage.error(`${$t('请上传')}${typeData.join('/')}${$t('格式文件')}`)
            file.status = 'fail'
            return false
        }
    }
    if (systemLimit.value.singleFileMax && systemLimit.value.singleFileMax < rawFile.size) {
        ElMessage.error(`${$t('文件大小不能超过')}${parseInt(systemLimit.value.singleFileMax / 1024)}kb`)
        file.status = 'fail'
        return false
    }
    if (rawFile.size / 1024 > props.size) {
        ElMessage.error(`${$t('文件大小不能超过')}${props.size}kb`)
        file.status = 'fail'
        return false
    }
    number.value++
    if (props.isBackFileInfo) {
        emits('getFileInfo', rawFile)
    }
    if (props.width && props.height) {
        return new Promise((resolve, reject) => {
            const _URL = window.URL || window.webkitURL
            const img = new Image()
            img.src = _URL.createObjectURL(rawFile)
            img.onload = () => {
                let valid
                let currentRatio = toolPoint(img.width / img.height, 2)
                let propRatio = toolPoint(props.width / props.height, 2)
                let arrowMaxRation = add(propRatio, 0.1)
                let arrowMinRation = sub(propRatio, 0.1)
                valid = currentRatio > arrowMinRation && currentRatio < arrowMaxRation
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

// 文件个数超出
const exceed = (files) => {
    ElMessage.error(`${$t('上传文件数量不能超过')} ${props.limit} ${$t('个!')}`)
}

const fileChange = (file, list) => {
    fileList.value = list
    if (file.status !== 'ready') return
    uploadRef.value.submit()
}

const upload = (param) => {
    loading.value = true

    getUploadUrl({
        fileName: param.file.name.replace(/[\[\]]/g, ''),
        fileSize: param.file.size,
        bizType: props.bizType
    }).then(({ data }) => {
        if (data) {
            axios.put(data.upload, param.file, {
                headers: {
                    "Content-Type": param.file.type
                }
            }).then(() => {
                if (props.isDeletePrevData) {
                    uploadList.value = [];
                    fileList.value = [];
                    number.value = 1;
                }
                uploadList.value.push({ name: param.file.name, url: data.url })
                uploadedSuccessfully()
                loading.value = false
            })
        } else {
            loading.value = false
        }
    }).catch(() => {
        ElMessage.error($t('文件上传失败'))
        loading.value = false
        handleDelete(param.file)
    })
}

// 删除文件
const handleDelete = (file) => {
    if (file.status === 'ready') {
        ElMessage.warning($t('上传中的文件无法执行删除操作'))
        return false
    }
    const findex = fileList.value.map((f) => f.name).indexOf(file.name)
    if (findex > -1) {
        number.value--
        fileList.value.splice(findex, 1)
        uploadList.value.splice(findex, 1)
        if (props.bizType !== 'image' && props.bizType !== 'avatar') {
            emits('update:modelValue', listFormatChange(uploadList.value))
        }
        return false
    }
}

// 上传结束处理
const uploadedSuccessfully = () => {
    if (number.value > 0 && uploadList.value.length === number.value) {
        fileList.value.forEach(item => {
            item.status = 'success'
            item.name = item.name || item.url
        })
        let arr = ''
        if (props.bizType === 'image' || props.bizType === 'avatar') {
            fileList.value = uploadList.value.slice(uploadList.value.length - 1)
            arr = listFormatChange(uploadList.value.slice(uploadList.value.length - 1))
        } else {
            arr = listFormatChange(uploadList.value)
        }
        if (props.isReplace) {
            emits('update:modelValue', arr)
            ElMessage.success($t('上传文件成功'))
        }
        loading.value = false
        emits('success', arr, props.params)
    }
}

// 文件数据转化成初始数据格式
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
</script>

<style lang="scss">
.el-upload-dragger {
    padding: 0;
}
</style>
