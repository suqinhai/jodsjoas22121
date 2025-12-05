<template>
    <!-- APP管理配置-下载落地页配置 -->
    <div class="download-bar">
        <el-form :model="state.formData" :label-width="$locale == 'zh' ? '85px' : 'auto'" v-if="isSwitchPremiss">
            <el-form-item :label="$t('是否显示:')">
                <el-switch :disabled="state.isDisabled" v-model="state.formData.downloadBar" :active-value="1" :inactive-value="0"
                    :active-text="$t('显示')" :inactive-text="$t('隐藏')" />
                <div class="btn">
                    <el-button v-throttle v-if="!state.isDisabled" @click="getData(0)">{{$t('取消')}}</el-button>
                    <el-button v-throttle style="margin-left:30px" type="primary" v-if="!state.isDisabled" @click="handleSave">{{$t('保存')}}
                    </el-button>
                    <el-button v-throttle type="primary" v-if="state.isDisabled" @click="state.isDisabled = false">{{$t('修改')}}</el-button>
                </div>
            </el-form-item>
            <el-form-item v-if="!userData.isCustomTemplate && isAutoPopupPremiss && state.formData.downloadBar">
                <el-checkbox 
                v-model="state.dlAutoPopUp" 
                :true-label="1" 
                :false-label="0"
                @change="saveAutoPopUp">
                {{ $t('自动弹窗（勾选后每次刷新首页将自动弹窗）') }}</el-checkbox>
            </el-form-item>
            <el-form-item v-if="state.formData.downloadBar && state.domainList.length" :label="$t('适用域名:')">
                <div style="width: 100%">
                    <el-checkbox :disabled="state.isDisabled" v-model="state.isCheckedAll" :indeterminate="state.isIndeterminate" @change="checkAll">
                        {{$t('全部域名')}}</el-checkbox>
                </div>
                <el-checkbox-group :disabled="state.isDisabled" v-model="state.formData.dlDomains" @change="handleCheck">
                    <el-checkbox v-for="item in state.domainList" :key="item" :label="item">{{ item }}</el-checkbox>
                </el-checkbox-group>
            </el-form-item>
        </el-form>

        <el-table :data="state.tableData" style="width: 400px" border>
            <el-table-column prop="type_" :label="$t('类型名称')" min-width="200" align="center" />
            <el-table-column :label="$t('图片')" min-width="200" align="center">
                <template #default="{ row }">
                    <el-image v-if="!!row.icon && row.type !== 5" class="imgs" :src="row.icon" :crossorigin="null" :preview-src-list="[row.icon]"
                        preview-teleported fit="contain" />
                    <div v-if="!!row.color && row.type === 5" class="color-box" :style="{'background-color': row.color}"></div>
                </template>
            </el-table-column>
            <!-- <el-table-column prop="url" :label="$t('跳转')" min-width="150" align="center" /> -->
            <!-- <el-table-column prop="remark" :label="$t('说明')" min-width="150" align="center" /> -->
            <!-- <el-table-column fixed="right" align="center" :label="$t('操作')" width="100">
                <template #default="{ row }">
                    <el-button v-throttle type="primary" text @click="handleConfig(row)">{{$t('修改')}}</el-button>
                </template>
            </el-table-column> -->
        </el-table>
        <div style="margin-top: 10px;" v-permiss="'merchant.download-bar-config.edit'">
            <el-button v-throttle type="primary" @click="state.dialogShow = true">{{$t('配置下载栏')}}</el-button>
        </div>
        <div class="example">
            <div>{{$t('示例：')}}</div>
            <img src="../../../../assets/img/download_bar/example.png" alt="">
        </div>
        <div class="download-bar-preview">{{$t('预览：')}}<div class="preview-main" :style="{'backgroundColor': getImageUrl(5)}"
                v-if="state.tableData.length && state.tableData.some(item => item.icon)">
                <img class="close-icon" :src="getImageUrl(1)" alt="">
                <div class="game-box">
                    <img class="game-box-icon" :src="getImageUrl(2)" alt="">
                    <img class="game-box-title" :src="getImageUrl(3)" alt="">
                </div>
                <img class="download-icon" :src="getImageUrl(4)" alt="">
            </div>
        </div>

        <DeployDialog v-if="state.dialogShow" :tableData="state.tableData" @fetchData="fetchData" @close="state.dialogShow = false">
        </DeployDialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, defineAsyncComponent, computed } from 'vue'
import userStore from '@/store/user'
import { ElMessage } from 'element-plus'
import { getDownloadBarConfig, getHomeDeploy, postHomeDeploy } from '@/api/website'
const DeployDialog = defineAsyncComponent(() => import('./components/DeployDialog.vue'))

const state = reactive({
    tableData: [],
    dialogShow: false,
    formData: {
        downloadBar: 0,
    },
    dlAutoPopUp: 0,
    isDisabled: true,
    isCheckedAll: true,
    isIndeterminate: true,
    domainList: []
})
const userData = userStore()
const deployForm = ref(null)

const isSwitchPremiss = computed(() => userData.isHasPermiss('merchant.app.layout-dlDomains'))
const isAutoPopupPremiss = computed(() => userData.isHasPermiss('merchant.app.layout-dlAutoPopUp'))


onMounted(() => {
    fetchData()
    isSwitchPremiss.value && getData()
    isAutoPopupPremiss.value && getAutoPopUp()
})

// 表格过滤数据处理
const fetchData = () => {
    globalVBus.$emit('globalLoading', true)
    getDownloadBarConfig().then(res => {
        state.tableData = res.data
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
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

const getAutoPopUp = () => {
    globalVBus.$emit('globalLoading', true)
    getHomeDeploy({ part: 'dlAutoPopUp' }).then(res => {
        state.dlAutoPopUp = res.data
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}

// 获取开关状态
const getData = (type = 1) => {
    !type && globalVBus.$emit('globalLoading', true)
    getHomeDeploy({ part: 'dlDomains' }).then(res => {
        state.isDisabled = true
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

// 保存配置
const handleSave = (el) => {
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
        getData(0)
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}

const saveAutoPopUp = () => {
    const { dlAutoPopUp } = state
    globalVBus.$emit('globalLoading', true)
    postHomeDeploy({
        part: 'dlAutoPopUp',
        alias: 'dlAutoPopUp',
        status: dlAutoPopUp
    }).then(() => {
        globalVBus.$emit('globalLoading', false)
    }).catch(() => {
        globalVBus.$emit('globalLoading', false)
    })
}

// 获取配置图片
const getImageUrl = (type = '') => {
    if (type !== 5) {
        return state.tableData.find(item => item.type === type)?.icon || ''
    } else {
        return state.tableData.find(item => item.type === type)?.color || '#074a2c'
    }
}
</script>

<style lang="scss">
.download-bar {
    .btn {
        margin-left: 80px;
        .el-button + .el-button {
            margin-left: 10px !important;
        }
    }

    .color-box {
        width: 100%;
        height: 23px;
    }

    .download-bar-preview {
        margin-top: 20px;

        .preview-main {
            width: 750px;
            height: 66px;
            display: flex;
            align-items: center;
            padding: 0 22px;

            .close-icon {
                height: 42px;
            }

            .game-box {
                flex: 1;
                display: flex;
                align-items: center;

                &-icon {
                    margin: 0 10px;
                    height: 60px;
                }
                &-title {
                    height: 51px;
                }
            }

            .download-icon {
                height: 52px;
            }
        }
    }

    .example {
        width: 750px;
        margin-top: 20px;

        img {
            width: 100%;
            height: 66px;
        }
    }
}
</style>
