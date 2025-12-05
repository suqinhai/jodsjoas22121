<template>
    <!-- APP管理配置-APP配置 -->
    <div class="container-main app-config">
        <div class="head" v-permiss="'merchant.app-info.edit'">
            <div class="tab">
                <div v-for="item in tabData" :key="item.id" class="tab-box pointer" :class="{'active':state.switchIndex == item.id}"
                    @click="handleTab(item.id)">{{ item.title }}</div>
            </div>
            <div>
                <el-button v-throttle type="primary" @click="handleRefresh">{{$t('刷 新')}}</el-button>
                <el-button v-if="state.switchIndex == 1" v-throttle type="primary" @click="handleConfig({type: 0})">{{$t('新增安卓H5APP')}}</el-button>
                <el-button v-if="state.switchIndex == 2" v-throttle type="primary" @click="handleConfig({type: 1})">{{$t('新增安卓投流APP')}}</el-button>
                <el-button v-if="state.switchIndex == 3" v-throttle type="primary" @click="handleConfig({type: 2})">{{$t('新增苹果H5APP')}}</el-button>
            </div>
        </div>
        <div v-if="state.switchIndex === 0" style="flex:1;padding-bottom:20px;">
            <el-form ref="deployFormRef" :model="state.formData" :rules="state.rules" :label-width="$locale == 'zh' ? '150px' : 'auto'"
                style="width: 800px;margin:0 auto;">
                <el-form-item :label="$t('APP名称:')" prop="name">
                    <el-input @input="(val) => state.formData.name = val.replace(/[\u4e00-\u9fa5]/g, '')" v-model="state.formData.name"
                        style="width: 100%" :placeholder="$t('请输入APP名称，不可输入中文')" :disabled="!state.isEdit" />
                </el-form-item>
                <el-form-item :label="$t('Android包名:')" prop="packageName">
                    <el-input v-model.trim="state.formData.packageName" style="width: 100%" :placeholder="$t('只能包含小写英文字母、数字、下划线，首位不能是数字')"
                        maxlength="40" :disabled="!state.isEdit">
                        <template #prepend>com.</template>
                        <template #append>.myapp</template>
                    </el-input>
                    <div style="line-height: 22px;">{{$t('正确样例：com.abc123.myapp')}}<span
                            style="margin-left: 40px">{{$t('错误样例：com.987mnb.myapp')}}</span></div>
                </el-form-item>
                <el-form-item :label="$t('iOS包名:')" prop="iosPackageName">
                    <el-input v-model.trim="state.formData.iosPackageName" style="width: 100%" :placeholder="$t('只能包含小写英文字母、数字、下划线，首位不能是数字')"
                        maxlength="40" :disabled="!state.isEdit">
                        <template #prepend>com.</template>
                        <template #append>.myapp</template>
                    </el-input>
                    <div style="line-height: 22px;">{{$t('正确样例：com.abc123.myapp')}}<span
                            style="margin-left: 40px">{{$t('错误样例：com.987mnb.myapp')}}</span></div>
                </el-form-item>
                <el-form-item :label="$t('APP图标:')" prop="icon">
                    <UploadImage v-model="state.formData.icon" isLimitSizeMax accept=".png" :size="200" :width="512" :height="512"
                        :tip="$t('请上传尺寸小于512*512且等比例，PNG格式小于200KB的图片')" :disabled="!state.isEdit">
                    </UploadImage>
                </el-form-item>
                <el-form-item :label="$t('APP启用页背景:')" prop="startImage">
                    <UploadImage v-model="state.formData.startImage" :width="1080" :height="1920" :tip="$t('请上传1080*1920或等比例，PNG/JPG格式小于1024KB的图片')"
                        :disabled="!state.isEdit">
                    </UploadImage>
                </el-form-item>
            </el-form>
            <div class="btns" style="width: 800px;margin:0 auto;display: flex;justify-content: center;">
                <el-button @click="state.isEdit = true" type="primary" v-if="!state.isEdit">{{$t('修改')}}</el-button>
                <template v-else>
                    <el-button @click="handleCancel">{{$t('取消')}}</el-button>
                    <el-button v-throttle @click="handleSubmit(deployFormRef)" type="primary">{{$t('保存')}}</el-button>
                </template>
            </div>
        </div>
        <el-table class="table-box" :data="state.tableData" border v-else>
            <el-table-column :label="$t('图标')" min-width="120" align="center">
                <template #default="{ row }">
                    <el-image v-if="!!row.icon" class="imgs" :src="row.icon" :crossorigin="null" :preview-src-list="[row.icon]" preview-teleported
                        fit="contain" />
                </template>
            </el-table-column>
            <el-table-column prop="channelId" :label="$t('渠道ID')" min-width="100" align="center" />
            <el-table-column prop="channelName" :label="$t('渠道名称')" min-width="130" align="center" />
            <el-table-column prop="client" :label="$t('APP系统')" min-width="130" align="center" />
            <el-table-column prop="name" :label="$t('APP名称')" min-width="140" align="center" />
            <el-table-column prop="packageName" :label="$t('APP包名')" min-width="160" align="center" />
            <el-table-column prop="packageSize_" :label="$t('包大小')" min-width="120" align="center" />
            <el-table-column :label="$t('下载地址')" min-width="300" align="center">
                <template #default="{ row }">
                    <div class="row-items">
                        <span>{{row.downloadUrl}}</span>
                        <el-icon v-if="row.downloadUrl" class="pointer" style="margin-left: 10px;" color="#409eff" :size="18"
                            @click="copyText(row.downloadUrl)">
                            <DocumentCopy />
                        </el-icon>
                    </div>
                </template>
            </el-table-column>
            <!-- <el-table-column prop="packageName" :label="$t('包大小')" min-width="120" align="center" /> -->
            <el-table-column prop="version" :label="$t('版本号')" min-width="135" align="center" />
            <el-table-column prop="status_" :label="$t('状态')" min-width="120" align="center" />
            <el-table-column prop="updateTime" :label="$t('操作时间')" min-width="160" align="center" />
            <el-table-column prop="emp.name" :label="$t('操作人')" min-width="140" align="center" />
            <el-table-column fixed="right" align="center" :label="$t('操作')" width="140">
                <template #default="{ row }">
                    <el-button v-permiss="'merchant.app-info.edit'" v-if="row.canPacking || row.canPush" v-throttle type="primary" text
                        @click="handlePack(row)">{{row.canPacking ? $t('打包') : $t('发布')}}
                    </el-button>
                    <el-button v-permiss="'merchant.app-info.edit'" v-if="row.canEdit" v-throttle type="primary" text @click="handleConfig(row)">
                        {{$t('修改')}}</el-button>
                    <el-button v-permiss="'merchant.app-info.edit'" v-if="row.canDelete" v-throttle type="danger" text @click="handleDelete(row.id)">
                        {{$t('删除')}}
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <Pagination v-show="state.total > 0" :total="state.total" v-model:limit="state.listQuery._size" v-model:page="state.listQuery._page"
            @pagination="fetchData"></Pagination>

        <DeployDialog v-if="state.deployDialogShow" @close="state.deployDialogShow = false" :itemData="state.itemData"
            :domainDnsList="state.domainDnsList" :channelList="state.channelList" @fetchData="fetchData">
        </DeployDialog>
    </div>
