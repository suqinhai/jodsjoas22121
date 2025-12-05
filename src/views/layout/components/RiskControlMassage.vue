<template>
    <Dialog ref="dialog" width="600" :isShowSubmit="false" :title="$t('风控提醒')" :submitButtonTitle="$t('知道了')" top="10vh" @cancel="cancel">
        <div class="content" :class="{'content-active':itemData.riskStatus === -1}">{{itemData.prompt || ''}}</div>
    </Dialog>
</template>

<script setup>
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
.content {
    width: 100%;
    text-align: center;
    font-size: 16px;
    // font-weight: 700;
    // margin-bottom: 15px;
    &-active {
        text-align: initial;
    }
}
</style>

