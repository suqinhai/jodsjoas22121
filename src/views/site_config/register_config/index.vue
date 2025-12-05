<template>
    <!-- 站点配置-注册登录配置 -->
    <div class="">
        <TcRegister v-if="isCustomize"/>
        <Register v-else/>
    </div>
</template>

<script setup name="registerConfig">
import { ref, reactive, onMounted, nextTick, onActivated, computed, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import commonStore from '@/store/common'
import { getMetaData, postMetaData } from '@/api/common'
import { deepClone } from '@/common/util'
import { useRouter } from 'vue-router'
import userStore from '@/store/user'
const userData = userStore()
const TcRegister = defineAsyncComponent(() => import('./components/TcRegister.vue'))
const Register = defineAsyncComponent(() => import('./components/Register.vue'))

const isCustomize = computed(() => {
    return userData.getTemplateType() === 4
})


</script>

<style lang="scss" scoped>

</style>
