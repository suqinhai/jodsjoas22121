<template>
    <!-- 推广域名管理-新增 -->
    <Dialog ref="dialog" :width="$locale == 'zh' ? 538 : 700" :title="$t('新增')" buttonCenter top="15vh" @confirm="handleSubmit(operateForm)" @cancel="cancel">
        <el-form class="promoted-domain-deploy" ref="operateForm" :rules="state.rules" :model="state.formData" :label-width="$locale == 'zh' ? '85px' : 'auto'">
            <!-- <el-form-item :label="$t('域类型') + ':'" prop="type">
                <el-select style="width: 100%" v-model="state.formData.type" :placeholder="$t('请选择域类型')" @change="state.formData.targetUrl = ''">
                    <el-option v-for="item in metaData.marketingDomainType" :key="item.value" :label="item.label" :value="+item.value" />
                </el-select>
            </el-form-item> -->
            <el-form-item :label="$t('推广域名') + ':'" prop="domain">
                <div class="row-box">
                <el-select style="flex: 1;margin-right: 10px" v-model="state.formData.domain" :placeholder="$t('请选择推广域名')">
                    <el-option v-for="item in metaData.promotedDomainList" :key="item.id" :label="item.name" :value="item.name" />
                </el-select>
                <el-button v-throttle type="primary" @click="handleGo">{{$t('前往配置')}}</el-button>
                </div>
            </el-form-item>
            <el-form-item :label="$t('使用者') + ':'" prop="agentId">
                <el-input style="width: 274px" @input="(val) => state.formData.agentId = val.replace(/\D/g,'')" v-model="state.formData.agentId"
                     :placeholder="$t('请输入要绑定的代理ID')" />
            </el-form-item>
            <el-form-item :label="$t('备注：')" prop="name">
                <el-input v-model="state.formData.remark" type="textarea" :placeholder="$t('输入备注')" :rows="4" show-word-limit maxlength="100"></el-input>
            </el-form-item>
            <!-- <el-form-item v-if="state.formData.type === 0" :label="$t('指向') + ':'" prop="targetUrl" :rules="{ required: true, message: $t('请选择渠道链接')  + '！', trigger: 'change' }">
                <el-select style="width: 100%" v-model="state.formData.targetUrl" :placeholder="$t('请选择渠道链接')">
                    <el-option v-for="item in metaData.channelLinkList" :key="item.channelId" :label="item.targetUrl" :value="item.targetUrl" />
                </el-select>
            </el-form-item>
            <el-form-item v-if="state.formData.type === 1" :label="$t('指向') + ':'" prop="targetUrl" :rules="{ required: true, message: $t('请输入指向链接') + '！', trigger: 'blur' }">
                <el-input v-model="state.formData.targetUrl" :placeholder="$t('请输入指向链接')" />
            </el-form-item> -->
        </el-form>
        <!-- <div>{{$t('注：指向为渠道链接(去掉像素编码)，自定义则需商户自己填。')}}</div> -->
    </Dialog>
</template>

<script setup>
import { ref, reactive,onMounted} from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { postMarketingDomainData } from '@/api/data_center.js'

const emits = defineEmits(['fetchData', 'close'])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        }
    },
    metaData: {
        type: Object,
        default: () => {
            return {}
        },
    },
})
const dialog = ref(null)
const operateForm = ref(null)
const state = reactive({
    formData: {},
    rules: {
        // type: { required: true, message: $t('请选择域类型') + '！', trigger: 'change' },
        domain: { required: true, message: $t('请选择推广域名') + '！', trigger: 'blur' },
        agentId: { required: true, message: $t('请输入要绑定的代理ID') + '！', trigger: 'blur' },
    }
})
const router = useRouter()

onMounted(() => {
    state.formData = {...props.itemData}
    state.formData.type = 0
})

const handleGo = () => {
    router.push(`/site-config/site-domain?tab=2&merchantId=${props.itemData.merchantId}` )
    emits('close')
}

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            dialog.value.showLoading()
            postMarketingDomainData(state.formData).then(() => {
                emits('close')
                emits('fetchData')
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

<style scoped lang="scss">
.promoted-domain-deploy {
    .row-box {
        display: flex;
    }
    .deploy-tips {
        color: red;
    }
}
</style>
