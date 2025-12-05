<template>
    <!-- 所有会员-新增 -->
    <Dialog ref="dialog" :width="$locale == 'zh' ? 510 : 800" :title="$t('新增会员')" :isShowBottomButton="state.formData.type === 1" top="15vh"
        @confirm="handleSubmit(addForm)" @cancel="cancel">

        <el-form ref="addForm" class="add-member" :rules="state.rules" :model="state.formData" :label-width="$locale == 'zh' ? '85px' : 'auto'">
            <el-form-item :label="$t('选择站点:')" prop="merchantId">
                <MerchantSiteSelect style="width: 100%" v-model="state.formData.merchantId" isShowId />
            </el-form-item>
            <el-form-item>
                <el-radio-group v-model="state.formData.type">
                    <el-radio :label="1">{{$t('添加单个会员')}}</el-radio>
                    <el-radio :label="2">{{$t('批量添加会员')}}</el-radio>
                </el-radio-group>
            </el-form-item>
            <template v-if="state.formData.type === 1">
                <el-form-item :label="$t('会员账号:')" prop="username">
                    <el-input v-model="state.formData.username" :placeholder="$t('请输入4-16个字符，支持英文、数字，首位必须字母')" />
                </el-form-item>
                <el-form-item :label="$t('登录密码:')" prop="password">
                    <el-input v-model="state.formData.password" :placeholder="$t('请输入6-16个字符，支持字母、数字、符号')" />
                </el-form-item>
                <!--                <el-form-item :label="$t('手机号码:')" prop="phone">
                    <div class="phone">
                        <span class="area-code">+{{areaCode}}</span>
                        <el-input v-model="state.formData.phone" style="width: 100%" :placeholder="$t('请输入手机号')" />
                    </div>
                </el-form-item> -->
                <!-- <el-form-item :label="$t('提现密码:')" prop="exchangePassword">
                    <el-input v-model="state.formData.exchangePassword" :placeholder="$t('请输入6位提现密码')" />
                </el-form-item> -->
            </template>
            <template v-else>

                <div class="batch-amend">
                    <el-button v-throttle type="success" @click="handleDownload">{{$t('模板下载')}}</el-button>
                    <el-button v-throttle type="primary" @click="handleBatchAmend">{{$t('文件上传')}}</el-button>
                </div>

                <div class="tips">
                    <span v-html="$t('注：每次最大可添加1000个账号')"></span>
                </div>
            </template>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import userStore from '@/store/user'
import { postMemberConfig, postBatchAddMember, getAddMemberDownErr } from '@/api/member'
import { USER_REG, PASSWORD_REG } from '@/common/util/appConfig'
import commonStore from '@/store/common'
import * as XLSX from 'xlsx'

let keyData = {
    username: $t('会员账号'),
    password: $t('登录密码')
}
const emits = defineEmits(['close', 'fetchData'])
const state = reactive({
    formData: {
        type: 1
    },
    rules: {
        merchantId: [{ required: true, message: $t('请选择站点'), trigger: 'blur' },],
        username: [
            { required: true, message: $t('请输入会员账号！'), trigger: 'blur' },
            {
                pattern: USER_REG,
                message: $t('输入4-16个字符，支持英文、数字，首位必须字母！'),
                trigger: 'change',
            },
        ],
        password: [
            { required: true, message: $t('请输入登录密码！'), trigger: 'blur' },
            {
                pattern:
                    PASSWORD_REG,
                message: $t('请输入6到16个字符，支持字母、数字、符号！'),
                trigger: 'change',
            },
        ],
        phone: [
            { required: false, message: $t('请输入手机号码！'), trigger: 'blur' },
            {
                pattern:
                    /^[0-9]{9,11}$/,
                message: $t('请输入9-11位数的手机号码！'),
                trigger: 'change',
            },
        ],
        withdrawalPassword: [
            { required: false, message: $t('请输入提现密码！'), trigger: 'blur' },
            {
                pattern: /^[0-9]{6}$/,
                message: $t('请输入6位数字提现密码！'),
                trigger: 'change',
            },
        ],
        memberTier: [
            { required: true, message: $t('请选择会员层级！'), trigger: 'change' },
        ],
        memberTag: [
            { required: true, message: $t('请选择会员标签！'), trigger: 'change' },
        ]
    },
    batchData: []
})
const userData = userStore()
const commonData = commonStore()
const dialog = ref(null)
const addForm = ref(null)

