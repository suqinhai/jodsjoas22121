<template>
    <!-- 首页模块-首页活动设置 -->
    <div class="tabs-main home-activity-settings">
        <!-- 首页弹窗配置 -->
        <div class="head" style="margin-top: 0">
            <div class="title">{{$t('大厅弹窗')}}<div class="pr pointer" style="margin: 0 10px">
                    <el-switch :disabled="!userData.isHasPermiss('merchant.app.layout-sections')" v-model="state.formData.popup" :active-value="1"
                        :inactive-value="0" :active-text="$t('开启')" :inactive-text="$t('关闭')" />
                    <div v-permiss="'merchant.app.layout-sections'" class="small-mask pa" @click="handleSwitch('popup')"></div>
                </div>
                <el-button v-permiss="'merchant.app.layout-sections'" v-throttle type="primary"
                    @click="handleGo('/operating-center/publicity-manage?type=3')">{{$t('前往配置')}}</el-button>
            </div>
        </div>

        <!-- banner配置 -->
        <div class="head">
            <div class="title">{{$t('大厅banner')}}<div class="pr pointer" style="margin: 0 10px">
                    <el-switch :disabled="!userData.isHasPermiss('merchant.app.layout-sections')" v-model="state.formData.banner" :active-value="1"
                        :inactive-value="0" :active-text="$t('开启')" :inactive-text="$t('关闭')" />
                    <div v-permiss="'merchant.app.layout-sections'" class="small-mask pa" @click="handleSwitch('banner')"></div>
                </div>
                <el-button v-permiss="'merchant.app.layout-sections'" v-throttle type="primary"
                    @click="handleGo('/operating-center/publicity-manage?type=1')">{{$t('前往配置')}}</el-button>
            </div>
        </div>
        <!-- 大厅活动轮播图配置 -->
        <div class="head">
            <div class="title">{{$t('大厅活动轮播图')}}<div class="pr pointer" style="margin: 0 10px">
                    <el-switch :disabled="!userData.isHasPermiss('merchant.app.layout-sections')" v-model="state.formData.activityBanner"
                        :active-value="1" :inactive-value="0" :active-text="$t('开启')" :inactive-text="$t('关闭')" />
                    <div v-permiss="'merchant.app.layout-sections'" class="small-mask pa" @click="handleSwitch('activityBanner')">
                    </div>
                </div>
                <el-button v-permiss="'merchant.app.layout-sections'" v-throttle type="primary"
                    @click="handleGo('/operating-center/publicity-manage?type=4')">{{$t('前往配置')}}</el-button>
            </div>
        </div>
        <!-- APP加载页轮播图配置 -->
        <!-- <div class="head">
            <div class="title">{{$t('APP加载页轮播图')}}<div class="pr pointer" style="margin: 0 10px">
                    <el-switch :disabled="!userData.isHasPermiss('merchant.app.layout-sections')" v-model="state.formData.loading" :active-value="1"
                        :inactive-value="0" :active-text="$t('开启')" :inactive-text="$t('关闭')" />
                    <div v-permiss="'merchant.app.layout-sections'" class="small-mask pa" @click="handleSwitch('loading')"></div>
                </div>
                <el-button v-permiss="'merchant.app.layout-sections'" v-throttle type="primary" @click="handleGo('/operating-center/publicity-manage?type=2')">{{$t('前往配置')}}</el-button>
            </div>
        </div> -->

        <!-- 广播配置 -->
        <!-- <div class="head">
            <div class="title">{{$t('广播')}}<div class="pr pointer" style="margin: 0 10px">
                    <el-switch :disabled="!userData.isHasPermiss('merchant.app.layout-sections')" v-model="state.formData.broadcast" :active-value="1"
                        :inactive-value="0" :active-text="$t('开启')" :inactive-text="$t('关闭')" />
                    <div v-permiss="'merchant.app.layout-sections'" class="small-mask pa" @click="handleSwitch('broadcast')">
                    </div>
                </div>
                <el-button v-permiss="'merchant.app.layout-sections'" v-throttle type="primary" @click="handleGo('/operating-center/notification-push?type=1')">{{$t('广播配置')}}</el-button>
            </div>
        </div> -->
    </div>
</template>

<script setup name="home">
import { reactive, watch, defineProps } from 'vue'
import userStore from '@/store/user'
import { useRouter } from 'vue-router'
import { getHomeDeploy, postHomeDeploy } from '@/api/website'

const props = defineProps({
    sections: {
        type: Object,
        default: () => {
            return {}
        }
    }
})
const state = reactive({
    formData: {},
})
const router = useRouter()
const userData = userStore()

watch(
    () => props.sections,
    (val) => {
        if (Object.keys(val).length) {
            state.formData = { ...val }
        }
    }
)

// 获取首页配置数据
const getData = () => {
    globalVBus.$emit('globalLoading', true)
    getHomeDeploy({ part: 'sections', type: 'home' }).then(res => {
        let { data } = res
        state.formData = data
        globalVBus.$emit('globalLoading', false)
    }).catch((err) => {
        globalVBus.$emit('globalLoading', false)
    })
}

const handleSwitch = (key) => {
    globalVBus.$emit('globalLoading', true)
    postHomeDeploy({
        type: 'home',
        part: 'sections',
        alias: key,
        status: state.formData[key] ? 0 : 1
    }).then(() => {
        getData()
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}

// 跳转
const handleGo = (url) => {
    router.push(url)
}

</script>

<style lang="scss">
.home-activity-settings {
    .head {
        display: flex;
        justify-content: space-between;
        width: 1000px;
        margin-top: 20px;
        padding-right: 20px;
        .title {
            display: flex;
            align-items: center;
            line-height: 40px;
            font-size: 16px;
            font-weight: 600;
        }
    }

    .el-button {
        margin-left: 10px;
    }

    .small-mask {
        left: 0;
        top: 0;
        opacity: 0;
        width: 100%;
        height: 100%;
    }
}
</style>
