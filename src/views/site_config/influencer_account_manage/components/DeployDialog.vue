<template>
    <!-- 站点配置-网红博主配置-账号操作 -->
    <Dialog ref="dialog" :width="[0,4].includes(operateType) ? '800' : '600'" :title="dialogTitle" top="15vh" buttonCenter
        @confirm="handleSubmit(deployFormRef)" @cancel="cancel">
        <el-form class="influencer-account-deploy" ref="deployFormRef" :model="state.formData" :rules="state.rules" label-width="auto">
            <el-form-item v-if="!operateType" :label="$t('会员ID:')" prop="userIds">
                <el-input @input="(val) => state.formData.userIds = val.replace('，','')" v-model="state.formData.userIds" style="width: 100%"
                    type="textarea" :rows="4" :placeholder="$t('请输入会员ID，多个需要用英文逗号隔开')" />
            </el-form-item>
            <template v-if="[1,2].includes(operateType)">
                <el-form-item :label="$t('适用站点:')" v-if="commonData.merchantSiteList.length > 1" prop="merchantId">
                    <MerchantSiteSelect :multiple="operateType === 2" v-model="state.formData.merchantId">
                    </MerchantSiteSelect>
                </el-form-item>
                <template v-if="operateType === 1">
                    <el-form-item :label="$t('文件:')">
                        <el-button v-throttle type="success" @click="handleDownload">{{$t('下载模板')}}</el-button>
                        <el-button style="margin-left: 40px" v-throttle type="primary" @click="hanleUpload">{{$t('上传文件')}}</el-button>
                    </el-form-item>
                    <el-form-item :label-width="$locale == 'zh' ? 'auto' : '216px'" :label="$t('已导入账号数量:')">{{state.params.length}}</el-form-item>
                </template>
                <el-form-item v-if="operateType === 2" :label="$t('账号数量:')" prop="num">
                    <el-input-number v-model="state.formData.num" :controls="false" :precision="0" :min="1" :max="100"
                        :placeholder="$t('请输入整数1-100')" />
                </el-form-item>
            </template>
            <el-form-item v-if="operateType === 3" :label="$t('已选择网红ID:')">{{itemData.userIds}}</el-form-item>
            <template v-if="operateType === 4">
                <el-row>
                    <el-col :span="12">
                        <el-form-item :label="$t('网红ID:')">{{itemData.userId}}</el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item :label="$t('网红账号:')">{{itemData.username}}</el-form-item>
                    </el-col>
                </el-row>
            </template>
            <el-form-item v-if="operateType !== 1" :label="$t('网红佣金:')">
                <el-input-number v-model="state.formData.commission" :controls="false" :precision="2" :min="inputMin" :max="inputMax"
                    :placeholder="$t('请输入网红佣金')" />
            </el-form-item>
            <div v-if="!operateType">
                <div>{{$t('1.可以添加会员账号为网红账号；')}}</div>
                <div>{{$t('2.设置每拉一个直属付费用户  给多少佣金（可两位小数）；')}}</div>
                <div>{{$t('3.修改佣金后，只对之后邀请的直属付费用户生效。')}}</div>
            </div>
            <div v-if="operateType === 1">
                <div>{{$t('每次最大可导入500人')}}</div>
                <div>{{$t('导入会员账号需为同一个站点，且存在的账号')}}</div>
                <div>{{$t('若导入已存在账号，则修改为最新导入佣金')}}</div>
            </div>
            <div v-if="operateType === 2" style="color: red">{{$t('注：生成的密码固定为当前ID+789，如3144789')}}</div>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import userStore from '@/store/user'
import commonStore from '@/store/common'
import { ElMessage } from 'element-plus'
import { addInfluencerAccountData, editInfluencerAccountData, postInfluencerAccountData, getAddInfAccountDownErr } from '@/api/website'
import { deepClone } from '@/common/util'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'

const emits = defineEmits(['close', 'fetchData'])
const props = defineProps({
    itemData: {
        default: Object,
        default: () => {
            return {}
        }
    },
    operateType: {
        type: Number,
        default: 0
    }
})
const state = reactive({
    params: [],
    formData: {},
    rules: {
        userIds: [
            { required: true, message: $t('必填项不能为空！'), trigger: "blur" },
            {
                pattern: /^\d+(?:,\d+)*$/,
                message: $t('请输入正确的会员ID，多个需要用英文逗号隔开！'),
                trigger: 'change',
            }
        ],
        merchantId: { required: true, message: $t('必选项不能为空！'), trigger: "change" },
        num: { required: true, message: $t('必填项不能为空！'), trigger: "blur" },
    },
})
const deployFormRef = ref(null)
const dialog = ref(null)
const userData = userStore()
const commonData = commonStore()

