<template>
    <!-- 音乐管理-新增/修改 -->
    <Dialog ref="dialogRef" width="600" :title="state.title" buttonCenter top="12vh" @confirm="handleSubmit(deployForm)" @cancel="cancel">
        <el-form ref="deployForm" class="music-deploy" :rules="state.rules" :model="state.formData" :label-width="$locale == 'zh' ? '90px' : 'auto'">
            <el-form-item :label="$t('歌曲名称:')" prop="name">
                <el-input v-model="state.formData.name" :placeholder="$t('请输入歌曲名称')" />
            </el-form-item>
            <el-form-item :label="$t('排序:')">
                <el-input-number style="width: 100%" v-model="state.formData.sort" :controls="false" :precision="0" :min="0"
                    :placeholder="$t('请输入排序值')" />
            </el-form-item>
            <el-form-item :label="$t('音乐文件:')" prop="url">
                <div class="pr">
                    <Upload v-model="state.formData.url" :isDeletePrevData="true" isBackFileInfo accept=".mp3" bizType="audio" :size="10240"
                        @getFileInfo="getFileInfo">
                        <template #default="{tabLoading}">
                            <el-button style="height: 32px" v-throttle size="small" type="primary" :loading="tabLoading">
                                {{ state.formData.url ? $t('更换歌曲') : $t('歌曲上传')}}
                            </el-button>
                        </template>
                    </Upload>
                    <div class="attempt-box pa" v-if="state.formData.url">
                        <audio controls :src="state.formData.url" />
                    </div>
                    <div>{{$t('请上传MP3格式，小于10240KB的文件')}}</div>
                </div>
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted, defineEmits, defineProps } from 'vue'
import { ElMessage } from 'element-plus'
import { postMusicData } from '@/api/operation'

const emits = defineEmits(['fetchData', 'close'])
const props = defineProps({
    itemData: {
        type: Object,
        default: {}
    }
})
const dialogRef = ref(null)
const deployForm = ref(null)
const state = reactive({
    formData: {},
    title: $t('新增'),
    rules: {
        url: [
            { required: true, message: $t('请上传音频文件！'), trigger: 'change' },
        ],
        name: [
            { required: true, message: $t('请输入歌曲名称！'), trigger: 'blur' },
        ]
    },
    fileInfo: {},
})

onMounted(() => {
    if (props.itemData.id) {
        state.title = $t('修改')
        let { info = {}, name, sort = undefined, status, id } = props.itemData
        state.formData = {
            fileName: info.fileName || '',
            size: info.size || '',
            url: info.url || '',
            name,
            sort,
            status,
            id,
        }
    }
})
const getFileInfo = (file) => {
    state.fileInfo = file
}

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            dialogRef.value.showLoading()
            let { name, size } = state.fileInfo
            state.formData.fileName = name
            state.formData.size = size
            postMusicData(state.formData).then(res => {
                cancel()
                emits('fetchData')
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
.music-deploy {
    .attempt-box {
        top: 0;
        right: 0;
        audio {
            height: 32px;
        }
    }
}
</style>
