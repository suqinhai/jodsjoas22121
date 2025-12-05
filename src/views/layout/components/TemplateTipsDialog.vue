<template>
    <Dialog width="450" :isShowSubmit="false" :isShowClose="false" :submitButtonTitle="$t('知道了')" :title="$t('温馨提示')" top="10vh" @cancel="cancel" buttonCenter>
        <div>{{$t('新商户需要前往网站前台配置-模板设置完成：主题模板设置')}}</div>
    </Dialog>
</template>

<script setup>
import userStore from '@/store/user'
import { useRouter } from 'vue-router'

const userData = userStore()
const router = useRouter()

const cancel = () => {
    userData.showConfigTipsDialog = false
    router.push('/site-config/template-store')
}

</script>

<style lang="scss">
</style>

