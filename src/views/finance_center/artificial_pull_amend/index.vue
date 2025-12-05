<template>
    <!-- 财务中心-人工拉回修正 -->
    <div class="container artificial-pull-amend">
        <el-form class="filter-form" inline>
            <el-form-item :label="$t('会员ID:')">
                <el-input @input="(val) => state.userId = val.replace(/\D/g,'')" v-model="state.userId" :placeholder="$t('请输入会员ID')" />
            </el-form-item>
            <el-form-item>
                <el-button v-throttle type="primary" @click="fetchData">{{$t('搜 索')}}</el-button>
            </el-form-item>
        </el-form>
        <div class="tips">{{$t('游戏钱包余额低于1.00时，无法手动拉回。')}}</div>
        <el-table :data="state.tableData" border style="width: 600px">
			<el-table-column prop="merchantId" :label="$t('商户ID')" min-width="100" align="center" />
            <el-table-column prop="vendor" :label="$t('钱包')" min-width="100" align="center" />
            <el-table-column prop="balance" :label="$t('余额')" min-width="120" align="center" />
            <el-table-column :label="$t('操作')" min-width="100" align="center">
                <template #default="{ row }">
                    <el-button v-if="!row.type && row.balance >= 1 && userData.isHasPermiss('merchant.account.transOut')" v-throttle type="primary"
                        text @click="handlePull(row)">{{$t('一键拉回')}}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <div class="mt20" style="max-width: 600px;">{{ $t('说明：该功能用于会员进入游戏异常，导致返回大厅余额丢失（变成0），可输入会员查询会员游戏厂家余额，操作一键拉回，余额将恢复正常。') }}</div>
        <div>{{ $t('注：会员也可在前端个人中心-找回余额进行操作拉回。') }}</div>
    </div>
</template>

<script setup name="artificialPullAmend">
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
import userStore from '@/store/user'
import { getMemberAccountInfo, postMemberBalancePull } from "@/api/risk_control.js"
import {getMerchantId,} from '@/common/util'
const state = reactive({
    userId: '',
    currentId: '',
    tableData: [],
})
const userData = userStore()

const fetchData = () => {
    if (!state.userId) return ElMessage.warning($t('请输入会员ID再进行搜索'))
    state.currentId = state.userId
	
    globalVBus.$emit('globalLoading', true)
    getMemberAccountInfo({ userId: state.userId, merchantId: getMerchantId() }).then(res => {
        state.tableData = []
        if (res.data && res.data.vendors) {
			res.data.vendors.forEach((item)=>{
				item.merchantId = res.data.merchantId
			})
            state.tableData = [...res.data.vendors]
        }
        state.tableData.unshift({
			merchantId: res.data.merchantId,
            balance: res.data.capital || 0,
            vendor: $t('存钱宝'),
            type: 1,
        })
        state.tableData.unshift({
			merchantId: res.data.merchantId,
            balance: res.data.balance || 0,
            vendor: $t('余额'),
            type: 1,
        })
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

const handlePull = (data) => {
    globalVBus.$emit('globalLoading', true)
    postMemberBalancePull({ userId: state.currentId, vendor: data.vendor, merchantId: data.merchantId }).then(res => {
        fetchData()
    }).catch(err => {
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss">
.artificial-pull-amend {
    .tips {
        margin-top: -10px;
        margin-bottom: 5px;
        color: #666;
    }
}
</style>
