<template>
    <!-- 首页模块-首页设置 -->
    <div class="home-settings">
        <div class="title" style="margin-bottom: 10px;">{{$t('logo设置')}}</div>
        <el-table :data="state.logoData" style="width: 800px" border>
            <el-table-column prop="i18Name" :label="$t('名称')" width="160" align="center" />
            <el-table-column :label="$t('图标')" min-width="160" align="center">
                <template #default="{ row }">
                    <div class="img-upload">
                        <el-image v-if="!!row.icon" class="imgs" :crossorigin="null" :src="row.icon" :preview-src-list="[row.icon]" preview-teleported
                            fit="contain" />
                        <Upload v-if="userData.isHasPermiss('merchant.app.layout-sections')" :isReplace="false" isDeletePrevData
                            :width="userData.getTemplateType() !== 4 ? 365 : 700" :height="userData.getTemplateType() !== 4 ? 65 : 168" :size="200"
                            v-model="row.icon" @success="uploadSuccess">
                            <template #default="{tabLoading}">
                                <el-button v-throttle type="primary" style="margin-left:15px" :loading="tabLoading" text>{{$t('上传')}}</el-button>
                            </template>
                        </Upload>
                    </div>
                    <div v-permiss="'merchant.app.layout-sections'" style="font-size: 12px">
                        {{userData.getTemplateType() !== 4 ? $t('上传365*65或等比例，PNG/JPG格式小于200KB的图片') : $t('上传700*168或等比例，PNG/JPG格式小于200KB的图片')}}
                    </div>
                </template>
            </el-table-column>
            <el-table-column :label="$t('模块开关')" width="180" align="center">
                <template #default="{ row }">
                    <div class="pr pointer">
                        <el-switch :disabled="!userData.isHasPermiss('merchant.app.layout-sections')" v-model="row.status" :active-value="1"
                            :inactive-value="0" @change="switchChange" />
                    </div>
                </template>
            </el-table-column>
        </el-table>
        <div class="head" v-if="userData.getTemplateType() !== 4 && userData.getTemplateType() !== 5">

            <div class="title">{{$t('左侧展开')}}</div>
            <div class="but" v-permiss="'merchant.app.layout-sections'" v-if="state.tableData.length">
                <el-button v-throttle v-if="!state.isDisabled" @click="getHomeData('leftNavigation',false)">{{$t('取 消')}}</el-button>
                <el-button v-throttle style="margin-left:20px" type="primary" v-if="!state.isDisabled" @click="handleSave">{{$t('保 存')}}</el-button>
                <el-button v-throttle type="primary" v-if="state.isDisabled" @click="state.isDisabled = false">{{$t('修 改')}}</el-button>
            </div>
        </div>
        <el-form v-if="userData.getTemplateType() !== 4  && userData.getTemplateType() !== 5" ref="deployForm" :disabled="state.isDisabled">
            <el-table :data="state.tableData" style="width: 800px" border>
                <el-table-column prop="i18Name" :label="$t('名称')" width="160" align="center" />
                <el-table-column :label="$t('图标')" min-width="160" align="center">
                    <template #default="{ row }">
                        <div v-if="row.alias !== 'server' && row.alias !== 'music'">
                            <div class="img-upload">
                                <el-image v-if="!!row.icon" class="imgs" :crossorigin="null" :src="row.icon" :preview-src-list="[row.icon]"
                                    preview-teleported fit="contain" />
                                <Upload v-if="userData.isHasPermiss('merchant.app.layout-sections') && !noEditIconKey.includes(row.alias)"
                                    :disabled="state.isDisabled" :width="getImgLimitSize(row.alias).width" :height="getImgLimitSize(row.alias).height"
                                    :size="getImgLimitSize(row.alias).size" v-model="row.icon">
                                    <template #default="{tabLoading}">
                                        <el-button v-throttle type="primary" style="margin-left:15px" :loading="tabLoading" text>{{$t('上传')}}
                                        </el-button>
                                    </template>
                                </Upload>
                            </div>
                            <div v-permiss="'merchant.app.layout-sections'" v-if="!noEditIconKey.includes(row.alias)" style="font-size: 12px">
                                {{$t('上传')}}{{getImgLimitSize(row.alias).width}}*{{getImgLimitSize(row.alias).height}}{{$t('或等比例，PNG/JPG/GIF格式小于')}}{{getImgLimitSize(row.alias).size}}{{$t('KB的图片')}}
                            </div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('模块开关')" width="180" align="center">
                    <template #default="{ row }">
                        <div class="pr pointer">
                            <el-switch v-model="row.status" :active-value="1" :inactive-value="0" />
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </el-form>
        <el-form style="margin-top: 30px" v-if="userData.getTemplateType() !== 4 && userData.getTemplateType() !== 5" v-permiss="'merchant.app.layout-homeBg'">
            <el-row>
                <el-col :span="8">
                    <el-form-item :label="$t('首页背景花纹:')" label-width="110px">
                        <div class="operate">
                            <el-button v-throttle v-if="!state.isDisabled2" @click="getHomeData('home_bg',false)">{{$t('取 消')}}</el-button>
                            <el-button v-throttle style="margin-left:20px" type="primary" v-if="!state.isDisabled2" @click="handleSubmit2">{{$t('保存')}}
                            </el-button>
                            <el-button v-throttle type="primary" v-if="state.isDisabled2" @click="state.isDisabled2 = false">{{$t('修 改')}}</el-button>
                        </div>
                        <UploadImage :disabled="state.isDisabled2" v-model="state.home_bg" accept=".png,.jpg,.jpeg" :width="128" :height="128"
                            :tip="`${$t('请上传')}${state.limitBg.width}*${state.limitBg.height}${$t('或等比例，PNG/JPG格式小于')}${state.limitBg.size}${$t('KB的图片')}`" />
                    </el-form-item>
                </el-col>
                 <el-col :span="16">
                    <el-form-item label-width="110px">
                        <div class="operate">
                          {{$t('示例：')}}
                        </div>
                        <div class="img-box" :style="{backgroundImage: `url(${state.home_bg})`}" v-if="state.home_bg"></div>
                        <div class="img-box" :style="{backgroundImage: `url(${homeBg})`}" v-else></div>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
        <el-form style="margin-top: 30px">
            <el-form-item :label="$t('启动页:')" label-width="110px">
                <div class="operate">
                    <el-button v-throttle v-if="!state.isDisabled1" @click="getHomeData('loadingPage',false)">{{$t('取 消')}}</el-button>
                    <el-button v-throttle style="margin-left:20px" type="primary" v-if="!state.isDisabled1" @click="handleSubmit">{{$t('保存')}}
                    </el-button>
                    <el-button v-throttle type="primary" v-if="state.isDisabled1" @click="state.isDisabled1 = false">{{$t('修 改')}}</el-button>
                </div>
                <UploadImage :disabled="state.isDisabled1" v-model="state.loadingPageIcon" accept=".png,.jpg,.jpeg" :width="1080" :height="1920"
                    :tip="$t('请上传1080*1920或等比例，PNG/JPG格式小于1000KB的图片')" />
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup name="home">
import { reactive, onMounted } from 'vue'
import userStore from '@/store/user'
import { ElMessage } from 'element-plus'
import { getHomeDeploy, postHomeDeploy } from '@/api/website'
import homeBg from '/img/default/home_bg.png'

