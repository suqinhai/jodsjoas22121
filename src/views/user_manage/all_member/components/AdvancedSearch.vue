<template>
    <!-- 所有会员-高级搜索 -->
    <Dialog ref="dialog" width="1100" :title="$t('高级搜索')" :isCancel="false" top="5vh" :operateActions="[$t('重置'), $t('确认')]" @confirm="handleSubmit" @cancel="cancel" @close="emits('close')">
        <el-form class="advanced-search" :model="state.formData" label-width="170px">
            <el-form-item class="items">
                <el-radio-group v-model="state.formData.type">
                    <el-radio :label="1">{{$t('会员账号')}}</el-radio>
                    <el-radio :label="2">{{$t('会员ID')}}</el-radio>
                    <el-radio :label="3">{{$t('电话号码')}}</el-radio>
                    <el-radio :label="4">{{$t('上级代理ID')}}</el-radio>
                    <el-radio :label="5">{{$t('上级代理账号')}}</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item class="items">
                <el-input :disabled="!state.formData.type" @input="(val) => state.formData.accounts = val.replace('，','')" style="width: 100%" type="textarea" :rows="4"
                    :placeholder="$t('多个需英文逗号隔开，最多200个')" v-model="state.formData.accounts" />
            </el-form-item>
            <el-row>
                <el-col :span="10">
                    <el-form-item :label="$t('姓名:')" class="row-left">
                        <el-input v-model="state.formData.realName" :placeholder="$t('请输入姓名')" />
                    </el-form-item>
                </el-col>
                <el-col :span="14">
                    <el-form-item :label="$t('注册来源:')">
                        <el-select clearable v-model="state.formData.source" style="width: 100%" :placeholder="$t('请选择注册来源')">
                            <el-option v-for="item in metaData.userSource" :key="item.value" :label="item.label" :value="+item.value" />
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="10">
                    <el-form-item :label="$t('账号状态:')" class="row-left">
                        <el-select clearable multiple v-model="state.formData.flagTab" style="width: 100%" :placeholder="$t('账号状态')">
                            <el-option :label="$t('冻结')" :value="1" />
                            <el-option :label="$t('正常')" :value="2" />
                            <el-option :label="$t('禁止进入游戏')" :value="4" />
                            <el-option :label="$t('禁止提现')" :value="6" />
                            <el-option :label="$t('禁止优惠')" :value="8" />
                            <el-option :label="$t('大厅在线')" :value="90" />
                            <el-option :label="$t('游戏在线')" :value="91" />
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="14">
                    <el-form-item :label="$t('注册设备类型:')">
                        <el-select clearable v-model="state.formData.client" style="width: 100%" :placeholder="$t('请选择设备类型')">
                            <el-option v-for="(item,index) in metaData.client" :key="item.value" :label="item.label" :value="index" />
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="10">
                    <el-form-item :label="$t('VIP等级:')" class="row-left">
                        <el-select clearable multiple v-model="state.formData.levels" style="width: 100%" :placeholder="$t('VIP等级')">
                            <el-option v-for="item in metaData.userLevel" :key="item.value" :label="item.label" :value="item.value" />
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="14">
                    <el-form-item :label="$t('注册时间:')">
                        <el-date-picker v-model="state.formData.registerTime" type="datetimerange" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" :start-placeholder="$t('开始时间')"
                            :disabled-date="disabledCurrentDateAfter" :default-time="defaultTime" :shortcuts="shortcuts" :end-placeholder="$t('结束时间')"
                            style="width: 425px!important;max-width: 100%;" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="10">
                    <el-form-item :label="$t('会员层级:')" class="row-left">
                        <el-select clearable filterable v-model="state.formData.layerId" style="width: 100%" :placeholder="$t('会员层级')">
                            <el-option v-for="item in showData" :key="item.id" :label="item.name" :value="item.id" />
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="14">
                    <el-form-item :label="$t('最后登录时间:')">
                        <el-date-picker v-model="state.formData.lastLoginTime" type="daterange" value-format="YYYY-MM-DD" :start-placeholder="$t('开始时间')" :disabled-date="disabledCurrentDateAfter"
                            :shortcuts="shortcuts" :end-placeholder="$t('结束时间')" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="10">
                    <el-form-item :label="$t('首充时间:')" class="row-left">
                        <el-date-picker v-model="state.formData.firstRechargeTime" type="datetimerange" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" :start-placeholder="$t('开始时间')"
                            :disabled-date="disabledCurrentDateAfter" :default-time="defaultTime" :shortcuts="shortcuts" :end-placeholder="$t('结束时间')" style="width: 345px;max-width: 100%;" />
                    </el-form-item>
                </el-col>
                <el-col :span="14">
                    <el-form-item :label="$t('渠道名称:')">
                        <el-select class="select-box" v-model="state.formData.channelId" :placeholder="$t('请选择渠道名称')" filterable style="width: 100%" clearable>
                            <el-option v-for="item in channelData" :key="item.id" :label="item.name" :value="item.id" />
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="10">
                    <el-form-item :label="$t('登录IP:')" class="row-left">
                         <el-input v-model="state.formData.lastLoginIp" :placeholder="$t('请输入登录IP')" />
                    </el-form-item>
                </el-col>
                <el-col :span="14">
                    <el-form-item :label="$t('注册IP:')">
                        <el-input v-model="state.formData.registerIp" :placeholder="$t('请输入注册IP')" />
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
    </Dialog>
