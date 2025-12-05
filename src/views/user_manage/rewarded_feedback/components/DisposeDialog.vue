<template>
    <!-- 有奖反馈-审核 -->
    <Dialog ref="dialog" width="650" :title="state.title" top="10vh" :operateActions="state.operateActions" :isShowSubmit="state.isShowSubmit"
        :isCancel="state.isCancel" @confirm="handleOperation(1)" @cancel="handleOperation(2)" @close="emits('close')">
        <el-form ref="operateForm" class="rewarded-feedback-form" :model="state.formData" :label-width="$locale == 'zh' ? '80px' : 'auto'">
            <el-form-item :label="$t('反馈内容:')">
                <el-input style="width: 100%" type="textarea" :rows="6" disabled v-model="state.formData.feedbackContent" />
            </el-form-item>
            <el-form-item :label="$t('附件:')" class="file-row">
                <div v-if="!state.formData.attach">{{$t('无')}}</div>
                <UploadImage :style="{'width': state.images.length * 160 + 'px'}" v-if="state.images.length" v-model="state.images" disabled />
                <el-button v-for="(item,index) in state.videos" :key="index" v-throttle type="primary" text @click="handleLook(item)">{{$t('查看视频附件')}}{{state.videos.length > 1 ? index + 1 : ''}}</el-button>
            </el-form-item>
            <el-form-item :label="$t('奖励:')" v-if="state.formData.status !== 2">{{$t('采纳，赠送金额')}}<el-input-number v-model="state.formData.giftAmount" :disabled="state.formData.status !== 0" style="width: 260px;margin: 0 5px"
                    :controls="false" :min="0" :precision="2" />BRL
            </el-form-item>
            <el-form-item :label="$t('回复:')" v-if="state.formData.status !== 2">
                <el-input style="width: 100%" type="textarea" :rows="4" :disabled="state.formData.status !== 0" :placeholder="$t('请输入回复')"
                    v-model="state.formData.replyContent" show-word-limit maxlength="255" />
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { replayFeedBack } from '@/api/operation'

const emits = defineEmits(['fetchData', 'close', 'lookVideo'])
const props = defineProps({
    itemData: {
        type: Object,
        default: {}
    }
})
const dialog = ref(null)
const operateForm = ref(null)
const state = reactive({
    formData: {},
    title: $t('处理'),
    operateActions: [$t('忽略'), $t('采纳')],
    isShowSubmit: true,
    isCancel: false,
    images: [],
    videos: []
})

onMounted(() => {
    state.formData = { ...props.itemData }
    let fileList = state.formData.attach ? state.formData.attach.split(",") : []
    state.images = fileList.filter(item => !item.endsWith('.mp4'))
    state.videos = fileList.filter(item => item.endsWith('.mp4'))
    if (state.formData.status) {
        state.title = $t('查看')
        state.operateActions = [$t('关闭')]
        state.isShowSubmit = false
        state.isCancel = true
    }
})

const handleLook = (url) => {
    emits('lookVideo', url)
}

const handleOperation = (val) => {
    if (state.formData.status !== 0) return emits('close')
    const { giftAmount, replyContent, userId, id } = state.formData
    let params = {
        replyContent,
        userId,
        id,
        status: val
    }
    if (val === 1) params.giftAmount = giftAmount
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
.rewarded-feedback-form {
    .file-row .el-form-item__content {
        display: flex;
        flex-wrap: wrap;
        .el-button + .el-button {
            margin-left: 0;
        }
    }
}
</style>
