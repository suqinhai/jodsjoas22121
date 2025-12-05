<template>
    <!-- 财务中心-会员提现配置-提现设置-提现参数设置 -->
    <Dialog ref="dialog" width="960" :title="$t('提现参数设置')" top="8vh" :isShowSubmit="isCanEdit"
        :operateActions="isCanEdit?[$t('关闭'), $t('提交')]:[$t('关闭')]" @confirm="handleSubmit(operateForm)" @cancel="cancel">
        <el-form ref="operateForm" class="withdraw-deploy" :rules="state.rules" :model="state.formData" :disabled="!isCanEdit" label-width="auto">
            <el-form-item label-width="0">
                <el-checkbox v-model="state.formData.decimalsOpen" :true-label="1" :false-label="0"  :label="$t('提现额度支持小数（开启后，提现可输入小数；注意：关联的免审自动出款通道需支持小数提现）')"></el-checkbox>
            </el-form-item>    
            <el-form-item :label="$t('会员可同时进行提现笔数:')" prop="sameTimeCashCount">
                <el-input-number v-model="state.formData.sameTimeCashCount" style="width: 150px;margin-right: 5px" :controls="false" :precision="0"
                    :min="0" placeholder="0" />{{$t('笔')}}<div class="form-item-tips">{{$t('说明：若填1笔，则若未审核出账完成无法发起第二笔，填0表示无限制，默认为0')}}</div>
            </el-form-item>
            <el-form-item :label="$t('是否需要风控审核:')">
                <el-radio-group v-model="state.formData.riskReview">
                    <el-radio :label="0">{{$t('关闭')}}</el-radio>
                    <el-radio :label="1">{{$t('开启')}}</el-radio>
                </el-radio-group>
                <div class="form-item-tips">{{$t('1、开启后将增加风控页签，所有提现都需要先经过风控审核，最后再由财务审核出款；')}}</div>
                <div class="form-item-tips">{{$t('2、需要后台加上相应的“风控审核”权限才能使用；')}}</div>
                <div class="form-item-tips" style="margin-bottom: 10px;">{{$t('3、以下条件为并且关系（即所有条件都符合才能免风控审核），若都必须审核，配置需大于0，则都需要先风控审核。')}}</div>
                <!-- <div class="items"> -->

                <!-- <el-form-item :label="$t('免风控标签:')" class="items-box">
                        <el-select v-model="state.formData.riskItem.tags" multiple style="width: 100%" :placeholder="$t('免风控标签')">
                            <el-option v-for="item in metaData.fix" :key="item.value" :label="item.label" :value="item.value" />
                        </el-select>
                    </el-form-item> -->
                <!-- </div> -->
                <div class="single-row" v-if="state.formData.riskReview">{{$t('累计提现')}}≥
                    <el-input-number v-model="state.formData.riskItem.cashCount" style="width: 150px;margin: 0 5px" :controls="false" :precision="0"
                        :min="0" placeholder="0" />{{$t('次数可免风控，提现金额≤')}}
                    <el-input-number v-model="state.formData.riskItem.cashAmount" style="width: 150px;margin: 0 5px" :controls="false" :precision="2"
                        :min="0" placeholder="0.00" />{{$t('可免风控')}}</div>
                <!-- <div class="single-row">{{$t('提现金额≤')}}<el-input-number v-model="state.formData.riskItem.cashAmount" style="width: 150px;margin: 0 5px"
                        :controls="false" :precision="2" :min="0" placeholder="0.00" />{{$t('可免风控')}}</div> -->
            </el-form-item>
            <el-form-item :label="$t('免风控层级:')" v-if="state.formData.riskReview">
                <el-checkbox v-model="state.checkAll" :indeterminate="state.isIndeterminate" @change="checkAllLevel">{{$t('全部层级')}}</el-checkbox>
                <el-checkbox-group v-model="state.formData.riskItem.tags" @change="handleCheckLevel">
                    <el-checkbox v-for="item in allLevelList" :key="item.id" :label="item.id">{{item.name}}
                    </el-checkbox>
                </el-checkbox-group>
            </el-form-item>
            <el-form-item :label="$t('会员首次提现前提条件:')">
                <el-form-item label-width="0px" class="small-box">{{$t('首次提现要求累计充值金额达到')}}
                    <el-input-number v-model="state.formData.firstCash.recharge" style="width: 150px;margin-right: 5px" :controls="false"
                        :precision="0" :min="0" placeholder="0.00" />
                </el-form-item>
                <el-form-item label-width="0px" class="small-box">{{$t('首次提现金额最低要求')}}
                    <el-input-number v-model="state.formData.firstCash.cash" style="width: 150px;margin-right: 5px" :controls="false" :precision="2"
                        :min="0" placeholder="0.00" />
                </el-form-item>
            </el-form-item>
            <el-form-item :label="$t('最大提现金额设置:')">
                <el-input-number v-model="state.formData.maxCashAmount" style="width: 150px" :controls="false" :precision="0" :min="0"
                    placeholder="0.00" />
            </el-form-item>
            <el-form-item :label="$t('最低提现金额设置:')">
                <el-input-number v-model="state.formData.minCashAmount" style="width: 150px" :controls="false" :precision="0" :min="0"
                    placeholder="0.00" />
            </el-form-item>
            <div style="margin: 0 0 10px 50px">{{$t('提现额度优先级：首次提现金额＞最低提现金额')}}</div>
            <el-form-item :label="$t('盈利上限金额') + ':'">
                <el-input-number v-model="state.formData.maxProfitAmount" style="width: 150px" :controls="false" :precision="0" :min="0"
                    :max="['ID', 'VN'].includes(userData.merchantInfo.country) ? 999999999 : 999999" placeholder="请输入盈利上限金额" />
            </el-form-item>
            <div>{{$t('会员首次充值时，若盈利（代理佣金不算盈利）超过此上限，则系统自动从余额中扣除超出部分；')}}</div>
            <div>{{$t('非充值会员前端发起提现时，若有超出盈利上限金额，前端将会显示提醒；')}}</div>
            <div>{{$t('会员盈利=游戏盈利+领取平台赠送')}}</div>
            <div>{{$t('首充充值判断：')}}</div>
            <div>
                {{$t('如盈利上限金额配置40，会员当前余额80（其中70包括游戏盈利和活动奖励），代理佣金10，会员首充100，充值奖励10，共110，充值后，超出部分为30（80-10（代理佣金不计算）-40）；当前余额显示为充值和奖励160（50（扣除超出后的当前余额）+110），系统已自动扣除超出部分30。')}}
            </div>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { ref, reactive, onMounted, computed } from 'vue'
