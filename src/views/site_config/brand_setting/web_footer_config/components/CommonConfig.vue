<template>
    <!-- 品牌设置-Web页脚配置-通用配置 -->
    <div class="footer-common-config">
        <el-form :model="state.formData" :disabled="state.isDisabled" label-width="200px">
            <div class="" v-if="userData.getTemplateType() !== 5">
            <el-form-item class="items-head" :label="$t('WEB页脚配置:')">
                <el-switch v-model="state.formData.modules.status" :active-value="1" :inactive-value="0" />
                <el-button v-throttle type="primary" text @click="state.showFooterConfig = !state.showFooterConfig">
                    {{state.showFooterConfig ? $t('收起'):$t('展开')}}</el-button>
            </el-form-item>
            <div class="module-box footer-box" v-show="state.showFooterConfig">
                <div class="footer-col">
                    <el-checkbox v-model="state.checkFunctionAll" :indeterminate="state.functionIndeterminate" @change="checkAllFunction">{{$t('功能')}}
                    </el-checkbox>
                    <el-checkbox-group v-model="state.formData.modules.functions" @change="handleCheckFunction">
                        <el-checkbox v-for="item in FUNCTION_TYPE_LIST" :key="item.value" :label="item.value">
                            {{ item.label}}</el-checkbox>
                    </el-checkbox-group>
                </div>
                <div class="footer-col">
                    <el-checkbox v-model="state.checkGameAll" :indeterminate="state.gameIndeterminate" @change="checkAllGame">{{$t('游戏')}}
                    </el-checkbox>
                    <el-checkbox-group v-model="state.formData.modules.games" @change="handleCheckGame">
                        <el-checkbox v-for="item in GAME_TYPE_LIST" :key="item.value" :label="item.value">
                            {{ item.label}}</el-checkbox>
                    </el-checkbox-group>
                </div>
                <div class="footer-col">
                    <el-checkbox v-model="state.checkSupportAll" :indeterminate="state.supportIndeterminate" @change="checkAllSuppor">{{$t('支持')}}
                    </el-checkbox>
                    <el-checkbox-group v-model="state.formData.modules.supports" @change="handleCheckSuppor">
                        <el-checkbox v-for="item in SUPPORT_TYPE_LIST" :key="item.value" :label="item.value">
                            {{ item.label}}</el-checkbox>
                    </el-checkbox-group>
                </div>
            </div>

            <el-form-item class="items-head" :label="$t('自定义配置:')">
                <el-switch v-model="state.formData.customConfig.status" :active-value="1" :inactive-value="0" />
                <el-button v-throttle type="primary" text @click="state.showCustomConfig = !state.showCustomConfig">
                    {{state.showCustomConfig ? $t('收起'):$t('展开')}}</el-button>
            </el-form-item>
            <div class="partner-box" v-show="state.showCustomConfig">
                <div class="items-row" v-for="(item,index) in state.formData.customConfig.customs" :key="index">
                    <el-form-item>
                        <UploadImage v-model="item.image" :width="120" :height="120" :disabled="state.isDisabled"
                            :tip="$t('请上传120*120或等比例，PNG/JPG/GIF格式小于20KB的图片')" />
                    </el-form-item>
                    <div>
                        <el-input class="row-input" v-model="item.url" :placeholder="$t('请输入跳转路径')" />
                    </div>
                    <el-button v-throttle class="but--active" type="primary" @click="handleAdd(index,'customConfig','customs')" :icon="Plus">
                    </el-button>
                    <el-button v-throttle v-if="state.formData.customConfig.customs.length > 1" type="danger"
                        @click="handleDel(index,'customConfig','customs')" :icon="Minus">
                    </el-button>
                </div>
            </div>

            <el-form-item class="items-head" :label="$t('合作方信息配置:')">
                <el-switch v-model="state.formData.partners.status" :active-value="1" :inactive-value="0" />
                <el-button v-throttle type="primary" text @click="state.showPartnerConfig = !state.showPartnerConfig">
                    {{state.showPartnerConfig ? $t('收起'):$t('展开')}}</el-button>
            </el-form-item>
            <div class="partner-box" v-show="state.showPartnerConfig">
                <div class="items-row" v-for="(item,index) in state.formData.partners.images" :key="index">
                    <el-form-item>
                        <UploadImage v-model="item.icon" :width="464" :height="186" :disabled="state.isDisabled"
                            :tip="$t('请上传464*186或等比例，PNG/JPG/GIF格式小于50KB的图片')" />
                    </el-form-item>
                    <el-button v-throttle class="but--active" type="primary" @click="handleAdd(index,'partners','images')" :icon="Plus">
                    </el-button>
                    <el-button v-throttle v-if="state.formData.partners.images.length > 1" type="danger" @click="handleDel(index,'partners','images')"
                        :icon="Minus">
                    </el-button>
                </div>
            </div>
            </div>

            <el-form-item class="items-head" :label="$t('公司信息:')">
                <el-switch v-model="state.formData.companyInfo.status" :active-value="1" :inactive-value="0" />
                <el-button v-throttle type="primary" text @click="state.showCompanyConfig = !state.showCompanyConfig">
                    {{state.showCompanyConfig ? $t('收起'):$t('展开')}}</el-button>
            </el-form-item>
            <div class="module-box corporation-box" v-show="state.showCompanyConfig">
                <el-form-item :label="$t('公司信息:')">
                    <el-input style="width: 480px" type="textarea" :rows="6" :placeholder="$t('请输入公司信息')" v-model="state.formData.companyInfo.desc" />
                </el-form-item>
            </div>
            <div class="" v-if="userData.getTemplateType() !== 5">
            <el-form-item class="items-head" :label="$t('牌照资质:')">
                <el-switch v-model="state.formData.licenses.status" :active-value="1" :inactive-value="0" />
                <el-button v-throttle type="primary" text @click="state.showLicensesConfig = !state.showLicensesConfig">
                    {{state.showLicensesConfig ? $t('收起'):$t('展开')}}</el-button>
            </el-form-item>
            <div class="certification-box" v-show="state.showLicensesConfig">
                <div class="items-row" v-for="(item,index) in state.formData.licenses.images" :key="index">
                    <el-form-item>
                        <UploadImage v-model="item.icon" :width="300" :height="108" :disabled="state.isDisabled"
                            :tip="$t('请上传300*108或等比例，PNG/JPG/GIF格式小于10KB的图片')" />
                    </el-form-item>
                    <el-button v-throttle class="but--active" type="primary" @click="handleAdd(index,'licenses','images')" :icon="Plus">
                    </el-button>
                    <el-button v-throttle v-if="state.formData.licenses.images.length > 1" type="danger" @click="handleDel(index,'licenses','images')"
                        :icon="Minus">
                    </el-button>
                </div>
            </div>
            </div>


            <el-form-item class="items-head" :label="$t('联系信息:')">
                <el-switch v-model="state.formData.contactInfo.status" :active-value="1" :inactive-value="0" />
                <el-button v-throttle type="primary" text @click="state.showContactConfig = !state.showContactConfig">
                    {{state.showContactConfig ? $t('收起'):$t('展开')}}</el-button>
            </el-form-item>
            <div class="module-box contact-box" v-show="state.showContactConfig">
                <el-form-item :label="$t('版权信息:')">
                    <el-input class="row-input" v-model="state.formData.contactInfo.copyright" :placeholder="$t('请输入版权信息')" />
                </el-form-item>
                <el-form-item :label="$t('联系信息:')">
                    <el-input class="row-input" v-model="state.formData.contactInfo.contact" :placeholder="$t('请输入联系信息')" />
                </el-form-item>
            </div>

        </el-form>
        <div class="btn">
            <el-button v-throttle size="large" v-if="!state.isDisabled" @click="getData">{{$t('取 消')}}</el-button>
            <el-button v-throttle size="large" style="margin-left:30px" type="primary" v-if="!state.isDisabled" @click="handleSave(deployForm)">
                {{$t('保 存')}}</el-button>
            <el-button v-throttle size="large" type="primary" v-if="state.isDisabled" @click="state.isDisabled = false">{{$t('修 改')}}</el-button>
        </div>
    </div>
