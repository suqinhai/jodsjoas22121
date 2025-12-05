<template>
    <!-- APP包管理-打包APP-新增/修改 -->
    <Dialog ref="dialog" width="800" :title="title" top="10vh" @confirm="handleSubmit(deployFormRef)" @cancel="cancel">
        <el-form ref="deployFormRef" :model="state.formData" :rules="state.rules" :label-width="$locale == 'zh' ? '150px' : 'auto'">
            <!-- <el-form-item :label="$t('APP系统:')" prop="client">
                <el-radio-group v-model="state.formData.client">
                    <el-radio label="Android">Android</el-radio>
                    <el-radio label="iOS">iOS</el-radio>
                </el-radio-group>
            </el-form-item> -->
            <el-form-item :label="$t('Android包名:')" prop="packageName" v-if="itemData.type === 1">
                <el-input v-model.trim="state.formData.packageName" style="width: 100%" :placeholder="$t('只能包含小写英文字母、数字、下划线，首位不能是数字')" maxlength="40">
                    <template #prepend>com.</template>
                    <template #append>.myapp</template>
                </el-input>
                <div>{{$t('正确样例：com.abc123.myapp')}}<span style="margin-left: 40px">{{$t('错误样例：com.987mnb.myapp')}}</span></div>
            </el-form-item>
            <!-- <el-form-item :label="$t('当前路径:')" v-if="!!itemData.id">{{itemData.pageUrl}}
                <el-button v-throttle style="margin-left: 10px" type="primary" text @click="state.isShow = !state.isShow">
                    {{state.isShow ? $t('取消') : $t('修改')}}
                </el-button>
            </el-form-item> -->
        
            <el-form-item :label="$t('H5路径:')">
                <el-select style="width: 100%" v-model="state.formData.h5Url" clearable :placeholder="$t('请选择H5路径')">
                    <el-option v-for="item in domainDnsList" :key="item.value" :label="item.label" :value="item.label" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('绑定渠道:')">
                <el-select style="width: 100%" v-model="state.formData.channelId" clearable :placeholder="$t('请选择绑定渠道')">
                    <el-option v-for="item in channelList" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
                <div>{{$t('注：H5路径和绑定渠道至少选一个，若都选择的话H5链接优先。')}}</div>
            </el-form-item>
            <el-form-item :label="$t('移除像素ID:')">
                <el-switch v-model="state.formData.ignoreTracker" :active-value="1" :inactive-value="0" />
            </el-form-item>
            
            <el-form-item label="AppsFlyer(Dev Key):" v-if="itemData.type === 1">
                <el-input style="width: 100%" v-model="state.formData.appEventId" :placeholder="$t('请输入AF事件上报Key')" />
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { postAppInfoData } from '@/api/app_and_domain_manage'

const emits = defineEmits(['close', 'fetchData'])
const props = defineProps({
    itemData: {
        type: Object,
        default: () => {
            return {}
        }
    },
    domainDnsList: {
        type: Array,
        default: () => []
    },
    channelList: {
        type: Array,
        default: () => []
    },
})
const state = reactive({
    isShow: false,
    formData: {
        client: 'Android',
        status: 0,
        ignoreTracker: 1
    },
    rules: {
        packageName: [
            { required: true, message: $t('请输入包名！'), trigger: 'change' },
            {
                pattern: /^[a-z_][a-z_0-9]{0,39}$/,
                message: $t('包名只能包含小写英文字母、数字、下划线，首位不能是数字，且长度小于40！'),
                trigger: 'change',
            }
        ],
    }
})
const deployFormRef = ref(null)
const dialog = ref(null)

const title = computed(() => {
    return (props.itemData.id ? $t('编辑') : (props.itemData.type === 1 ? $t('新增安卓投流APP') : props.itemData.type === 0?$t('新增安卓H5APP'):$t('新增苹果H5APP')))
})

onMounted(() => {
    let { type } = props.itemData
    // if (!!id) {
    //     state.formData = { id, client, name, pageUrl, icon, startImage, status, appEventId, ignoreTracker: 1, type }
    //     !!packageName && (state.formData.packageName = packageName.replace('com.', '').replace('.myapp', ''))
    // }
    state.formData.client = type === 2?'iOS':'Android'
    state.formData.type = type
})


const handleSubmit = (el) => {
    el.validate((valid, fields) => {
        if (valid) {
            let params = { ...state.formData }
            if ((!params.id || (params.id && state.isShow)) && (!params.h5Url && !params.channelId)) return ElMessage.warning($t('H5路径和绑定渠道至少选一个！'))
            params.type = props.itemData.type === 1?1:0
            params.packageName = 'com.' + params.packageName + '.myapp'
            dialog.value.showLoading()
            postAppInfoData(params).then(() => {
                cancel()
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