</template>

<script setup>
import { reactive, onMounted, defineAsyncComponent, ref } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { getAppInfoList, deleteAppInfoData, postAppPack, getAppInfoConfig, saveAppInfoConfig } from '@/api/app_and_domain_manage'
import userStore from '@/store/user'
import { getDomainDnsConfig, getChannelData } from '@/api/common.js'
import { dateFormat, copyText } from '@/common/util'
const DeployDialog = defineAsyncComponent(() => import('./components/DeployDialog.vue'))

const tabData = [
    { id: 0, title: $t('APP配置') },
    { id: 1, title: $t('安卓H5App打包') },
    { id: 2, title: $t('安卓投流App打包') },
    { id: 3, title: $t('苹果H5App打包') },
]
const props = defineProps({
    metaData: {
        type: Object,
        default: () => {
            return {}
        }
    },
})
const state = reactive({
    isEdit: false,
    switchIndex: 0,
    formData: {},
    tableData: [],
    total: 0,
    listQuery: {
        _page: 1,
        _size: 10,
    },
    itemData: {},
    deployDialogShow: false,
    domainDnsList: [],
    channelList: [],
    rules: {
        // client: [{ required: true, message: $t('请选择APP客户端类型！'), trigger: 'change' }],
        name: [{ required: true, message: $t('请输入APP名称！'), trigger: 'change' }],
        packageName: [
            { required: true, message: $t('请输入包名！'), trigger: 'change' },
            {
                pattern: /^[a-z_][a-z_0-9]{0,39}$/,
                message: $t('包名只能包含小写英文字母、数字、下划线，首位不能是数字，且长度小于40！'),
                trigger: 'change',
            }
        ],
        iosPackageName: [
            { required: true, message: $t('请输入包名！'), trigger: 'change' },
            {
                pattern: /^[a-z_][a-z_0-9]{0,39}$/,
                message: $t('包名只能包含小写英文字母、数字、下划线，首位不能是数字，且长度小于40！'),
                trigger: 'change',
            }
        ],
        // pageUrl: [{ required: true, message: $t('请输入H5路径！'), trigger: 'change' }],
        icon: [{ required: true, message: $t('请上传APP图标！'), trigger: 'change' }],
        startImage: [{ required: true, message: $t('请上传APP启用页背景！'), trigger: 'change' }],
    }
})
const userData = userStore()
const deployFormRef = ref(null)

