<template>
    <!-- 财务中心-充值订单列表-订单详情 -->
    <Dialog width="900" :title="$t('订单详情')" :isShowSubmit="false" top="10vh" @cancel="cancel">
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
                        <span>{{orderData.user && orderData.user.name ? orderData.user.name : ''}}</span>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item :label="$t('会员等级:')">
                        <span>{{orderData.level_ || ''}}</span>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item :label="$t('原始数量（汇率）:')">
                        <span>{{orderData.rate ? `1:${orderData.rate}` : ''}}</span>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item :label="$t('操作人:')">
                        <span>{{orderData.emp && orderData.emp.name ? orderData.emp.name : ''}}</span>
                    </el-form-item>
                </el-col>
            </el-row>

            <div class="order-table">
                <div class="table-col" v-for="item in tableData" :key="item.key">
                    <div class="small-box" style="background: #cfcfcf;flex: 2;">{{item.title}}</div>
                    <div class="small-box">{{orderData[item.key]}}</div>
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
    { title: $t('总金额'), key: 'totalAmount' },
    // { title: $t('是否首充'), key: 'id' },
    { title: $t('备注'), key: 'remark' },
    { title: $t('创建时间'), key: 'addTime' },
    { title: $t('成功时间'), key: 'updateTime' },
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