</template>

<script setup>
import { reactive, onMounted, computed, ref } from 'vue'
import { deepClone, getShortcuts, disabledCurrentDateAfter, getDefaultTime } from '@/common/util'
import { getChannelData } from '@/api/common'

const shortcuts = getShortcuts()
const defaultTime = getDefaultTime()
const emits = defineEmits(['fetchData', 'close', 'update:initData'])
const props = defineProps({
    initData: {
        type: Object,
        default: {}
    },
    metaData: {
        type: Object,
        default: {}
    },
})
const channelData = ref([])
const state = reactive({
    formData: {},
})

const showData = computed(() => {
    return props.metaData.autoLevel.concat(props.metaData.fixedLevel)
})

onMounted(() => {
    if (Object.keys(props.initData).length) {
        state.formData = deepClone(props.initData)
    }
    globalVBus.$emit('globalLoading', true)
    getChannelData().then(res => {
        channelData.value = res.data || []
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
})

const handleSubmit = () => {
    emits('close')
    let params = deepClone(state.formData)
    params.key = 'advancedSearch'
    let { registerTime, lastLoginTime, firstRechargeTime, levels, flagTab, layerId, lastLoginIp, registerIp } = params
    if (registerTime && registerTime.length) {
        params['addTime.begin'] = registerTime[0]
        params['addTime.end'] = registerTime[1] + '.999'
    }
    if (lastLoginTime && lastLoginTime.length) {
        params['lastLoginTime.begin'] = lastLoginTime[0]
        params['lastLoginTime.end'] = lastLoginTime[1]
    }
    if (firstRechargeTime && firstRechargeTime.length) {
        params['firstRechargeTime.begin'] = firstRechargeTime[0]
        params['firstRechargeTime.end'] = firstRechargeTime[1] + '.999'
    }
    if (levels) params.levels = levels.join(',')
    if (flagTab) params.flagTab = flagTab.join(',')
    if (typeof layerId === 'number') {
        let type = showData.value.find(item => item.id === layerId).type
        if (type) {
            params.fixedLayerId = layerId
        } else {
            params.autoLayerId = layerId
        }
    }
    if(registerIp) params.registerIp = registerIp
    if(lastLoginIp) params.lastLoginIp = lastLoginIp

    delete params.layerId
    delete params.registerTime
    delete params.lastLoginTime
    delete params.firstRechargeTime
    emits('fetchData', params)
    emits('update:initData', state.formData)
}

const cancel = () => {
    state.formData = {}
    emits('update:initData', {})
}
</script>

<style lang="scss">
.advanced-search {
    .items {
        .el-form-item__label {
            width: 0 !important;
        }
        .el-form-item__content {
            margin-left: 20px !important;
        }
    }

    .row-left {
        .el-form-item__label {
            width: 140px !important;
        }
    }
}
</style>
