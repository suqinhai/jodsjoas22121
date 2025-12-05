<template>
    <!-- VIP等级 -->
    <div class="container vip-grade">
        <div class="operate" style="text-align: right;">
            <el-button v-throttle v-if="!state.isDisabled" @click="getData">{{$t('取 消')}}</el-button>
            <el-button v-throttle type="primary" v-if="!state.isDisabled" @click="handleSave(gradeForm)">{{$t('保 存')}}</el-button>
            <el-button v-throttle type="primary" v-if="state.isDisabled && userData.isHasPermiss('admin.user-level-config.upgradeEdit') &&
                state.formData.vips.length " @click="state.isDisabled = false">{{$t('修 改')}}</el-button>
            <el-button v-permiss="'merchant.audit-config.list-2'" v-throttle type="primary" @click="state.showAuditDialog = true">{{$t('稽核设置')}}
            </el-button>
            <el-button v-permiss="'merchant.audit-config.list-2'" v-throttle type="primary" @click="handleRule">{{$t('前端规则配置')}}
            </el-button>
        </div>

        <el-form ref="gradeForm" :model="state.formData" label-width="0" :disabled="state.isDisabled">
            <el-table :data="state.formData.vips" border>
                <el-table-column fixed="left" prop="id" :label="$t('VIP等级')" width="90" align="center">
                    <template #default="{ row }">
                        VIP{{row.level}}
                    </template>
                </el-table-column>
                <el-table-column :label="$t('图标')" min-width="130" align="center" v-if="userData.getTemplateType() !== 4">
                    <template #default="{ row }">
                        <div class="img-upload">
                            <el-image v-if="!!row.icon" class="imgs" :src="row.icon" :crossorigin="null" :preview-src-list="[row.icon]"
                                preview-teleported fit="contain" />
                            <Upload v-model="row.icon">
                                <template #default="{tabLoading}">
                                    <el-button v-throttle size="small" type="primary" style="margin-left:10px" :loading="tabLoading" text>
                                        {{ row.icon ? $t('更换') : $t('上传')}}
                                    </el-button>
                                </template>
                            </Upload>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('升级打码稽核')" align="center">
                    <template #header> 
                        <div class="flex flex-center algin-center">
                            <span class="mr10">{{ $t('升级打码稽核') }}</span>
                            <el-tooltip placement="right" popper-class="tooltip-max-width">
                                <template #content>
                                    <div>{{ $t('对会员在vip升级时，生成稽核任务') }}</div>
                                    <div>{{ $t('打码方式选择：') }}</div>
                                    <div>{{ $t('充值打码：判断会员充值金额需要的稽核打码倍数；') }}</div>
                                    <div>{{ $t('如vip1，充值30，打码3倍，则提现需要打码90') }}</div>
                                    <div>{{ $t('余额打码：计算为当前余额+充值金额，再计算打码倍数；') }}</div>
                                    <div>{{ $t('如vip7，当前余额100，充值累计1000，打码3倍，则系统需要打码（100+100）*3=3300') }}</div>
                                    <div>{{ $t('系统按照上一级计算稽核倍数，如：当前v2，已经完成稽核，继续充值到v3,仍按照v2的稽核提现；') }}</div>
                                </template>
                                <el-icon :size="15">
                                    <QuestionFilled />
                                </el-icon>
                            </el-tooltip>
                        </div>
                    </template>
                    <el-table-column :label="$t('打码方式')" min-width="140" align="center">
                        <template #default="{ row }">
                            <el-select style="width: 100%" v-model="row.pm" :placeholder="$t('打码方式')">
                                <el-option :label="$t('充值打码')" :value="1" />
                                <el-option :label="$t('余额打码')" :value="2" />
                            </el-select>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('打码倍数')" min-width="140" align="center">
                        <template #default="{ row }">
                            <el-input-number v-model="row.af" style="width: 100%" :controls="false" :precision="2" :min="0" :max="999999999999999"
                                :placeholder="$t('打码倍数')" />
                        </template>
                    </el-table-column>
                </el-table-column>
                <el-table-column :label="$t('晋级要求')" align="center">
                    <el-table-column :label="$t('晋级充值')" min-width="140" align="center">
                        <template #default="{ row, $index }">
                            <el-form-item :prop="'vips.' + $index + '.qr'" :rules="{ required: true, message: '', trigger: 'blur' }" label-width="0">
                                <el-input-number v-model="row.qr" style="width: 100%" :controls="false" :precision="2" :min="0" :max="999999999999999"
                                    :placeholder="$t('充值金额')" />
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('晋级打码')" min-width="140" align="center">
                        <template #default="{ row, $index }">
                            <el-form-item :prop="'vips.' + $index + '.qc'" :rules="{ required: true, message: '', trigger: 'blur' }" label-width="0">
                                <el-input-number v-model="row.qc" style="width: 100%" :controls="false" :precision="0" :min="0" :max="999999999999999"
                                    :placeholder="$t('打码金额')" />
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <template v-if="userData.getTemplateType() === 4">
                        <el-table-column :label="$t('每月充值')" min-width="140" align="center">
                            <template #default="{ row, $index }">
                                <!-- <el-form-item :prop="'vips.' + $index + '.umr'" :rules="{ required: true, message: '', trigger: 'blur' }" label-width="0"> -->
                                <el-input-number v-model="row.umr" style="width: 100%" :controls="false" :precision="0" :min="0"
                                    :max="999999999999999" :placeholder="$t('充值金额')" />
                                <!-- </el-form-item> -->
                            </template>
                        </el-table-column>
                        <el-table-column :label="$t('总充值次数')" min-width="140" align="center">
                            <template #default="{ row, $index }">
                                <!-- <el-form-item :prop="'vips.' + $index + '.rn'" :rules="{ required: true, message: '', trigger: 'blur' }" label-width="0"> -->
                                <el-input-number v-model="row.rn" style="width: 100%" :controls="false" :precision="0" :min="0" :max="999999999999999"
                                    :placeholder="$t('充值次数')" />
                                <!-- </el-form-item> -->
                            </template>
                        </el-table-column>
                        <el-table-column :label="$t('每月投注')" min-width="140" align="center">
                            <template #default="{ row, $index }">
                                <!-- <el-form-item :prop="'vips.' + $index + '.umc'" :rules="{ required: true, message: '', trigger: 'blur' }" label-width="0"> -->
                                <el-input-number v-model="row.umc" style="width: 100%" :controls="false" :precision="0" :min="0"
                                    :max="999999999999999" :placeholder="$t('投注金额')" />
                                <!-- </el-form-item> -->
                            </template>
                        </el-table-column>
                    </template>
                    <el-table-column :label="$t('晋级奖励')" min-width="140" align="center">
                        <template #default="{ row, $index }">
                            <el-form-item :prop="'vips.' + $index + '.qa'" :rules="{ required: true, message: '', trigger: 'blur' }" label-width="0">
                                <el-input-number v-model="row.qa" style="width: 100%" :controls="false" :precision="2" :min="0" :max="999999999999999"
                                    :placeholder="$t('奖励金额')" />
                            </el-form-item>
                        </template>
                    </el-table-column>
                </el-table-column>
                <el-table-column :label="$t('保级条件')" align="center">
                    <el-table-column :label="$t('上月充值')" min-width="140" align="center">
                        <template #default="{ row, $index }">
                            <el-form-item :prop="'vips.' + $index + '.lmr'" :rules="{ required: true, message: '', trigger: 'blur' }" label-width="0">
                                <el-input-number v-model="row.lmr" style="width: 100%" :controls="false" :precision="2" :min="0"
                                    :max="999999999999999" :placeholder="$t('充值金额')" />
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('上月打码')" min-width="140" align="center">
                        <template #default="{ row, $index }">
                            <el-form-item :prop="'vips.' + $index + '.lmc'" :rules="{ required: true, message: '', trigger: 'blur' }" label-width="0">
                                <el-input-number v-model="row.lmc" style="width: 100%" :controls="false" :precision="0" :min="0"
                                    :max="999999999999999" :placeholder="$t('打码金额')" />
                            </el-form-item>
                        </template>
                    </el-table-column>
                </el-table-column>
                <el-table-column :label="$t('日奖励条件')" align="center">
                    <el-table-column :label="$t('当日充值')" min-width="140" align="center">
                        <template #default="{ row, $index }">
                            <el-form-item :prop="'vips.' + $index + '.dr'" :rules="{ required: true, message: '', trigger: 'blur' }" label-width="0">
                                <el-input-number v-model="row.dr" style="width: 100%" :controls="false" :precision="2" :min="0" :max="999999999999999"
                                    :placeholder="$t('充值金额')" />
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('当日打码')" min-width="140" align="center">
                        <template #default="{ row, $index }">
                            <el-form-item :prop="'vips.' + $index + '.dc'" :rules="{ required: true, message: '', trigger: 'blur' }" label-width="0">
                                <el-input-number v-model="row.dc" style="width: 100%" :controls="false" :precision="0" :min="0" :max="999999999999999"
                                    :placeholder="$t('打码金额')" />
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('日奖励')" min-width="140" align="center">
                        <template #default="{ row, $index }">
                            <el-form-item :prop="'vips.' + $index + '.da'" :rules="{ required: true, message: '', trigger: 'blur' }" label-width="0">
                                <el-input-number v-model="row.da" style="width: 100%" :controls="false" :precision="2" :min="0" :max="999999999999999"
                                    :placeholder="$t('奖励金额')" />
                            </el-form-item>
                        </template>
                    </el-table-column>
                </el-table-column>
                <el-table-column :label="$t('周奖励条件')" align="center">
                    <el-table-column :label="$t('当周充值')" min-width="140" align="center">
                        <template #default="{ row, $index }">
                            <el-form-item :prop="'vips.' + $index + '.wr'" :rules="{ required: true, message: '', trigger: 'blur' }" label-width="0">
                                <el-input-number v-model="row.wr" style="width: 100%" :controls="false" :precision="2" :min="0" :max="999999999999999"
                                    :placeholder="$t('充值金额')" />
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('当周打码')" min-width="140" align="center">
                        <template #default="{ row, $index }">
                            <el-form-item :prop="'vips.' + $index + '.wc'" :rules="{ required: true, message: '', trigger: 'blur' }" label-width="0">
                                <el-input-number v-model="row.wc" style="width: 100%" :controls="false" :precision="0" :min="0" :max="999999999999999"
                                    :placeholder="$t('打码金额')" />
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('周奖励')" min-width="140" align="center">
                        <template #default="{ row, $index }">
                            <el-form-item :prop="'vips.' + $index + '.wa'" :rules="{ required: true, message: '', trigger: 'blur' }" label-width="0">
                                <el-input-number v-model="row.wa" style="width: 100%" :controls="false" :precision="2" :min="0" :max="999999999999999"
                                    :placeholder="$t('奖励金额')" />
                            </el-form-item>
                        </template>
                    </el-table-column>
                </el-table-column>
                <el-table-column :label="$t('月奖励条件')" align="center">
                    <el-table-column :label="$t('当月充值')" min-width="140" align="center">
                        <template #default="{ row, $index }">
                            <el-form-item :prop="'vips.' + $index + '.mr'" :rules="{ required: true, message: '', trigger: 'blur' }" label-width="0">
                                <el-input-number v-model="row.mr" style="width: 100%" :controls="false" :precision="2" :min="0" :max="999999999999999"
                                    :placeholder="$t('充值金额')" />
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('当月打码')" min-width="140" align="center">
                        <template #default="{ row, $index }">
                            <el-form-item :prop="'vips.' + $index + '.mc'" :rules="{ required: true, message: '', trigger: 'blur' }" label-width="0">
                                <el-input-number v-model="row.mc" style="width: 100%" :controls="false" :precision="0" :min="0" :max="999999999999999"
                                    :placeholder="$t('打码金额')" />
                            </el-form-item>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('月奖励')" min-width="140" align="center">
                        <template #default="{ row, $index }">
                            <el-form-item :prop="'vips.' + $index + '.ma'" :rules="{ required: true, message: '', trigger: 'blur' }" label-width="0">
                                <el-input-number v-model="row.ma" style="width: 100%" :controls="false" :precision="2" :min="0" :max="999999999999999"
                                    :placeholder="$t('奖励金额')" />
                            </el-form-item>
                        </template>
                    </el-table-column>
                </el-table-column>
            </el-table>
            <div class="limit-tips">
                <div class="limit-content">{{$t('提示：VIP晋级打码配置上限：15位数（15个9）！')}}</div>
                <div class="button">
                    <el-button type="primary" @click="addVip" v-if="state.formData.vips.length <= 100">+</el-button>
                    <el-button type="danger" @click="addDel" v-if="state.formData.vips.length > 3">-</el-button>
                </div>
            </div>
            <div class="overdue-box" v-if="userData.getTemplateType() === 4">
                <div class="overdue-box-main">
                    <span class="form-label ">{{$t('奖励过期时间:')}}</span>
                    <el-radio-group v-model="state.overdueType">
                        <el-radio :label="24" :value="24">{{$t('24小时')}}</el-radio>
                        <el-radio :label="48" :value="48">{{$t('48小时')}}</el-radio>
                        <el-radio :label="-1" :value="-1" style="margin-right: 5px">{{$t('自定义')}}</el-radio>
                    </el-radio-group>
                    <template v-if="state.overdueType === -1">
                        <el-input-number v-model="state.overdueTime" style="width: 100px;margin-right: 3px" :controls="false" :precision="0" :min="1"
                            :max="9999" :placeholder="$t('过期时间')" />{{$t('小时')}}
                    </template>
                </div>
                <div class="overdue-box-tips">{{$t('说明：只对晋级奖励配置过期时间，日周月本身是根据对应周期的时间重置，默认取对应的过期时间，不用配置。')}}</div>
            </div>

            <div class="title" v-if="state.formData.onOffs.length">{{$t('VIP开关设置')}}</div>
            <div class="switch-deploy">
                <template v-for="(item,index) in state.formData.onOffs">
                    <div v-if="item.type < 12" :key="index" class="small-box">
                        <div class="row-hand">
                            {{item.title}}
                            <el-switch style="margin-left: 6px" v-if="item.value !== 4" v-model="item.status" @change="switchChange(item)" />
                        </div>
                        <el-form-item v-if="item.value !== 10" :prop="'onOffs.' + index + '.checkList'"
                            :rules="{ required:  item.value === 4, message: $t('请设置开关配置！'), trigger: 'blur' }" label-width="0">
                            <el-checkbox-group v-model="item.checkList" @change="checkboxChange(item)">
                                <el-checkbox v-for="its in item.checkboxList" :key="its.value" :label="its.value"
                                    :disabled="item.value === 4 && item.checkList.length === 1 && item.checkList.includes(its.value)">
                                    {{ its.label }}
                                </el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </div>
                </template>
            </div>
        </el-form>

        <AuditDialog v-if="state.showAuditDialog" @close='state.showAuditDialog = false' />
        <WithdrawSetDialog v-if="state.showWithdrawSetDialog" @close='state.showWithdrawSetDialog = false'></WithdrawSetDialog>
        <RuleSetDialog v-if="state.showRuleDialog" :itemData="state.itemData" @close='state.showRuleDialog = false' @getData="getData">
        </RuleSetDialog>
    </div>
