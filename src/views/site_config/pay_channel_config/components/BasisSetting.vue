<template>
    <!-- 站点配置-支付通道配置-基础设置 -->
    <div class="basis-setting">
        <div class="basis-setting-head" v-if="commonData.merchantSiteList.length > 1">
            <span class="form-label">{{$t('当前站点:')}}</span>
            <MerchantSiteSelect style="width: 278px" isNeedDefault :clearable="false" v-model="state.merchantId" @change="getInitData">
            </MerchantSiteSelect>
        </div>
        <div class="basis-setting-main">
            <el-card>
                <template #header>
                    <span class="form-label">{{$t('稽核设置')}}</span>
                </template>
                <el-form ref="auditForm" :model="state.formData" :rules="state.rules" :disabled="!state.isAuditEdit">
                    <el-form-item :label="$t('稽核倍数:')" prop="multiple">
                        <el-input-number style="width: 100%" v-model="state.formData.multiple" :controls="false" :precision="2" :min="0" />
                    </el-form-item>
                </el-form>
                <div class="btn">
                    <el-button v-throttle v-if="state.isAuditEdit" @click="getAuditData(false)">{{$t('取 消')}}</el-button>
                    <el-button v-throttle style="margin-left:30px" type="primary" v-if="state.isAuditEdit" @click="handleSubmit(1)">{{$t('保 存')}}
                    </el-button>
                    <el-button v-throttle type="primary" v-if="!state.isAuditEdit" @click="state.isAuditEdit = true">{{$t('修 改')}}</el-button>
                </div>
                <div class="mt20">{{ $t('说明：') }}</div>
                <div>{{ $t('对会员充值额度进行稽核。') }}</div>
                <div>{{ $t('如配置1倍，会员充值100，则需要稽核打码100可提现。') }}</div>
                <div>{{ $t('注：稽核倍数可区分站点独立配置。') }}</div>
            </el-card>
            <el-card v-if="userData.getTemplateType() !== 4">
                <template #header>
                    <span class="form-label">{{$t('支付类型排序设置')}}</span>
                </template>
                <el-form ref="sortForm" :model="state.tableData" :disabled="!state.isSortEdit" label-width="0">
                    <el-table style="width: 100%" :data="state.tableData" border>
                        <el-table-column :label="$t('支付类型')" align="center">
                            <template #default="{ row}">{{row.label === 'OFFLINE' ? $t('转账支付') : row.label}}</template>
                        </el-table-column>
                        <el-table-column :label="$t('排序修改')" align="center">
                            <template #default="{ row,$index }">
                                <span v-if="row.isSortEdit">{{ row.sort }}</span>
                                <el-form-item v-else :prop="$index + '.sort'" :rules="{ required: true, message: '', trigger: 'blur' }">
                                    <el-input-number style="width: 100%" v-model="row.sort" :controls="false" :precision="0" :min="1" />
                                </el-form-item>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-form>
                <div class="btn">
                    <el-button v-throttle v-if="state.isSortEdit" @click="getSortData(false)">{{$t('取 消')}}</el-button>
                    <el-button v-throttle style="margin-left:30px" type="primary" v-if="state.isSortEdit" @click="handleSubmit(2)">{{$t('保 存')}}
                    </el-button>
                    <el-button v-throttle type="primary" v-if="!state.isSortEdit" @click="state.isSortEdit = true">{{$t('修 改')}}</el-button>
                </div>
            </el-card>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import userStore from '@/store/user'
import commonStore from '@/store/common'
import { getAuditMultiplierList, editAuditMultiplier, getPayWalletSort } from '@/api/finance'
import { postMetaData } from "@/api/common"

const state = reactive({
    merchantId: '',
    isAuditEdit: false,
    isSortEdit: false,
    formData: {
        multiple: 0
    },
    rules: {
        multiple: { required: true, message: $t('请输入稽核倍数！'), trigger: 'blur' },
    },
    tableData: [],
    ext: {}
})
const auditForm = ref(null)
const sortForm = ref(null)
const userData = userStore()
const commonData = commonStore()

onMounted(() => {
    getInitData()
})

const getInitData = () => {
    globalVBus.$emit('globalLoading', true)
    Promise.all([getAuditData(), getSortData()]).then(() => {
        setTimeout(() => {
            globalVBus.$emit('globalLoading', false)
        }, 300)
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}

const getAuditData = (isInit = true) => {
    auditForm.value.resetFields()
    !isInit && globalVBus.$emit('globalLoading', true)
    getAuditMultiplierList({ type: 1, merchantId: state.merchantId }).then(res => {
        state.formData.multiple = res.data[0].multiple
        state.isAuditEdit = false
        !isInit && globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        !isInit && globalVBus.$emit('globalLoading', false)
    })
}

const getSortData = (isInit = true) => {
    if (userData.getTemplateType() === 4) return
    state.tableData = []
    !isInit && globalVBus.$emit('globalLoading', true)
    getPayWalletSort({ tab: 1, merchantId: state.merchantId }).then(({ data, ext = {} }) => {
        state.tableData = data || []
        state.ext = { ...ext }
        state.isSortEdit = false
        !isInit && globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        !isInit && globalVBus.$emit('globalLoading', false)
    })
}

const handleSubmit = (val) => {
    let el = val === 1 ? auditForm.value : sortForm.value
    el.validate((valid, fields) => {
        if (valid) {
            globalVBus.$emit('globalLoading', true)
            let params = {}
            let api = editAuditMultiplier
            if (val === 1) {
                params = {
                    type: 1,
                    multiple: state.formData.multiple,
                    merchantId: state.merchantId
                }
            } else {
                api = postMetaData
                params = {
                    ...state.ext,
                    value: JSON.stringify(state.tableData),
                    merchantId: state.merchantId
                }
            }
            api(params).then(res => {
                if (val === 1) {
                    state.isAuditEdit = false
                    getAuditData(false)
                } else {
                    state.isSortEdit = false
                    getSortData(false)
                }
            }).catch(() => {
                globalVBus.$emit('globalLoading', false)
            })
        } else {
            ElMessage.warning($t('请完善表单内容再进行提交！'))
        }
    })
}
</script>

<style lang="scss">
.basis-setting {
    &-main {
        display: flex;
        .el-card + .el-card {
            margin-left: 20px;
        }
        .el-card:nth-of-type(1) {
            width: 350px;
        }
        .el-card:nth-of-type(2) {
            width: 400px;
        }
    }
    &-head {
        margin-bottom: 10px;
    }
    .btn {
        margin-top: 30px;
        width: 100%;
        display: flex;
        justify-content: center;
    }
}
</style>