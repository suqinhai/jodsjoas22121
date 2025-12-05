<template>
    <!-- 会员返利-基础配置 -->
    <Dialog ref="dialog" width="700" :title="$t('基础配置')" top="8vh" buttonCenter @confirm="handleSubmit(deployFormRef)" @cancel="cancel">
        <el-form ref="deployFormRef" :model="state.formData" :rules="state.rules" :label-width="$locale == 'zh' ? '120px' : 'auto'">
            <el-form-item :label="$t('是否开启:')" prop="enabled">
                <el-switch v-model="state.formData.enabled" />
            </el-form-item>
            <template v-if="userData.getTemplateType() !== 4">
                <el-form-item :label="$t('每日领取次数:')" prop="dailyClaimLimit">
                    <el-input-number v-model="state.formData.dailyClaimLimit" style="width: 200px" :controls="false" :precision="0" :min="0"
                        :placeholder="$t('请输入0-100（填0则不限制）')" />
                </el-form-item>
                <el-form-item :label="$t('最低领取金额:')" prop="dailyClaimMin">
                    <el-input-number v-model="state.formData.dailyClaimMin" style="width: 200px" :controls="false" :precision="2" :min="0"
                        :placeholder="$t('请输入最低领取金额')" />
                </el-form-item>
            </template>
            <el-form-item :label="$t('稽核倍数:')" prop="auditFactor">
                <el-input-number v-model="state.formData.auditFactor" style="width: 200px" :controls="false" :precision="2" :min="0"
                    :placeholder="$t('请输入稽核倍数')" />
            </el-form-item>
            <el-form-item :label="$t('领取方式:')" v-if="userData.getTemplateType() === 4">
                <el-radio-group v-model="state.formData.auto">
                    <el-radio :label="false" :value="false">{{$t('手动领取')}}</el-radio>
                    <el-radio :label="true" :value="true">{{$t('自动发放')}}</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item :label="$t('稽核限定平台:')">
                <el-radio-group v-model="state.formData.nonAudit">
                    <el-radio :label="false">{{$t('不限制')}}</el-radio>
                    <el-radio :label="true">{{$t('指定平台')}}</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item v-if="state.formData.nonAudit" :label-width="$locale == 'zh' ? '50px' : 'auto'">
                <el-tabs type="border-card">
                    <el-tab-pane v-for="item in state.playVendorList" :key="item.type" :label="item.label+`(${item.playVendors.length})`">
                        <div style="width: 100%">
                            <el-checkbox v-model="item.checkAll" :indeterminate="item.isIndeterminate" @change="checkAllVendor(item)">{{$t('全平台')}}
                            </el-checkbox>
                        </div>
                        <el-checkbox-group v-model="item.playVendors" @change="handleCheckVendor(item)">
                            <el-checkbox v-for="(its,index) in item.vendorList" :key="index" :label="its">
                                {{ item.vendorName[index] || '' }}</el-checkbox>
                        </el-checkbox-group>
                    </el-tab-pane>
                </el-tabs>
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import userStore from '@/store/user'
import { postRebateActivityBaseConfig } from '@/api/discounts_center'

const emits = defineEmits(['close'])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        }
    },
    merchantVendorList: {
        type: Array,
        default: () => []
    },
})
const state = reactive({
    formData: {},
    playVendorList: [],
    rules: {
        dailyClaimLimit: [
            { required: true, message: $t('请输入每日领取次数！'), trigger: 'blur' },
            { type: 'number', max: 100, message: $t('最大输入值为100！'), trigger: 'change' },
        ],
        dailyClaimMin: { required: true, message: $t('请输入最低领取金额！'), trigger: 'blur' },
        auditFactor: { required: true, message: $t('请输入稽核倍数！'), trigger: 'blur' },
        enabled: { required: true },
    }
})
const deployFormRef = ref(null)
const dialog = ref(null)
const userData = userStore()

onMounted(() => {
    let { dailyClaimLimit, dailyClaimMin, auditFactor, vendors = [], enabled = false, nonAudit, auto = true } = props.itemData
    state.formData = {
        dailyClaimLimit,
        dailyClaimMin,
        auditFactor,
        nonAudit,
        enabled,
    }
    if (userData.getTemplateType() !== 4) {
        state.formData.dailyClaimLimit = dailyClaimLimit || 0
        state.formData.dailyClaimMin = dailyClaimMin || 0
        state.formData.auto = false
    } else {
        state.formData.auto = auto
    }
    let arr = []
    if (vendors.length) {
        let data
        vendors.forEach(item => {
            data = item.split('-')
            arr.push({
                vendors: data[0],
                type: data[1]
            })
        })
    }
    state.playVendorList = props.merchantVendorList.map(item => {
        let selectList = []
        let sameGameData = arr.filter(its => +item.value === +its.type)
        if (sameGameData.length) {
            selectList = sameGameData.map(its => its.vendors)
        }
        item.checkAll = item.vendorList.length === selectList.length
        item.isIndeterminate = !!selectList.length && item.vendorList.length > selectList.length
        item.playVendors = selectList
        return item
    })
})

const checkAllVendor = (row) => {
    row.playVendors = row.checkAll
        ? [...row.vendorList]
        : [];
    row.isIndeterminate = false
};

const handleCheckVendor = (row) => {
    const checkedCount = row.playVendors.length;
    row.checkAll = checkedCount === row.vendorList.length
    row.isIndeterminate =
        checkedCount > 0 && checkedCount < row.vendorList.length
}

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            let params = { ...state.formData }
            // params.nonAudit = true
            // delete params.vendors
            if (params.nonAudit) {
                let arr = []
                state.playVendorList.forEach((item) => {
                    if (item.playVendors.length) {
                        arr.push(item.playVendors.map(its => its + '-' + item.value))
                    }
                })
                if (!arr.length) {
                    return ElMessage.warning($t('请至少选择一个平台！'))
                }
                params.vendors = arr.join(",")
            } else {
                delete params.vendors
            }
            dialog.value.showLoading()
            postRebateActivityBaseConfig(params).then(() => {
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

<style lang="scss" scoped>
</style>
