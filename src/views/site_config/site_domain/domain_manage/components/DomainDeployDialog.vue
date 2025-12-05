<template>
    <!-- 站点域名-域名管理-前台域名管理/后台域名管理-新增 -->
    <Dialog ref="dialog" width="700" :title="$t('新增') + (props.asBack ? (props.asBack === 1 ? $t('后台域名') : $t('推广域名')) : $t('前台域名'))" top="10vh"
        @confirm="handleSubmit(deployFormRef)" @cancel="cancel">
        <el-form class="domain-deploy" ref="deployFormRef" :model="state.formData" :rules="state.rules"
            :label-width="$locale == 'zh' ? '85px' : 'auto'">
            <el-form-item :label="$t('CDN节点:')" prop="provider">
                <el-radio-group v-model="state.formData.provider">
                    <el-radio v-for="item in metaData.dnsProvider" :key="item.value" :label="+item.value">{{item.label}}
                    </el-radio>
                </el-radio-group>
            </el-form-item>
            <!-- <el-form-item :label="$t('使用站点:')" v-if="commonData.merchantSiteList.length > 1" prop="merchantId">
                <MerchantSiteSelect v-model="state.formData.merchantId"></MerchantSiteSelect>
            </el-form-item> -->
            <!-- <el-form-item :label="$t('证书类型:')" prop="type">
                <el-radio-group v-model="state.formData.type">
                    <el-radio v-for="item in metaData.balanceAdjustType" :key="item.value" :label="+item.value">{{item.label}}
                    </el-radio>
                </el-radio-group>
            </el-form-item> -->
            <el-form-item :label="$t('主域名:')" prop="names">
                <el-input style="width: 100%" type="textarea" :rows="6" :placeholder="$t('支持批量添加，最多20个，多个域名请换行')" v-model="state.formData.names" />
                <span class="tips">{{$t('温馨提示：只支持顶级域名，请勿添加子域名。')}}</span>
            </el-form-item>
            <div class="title">{{$t('费用说明:')}}</div>
            <div class="text">{{$t('域名解析：前30个域名免费（含子域名），超出部分额外收取5USDT/条解析/月;')}}</div>
            <div class="text">{{$t('流量：每月前500G免费，超出部分额外收取0.3USDT/G/月;')}}</div>
            <!-- <div class="text">{{$t('节点：免费提供3个节点，超出部分额外收取300USDT/节点/月，每个节点都是独立云，都能扛攻击，建议均匀分配。')}}</div> -->
        </el-form>
    </Dialog>
</template>

<script setup>
import { postDomainData } from '@/api/app_and_domain_manage'
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import commonStore from '@/store/common'

const emits = defineEmits(['close', 'fetchData'])
const props = defineProps({
    // itemData: {
    //     type: Object,
    //     default: () => {
    //         return {}
    //     }
    // },
    metaData: {
        type: Object,
        default: () => {
            return {}
        }
    },
    asBack: {
        type: Number,
        default: 0
    },
})
const state = reactive({
    title: $t('新增'),
    formData: {},
    rules: {
        provider: [{ required: true, message: $t('请选择CDN节点！'), trigger: 'change' }],
        merchantId: [{ required: true, message: $t('请选择使用站点！'), trigger: 'change' }],
        // type: [{ required: true, message: $t('请选择证书类型！'), trigger: 'change' }],
        names: [{ required: true, message: $t('请输入主域名！'), trigger: 'blur' }],
    }
})
const deployFormRef = ref(null)
const dialog = ref(null)
const commonData = commonStore()

onMounted(() => {
    // if (props.itemData.id) {
    //     state.formData = { ...props.itemData }
    //     state.title = $t('修改')
    // }
})

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            state.formData.asBack = props.asBack
            if (commonData.merchantSiteList.length <= 1) state.formData.merchantId = commonData.merchantSiteList[0].id
            dialog.value.showLoading()
            postDomainData(state.formData).then(() => {
                cancel()
                emits('fetchData', {})
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
.domain-deploy {
    .title {
        color: #666;
    }
    .text {
        padding-left: 10px;
        color: #999;
    }
}
</style>
