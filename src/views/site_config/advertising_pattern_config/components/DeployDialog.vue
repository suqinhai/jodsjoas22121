<template>
    <!-- 站点配置-广告埋点配置-埋点配置-新增/编辑 -->
    <Dialog ref="dialog" width="580" :title="state.title" buttonCenter top="10vh" @confirm="handleSubmit(operateForm)" @cancel="cancel">
        <el-form ref="operateForm" :rules="state.rules" :model="state.formData" :label-width="$locale == 'zh' ? '135px' : 'auto'">
            <el-form-item :label="$t('选择站点:')" v-if="commonData.merchantSiteList.length > 1">
                <MerchantSiteSelect :disabled="!!itemData.id" style="width: 100%" :clearable="false" v-model="state.formData.merchantId"
                    @change="getDomainData">
                </MerchantSiteSelect>
            </el-form-item>
            <el-form-item :label="$t('渠道名称:')" prop="name">
                <el-input v-model="state.formData.name" :placeholder="$t('请输入渠道名称')" />
            </el-form-item>
            <el-form-item :label="$t('WEB大厅域名:')" prop="domain">
                <el-select style="width: 100%" v-model="state.formData.domain" :placeholder="$t('请选择WEB大厅域名')">
                    <el-option v-for="item in state.domainDnsList" :key="item.value" :label="item.label" :value="item.label" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('投放渠道:')" prop="pattern"
                :rules="[{ required: state.formData.trackerToken, message: $t('请选择投放渠道！'), trigger: 'change' }]">
                <el-select style="width: 100%" v-model="state.formData.pattern" clearable :placeholder="$t('请选择投放渠道')">
                    <el-option v-for="item in channelPattern" :key="item.value" :label="item.label" :value="+item.value" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('投放应用类型:')" prop="launchAppType" v-if="state.formData.pattern === 6">

                <el-select style="width: 100%" v-model="state.formData.launchAppType" :placeholder="$t('请选择投放应用类型')" @change="handleLaunchAppTypeChange">
                    <el-option v-for="item in state.launchTypeList" :key="item.value" :label="item.label" :value="item.value" />

                </el-select>
            </el-form-item>
           
            <el-form-item :label="$t('投放应用标识:')" prop="apiConfigId" v-if="state.formData.pattern === 6">
                <el-select style="width: 100%" v-model="state.formData.apiConfigId" :placeholder="$t('请选择投放应用标识')">
                    <template v-if="state.formData.launchAppType === 0">
                        <el-option v-for="item in H5List" :key="item.id" :label="item.name + ' (' + item.remark + ')'" :value="item.id">
                            <template #default>
                                <span style="display: inline-block; width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                    {{ item.name + ' (' + item.remark + ')' }}
                                </span>
                            </template>
                        </el-option>
                    </template>
                    <template v-if="state.formData.launchAppType === 1">
                        <el-option v-for="item in appList" :key="item.id" :label="item.name + ' (' + item.remark + ')'" :value="item.id">
                            <template #default>
                                <span style="display: inline-block; width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                    {{ item.name + ' (' + item.remark + ')' }}
                                </span>
                            </template>
                        </el-option>
                    </template>
                </el-select>
            </el-form-item>
            <el-form-item :label="state.formData.pattern === 7?$t('投放应用ID'):$t('投放渠道像素:')"  prop="trackerToken"
                :rules="[{ required: !!state.formData.pattern, message: state.formData.pattern === 7?$t('请输入投放应用ID！'):$t('请输入投放渠道像素！'), trigger: 'blur' }]" v-if="![6,8].includes(state.formData.pattern)">
                <el-input v-model="state.formData.trackerToken" :placeholder="state.formData.pattern === 7?$t('请输入投放应用ID！'):$t('请输入投放渠道像素')" />
            </el-form-item>
            <el-form-item :label="$t('投放渠道token:')" v-if="state.formData.pattern === 0">
                <el-input v-model="state.formData.accessToken" type="textarea" :autosize="{ minRows: 3, maxRows: 10 }"
                    :placeholder="$t('请输入投放渠道token')" />
            </el-form-item>
            <el-form-item :label="$t('强制绑定代理账号:')">
                <el-input v-model="state.formData.agentUsername" :placeholder="$t('请输入强制绑定代理账号')" />
            </el-form-item>
        </el-form>
        <div class="deploy-tips">
            <div>{{$t('1、需自行拼接参数说明：')}}</div>
            <div>Facebook: &fb dynamic pixel=aaaaaaaa</div>
            <div>Kwai: &kwaiPixelBaseCode=aaaaaaaa</div>
            <div>Okspin: &oksld=aaaaaaaa</div>
            <div>{{$t('2、Kwai在测试API事件时在链接后面手动拼上&clickid=测试事件页面自动生成的click_id(例子:&click_id=77JJSHFKtjnljqhl8HWHH);')}}</div>
            <div>{{$t('3、Okspin投放渠道像素新增的时候可以先随便填写一个，等Okspin后台添加APP生成像素后再修改成正确的像素，然后再把渠道链接提供給Okspin客服，把Okspin后台添加的APP的链接修改为最终的渠道链接。')}}</div>
            <div>{{$t('4、Adjust请先到Adjust配置页面新增配置，如果是打包APP外跳H5时，必须传s2s参数，Android必传ggAdid，iOS必传idfa和adid，具体参考Adjust官方文档。')}}</div>
        </div>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import commonStore from '@/store/common'
