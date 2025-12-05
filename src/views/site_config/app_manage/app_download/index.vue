<template>
    <!-- 站点配置-APP管理配置-APP下载设置 -->
    <div class="app-download">
        <el-form>
            <el-form-item :label="$t('APP下载设置') +':'" style="margin-bottom: 5px;">
                <div class="operate" style="margin-bottom: 0;">
                    <el-button v-throttle v-if="!state.disabledSwitch" @click="getSwitchData(0)">{{$t('取消')}}</el-button>
                    <el-button v-throttle style="margin-left:30px" type="primary" v-if="!state.disabledSwitch" @click="handleSubmit">{{$t('保存')}}
                    </el-button>
                    <el-button v-throttle type="primary" v-if="state.disabledSwitch" @click="state.disabledSwitch = false">{{$t('修改')}}</el-button>
                </div>
            </el-form-item>
            <el-form-item :label-width="$locale === 'zh' ? '180px': '240px'" :label="$t('是否显示:')">
                <el-switch :disabled="state.disabledSwitch" v-model="state.formData.downloadBar" :active-value="1" :inactive-value="0"
                    :active-text="$t('显示')" :inactive-text="$t('隐藏')" />
            </el-form-item>
            <el-form-item :label-width="$locale === 'zh' ? '180px': '240px'" v-if="state.formData.downloadBar && state.domainList.length"
                :label="$t('适用域名:')">
                <div style="width: 100%">
                    <el-checkbox :disabled="state.disabledSwitch" v-model="state.isCheckedAll" :indeterminate="state.isIndeterminate"
                        @change="checkAll">
                        {{$t('全部域名')}}</el-checkbox>
                </div>
                <el-checkbox-group :disabled="state.disabledSwitch" v-model="state.formData.dlDomains" @change="handleCheck">
                    <el-checkbox v-for="item in state.domainList" :key="item" :label="item">{{ item }}</el-checkbox>
                </el-checkbox-group>
            </el-form-item>
            <el-form-item label="App logo:">
                <div class="operate">
                    <el-button v-throttle v-if="!state.disabledLogo" @click="getData">{{$t('取 消')}}</el-button>
                    <el-button v-throttle style="margin-left:30px" type="primary" v-if="!state.disabledLogo" @click="handleSave">{{$t('保存')}}
                    </el-button>
                    <el-button v-throttle type="primary" v-if="state.disabledLogo" @click="state.disabledLogo = false">{{$t('修 改')}}</el-button>
                </div>
                <UploadImage :disabled="state.disabledLogo" v-model="state.appLogo" accept=".png" :width="512" :height="512"
                    :tip="$t('请上传512*512或等比例，PNG格式小于500KB的图片')" />
            </el-form-item>
        </el-form>
        <div class="app-download-main">
            <el-card>
                <template #header>
                    <span class="form-label">{{$t('顶部APP下载')}}</span>
                    <el-button class="but" v-permiss="'merchant.download-bar-config.edit'" v-throttle type="primary" @click="handleConfig(1)">
                        {{$t('配置下载栏')}}</el-button>
                </template>
                <el-table :data="state.tableData1" border>
                    <el-table-column prop="type_" :label="$t('类型名称')" min-width="200" align="center" />
                    <el-table-column :label="$t('内容')" min-width="200" align="center">
                        <template #default="{ row }">
                            <div v-if="!!row.color && row.type !== 6" class="color-box" :style="{'background-color': row.color}"></div>
                            <div v-if="row.type === 6">{{row.desc}}</div>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="top-example">
                    <div>{{$t('示例：')}}</div>
                    <img src="../../../../assets/img/app_download/top_example.png" alt="">
                </div>
                <!-- <div class="top-preview">{{$t('预览：')}}
                    <div class="preview-main" :style="{'backgroundColor': getImageUrl(5)}"
                        v-if="state.tableData.length && state.tableData.some(item => item.icon)">
                        <img class="close-icon" :src="getImageUrl(1)" alt="">
                        <div class="game-box">
                            <img class="game-box-icon" :src="getImageUrl(2)" alt="">
                            <img class="game-box-title" :src="getImageUrl(3)" alt="">
                        </div>
                        <img class="download-icon" :src="getImageUrl(4)" alt="">
                    </div>
                </div> -->
            </el-card>
            <el-card>
                <template #header>
                    <span class="form-label">{{$t('底部APP下载')}}</span>
                    <el-button class="but" v-permiss="'merchant.download-bar-config.edit'" v-throttle type="primary" @click="handleConfig(2)">
                        {{$t('配置下载栏')}}</el-button>
                </template>
                <el-table :data="state.tableData2" border>
                    <el-table-column prop="type_" :label="$t('类型名称')" min-width="200" align="center" />
                    <el-table-column :label="$t('内容')" min-width="200" align="center">
                        <template #default="{ row }">
                            <div v-if="row.type === 8">{{row.desc}}</div>
                            <div v-if="!!row.color && row.type === 9" class="color-box" :style="{'background-color': row.color}"></div>
                            <div v-if="row.type === 10 && (typeof row.style === 'number')">{{row.style ? $t('暗色') : $t('浅色')}}</div>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="bottom-example">
                    <div>{{$t('示例：')}}</div>
                    <img src="../../../../assets/img/app_download/bottom_example.png" alt="">
                </div>
                <!-- <div class="bottom-preview">{{$t('预览：')}}
                    <div class="preview-main" :style="{'backgroundColor': getImageUrl(5)}"
                        v-if="state.tableData.length && state.tableData.some(item => item.icon)">
                        <div class="preview-main-head">
                           <img class="close-icon" :src="getImageUrl(1)" alt="">
                           <span>{{getImageUrl(1)}}</span>
                        </div>
                        <img class="close-icon" :src="getImageUrl(1)" alt="">
                        <div class="game-box">
                            <img src="../../../../assets/img/app_download/bottom_but.png" alt="">
                        </div>
                    </div>
                </div> -->
            </el-card>
        </div>

        <DeployDialog v-if="state.dialogShow" :initData="state.initData" :operateType="state.operateType" @getData="getData"
            @close="state.dialogShow = false">
        </DeployDialog>
    </div>
