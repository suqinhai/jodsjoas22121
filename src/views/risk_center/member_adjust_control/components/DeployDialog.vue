<template>
    <!-- 会员调控-数据列表-操作 -->
    <Dialog ref="dialog" :width="itemData.operateType === 5 ? 400 : 530" :title="title" top="10vh" buttonCenter @confirm="handleSubmit(deployFormRef)"
        @cancel="cancel">
        <div class="pr">
            <div class="member-control-issue pa" v-if="itemData.operateType !== 5 && isShow">
                <el-icon class="pointer" :size="24" @click="emits('showExplain')">
                    <QuestionFilled />
                </el-icon>
            </div>
            <el-form class="member-control-deploy" ref="deployFormRef" :model="state.formData" :rules="state.rules"
                :label-width="$locale == 'zh' ? (itemData.operateType !== 5 ? '130px' : '100px') : 'auto'">
                <el-form-item :label="$t('文件:')" v-if="itemData.operateType === 3">
                    <el-button v-throttle type="primary" @click="hanleUpload">{{$t('上传excel')}}</el-button>
                    <el-button style="margin-left: 30px" v-throttle type="success" @click="handleDownload">{{$t('下载excel模板')}}</el-button>
                </el-form-item>
                <el-form-item :label="$t('返奖率:')" prop="controlType" v-if="itemData.operateType !== 6">
                    <el-select v-model="state.formData.controlType" :placeholder="$t('请选择返奖率')">
                        <el-option v-for="item in (itemData.operateType === 5 ? metaData.ctrlPools : metaData.controlTypeList)" :key="item.value"
                            :label="item.label" :value="Number(item.value)" />
                    </el-select>
                </el-form-item>
                <!-- <el-form-item v-if="itemData.operateType < 5 && isShow" :label="$t('余额最小值限制:')">
                    <el-input-number style="width: 196px" v-model="state.formData.minBalance" :controls="false" :precision="2" :min="0" :placeholder="$t('请输入限制金额')" @blur="inputBlur" />
                </el-form-item> -->
                <el-form-item v-if="itemData.operateType < 5 && isShow" :label="$t('余额最大值限制:')">
                    <el-input-number style="width: 196px" v-model="state.formData.maxBalance" :controls="false" :precision="2" :min="0"
                        :placeholder="$t('请输入限制金额')" @blur="inputBlur" />
                </el-form-item>
                <el-form-item v-if="itemData.operateType === 6" :label="$t('余额最小值返奖率:')">
                    <el-select v-model="state.formData.minRTP" :placeholder="$t('请选择返奖率')">
                        <el-option v-for="item in metaData.controlTypeList" :key="item.value" :label="item.label" :value="Number(item.value)" />
                    </el-select>
                </el-form-item>
                <el-form-item v-if="itemData.operateType === 6" :label="$t('余额最大值返奖率:')">
                    <el-select v-model="state.formData.maxRTP" :placeholder="$t('请选择返奖率')">
                        <el-option v-for="item in metaData.ctrlLoseType" :key="item.value" :label="item.label" :value="Number(item.value)" />
                    </el-select>
                </el-form-item>
                <!-- <el-form-item v-if="itemData.operateType === 1 && state.formData.controlType && isShow" :label="$t('余额限制:')">
                <el-input-number style="width: 100%" v-model="state.formData.balanceLimit" :controls="false" :precision="0" :min="0"
                    :placeholder="$t('请输入限制金额')" />
            </el-form-item> -->
                <div v-if="itemData.operateType === 2" class="control-deploy-tips">{{$t('一键设置：一键设置玩家的返奖率，不包含推广账号')}}</div>
            </el-form>
            <!-- <div v-if="state.formData.controlType && isShow && itemData.operateType !== 5">
            <div>{{$t('温馨提示：')}}</div>
            <div>{{$t('1.建议您设置大于100%返奖率时，设置会员余额最小/大值限制，避免产生大的会员余额和打码量；')}}</div>
            <div>{{$t('2.如果您不设置，将按VIP余额限制处理。')}}</div>
        </div> -->
        </div>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import userStore from '@/store/user'
