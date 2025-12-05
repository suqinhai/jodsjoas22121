<template>
    <!-- 财务中心-转账提现列表-订单详情 -->
    <Dialog width="1000" :title="$t('订单详情')" :isShowSubmit="false" top="5vh" @cancel="cancel">
        <el-form class="order-detail" :model="orderData" :label-width="$locale == 'zh' ? '130px' : 'auto'">
            <el-row>
                <el-col :span="14">
                    <el-form-item :label-width="$locale == 'zh' ? '120px' : 'auto'" :label="$t('订单号:')">
                        <span>{{orderData.orderNo}}</span>
                    </el-form-item>
                </el-col>
                <el-col :span="9">
					<el-form-item :label-width="$locale == 'zh' ? '120px' : 'auto'" :label="$t('支付通道:')">
					    <span>{{orderData.channelType_ || ''}}</span>
					</el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="14">
                    <el-form-item :label-width="$locale == 'zh' ? '120px' : 'auto'" :label="$t('会员账号:')">
                        <span>{{orderData.user.name}}</span>
                    </el-form-item>
                </el-col>
                <el-col :span="9">
                    <el-form-item :label-width="$locale == 'zh' ? '120px' : 'auto'" :label="$t('订单状态:')">
                        <span>{{orderData.status_ || ''}}</span>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="14">
                    <el-form-item :label-width="$locale == 'zh' ? '120px' : 'auto'" :label="$t('操作人:')">
                        <span>{{orderData.emp && orderData.emp.name ? orderData.emp.name : ''}}</span>
                    </el-form-item>
                </el-col>
                <el-col :span="9">
                    <el-form-item :label-width="$locale == 'zh' ? '120px' : 'auto'" :label="$t('收款人银行账号:')">
                        <span>{{orderData.account || ''}}</span>
						<el-button v-if="orderData.account" v-throttle link type="primary" @click="copy(orderData.account)">{{$t('复制')}}</el-button>
                    </el-form-item>
                </el-col>
            </el-row>
            <div class="order-table">
                <div class="table-col" v-for="item in tableData" :key="item.key">
                    <div class="small-box" style="background: #cfcfcf;flex: 1;">{{item.title}}</div>
                    <div class="small-box">{{orderData[item.key] || item.default }}</div>
                </div>
            </div>
        </el-form>
    </Dialog>
</template>

<script setup>
import { copyText } from '@/common/util'
const emits = defineEmits(['close'])
const props = defineProps({
    orderData: {
        type: Object,
        default: {}
    }
})

const tableData = [
    { title: $t('预计到账'), key: 'amount', default: 0 },
    { title: $t('实际到账'), key: 'realAmount', default: 0 },
    { title: $t('手续费'), key: 'fee', default: 0 },
    { title: $t('前端备注'), key: 'reviewRemark', default: '' },
    { title: $t('创建时间'), key: 'addTime', default: '' },
    { title: $t('操作时间'), key: 'updateTime', default: '' },
]

const copy = (text) => {
    copyText(text)
}

const cancel = () => {
    emits('close')
}
</script>

<style lang="scss">
.order-detail {
    .order-table {
        width: 100%;
        border: 1px solid #ddd;

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