const dialogTitle = computed(() => {
    if (props.operateType === 0) return $t('会员设置')
    if (props.operateType === 1) return $t('会员批量导入')
    if (props.operateType === 2) return $t('生成账号')
    if (props.operateType === 3) return $t('批量佣金设置')
    if (props.operateType === 4) return $t('修改佣金')
})
const isLargeCountry = computed(() => {
    return ['ID'].includes(userData.merchantInfo.country)
})
const inputMax = computed(() => {
    return isLargeCountry.value ? 10000000 : 100
})
const inputMin = computed(() => {
    return isLargeCountry.value ? 100 : 0.01
})

onMounted(() => {
    if (props.operateType === 4) {
        state.formData.userIds = props.itemData.userId
        state.formData.commission = props.itemData.commission || 0
    } else if (props.operateType === 3) {
        state.formData.userIds = props.itemData.userIds
    }
})

const hanleUpload = () => {
    let input = document.createElement('input')
    input.type = 'file'
    input.style.display = "none"
    document.body.appendChild(input)
    input.onchange = (event) => {
        const file = event.target.files[0]
        if (file.type === 'text/csv') {
            Papa.parse(file, {
                encoding: "GBK",
                complete: function (results) {
                    results.data.shift()
                    fileHandling(results.data)
                },
                error: function (error) {
                    ElMessage.warning($t('文件内容获取失败，请重新操作！'))
                }
            })
            return
        }
        const reader = new FileReader()
        reader.onload = async (e) => {
            const data = new Uint8Array(e.target.result)
            const workbook = XLSX.read(data, { type: 'array' })
            const firstSheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[firstSheetName]
            let list = XLSX.utils.sheet_to_json(worksheet)
            list = list.filter(item => item[$t('会员ID')] && +item[$t('网红佣金')])
            fileHandling(list, 1)
        }
        reader.onerror = (e) => {
            ElMessage.warning($t('文件内容获取失败，请重新操作！'))
        }
        reader.readAsArrayBuffer(file);
    }
    input.click()
    document.body.removeChild(input)
}

const fileHandling = (list, type) => {
    if (list && list.length) {
        state.params = []
        if (type === 1) {
            list.forEach(item => {
                state.params.push({
                    userId: item[$t('会员ID')],
                    commission: item[$t('网红佣金')],
                })
            })
        } else {
            list = list.filter(item => item[0])
            if (!list.length) return ElMessage.warning($t('此文件未获取到有效内容，请检查后重新操作！'))
            if (list.length > 500) return ElMessage.warning($t('每次最大可导入500人！'))
            list.forEach(item => {
                state.params.push({
                    userId: item[0],
                    commission: item[1] || '',
                })
            })
        }
        ElMessage.success($t('文件上传成功，请点击提交按钮进行提交！'))
    } else {
        ElMessage.warning($t('此文件未获取到有效内容，请检查后重新操作！'))
    }
}

const handleDownload = () => {
    let a = document.createElement('a')
    a.download = $t('网红账号批量导入模版.xlsx')
    if($locale == 'en'){
        a.href = `/file/influencer_account_en.xlsx`
    }else if($locale == 'vi'){
        a.href = `/file/influencer_account_vi.xlsx`
    }else{
        a.href = `/file/influencer_account.xlsx`
    }
    a.style.display = "none"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
}

const handleSubmit = (el) => {
    if (props.operateType === 1 && !state.params.length) return ElMessage.warning($t('请上传excel文件后再进行提交！'))
    el.validate((valid, fields) => {
        if (valid) {
            let obj = deepClone(state.formData)
            let api = props.operateType > 2 ? editInfluencerAccountData : addInfluencerAccountData
            if (props.operateType === 1) {
                if (state.params.some(item => item.commission && (+item.commission > inputMax.value || +item.commission < inputMin.value))) {
                    return ElMessage.warning(`${$t('佣金值不能超过')} ${inputMax.value} ${$t('或低于')} ${inputMin.value}`)
                }
                obj.accountList = JSON.stringify(state.params)
            } else if (props.operateType === 2) {
                api = postInfluencerAccountData
                if (commonData.merchantSiteList.length > 1) {
                    obj.siteIds = obj.merchantId.join(',')
                    delete obj.merchantId
                } else {
                    obj.siteIds = commonData.currentMerchantSite.id
                }
            } else if ([3, 4].includes(props.operateType)) {
                obj.merchantId = props.itemData.merchantId
            }
            dialog.value.showLoading()
            api(obj).then(() => {
                cancel()
            }).catch((err) => {
                dialog.value.closeLoading()
                if (props.operateType === 1 && err.status === 'importFail') {
                    ElMessageBox.confirm($t('导入失败，请下载导入结果修改，重新导入。'), $t('导入失败')).then(() => {
                        getAddInfAccountDownErr({ isExport: true, merchantId: state.formData.merchantId })
                    })
                }
            })
        } else {
            ElMessage.warning($t('请完善表单内容再进行提交！'))
        }
    })
}

const cancel = () => {
    emits('close')
    emits('fetchData')
}
</script>

<style lang="scss">
.influencer-account-deploy {
    .el-input-number {
        width: 196px;
    }
}
</style>
