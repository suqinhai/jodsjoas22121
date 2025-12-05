<template>
    <!-- VIP等级-提现设置 -->
    <Dialog width="350" :title="$t('提示')" top="10vh" buttonCenter @confirm="handleSubmit" @cancel="cancel" :operateActions="[$t('取消'),$t('去设置')]">
        <div>{{$t('添加vip等级成功，请配置vip提现设置，避免造成损失')}}！</div>
    </Dialog>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const emits = defineEmits(['close'])
const handleSubmit = () => {
    emits('close')
    router.push('/finance-center/member-withdrawl-settings?tab=1')
}

const cancel = () => {
    emits('close')
}

</script>

<style lang="scss">
</style>