import userStore from '@/store/user'
import { deepClone } from '@/common/util'
import { postMerchantCashConfigChannel } from '@/api/finance'

const emits = defineEmits(['fetchData', 'close'])
const props = defineProps({
    itemData: {
        type: Object,
        default: {}
    },
    allLevelList: {
        type: Array,
        default: () => []
    }
})
const dialog = ref(null)
const operateForm = ref(null)
const state = reactive({
    checkAll: false,
    isIndeterminate: false,
    formData: {
        sameTimeCashCount: 0,
        riskReview: 0,
        firstCash: {
            cash: undefined,
            recharge: undefined,
        },
        minCashAmount: '',
        riskItem: {
            tags: []
        }
    },
    rules: {
        sameTimeCashCount: { required: true, message: $t('请输入会员可同时进行提现笔数！'), trigger: 'blur' },
        // minCashAmount: { required: true, message: $t('请设置最低提现金额！'), trigger: 'blur' },
        // accountLimit: { required: true, message: $t('请设置提现账号限制！'), trigger: 'blur' },
        // 'firstCash.recharge': { required: true, message: $t('请设置会员首次提现前提条件！'), trigger: 'blur' },
        // 'firstCash.cash': { required: true, message: $t('请设置会员首次提现前提条件！'), trigger: 'blur' },
    }
})
const userData = userStore()

const isCanEdit = computed(() => {
    return userData.isHasPermiss('merchant.user-cash-config.editParam')
})

onMounted(() => {
    if (Object.keys(props.itemData).length) {
        state.formData = { ...props.itemData }
        if (!state.formData.riskItem.tags) state.formData.riskItem.tags = []
        const checkedCount = state.formData.riskItem.tags.length
        state.checkAll = checkedCount === props.allLevelList.length
        state.isIndeterminate =
            checkedCount > 0 && checkedCount < props.allLevelList.length
    }
})

const checkAllLevel = (val) => {
    state.formData.riskItem.tags = val
        ? props.allLevelList.map((item) => item.id)
        : []
    state.isIndeterminate = false
};

const handleCheckLevel = () => {
    const checkedCount = state.formData.riskItem.tags.length
    state.checkAll = checkedCount === props.allLevelList.length
    state.isIndeterminate =
        checkedCount > 0 && checkedCount < props.allLevelList.length
}

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            let params = deepClone(state.formData)
            if (!params.riskReview) {
                params.riskItem.tags = []
            }
            if (typeof params.firstCash.cash !== 'number') delete params.firstCash.cash
            if (typeof params.firstCash.recharge !== 'number') delete params.firstCash.recharge
            if (typeof params.minCashAmount !== 'number') delete params.minCashAmount
            // if (!Object.keys(params.firstCash).length) delete params.firstCash
            params.firstCash = JSON.stringify(params.firstCash)
            params.riskItem = JSON.stringify(params.riskItem)
            dialog.value.showLoading()
            postMerchantCashConfigChannel(params).then(() => {
                // ElMessage.success($t('提交成功！'))
                cancel()
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
.withdraw-deploy {
    .items {
        margin-bottom: 15px;
        display: flex;
        justify-content: space-between;
        &-box {
            // width: 45%;
            margin-bottom: 15px;
            .el-form-item__label {
                // width: 100px !important;
                width: 86px !important;
                font-weight: normal;
            }
        }
    }
    .small-box {
        // width: 100%;
        margin-bottom: 20px;
        // .el-form-item__label {
        //     display: none;
        // }
    }
    .single-row {
        margin-bottom: 15px;
    }
}
</style>
