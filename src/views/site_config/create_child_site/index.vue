<template>
    <!-- 站点配置-子站点创建 -->
    <div class="container create-child-site">
        <div class="head">{{$t('创建子站点')}}</div>
        <el-form ref="deployRef" :model="state.formData" label-width="240px" :rules="state.rules">
            <el-form-item label="">
                <el-radio-group v-model="state.formData.quickSite">
                    <el-radio :value="0" :label="0">{{$t('创建新站点')}}</el-radio>
                    <el-radio :value="1" :label="1">{{$t('一键开站')}}</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item :label="$t('站点名称:')" prop="name">
                <el-input style="width: 300px" v-model="state.formData.name" maxlength="20" show-word-limit :placeholder="$t('请输入站点名称')" />
            </el-form-item>
            <el-form-item label="站点模版选择:" v-if="state.formData.quickSite === 1" prop="orgMerchantId">
                <MerchantSiteSelect :clearable="false" v-model="state.formData.orgMerchantId" :placeholder="$t('请选择站点模版')">
                </MerchantSiteSelect>
            </el-form-item>
            <el-form-item :label="$t('经销商模式') + ':'" v-if="showDealer">
                <!-- <el-switch v-model="state.formData.dealerType" :active-text="$t('开启(首充模式)')" :inactive-text="$t('关闭')" /> -->
                <el-switch v-model="state.formData.dealerType" :active-text="$t('开启')" :inactive-text="$t('关闭')" />
            </el-form-item>
            <el-form-item :label="$t('前端风格模版:')" v-if="state.formData.quickSite === 0">
                <el-radio-group v-model="state.formData.templateConfig.type">
                    <div class="radio-box" v-for="item in state.templateList" :key="item.type">
                        <el-radio :value="item.type" :label="item.type">{{getTabText(item.type)}}
                        </el-radio>
                        <el-button style="margin-left: -8px;" v-throttle type="primary" text @click="handlePreview(item.type)">{{$t('预览')}}
                        </el-button>
                    </div>
                </el-radio-group>
            </el-form-item>
        </el-form>

        <el-button class="btn" v-throttle type="primary" @click="handleSave(deployRef)">{{$t('生成新站点')}}</el-button>

        <div v-if="state.showStylePreview" class="preview" @click="state.showStylePreview = false">
            <div class="preview-box">
                <img class="preview-img" :src="state.previewImageUrl" alt="">
            </div>
        </div>
    </div>
</template>

<script setup name="createChildSite">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import userStore from '@/store/user'
import commonStore from '@/store/common'
import { getTemplateList, postAddSite } from '@/api/website'
import { getCommonMeta } from '@/api/common'
import { TEMPLATE_STYLE_DATA } from '@/common/util/appConfig'

const state = reactive({
    formData: {
        quickSite: 0,
        dealerType: true,
        templateConfig: {}
    },
    rules: {
        name: { required: true, message: $t('必填项不能为空！'), trigger: "blur" },
        orgMerchantId: { required: true, message: $t('必选项不能为空！'), trigger: "change" },
    },
    showStylePreview: false,
    previewImageUrl: '',
    templateList: [],
    templateType: [],
})
const deployRef = ref(null)
const userData = userStore()
const commonData = commonStore()
const router = useRouter()

const showDealer = computed(() => {
    let { quickSite, templateConfig = {}, orgMerchantId } = state.formData
    let obj = commonData.merchantSiteList.find(item => item.id === orgMerchantId)
    return (quickSite === 0 && templateConfig.type !== 4) || (quickSite === 1 && obj && !obj.custom)
})

onMounted(async () => {
    try {
        globalVBus.$emit('globalLoading', true)
        let { data } = await getCommonMeta({ types: 'templateType' })
        state.templateType = data?.templateType || []
        let res = await getTemplateList()
        state.templateList = res.data.filter(item => item.type && item.colors.length)
        state.templateList.forEach(item => {
            if (item.colors[0] === 0) {
                item.colors = TEMPLATE_STYLE_DATA[item.type].map(its => its.value)
            }
        })
        state.formData.templateConfig.type = state.templateList[0].type
        globalVBus.$emit('globalLoading', false)
    } catch (error) {
        globalVBus.$emit('globalLoading', false)
    }
})

const getTabText = (val) => {
    return state.templateType.find(item => +item.value === +val)?.label || ''
}

const handlePreview = (val) => {
    let iconValue = state.templateList.find(item => item.type === val)?.colors[0] || ''
    let url = TEMPLATE_STYLE_DATA[val].find(item => item.value === iconValue)?.image || ''
    state.previewImageUrl = new URL(`../../../assets/img/template/${url}.png`, import.meta.url).href
    state.showStylePreview = true
}

const handleSave = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            const { name, orgMerchantId, quickSite, dealerType, templateConfig } = state.formData
            let params = {
                name,
                agentMode: 1,
                quickSite
            }
            if (quickSite === 1) {
                params.orgMerchantId = orgMerchantId
            } else {
                templateConfig.color = state.templateList.find(item => item.type === templateConfig.type)?.colors[0] || ''
                params.templateConfig = JSON.stringify(templateConfig)
            }
            if (dealerType && templateConfig.type !== 4) params.dealerMode = 3
            let text = state.templateList.some(item => item.type === 4) && !quickSite ? $t('普通皮肤模版与定制版前端风格模版无法切换使用，确定使用当前前端风格模版创建子站点吗？') : $t('确定已当前选中的配置创建子站点吗？')
            ElMessageBox.confirm(text, $t('提示')).then(() => {
                globalVBus.$emit('globalLoading', true)
                postAddSite(params).then(() => {
                    Promise.all([commonData.getMerchantSiteData(), userData.getMerchantDetail()]).then(() => {
                        globalVBus.$emit('globalLoading', false)
                        ElMessageBox.alert(`<div style='color: #555;text-align: left;'><div style='font-size: 16px;font-weight: 600;'>${$t('恭喜您又有新站建立，快去配置站点吧')}</div><div>${$t('您的站点名称：') + name}</div></div>`, {
                            confirmButtonText: $t('知道了'),
                            dangerouslyUseHTMLString: true,
                            'show-close': false,
                            center: true,
                            callback: () => {
                                state.formData = {
                                    quickSite: 0,
                                    dealerType: true,
                                    templateConfig: {
                                        type: state.templateList[0].type
                                    }
                                }
                                router.push('/site-config/child-site-config')
                            },
                        })
                    }).catch(() => {
                        globalVBus.$emit('globalLoading', false)
                    })
                }).catch(() => {
                    globalVBus.$emit('globalLoading', false)
                })
            }).catch(() => { })
        } else {
            ElMessage.warning($t('请完善表单内容再进行提交！'))
        }
    })
}
</script>

<style lang="scss" scoped>
.create-child-site {
    .head {
        font-size: 20px;
        font-weight: 700;
        margin-bottom: 40px;
    }
    .btn {
        width: fit-content;
        margin: 50px 0 40px 300px;
    }
    .radio-box {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
}
</style>
