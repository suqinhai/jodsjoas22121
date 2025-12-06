<template>
    <!-- 模版仓库-模版设置 -->
    <div class="templates-page">
        <div class="templates-page">
            <div class="head">{{$t('主题模版')}}
                <div class="but-box">
                    <el-button v-throttle type="primary" v-if="state.isDisabled" @click="state.isDisabled = false">{{$t('编 辑')}}</el-button>
                    <el-button v-throttle type="primary" v-if="!state.isDisabled" @click="getData">{{$t('取 消')}}</el-button>
                    <el-button v-throttle type="primary" v-if="!state.isDisabled" @click="handleSave(deployForm)">{{$t('保 存')}}</el-button>
                </div>
            </div>
            <div class="tips" v-if="state.showList[4]">{{$t('注：C版主题模版只能在创建子站点时选择使用，且选择使用后无法再切换回普通主题模版！')}}</div>
            <el-tabs v-model="state.tabItem" @tab-click="tabClick">
                <el-tab-pane v-for="item in Object.keys(state.showList)" :key="item"
                    :label="getTabText(item) + (+item === state.templateConfig.type ? $t('（已选择）') : '')" :name="+item">
                </el-tab-pane>
            </el-tabs>
            <div class="skin-box">
                <div class="skin-box-small" v-for="item in showData" :key="item.value">
                    <div class="skin-imgs">
                        <img :src="getImageUrl(item.image)" alt="">
                    </div>
                    <div class="skin-name">
                        {{item.title}}
                        <el-button v-if="isCanCheck" style="margin-left: 10px" v-throttle
                            :type="state.templateConfig.color === item.value ? 'primary' : ''" :disabled="state.isDisabled"
                            @click="setStyle(item.value)">
                            {{state.templateConfig.color === item.value ? $t('已选择'): $t('选 择')}}</el-button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup name="templates">
import { reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import userStore from '@/store/user'
import { getHomeDeploy, postHomeDeploy, getTemplateList } from '@/api/website'
import { getCommonMeta } from '@/api/common'
import { TEMPLATE_STYLE_DATA } from '@/common/util/appConfig'

let appointStyle = {
    // 1: 33
}
const state = reactive({
    tabItem: 1,
    templateId: '',
    templateConfig: {
        type: 1,
        color: ''
    },
    isDisabled: true,
    showList: {},
    templateType: [],
    oldTemplateType: ''
})
const userData = userStore()

const showData = computed(() => {
    return state.showList[state.tabItem] || []
    // let arr = state.showList[state.tabItem] || []
    // arr = arr.filter((item) => item.show)
    // return !userData.merchantInfo.canAllTemplate && appointStyle[state.tabItem] ? arr.filter(item => item.value <= appointStyle[state.tabItem]) : arr
})
const isCanCheck = computed(() => {
    let arr = state.tabItem === 4 ? [4] : [1, 2, 3, 5]
    return arr.includes(state.templateId)
})

onMounted(async () => {
    let { data } = await getCommonMeta({ types: 'templateType' })
    state.templateType = data?.templateType || []
    getData()
    getList()
})

const getList = () => {
    globalVBus.$emit('globalLoading', true)
    getTemplateList().then(({ data }) => {
        state.showList = []
        let arr = data || []
        arr = arr.filter(item => item.type && item.colors.length)
        arr.forEach(ims => {
            state.showList[ims.type] = []
            ims.colors.forEach(its => {
                let sameColor = TEMPLATE_STYLE_DATA[ims.type].find(it => +it.value === +its)
                if (sameColor) state.showList[ims.type].push(sameColor)
            })
        })
        globalVBus.$emit('globalLoading', false)
    })
}

const getData = () => {
    globalVBus.$emit('globalLoading', true)
    getHomeDeploy({ part: 'template' }).then(({ data }) => {
        if (data && data.type) {
            state.templateConfig = { ...data }
            state.templateId = data.type
            state.oldTemplateType = data.type
        }
        state.tabItem = state.templateId || 1
        state.isDisabled = true
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}

const getImageUrl = (icon) => {
    return new URL(`../../../../assets/img/template/${icon}.png`, import.meta.url).href
}

const getTabText = (val) => {
    return state.templateType.find(item => +item.value === +val)?.label || ''
}

const tabClick = ({ props }) => {
    state.tabItem = props.name
    if (!state.templateId) {
        state.templateConfig.type = state.tabItem
    }
}

const setStyle = (val) => {
    if (state.templateConfig.color === val) return
    state.templateConfig.color = val
    state.templateConfig.type = state.tabItem
}

const handleSave = () => {
    if (!state.templateConfig.type || !state.templateConfig.color) return ElMessage.warning($t('请选择模版和颜色后再进行操作！'))
    globalVBus.$emit('globalLoading', true)
    let params = {
        part: 'template',
        alias: state.templateConfig.type,
        status: 1,
        templateConfig: JSON.stringify(state.templateConfig)
    }
    if(state.oldTemplateType !== state.templateConfig.type && (state.oldTemplateType === 5 || state.templateConfig.type === 5)  ){
        confirmChange(params)
    }else{
        handleSubmit(params)
    }
}
const handleSubmit = (params) => {
    postHomeDeploy(params).then(() => {
        userData.initGetTemplateConfig()
        getData()
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
    
}

const confirmChange = (params) => {
    ElMessageBox.confirm(
        state.templateConfig.type === 5 ? `<div>
        <p>${$t('当前切换为D样式样式，请注意配置规格图片；')}</p>
        <p>${$t('优惠活动列表-活动宣传图片（656*176或等比例，png、JPG、gif格式）')}</p>
        <p>${$t('宣传管理-大厅banner图片（650*285或等比例，png、JPG、gif格式）')}</p>
        </div>` : `<div>
        <p>${$t('当前切换为欧美、亚太样式，请注意配置规格图片；')}</p>
        <p>${$t('优惠活动列表-活动宣传图片（710*320或等比例，png、JPG、gif格式）')}</p>
        <p>${$t('宣传管理-大厅banner图片（1020*300或等比例，png、JPG、gif格式）')}</p>
        </div>`,
        $t('提示'), {
        confirmButtonText: $t('确 定'),
        cancelButtonText: $t('取消'),
        showClose: true,
        type: 'warning',
        dangerouslyUseHTMLString: true,
        customClass: 'custom-confirm-width',
    }).then(() => {
        globalVBus.$emit('globalLoading', true)
        handleSubmit(params)
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}


</script>
<style>
.custom-confirm-width {
    max-width: 530px !important;
}
</style>

<style lang="scss" scoped>

.templates-page {
    min-width: 900px;
    height: calc(100% - 60px);
    display: flex;
    flex-direction: column;
    flex-shrink: 1;

    .head {
        line-height: 30px;
        font-size: 20px;
        font-weight: 600;
    }
    .tips {
        margin-top: 10px;
        color: red;
    }
    .skin-box {
        flex: 1;
        display: flex;
        flex-wrap: wrap;
        overflow-y: auto;

        &-small {
            width: 240px;
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-right: 30px;
            margin-bottom: 30px;

            .skin-imgs {
                width: 240px;
                height: 480px;
                display: flex;
                justify-content: center;
                align-items: center;
                img {
                    width: 240px;
                    height: 480px;
                }
            }
            .skin-name {
                display: flex;
                justify-content: center;
                align-items: center;
                margin-top: 10px;
                width: 100%;
                font-size: 15px;
                color: #666;
                height: 32px;
                line-height: 32px;
                font-weight: 600;
                white-space: nowrap;
            }
        }
    }
    .but-box {
        display: inline-block;
        margin-left: 20px;
    }
}
</style>