</template>

<script setup name="vipGrade">
import { ref, reactive, onMounted, defineAsyncComponent } from 'vue'
import { ElMessage } from 'element-plus'
import userStore from '@/store/user'
import { getUserUpgradelConfig, editUserUpgradelConfig, getVipRuleDesc } from '@/api/website'
import { deepClone } from '@/common/util'
const AuditDialog = defineAsyncComponent(() => import('./components/AuditDialog'))
const WithdrawSetDialog = defineAsyncComponent(() => import('./components/WithdrawSetDialog'))
const RuleSetDialog = defineAsyncComponent(() => import('./components/RuleSetDialog'))

const formKey = [
    { title: $t('晋级要求'), value: 4, checkboxList: [{ label: $t('晋级充值'), value: 'r' }, { label: $t('晋级打码'), value: 'c' }] },
    { title: $t('保级条件'), value: 11, checkboxList: [{ label: $t('上月充值'), value: 'r' }, { label: $t('上月打码'), value: 'c' }] },
    { title: $t('日奖励条件'), value: 9, checkboxList: [{ label: $t('当日充值'), value: 'r' }, { label: $t('当日打码'), value: 'c' }] },
    { title: $t('周奖励条件'), value: 5, checkboxList: [{ label: $t('当周充值'), value: 'r' }, { label: $t('当周打码'), value: 'c' }] },
    { title: $t('月奖励条件'), value: 6, checkboxList: [{ label: $t('当月充值'), value: 'r' }, { label: $t('当月打码'), value: 'c' }] },
    { title: $t('特权开关'), value: 10 },
]
let listKey = ['d', 'w', 'm']
let state = reactive({
    overdueType: '',
    overdueTime: undefined,
    formData: {
        vips: [],
        onOffs: []
    },
    newFormData: {
        vips: []
    },
    vipRuleOnOffs: {},
    itemData: {},
    isDisabled: true,
    showAuditDialog: false,
    showWithdrawSetDialog: false,
    showRuleDialog: false,
})
const gradeForm = ref(null)
const userData = userStore()

