<template>
    <!-- 站点配置-注册登录配置 -->
    <div class="container register-config">
        <el-form ref="deployRef" :model="state.formData" :disabled="state.isDisabled" label-position="right">
            <div class="title">
                {{$t('注册方式：')}}
            </div>
            <el-form-item  class="item-row">
                <div class="item-row-small" v-if="!['UZ'].includes(userData.merchantInfo.country)">
                    <el-checkbox name="type" v-model.number="state.formData.phoneReg">
                         {{$t('手机号码注册')}}
                    </el-checkbox>
                </div>
                <div class="item-row-small" v-if="state.formData.phoneReg">
                    <el-radio-group  v-model="state.formData.ignoreCaptcha">
                        <el-radio :label="true">
                            <div> {{$t('无手机号验证码')}}</div>
                        </el-radio>
                        <el-radio :label="false">
                            <div>{{$t('有手机验证码（后台需配置手机短信）')}}
                                <el-button :disabled="false" style="margin-left: 10px;" v-throttle type="primary" 
                                    @click="router.push('/site-config/sms-config')">
                                    {{$t('短信配置')}}</el-button>
                            </div>
                        </el-radio>
                    </el-radio-group>
                </div>
            </el-form-item>

            <el-form-item label="" class="item-row">
                <div class="item-row-small">
                    <el-checkbox
                        v-model="state.formData.ignorePhoneReg" >
                        {{$t('账号注册（普通注册）')}}
                    </el-checkbox>
                </div>
            </el-form-item>

             <div class="title">
                {{$t('其他配置：')}}
            </div>
            <el-form-item class="item-row" v-if="!['UZ'].includes(userData.merchantInfo.country)">
                <div class="item-row-small">
                    <el-checkbox  v-model="state.formData.bindCaptcha" name="type">
                         {{$t('绑定手机验证码验证（开启后，前端个人中心个人信息页面可绑定手机号码）')}}
                    </el-checkbox>
                </div>
            </el-form-item>
            <el-form-item label="" class="item-row">
                <div class="item-row-small">
                    <el-checkbox  v-model="state.formData.regTipOpen" name="type">
                         {{$t('开启注册奖励角标')}}
                    </el-checkbox>
                </div>
            </el-form-item>
            <el-form-item label="" class="item-row">
                <div class="item-row-small">
                    <el-checkbox  v-model="state.formData.captcha" name="type">
                         {{$t('开启注册时需图形验证码验证')}}
                    </el-checkbox>
                </div>
            </el-form-item>
            <div class="">
                <div class="title">{{$t('三方登录：')}}</div>
                <div class="tips">{{$t('注意：修改配置将会影响之前会员不可登录，请谨慎操作！')}}</div>
            </div>
            <template v-if="state.ext.loginWays?.includes(2)">
                <el-form-item label="">
                     <el-checkbox  v-model="state.formData.ggOpen" name="type">
                        <span class="label-color">{{$t('谷歌授权登录')}}</span>
                    </el-checkbox>
                </el-form-item>
                <el-form-item :label-width="'140px'" :label="$t('谷歌appid:')" prop="gg.appid"
                    :rules="[{ required: !!state.formData.ggOpen, message: $t('请输入appid！'), trigger: 'blur'}]">
                    <el-input @input="(val) => state.formData.gg.appid = val.replace(/[\u4e00-\u9fa5]/g, '')" style="width: 650px"
                         v-model.trim="state.formData.gg.appid" :placeholder="$t('请输入appid')" />
                </el-form-item>
                <el-form-item :label-width="'140px'" :label="$t('谷歌secret:')" prop="gg.secret"
                    :rules="[{ required: !!state.formData.ggOpen, message: $t('请输入secret！'), trigger: 'blur'}]">
                    <el-input style="width: 650px" type="textarea" :rows="4" :placeholder="$t('请输入secret')"
                        v-model.trim="state.formData.gg.secret" />
                </el-form-item>
            </template>
            <template v-if="state.ext.loginWays?.includes(3)">
                <el-form-item label="">
                     <el-checkbox  v-model="state.formData.fbOpen" name="type">
                        <span class="label-color">{{$t('facebook授权登录')}}</span>
                    </el-checkbox>
                </el-form-item>
                <el-form-item :label-width="'140px'" :label="$t('facebook appid:')" prop="fb.appid"
                    :rules="[{ required: !!state.formData.fbOpen, message: $t('请输入appid！'), trigger: 'blur'}]">
                    <el-input @input="(val) => state.formData.fb.appid = val.replace(/[\u4e00-\u9fa5]/g, '')" style="width: 650px"
                         v-model.trim="state.formData.fb.appid" :placeholder="$t('请输入appid')" />
                </el-form-item>
                <el-form-item :label-width="'140px'" :label="$t('facebook secret:')" prop="fb.secret"
                    :rules="[{ required: !!state.formData.fbOpen, message: $t('请输入secret！'), trigger: 'blur'}]">
                    <el-input style="width: 650px" type="textarea" :rows="4" :placeholder="$t('请输入secret')"
                        v-model.trim="state.formData.fb.secret" />
                </el-form-item>
            </template>
            <el-form-item :label="$t('注册完成后充值提示：')">
                <el-checkbox v-model="state.formData.promptRecharge" :true-label="1" :false-label="0">
                    {{$t('开启提示')}}
                </el-checkbox>
            </el-form-item>
        </el-form>

        <div class="btn" v-permiss="'admin.meta.edit-30'">
            <el-button v-throttle v-if="!state.isDisabled" @click="getData">{{$t('取 消')}}</el-button>
            <el-button v-throttle style="margin-left:30px" type="primary" v-if="!state.isDisabled" @click="handleSave(deployRef)">{{$t('保 存')}}
            </el-button>
            <el-button v-throttle type="primary" v-if="state.isDisabled" @click="state.isDisabled = false">{{$t('修 改')}}</el-button>
        </div>

    </div>
