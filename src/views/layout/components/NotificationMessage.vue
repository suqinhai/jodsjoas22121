<template>
    <Dialog ref="dialog" width="600" :isShowSubmit="false" :title="$t('站点消息')" top="10vh" @cancel="cancel">
        <div class="html-title">{{itemData.title || ''}}</div>
        <div class="html-content" v-html="itemData.content || ''"></div>
    </Dialog>
</template>

<script setup>
const emits = defineEmits(['close', 'showNext'])
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
    emits('showNext')
}

</script>

<style lang="scss">
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

