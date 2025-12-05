<template>
    <!-- 短信配置 -->
    <div class="sms-config container">
        <div class="head">
            <div class="head-left">
                <span>{{ state.tipsText }}：</span>
                <span>{{ state.customerPhone }}</span>
            </div>
            <div class="head-right">
                <el-button v-permiss="'admin.merchant-sms-config.editRemind'" type="primary" @click="state.showAlertDialog = true">{{$t('余额不足提醒设置')}}
                </el-button>
            </div>
        </div>
        <el-table :data="[state.deployData]" border>
            <el-table-column prop="merchant.id" :label="$t('商户ID')" min-width="120" align="center" />
            <el-table-column prop="merchant.name" :label="$t('商户名称')" min-width="140" align="center" />
            <el-table-column prop="smsVendorName" :label="$t('短信提供商')" min-width="120" align="center" />
            <el-table-column prop="countries" :label="$t('运营地区')" min-width="140" align="center" />
            <el-table-column prop="balance" :label="$t('短信商余额')" min-width="120" align="center" />
            <el-table-column prop="param.username" label="api-key" min-width="120" align="center" />
            <el-table-column prop="param.password" label="secret" min-width="120" align="center" />
            <el-table-column prop="param.appId" label="app-id" min-width="120" align="center" />
            <el-table-column prop="updateTime" :label="$t('更新时间')" min-width="160" align="center">
                <template #default="{ row }">
                    {{ dateFormat(row.updateTime) }}
                </template>
            </el-table-column>
            <el-table-column fixed="right" :label="$t('操作')" width="120" align="center">
                <template #default>
                    <el-button v-permiss="'admin.merchant-sms-config.edit'" type="primary" text @click="state.showEditDialog = true">{{$t('修改')}}
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <AlertSmsDialog @refresh="getList" :remindInfo="state.deployData.remind" @close="state.showAlertDialog = false" v-if="state.showAlertDialog">
        </AlertSmsDialog>
        <EditDSmsDialog @refresh="getList" :merchantInfo="state.deployData" :vendorList="state.vendorList" @close="state.showEditDialog = false"
            v-if="state.showEditDialog">
        </EditDSmsDialog>
    </div>
</template>

<script setup name="smsConfig">
import { reactive, onMounted, defineAsyncComponent } from 'vue'
import userStore from '@/store/user'
import { dateFormat } from '@/common/util'
import { getCommonMeta } from '@/api/common'
import { getSmsConfig, getCustomerList } from '@/api/merchant_center'
const AlertSmsDialog = defineAsyncComponent(() => import('./components/alertDialog.vue'))
const EditDSmsDialog = defineAsyncComponent(() => import('./components/editDialog.vue'))

const state = reactive({
    deployData: {},
    tipsText: '',
    customerPhone: '',
    showAlertDialog: false,
    showEditDialog: false,
    vendorList: []
})
const userData = userStore()

getCommonMeta({ types: 'smsVendor' }).then(({ data = {} }) => {
    state.vendorList = data.smsVendor || []
})

onMounted(() => {
    getList()
    checkTips()
})

const getList = () => {
    globalVBus.$emit('globalLoading', true)
    getSmsConfig({ id: userData.userInfo.merchantId }).then(({ data }) => {
        state.deployData = data || {}
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        state.deployData = {}
        globalVBus.$emit('globalLoading', false)
    })
}

const checkTips = () => {
    getCustomerList().then(res => {
        if (res.code === 0) {
            let list = res.data
            let item = list.find(item => item.type == 2)
            if (item) {
                state.customerPhone = item.phone
                state.tipsText = item.prompt
            }
        }
    })
}

</script>

<style lang='scss'>
.sms-config {
    .head {
        font-size: 16px;
        color: #666;
        line-height: 30px;
        margin-bottom: 10px;
        display: flex;
        justify-content: space-between;
    }
}
</style>
