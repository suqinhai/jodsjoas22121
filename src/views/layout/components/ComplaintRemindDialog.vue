<template>
    <Dialog width="500" :title="$t('提醒')" buttonCenter :operateActions="[$t('关闭'), $t('去处理')]" top="10vh" @confirm="confirm" @cancel="cancel">
        <div>{{itemData}}</div>
    </Dialog>
</template>

<script setup>
import { useRouter } from 'vue-router'

const emits = defineEmits(['close'])
const props = defineProps({
    itemData: {
        default: ''
    }
})
const router = useRouter()

const cancel = () => {
    emits('close')
}

const confirm = () => {
    emits('close')
    router.push('/operating-center/member-complaint')
}

</script>

<style lang="scss" scoped>
</style>