const areaCode = computed(() => {
    return userData.merchantInfo.phoneCode || ''
})

onMounted(() => {
    state.formData.merchantId = commonData.currentMerchantSite.id
})

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            dialog.value.showLoading()
            let params = { ...state.formData }
            // params.phone = params.phone ? areaCode + "-" + params.phone : ''
            postMemberConfig(params).then(() => {
                emits('fetchData')
                cancel()
            }).catch(err => {
                dialog.value.closeLoading()
            })
        } else {
            ElMessage.warning($t('请完善表单内容再进行提交！'))
        }
    })
}

const cancel = () => {
    emits('close')
}

const handleBatchAmend = () => {
    let input = document.createElement('input')
    input.type = 'file'
    input.style.display = "none"
    document.body.appendChild(input)
    input.onchange = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = async (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            let list = XLSX.utils.sheet_to_json(worksheet);
            list = list.filter(item => item[$t('会员账号')] && item[$t('登录密码')])
            if (list && list.length) {
                let params = []
                list.forEach(item => {
                    let obj = {}
                    for (let key in keyData) {
                        if (item[keyData[key]]) {
                            obj[key] = item[keyData[key]]
                            obj.merchantId = state.formData.merchantId
                        }
                    }
                    params.push(obj)
                })
                let isError = false
                params.forEach(item => {
                    if (isError) return
                    if (!USER_REG.test(item.username)) isError = true
                    if (!PASSWORD_REG.test(item.password)) isError = true
                })
                if (isError) return ElMessage.warning($t('数据格式不准确，请检查格式'))
                try {
                    dialog.value.showLoading()
                    const res = await postBatchAddMember({ values: JSON.stringify(params), merchantId: state.formData.merchantId })
                    dialog.value.closeLoading()
                    cancel()
                    if (res.data && res.data.length) {
                        ElMessageBox.confirm($t('导出失败，请下载导出结果修改，重新导入。'), $t('导入失败')).then(async () => {
                            await getAddMemberDownErr({ isExport: true, merchantId: state.formData.merchantId })
                        })
                    } else {
                        ElMessageBox.alert($t('本次批量导入账号已完成'), $t('导入成功'))
                    }

                } catch (error) {
                    dialog.value.closeLoading()
                }
            } else {
                ElMessage.warning($t('此文件未获取到有效内容，请检查后重新操作！'))
            }
        };
        reader.onerror = (e) => {
            ElMessage.warning($t('文件内容获取失败，请重新操作！'))
        };
        reader.readAsArrayBuffer(file);
    }
    input.click()
    document.body.removeChild(input)
}

const handleDownload = () => {
    let a = document.createElement('a')
    a.download = $t('批量添加会员.xlsx')
    if ($locale == 'en') {
        a.href = `/file/add_members2_en.xlsx`
    } else if ($locale == 'vi') {
        a.href = `/file/add_members2_vi.xlsx`
    } else {
        a.href = `/file/add_members2.xlsx`
    }
    a.style.display = "none"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
}
</script>

<style lang="scss">
.add-member {
    .phone {
        display: flex;
        .area-code {
            display: inline-block;
            box-sizing: border-box;
            width: 50px;
            background-color: #eee;
            padding: 0 9px;
        }
    }
}
.batch-amend {
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 0 20px;
    margin-bottom: 20px;
    .el-button {
        &:last-of-type {
            margin-left: 40px;
        }
    }
    &-tips {
        padding-left: 20px;
        margin-top: 10px;
        color: red;
    }
}
</style>