import { postSimpleControlData, postSimpleDefaultConfig, postSimpleControlOnekey } from '@/api/risk_control'
import * as XLSX from 'xlsx'

const emits = defineEmits(['close', 'fetchData', 'showExplain'])
const props = defineProps({
    itemData: {
        type: Object,
        default: {}
    },
    metaData: {
        type: Object,
        default: {}
    },
})
const state = reactive({
    formData: {},
    rules: {
        controlType: { required: true, message: $t('请选择返奖率！'), trigger: 'change' }
    },
})
const deployFormRef = ref(null)
const dialog = ref(null)
const userData = userStore()

const isShow = computed(() => {
    return (userData.siteInfo.commissionMode === 2 || (userData.siteInfo.commissionMode === 1 && userData.siteInfo.ctrlWin))
})
const title = computed(() => {
    let { operateType } = props.itemData
    if (operateType === 1) return $t('默认设置')
    if (operateType === 2) return $t('一键设置')
    if (operateType === 3) return $t('文件导入')
    if (operateType === 4) return $t('批量操作')
    if (operateType === 5) return $t('一键同步推广账号返奖率设置')
    if (operateType === 6) return $t('余额返奖率设置')
    return ''
})

onMounted(() => {
    state.formData = { ...props.itemData }
})

const inputBlur = () => {
    let { minBalance, maxBalance } = state.formData
    if (typeof minBalance !== 'number' || typeof maxBalance !== 'number') return
    if (maxBalance < minBalance) {
        state.formData.maxBalance = minBalance
    }
}

const hanleUpload = () => {
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
            if (list && list.length) {
                let params = []
                list.forEach(item => {
                    for (let key in item) {
                        !!item[key] && params.push(item[key])
                    }
                })
                params = Array.from(new Set(params))
                state.formData.userIds = params.join(',')
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
    a.download = $t('会员调控模版.xlsx')
    if($locale == 'en'){
        a.href = `/file/member_control_onekey_en.xlsx`
    }else if($locale == 'vi'){
        a.href = `/file/member_control_onekey_vi.xlsx`
    }else{
        a.href = `/file/member_control_onekey.xlsx`
    }
    a.style.display = "none"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
}

const handleSubmit = (el) => {
    let { operateType } = props.itemData
    if (operateType === 3 && !state.formData.userIds) return ElMessage.warning($t('请上传excel文件后再进行提交！'))
    el.validate((valid, fields) => {
        if (valid) {
            let params = { ...state.formData }
            let { maxBalance, minBalance } = params
            let api = postSimpleControlData
            if ([1, 6].includes(operateType)) {
                api = postSimpleDefaultConfig
            }
            // if (operateType > 4 || (typeof maxBalance !== 'number' && typeof minBalance !== 'number') || (userData.siteInfo.commissionMode === 1 && !userData.siteInfo.ctrlWin)) {
            if (operateType > 4 || (userData.siteInfo.commissionMode === 1 && !userData.siteInfo.ctrlWin)) {
                delete params.maxBalance
                delete params.minBalance
            }
            // } else if ((typeof maxBalance !== 'number' && typeof minBalance === 'number') ||
            //     (typeof maxBalance === 'number' && typeof minBalance !== 'number')) {
            //     return ElMessage.warning($t('余额限制最大值和最小值只能都设置或者都不设置！'))
            // }
            if (operateType === 2 || operateType === 5) {
                params.tab = operateType === 2 ? 1 : 2
                api = postSimpleControlOnekey
            }
            params.gameProvider = 'PGC'
            delete params.operateType
            dialog.value.showLoading()
            api(params).then(() => {
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
    display: flex;
    flex-direction: column;
    .control-deploy-tips {
        align-self: center;
        // text-align: center;
    }
}
.member-control-issue {
    top: -56px;
    right: 10px;
}
</style>
