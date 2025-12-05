<template>
    <!-- 运营中心-优惠活动列表-人工审核 -->
    <Dialog top="2vh" :title="$t('人工审核')" width="1500" :isShowBottomButton="false"
        @cancel="emits('close')">
        <div class="explain-box">
            <ActivityReview :itemData="props.itemData" :merchantId="props.itemData.merchantId"></ActivityReview>
        </div>
    </Dialog>
</template>

<script setup>
    import ActivityReview from '@/views/operating_center/activity-review/index.vue';
    const emits = defineEmits(['close'])

    const props = defineProps({
        itemData: {
            type: Object,
            default: () => {
                return {}
            },
        },
    })
</script>

<style lang="scss">
</style>
