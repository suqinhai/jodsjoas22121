<template>
    <!-- 谷歌验证器绑定 -->
    <Dialog ref="dialog" width="500" :isShowBottomButton="false" :isShowClose="['development','test'].includes(environment)" :submitButtonTitle="$t('本次跳过')"
        :title="$t('谷歌验证器绑定')" top="10vh" @cancel="cancel">
        <div class="binding-google-captcha">
            <div ref="codeBox" class="code-box"></div>
            <div class="tips">{{$t('注：请使用“谷歌验证器”识别上方二维码，获取验证码后进行绑定。')}}</div>
            <span class="special pointer tips" @click="handleOpen">{{$t('下载谷歌验证器应用')}}</span>
            <div class="binding-box">
                <span>{{$t('谷歌验证码：')}}</span>
                <el-input @input="(val) => code = val.replace(/\D/g,'')" v-model="code" style="width: 170px" :placeholder="$t('请输入6位数字验证码')" maxlength="6" />
                <el-button v-throttle type="primary" @click="handleBinding">{{$t('绑 定')}}</el-button>
            </div>
        </div>
    </Dialog>
</template>

<script setup>
import { ref, onMounted, computed, getCurrentInstance } from 'vue'
import userStore from '@/store/user'
import { useRouter } from 'vue-router'
import QRCode from 'qrcodejs2-fix'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getGoogleAuthQr, postBindGoogleAuth } from '@/api/user'

// const { proxy: { $forceUpdate } } = getCurrentInstance()
const dialog = ref(null)
const codeBox = ref(null)
const code = ref('')
const userData = userStore()
const router = useRouter()

const environment = computed(() => {
    return process.env.VITE_MODE
})

onMounted(() => {
    dialog.value.showLoading()
    getGoogleAuthQr().then(res => {
        if (res.data) {
            new QRCode(codeBox.value, {
                text: res.data,
                width: 200,
                height: 200
            })
        }
        dialog.value.closeLoading()
    }).catch(() => {
        dialog.value.closeLoading()
    })
})

const handleBinding = () => {
    if (!code.value || code.value.length !== 6) return ElMessage.warning($t('请输入6位数字验证码后再进行提交！'))
    dialog.value.showLoading()
    postBindGoogleAuth({ code: code.value }).then(() => {
        dialog.value.closeLoading()
        ElMessageBox.confirm($t('您已成功绑定谷歌验证器，如需更改谷歌验证器，请联系管理员或客服，进行更改或解绑谷歌验证器操作。'), $t('提示'), {
            confirmButtonText: $t('知道了'),
            showClose: false,
            showCancelButton: false,
            type: 'success',
        }).then(() => {
            cancel()
        }).catch(() => { })
    }).catch(() => {
        dialog.value.closeLoading()
    })
}

const cancel = () => {
    userData.userInfo.enableGoogleAuth = true
    localStorage.setItem('user_info', JSON.stringify(userData.userInfo))
}

const handleOpen = () => {
    window.open('https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=zh_CN')
}
</script>

<style lang="scss">
.binding-google-captcha {
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;

    .code-box {
        width: 240px;
        height: 240px;
        align-self: center;
        padding: 20px;
        margin-bottom: 15px;
        border: 2px solid #999;
        border-radius: 2px;
    }
    .tips {
        width: fit-content;
        line-height: 20px;
        margin-bottom: 10px;
    }
    .binding-box {
        display: flex;
        align-items: center;

        span {
            font-weight: 600;
        }

        .el-input {
            margin-right: 15px;
        }
    }
}
</style>

