<template>
    <!-- 站点配置-子站点配置-引导 -->
    <Dialog ref="dialog" width="590" :title="$t('提示')" top="10vh" :isShowSubmit="false" @cancel="emits('close')">
        <div class="site-config-guide">
            <div class="title">{{$t('开站前请完成以下配置：')}}</div>
            <div class="small-row" v-for="item in showData" :key="item.value">
                <span class="label">{{item.label}}</span>
                {{item.useTemplate ? (isPermiss ? item.content : item.specialContent) : item.content}}
                <template v-if="item.useTemplate && isPermiss">
                    <span class="special pointer" @click="handleCopy(item.value)">{{$t('复制模版')}}</span>
                    {{$t('或 ')}}
                </template>
                <span class="special pointer" @click="handleJump(item.path)">{{$t('前往设置')}}</span>
            </div>
        </div>
    </Dialog>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import userStore from '@/store/user'

let keyArr = [
    { value: 'domainName', label: $t('前端域名配置：'), content: $t('前端域名配置未设置，请'), useTemplate: false, path: '/site-config/site-domain' },
    { value: 'logo', label: $t('Logo设置：'), content: $t('站点logo配置未设置，请'), useTemplate: false, path: '/site-config/home-module' },
    { value: 'register', label: $t('注册方式：'), content: $t('站点注册方式配置未设置，请使用'), specialContent: $t('站点注册方式配置未设置，请'), useTemplate: true, path: '/site-config/register-config' },
    { value: 'platform', label: $t('开放厂家：'), content: $t('站点厂家游戏配置未设置，请使用'), specialContent: $t('站点厂家游戏配置未设置，请'), useTemplate: true, path: '/game-center/game-platform-list' },
    { value: 'banner', label: $t('Banner：'), content: $t('站点banner未设置，请使用'), specialContent: $t('站点banner未设置，请'), useTemplate: true, path: '/operating-center/publicity-manage' },
]
const emits = defineEmits(['close', 'handleCopySite'])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        }
    },
})
const router = useRouter()
const userData = userStore()

const showData = computed(() => {
    return keyArr.filter(item => !props.itemData[item.value])
})
const isPermiss = computed(() => {
    return userData.isHasPermiss('admin.merchant.copyConfig')
})

const handleCopy = (key) => {
    emits('close')
    emits('handleCopySite', {
        id: props.itemData.id,
        type: key === 'register' ? 0 : key === 'platform' ? 1 : 2
    })
}

const handleJump = (path) => {
    emits('close')
    router.push(path + '?merchantId=' + props.itemData.id)
}
</script>

<style lang="scss" scoped>
.site-config-guide {
    .title {
        font-size: 16px;
        font-weight: 600;
        color: #666;
        margin-bottom: 20px;
    }
    .small-row {
        padding-left: 10px;
        color: #999;
        margin-bottom: 10px;
    }
    .label {
        color: #666;
    }
    .special {
        text-decoration: underline;
    }
}
</style>
