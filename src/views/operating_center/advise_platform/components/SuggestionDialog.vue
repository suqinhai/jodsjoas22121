<template>
    <!-- 运营中心-给平台提建议-回复 -->
    <Dialog ref="dialog" width="650" :title="state.title" top="10vh" :operateActions="state.operateActions" :isShowSubmit="state.isShowSubmit"
        :isCancel="state.isCancel" @confirm="handleOperation" @cancel="emits('close')" @close="emits('close')">
        <el-form ref="operateForm" class="rewarded-feedback-form" :model="state.formData" :label-width="$locale == 'zh' ? '80px' : 'auto'">
            <el-form-item :label="$t('反馈内容:')">
                <el-input style="width: 100%" type="textarea" :rows="6" v-model="state.formData.feedbackContent" :disabled="!!props.itemData.id" />
            </el-form-item>
            <el-form-item :label="$t('附件:')" class="file-row">
                <UploadImage v-model="state.formData.attach" :disabled="!!props.itemData.id" />
            </el-form-item>
           <el-form-item :label="$t('回复:')" v-if="state.formData.status === 1">
                <el-input style="width: 100%" type="textarea" :rows="4" disabled
                    v-model="state.formData.replyContent" show-word-limit maxlength="500" />
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { addFeedBack } from '@/api/operation'

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
    title: $t('创建'),
    operateActions: [$t('取消'), $t('提交')],
    isShowSubmit: true,
    isCancel: false,
})

onMounted(() => {
    state.formData = { ...props.itemData }
    if (!!props.itemData.id) {
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
    const { feedbackContent, attach } = state.formData
    let params = {
        feedbackContent,
        attach
    }
    dialog.value.showLoading()
    addFeedBack(params).then(res => {
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