</template>

<script setup name="registerConfig">
import { ref, reactive, onMounted, nextTick, onActivated } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import commonStore from '@/store/common'
import userStore from '@/store/user'
import { getMetaData, postMetaData } from '@/api/common'
import { deepClone } from '@/common/util'
import { useRouter } from 'vue-router'



const router = useRouter()
const state = reactive({
    formData: {
        phoneReg: false,
        ignoreCaptcha: true,
        bindCaptcha: false,
        regTipOpen: false,
        ignorePhoneReg: false,
        captcha: false,
        ggOpen: false,
        gg: {
            secret: '',
            appid: ''
        },
        fbOpen: false,
        fb: {
            secret: '',
            appid: ''
        },
        promptRecharge: 1
    },
    ext: {},
    initData: {
        type: 30
    },
    initSecret: '',
    initAppid: '',
    fbInit: '',
    isDisabled: true,
    isInit: true,
    oldData: {}
})
const deployRef = ref(null)
const route = useRoute()
const commonData = commonStore()
const userData = userStore()

onMounted(() => {
    if (commonData.isManual) state.isInit = false
    if (route.query.merchantId && +route.query.merchantId !== commonData.currentMerchantSite.id && !commonData.isManual) {
        commonData.setCurrentMerchantSite(+route.query.merchantId)
        return
    }
    getData()
})

onActivated(() => {
    if (state.isInit) return state.isInit = false
    if (route.query.merchantId && +route.query.merchantId !== commonData.currentMerchantSite.id && !commonData.isManual) {
        commonData.setCurrentMerchantSite(+route.query.merchantId)
    }
})

