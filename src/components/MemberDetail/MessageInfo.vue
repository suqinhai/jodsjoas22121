<template>
    <!-- 会员详情弹窗-会员消息-消息详情 -->
    <Dialog ref="dialog" width="600" :isShowSubmit="false" :title="$t('会员消息')" top="10vh" @cancel="cancel">
        <div class="html-title">{{itemData.title || ''}}</div>
        <div class="html-content" v-html="itemData.content || ''"></div>
    </Dialog>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const emits = defineEmits(['close'])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        }
    }
})

const cancel = () => {
    emits('close')
}

</script>

<style lang="scss" scoped>
.html-title {
    width: 100%;
    text-align: center;
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 15px;
}
.html-content {
    img {
        max-width: 100%;
        height: fit-content;
        object-fit: cover;
    }
    video {
        max-width: 100%;
        height: fit-content;
        object-fit: cover;
    }
}
</style>

