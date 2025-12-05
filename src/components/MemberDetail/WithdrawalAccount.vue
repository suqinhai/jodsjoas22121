<template>
    <!-- 会员详情弹窗-提现账户 -->
    <div class="withdrawal-account">
        <template v-if="!Object.keys(state.metaData).length">
            <div style="text-align: center;">{{$t('暂无数据')}}</div>
        </template>
        <template v-else>
            <div v-for="(item,index) in Object.keys(state.metaData)" :key="index">
                <div class="head" :style="{'margin-top': !!index ? '20px' : '0px'}">
                    <div class="">{{item === 'BANK_OFF' ? $t('线下转账') : item}}
                        <span v-if="item !== 'BANK_OFF'" class="pointer" @click="emits('showDialog', {key: 'explainShow'})">
                            <el-icon :size="18">
                                <QuestionFilled />
                            </el-icon>
                        </span>
                    </div>
                    <el-button v-if="userData.isHasPermiss('merchant.account.edit')  && !userData.userInfo.limitEditSecret" v-throttle type="primary"
                        @click="handleConfig({channel_: item},item)">{{$t('新增账户')}}</el-button>
                </div>
                <el-table :data="state.configData[item] || []" border>
                    <el-table-column v-if="item !== 'USDT'" prop="realName" :label="$t('姓名')" min-width="120" align="center">
                        <template #default="{ row }">
                            {{ userData.userInfo.needAnonymous?row.realName.slice(0, 1) + '****' :row.realName}}
                        </template>
                    </el-table-column>
                    <el-table-column v-if="['BANK_OFF'].includes(item)" prop="bankCode" :label="$t('支付方式')" min-width="120" align="center" />
                    <el-table-column v-if="item === 'USDT'" prop="accountNo" :label="$t('钱包地址')" min-width="120" align="center">
                        <template #default="{ row }">
                            {{ userData.userInfo.needAnonymous?row.accountNo.slice(0, 2) + '****' + row.accountNo.slice(-3) :row.accountNo}}
                        </template>
                    </el-table-column>
                    <el-table-column v-if="item === 'USDT'" prop="subtype" :label="$t('协议')" min-width="100" align="center" />
                    <el-table-column v-if="!['USDT','BANK_OFF'].includes(item) && !((userData.merchantInfo.country === 'AR' || userData.merchantInfo.country === 'CO') && item === 'BANK')" prop="subtype_" :label="$t('类型')" min-width="120" align="center" />
                    <el-table-column v-if="(userData.merchantInfo.country === 'AR' || userData.merchantInfo.country === 'CO') && item === 'BANK'" prop="bankCode" :label="$t('类型')" min-width="120" align="center" />
                    <el-table-column v-if="item !== 'USDT'" prop="accountNo" :label="$t('账号')" min-width="120" align="center">
                        <template #default="{ row }">
                            {{ userData.userInfo.needAnonymous?row.accountNo.slice(0, 2) + '****' + row.accountNo.slice(-3) :row.accountNo}}
                        </template>
                    </el-table-column>
                    <el-table-column v-if="!['USDT','BANK_OFF'].includes(item) && isInr" prop="bankCode" :label="$t('IFSC')" min-width="120"
                        align="center">
                        <template #default="{ row }">
                            {{ userData.userInfo.needAnonymous?row.bankCode.slice(0, 2) + '****' + row.bankCode.slice(-3) :row.bankCode}}
                        </template>
                    </el-table-column>
                    <el-table-column fixed="right" align="center" :label="$t('操作')" width="140">
                        <template #default="{ row }" v-if="!userData.userInfo.limitEditSecret">
                            <el-button v-permiss="'merchant.account.edit'" v-throttle type="primary" text @click="handleConfig(row,item)">{{$t('修改')}}
                            </el-button>
                            <el-button v-permiss="'merchant.account.edit'" v-throttle type="primary" text @click="handleDelete(row)">{{$t('删除')}}
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </template>
    </div>
</template>

<script setup>
import { reactive, onMounted, inject, defineEmits, defineExpose, computed } from 'vue'
import userStore from '@/store/user'
import { ElMessageBox } from 'element-plus'
import { getBankOfflineWallet } from '@/api/finance'
import { getWithdrawAccount, deleteWithdrawAccount } from '@/api/member'

const emits = defineEmits(['showDialog'])
const provideData = inject('provideData')
const state = reactive({
    configData: {},
    metaData: {},
    operateDialogShow: false,
    itemData: {},
    cashAccountSubtype: [],
    payScopeList: []
})
const userData = userStore()


onMounted(() => {
    getTableData()
})

const isInr = computed(() => {
    return userData.merchantInfo.country === 'IN'
})

// 获取表格数据
const getTableData = () => {
    provideData.showLoading()
    getWithdrawAccount({ userId: provideData.memberId, merchantId: provideData.merchantId }).then(({ data = {}, ext = {} }) => {
        state.configData = data
        state.metaData = ext
        provideData.hideLoading()
    }).catch(err => {
        provideData.hideLoading()
    })
}

// 按钮操作
const handleDelete = ({ id }) => {
    ElMessageBox.confirm($t('确定要删除此提现账户配置吗？'), $t('提示'), {
        type: 'warning'
    }).then(() => {
        provideData.showLoading()
        deleteWithdrawAccount({ id, merchantId: provideData.merchantId }).then(res => {
            getTableData()
        }).catch(err => {
            provideData.hideLoading()
        })
    }).catch(() => { })
}

const convertType = (data) => {
    if (!data) return []
    let arr = []
    for (let key in data) {
        arr.push({
            "checked": true,
            "label": data[key],
            "required": false,
            "value": key
        })
    }
    return arr
}
// 按钮操作
const handleConfig = async (data, key) => {
    if ((userData.merchantInfo.country === 'AR' || userData.merchantInfo.country === 'CO') && key === 'BANK') {
        data.cashAccountSubtype = convertType(state.metaData?.BANK?.allowAdd[0]?.bankCodes)
        data.fixSubtype = state.metaData[key].allowAdd && state.metaData[key].allowAdd.length ? state.metaData[key].allowAdd[0].value : ''
    } else {
        data.cashAccountSubtype = state.metaData[key].allowAdd || []
    }
    
    if (key === 'BANK_OFF') { await getPayScopeData(); data.payScopeList = state.payScopeList || [] }
    data.channel = state.metaData[key].type
    data.channel_ = key
    emits('showDialog', {
        data,
        key: 'editDialogShow'
    })
}


// 获取支付方式配置
const getPayScopeData = async () => {
    await getBankOfflineWallet().then(res => {
        state.payScopeData = res.data || {}
        if (state.payScopeData.value) {
            state.payScopeList = JSON.parse(state.payScopeData.value)
        }
    })
}

defineExpose({
    'fetchData': getTableData
})
</script>

<style lang="scss">
.withdrawal-account {
    .head {
        width: 100%;
        padding: 0 20px 5px 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 16px;
        font-weight: 600;
        line-height: 40px;
        &-left {
            flex: 1;
        }
    }
}
</style>