let noEditIconKey = ['entrance', 'playRecord', 'download', 'customerService', 'faqHelp', 'about', 'language']
let keyData = ['logoData', 'tableData']
const state = reactive({
    loadingPageIcon: '',
    home_bg: '',
    tableData: [],
    logoData: [],
    isDisabled: true,
    isDisabled1: true,
    isDisabled2: true,
    limitBg: {
        width: 128,
        height: 128,
        size: 100
    },
})
const userData = userStore()

onMounted(() => {
    globalVBus.$emit('globalLoading', true)
    // if (userData.getTemplateType() === 4) {
    //     Promise.all([getHomeData('decorators'), getHomeData('loadingPage')]).then(() => {
    //         globalVBus.$emit('globalLoading', false)
    //     })
    // } else {
    //     Promise.all([getHomeData('leftNavigation'), getHomeData('decorators')]).then(() => {
    //         globalVBus.$emit('globalLoading', false)
    //     })
    // }
     Promise.all([getHomeData('leftNavigation'), getHomeData('decorators'), getHomeData('loadingPage'), getHomeData('home_bg')]).then(() => {
        globalVBus.$emit('globalLoading', false)
    })
})

// 获取首页配置数据
const getHomeData = (part = '', init = true) => {
    !init && globalVBus.$emit('globalLoading', true)
    getHomeDeploy({ part, type: 'home' }).then(res => {
        let { data } = res
        let key = ''
        if (part === 'decorators') {
            key = 'logoData'
        } else if (part === 'leftNavigation') {
            key = 'tableData'
            state.isDisabled = true
        } else if (part === 'loadingPage') {
            state.loadingPageIcon = data[0] && data[0].icon && data[0].icon.includes('http') ? data[0].icon : ''
            state.isDisabled1 = true
        } else if (part === 'home_bg') {
            state.home_bg = data[0] && data[0].icon && data[0].icon.includes('http') ? data[0].icon : ''
            state.isDisabled2 = true
        }
        // !!key && (state[key] = data)
        !!key && (state[key] = data.filter(item => item.alias !== 'music'))
        !init && globalVBus.$emit('globalLoading', false)
    }).catch((err) => {
        !init && globalVBus.$emit('globalLoading', false)
    })
}