onMounted(() => {
    fetchData()
    getAppConfig()
})

const handleRefresh = () => {
    if (state.switchIndex === 0) {
        state.isEdit = false
        deployFormRef.value.clearValidate()
        getAppConfig()
    } else {
        fetchData()
    }
}

// 获取APP配置内容
const getAppConfig = () => {
    globalVBus.$emit('globalLoading', true)
    getAppInfoConfig().then((res) => {
        let { id, client, name, packageName, iosPackageName, icon, startImage } = res.data
        state.formData = { id, client, name, icon, startImage }
        !!packageName && (state.formData.packageName = packageName.replace('com.', '').replace('.myapp', ''))
        !!iosPackageName && (state.formData.iosPackageName = iosPackageName.replace('com.', '').replace('.myapp', ''))
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        globalVBus.$emit('globalLoading', false)
    })
}

// 表格过滤数据处理
const fetchData = (val = '') => {
    if (val) {
        state.listQuery._page = 1
    }
    let params = { ...state.listQuery, type: [1, 3].includes(state.switchIndex) ? 0 : 1, client: [1, 2].includes(state.switchIndex) ? 'Android' : 'iOS' }
    globalVBus.$emit('globalLoading', true)
    getAppInfoList(params).then(res => {
        let { total, list } = res.data
        state.tableData = list.map(item => {
            item.updateTime && (item.updateTime = dateFormat(item.updateTime))
            return item
        })
        state.total = total
        globalVBus.$emit('globalLoading', false)
    }).catch(err => {
        state.tableData = []
        globalVBus.$emit('globalLoading', false)
    })
}

const handleTab = (id) => {
    if (state.switchIndex === id) return
    state.switchIndex = id
    if (state.switchIndex == 0) {
        getAppConfig()
    } else {
        fetchData()
    }
}

const handleConfig = async (val) => {
    try {
        globalVBus.$emit('globalLoading', true)
        let { data } = await getChannelData()
        state.channelList = data || []
        let res = await getDomainDnsConfig({ forBack: 0, position: 0 })
        state.domainDnsList = res.data || []
        state.itemData = { ...val }
        state.deployDialogShow = true
        globalVBus.$emit('globalLoading', false)
    } catch (error) {
        globalVBus.$emit('globalLoading', false)
    }
}

// 打包/发布
const handlePack = ({ id, canPacking }) => {
    globalVBus.$emit('globalLoading', true)
    postAppPack({ id, status: canPacking ? 0 : 1 }).then(res => {
        fetchData()
    }).catch(err => {
        globalVBus.$emit('globalLoading', false)
    })
}

// 删除
const handleDelete = (id) => {
    ElMessageBox.confirm($t('确定要删除此APP版本配置吗？'), $t('提示'), {
        confirmButtonText: $t('确 定'),
        cancelButtonText: $t('取消'),
        type: 'warning',
    }).then(() => {
        globalVBus.$emit('globalLoading', true)
        deleteAppInfoData({ id }).then(res => {
            fetchData()
        }).catch(err => {
            globalVBus.$emit('globalLoading', false)
        })
    }).catch(() => { })
}

const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            let params = { ...state.formData }
            params.packageName = 'com.' + params.packageName + '.myapp'
            // params.iosPackageName = params.packageName
            params.iosPackageName = 'com.' + params.iosPackageName + '.myapp'
            globalVBus.$emit('globalLoading', true)
            saveAppInfoConfig(params).then(() => {
                getAppConfig()
                state.isEdit = false
                globalVBus.$emit('globalLoading', false)
            }).catch(() => {
                globalVBus.$emit('globalLoading', false)
            })
        } else {
            ElMessage.warning($t('请完善表单内容再进行提交！'))
        }
    })
}

const handleCancel = () => {
    getAppConfig()
    state.isEdit = false
    deployFormRef.value.clearValidate()
}
</script>

<style lang="scss">
.app-config {
    .head {
        display: flex;
        justify-content: space-between;

        .tab {
            width: fit-content;
            height: 36px;
            border: 1px solid #409eff;
            border-radius: 2px;
            display: flex;
            margin-bottom: 10px;

            &-box {
                flex-shrink: 0;
                padding: 0 15px;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 12px;
                color: #409eff;
            }

            .tab-box + .tab-box {
                border-left: 1px solid #409eff;
            }

            .active {
                color: #fff;
                background-color: #409eff;
            }
        }
    }
    .row-items {
        display: flex;
        align-items: center;
        justify-content: center;
        &-left {
            min-width: 150px;
            margin-right: 10px;
        }
        &-right {
            margin-left: 10px;
        }
    }
}
</style>