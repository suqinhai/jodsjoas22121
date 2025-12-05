<template>
    <!-- 游戏获利监控-监控参数 -->
    <Dialog :title="$t('监控参数')" ref="dialogRef" :isShowSubmit="isCanEdit" @confirm="handleSubmit(monitorParamsFormRef)" @cancel="emits('close')" width="1000"
        :operateActions="isCanEdit?[$t('关闭'), $t('提交')]:[$t('关闭')]">
        <div class="pr">
            <el-form :model="monitorParamsForm" :label-width="$locale == 'zh' ? '160px' : '250px'" :disabled="!isCanEdit" ref="monitorParamsFormRef" :rules="rules">
                <el-form-item :label="$t('高倍爆奖开关:')">
                    <el-radio-group v-model="monitorParamsForm.highOpen">
                        <el-radio :label="true">{{$t('开启')}}</el-radio>
                        <el-radio :label="false">{{$t('关闭')}}</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-row v-if="monitorParamsForm.highOpen">
                    <el-col :span="12">
                        <el-form-item :label="$t('高倍爆奖倍数:')" prop="highRTP">
                            <el-input-number v-model="monitorParamsForm.highRTP" :min="0" :precision="2" :controls="false" :placeholder="$t('高倍爆奖倍数')" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item :label-width="$locale == 'zh' ? '190px' : 'auto'" :label="$t('高倍爆奖中奖金额:')" prop="highPlaySum">
                            <el-input-number v-model="monitorParamsForm.highPlaySum" :min="0" :precision="0" :controls="false"
                                :placeholder="$t('高倍爆奖中奖金额')" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item :label="$t('大额中奖:')" prop="bigPlaySum">
                    <el-input-number v-model="monitorParamsForm.bigPlaySum" :min="0" :precision="0" :controls="false" :placeholder="$t('大额中奖')" />
                </el-form-item>
                <el-form-item :label="$t('获利比开关:')">
                    <el-radio-group v-model="monitorParamsForm.profitOpen">
                        <el-radio :label="true">{{$t('开启')}}</el-radio>
                        <el-radio :label="false">{{$t('关闭')}}</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-row v-if="monitorParamsForm.profitOpen">
                    <el-col :span="12">
                        <el-form-item :label="$t('当日会员获利比:')" prop="sunProfitRate">
                            <el-input-number v-model="monitorParamsForm.sunProfitRate" :min="0" :precision="2" :controls="false"
                                :placeholder="$t('当日会员获利比')" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item :label-width="$locale == 'zh' ? '190px' : 'auto'" :label="$t('当日获利比触发额度值:')" prop="sunProfitSum">
                            <el-input-number v-model="monitorParamsForm.sunProfitSum" :min="0" :precision="0" :controls="false"
                                :placeholder="$t('当日获利比触发额度值')" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item :label="$t('风控提醒开关:')">
                    <el-radio-group v-model="monitorParamsForm.warnOpen">
                        <el-radio :label="true">{{$t('开启')}}</el-radio>
                        <el-radio :label="false">{{$t('关闭')}}</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item :label="$t('风控提醒间隔时间(S):')" v-if="monitorParamsForm.warnOpen" prop="warnIntervalInS">
                    <el-input-number v-model="monitorParamsForm.warnIntervalInS" :min="0" :precision="0" :controls="false" :placeholder="$t('风控提醒间隔时间')" />
                </el-form-item>
            </el-form>
            <div class="pa explain-box" :style="$locale == 'zh' ? 'left: 60px;' : ''">
                <el-icon class="pointer" color="#666" :size="24" @click="emits('showExplainDialog')">
                    <QuestionFilled />
                </el-icon>
            </div>
        </div>
    </Dialog>
</template>

<script setup>
import { onMounted, ref, computed } from "vue"
import userStore from '@/store/user'
import { userProfitSpyViewApi, userProfitSpyAddOrEditApi } from "@/api/risk_control"
import { ElMessage } from "element-plus"

const emits = defineEmits(["close", 'showExplainDialog']);
const monitorParamsForm = ref({
    bigPlaySum: undefined
})
const monitorParamsFormRef = ref(null)
const dialogRef = ref(null)
const rules = {
    highRTP: [
        { required: true, message: $t('高倍爆奖开关开启后，此项必填'), trigger: "blur" },
        { type: 'number', min: 10, message: $t('高倍爆奖倍数最小值为10'), trigger: "change" },
    ],
    highPlaySum: [
        { required: true, message: $t('高倍爆奖开关开启后，此项必填'), trigger: "blur" },
        { type: 'number', min: 1000, message: $t('高倍爆奖中奖金额最小值为1000'), trigger: "change" },
    ],
    bigPlaySum: [
        { type: 'number', min: 500, message: $t('大额中奖最小值为500'), trigger: "change" },
    ],
    sunProfitRate: [
        { required: true, message: $t('获利比开关开启后，此项必填'), trigger: "blur" },
        { type: 'number', min: 100, message: $t('当日会员获利比最小值为100'), trigger: "change" },
    ],
    sunProfitSum: [
        { required: true, message: $t('获利比开关开启后，此项必填'), trigger: "blur" },
        { type: 'number', min: 1000, message: $t('当日获利比触发额度值最小值为1000'), trigger: "change" },
    ],
    warnIntervalInS: [
        { required: true, message: $t('获利比开关开启后，此项必填'), trigger: "blur" },
    ],
}
const userData = userStore()

const isCanEdit = computed(() => {
    return userData.isHasPermiss('admin.user-profit-spy-log.addOrEdit')
})

onMounted(() => {
    userProfitSpyViewApi().then(({ code, data }) => {
        if (code == 0 && data) {
            monitorParamsForm.value = Object.assign(monitorParamsForm.value, data)
        }
    });
})

// 提交
const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            let params = { ...monitorParamsForm.value }
            if (!params.highOpen) {
                delete params.highRTP;
                delete params.highPlaySum;
            }
            if (!params.profitOpen) {
                delete params.sunProfitRate;
                delete params.sunProfitSum;
            }
            if (!params.warnOpen) {
                delete params.warnIntervalInS;
            }
            dialogRef.value.showLoading()
            userProfitSpyAddOrEditApi(params).then(res => {
                emits("close")
            }).catch(err => {
                dialogRef.value.closeLoading()
            })
        } else {
            ElMessage.warning($t('请完善表单内容再进行提交！'))
        }
    })
}
</script>

<style lang="scss" scoped>
.dialogBtn {
    display: flex;
    justify-content: center;
}
:deep(.el-dialog__body) {
    box-sizing: border-box;
    border-top: 1px solid #ccc;
}
.explain-box {
    top: -55px;
    left: 170px;
}
</style>