</template>

<script setup>
import { reactive, onMounted, defineProps } from 'vue'
import { getHomeDeploy, postHomeDeploy } from '@/api/website'
import { Plus, Minus } from "@element-plus/icons-vue";
import { GAME_TYPE_LIST, FUNCTION_TYPE_LIST, SUPPORT_TYPE_LIST } from '@/common/util/appConfig'
import { deepClone } from '@/common/util'
import userStore from '@/store/user'
const userData = userStore()


const props = defineProps({
    metaData: {
        type: Object,
        default: () => {
            return {}
        }
    }
})
const state = reactive({
    formData: {
        modules: {
            status: 0,
            functions: [],
            games: [],
            supports: []
        },
        customConfig: {
            status: 0,
            customs: [{ image: '', url: '' }]
        },
        partners: {
            status: 0,
            images: [{ icon: '' }]
        },
        companyInfo: {
            status: 0,
        },
        licenses: {
            status: 0,
            images: [{ icon: '' }]
        },
        contactInfo: {
            status: 0,
        },
    },
    isDisabled: false,
    checkFunctionAll: false,
    functionIndeterminate: false,
    checkGameAll: false,
    gameIndeterminate: false,
    checkSupportAll: false,
    supportIndeterminate: false,
    showFooterConfig: true,
    showCustomConfig: true,
    showPartnerConfig: true,
    showCompanyConfig: true,
    showLicensesConfig: true,
    showContactConfig: true,
})

