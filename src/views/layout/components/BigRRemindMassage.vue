<template>
    <Dialog ref="dialog" width="600" :isShowSubmit="false" :submitButtonTitle="$t('知道了')" :title="$t('提醒')" top="10vh" @cancel="cancel">
        <div class="title">
            {{ itemData.level_ || ''}} {{$t('玩家')}}
            <span class="name pointer"
                @click="handleInfo(itemData.userId)">{{ itemData.user && itemData.user.name ? itemData.user.name :  itemData.userId }}</span>{{$t('已登录大厅')}}！
        </div>
    </Dialog>
</template>

<script setup>
const emits = defineEmits(['close', 'showNext', 'showMemberInfo'])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        }
    }
})

const handleInfo = (id) => {
    emits('showMemberInfo', id)
}

const cancel = () => {
    emits('close')
    emits('showNext')
}

</script>

<style lang="scss" scoped>
.title {
    width: 100%;
    text-align: center;
    font-size: 20px;
    font-weight: 700;

    .name {
        color: #409eff;
        padding: 0 10px;
    }
}
</style>

