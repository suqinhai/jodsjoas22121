<template>
    <div class="login-wrap">
        <div class="language">
            <el-select v-model="locale" @change="changeLocale" placeholder="Select" size="small" style="width: 74px">
                <el-option v-for="item in LANGLIST" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
        </div>
        <div class="ms-login">
            <div class="ms-title">{{$t('商户后台管理系统')}}</div>
            <el-form :model="param" :rules="rules" @submit.native.prevent="submitForm(loginFrom)" ref="loginFrom" class="ms-content">
                <el-form-item prop="username" label-width="0">
                    <el-input :disabled="loading" v-model="param.username" placeholder="username">
                        <template #prepend>
                            <el-button v-throttle :icon="User"></el-button>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="password" label-width="0">
                    <el-input :disabled="loading" type="password" show-password placeholder="password" v-model="param.password">
                        <template #prepend>
                            <el-button v-throttle :icon="Lock"></el-button>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item>
                    <el-input :disabled="loading" v-model="param.googleAuthCode" style="width: 100%" maxlength="6" :placeholder="$t('请输入6位数字谷歌验证码，没绑定可不填')" />
                </el-form-item>
                <el-form-item v-if="mode === 'development' || mode === 'test' || mode === 'production'">
                    <el-input-number :disabled="loading" style="width: 100%" :placeholder="$t('请输入商户ID，不填默认为1')" v-model="merchantId" :controls="false" :precision="0" :min="1" />
                </el-form-item>
                <div class="login-btn">
                    <el-button v-throttle type="primary" :loading="loading" @click="submitForm(loginFrom)" native-type="submit">{{$t('登录')}}</el-button>
                </div>
            </el-form>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import useTagsStore from '@/store/tags'
import userStore from '@/store/user'
import commonStore from '@/store/common'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Lock, User, MoreFilled } from '@element-plus/icons-vue'
import { token } from '@/common/util'
import i18n from '@/i18n'
import { LANGLIST } from '@/common/util/appConfig.js'

const router = useRouter()
const param = reactive({
    username: '',
    password: ''
})
const loading = ref(false)
const merchantId = ref(undefined)
const rules = {
    username: [{ required: true, message: $t('请输入用户名'), trigger: 'change' }],
    password: [{ required: true, message: $t('请输入密码'), trigger: 'change' }],
}
const userData = userStore()
const commonData = commonStore()
const loginFrom = ref()
const locale = ref(i18n.global.locale)
const mode = window.merchant_mode

const submitForm = (el) => {
    if (token()) {
        ElMessageBox.confirm($t('当前浏览器已存在登录账号，前往网站继续操作？'), $t('提示'), {
            confirmButtonText: $t('确认'),
            cancelButtonText: $t('取消'),
            type: "warning",
        }).then(() => {
            location.reload()
        }).catch(() => { })
        return
    }
    if (merchantId.value) localStorage.setItem('mid', merchantId.value)
    el.validate((valid) => {
        if (valid) {
            loading.value = true
            userData.login(param).then(() => {
                loading.value = false
                commonData.currentMerchantSite = { id: userData.userInfo.siteMid || userData.userInfo.merchantId }
                localStorage.setItem(
                    'current_merchant_site',
                    JSON.stringify(commonData.currentMerchantSite),
                )
                if (localStorage.getItem('defaultPath') && localStorage.getItem('defaultPath') !== 'undefined') {
                    router.push(localStorage.getItem('defaultPath'))
                } else {
                    router.push('/')
                }
            }).catch(() => {
                loading.value = false
            })
        } else {
            ElMessage.error($t('请输入账号和密码再进行操作！'))
        }
    })
}

const changeLocale = (() => {
    localStorage.setItem('locale', locale.value)
    location.reload()
})

useTagsStore().clearTags()
</script>

<style scoped>
.login-wrap {
    position: relative;
    width: 100%;
    height: 100%;
    background-image: url(@/assets/img/login-bg.jpg);
    background-size: 100%;
}

.ms-title {
    width: 100%;
    line-height: 50px;
    text-align: center;
    font-size: 20px;
    color: #fff;
    border-bottom: 1px solid #ddd;
}

.ms-login {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 380px;
    margin: -190px 0 0 -175px;
    border-radius: 5px;
    background: rgba(255, 255, 255, 0.3);
    overflow: hidden;
}

.ms-content {
    padding: 30px 30px;
}

.login-btn {
    text-align: center;
}

.login-btn button {
    width: 100%;
    height: 36px;
    margin-bottom: 10px;
}

.login-tips {
    font-size: 12px;
    line-height: 30px;
    color: red;
}
.language {
    float: right;
    margin: 20px;
}
</style>