onMounted(() => {
    getData()
})

// 获取配置数据
const getData = () => {
    globalVBus.$emit('globalLoading', true)
    getHomeDeploy({ part: 'webFooter' }).then(({ data, code }) => {
        if (code === 0 && data) {
            let arr = Object.keys(state.formData)
            arr.forEach(item => {
                if (data[item] && Object.keys(data[item])) {
                    let { status = 0, copyright = '', contact = '', desc = '', remark = '', contactType = '', customs = [], images = [] } = data[item]
                    switch (item) {
                        case 'partners':
                        case 'licenses':
                            if (images.length) {
                                state.formData[item].images = images.map(its => {
                                    return {
                                        icon: its
                                    }
                                })
                            }
                            break
                        case 'customConfig':
                            if (customs.length) state.formData.customConfig.customs = customs
                            break
                        case 'companyInfo':
                            state.formData.companyInfo.desc = desc
                            break
                        case 'contactInfo':
                            state.formData.contactInfo.copyright = copyright
                            state.formData.contactInfo.contact = contact
                            break
                        case 'modules':
                            let { modules } = data
                            if (modules.funcs) state.formData.modules.functions = modules.funcs.map(item => item.value)
                            if (modules.gameTypes) state.formData.modules.games = modules.gameTypes.map(item => item.value)
                            if (modules.supps) state.formData.modules.supports = modules.supps.map(item => item.value)
                            break
                    }
                    state.formData[item].status = status
                }
            })
            let { modules } = state.formData
            const checkFuncsCount = modules.functions ? modules.functions.length : 0
            state.checkFunctionAll = checkFuncsCount === FUNCTION_TYPE_LIST.length
            state.functionIndeterminate = checkFuncsCount > 0 && checkFuncsCount < FUNCTION_TYPE_LIST.length

            const checkGameCount = modules.games ? modules.games.length : 0
            state.checkGameAll = checkGameCount === GAME_TYPE_LIST.length
            state.gameIndeterminate = checkGameCount > 0 && checkGameCount < GAME_TYPE_LIST.length

            const checkSuppsCount = modules.supports ? modules.supports.length : 0
            state.checkSupportAll = checkSuppsCount === SUPPORT_TYPE_LIST.length
            state.supportIndeterminate = checkSuppsCount > 0 && checkSuppsCount < SUPPORT_TYPE_LIST.length
        }
        state.isDisabled = true
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}

// 增加
const handleAdd = (index, type, key) => {
    let obj
    switch (type) {
        case 'partners':
        case 'licenses':
            obj = {
                icon: '',
            }
            break
        case 'customConfig':
            obj = {
                url: '',
                image: ''
            }
            break
    }
    state.formData[type][key].splice(index + 1, 0, obj)
}

// 删除
const handleDel = (index, type, key) => {
    state.formData[type][key].splice(index, 1)
}

// 功能全选切换
const checkAllFunction = (val) => {
    state.formData.modules.functions = val
        ? FUNCTION_TYPE_LIST.map(item => item.value)
        : [];
    state.functionIndeterminate = false;
}

// 功能勾选
const handleCheckFunction = (val) => {
    const checkedCount = val.length;
    state.checkFunctionAll = checkedCount === FUNCTION_TYPE_LIST.length;
    state.functionIndeterminate =
        checkedCount > 0 && checkedCount < FUNCTION_TYPE_LIST.length;
}

// 游戏全选切换
const checkAllGame = (val) => {
    state.formData.modules.games = val
        ? GAME_TYPE_LIST.map(item => item.value)
        : [];
    state.gameIndeterminate = false;
}

// 游戏勾选
const handleCheckGame = (val) => {
    const checkedCount = val.length;
    state.checkGameAll = checkedCount === GAME_TYPE_LIST.length;
    state.gameIndeterminate =
        checkedCount > 0 && checkedCount < GAME_TYPE_LIST.length;
}

// 支持全选切换
const checkAllSuppor = (val) => {
    state.formData.modules.supports = val
        ? SUPPORT_TYPE_LIST.map(item => item.value)
        : [];
    state.supportIndeterminate = false;
}

// 支持勾选
const handleCheckSuppor = (val) => {
    const checkedCount = val.length;
    state.checkSupportAll = checkedCount === SUPPORT_TYPE_LIST.length;
    state.supportIndeterminate =
        checkedCount > 0 && checkedCount < SUPPORT_TYPE_LIST.length;
}

// 保存
const handleSave = () => {
    globalVBus.$emit('globalLoading', true)
    let params = deepClone(state.formData)
    let partnerImages = (params.partners.images.map(item => item.icon)).filter(item => !!item)
    let licenseImages = (params.licenses.images.map(item => item.icon)).filter(item => !!item)
    params.partners.images = partnerImages
    params.licenses.images = licenseImages
    postHomeDeploy({ footerConfig: JSON.stringify(params), part: 'webFooter' }).then((res) => {
        getData()
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss">
.footer-common-config {
    height: calc(100% - 55px);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow-y: auto;

    .items-head {
        margin-bottom: 10px !important;
    }

    .items-row {
        display: flex;

        .el-form-item {
            flex-shrink: 0;
        }
    }

    .row-input {
        width: 300px;
    }

    .module-box {
        margin-left: 100px;
        margin-bottom: 30px;
    }

    .footer-box {
        margin-left: 200px;
        display: flex;
        .footer-col {
            width: 200px;
            .el-checkbox-group {
                display: flex;
                flex-direction: column;
            }
        }
    }

    .corporation-box {
        margin-left: 180px;
        .el-form-item__label {
            width: 100px !important;
        }
    }
    .contact-box {
        .el-form-item__label {
            width: 180px !important;
        }
    }

    .but--active {
        margin-left: 30px;
    }

    .btn {
        width: 700px;
        display: flex;
        justify-content: center;
        // padding: 30px 0;
        padding: 20px 0;
        margin-left: 100px;
    }
}
</style>