// 修改logo配置数据
const uploadSuccess = (icon) => {
    let { alias, status } = state.logoData[0]
    postDeploy({
        part: 'decorators',
        alias,
        icon,
        status
    }, 'decorators')
}

// 修改logo配置数据
const switchChange = (status) => {
    let { icon, alias } = state.logoData[0]
    if (!icon && status) {
        state.logoData[0].status = 0
        return ElMessage.warning($t('开启模块前必须设置图标！'))
    }
    postDeploy({
        part: 'decorators',
        alias,
        icon,
        status
    }, 'decorators')
}

// 修改左侧展开配置
const handleSave = () => {
    if (state.tableData.some(item => !item.icon && item.status && item.alias !== 'server')) {
        return ElMessage.warning($t('开启模块前必须设置图标！'))
    }
    const MUSIC_MODULE_DATA = {
        alias: "music",
        homepageRows: 3,
        i18Name: "音乐",
        icon: "/img/default/nav_music.png",
        name: "@app.layout.menu.music",
        status: 0
    };
    state.tableData.push(MUSIC_MODULE_DATA);
    let params = {
        part: 'leftNavigation',
        navigationConfig: JSON.stringify(state.tableData),
    }
    postDeploy(params, 'leftNavigation')
}

// 修改启动页配置
const handleSubmit = () => {
    // if (!state.loadingPageIcon) return ElMessage.warning($t('请上传启动页图片后再进行操作！'))
    let params = {
        part: 'loadingPage',
        alias: 'loadingPage',
        status: 1,
        icon: state.loadingPageIcon ? state.loadingPageIcon : '/img/default/loadingPage.png',
    }
    postDeploy(params, 'loadingPage')
}
// 修改启动页配置
const handleSubmit2 = () => {
    let params = {
        part: 'home_bg',
        alias: 'home_bg',
        status: 1,
        icon: state.home_bg ? state.home_bg : 'home_bg.png',
    }
    postDeploy(params, 'home_bg')
}


const postDeploy = (params, key) => {
    params.type = 'home'
    globalVBus.$emit('globalLoading', true)
    postHomeDeploy(params).then(() => {
        getHomeData(key, false)
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}

const getImgLimitSize = (type) => {
    let obj = {}
    switch (type) {
        case 'vip':
        case 'incomeBox':
        case 'dealer':
            obj = { size: 100, width: 68, height: 45 }
            break;
        case 'inviteShare':
            obj = { size: 100, width: 360, height: 110 }
            break;
        case 'promotion':
        case 'task':
        case 'rebate':
        case 'collectRecord':
            obj = { size: 100, width: 170, height: 110 }
            break;
        default:
            obj = { size: 100, width: 68, height: 45 }
            break;
    }
    return obj
}
</script>

<style lang="scss" scoped>
.home-settings {
    margin-bottom: 20px;
    .title {
        font-size: 16px;
        color: #666;
    }
    .head {
        width: 800px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        margin-top: 20px;
        .but {
            display: flex;
            justify-content: center;
            .el-button {
                min-width: 70px;
            }
        }
    }
    .operate {
        width: 100%;
        margin-bottom: 15px;
    }
    .img-box {
        width: 100px;
        height: 148px;
        display: flex;
        justify-content: center;
        align-items: center;
        border: solid 1px #ccc;
        border-radius: 4px;
        background-repeat: repeat;
        background-size: 30% 30%;
        background-color: rgba(0, 0, 0, 0.85);
        img {
            width: auto;
            height: 100%;
        }
    }
}
</style>
