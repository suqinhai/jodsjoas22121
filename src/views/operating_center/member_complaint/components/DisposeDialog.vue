<template>
    <!-- 会员投诉列表-审核 -->
    <Dialog ref="dialog" width="650" :title="state.title" top="10vh" :operateActions="state.operateActions" :isShowSubmit="!itemData.operateType"
        @confirm="handleOperation" @cancel="emits('close')">
        <el-form class="member-complaint-form" :model="state.formData" label-width="auto">
            <el-form-item :label="$t('反馈内容:')">
                <el-input style="width: 100%" type="textarea" :rows="6" disabled v-model="itemData.feedbackContent" />
            </el-form-item>
            <el-form-item :label="$t('附件:')" class="file-row">
                <div v-if="!itemData.attach">{{$t('无')}}</div>
                <UploadImage :style="{'width': state.complaintImages.length * 160 + 'px', 'max-width': 3 * 160 + 'px'}"
                    v-if="state.complaintImages.length" v-model="state.complaintImages" disabled />
                <el-button v-for="(item,index) in state.complaintVideos" :key="index" v-throttle type="primary" text @click="handleLook(item)">
                    {{$t('查看视频附件')}}{{state.complaintVideos.length > 1 ? index + 1 : ''}}</el-button>
            </el-form-item>
            <el-form-item :label="$t('投诉金额:')">{{itemData.amount}}</el-form-item>
            <el-form-item :label="$t('回复:')" v-if="!itemData.operateType || itemData.status === 1">
                <el-input style="width: 100%" type="textarea" :rows="4" :disabled="itemData.status === 1" :placeholder="$t('请输入回复')"
                    v-model="state.formData.replyContent" show-word-limit maxlength="255" />
            </el-form-item>
            <el-form-item :label="$t('回复附件:')" v-if="!itemData.operateType">
                <UploadImage v-model="state.formData.image" :size="1024" :limit="5" :tip="$t('请上传PNG/JPG格式小于1024KB的图片')"></UploadImage>
                <Upload v-model="state.formData.video" :size="1024*40" accept=".mp4" bizType="video" isShowList :tip="$t('请上传MP4格式小于40960KB的文件')">
                    <template #default="{tabLoading}">
                        <el-button style="height: 32px" v-throttle size="small" type="primary" :loading="tabLoading">
                            {{ $t('上传视频')}}
                        </el-button>
                    </template>
                </Upload>
                <div>{{ $t('附件（支持图片、视频，最大上传数量5个）')}}</div>
            </el-form-item>
            <el-form-item :label="$t('回复附件:')" v-if="itemData.status === 1" class="file-row">
                <div v-if="!itemData.replyAttach">{{$t('无')}}</div>
                <UploadImage :style="{'width': state.replyImages.length * 160 + 'px', 'max-width': 3 * 160 + 'px'}" v-if="state.replyImages.length"
                    v-model="state.replyImages" disabled />
                <el-button v-for="(item,index) in state.replyVideos" :key="index" v-throttle type="primary" text @click="handleLook(item)">
                    {{$t('查看视频附件')}}{{state.replyVideos.length > 1 ? index + 1 : ''}}</el-button>
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { replayFeedBack } from '@/api/operation'

const emits = defineEmits(['fetchData', 'close', 'lookVideo'])
const props = defineProps({
    itemData: {
        type: Object,
        default: {}
    }
})
const dialog = ref(null)
const state = reactive({
    formData: {},
    title: $t('处理'),
    operateActions: [$t('取消'), $t('提交回复')],
    complaintImages: [],
    complaintVideos: [],
    replyImages: [],
    replyVideos: [],
})

onMounted(() => {
    let { replyContent, attach, status, replyAttach } = props.itemData
    state.formData = { replyContent }
    let fileList = attach ? attach.split(",") : []
    state.complaintImages = fileList.filter(item => !item.endsWith('.mp4'))
    state.complaintVideos = fileList.filter(item => item.endsWith('.mp4'))
    if (replyAttach) {
        let arr = replyAttach ? replyAttach.split(",") : []
        state.replyImages = arr.filter(item => !item.endsWith('.mp4'))
        state.replyVideos = arr.filter(item => item.endsWith('.mp4'))
    }
    if (status) {
        state.title = $t('查看')
        state.operateActions = [$t('关闭')]
    }
})

const handleLook = (url) => {
    emits('lookVideo', url)
}

const handleOperation = () => {
    let { replyContent, image, video } = state.formData
    let { userId, id, siteId } = props.itemData
    if (!replyContent && !image && !video) return ElMessage.warning($t('请输入回复内容或上传附件再进行操作！'))
    if (image && video) {
        let imageArr = image.split(',')
        let videoArr = video.split(',')
        if (imageArr.length + videoArr.length > 5) return ElMessage.warning($t('附件最大数量为5个！'))
    }
    let params = {
        replyContent,
        userId,
        id,
        status: 1,
        merchantId: siteId
    }
    if (image) params.replyAttach = image
    if (video) {
        if (params.replyAttach) {
            params.replyAttach += ',' + video
        } else {
            params.replyAttach = video
        }
    }
    dialog.value.showLoading()
    replayFeedBack(params).then(res => {
        emits('close')
        emits('fetchData')
    }).catch(err => {
        dialog.value.closeLoading()
    })
}

</script>

<style lang="scss">
.member-complaint-form {
    .file-row .el-form-item__content {
        display: flex;
        flex-wrap: wrap;
        .el-button + .el-button {
            margin-left: 0;
        }
    }
}
</style>
