<template>
    <!-- 品牌设置-LOGO设置 -->
    <div class="webpage-config">
        <div class="webpage-config-main">
            <el-form class="deploy-form" :model="state.formData" label-width="200px">
                <el-form-item :label="$t('桌面快捷方式:')">
                    <div class="module">
                       <div class="btn">
                            <el-button v-throttle v-if="!state.shortcutDisabled" @click="getData(1)">{{$t('取 消')}}</el-button>
                            <el-button v-throttle style="margin-left:30px" type="primary" v-if="!state.shortcutDisabled" @click="handleSave(1)">
                                {{$t('保存')}}</el-button>
                            <el-button v-throttle type="primary" v-if="state.shortcutDisabled" @click="state.shortcutDisabled = false">{{$t('修 改')}}
                            </el-button>
                        </div>
                        <div>
                            <UploadImage :disabled="state.shortcutDisabled" v-model="state.desktopLogo" accept=".png" :width="192" :height="192"
                            :tip="$t('请上传192*192或等比例，PNG格式小于200KB的图片')" />
                        </div>
                        <div class="right" v-if="userData.getTemplateType() !== 4">
                            <p class="label-desktop">{{$t('首页桌面快捷方式提示触发:')}}</p>
                            <el-radio-group v-model="state.triggerWay" :disabled="state.shortcutDisabled">
                                <el-radio :label="0">{{$t('不触发')}}</el-radio>
                                <el-radio :label="1">{{$t('只弹一次')}}</el-radio>
                                <el-radio :label="2">{{$t('每次刷新')}}</el-radio>
                                <el-radio :label="3">{{$t('每日一次')}}</el-radio>
                            </el-radio-group>
                        </div>
                    </div>
                </el-form-item>

                <el-form-item :label="$t('网页配置:')">
                    <div class="btn">
                        <el-button v-throttle v-if="!state.webDisabled" @click="getData(2)">{{$t('取消')}}</el-button>
                        <el-button v-throttle style="margin-left:30px" type="primary" v-if="!state.webDisabled" @click="handleSave(2)">{{$t('保存')}}
                        </el-button>
                        <el-button v-throttle type="primary" v-if="state.webDisabled" @click="state.webDisabled = false">{{$t('修改')}}</el-button>
                    </div>
                    <el-form-item :label="$t('网页logo:')" label-width="80px">
                        <UploadImage :disabled="state.webDisabled" v-model="state.formData.wapLogo" :width="32" :height="32"
                            :tip="$t('请上传32*32或等比例，PNG/JPG/GIF格式小于100KB的图片')" />
                    </el-form-item>
                    <el-form-item :label="$t('网页标题:')" label-width="80px">
                        <el-input :disabled="state.webDisabled" v-model="state.formData.title" :placeholder="$t('请输入标题')" />
                    </el-form-item>
                </el-form-item>
            </el-form>
            <div class="deploy-preview" v-if="(!!state.formData.wapLogo || !!state.formData.title)">
                <div class="preview-head">
                    <div class="small-box pr">
                        <img class="small-box-icon" :src="state.formData.wapLogo || ''" alt="">
                        <span class="small-box-title">{{state.formData.title}}</span>
                        <span class="small-box-close pa">
                            <el-icon>
                                <Close />
                            </el-icon>
                        </span>
                    </div>
                    <el-icon>
                        <Plus />
                    </el-icon>
                </div>
                <div class="preview-website">
                    <div class="preview-website-left">
                        <el-icon color="#666" :size="18">
                            <Back />
                        </el-icon>
                        <el-icon color="#aaa" :size="18">
                            <Right />
                        </el-icon>
                        <el-icon color="#666" :size="18">
                            <RefreshRight />
                        </el-icon>
                    </div>
                    <div class="preview-website-right">
                        www.xxxxx.com
                    </div>
                </div>
                <div class="preview-main"></div>
            </div>
        </div>
    </div>
</template>