</template>

<script setup>
import { reactive, onMounted, defineAsyncComponent } from 'vue'
import { ElMessage } from 'element-plus'
import { getDownloadBarConfig, postDownloadBarConfig, getHomeDeploy, postHomeDeploy } from '@/api/website'
import { deepClone } from '@/common/util'
const DeployDialog = defineAsyncComponent(() => import('./components/DeployDialog.vue'))

const state = reactive({
    disabledLogo: true,
    appLogo: '',
    disabledSwitch: true,
    isCheckedAll: true,
    isIndeterminate: true,
    domainList: [],
    formData: {
        multiple: 0
    },
    rules: {
        multiple: { required: true, message: $t('请输入稽核倍数！'), trigger: 'blur' },
    },
    tableData1: [],
    tableData2: [],
    initData: [],
    dialogShow: false,
    operateType: 1
})

onMounted(() => {
    getData()
    getSwitchData()
})

const getData = () => {
    globalVBus.$emit('globalLoading', true)
    getDownloadBarConfig().then(res => {
        state.initData = deepClone(res.data)
        state.tableData1 = []
        state.tableData2 = []
        res.data.forEach(item => {
            if (item.type === 2) {
                state.appLogo = item.icon
            } else if ([5, 6, 7].includes(item.type)) {
                state.tableData1.push(item)
            } else if ([8, 9, 10].includes(item.type)) {
                state.tableData2.push(item)
            }
        })
        state.disabledLogo = true
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}

const handleConfig = (val) => {
    state.operateType = val
    state.dialogShow = true
}

// 获取开关状态
const getSwitchData = (type = 1) => {
    !type && globalVBus.$emit('globalLoading', true)
    getHomeDeploy({ part: 'dlDomains' }).then(res => {
        state.disabledSwitch = true
        let { downloadBar = 0, dlDomains = [], allDomains = [] } = res.data
        state.formData = {
            downloadBar,
            dlDomains
        }
        state.domainList = allDomains
        const checkLevelCount = dlDomains.length
        state.isCheckedAll = checkLevelCount === allDomains.length
        state.isIndeterminate = checkLevelCount > 0 && checkLevelCount < allDomains.length
        !type && globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        !type && globalVBus.$emit('globalLoading', false)
    })
}

// 选择所有域名
const checkAll = (val) => {
    state.formData.dlDomains = val
        ? [...state.domainList]
        : []
    state.isIndeterminate = false
}

// 域名勾选变化
const handleCheck = (val) => {
    const checkedCount = val.length
    state.isCheckedAll = checkedCount === state.domainList.length
    state.isIndeterminate =
        checkedCount > 0 && checkedCount < state.domainList.length
}

// 保存配置
const handleSubmit = (el) => {
    let { downloadBar, dlDomains } = state.formData
    if (downloadBar && state.domainList.length && (!dlDomains || !dlDomains.length)) return ElMessage.warning($t('请配置适用域名后再进行保存！'))
    let obj = {
        part: 'dlDomains',
        alias: 'downloadBar',
        status: downloadBar,
    }
    if (downloadBar && state.domainList.length) obj.dlDomains = dlDomains.join(',')
    globalVBus.$emit('globalLoading', true)
    postHomeDeploy(obj).then(() => {
        getSwitchData(0)
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}

const handleSave = () => {
    if (!state.appLogo) ElMessage.warning($t('请上传App logo后再进行提交！'))
    state.initData.forEach(item => {
        if (item.type === 2) {
            item.icon = state.appLogo
        }
    })
    globalVBus.$emit('globalLoading', true)
    postDownloadBarConfig({ configs: JSON.stringify(state.initData) }).then(res => {
        getData()
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}
</script>

<style lang="scss">
.app-download {
    &-main {
        display: flex;
        .el-card {
            width: 500px;
            .el-card__header {
                padding: 10px;
            }
            & + .el-card {
                margin-left: 20px;
            }
        }
        .color-box {
            width: 100%;
            height: 23px;
            border: 2px solid #999;
        }
        .top-example {
            width: 450px;
            margin-top: 20px;

            img {
                width: 100%;
                height: 72px;
            }
        }
        .top-preview {
            margin-top: 20px;

            .preview-main {
                width: 450px;
                height: 40px;
                display: flex;
                align-items: center;
                padding: 0 26px;

                .close-icon {
                    height: 40px;
                }

                .game-box {
                    flex: 1;
                    display: flex;
                    align-items: center;

                    &-icon {
                        margin: 0 6px;
                        height: 34px;
                    }
                    &-title {
                        height: 12px;
                    }
                }

                .download-icon {
                    height: 34px;
                }
            }
        }
        .bottom-example {
            width: 450px;
            margin-top: 20px;

            img {
                width: 100%;
                height: 204px;
            }
        }
        .bottom-preview {
            margin-top: 20px;

            .preview-main {
                width: 450px;
                height: 40px;
                display: flex;
                align-items: center;
                padding: 0 26px;

                .close-icon {
                    height: 40px;
                }

                .game-box {
                    flex: 1;
                    display: flex;
                    align-items: center;

                    &-icon {
                        margin: 0 6px;
                        height: 34px;
                    }
                    &-title {
                        height: 12px;
                    }
                }

                .download-icon {
                    height: 34px;
                }
            }
        }
    }
    .but {
        margin-left: 5px;
    }
    .operate {
        width: 100%;
        margin-left: 10px;
        margin-bottom: 15px;
    }
}
</style>