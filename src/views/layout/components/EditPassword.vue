<template>
    <!-- 顶部-修改密码 -->
    <Dialog ref="dialog" width="600" :title="$t('修改密码')" top="15vh" @confirm="handleSubmit(deployForm)" @cancel="cancel">
        <el-form ref="deployForm" class="edit-password" :rules="state.rules" :model="state.formData" :label-width="$locale == 'zh' ? '140px' : 'auto'">
            <el-form-item :label="$t('旧密码:')" prop="oldPwd">
                <el-input v-model="state.formData.oldPwd" :placeholder="$t('请输入旧密码')" show-password />
            </el-form-item>
            <el-form-item :label="$t('新密码:')" prop="newPwd">
                <el-input v-model="state.formData.newPwd" :placeholder="$t('请输入新密码')" show-password />
            </el-form-item>
            <el-form-item :label="$t('确认新密码:')" prop="verifyPassword">
                <el-input v-model="state.formData.verifyPassword" :placeholder="$t('再次输入新密码')" show-password />
            </el-form-item>
            <!-- <el-form-item :label="$t('验证码')" prop="captcha">
                <el-input style="width: 200px;margin-right: 15px" v-model="state.formData.captcha" :placeholder="$t('请输入验证码')" />
                <el-button v-throttle :disabled="!!state.countDown" type="primary" @click="getCode">{{showTitle}}
                </el-button>
            </el-form-item> -->
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted, computed, defineEmits } from 'vue'
import { ElMessage } from 'element-plus'
import { postchangePassword, getVerificationCode, postVerificationCode } from '@/api/user'
import { useRouter } from 'vue-router'
import userStore from '@/store/user'
import { PASSWORD_REG } from '@/common/util/appConfig'

const emits = defineEmits(['close', 'handleLogout'])
const router = useRouter();
let { userInfo } = userStore()
const dialog = ref(null)
const deployForm = ref(null)
const state = reactive({
    formData: {},
    countDown: 0,
    timer: null,
    rules: {
        oldPwd: [
            { required: true, message: $t('请输入旧密码！'), trigger: 'blur' }
        ],
        newPwd: [
            { required: true, message: $t('请输入新密码！'), trigger: 'blur' },
            {
                pattern:
                    PASSWORD_REG,
                message: $t('请输入6到16个字符，支持字母、数字、符号！'),
                trigger: 'change',
            },
            {
                validator: (rule, value, callback) => {
                    const { oldPwd } = state.formData
                    if (oldPwd && oldPwd === value) {
                        return callback(new Error($t('新密码和旧密码不能相同！')))
                    }
                    return callback()
                }, trigger: 'change'
            }
        ],
        verifyPassword: [
            { required: true, message: $t('再次输入新密码！'), trigger: 'blur' },
            {
                pattern:
                    PASSWORD_REG,
                message: $t('请输入6到16个字符，支持字母、数字、符号！'),
                trigger: 'change',
            },
            {
                validator: (rule, value, callback) => {
                    const { newPwd } = state.formData
                    if (newPwd && newPwd !== value) {
                        return callback(new Error($t('两次输入的密码不一致！')))
                    }
                    return callback()
                }, trigger: 'change'
            }
        ],
        captcha: [{ required: true, message: $t('请输入验证码！'), trigger: 'blur' }],
    }
})

const showTitle = computed(() => {
    if (state.countDown) {
        return state.countDown + $t('s后再获取')
    } else {
        return $t('获取验证码')
    }
})

onMounted(() => {
    state.timer && clearInterval(state.timer)
})

// 获取验证码
const getCode = () => {
    dialog.value.showLoading()
    let params = {
        bizType: 'auth',
        phone: userInfo.phone,
    }
    getVerificationCode(params).then(() => {
        dialog.value.closeLoading()
        state.countDown = 30
        state.timer = setInterval(() => {
            if (state.countDown) {
                state.countDown--
            } else {
                clearInterval(state.timer)
            }
        }, 1000)
    }).catch(() => {
        dialog.value.closeLoading()
    })
}

const handleSubmit = (el) => {
    el.validate(async (valid, fields) => {
        if (valid) {
            try {
                dialog.value.showLoading()
                // 校验验证码
                // await postVerificationCode({
                //     credential: userInfo.phone,
                //     captcha: state.formData.captcha,
                //     bizType: 'auth',
                // })
                await postchangePassword({ ...state.formData, merchantId: userInfo.merchantId })
                // ElMessage.success($t('提交成功！'))
                cancel()
                emits('handleLogout')
            } catch (err) {
                dialog.value.closeLoading()
            }
        } else {
            ElMessage.warning($t('请完善表单内容再进行提交！'))
        }
    })
}

const cancel = () => {
    emits('close')
}

</script>

<style  lang="scss">
.edit-password {
}
</style>
