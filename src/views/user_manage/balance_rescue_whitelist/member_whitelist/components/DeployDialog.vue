<template>
    <!-- 余额救援金白名单-会员白名单-添加/导入 -->
    <Dialog ref="dialog" width="520" :title="!operateType ? $t('导入会员') : $t('添加会员')" top="10vh" buttonCenter @confirm="handleSubmit(deployFormRef)" @cancel="cancel">
        <el-form class="member-control-deploy" ref="deployFormRef" :model="state.formData" :rules="state.rules" :label-width="$locale == 'zh' ? '75px' : 'auto'">
            <el-form-item :label="$t('文件:')" v-if="!operateType">
                <el-button v-throttle type="primary" @click="hanleUpload">{{$t('上传excel')}}</el-button>
                <el-button style="margin-left: 40px" v-throttle type="success" @click="handleDownload">{{$t('下载excel模板')}}</el-button>
            </el-form-item>
            <template v-else>
                <el-form-item :label="$t('会员ID:')" prop="userId">
                    <el-input :disabled="state.isSearch" @input="(val) => state.formData.userId = val.replace(/\D/g,'')" v-model="state.formData.userId" style="width: 210px;margin-right: 20px"
                        :placeholder="$t('请输入会员ID')" />
                    <el-button v-throttle type="primary" @click="handleSearch">{{state.isSearch ?$t('重 置'): $t('搜 索')}}</el-button>
                </el-form-item>
                <el-row>
                    <el-col :span="11">
                        <el-form-item :label="$t('会员ID:')">
                            <span>{{state.memberInfo.id}}</span>
                        </el-form-item>
                    </el-col>
                    <el-col :span="13">
                        <el-form-item :label="$t('会员账号:')">
                            <span>{{state.memberInfo.name}}</span>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item :label="$t('备注:')">
                    <el-input style="width: 100%" type="textarea" :rows="4" :placeholder="$t('请输入备注')" v-model="state.formData.remark" show-word-limit maxlength="500" />
                </el-form-item>
            </template>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { postMemberWhitelistData, batchImportMemberWhitelist } from '@/api/member'
import { getUserBaseDetail } from '@/api/common'
import { ElMessage } from 'element-plus'
import * as XLSX from 'xlsx'

const emits = defineEmits(['close', 'fetchData'])
const props = defineProps({
    operateType: {
        default: ''
    },
})
const state = reactive({
    params: [],
    formData: {},
    rules: {
        userId: { required: true, message: $t('请输入会员ID！'), trigger: 'blur' }
    },
    isSearch: false,
    memberInfo: {},
})
const deployFormRef = ref(null)
const dialog = ref(null)

const handleSearch = () => {
    if (state.isSearch) {
        delete state.formData.userId
        state.memberInfo = {}
        state.isSearch = false
    } else {
        if (!state.formData.userId) {
            return ElMessage.warning($t('请输入会员ID再进行搜索！'))
        }
        dialog.value.showLoading()
        getUserBaseDetail({ id: state.formData.userId }).then((res) => {
            if (res.data) {
                state.memberInfo = res.data
                state.isSearch = true
            } else {
                ElMessage.warning($t('未查询到此会员ID信息！'))
            }
            dialog.value.closeLoading()
        }).catch((data) => {
            dialog.value.closeLoading()
        })
    }
}

const hanleUpload = () => {
    let input = document.createElement('input')
    input.type = 'file'
    input.style.display = "none"
    document.body.appendChild(input)
    input.onchange = (event) => {
        const file = event.target.files[0]
        const reader = new FileReader()
        reader.onload = async (e) => {
            const data = new Uint8Array(e.target.result)
            const workbook = XLSX.read(data, { type: 'array' })
            const firstSheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[firstSheetName]
            let list = XLSX.utils.sheet_to_json(worksheet)
            if (list && list.length) {
                state.params = []
                list.forEach(item => {
                    if (item[$t('会员ID')]) {
                        let str = typeof item[$t('会员ID')] !== 'number' ? item[$t('会员ID')].replace(/\s+/g, '') : item[$t('会员ID')]
                        if (typeof +str === 'number') state.params.push({
                            userId: +str,
                            remark: item[$t('备注')] || '',
                        })
                    }
                })
                ElMessage.success($t('文件上传成功，请点击提交按钮进行提交！'))
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
    a.download = $t('余额救援金会员白名单模版.xlsx')
    if($locale == 'en'){
        a.href = `/file/balance_rescue_whitelist_en.xlsx`
    }else if($locale == 'vi'){
        a.href = `/file/balance_rescue_whitelist_vi.xlsx`
    }else{
        a.href = `/file/balance_rescue_whitelist.xlsx`
    }
    a.style.display = "none"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
}

const handleSubmit = (el) => {
    if (!props.operateType && !state.params.length) return ElMessage.warning($t('请上传excel文件后再进行提交！'))
    if (!!props.operateType && !state.memberInfo.id) return ElMessage.warning($t('请输入正确的会员ID再进行提交！'))
    el.validate((valid, fields) => {
        if (valid) {
            let obj = { ...state.formData }
            let api = postMemberWhitelistData
            if (!props.operateType) {
                api = batchImportMemberWhitelist
                obj.params = JSON.stringify(state.params)
            }
            dialog.value.showLoading()
            api(obj).then(() => {
                cancel()
                emits('fetchData')
            }).catch(() => {
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
</script>

<style lang="scss" >
.member-control-deploy {
}
</style>