import { postChannelData, getAdjustDetail } from '@/api/data_center.js'
import { getDomainDnsConfig } from '@/api/common'

const emits = defineEmits(['fetchData', 'close'])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        }
    },
    channelPattern: {
        type: Array,
        default: () => [],
    },
})
const state = reactive({
    title: $t('新增'),
    launchQuery: {
        _page: 1,
        _size: 1000,
        merchantId: ''
    },
    launchSignList: [],
    launchTypeList: [
        {
            label: 'H5',
            value: 0,
        },
        {
            label: 'APP',
            value: 1,
        }
    ],
    formData: {
        merchantId: '',
        name: '',
        domain: '',
        pattern: '',
        launchAppType: '',
        apiConfigId: '',
        client: 'WAP',
        type: 0,
        position: 0,  
    },
    rules: {
        name: [{ required: true, message: $t('请输入渠道名称！'), trigger: 'blur' }],
        domain: [{ required: true, message: $t('请选择WEB大厅域名！'), trigger: 'change' }],
    },
    domainDnsList: []
})
const commonData = commonStore()
const dialog = ref(null)
const operateForm = ref(null)

onMounted( async () => {

    if (props.itemData.id) {
        let { name = '', agentUsername = '', domain = '', pattern = '', accessToken = '', trackerToken = '', id, type = 0, position = 0, merchant, apiConfigId = '' } = props.itemData
        state.formData = { name, agentUsername, domain, pattern, trackerToken, accessToken, id, type, position, client: 'WAP', merchantId: merchant.id, apiConfigId }
        state.title = $t('修改')
        await getlaunchSign()
        await handleTypeChange(apiConfigId)
        
    } else {
        state.formData.merchantId = commonData.merchantSiteList[0]?.id || ''
    }
    getDomainData(state.formData.merchantId, true)
})
const handleTypeChange = async(val) => {
    if (val) {
        let item = state.launchSignList.find(item => item.id === val)
        if (item) {
            state.formData.launchAppType = item.type
        }
    }
}


const getDomainData = (merchantId, isinit = false) => {
    !isinit && (state.formData.domain = '')
    state.domainDnsList = []
    dialog.value.showLoading()
    getDomainDnsConfig({ forBack: 0, position: 0, merchantId }).then(res => {
    state.domainDnsList = res.data || []
    dialog.value.closeLoading()
    }).catch(err => {
    state.domainDnsList = []
    dialog.value.closeLoading()
    })
}
const handleLaunchAppTypeChange = (val) => {
     state.formData.apiConfigId = ''
     getlaunchSign()
}

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            state.formData.downloadTip = 0
            dialog.value.showLoading()
            postChannelData(state.formData).then(() => {
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
const H5List = computed(() => {
    return state.launchSignList.filter(item => item.type === 0)
})
const appList = computed(() => {
    return state.launchSignList.filter(item => item.type === 1)
})
const getlaunchSign = async () => {
    state.launchQuery.merchantId = state.formData.merchantId
    let params = { ...state.launchQuery }
    globalVBus.$emit('globalLoading', true)
    try {
        const res = await getAdjustDetail(params)
        state.launchSignList = res?.data || []
        globalVBus.$emit('globalLoading', false)
        return res
    } catch (err) {
        state.launchSignList = []
        globalVBus.$emit('globalLoading', false)
        throw err
    }
}

</script>

<style scoped lang="scss">
.deploy-tips {
    color: red;
    line-height: 24px;

}
</style>
