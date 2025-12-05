<template>
    <!-- 运营中心-社区活动中心-活动列表/已关闭活动-分享传图活动审核-审核 -->
    <Dialog ref="dialog" width="740" :title="$t('头像选择')" top="5vh" buttonCenter @confirm="handleSubmit" @cancel="emits('close')">
        <div class="avatar-list">
            <div class="avatar-list-box pointer" :class="{'avatar-list-box--active': selsectAvatar === item.value}" v-for="item in avatarList"
                :key="item.value" @click="selsectAvatar = item.value">
                <img :src="item.icon" alt="">
            </div>
            <!-- <div class="upload-avatar pr">
                <UploadImage class="upload-avatar-box" :size="20" :width="50" :height="50" v-model="uploadAvatar" @success="uploadSuccess">
                </UploadImage>
                <div class="upload-avatar-tips pa">{{$t('自定义上传')}}</div>
            </div> -->
            <div class="upload-avatar">
                <Upload v-model="uploadAvatar" :size="20" @success="uploadSuccess">
                    <template #default="{tabLoading}">
                        <el-button v-throttle size="small" type="primary" :loading="tabLoading">
                            {{ $t('自定义上传')}}
                        </el-button>
                    </template>
                </Upload>
            </div>
        </div>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from "element-plus"

const emits = defineEmits(['close', 'setAvatar'])
const props = defineProps({
    memberData: {
        type: Object,
        default: () => {
            return {}
        },
    },
})
const avatarList = reactive([])
const selsectAvatar = ref('')
const uploadAvatar = ref('')

onMounted(() => {
    for (let index = 0; index < 7; index++) {
        avatarList.push({
            icon: '/img/avatar/tc_head-image-' + index + '.png',
            value: 'tc_head-image-' + index + '.png'
        })
    }
    selsectAvatar.value = props.memberData.initAvatar
    if (props.memberData.initAvatar && props.memberData.initAvatar.indexOf('http') === 0) {
        avatarList.push({
            icon: props.memberData.initAvatar,
            value: props.memberData.initAvatar
        })
    }
})

const uploadSuccess = () => {
    avatarList.push({
        icon: uploadAvatar.value,
        value: uploadAvatar.value
    })
    selsectAvatar.value = uploadAvatar.value
    uploadAvatar.value = ''
}

const handleSubmit = () => {
    if (!selsectAvatar.value) return ElMessage.warning($t('请选择头像后再进行提交！'))
    cancel()
    emits('setAvatar', selsectAvatar.value)
}

const cancel = () => {
    emits('close')
}
</script>

<style lang="scss">
.avatar-list {
    display: flex;
    flex-wrap: wrap;

    &-box {
        width: 100px;
        height: 100px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        overflow: hidden;
        margin-right: 10px;
        margin-bottom: 10px;
        border: #fff 3px solid;
        // padding: 2px;
        opacity: 0.3;

        &--active {
            opacity: 1 !important;
            border-color: red;
        }

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }
    .upload-avatar {
        width: 100px;
        height: 100px;
        display: flex;
        justify-content: center;
        align-items: center;
        .el-button {
            height: 32px;
            font-style: 10px !important;
        }
    }
}
</style>
