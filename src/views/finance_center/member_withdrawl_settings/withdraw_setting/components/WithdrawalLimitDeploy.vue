<template>
    <!-- 财务中心-会员提现配置-提现设置-VIP提现限制设置 -->
    <Dialog ref="dialog" width="1100" :title="$t('VIP提现限制设置')" top="10vh" :isShowSubmit="false" @cancel="cancel">
        <div class="withdrawal-limit">
            <div class="operate" v-if="state.formData.length && userData.isHasPermiss('merchant.vip-privilege-config.cashEdit') ">
                <el-button v-throttle v-if="!state.isDisabled" @click="getData">{{$t('取 消')}}</el-button>
                <el-button v-throttle type="primary" v-if="!state.isDisabled" @click="handleSubmit(deployFormRef)">{{$t('保 存')}}</el-button>
                <el-button v-throttle type="primary" v-if="state.isDisabled" @click="state.isDisabled = false">{{$t('修 改')}}</el-button>
            </div>

            <el-form ref="deployFormRef" v-if="state.formData.length" :model="state.formData" :disabled="state.isDisabled">
                <el-table :data="state.formData" border>
                    <el-table-column fixed="left" prop="type_" :label="$t('配置')" min-width="220" align="center" />
                    <el-table-column :label="$t('开关')" min-width="90" align="center">
                        <template #default="{ row }">
                            <el-switch v-model="row.status" :active-value="1" :inactive-value="0" />
                        </template>
                    </el-table-column>
                    <el-table-column v-for="item in userLevel" :key="item.value" :label="item.label" min-width="130" align="center">
                        <template #default="{ row }">
                            <span v-if="state.isDisabled">{{ typeof row[item.label] === 'number' ? row[item.label] : $t('无限制') }}</span>
                            <el-form-item v-if="!state.isDisabled">
                                <el-input-number v-model="row[item.label]" style="width: 100%" :controls="false"
                                    :precision="[8,13].includes(row.type) ? 2 : 0" :min="0" :max="titleData[row.type].max"
                                    :placeholder="titleData[row.type].placeholder" />
                            </el-form-item>
                        </template>
                    </el-table-column>
                </el-table>
                <!-- <el-form-item :label="$t('前端提示语:')" style="margin-top: 15px;">
                    <el-input v-model="state.limitTips" style="width: 100%" type="textarea" :rows="4" :placeholder="$t('请输入前端提示内容')" show-word-limit
                        maxlength="300" />
                    <div class="explain-box-2">{{$t('说明：用户提现的时候被VIP规则限制的时候就提示用户输入的内容，若未设置则取系统提示内容。')}}</div>
                </el-form-item> -->
                <el-form-item :label="$t('VIP0前端提示语:')" style="margin-top: 15px;" :label-width="$locale == 'zh' ? '150' : 'auto'">
                    <el-input v-model="state.vip0LimitTips" style="width: 100%" type="textarea" :rows="4" :placeholder="$t('请输入前端提示内容')"
                        show-word-limit maxlength="300" />
                    <div class="explain-box-2">{{$t('注：只对VIP0的会员显示该提示，未配置则使用系统默认提示语')}}</div>
                </el-form-item>
                <el-form-item :label="$t('VIP0+前端提示语:')" style="margin-top: 15px;" :label-width="$locale == 'zh' ? '150' : 'auto'">
                    <el-input v-model="state.otherLimitTips" style="width: 100%" type="textarea" :rows="4" :placeholder="$t('请输入前端提示内容')"
                        show-word-limit maxlength="300" />
                    <div class="explain-box-2">{{$t('注：达到VIP1及以上的VIP等级显示该提示，未配置则使用系统默认提示语')}}</div>
                </el-form-item>
            </el-form>

            <div class="explain-box">
                <div>{{$t('提示：')}}</div>
                <div>{{$t('当日额度：当日可提现最大额度，上限9000000000；')}}</div>
                <div>{{$t('当日次数：当日可提现次数，上限1000；')}}</div>
                <div>{{$t('总额度：总可提现额度，上限900000000000；')}}</div>
                <div>{{$t('总次数：总可提现次数，上限100000；')}}</div>
                <div>{{$t('每日免手续费次数：上限10000；')}}</div>
                <div>{{$t('配置项为空表示不限制，所有配置项数值必须随VIP等级递增，无限制（置空）为最大。')}}</div>
            </div>
        </div>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import userStore from '@/store/user'
import { getWithdrawalLimitConfig, postWithdrawalLimitConfig } from '@/api/finance'

const titleData = {
    7: { title: $t('当日次数'), placeholder: $t('输入次数'), max: 1000 },
    8: { title: $t('当日额度'), placeholder: $t('输入额度'), max: 9000000000 },
    12: { title: $t('总次数'), placeholder: $t('输入次数'), max: 100000 },
    13: { title: $t('总额度'), placeholder: $t('输入额度'), max: 900000000000 },
    14: { title: $t('每日免手续费次数'), placeholder: $t('输入次数'), max: 10000 },
}
const emits = defineEmits(['close'])
const props = defineProps({
    userLevel: {
        type: Array,
        default: () => []
    },
})
const state = reactive({
    formData: [],
    // limitTips: '',
    vip0LimitTips: '',
    otherLimitTips: '',
    isDisabled: true,
})
const deployFormRef = ref(null)
const dialog = ref(null)
const userData = userStore()

onMounted(() => {
    getData()
})

const getData = () => {
    dialog.value.showLoading()
    getWithdrawalLimitConfig().then(({ code, data, ext }) => {
        if (code === 0 && data) {
            state.formData = data.map(item => {
                let { status, vips } = item.config
                let obj = { status, type: item.type, type_: item.type_ }
                let levelData = vips[0]
                props.userLevel.forEach(its => {
                    obj.rtype = levelData.rtype
                    let sameObj = levelData.levels.find(ims => +ims.level === +its.value)
                    obj[its.label] = !sameObj || +sameObj.count === -1 ? undefined : +sameObj.count
                })
                return obj
            })
            // state.limitTips = ext?.limitTips
            state.vip0LimitTips = ext?.vip0LimitTips
            state.otherLimitTips = ext?.otherLimitTips
        }
        state.isDisabled = true
        dialog.value.closeLoading()
    }).catch(() => {
        dialog.value.closeLoading()
    })
}

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            let params = state.formData.map(item => {
                return {
                    type: item.type,
                    config: {
                        status: item.status,
                        type: item.type,
                        vips: [{
                            rtype: item.rtype,
                            levels: props.userLevel.map(its => {
                                return {
                                    count: typeof item[its.label] === 'number' ? item[its.label] : -1,
                                    level: its.value
                                }
                            })
                        }],
                    }

                }
            })
            dialog.value.showLoading()
            postWithdrawalLimitConfig({ cashLimit: JSON.stringify(params), vip0LimitTips: state.vip0LimitTips, otherLimitTips: state.otherLimitTips }).then(() => {
                getData()
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

<style lang="scss">
.withdrawal-limit {
    .operate {
        width: 100%;
        display: flex;
        justify-content: flex-end;
        padding: 0 20px 10px 0;
        margin-top: -5px;
    }
    .explain-box {
        margin-top: 15px;
    }
}
</style>