<script setup name="webpageConfig">
import { reactive, onMounted } from 'vue'
import { getHomeDeploy, postHomeDeploy } from '@/api/website'
import userStore from '@/store/user'
const userData = userStore()
const state = reactive({
    formData: {},
    desktopLogo: '',
    shortcutDisabled: true,
    webDisabled: true,
    triggerWay: 1,
})

onMounted(() => {
    getData()
})


// 获取配置数据
const getData = (type = 0) => {
    globalVBus.$emit('globalLoading', true)
    getHomeDeploy({ part: 'logos' }).then(({ code, data }) => {
        if (code === 0 && data) {
            if (type === 0 || type === 1) {
                let obj = data.find(item => item.alias === 'desktopLogo')
                state.desktopLogo = obj && obj.icon ? obj.icon : ''
                state.shortcutDisabled = true
                state.triggerWay = obj && obj.freq !== undefined && obj.freq !== null ? obj.freq : 1
            }
            if (type === 0 || type === 2) {
                let obj = data.find(item => item.alias === 'wapLogo')
                state.formData.wapLogo = obj && obj.icon ? obj.icon : ''
                state.formData.title = obj && obj.title ? obj.title : ''
                state.webDisabled = true
            }
        }
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}

// 保存
const handleSave = (type) => {
    let obj = {}
    if (type === 1) {
        obj = {
            alias: 'desktopLogo',
            icon: state.desktopLogo,
        }
        if (userData.getTemplateType() !== 4) {
            obj.freq = state.triggerWay
        }
    } else {
        obj = {
            alias: 'wapLogo',
            icon: state.formData.wapLogo,
            title: state.formData.title
        }
    }
    postDeploy(obj, type)
}

const postDeploy = (params, type) => {
    params.part = 'logos'
    globalVBus.$emit('globalLoading', true)
    postHomeDeploy(params).then((res) => {
        getData(type)
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss" scoped>
.label-desktop {
    margin-top: 20px;
    display: inline-flex;
    justify-content: flex-end;
    align-items: flex-start;
    flex: 0 0 auto;
    font-size: var(--el-form-label-font-size);
    color: var(--el-text-color-regular);
    height: 32px;
    line-height: 32px;
    padding: 0 12px 0 0;
    box-sizing: border-box;
    font-weight: 600;
}   
.webpage-config {
    height: calc(100% - 55px);
    overflow-y: auto;
    &-main {
        display: flex;

        .tips {
            font-size: 12px;
            color: red;
            transform: translateY(-10px);
        }

        .deploy-form {
            width: 650px;
            flex-shrink: 0;
        }

        .deploy-preview {
            flex-shrink: 0;
            margin-left: 100px;
            width: 375px;
            height: 500px;
            border: 1px solid #ccc;
            display: flex;
            flex-direction: column;
            .preview-head {
                width: 100%;
                height: 30px;
                background-color: #d3e3fb;
                display: flex;
                align-items: center;

                .small-box {
                    background-color: #fff;
                    margin-right: 10px;
                    // margin: 10px 10px 10px 0;
                    width: 120px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    padding-right: 24px;
                    padding-left: 5px;
                    // border-right: 1px solid #bad2fa;
                    overflow: hidden;

                    &-icon {
                        max-width: 20px;
                        max-height: 20px;
                        margin-right: 5px;
                    }

                    &-close {
                        background-color: #fff;
                        width: 20px;
                        height: 16px;
                        text-align: center;
                        line-height: 16px;
                        top: 9px;
                        right: 0;
                    }
                }
            }

            .preview-website {
                margin-top: 5px;
                width: 100%;
                height: 30px;
                display: flex;
                align-items: center;
                padding: 0 5px;

                &-left {
                    width: 100px;
                    display: flex;
                    justify-content: space-around;
                    padding-right: 5px;
                }

                &-right {
                    flex: 1;
                    line-height: 30px;
                    padding-left: 10px;
                    border-radius: 15px;
                    background-color: #ccc;
                }
            }

            .preview-main {
                margin-top: 5px;
                flex: 1;
                background-color: #074a2c;
            }
        }
    }

    .btn {
        margin-left: 10px;
        margin-bottom: 15px;
    }
}
</style>
