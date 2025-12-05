<template>
    <!-- 客服配置-其他客服-新增/编辑 -->
    <div>
        <Dialog ref="dialog" width="600" :title="state.title" top="10vh" @confirm="handleSubmit(deployForm)" @cancel="cancel">
            <el-form class="other-service-deploy" ref="deployForm" :rules="state.rules" :model="state.formData"
                :label-width="$locale == 'zh' ? '100px' : 'auto'">
                <el-form-item label="IM:" prop="im">
                    <div class="im-list">
                        <div class="im-list-box pointer  pr" :class="{'im-list-box--active': state.selectType === +item.value}" v-for="item in imType"
                            :key="item.value" @click="state.selectType = +item.value">
                            <img :src="`/img/im/${item.label.toLowerCase()}.png`" alt="">
                        </div>
                    </div>
                </el-form-item>
                <el-form-item :label="$t('图标类型:')" prop="iconType">
                    <el-radio-group v-model="state.formData.iconType" @change="selectIconType">
                        <el-radio :label="1">{{$t('系统图标')}}</el-radio>
                        <el-radio :label="2">{{$t('自定义')}}</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item :label="$t('自定义图标')" prop="icon" v-if="state.formData.iconType == 2">
                    <UploadImage 
                    v-model="state.formData.icon" 
                    :width="50" 
                    :height="50"
                    accept=".png,.jpg,.jpeg"
                    :tip="$t('请上传50*50或等比例JPG，png格式图标')" />
                </el-form-item>
                <el-form-item :label="$t('昵称:')" prop="nickname">
                    <el-input v-model="state.formData.nickname" :placeholder="$t('请输入昵称')" />
                </el-form-item>
                <el-form-item :label="$t('账号:')" prop="account">
                    <el-input v-model="state.formData.account" :placeholder="$t('请输入账号')" />
                </el-form-item>
                <el-form-item :label="$t('链接:')" prop="link">
                    <el-input v-model="state.formData.link" :placeholder="$t('请输入链接')" />
                </el-form-item>
                <el-form-item :label="$t('排序:')" prop="sort">
                    <el-input-number style="width: 100%" v-model="state.formData.sort" :controls="false" :precision="0" :placeholder="$t('请输入排序值')" />
                </el-form-item>
                <el-form-item :label="$t('代理链接:')">
                    <div class="items-box">
                        <div class="items-box-content">
                            <div>{{$t('渠道链接')}}：{{state.agentSelect?.channelData.length || 0}}</div>
                            <div>{{$t('代理链接')}}：{{state.agentSelect?.userData.length || 0}}</div>
                        </div>
                        <el-button v-throttle type="primary" @click="state.showDialog = true">{{$t('选 择')}}</el-button>
                    </div>
                </el-form-item>
            </el-form>
        </Dialog>
        <ServiceLinkDialog v-if="state.showDialog" :agentSelect="state.agentSelect" @close="state.showDialog = false" @handleConfig="handleConfig">
        </ServiceLinkDialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, defineAsyncComponent, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { postOtherServiceData } from '@/api/service'
const ServiceLinkDialog = defineAsyncComponent(() => import('./ServiceLinkDialog.vue'))

const emits = defineEmits(['close', 'fetchData'])
const props = defineProps({
    imType: {
        type: Array,
        default: () => []
    },
    itemData: {
        type: Object,
        default: () => {
            return {}
        }
    }
})
const dialog = ref(null)
const deployForm = ref(null)
const state = reactive({
    formData: {
        status: 0
    },
    title: $t('新增'),
    selectType: '',
    rules: {
        nickname: [{ required: true, message: $t('请输入昵称！'), trigger: 'blur' }],
        account: [{ required: true, message: $t('请输入账号！'), trigger: 'blur' }],
        link: [{ required: true, message: $t('请输入链接！'), trigger: 'blur' }],
        sort: [{ required: true, message: $t('请输入排序值！'), trigger: 'blur' }],
        icon: [{ required: true, message: $t('必选项不能为空！'), trigger: 'change' }]
    },
    showDialog: false,
    agentSelect: {
        channelData: [],
        userData: [],
    }
})

const selectIcon = computed(() => { 
    const item = props.imType[state.selectType - 1]
    if (!item) return ''
    return `/img/im/${item.label?.toLowerCase()}.png`
})

onMounted(() => {
    if (props.itemData.id) {
        state.title = $t('修改')
        state.formData = { ...props.itemData }
        state.selectType = state.formData.type
        if (state.formData?.icon?.includes('http')) {
            state.formData.iconType = 2
        } else {
            state.formData.iconType = 1
        }
        let { agentList = [] } = state.formData
        state.agentSelect.channelData = props.itemData.dataList.filter(item => item.selected).map(item => item.channelId)
        state.agentSelect.userData = agentList
    }
})

const selectIconType = () => {
    state.formData.icon = ''
}

const handleConfig = (val) => {
    state.agentSelect = { ...val }
}

const handleSubmit = (el) => {
    if (typeof state.selectType !== 'number') return ElMessage.warning($t('请选择im类型再进行操作！'))
    el.validate((valid, fields) => {
        if (valid) {
            let { channelData = [], userData = [] } = state.agentSelect
            let params = { ...state.formData }
            if (!!params.link.indexOf('http')) params.link = 'https://' + params.link
            params.type = state.selectType
            if (channelData.length) params.channelIds = channelData.join(',')
            if (userData.length) params.agentUserIds = userData.join(',')
            if (params.id && params.icon?.includes('http')) {
                params.icon = selectIcon.value
            }
            delete params.type_
            delete params.dataList
            delete params.channelList
            delete params.agentList
            delete params.iconType
            dialog.value.showLoading()
            postOtherServiceData(params).then(() => {
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
.other-service-deploy {
    .im-list {
        display: flex;
        flex-wrap: wrap;

        &-box {
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            overflow: hidden;
            margin-right: 10px;
            margin-bottom: 10px;
            border: #999 2px solid;
            opacity: 0.3;

            &--active {
                opacity: 1 !important;
                border-color: #409eff;
            }

            img {
                max-width: 50px;
                max-width: 50px;
            }
        }
    }
    .items-box {
        display: flex;
        align-items: center;
        &-content {
            margin-right: 50px;
        }
    }
}
</style>
