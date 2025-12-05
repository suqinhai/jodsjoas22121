<template>
    <!-- 站点配置-注册登录配置 -->
    <div class="container register-config">
        <el-form ref="deployRef" :model="state.formData" :label-width="$locale == 'zh' ? '200px' : 'auto'" :disabled="state.isDisabled">
            <el-form-item :label="$t('真实姓名:')">
                <el-checkbox v-model="state.formData.realName" :true-label="1" :false-label="0">
                    {{$t('前端开启')}}
                </el-checkbox>
                <el-checkbox v-if="state.formData.realName" v-model="state.formData.realNameNotRequired">
                    {{$t('非必填')}}
                </el-checkbox>
            </el-form-item>
            <el-form-item :label="$t('手机验证注册:')" v-if="state.ext.loginWays?.includes(0)">
                <el-checkbox v-model="state.formData.phoneReg" :true-label="1" :false-label="0">
                    {{$t('前端开启')}}
                </el-checkbox>
                <template v-if="state.formData.phoneReg">
                    <el-checkbox v-model="state.formData.phoneNotRequired">
                        {{$t('非必填')}}
                    </el-checkbox>
                    <el-checkbox disabled v-model="state.formData.ignoreCaptcha" :true-label="1" :false-label="0">
                        {{$t('关闭手机注册验证码')}}
                    </el-checkbox>
                </template>
            </el-form-item>
            <el-form-item :label="$t('邀请码:')">
                <el-switch v-model="state.formData.agentCode" :active-value="1" :inactive-value="0" />
            </el-form-item>
            <el-form-item :label="$t('验证码开关:')">
                <el-radio-group v-model="state.formData.captcha">
                    <el-radio :label="0" :value="0">{{$t('无')}}</el-radio>
                    <el-radio :label="1" :value="1">{{$t('图形验证码')}}</el-radio>
                    <el-radio :label="2" :value="2">{{$t('数字验证码')}}</el-radio>
                </el-radio-group>
            </el-form-item>
            <template v-if="state.ext.loginWays?.includes(2)">
                <el-form-item :label="$t('谷歌授权开关:')">
                    <el-switch v-model="state.formData.ggOpen" :active-value="1" :inactive-value="0" @change="switchChange" />
                </el-form-item>
                <el-form-item :label="$t('谷歌appid:')" prop="gg.appid"
                    :rules="[{ required: !!state.formData.ggOpen, message: $t('请输入appid！'), trigger: 'blur'}]">
                    <el-input @input="(val) => state.formData.gg.appid = val.replace(/[\u4e00-\u9fa5]/g, '')" style="width: 650px"
                        :disabled="!!state.initAppid" v-model.trim="state.formData.gg.appid" :placeholder="$t('请输入appid')" />
                </el-form-item>
                <el-form-item :label="$t('谷歌secret:')" prop="gg.secret"
                    :rules="[{ required: !!state.formData.ggOpen, message: $t('请输入secret！'), trigger: 'blur'}]">
                    <el-input style="width: 650px" :disabled="!!state.initSecret" type="textarea" :rows="4" :placeholder="$t('请输入secret')"
                        v-model.trim="state.formData.gg.secret" />
                </el-form-item>
            </template>
            <template v-if="state.ext.loginWays?.includes(3)">
                <el-form-item :label="$t('facebook授权开关:')">
                    <el-switch v-model="state.formData.fbOpen" :active-value="1" :inactive-value="0" @change="switchChange" />
                </el-form-item>
                <el-form-item :label="$t('facebook appid:')" prop="fb.appid"
                    :rules="[{ required: !!state.formData.fbOpen, message: $t('请输入appid！'), trigger: 'blur'}]">
                    <el-input @input="(val) => state.formData.fb.appid = val.replace(/[\u4e00-\u9fa5]/g, '')" style="width: 650px"
                        :disabled="!!state.fbInit" v-model.trim="state.formData.fb.appid" :placeholder="$t('请输入appid')" />
                </el-form-item>
                <el-form-item :label="$t('facebook secret:')" prop="fb.secret"
                    :rules="[{ required: !!state.formData.fbOpen, message: $t('请输入secret！'), trigger: 'blur'}]">
                    <el-input style="width: 650px" :disabled="!!state.fbInit" type="textarea" :rows="4" :placeholder="$t('请输入secret')"
                        v-model.trim="state.formData.fb.secret" />
                </el-form-item>
            </template>
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
import { ref, reactive, onMounted, nextTick, onActivated, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import userStore from '@/store/user'
import commonStore from '@/store/common'
import { getMetaData, postMetaData } from '@/api/common'
import { deepClone } from '@/common/util'
import { useRouter } from 'vue-router'

const router = useRouter()
const state = reactive({
    formData: {
        phoneReg: 0,
        ignoreCaptcha: 1,
        bindCaptcha: 0,
        regTipOpen: 0,
        ignorePhoneReg: 1,
        captcha: 0,
        ggOpen: 0,
        gg: {
            secret: '',
            appid: ''
        },
        fbOpen: 0,
        fb: {
            secret: '',
            appid: ''
        },
        realName: 0,
        realNameNotRequired: true,
        phoneNotRequired: true
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
})
const deployRef = ref(null)
const route = useRoute()
const userData = userStore()
const commonData = commonStore()

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
    getMetaData({ type: 30 }).then(({ data, status, ext }) => {
        if (status === 'OK' && data && Object.values(data)[0]) {
            let obj = Object.values(data)[0]
            state.formData = Object.assign(state.formData, JSON.parse(obj.value))
            state.initData = obj
            delete state.initData.value
            let { gg = {}, fb = {}, realName, phoneReg } = state.formData
            state.initSecret = gg.secret ? gg.secret : ''
            state.initAppid = gg.appid ? gg.appid : ''
            state.fbInit = fb.appid ? fb.appid : ''
            state.formData.realName = 0
            state.formData.phoneReg = 0
            state.formData.realNameNotRequired = true
            state.formData.phoneNotRequired = true
            state.formData.ignoreCaptcha = 1
            if (realName) {
                state.formData.realName = 1
                if (realName === 1) state.formData.realNameNotRequired = false
            }
            if (phoneReg) {
                state.formData.phoneReg = 1
                if (phoneReg === 1) state.formData.phoneNotRequired = false
            }
        } else {
            state.formData = {
                phoneReg: 0,
                ignoreCaptcha: 1,
                bindCaptcha: 0,
                regTipOpen: 0,
                ignorePhoneReg: 1,
                captcha: 0,
                ggOpen: 0,
                gg: {
                    secret: '',
                    appid: ''
                },
                fbOpen: 0,
                fb: {
                    secret: '',
                    appid: ''
                },
                realName: 0,
                realNameNotRequired: true,
                phoneNotRequired: true
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

const handleSave = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            if (userData.getTemplateType() === 4) state.formData.ignorePhoneReg = 1
            if (!state.formData.phoneReg && !state.formData.ignorePhoneReg) return ElMessage.warning($t('手机验证注册和普通注册至少开启一个！'))
            if ((state.formData.gg.appid && !state.formData.gg.secret) || (!state.formData.gg.appid && state.formData.gg.secret)) return ElMessage.warning($t('谷歌appid和谷歌secret只能都配置或都不配置！'))
            if ((state.formData.fb.appid && !state.formData.fb.secret) || (!state.formData.fb.appid && state.formData.fb.secret)) return ElMessage.warning($t('facebook appid和facebook secret只能都配置或都不配置！'))
            let params = deepClone(state.formData)
            params.bindCaptcha = params.bindCaptcha ? 1 : 0
            !params.phoneReg && delete params.ignoreCaptcha
            !params.gg.secret && delete params.gg.secret
            !params.gg.appid && delete params.gg.appid
            !params.fb.secret && delete params.fb.secret
            !params.fb.appid && delete params.fb.appid
            !Object.keys(params.gg).length && delete params.gg
            !Object.keys(params.fb).length && delete params.fb
            params.ignoreCaptcha = 1
            if (params.realName && params.realNameNotRequired) {
                params.realName = 2
            }
            if (params.phoneReg && params.phoneNotRequired) {
                params.phoneReg = 2
            }
            delete params.realNameNotRequired
            delete params.phoneNotRequired
            state.initData.config = JSON.stringify(params)
            globalVBus.$emit('globalLoading', true)
            postMetaData(state.initData).then(() => {
                getData()
            }).catch(() => {
                globalVBus.$emit('globalLoading', false)
            })
        } else {
            ElMessage.warning($t('请完善表单内容再进行提交！'))
        }
    })
}
</script>

<style lang="scss" scoped>
.register-config {
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
}
</style>