onMounted(() => {
    getData()
})

const getData = () => {
    globalVBus.$emit('globalLoading', true)
    getUserUpgradelConfig().then((res) => {
        state.isDisabled = true
        state.formData.vips = res.data.vips || []
        state.newFormData.vips = deepClone(res.data.vips || [])
        if (userData.getTemplateType() === 4) {
            state.formData.vips.forEach(item => {
                if (!item.umr) item.umr = 0
                if (!item.umc) item.umc = 0
                if (!item.rn) item.rn = 0
            })
            if (res.ext && res.ext.expireTime) {
                if ([24, 48].includes(res.ext.expireTime)) {
                    state.overdueType = res.ext.expireTime
                    state.overdueTime = undefined
                } else {
                    state.overdueType = -1
                    state.overdueTime = res.ext.expireTime
                }
            }
        }
        state.formData.onOffs = []
        res.data.onOffs.forEach(item => {
            if (item.type !== 13) {
                item.checkList = []
                let obj = formKey.find(its => its.value === item.type)
                if (item.c) item.checkList.push('c')
                if (item.r) item.checkList.push('r')
                item.status = !!item.checkList.length
                state.formData.onOffs.push({ ...item, ...obj })
            }
        })
        state.vipRuleOnOffs = res.data.onOffs.find((item) => item.type == 13) || { c: 0 }
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}

const addVip = () => {
    let avatar = state.formData.vips.length > 13 ? "/img/vip/vip_icon_13.png" : "/img/vip/vip_icon_" + (state.formData.vips.length) + ".png"
    let obj = userData.getTemplateType() === 4 ? { "umr": 0, "umc": 0, "rn": 0 } : {}
    state.formData.vips.push({
        "avatar": avatar,
        "da": "",
        "dc": "",
        "dr": "",
        "icon": avatar,
        "level": state.formData.vips.length,
        "lmc": "",
        "lmr": "",
        "ma": "",
        "mc": "",
        "mr": "",
        "qa": "",
        "qc": "",
        "qr": "",
        "wa": "",
        "wc": "",
        "wr": "",
        ...obj
    })
}

const addDel = () => {
    state.formData.vips.pop();
}

const switchChange = (item) => {
    if (item.status) {
        item.checkList = item.checkboxList.map(item => item.value)
    } else {
        item.checkList = []
    }
}

const checkboxChange = (item) => {
    item.status = !!item.checkList.length
}

const handleSave = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            let params = deepClone(state.formData)
            params.onOffs = params.onOffs.map(item => {
                return {
                    type: item.type,
                    r: item.type === 10 ? (item.status ? 1 : 0) : (item.checkList.includes('r') ? 1 : 0),
                    c: item.type === 10 ? (item.status ? 1 : 0) : (item.checkList.includes('c') ? 1 : 0),
                }
            })

            // let isPass = true
            // let list = ['r', 'c']
            // let newOnOffs = [params.onOffs[2], params.onOffs[3], params.onOffs[4]] // 日奖励 周奖励 月奖励
            // for (let index = 0; index < newOnOffs.length; index++) {
            //     for (let ins = 0; ins < list.length; ins++) {
            //         if (!!newOnOffs[index][list[ins]]) {
            //             if (params.vips.slice(1).some(its => its[listKey[index] + 'a'] === 0)) {
            //                 isPass = false
            //             }
            //         }
            //         if (!isPass) break
            //     }
            //     if (!isPass) break
            // }
            // if (!isPass) return ElMessage.warning($t('奖励开关开启，奖励配置不能为0!'))

            params.onOffs.push({
                type: 13,
                r: 1,
                c: state.vipRuleOnOffs.c || 0,
            })
            params.onOffs = JSON.stringify(params.onOffs)
            params.vips = JSON.stringify(params.vips)
            if (userData.getTemplateType() === 4) {
                if (!state.overdueType || (state.overdueType === -1 && !state.overdueTime)) return ElMessage.warning($t('请配置奖励过期时间后再进行操作!'))
                params.expireTime = state.overdueType === -1 ? state.overdueTime : state.overdueType
            }
            globalVBus.$emit('globalLoading', true)
            editUserUpgradelConfig(params).then((res) => {
                if (state.newFormData.vips.length < JSON.parse(params.vips).length) {
                    state.showWithdrawSetDialog = true
                }
                state.newFormData.vips = JSON.parse(params.vips)
                getData()
            }).catch(() => {
                globalVBus.$emit('globalLoading', false)
            })
        } else {
            ElMessage.warning($t('请完善表单内容再进行提交！'))
        }
    })
}

const handleRule = () => {
    globalVBus.$emit('globalLoading', true)
    const type = state.vipRuleOnOffs?.c
    getVipRuleDesc({ type }).then((res) => {
        state.itemData = {
            ruleDesc: res.data || '',
            configType: type
        }
        state.showRuleDialog = true
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang='scss'>
.vip-grade {
    .operate {
        float: right;
        margin: 0 20px 15px 0;
    }

    .el-form-item {
        margin-bottom: 0;
    }

    .title {
        margin: 10px 0;
        font-size: 18px;
        font-weight: 600;
    }
    .switch-deploy {
        display: flex;
        flex-wrap: wrap;
        .small-box {
            flex-shrink: 0;
            width: fit-content !important;
            margin-right: 50px;
            margin-bottom: 20px;
            .row-hand {
                height: 32px;
                width: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
            }
        }
    }
    .limit-tips {
        height: 40px;
        width: 100%;
        display: flex;
        align-items: center;
        margin-top: 10px;
        .limit-content {
            flex: 1;
            color: red;
        }
    }
    .overdue-box {
        margin-top: 5px;
        &-box {
            display: flex;
            align-items: center;
        }
        &-tips {
            color: red;
        }
    }
}
</style>