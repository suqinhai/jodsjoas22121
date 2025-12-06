<template>
    <!-- 运营中心-消息推送-C版系统推送-新增/编辑/详情 -->
    <Dialog ref="dialog" width="700" :operateActions="state.operateActions" :isShowSubmit="itemData.id !== -1" :title="state.title" top="10vh"
        @confirm="handleSubmit(deployForm)" @cancel="cancel">
        <el-form ref="deployForm" class="notification-deploy" :disabled="itemData.id === -1" :rules="state.rules" :model="state.formData"
            label-width="auto">
            <el-form-item :label="$t('标题:')" prop="title">
                <el-input v-model="state.formData.title" :placeholder="$t('请输入标题')" />
            </el-form-item>
            <el-form-item :label="$t('显示内容:')" prop="content">
                <Tinymce v-model="state.formData.content" :disabled="itemData.id === -1"></Tinymce>
            </el-form-item>
            <div class="senderType">
                <el-form-item :label="$t('发件人') + ':'" prop="sendType">
                    <el-radio-group v-model="state.formData.sendType">
                        <el-radio :label="0">{{$t('平台')}}</el-radio>
                        <el-radio :label="1">{{$t('自定义')}}</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item prop="sender" v-if="state.formData.sendType === 1" label-width="0px">
                    <el-input style="margin-left: 10px" v-model="state.formData.sender" :placeholder="$t('请输入发件人账号')" />
                </el-form-item>
            </div>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue"
import { ElMessage } from "element-plus"
import { addOrEditMessage } from "@/api/data_center"

const emits = defineEmits(["close", "fetchData"])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {};
        },
    },
})
const state = reactive({
    formData: {
        sendType: 0,
    },
    title: $t('新增'),
    operateActions: [$t('取消'), $t('确定')],
    rules: {
        title: { required: true, message: $t('必填项不能为空！'), trigger: "blur" },
        content: { required: true, message: $t('必填项不能为空！'), trigger: "blur" },
        sender: { required: true, message: $t('必填项不能为空！'), trigger: "blur" },
    },
})
const dialog = ref(null)
const deployForm = ref(null)

onMounted(() => {
    if (props.itemData.id) {
        state.formData = { ...props.itemData }
        state.formData.sendType = props.itemData.sender ? 1 : 0
        state.title = $t('修改')
        if (props.itemData.id === -1) {
            state.title = $t('查看')
            state.operateActions = [$t('关闭')]
        }
    }
})


const handleSubmit = (formEl) => {
    if (!formEl) return
    formEl.validate((valid) => {
        if (valid) {
            let params = { ...state.formData, type: 3, scope: 0, popUp: 3 }
            if (params.sendType === 0) params.sender = ''
            delete params.sendType
            dialog.value.showLoading()
            addOrEditMessage(params).then((res) => {
                emits("close")
                emits("fetchData")
            }).catch(() => {
                dialog.value.closeLoading()
            })
        } else {
            ElMessage.warning($t('请完善表单内容再进行提交！'))
        }
    });
};

const cancel = () => {
    emits("close")
};
</script>

<style lang="scss">
.notification-deploy {
    .senderType {
        display: flex;
    }
}
</style>