// 获取配置数据
const getData = () => {
    globalVBus.$emit('globalLoading', true)
    getMetaData({ type: 30 }).then(({ data, code, ext }) => {
        if (code === 0 && data && Object.values(data)[0]) {
            let obj = Object.values(data)[0]
            let dataObj = JSON.parse(obj.value)
            
            state.formData = Object.assign(state.formData, dataObj)
            for (let key in state.formData) {
                if (state.formData[key] === 0) {
                    state.formData[key] = false
                }
                if (state.formData[key] === 1) {
                    state.formData[key] = true
                }
            }
            if (dataObj.promptRecharge === undefined && dataObj.promptRecharge === null) {
                state.formData.promptRecharge = 1
            }
            state.oldData = Object.assign(state.oldData, deepClone(state.formData))
            state.initData = obj
            delete state.initData.value
            let { gg = {}, fb = {}, realName, phoneReg } = state.formData
            state.initSecret = gg.secret ? gg.secret : ''
            state.initAppid = gg.appid ? gg.appid : ''
            state.fbInit = fb.appid ? fb.appid : ''
        } else {
            state.formData = {
                phoneReg: false,
                ignoreCaptcha: true,
                bindCaptcha: false,
                regTipOpen: false,
                ignorePhoneReg: true,
                captcha: false,
                ggOpen: false,
                gg: {
                    secret: '',
                    appid: ''
                },
                fbOpen: false,
                fb: {
                    secret: '',
                    appid: ''
                },
                promptRecharge: 1
            }
        }
        state.ext = ext
        state.isDisabled = true
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}

const phoneCaptchaSwitch = (val) => {
    if (val) {
        ElMessageBox.confirm($t('关闭手机注册验证码，将不用输入短信验证，注册判断手机号为已验证！'), $t('提示'), {
            confirmButtonText: $t('确认'),
            cancelButtonText: $t('取消'),
            type: "warning",
        }).catch(() => {
            state.formData.ignoreCaptcha = 0
        })
    }
}

const switchChange = (val) => {
    if (!val) {
        nextTick(() => {
            deployRef.value.validate()
        })
    }
}

const isChange = (formData) => {
    let { gg = {}, fb = {}, ggOpen, fbOpen } = formData
    if (ggOpen !== state.oldData.ggOpen || fbOpen !== state.oldData.fbOpen || gg.secret !== state.oldData.gg.secret || gg.appid !== state.oldData.gg.appid || fb.secret !== state.oldData.fb.secret || fb.appid !== state.oldData.fb.appid) {
        return true
    }
    return false
  
}

const confirmChange = (formData) => {
    ElMessageBox.confirm($t('注意：你修改了三方登录，修改配置将会影响之前会员不可登录，是否确定？'), $t('提示'), {
        confirmButtonText: $t('确 定'),
        cancelButtonText: $t('取消'),
        showClose: true,
        type: 'warning',
    }).then(() => {
        globalVBus.$emit('globalLoading', true)
        postMetaData(state.initData).then((res) => {
            if (res.code === 0) {
                getData()
            }
            
        }).catch(() => {
            globalVBus.$emit('globalLoading', false)
        })
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
        state.formData.gg = state.oldData.gg
        state.formData.fb = state.oldData.fb
        state.formData.ggOpen = state.oldData.ggOpen
        state.formData.fbOpen = state.oldData.fbOpen

    })
}

const handleSave = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            if (!state.formData.phoneReg && !state.formData.ignorePhoneReg) return ElMessage.warning($t('手机验证注册和普通注册至少开启一个！'))
            if ((state.formData.gg.appid && !state.formData.gg.secret) || (!state.formData.gg.appid && state.formData.gg.secret)) return ElMessage.warning($t('谷歌appid和谷歌secret只能都配置或都不配置！'))
            if ((state.formData.fb.appid && !state.formData.fb.secret) || (!state.formData.fb.appid && state.formData.fb.secret)) return ElMessage.warning($t('facebook appid和facebook secret只能都配置或都不配置！'))
            let params = deepClone(state.formData)

            !params.phoneReg && delete params.ignoreCaptcha
            !params.gg.secret && delete params.gg.secret
            !params.gg.appid && delete params.gg.appid
            !params.fb.secret && delete params.fb.secret
            !params.fb.appid && delete params.fb.appid
            !Object.keys(params.gg).length && delete params.gg
            !Object.keys(params.fb).length && delete params.fb
            state.initData.config = JSON.stringify(params)
            globalVBus.$emit('globalLoading', true)
            if(isChange(state.formData)) {
                confirmChange(state.formData)

            }else{
                postMetaData(state.initData).then((res) => {
                    if (res.code === 0) {
                        getData()
                    }
                }).catch(() => {
                    globalVBus.$emit('globalLoading', false)
                })
            }
        } else {
            ElMessage.warning($t('请完善表单内容再进行提交！'))
        }
    })
}
</script>

<style lang="scss" scoped>
.register-config {
    padding-left: 100px;
    .btn {
        width: 900px;
        display: flex;
        justify-content: center;
        padding-top: 50px;
    }
    .sms-box {
        position: relative;
        .sms-btn {
            position: absolute;
            min-width: 600px;
            left: 100px;
        }
    }
    .el-form-item{
         margin-bottom: 12px !important;
    }
    .item-row {
        > .el-form-item__content {
            flex-direction: column;
            align-items: flex-start;
            .item-row-small {
                width: 100%;
                display: flex;

                .el-form-item {
                    margin-left: 10px;
                    margin-bottom: 20px;
                    .el-form-item__content {
                        height: fit-content;
                    }
                    .el-input {
                        width: 600px;
                    }
                }

                img {
                    width: 30px;
                    height: 30px;
                    transform: translateX(5px);
                }
                & + .item-row-small {
                    img {
                        padding: 5px;
                    }
                }
            }
            
        }
    }

    .label-color, .title{
        font-size: 14px;
        color: #606266;
        height: 32px;
        line-height: 32px;
        padding: 0 12px 0 0;
        box-sizing: border-box;
        font-weight: 600;
    }
    .tips{
        color: red;
        font-size: 14px;
        margin-bottom: 10px;
    }
}
</style>
