<template>
    <!-- 财务中心-转账订单列表-订单详情 -->
    <Dialog width="900" :title="$t('订单详情')" :isShowSubmit="false" top="5vh" @cancel="cancel">
        <el-form class="order-detail" :model="orderData" :label-width="$locale == 'zh' ? '130px' : 'auto'">
            <el-row>
                <el-col :span="12">
                    <el-form-item :label="$t('订单号:')">
                        <span>{{orderData.orderNo}}</span>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item :label="$t('订单状态:')">
                        <span>{{orderData.status_ || ''}}</span>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item :label="$t('会员账号:')">
                        <span>{{orderData.username || ''}}</span>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item :label="$t('会员层级:')">
                        <span>{{orderData.layerName || ''}}</span>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item :label="$t('通道名称')">
                        <span>{{orderData.channel_}}</span>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item :label="$t('转账凭证')">
                        <el-image style="max-width: 80px;" v-if="orderData.profileInfo?.profile" class="imgs" :src="orderData.profileInfo?.profile"
                            :crossorigin="null" :preview-src-list="[orderData.profileInfo?.profile]" preview-teleported fit="contain" />
                    </el-form-item>
                </el-col>
            </el-row>

            <div class="order-table">
                <div class="table-col" v-for="item in tableData" :key="item.key">
                    <div class="small-box" style="background: #cfcfcf;flex: 2;">{{item.title}}</div>
                    <div class="small-box" v-if="item.key.split('.').length === 1">{{orderData[item.key]}}</div>
                    <div class="small-box" v-if="item.key.split('.').length === 2">{{orderData[item.key.split('.')[0]][item.key.split('.')[1]]}}</div>
                </div>
            </div>
            
            <div class="order-table">
                <div class="table-col" v-for="item in tableData2" :key="item.key">
                    <div class="small-box" style="background: #cfcfcf;flex: 2;">{{item.title}}</div>
                    <div class="small-box" v-if="item.key.split('.').length === 1">{{orderData[item.key]}}</div>
                    <div class="small-box" v-if="item.key.split('.').length === 2">{{orderData[item.key.split('.')[0]][item.key.split('.')[1]]}}</div>
                </div>
            </div>
        </el-form>
    </Dialog>
</template>

<script setup>
const emits = defineEmits(['close'])
const props = defineProps({
    orderData: {
        type: Object,
        default: {}
    }
})

const tableData = [
    { title: $t('订单金额'), key: 'amount' },
    { title: $t('赠送金额'), key: 'giftAmount' },
    { title: $t('总上分金额'), key: 'totalAmount' },
    { title: $t('会员币种'), key: 'currency' },
    { title: $t('收款账号/地址'), key: 'profileInfo.toAccount' },
    { title: $t('是否首充'), key: 'atFirst' },
    // { title: $t('备注'), key: 'remark' },
    { title: $t('创建时间'), key: 'addTime' },
    { title: $t('成功时间'), key: 'updateTime' },
]


const tableData2 = [
    { title: $t('银行名称'), key: 'profileInfo.bankName' },
    { title: $t('姓名'), key: 'profileInfo.payName' },
    { title: $t('账户'), key: 'profileInfo.payAccount' },
    { title: $t('转账备注'), key: 'profileInfo.frontRemark' },
    { title: $t('前端拒绝备注'), key: 'profileInfo.backRemark' },
]

const cancel = () => {
    emits('close')
}
</script>

<style lang="scss">
.order-detail {
    .order-table {
        width: 100%;
        border: 1px solid #ddd;
        margin-bottom: 20px;
        .table-col {
            display: flex;

            .small-box {
                flex: 3;
                text-align: center;
                line-height: 40px;
            }
        }

        .table-col + .table-col {
            border-top: 1px solid #ddd;
        }

        .small-box + .small-box {
            border-left: 1px solid #ddd;
        }
    }
}
</style>
