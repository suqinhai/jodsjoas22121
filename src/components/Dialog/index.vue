<template>
    <el-dialog :width="width + 'px'" destroy-on-close :close-on-click-modal="closeClickModal" :title="title" :append-to-body="isChild"
        :center="titleCenter" :show-close="isCancel && isShowClose" :close-on-press-escape="loseOnPressEscape"
        :top="typeof top === 'number' ? top + 'px' : top" v-model="showMask" @close="cancel" :modal-class="className">
        <div v-if="showMask" v-loading="switchLoading" class="mask-container">
            <!-- 弹窗内容 -->
            <div class="box-top" v-if="isCustom" :style="{ paddingRight: rightPadding + 'px', ...styleCustom}">
                <slot></slot>
            </div>
            <slot v-else></slot>
            <div v-if="isShowBottomButton" class="box-bot" :class="{ 'box-bot__center': buttonCenter }">
                <el-button v-throttle :type="isShowSubmit ? '' : 'primary'" @click="cancel">
                    {{ isShowSubmit ? operateActions[0] : submitButtonTitle }}
                </el-button>
                <div class="others-btn" v-if="otherActions.length > 0">
                    <el-button v-throttle type="primary" v-for="(item, index) in otherActions" :key="item" @click="emit('otherEvent', index)">
                        {{ item }}</el-button>
                </div>
                <el-button v-throttle v-if="isShowSubmit && operateActions[1]" style="margin-left: 20px" type="primary" @click="submit">
                    {{ operateActions[1] }}</el-button>
            </div>
        </div>
        <div v-if="!isCancel && isShowClose && showMask" class="close-box pa pointer" @click="handleClose">
            <el-icon :size="18">
                <Close />
            </el-icon>
        </div>
    </el-dialog>
</template>

<script setup>
import { ref } from "vue"

const props = defineProps({
    // 弹窗内容是否为定制
    isCustom: {
        type: Boolean,
        default: true,
    },

    // 弹窗标题
    title: {
        type: String,
        default: $t('新增'),
    },

    // 弹窗标题是否居中
    titleCenter: {
        type: Boolean,
        default: false,
    },

    // 是否可以通过按下 ESC 关闭 Dialog
    loseOnPressEscape: {
        type: Boolean,
        default: false,
    },

    // 弹窗按钮是否居中
    buttonCenter: {
        type: Boolean,
        default: false,
    },

    // 弹窗距离浏览器顶部距离
    top: {
        type: [Number, String],
        default: '10vh',
    },

    // 弹窗宽度
    width: {
        type: [Number, String],
        default: 700,
    },

    // 是否可以点击遮罩层关闭弹窗
    closeClickModal: {
        type: Boolean,
        default: false,
    },

    // 是否为二级弹窗
    isChild: {
        type: Boolean,
        default: false,
    },

    // 操作按钮
    operateActions: {
        type: Array,
        default() {
            return [$t('取消'), $t('提交')];
        },
    },

    // 是否展示底部按钮
    isShowBottomButton: {
        type: Boolean,
        default: true,
    },

    // 是否展示提交按钮
    isShowSubmit: {
        type: Boolean,
        default: true,
    },

    // 只存在一个按钮时，提交按钮文案
    submitButtonTitle: {
        type: String,
        default: $t('关闭'),
    },

    // 是否为取消按钮
    isCancel: {
        type: Boolean,
        default: true,
    },

    // 不展示取消按钮时是否展示关闭按钮
    isShowClose: {
        type: Boolean,
        default: true,
    },

    // 弹窗右侧填充
    rightPadding: {
        type: [Number, String],
        default: 40,
    },

    // 添加样式
	styleCustom: {
		type: Object,
		default: {},
	},

    className: {
        type: String,
        default: "custom-dialog",
    },

    otherActions: {
        type: Array,
        default: () => [],
    },
})

const switchLoading = ref(false)
const showMask = ref(true)
const isClickClose = ref(false)
const emit = defineEmits(["cancel", "confirm", "close", "otherEvent"])

// loading展示
const showLoading = () => {
    switchLoading.value = true
}

// loading关闭
const closeLoading = () => {
    switchLoading.value = false
}

// 自定义关闭按钮(取消按钮存在其他功能时)
const handleClose = () => {
    showMask.value = false
    isClickClose.value = true
}

// 取消
const cancel = () => {
    if (props.isCancel) {
        showMask.value = false
        emit("cancel")
    } else {
        if (isClickClose.value) {
            isClickClose.value = false
            emit("close")
        } else {
            emit("cancel")
        }
    }
}

// 提交
const submit = () => {
    emit("confirm")
}

defineExpose({ showLoading, closeLoading })
</script>

<style lang="scss">
.el-dialog {
    padding: 0 !important;

    .el-dialog__body {
        padding: 0 !important;
    }

    .el-dialog__header {
        padding: 20px 20px 10px;
        margin-right: 16px;
        position: relative;

        .el-dialog__headerbtn {
            position: absolute;
            width: 54px;
            height: 54px;
            right: -16px;
            top: 6px;
        }
    }
}

.custom-dialog {
    .el-form-item__content {
        display: initial;

        > * {
            flex-shrink: 0;
        }
    }
}
</style>
<style lang="scss" scoped>
.close-box {
    top: 11px;
    right: 7px;
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;

    &:hover {
        color: #409eff;
    }
}

.mask-container {
    display: flex;
    flex-direction: column;

    .box-top {
        border-top: 1px solid #ebeef5;
        padding: 20px 40px;
        display: flex;
        flex-direction: column;
    }

    .box-top::-webkit-scrollbar {
        width: 10px;
    }

    .box-top::-webkit-scrollbar-track {
        border-radius: 5px;
        background-color: #f1f1f1;
    }

    .box-top::-webkit-scrollbar-thumb {
        border-radius: 0;
        background-color: #c1c1c1;
    }

    .table-box {
        padding: 20px 40px;
    }

    .box-bot {
        border-top: 1px solid #ebeef5;
        height: 80px;
        text-align: right;
        line-height: 76px;
        padding-right: 40px;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        flex-wrap: nowrap;
        flex-direction: row;

        .el-button {
            min-width: 70px;
            height: 34px;
            padding: 8px 15px;
        }
    }

    .box-bot__center {
        justify-content: center;
        padding-right: 0;
    }

    .others-btn {
        display: flex;
        margin-left: 20px;
    }
}
</style>
